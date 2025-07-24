"use client"

// import type React from "react"
// import { useState, useEffect, useCallback } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Search, Plus, Edit, Eye, Activity, CheckCircle, Clock, Loader2 } from "lucide-react"
// import { Layout } from "@/components/layout"
// import { useToast } from "@/hooks/use-toast"

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
import { Search, Plus, Edit, Eye, Activity, CheckCircle, Clock, Loader2 } from "lucide-react"
import { Layout } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"

interface Treatment {
  id: number
  patient_name: string
  patient_id: string
  dentist_id: number // <-- Add this line
  dentist_name: string
  treatment_name: string
  treatment_date: string
  tooth_number: string | null
  procedure_notes: string | null
  cost: number | null
  status: string
  diagnosis: string | null
  plan_description: string | null
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

export default function TreatmentsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState("all")

  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [dentists, setDentists] = useState<Dentist[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddTreatmentOpen, setIsAddTreatmentOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    patientId: "",
    dentistId: "",
    treatmentPlanId: "", // Not currently used in form, but in API
    treatmentName: "",
    treatmentDate: new Date().toISOString().split("T")[0],
    toothNumber: "",
    procedureNotes: "",
    cost: "",
    status: "completed",
  })

  const fetchTreatments = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        status: selectedStatus,
        patient: selectedPatient,
      }).toString()
      const response = await fetch(`/api/treatments?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setTreatments(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch treatments.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching treatments:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching treatments.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedStatus, selectedPatient, toast])

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
    fetchTreatments()
  }, [fetchTreatments])

  useEffect(() => {
    if (isAddTreatmentOpen) {
      fetchPatients()
      fetchDentists()
    }
  }, [isAddTreatmentOpen, fetchPatients, fetchDentists])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/treatments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          patientId: Number(formData.patientId),
          dentistId: Number(formData.dentistId),
          cost: formData.cost ? Number(formData.cost) : null,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Treatment added successfully!",
        })
        setIsAddTreatmentOpen(false)
        setFormData({
          patientId: "",
          dentistId: "",
          treatmentPlanId: "",
          treatmentName: "",
          treatmentDate: new Date().toISOString().split("T")[0],
          toothNumber: "",
          procedureNotes: "",
          cost: "",
          status: "completed",
        })
        fetchTreatments()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to add treatment.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating treatment:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the treatment.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  // Calculate quick stats
  const totalTreatments = treatments.length
  const completedTreatments = treatments.filter((t) => t.status === "completed").length
  const inProgressTreatments = treatments.filter((t) => t.status === "in_progress").length
  const thisMonthTreatments = treatments.filter((t) => {
    const treatmentDate = new Date(t.treatment_date)
    const now = new Date()
    return treatmentDate.getMonth() === now.getMonth() && treatmentDate.getFullYear() === now.getFullYear()
  }).length

  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleOpenView = (t: Treatment) => {
    setSelectedTreatment(t)
    setViewDialogOpen(true)
  }

  const handleOpenEdit = (t: Treatment) => {
    setSelectedTreatment(t)
    setEditDialogOpen(true)
  }

  const handleEditChange = (field: keyof Treatment, value: string) => {
    setSelectedTreatment((prev: any) => ({ ...prev, [field]: value }))
  }

  // const handleUpdateTreatment = async () => {
  //   try {
  //     const res = await fetch(`/api/treatments/${selectedTreatment?.id}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(selectedTreatment),
  //     })
  //     if (res.ok) {
  //       toast({ title: "Success", description: "Treatment updated." })
  //       setEditDialogOpen(false)
  //       fetchTreatments()
  //     } else {
  //       toast({ title: "Error", description: "Update failed.", variant: "destructive" })
  //     }
  //   } catch (e) {
  //     toast({ title: "Error", description: "Unexpected error.", variant: "destructive" })
  //   }
  // }

  const handleUpdateTreatment = async () => {
    try {
      const res = await fetch(`/api/treatments/${selectedTreatment?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({

          dentistId: Number(selectedTreatment?.dentist_id), // ✅ Use correct ID
          treatmentName: selectedTreatment?.treatment_name,
          treatmentDate: selectedTreatment?.treatment_date,
          toothNumber: selectedTreatment?.tooth_number || null,
          procedureNotes: selectedTreatment?.procedure_notes || null,
          cost: selectedTreatment?.cost !== undefined ? Number(selectedTreatment?.cost) : null,
          status: selectedTreatment?.status,
        }),
      })
      console.log(selectedTreatment?.id);

      if (res.ok) {
        toast({ title: "Success", description: "Treatment updated." })
        setEditDialogOpen(false)
        fetchTreatments()
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.message || "Update failed.", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Unexpected error.", variant: "destructive" })
    }
  }



  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Treatment Management</h2>
            <p className="text-gray-600">Track and manage patient treatments and procedures</p>
          </div>
          <Dialog open={isAddTreatmentOpen} onOpenChange={setIsAddTreatmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Treatment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Treatment</DialogTitle>
                <DialogDescription>Record a new treatment or procedure</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient *</Label>
                    <Select value={formData.patientId} onValueChange={(value) => handleInputChange("patientId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient: any) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.first_name} {patient.last_name} ({patient.patient_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dentistId">Dentist *</Label>
                    <Select value={formData.dentistId} onValueChange={(value) => handleInputChange("dentistId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dentist" />
                      </SelectTrigger>
                      <SelectContent>
                        {dentists.map((dentist: any) => (
                          <SelectItem key={dentist.id} value={dentist.id.toString()}>
                            Dr. {dentist.first_name} {dentist.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="treatmentName">Treatment Name *</Label>
                    <Input
                      id="treatmentName"
                      value={formData.treatmentName}
                      onChange={(e) => handleInputChange("treatmentName", e.target.value)}
                      placeholder="e.g., Root Canal, Filling, Cleaning"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="treatmentDate">Treatment Date *</Label>
                    <Input
                      id="treatmentDate"
                      type="date"
                      value={formData.treatmentDate}
                      onChange={(e) => handleInputChange("treatmentDate", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toothNumber">Tooth Number</Label>
                    <Input
                      id="toothNumber"
                      value={formData.toothNumber}
                      onChange={(e) => handleInputChange("toothNumber", e.target.value)}
                      placeholder="e.g., #14, #6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => handleInputChange("cost", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="procedureNotes">Procedure Notes</Label>
                    <Textarea
                      id="procedureNotes"
                      value={formData.procedureNotes}
                      onChange={(e) => handleInputChange("procedureNotes", e.target.value)}
                      placeholder="Detailed notes about the procedure..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddTreatmentOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Treatment
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
                <Activity className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Treatments</p>
                  <p className="text-2xl font-bold">{totalTreatments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{completedTreatments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold">{inProgressTreatments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">{thisMonthTreatments}</p>
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
                    placeholder="Search treatments by patient name or treatment type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treatments Table */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Treatment Records</CardTitle>
            <CardDescription>{treatments.length} treatments found</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-gray-500 mt-2">Loading treatments...</p>
              </div>
            ) : treatments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No treatments found for the selected criteria.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Dentist</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Tooth</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treatments.map((treatment: any) => (
                    <TableRow key={treatment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{treatment.patient_name}</div>
                          <div className="text-sm text-gray-500">{treatment.patient_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{treatment.treatment_name}</div>
                          {treatment.diagnosis && <div className="text-sm text-gray-500">{treatment.diagnosis}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{treatment.dentist_name}</TableCell>
                      <TableCell>{new Date(treatment.treatment_date).toLocaleDateString()}</TableCell>
                      <TableCell>{treatment.tooth_number || "N/A"}</TableCell>
                      <TableCell>
                        {treatment.cost ? `$${Number.parseFloat(treatment.cost).toFixed(2)}` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(treatment.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(treatment.status)}
                            <span>{treatment.status.replace("_", " ")}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card> */}


        <Card>
          <CardHeader>
            <CardTitle>Treatment Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Dentist</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treatments.map((treatment) => (
                  <TableRow key={treatment.id}>
                    <TableCell>{treatment.patient_name}</TableCell>
                    <TableCell>{treatment.treatment_name}</TableCell>
                    <TableCell>{treatment.dentist_name}</TableCell>
                    <TableCell>{new Date(treatment.treatment_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(treatment.status)}>
                        {getStatusIcon(treatment.status)} {treatment.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="success" size="sm" onClick={() => handleOpenView(treatment)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleOpenEdit(treatment)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>View Treatment</DialogTitle>
              <DialogDescription>Details of the selected treatment.</DialogDescription>
            </DialogHeader>
            {selectedTreatment && (
              <div className="space-y-2">
                <p><strong>Patient:</strong> {selectedTreatment.patient_name}</p>
                <p><strong>Treatment:</strong> {selectedTreatment.treatment_name}</p>
                <p><strong>Date:</strong> {selectedTreatment.treatment_date}</p>
                <p><strong>Status:</strong> {selectedTreatment.status}</p>
                <p><strong>Notes:</strong> {selectedTreatment.procedure_notes || "N/A"}</p>
                <p><strong>Tooth No:</strong> {selectedTreatment.tooth_number || "N/A"}</p>
                <p>
                  <strong>Cost:</strong>{" "}
                  {typeof selectedTreatment.cost === "number"
                    ? `$${selectedTreatment.cost.toFixed(2)}`
                    : "N/A"}
                </p>

              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Treatment</DialogTitle>
              <DialogDescription>Update treatment details below.</DialogDescription>
            </DialogHeader>
            {selectedTreatment && (
              <div className="space-y-4">
                <Label htmlFor="edit-treatment-name">Treatment Name</Label>
                <Input
                  id="edit-treatment-name"
                  value={selectedTreatment.treatment_name}
                  onChange={(e) => handleEditChange("treatment_name", e.target.value)}
                />
                <Label htmlFor="edit-notes">Procedure Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={selectedTreatment.procedure_notes || ""}
                  onChange={(e) => handleEditChange("procedure_notes", e.target.value)}
                />
                <div className="flex justify-end">
                  <Button onClick={handleUpdateTreatment}>Update</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>


      </div>
    </Layout>
  )
}
