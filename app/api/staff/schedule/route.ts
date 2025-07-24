import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.STAFF_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    const sql = `
      SELECT ss.*, 
        CONCAT(u.first_name, ' ', u.last_name) as staff_name,
        u.role
      FROM staff_schedules ss
      JOIN users u ON ss.user_id = u.id
      WHERE ss.work_date = ?
      ORDER BY ss.start_time
    `
    const params: any[] = [date]

    const schedule = await query(sql, params)
    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Error fetching staff schedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.STAFF_EDIT)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await request.json()

    await query(
      `UPDATE staff_schedules 
       SET work_date = ?, start_time = ?, end_time = ?, break_start = ?, break_end = ?, status = ?, notes = ? 
       WHERE id = ?`,
      [
        data.workDate,
        data.startTime,
        data.endTime,
        data.breakStart || null,
        data.breakEnd || null,
        data.status || "scheduled",
        data.notes || null,
        data.id,
      ],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating schedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.STAFF_EDIT)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to manage staff schedules" },
        { status: 403 },
      )
    }

    const data = await request.json()

    const result = (await query(
      `INSERT INTO staff_schedules (user_id, work_date, start_time, end_time, break_start, break_end, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.userId,
        data.workDate,
        data.startTime,
        data.endTime,
        data.breakStart || null,
        data.breakEnd || null,
        data.status || "scheduled",
        data.notes || null,
      ],
    )) as any

    return NextResponse.json({ id: result.insertId })
  } catch (error) {
    console.error("Error creating staff schedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
