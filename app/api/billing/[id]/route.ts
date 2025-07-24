import { type NextRequest, NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.BILLING_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const invoice = (await query(
      `SELECT i.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.patient_id
      FROM invoices i
      JOIN patients p ON i.patient_id = p.id
      WHERE i.id = ?`,
      [id],
    )) as any[]

    if (invoice.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const items = await query("SELECT * FROM invoice_items WHERE invoice_id = ?", [id])

    return NextResponse.json({ ...invoice[0], items })
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.BILLING_EDIT)) {
      return NextResponse.json({ error: "Unauthorized - You don't have permission to edit invoices" }, { status: 403 })
    }

    const { id } = params
    const data = await request.json()

    await transaction(async (connection) => {
      // Update invoice details
      await connection.execute(
        `UPDATE invoices SET 
         patient_id = ?, total_amount = ?, paid_amount = ?, balance_amount = ?, 
         status = ?, due_date = ?, payment_method = ?, notes = ?
         WHERE id = ?`,
        [
          data.patientId,
          data.totalAmount,
          data.paidAmount,
          data.balanceAmount,
          data.status,
          data.dueDate,
          data.paymentMethod || null,
          data.notes || null,
          id,
        ],
      )

      // Delete existing items and insert new ones
      await connection.execute("DELETE FROM invoice_items WHERE invoice_id = ?", [id])
      for (const item of data.items) {
        await connection.execute(
          `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price) 
           VALUES (?, ?, ?, ?, ?)`,
          [id, item.description, item.quantity, item.unitPrice, item.totalPrice],
        )
      }
    })

    return NextResponse.json({ message: "Invoice updated successfully" })
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.BILLING_DELETE)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to delete invoices" },
        { status: 403 },
      )
    }

    const { id } = params

    await transaction(async (connection) => {
      // Delete associated payments first
      await connection.execute("DELETE FROM payments WHERE invoice_id = ?", [id])
      // Delete associated invoice items
      await connection.execute("DELETE FROM invoice_items WHERE invoice_id = ?", [id])
      // Delete the invoice
      await connection.execute("DELETE FROM invoices WHERE id = ?", [id])
    })

    return NextResponse.json({ message: "Invoice deleted successfully" })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
