import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.INVENTORY_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const item = (await query(
      `SELECT *,
        CASE 
          WHEN current_stock <= 0 THEN 'out_of_stock'
          WHEN current_stock < minimum_stock * 0.5 THEN 'critical'
          WHEN current_stock <= minimum_stock THEN 'low_stock'
          ELSE 'in_stock'
        END as status
      FROM inventory
      WHERE id = ?`,
      [id],
    )) as any[]

    if (item.length === 0) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
    }

    return NextResponse.json(item[0])
  } catch (error) {
    console.error("Error fetching inventory item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.INVENTORY_EDIT)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to edit inventory items" },
        { status: 403 },
      )
    }

    const { id } = params
    const data = await request.json()

    await query(
      `UPDATE inventory SET 
       item_name = ?, category = ?, current_stock = ?, minimum_stock = ?, 
       unit_price = ?, supplier = ?, expiry_date = ?
       WHERE id = ?`,
      [
        data.itemName,
        data.category,
        data.currentStock,
        data.minimumStock,
        data.unitPrice,
        data.supplier,
        data.expiryDate || null,
        id,
      ],
    )

    return NextResponse.json({ message: "Inventory item updated successfully" })
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.INVENTORY_DELETE)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to delete inventory items" },
        { status: 403 },
      )
    }

    const { id } = params
    await query("DELETE FROM inventory WHERE id = ?", [id])
    return NextResponse.json({ message: "Inventory item deleted successfully" })
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
