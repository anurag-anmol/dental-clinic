"use client"

import type React from "react"

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
import { LogOut, User, Menu, Smile } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"
import Image from "next/image"

interface LayoutUser {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
}

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<LayoutUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

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

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard", permission: [] },
    { href: "/patients", label: "Patients", permission: PERMISSIONS.PATIENTS_VIEW },
    { href: "/appointments", label: "Appointments", permission: PERMISSIONS.APPOINTMENTS_VIEW },
    { href: "/treatments", label: "Treatments", permission: PERMISSIONS.TREATMENTS_VIEW },
    { href: "/billing", label: "Billing", permission: PERMISSIONS.BILLING_VIEW },
    { href: "/inventory", label: "Inventory", permission: PERMISSIONS.INVENTORY_VIEW },
    { href: "/staff", label: "Staff", permission: PERMISSIONS.STAFF_VIEW },
    { href: "/reports", label: "Reports", permission: PERMISSIONS.REPORTS_VIEW },
  ]

  const getNavItemClass = (href: string) => {
    return pathname === href ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div><Image src={"favicon.ico"} alt="image" width={50} height={50} /></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Dr.</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Ram Ratre-Dental Clinic</h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => {
                if (item.permission.length > 0 && user && !hasPermission(user.role, item.permission)) {
                  return null
                }
                return (
                  <Link key={item.href} href={item.href} className={getNavItemClass(item.href)}>
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>

              {/* User dropdown */}
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

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t pt-4 pb-4">
              <nav className="flex flex-col space-y-2">
                {navigationItems.map((item) => {
                  if (item.permission.length > 0 && user && !hasPermission(user.role, item.permission)) {
                    return null
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${getNavItemClass(item.href)} block px-2 py-1`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">Dr.</span>
              </div>
              <span className="text-gray-600">© 2024 Ram Ratre-Dental Clinic. All rights reserved.</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link href="#" className="hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-gray-900">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-gray-900">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
