import { type NextRequest, NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"
import { getCurrentUser, hasPermission } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, ["admin", "accountant", "receptionist"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"

    let sql = `
      SELECT i.*,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.patient_id
      FROM invoices i
      JOIN patients p ON i.patient_id = p.id
      WHERE 1=1
    `

    const params: any[] = []

    if (search) {
      sql += ` AND (i.invoice_number LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (status !== "all") {
      sql += ` AND i.status = ?`
      params.push(status)
    }

    sql += ` ORDER BY i.created_at DESC`

    const invoices = await query(sql, params)
    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, ["admin", "accountant", "receptionist"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const result = await transaction(async (connection) => {
      // Generate invoice number
      const lastInvoice = await connection.execute("SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1")
      let nextNumber = 1
      if ((lastInvoice[0] as any[]).length > 0) {
        const lastNumber = Number.parseInt((lastInvoice[0] as any[])[0].invoice_number.split("-")[2])
        nextNumber = lastNumber + 1
      }
      const invoiceNumber = `INV-${new Date().getFullYear()}-${nextNumber.toString().padStart(3, "0")}`

      // Create invoice
      const invoiceResult = await connection.execute(
        `INSERT INTO invoices (invoice_number, patient_id, total_amount, balance_amount, due_date, notes)
          VALUES (?, ?, ?, ?, ?, ?)`,
        [invoiceNumber, data.patientId, data.totalAmount, data.totalAmount, data.dueDate, data.notes],
      )

      const invoiceId = (invoiceResult[0] as any).insertId

      // Create invoice items
      for (const item of data.items) {
        await connection.execute(
          `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?)`,
          [invoiceId, item.description, item.quantity, item.unitPrice, item.totalPrice],
        )
      }

      return { id: invoiceId, invoice_number: invoiceNumber }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
