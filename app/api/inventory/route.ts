import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser, hasPermission } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || "all"
    const status = searchParams.get("status") || "all"

    let sql = `
      SELECT *,
        CASE 
          WHEN current_stock <= 0 THEN 'out_of_stock'
          WHEN current_stock < minimum_stock * 0.5 THEN 'critical'
          WHEN current_stock <= minimum_stock THEN 'low_stock'
          ELSE 'in_stock'
        END as status
      FROM inventory
      WHERE 1=1
    `
    const params: any[] = []

    if (search) {
      sql += ` AND (item_name LIKE ? OR category LIKE ? OR supplier LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (category !== "all") {
      sql += ` AND category = ?`
      params.push(category)
    }

    sql += ` ORDER BY item_name`

    const items = await query(sql, params)
    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, ["admin", "receptionist"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const result = (await query(
      `INSERT INTO inventory (item_name, category, current_stock, minimum_stock, unit_price, supplier, expiry_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.itemName,
        data.category,
        data.currentStock,
        data.minimumStock,
        data.unitPrice,
        data.supplier,
        data.expiryDate || null,
      ],
    )) as any

    return NextResponse.json({ id: result.insertId })
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
