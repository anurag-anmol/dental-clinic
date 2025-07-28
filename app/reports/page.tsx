"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { DollarSign, Users, Calendar, Activity, Smile } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface ReportStats {
  totalPatients: number
  totalAppointments: number
  totalRevenue: number
  totalTreatments: number
  monthlyRevenueData: { month: string; revenue: number }[]
  treatmentTypeData: { type: string; count: number }[]
}

export default function ReportsPage() {
  const { toast } = useToast()
  const [reportStats, setReportStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportStats()
  }, [])

  const fetchReportStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/dashboard/stats") // Reusing dashboard stats for simplicity
      if (response.ok) {
        const data = await response.json()
        // Mocking some additional data for reports if not available from dashboard stats
        setReportStats({
          totalPatients: data.totalPatients,
          totalAppointments: data.totalAppointments,
          totalRevenue: data.monthlyRevenue, // Using monthly revenue as total for demo
          totalTreatments: data.completedTreatments, // Using completed treatments as total for demo
          monthlyRevenueData: [
            { month: "Jan", revenue: 15000 },
            { month: "Feb", revenue: 18000 },
            { month: "Mar", revenue: 22000 },
            { month: "Apr", revenue: 19000 },
            { month: "May", revenue: 25000 },
            { month: "Jun", revenue: 23000 },
          ],
          treatmentTypeData: [
            { type: "Cleaning", count: 120 },
            { type: "Filling", count: 80 },
            { type: "Root Canal", count: 30 },
            { type: "Extraction", count: 15 },
            { type: "Crown", count: 25 },
          ],
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch report data.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching report stats:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching report data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Smile className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-500 mt-2">Loading reports...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Clinic Reports & Analytics</h2>
          <p className="text-gray-600">Gain insights into your clinic's performance.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats?.totalPatients?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">All time patient records</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats?.totalAppointments?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">All time appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${reportStats?.totalRevenue?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Total earnings to date</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Treatments</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats?.totalTreatments?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Procedures completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>Revenue generated over the last few months.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full flex items-end justify-around gap-2 p-4">
                {reportStats?.monthlyRevenueData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center h-full justify-end">
                    <div
                      className="w-8 bg-blue-500 rounded-t-md"
                      style={{
                        height: `${(data.revenue / Math.max(...reportStats.monthlyRevenueData.map((d) => d.revenue))) * 90 + 10}%`,
                      }}
                      title={`$${data.revenue.toLocaleString()}`}
                    />
                    <span className="text-xs text-gray-600 mt-1">{data.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Treatments by Type</CardTitle>
              <CardDescription>Distribution of different treatment types.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full flex flex-col justify-center p-4 space-y-2">
                {reportStats?.treatmentTypeData.map((data, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm w-24 shrink-0">{data.type}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-green-500 h-full rounded-full"
                        style={{
                          width: `${(data.count / Math.max(...reportStats.treatmentTypeData.map((d) => d.count))) * 100}%`,
                        }}
                        title={`${data.count} treatments`}
                      />
                    </div>
                    <span className="text-sm font-medium">{data.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for more reports */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Detailed Reports</CardTitle>
            <CardDescription>More in-depth reports and custom analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Additional detailed reports (e.g., patient demographics, staff performance, inventory usage) coming
              soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
