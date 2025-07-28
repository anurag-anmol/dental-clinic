"use client"

import { useRouter } from "next/navigation"
import type React from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Edit, Clock, User, Search, Filter, Loader2, Smile } from "lucide-react"
import { Layout } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"
import { AppointmentForm } from "./AppointmentForm"
import { useSelectedLayoutSegment } from "next/navigation"

interface Appointment {
  id: number
  patient_name: string
  patient_id: string
  dentist_name: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  treatment_type: string
  status: string
  notes: string
  patient_id_fk: number // Foreign key to patient
  dentist_id: number // Foreign key to user (dentist)
}

interface Patient {
  id: number
  first_name: string
  last_name: string
  patient_id: string
}

interface Dentist {
  id: number
  first_name: string
  last_name: string
}

export default function AppointmentsPage() {

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState({
    patientId: "",
    dentistId: "",
    appointmentDate: "",
    appointmentTime: "",
    duration: "60",
    treatmentType: "",
    status: "scheduled",
    notes: "",
  })
  const openEditDialog = async (id: number) => {
    try {
      const res = await fetch(`/api/appointments/${id}`)
      if (res.ok) {
        const data = await res.json()
        setEditingAppointmentId(id)
        setEditFormData({
          patientId: data.patient_id.toString(),
          dentistId: data.dentist_id.toString(),
          appointmentDate: data.appointment_date,
          appointmentTime: data.appointment_time,
          duration: data.duration_minutes.toString(),
          treatmentType: data.treatment_type || "",
          status: data.status || "scheduled",
          notes: data.notes || "",
        })
        fetchPatients()
        fetchDentists()
        setIsEditDialogOpen(true)
      } else {
        toast({ title: "Error", description: "Failed to fetch appointment details", variant: "destructive" })
      }
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    }
  }
  const handleEditChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }))
  }
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAppointmentId) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/appointments/${editingAppointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          patientId: Number(editFormData.patientId),
          dentistId: Number(editFormData.dentistId),
          duration: Number(editFormData.duration),
        }),
      })
      if (res.ok) {
        toast({ title: "Updated", description: "Appointment updated successfully." })
        setIsEditDialogOpen(false)
        fetchAppointments()
      } else {
        const errorData = await res.json()
        toast({ title: "Error", description: errorData.error || "Update failed", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDentist, setSelectedDentist] = useState("all")

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [dentists, setDentists] = useState<Dentist[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)


  const [formData, setFormData] = useState({
    patientId: "",
    dentistId: "",
    appointmentDate: new Date().toISOString().split("T")[0],
    appointmentTime: "",
    duration: "60",
    treatmentType: "",
    notes: "",
  })

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        date: selectedDate,
        status: selectedStatus,
        dentist: selectedDentist,
      }).toString()
      const response = await fetch(`/api/appointments?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch appointments.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching appointments.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedDate, selectedStatus, selectedDentist, toast])

  const fetchPatients = useCallback(async () => {
    try {
      const response = await fetch("/api/patients")
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch patients for form.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
    }
  }, [toast])

  const fetchDentists = useCallback(async () => {
    try {
      const response = await fetch("/api/staff?role=dentist")
      if (response.ok) {
        const data = await response.json()
        setDentists(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch dentists for form.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching dentists:", error)
    }
  }, [toast])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  useEffect(() => {
    if (isAddAppointmentOpen) {
      fetchPatients()
      fetchDentists()
    }
  }, [isAddAppointmentOpen, fetchPatients, fetchDentists])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          patientId: Number(formData.patientId),
          dentistId: Number(formData.dentistId),
          duration: Number(formData.duration),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment booked successfully!",
        })
        setIsAddAppointmentOpen(false)
        setFormData({
          patientId: "",
          dentistId: "",
          appointmentDate: new Date().toISOString().split("T")[0],
          appointmentTime: "",
          duration: "60",
          treatmentType: "",
          notes: "",
        })
        fetchAppointments()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to book appointment.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error booking appointment:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while booking the appointment.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no_show":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate quick stats
  const todayAppointmentsCount = appointments.filter(
    (app) => app.appointment_date === new Date().toISOString().split("T")[0],
  ).length
  const confirmedAppointmentsCount = appointments.filter((app) => app.status === "confirmed").length
  const inProgressAppointmentsCount = appointments.filter((app) => app.status === "in-progress").length
  const pendingAppointmentsCount = appointments.filter((app) => app.status === "scheduled").length

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Appointment Management</h2>
            <p className="text-gray-600">Schedule and manage patient appointments</p>
          </div>
          <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
                <DialogDescription>Schedule a new appointment for a patient</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient *</Label>
                    <Select value={formData.patientId} onValueChange={(value) => handleInputChange("patientId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.first_name} {patient.last_name} ({patient.patient_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dentist">Dentist *</Label>
                    <Select value={formData.dentistId} onValueChange={(value) => handleInputChange("dentistId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dentist" />
                      </SelectTrigger>
                      <SelectContent>
                        {dentists.map((dentist) => (
                          <SelectItem key={dentist.id} value={dentist.id.toString()}>
                            Dr. {dentist.first_name} {dentist.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate">Date *</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => handleInputChange("appointmentDate", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime">Time *</Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      value={formData.appointmentTime}
                      onChange={(e) => handleInputChange("appointmentTime", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="treatment">Treatment Type</Label>
                    <Input
                      id="treatmentType"
                      value={formData.treatmentType}
                      onChange={(e) => handleInputChange("treatmentType", e.target.value)}
                      placeholder="e.g., Routine Cleaning, Filling"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Additional notes or instructions"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddAppointmentOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Book Appointment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold">{todayAppointmentsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold">{confirmedAppointmentsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold">{inProgressAppointmentsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Filter className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold">{pendingAppointmentsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search appointments by patient, treatment, or dentist..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40"
                />
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedDentist} onValueChange={setSelectedDentist}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Dentist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dentists</SelectItem>
                    {dentists.map((dentist) => (
                      <SelectItem key={dentist.id} value={dentist.id.toString()}>
                        Dr. {dentist.first_name} {dentist.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Schedule</CardTitle>
            <CardDescription>{appointments.length} appointments found</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Smile className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-gray-500 mt-2">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No appointments found for the selected criteria.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Dentist</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.patient_name}</div>
                          <div className="text-sm text-gray-500">{appointment.patient_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {new Date(appointment.appointment_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">{appointment.appointment_time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.treatment_type}</div>
                          <div className="text-sm text-gray-500 truncate max-w-32">{appointment.notes}</div>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.dentist_name}</TableCell>
                      <TableCell>{appointment.duration_minutes} min</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="success" size="sm" onClick={() => openEditDialog(appointment.id)}>
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

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
              <DialogDescription>Update appointment details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Patient *</Label>
                  <Select value={editFormData.patientId} onValueChange={(v) => handleEditChange("patientId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.first_name} {p.last_name} ({p.patient_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dentist *</Label>
                  <Select value={editFormData.dentistId} onValueChange={(v) => handleEditChange("dentistId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select dentist" /></SelectTrigger>
                    <SelectContent>
                      {dentists.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          Dr. {d.first_name} {d.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={editFormData.appointmentDate} onChange={(e) => handleEditChange("appointmentDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Time *</Label>
                  <Input type="time" value={editFormData.appointmentTime} onChange={(e) => handleEditChange("appointmentTime", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Duration *</Label>
                  <Select value={editFormData.duration} onValueChange={(v) => handleEditChange("duration", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["30", "45", "60", "90", "120"].map((d) => (
                        <SelectItem key={d} value={d}>{d} minutes</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Treatment</Label>
                  <Input value={editFormData.treatmentType} onChange={(e) => handleEditChange("treatmentType", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editFormData.status} onValueChange={(v) => handleEditChange("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["scheduled", "confirmed", "in-progress", "completed", "cancelled", "no_show"].map((status) => (
                        <SelectItem key={status} value={status}>{status.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={editFormData.notes} onChange={(e) => handleEditChange("notes", e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>


      </div>
    </Layout>
  )
}

