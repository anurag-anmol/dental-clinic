import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.BILLING_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const invoiceId = searchParams.get("invoiceId") || "all"

    let sql = `
      SELECT p.*, 
        i.invoice_number,
        CONCAT(pat.first_name, ' ', pat.last_name) as patient_name
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN patients pat ON i.patient_id = pat.id
      WHERE 1=1
    `
    const params: any[] = []

    if (search) {
      sql += ` AND (i.invoice_number LIKE ? OR pat.first_name LIKE ? OR pat.last_name LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (invoiceId !== "all") {
      sql += ` AND p.invoice_id = ?`
      params.push(invoiceId)
    }

    sql += ` ORDER BY p.payment_date DESC, p.created_at DESC`

    const payments = await query(sql, params)
    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.BILLING_CREATE)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to record payments" },
        { status: 403 },
      )
    }

    const data = await request.json()

    const result = (await query(
      `INSERT INTO payments (invoice_id, amount, payment_method, payment_date, transaction_id, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.invoiceId,
        data.amount,
        data.paymentMethod,
        data.paymentDate,
        data.transactionId || null,
        data.notes || null,
      ],
    )) as any

    // Update invoice paid_amount and balance_amount
    await query(
      `UPDATE invoices SET paid_amount = paid_amount + ?, balance_amount = total_amount - paid_amount, 
       status = CASE 
         WHEN total_amount - (paid_amount + ?) <= 0 THEN 'paid'
         WHEN (paid_amount + ?) > 0 AND total_amount - (paid_amount + ?) > 0 THEN 'partial'
         ELSE 'pending'
       END
       WHERE id = ?`,
      [data.amount, data.amount, data.amount, data.amount, data.invoiceId],
    )

    return NextResponse.json({ id: result.insertId })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
