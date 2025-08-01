import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""

    let sql = `
      SELECT * FROM tests 
      WHERE is_active = TRUE
    `
    const params: any[] = []

    if (search) {
      sql += ` AND name LIKE ?`
      params.push(`%${search}%`)
    }

    if (category) {
      sql += ` AND category = ?`
      params.push(category)
    }

    sql += ` ORDER BY category, name ASC`

    const tests = await query(sql, params)
    return NextResponse.json(tests)
  } catch (error) {
    console.error("Error fetching tests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
