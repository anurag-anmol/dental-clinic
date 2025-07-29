"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Search, Plus, Edit, Eye, Activity, CheckCircle, Clock, Loader2, Camera, X, Upload, ZoomIn } from "lucide-react"
import { Layout } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"

interface Treatment {
  id: number
  patient_name: string
  patient_id: string
  patient_db_id: number
  dentist_id: number
  dentist_name: string
  treatment_name: string
  treatment_type?: string
  treatment_date: string
  tooth_number: string | null
  procedure_notes: string | null
  cost: number | null
  status: string
  diagnosis: string | null
  plan_description: string | null
  photos?: string[]
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

// Predefined treatment types for dental clinics
const TREATMENT_TYPES = [
  "Consultation",
  "Cleaning & Prophylaxis",
  "Dental Filling",
  "Root Canal Treatment",
  "Crown & Bridge",
  "Tooth Extraction",
  "Dental Implant",
  "Orthodontic Treatment",
  "Teeth Whitening",
  "Periodontal Treatment",
  "Oral Surgery",
  "Dentures",
  "Veneers",
  "X-Ray/Radiography",
  "Emergency Treatment",
  "Pediatric Dentistry",
  "Oral Medicine",
  "Preventive Care",
  "Restorative Treatment",
  "Cosmetic Dentistry",
]

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

  // Photo states
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)

  // Edit dialog photo states
  const [editSelectedPhotos, setEditSelectedPhotos] = useState<File[]>([])
  const [editPhotoPreviewUrls, setEditPhotoPreviewUrls] = useState<string[]>([])

  // Photo modal states
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [loadingTreatmentDetails, setLoadingTreatmentDetails] = useState(false)

  const [formData, setFormData] = useState({
    patientId: "",
    dentistId: "",
    treatmentPlanId: "",
    treatmentName: "",
    treatmentType: "",
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

  // Photo handling functions for Add Treatment
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    const validFiles = files.filter((file) => validTypes.includes(file.type))

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Please select only image files (JPEG, PNG, WebP)",
        variant: "destructive",
      })
    }

    const currentPhotos = selectedPhotos.length
    const newPhotos = validFiles.slice(0, 5 - currentPhotos)

    if (newPhotos.length < validFiles.length) {
      toast({
        title: "Photo Limit",
        description: "Maximum 5 photos allowed per treatment",
        variant: "destructive",
      })
    }

    const newPreviewUrls = newPhotos.map((file) => URL.createObjectURL(file))
    setSelectedPhotos((prev) => [...prev, ...newPhotos])
    setPhotoPreviewUrls((prev) => [...prev, ...newPreviewUrls])
  }

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviewUrls[index])
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // Photo handling functions for Edit Treatment
  const handleEditPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    const validFiles = files.filter((file) => validTypes.includes(file.type))

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Please select only image files (JPEG, PNG, WebP)",
        variant: "destructive",
      })
    }

    const currentPhotos = editSelectedPhotos.length
    const newPhotos = validFiles.slice(0, 5 - currentPhotos)

    if (newPhotos.length < validFiles.length) {
      toast({
        title: "Photo Limit",
        description: "Maximum 5 photos allowed per treatment",
        variant: "destructive",
      })
    }

    const newPreviewUrls = newPhotos.map((file) => URL.createObjectURL(file))
    setEditSelectedPhotos((prev) => [...prev, ...newPhotos])
    setEditPhotoPreviewUrls((prev) => [...prev, ...newPreviewUrls])
  }

  const removeEditPhoto = (index: number) => {
    URL.revokeObjectURL(editPhotoPreviewUrls[index])
    setEditSelectedPhotos((prev) => prev.filter((_, i) => i !== index))
    setEditPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadPhotos = async (treatmentId: number, photos: File[]): Promise<string[]> => {
    if (photos.length === 0) return []

    setUploadingPhotos(true)
    const uploadedUrls: string[] = []

    try {
      for (const photo of photos) {
        const formData = new FormData()
        formData.append("photo", photo)
        formData.append("treatmentId", treatmentId.toString())

        const response = await fetch("/api/treatments/photos", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          uploadedUrls.push(result.photoUrl)
        } else {
          throw new Error("Failed to upload photo")
        }
      }
    } catch (error) {
      console.error("Error uploading photos:", error)
      toast({
        title: "Photo Upload Error",
        description: "Some photos failed to upload",
        variant: "destructive",
      })
    } finally {
      setUploadingPhotos(false)
    }

    return uploadedUrls
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
        const result = await response.json()
        const treatmentId = result.id

        if (selectedPhotos.length > 0) {
          await uploadPhotos(treatmentId, selectedPhotos)
        }

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
          treatmentType: "",
          treatmentDate: new Date().toISOString().split("T")[0],
          toothNumber: "",
          procedureNotes: "",
          cost: "",
          status: "completed",
        })

        photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
        setSelectedPhotos([])
        setPhotoPreviewUrls([])
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

  const handleOpenView = async (t: Treatment) => {
    setLoadingTreatmentDetails(true)
    setViewDialogOpen(true)
    try {
      const response = await fetch(`/api/treatments/${t.id}`)
      if (response.ok) {
        const treatmentWithPhotos = await response.json()
        setSelectedTreatment(treatmentWithPhotos)
      } else {
        setSelectedTreatment(t)
        toast({
          title: "Warning",
          description: "Could not load treatment photos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching treatment details:", error)
      setSelectedTreatment(t)
      toast({
        title: "Error",
        description: "Failed to load treatment details",
        variant: "destructive",
      })
    } finally {
      setLoadingTreatmentDetails(false)
    }
  }

  const handleOpenEdit = async (t: Treatment) => {
    setLoadingTreatmentDetails(true)
    try {
      const response = await fetch(`/api/treatments/${t.id}`)
      if (response.ok) {
        const treatmentWithPhotos = await response.json()
        setSelectedTreatment(treatmentWithPhotos)
      } else {
        setSelectedTreatment(t)
      }
    } catch (error) {
      console.error("Error fetching treatment details:", error)
      setSelectedTreatment(t)
    } finally {
      setLoadingTreatmentDetails(false)
      setEditDialogOpen(true)
      // Clear edit photos when opening dialog
      setEditSelectedPhotos([])
      setEditPhotoPreviewUrls([])
    }
  }

  const handleEditChange = (field: keyof Treatment, value: string) => {
    setSelectedTreatment((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleUpdateTreatment = async () => {
    if (!selectedTreatment) return

    try {
      const res = await fetch(`/api/treatments/${selectedTreatment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: selectedTreatment.patient_db_id,
          dentistId: Number(selectedTreatment.dentist_id),
          treatmentPlanId: null,
          treatmentName: selectedTreatment.treatment_name,
          treatmentType: selectedTreatment.treatment_type,
          treatmentDate: selectedTreatment.treatment_date,
          toothNumber: selectedTreatment.tooth_number || null,
          procedureNotes: selectedTreatment.procedure_notes || null,
          cost: selectedTreatment.cost !== undefined ? Number(selectedTreatment.cost) : null,
          status: selectedTreatment.status,
        }),
      })

      if (res.ok) {
        // Upload new photos if any
        if (editSelectedPhotos.length > 0) {
          await uploadPhotos(selectedTreatment.id, editSelectedPhotos)
        }

        toast({ title: "Success", description: "Treatment updated successfully." })
        setEditDialogOpen(false)

        // Clear edit photos
        editPhotoPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
        setEditSelectedPhotos([])
        setEditPhotoPreviewUrls([])

        fetchTreatments()
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.message || "Update failed.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Unexpected error occurred.", variant: "destructive" })
    }
  }

  // Photo modal functions
  const openPhotoModal = (photoUrl: string) => {
    setSelectedPhotoUrl(photoUrl)
    setIsPhotoModalOpen(true)
  }

  const closePhotoModal = () => {
    setSelectedPhotoUrl(null)
    setIsPhotoModalOpen(false)
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                  <div className="space-y-2">
                    <Label htmlFor="treatmentType">Treatment Type *</Label>
                    <Select
                      value={formData.treatmentType}
                      onValueChange={(value) => handleInputChange("treatmentType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select treatment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TREATMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
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
                  {/* Photo Upload Section */}
                  <div className="col-span-2 space-y-2">
                    <Label>Treatment Photos</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <Camera className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <Label htmlFor="photo-upload" className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                              Upload treatment photos
                            </span>
                            <span className="mt-1 block text-sm text-gray-500">
                              PNG, JPG, WebP up to 10MB each (Max 5 photos)
                            </span>
                          </Label>
                          <Input
                            id="photo-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handlePhotoSelect}
                            className="hidden"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2 bg-transparent"
                          onClick={() => document.getElementById("photo-upload")?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Photos
                        </Button>
                      </div>
                      {/* Photo Previews */}
                      {photoPreviewUrls.length > 0 && (
                        <div className="mt-4">
                          <div className="grid grid-cols-3 gap-2">
                            {photoPreviewUrls.map((url, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={url || "/placeholder.svg"}
                                  alt={`Treatment photo ${index + 1}`}
                                  className="w-full h-20 object-cover rounded border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                  onClick={() => removePhoto(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddTreatmentOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || uploadingPhotos}>
                    {(isSubmitting || uploadingPhotos) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {uploadingPhotos ? "Uploading Photos..." : "Add Treatment"}
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
                  <TableHead>Type</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {treatment.treatment_name}
                        {treatment.photos && treatment.photos.length > 0 && (
                          <Camera className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {treatment.treatment_type || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>{treatment.dentist_name}</TableCell>
                    <TableCell>{new Date(treatment.treatment_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(treatment.status)}>
                        {getStatusIcon(treatment.status)} {treatment.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenView(treatment)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(treatment)}>
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

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Treatment Details</DialogTitle>
              <DialogDescription>Complete information about the selected treatment</DialogDescription>
            </DialogHeader>
            {loadingTreatmentDetails ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading treatment details...</span>
              </div>
            ) : selectedTreatment ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p>
                        <strong>Name:</strong> {selectedTreatment.patient_name}
                      </p>
                      <p>
                        <strong>Patient ID:</strong> {selectedTreatment.patient_id}
                      </p>
                      <p>
                        <strong>Dentist:</strong> {selectedTreatment.dentist_name}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Treatment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p>
                        <strong>Treatment:</strong> {selectedTreatment.treatment_name}
                      </p>
                      <p>
                        <strong>Type:</strong> {selectedTreatment.treatment_type || "N/A"}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(selectedTreatment.treatment_date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <Badge className={`ml-2 ${getStatusColor(selectedTreatment.status)}`}>
                          {getStatusIcon(selectedTreatment.status)} {selectedTreatment.status.replace("_", " ")}
                        </Badge>
                      </p>
                    </CardContent>
                  </Card>
                </div>
                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p>
                      <strong>Tooth Number:</strong> {selectedTreatment.tooth_number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Cost:</strong>{" "}
                      {typeof selectedTreatment.cost === "number" ? `₹${selectedTreatment.cost.toFixed(2)}` : "N/A"}
                    </p>
                  </div>
                </div>
                {/* Procedure Notes */}
                {selectedTreatment.procedure_notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Procedure Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedTreatment.procedure_notes}</p>
                    </CardContent>
                  </Card>
                )}
                {/* Photos Section */}
                {selectedTreatment.photos && selectedTreatment.photos.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Treatment Photos ({selectedTreatment.photos.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedTreatment.photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={photo || "/placeholder.svg"}
                              alt={`Treatment photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openPhotoModal(photo)}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              Photo {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Click on any photo to view in full size</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No photos available for this treatment</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No treatment data available</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Photo Modal for Full Size View */}
        <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-2">
            <DialogHeader className="sr-only">
              <DialogTitle>Treatment Photo</DialogTitle>
            </DialogHeader>
            {selectedPhotoUrl && (
              <div className="relative">
                <img
                  src={selectedPhotoUrl || "/placeholder.svg"}
                  alt="Treatment photo full size"
                  className="w-full h-auto max-h-[80vh] object-contain rounded"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={closePhotoModal}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Enhanced Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Treatment</DialogTitle>
              <DialogDescription>Update treatment details and add photos</DialogDescription>
            </DialogHeader>
            {selectedTreatment && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleUpdateTreatment()
                }}
              >
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Treatment Type</Label>
                    <Select
                      value={selectedTreatment.treatment_type || ""}
                      onValueChange={(value) => handleEditChange("treatment_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select treatment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TREATMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Treatment Name</Label>
                    <Input
                      value={selectedTreatment.treatment_name}
                      onChange={(e) => handleEditChange("treatment_name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Treatment Date</Label>
                    <Input
                      type="date"
                      value={selectedTreatment.treatment_date}
                      onChange={(e) => handleEditChange("treatment_date", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tooth Number</Label>
                    <Input
                      value={selectedTreatment.tooth_number || ""}
                      onChange={(e) => handleEditChange("tooth_number", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={selectedTreatment.cost?.toString() || ""}
                      onChange={(e) => handleEditChange("cost", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={selectedTreatment.status}
                      onValueChange={(value) => handleEditChange("status", value)}
                    >
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
                    <Label>Procedure Notes</Label>
                    <Textarea
                      value={selectedTreatment.procedure_notes || ""}
                      onChange={(e) => handleEditChange("procedure_notes", e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Existing Photos */}
                  {selectedTreatment.photos && selectedTreatment.photos.length > 0 && (
                    <div className="col-span-2 space-y-2">
                      <Label>Current Photos</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedTreatment.photos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={photo || "/placeholder.svg"}
                              alt={`Current photo ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              Current {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Photos */}
                  <div className="col-span-2 space-y-2">
                    <Label>Add New Photos</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <Camera className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="mt-2">
                          <Label htmlFor="edit-photo-upload" className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                              Upload additional photos
                            </span>
                            <span className="mt-1 block text-sm text-gray-500">
                              PNG, JPG, WebP up to 10MB each (Max 5 photos)
                            </span>
                          </Label>
                          <Input
                            id="edit-photo-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleEditPhotoSelect}
                            className="hidden"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2 bg-transparent"
                          onClick={() => document.getElementById("edit-photo-upload")?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Photos
                        </Button>
                      </div>
                      {/* New Photo Previews */}
                      {editPhotoPreviewUrls.length > 0 && (
                        <div className="mt-4">
                          <div className="grid grid-cols-3 gap-2">
                            {editPhotoPreviewUrls.map((url, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={url || "/placeholder.svg"}
                                  alt={`New photo ${index + 1}`}
                                  className="w-full h-20 object-cover rounded border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                  onClick={() => removeEditPhoto(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                                <div className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-1 rounded">
                                  New {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploadingPhotos}>
                    {uploadingPhotos && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {uploadingPhotos ? "Uploading..." : "Update Treatment"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
