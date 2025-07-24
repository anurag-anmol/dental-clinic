"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Smile, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface HeaderUser {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
}

export function Header() {
  const [user, setUser] = useState<HeaderUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // If user is not authenticated, redirect to login
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
      window.location.href = "/login"
    }
  }

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Dr.</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Ram Ratre - Dental Clinic</h1>
            </div>
            <div><Smile /></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Dr.</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Ram Ratre - Dental Clinic</h1>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/patients" className="text-gray-600 hover:text-gray-900">
              Patients
            </Link>
            <Link href="/appointments" className="text-gray-600 hover:text-gray-900">
              Appointments
            </Link>
            <Link href="/treatments" className="text-gray-600 hover:text-gray-900">
              Treatments
            </Link>
            <Link href="/billing" className="text-gray-600 hover:text-gray-900">
              Billing
            </Link>
            <Link href="/inventory" className="text-gray-600 hover:text-gray-900">
              Inventory
            </Link>
            <Link href="/staff" className="text-gray-600 hover:text-gray-900">
              Staff
            </Link>
            <Link href="/reports" className="text-gray-600 hover:text-gray-900">
              Reports
            </Link>
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                {user ? `${user.first_name} ${user.last_name}` : "User"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user && (
                  <div>
                    <div className="font-medium">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                  </div>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
