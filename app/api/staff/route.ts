import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser, hasPermission, hashPassword } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, ["admin"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || "all"
    const status = searchParams.get("status") || "all"

    let sql = `
      SELECT id, email, first_name, last_name, role, phone, is_active, created_at
      FROM users
      WHERE 1=1
    `
    const params: any[] = []

    if (search) {
      sql += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR role LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (role !== "all") {
      sql += ` AND role = ?`
      params.push(role)
    }

    if (status !== "all") {
      const isActive = status === "active"
      sql += ` AND is_active = ?`
      params.push(isActive)
    }

    sql += ` ORDER BY created_at DESC`

    const staff = await query(sql, params)
    return NextResponse.json(staff)
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, ["admin"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Hash default password
    const defaultPassword = "password123"
    const passwordHash = await hashPassword(defaultPassword)

    const result = (await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, phone) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.email, passwordHash, data.firstName, data.lastName, data.role, data.phone],
    )) as any

    return NextResponse.json({ id: result.insertId })
  } catch (error) {
    console.error("Error creating staff member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
