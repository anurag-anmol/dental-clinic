import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser, hashPassword } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.STAFF_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const staffMember = (await query(
      `SELECT id, email, first_name, last_name, role, phone, is_active, created_at
       FROM users
       WHERE id = ?`,
      [id],
    )) as any[]

    if (staffMember.length === 0) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
    }

    return NextResponse.json(staffMember[0])
  } catch (error) {
    console.error("Error fetching staff member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.STAFF_EDIT)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to edit staff members" },
        { status: 403 },
      )
    }

    const { id } = params
    const data = await request.json()

    let sql = `UPDATE users SET email = ?, first_name = ?, last_name = ?, role = ?, phone = ?, is_active = ?`
    const paramsArr = [
      data.email,
      data.first_name,
      data.last_name,
      data.role,
      data.phone,
      data.is_active,
    ]


    if (data.password && data.password.length > 0) {
      const newPasswordHash = await hashPassword(data.password)
      sql += `, password_hash = ?`
      paramsArr.push(newPasswordHash)
    }

    sql += ` WHERE id = ?`
    paramsArr.push(id)

    await query(sql, paramsArr)

    return NextResponse.json({ message: "Staff member updated successfully" })
  } catch (error) {
    console.error("Error updating staff member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.STAFF_DELETE)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to delete staff members" },
        { status: 403 },
      )
    }

    const { id } = params
    // Consider preventing deletion if staff member has associated records (appointments, treatments, etc.)
    await query("DELETE FROM users WHERE id = ?", [id])
    return NextResponse.json({ message: "Staff member deleted successfully" })
  } catch (error) {
    console.error("Error deleting staff member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
