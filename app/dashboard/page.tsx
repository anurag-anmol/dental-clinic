"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, DollarSign, Activity, Clock, TrendingUp, Loader2, Smile, MapPin, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { Layout } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"
import { AppointmentRequestForm } from "@/components/appointment-request-form"
import Image from "next/image"


interface Service {
  id: number
  title: string
  description: string
  image: string
}

interface LandingContent {
  hero: {
    title: string
    subtitle: string
    cta_text: string
    background_image: string
  }
  services: {
    title: string
    services_data: Service[]
  }
  about: {
    title: string
    description_1: string
    description_2: string
    image: string
  }
  contact: {
    title: string
    subtitle: string
    phone: string
    email: string
    address: string
    hours: string
  }
}


interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  monthlyRevenue: number
  pendingPayments: number
  activeStaff: number
  completedTreatments: number
  recentAppointments: {
    id: number
    patient_name: string
    treatment_type: string
    formatted_time: string
    status: string
  }[]
}

export default function Dashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  // const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch dashboard stats.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching dashboard stats.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  const [content, setContent] = useState<LandingContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch("/api/landing-content")
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      } else {
        console.error("Failed to fetch content")
      }
    } catch (error) {
      console.error("Error fetching content:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Image src={'favicon.ico'} alt="loading" className="h-8 w-8 animate-spin" width={20} height={20} />
      </div>
    )
  }

  // Fallback content if API fails
  const defaultContent: LandingContent = {
    hero: {
      title: "Your Brightest Smile Starts Here",
      subtitle:
        "Providing compassionate and comprehensive dental care for your entire family. Experience the difference of a healthy, confident smile.",
      cta_text: "Book Your Appointment",
      background_image: "/https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?height=1080&width=1920",
    },
    services: {
      title: "Our Services",
      services_data: [
        {
          id: 1,
          title: "General Dentistry",
          description: "Routine check-ups, cleanings, fillings, and preventive care to maintain your oral health.",
          image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1168&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
          id: 2,
          title: "Cosmetic Dentistry",
          description: "Teeth whitening, veneers, and bonding to enhance the aesthetics of your smile.",
          image: "https://plus.unsplash.com/premium_photo-1661434856831-76779e04e8bc?q=80&w=1138&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
          id: 3,
          title: "Orthodontics",
          description: "Braces and clear aligners to correct misaligned teeth and bites for a perfect smile.",
          image: "https://plus.unsplash.com/premium_photo-1661434856831-76779e04e8bc?q=80&w=1138&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
      ],
    },
    about: {
      title: "About Our Clinic",
      description_1:
        "At Dental Clinic Pro, we are dedicated to providing exceptional dental care in a comfortable and friendly environment. Our team of experienced dentists and hygienists uses the latest technology to ensure you receive the best possible treatment.",
      description_2:
        "We believe in patient education and personalized care, empowering you to make informed decisions about your oral health. Your comfort and well-being are our top priorities.",
      image: "/placeholder.svg?height=400&width=600",
    },
    contact: {
      title: "Contact Us",
      subtitle: "Have questions or need to schedule an appointment? Reach out to us!",
      phone: "+1 (123) 456-7890",
      email: "info@dentalclinicpro.com",
      address: "123 Dental Ave, Suite 100, City, State 12345",
      hours: "Mon-Fri: 9:00 AM - 5:00 PM",
    },
  }

  const displayContent = content || defaultContent

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            {/* <Smile className="h-8 w-8 animate-spin text-blue-600 mx-auto" /> */}
            {/* <p className="text-gray-500 mt-2"><Image src={"favicon.ico"} alt="loading image" width={50} height={50} /></p> */}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Here's what's happening at your clinic today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPatients?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Active patient records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.todayAppointments || 0}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.monthlyRevenue?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">This month's earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.pendingPayments?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Outstanding invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeStaff || 0}</div>
              <p className="text-xs text-muted-foreground">Team members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Treatments This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedTreatments || 0}</div>
              <p className="text-xs text-muted-foreground">Completed procedures</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>Upcoming appointments for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentAppointments?.length ? (
                  stats.recentAppointments.map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{appointment.patient_name}</p>
                        <p className="text-sm text-gray-600">{appointment.treatment_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{appointment.formatted_time}</p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded-full ${appointment.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {appointment.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No appointments scheduled for today</p>
                )}
              </div>
              <div className="mt-4">
                <Button asChild className="w-full">
                  <Link href="/appointments">View All Appointments</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                  <Link href="/patients">
                    <Users className="h-6 w-6 mb-2" />
                    Add Patient
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                  <Link href="/appointments">
                    <Calendar className="h-6 w-6 mb-2" />
                    Book Appointment
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                  <Link href="/billing">
                    <DollarSign className="h-6 w-6 mb-2" />
                    Create Invoice
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                  <Link href="/inventory">
                    <Activity className="h-6 w-6 mb-2" />
                    Check Inventory
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>

  )
}
