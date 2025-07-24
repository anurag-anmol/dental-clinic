"use client"



import type React from "react"
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Plus, Edit, Calendar, Clock, UserCheck, Search, Phone, Mail, Loader2 } from "lucide-react"
import { Layout } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface StaffMember {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  phone: string
  is_active: boolean
  created_at: string
}

interface StaffSchedule {
  notes: string;
  work_date: string | number | readonly string[] | undefined;
  id: number
  staff_name: string
  role: string
  start_time: string
  end_time: string
  status: string
  appointments: number // This would need to be calculated or fetched separately
}

export default function StaffPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState<StaffSchedule | null>(null)

  const fetchSchedule = async (date: any) => {
    setLoadingSchedule(true)
    try {
      const res = await fetch(`/api/schedule?date=${date}`)
      const data = await res.json()
      if (res.ok) {
        setTodaySchedule(data)
      }
    } catch (err) {
      console.error("Error loading schedule:", err)
    } finally {
      setLoadingSchedule(false)
    }
  }

  const handleSaveEdit = async () => {
    try {
      await fetch("/api/schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      })
      setEditDialogOpen(false)
      fetchSchedule(selectedScheduleDate)
    } catch (err) {
      console.error("Error saving edit:", err)
    }
  }

  const router = useRouter();

  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(new Date().toISOString().split("T")[0])

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [todaySchedule, setTodaySchedule] = useState<StaffSchedule[]>([])
  const [loadingStaff, setLoadingStaff] = useState(true)
  const [loadingSchedule, setLoadingSchedule] = useState(true)
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "", // Note: department is not in users table, will be ignored by API
    joinDate: "", // Note: joinDate is not in users table, will be ignored by API
    schedule: "", // Note: schedule is not in users table, will be ignored by API
  })



  const fetchStaffMembers = useCallback(async () => {
    setLoadingStaff(true)
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        role: selectedRole,
        status: selectedStatus,
      }).toString()
      const response = await fetch(`/api/staff?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setStaffMembers(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch staff members.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching staff:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching staff.",
        variant: "destructive",
      })
    } finally {
      setLoadingStaff(false)
    }
  }, [searchTerm, selectedRole, selectedStatus, toast])

  const fetchTodaySchedule = useCallback(async () => {
    setLoadingSchedule(true)
    try {
      const queryParams = new URLSearchParams({
        date: selectedScheduleDate,
      }).toString()
      const response = await fetch(`/api/staff/schedule?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        // For demo purposes, add a mock appointments count
        const scheduleWithAppointments = await Promise.all(
          data.map(async (item: any) => {
            const apptResponse = await fetch(`/api/appointments?dentist=${item.user_id}&date=${selectedScheduleDate}`)
            const apptData = apptResponse.ok ? await apptResponse.json() : []
            return { ...item, appointments: apptData.length }
          }),
        )
        setTodaySchedule(scheduleWithAppointments)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch today's schedule.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching schedule:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching schedule.",
        variant: "destructive",
      })
    } finally {
      setLoadingSchedule(false)
    }
  }, [selectedScheduleDate, toast])

  useEffect(() => {
    fetchStaffMembers()
  }, [fetchStaffMembers])

  useEffect(() => {
    fetchTodaySchedule()
  }, [fetchTodaySchedule])

  useEffect(() => {
    fetchSchedule(selectedScheduleDate)
  }, [selectedScheduleDate])
  useEffect(() => {
    fetchStaffMembers()
  }, [searchTerm, selectedRole, selectedStatus])


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Staff member added successfully!",
        })
        setIsAddStaffOpen(false)
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          role: "",
          department: "",
          joinDate: "",
          schedule: "",
        })
        fetchStaffMembers()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to add staff member.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding staff member:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding the staff member.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "dentist":
        return "bg-blue-100 text-blue-800"
      case "hygienist":
        return "bg-green-100 text-green-800"
      case "receptionist":
        return "bg-purple-100 text-purple-800"
      case "accountant":
        return "bg-orange-100 text-orange-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getScheduleStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800"
      case "absent":
        return "bg-red-100 text-red-800"
      case "on_leave":
        return "bg-yellow-100 text-yellow-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate stats from fetched data
  const totalStaff = staffMembers.length
  const activeStaff = staffMembers.filter((staff) => staff.is_active).length
  const presentToday = todaySchedule.filter((schedule) => schedule.status === "present").length
  const totalAppointmentsToday = todaySchedule.reduce((sum, schedule) => sum + schedule.appointments, 0)

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
            <p className="text-gray-600">Manage staff members, schedules, and attendance</p>
          </div>
          <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>Add a new team member to your clinic</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dentist">Dentist</SelectItem>
                        <SelectItem value="hygienist">Hygienist</SelectItem>
                        <SelectItem value="receptionist">Receptionist</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Department, Join Date, Schedule are not directly stored in `users` table,
                      but kept in form for potential future extension or custom logic */}
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      placeholder="Enter department"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Join Date</Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => handleInputChange("joinDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Schedule</Label>
                    <Input
                      id="schedule"
                      value={formData.schedule}
                      onChange={(e) => handleInputChange("schedule", e.target.value)}
                      placeholder="e.g., Mon-Fri 9:00-17:00"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddStaffOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Staff Member
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Staff Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Staff</p>
                  <p className="text-2xl font-bold">{totalStaff}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Staff</p>
                  <p className="text-2xl font-bold">{activeStaff}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Present Today</p>
                  <p className="text-2xl font-bold">{presentToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold">{totalAppointmentsToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Staff and Schedule */}
        <Tabs defaultValue="staff" className="space-y-6">
          <TabsList>
            <TabsTrigger value="staff">Staff Directory</TabsTrigger>
            <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="staff">
            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search staff by name, role, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="dentist">Dentist</SelectItem>
                        <SelectItem value="hygienist">Hygienist</SelectItem>
                        <SelectItem value="receptionist">Receptionist</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staff Table */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Directory</CardTitle>
                <CardDescription>{staffMembers.length} staff members found</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStaff ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-500 mt-2">Loading staff...</p>
                  </div>
                ) : staffMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No staff members found for the selected criteria.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffMembers.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell className="font-medium">
                            {staff.first_name} {staff.last_name}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Phone className="h-3 w-3 mr-1" />
                                {staff.phone || "N/A"}
                              </div>
                              <div className="flex items-center text-sm">
                                <Mail className="h-3 w-3 mr-1" />
                                {staff.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(staff.role)}>{staff.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={staff.is_active ? "default" : "secondary"}>
                              {staff.is_active ? "active" : "inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditingStaff(staff)}>
                                <Edit className="h-4 w-4" />
                              </Button>

                              <Button variant="ghost" size="sm" onClick={() => router.push(`/staff/${staff.id}`)}>
                                <Calendar className="h-4 w-4" />
                              </Button>

                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            <Dialog open={!!editingStaff} onOpenChange={() => setEditingStaff(null)}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Staff Member</DialogTitle>
                  <DialogDescription>Update staff member details</DialogDescription>
                </DialogHeader>
                {editingStaff && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setIsUpdating(true)
                      try {
                        const response = await fetch(`/api/staff/${editingStaff.id}`, {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(editingStaff),
                        })
                        if (response.ok) {
                          toast({ title: "Updated", description: "Staff updated successfully." })
                          setEditingStaff(null)
                          fetchStaffMembers()
                        } else {
                          const errorData = await response.json()
                          toast({
                            title: "Error",
                            description: errorData.error || "Failed to update staff.",
                            variant: "destructive",
                          })
                        }
                      } catch (err) {
                        console.error(err)
                        toast({
                          title: "Error",
                          description: "Unexpected error occurred.",
                          variant: "destructive",
                        })
                      } finally {
                        setIsUpdating(false)
                      }
                    }}
                  >
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="editFirstName">First Name</Label>
                        <Input
                          id="editFirstName"
                          value={editingStaff.first_name}
                          onChange={(e) =>
                            setEditingStaff((prev) => prev && { ...prev, first_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editLastName">Last Name</Label>
                        <Input
                          id="editLastName"
                          value={editingStaff.last_name}
                          onChange={(e) =>
                            setEditingStaff((prev) => prev && { ...prev, last_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editEmail">Email</Label>
                        <Input
                          id="editEmail"
                          type="email"
                          value={editingStaff.email}
                          onChange={(e) =>
                            setEditingStaff((prev) => prev && { ...prev, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editPhone">Phone</Label>
                        <Input
                          id="editPhone"
                          value={editingStaff.phone}
                          onChange={(e) =>
                            setEditingStaff((prev) => prev && { ...prev, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="editRole">Role</Label>
                        <Select
                          value={editingStaff.role}
                          onValueChange={(value) =>
                            setEditingStaff((prev) => prev && { ...prev, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dentist">Dentist</SelectItem>
                            <SelectItem value="hygienist">Hygienist</SelectItem>
                            <SelectItem value="receptionist">Receptionist</SelectItem>
                            <SelectItem value="accountant">Accountant</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setEditingStaff(null)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>

          </TabsContent>

          <TabsContent value="schedule">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex justify-end">
                  <Input
                    type="date"
                    className="w-40"
                    value={selectedScheduleDate}
                    onChange={(e) => setSelectedScheduleDate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>
                  Staff schedule and attendance for{" "}
                  {new Date(selectedScheduleDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSchedule ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-500 mt-2">Loading schedule...</p>
                  </div>
                ) : todaySchedule.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No schedule found for this date.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Shift Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Appointments</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todaySchedule.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">
                            {schedule.staff_name}
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(schedule.role.toLowerCase())}>
                              {schedule.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {schedule.start_time} - {schedule.end_time}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getScheduleStatusColor(schedule.status)}>
                              {schedule.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{schedule.appointments || 0}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditData(schedule)
                                setEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Schedule</DialogTitle>
                </DialogHeader>
                {editData && (
                  <div className="space-y-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={editData.work_date}
                        onChange={(e) =>
                          setEditData({ ...editData, work_date: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={editData.start_time}
                          onChange={(e) =>
                            setEditData({ ...editData, start_time: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={editData.end_time}
                          onChange={(e) =>
                            setEditData({ ...editData, end_time: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={editData.status}
                        onValueChange={(value) =>
                          setEditData({ ...editData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="leave">Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={editData.notes || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, notes: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleSaveEdit}>Save</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Management</CardTitle>
                <CardDescription>Track staff attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* map dummy data or real API */}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </Layout>
  )
}
