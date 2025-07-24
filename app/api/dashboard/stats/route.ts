import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total patients
    const totalPatientsResult = (await query("SELECT COUNT(*) as count FROM patients")) as any[]
    const totalPatients = totalPatientsResult[0].count

    // Get today's appointments
    const todayAppointmentsResult = (await query(
      "SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURDATE()",
    )) as any[]
    const todayAppointments = todayAppointmentsResult[0].count

    // Get monthly revenue
    const monthlyRevenueResult = (await query(
      "SELECT SUM(paid_amount) as revenue FROM invoices WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())",
    )) as any[]
    const monthlyRevenue = monthlyRevenueResult[0].revenue || 0

    // Get pending payments
    const pendingPaymentsResult = (await query(
      'SELECT SUM(balance_amount) as pending FROM invoices WHERE status IN ("pending", "partial", "overdue")',
    )) as any[]
    const pendingPayments = pendingPaymentsResult[0].pending || 0

    // Get active staff
    const activeStaffResult = (await query("SELECT COUNT(*) as count FROM users WHERE is_active = TRUE")) as any[]
    const activeStaff = activeStaffResult[0].count

    // Get completed treatments this month
    const completedTreatmentsResult = (await query(
      "SELECT COUNT(*) as count FROM treatments WHERE MONTH(treatment_date) = MONTH(CURDATE()) AND YEAR(treatment_date) = YEAR(CURDATE())",
    )) as any[]
    const completedTreatments = completedTreatmentsResult[0].count

    // Get recent appointments
    const recentAppointments = await query(`
      SELECT a.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        TIME_FORMAT(a.appointment_time, '%h:%i %p') as formatted_time
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.appointment_date = CURDATE()
      ORDER BY a.appointment_time
      LIMIT 5
    `)

    return NextResponse.json({
      totalPatients,
      todayAppointments,
      monthlyRevenue,
      pendingPayments,
      activeStaff,
      completedTreatments,
      recentAppointments,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
