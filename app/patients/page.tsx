// "use client"

// import type React from "react"
// import { useState, useEffect, useCallback } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
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
// import { Search, Plus, Edit, Eye, Phone, Mail, Calendar, Loader2 } from "lucide-react"
// import { Layout } from "@/components/layout"
// import { useToast } from "@/hooks/use-toast"

// interface Patient {
//   id: number
//   patient_id: string
//   first_name: string
//   last_name: string
//   email: string | null
//   phone: string
//   date_of_birth: string | null
//   gender: string | null
//   address: string | null
//   emergency_contact_name: string | null
//   emergency_contact_phone: string | null
//   insurance_provider: string | null
//   insurance_policy_number: string | null
//   medical_history: string | null
//   allergies: string | null
//   current_medications: string | null
//   last_visit: string | null
//   next_appointment: string | null
// }

// export default function PatientsPage() {
//   const { toast } = useToast()
//   const [searchTerm, setSearchTerm] = useState("")
//   const [patients, setPatients] = useState<Patient[]>([])
//   const [loading, setLoading] = useState(true)
//   const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     dateOfBirth: "",
//     gender: "",
//     address: "",
//     emergencyContactName: "",
//     emergencyContactPhone: "",
//     insuranceProvider: "",
//     insurancePolicyNumber: "",
//     medicalHistory: "",
//     allergies: "",
//     currentMedications: "",
//   })

//   const fetchPatients = useCallback(async () => {
//     setLoading(true)
//     try {
//       const queryParams = new URLSearchParams({ search: searchTerm }).toString()
//       const response = await fetch(`/api/patients?${queryParams}`)
//       if (response.ok) {
//         const data = await response.json()
//         setPatients(data)
//       } else {
//         toast({
//           title: "Error",
//           description: "Failed to fetch patients.",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       console.error("Error fetching patients:", error)
//       toast({
//         title: "Error",
//         description: "An unexpected error occurred while fetching patients.",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }, [searchTerm, toast])

//   useEffect(() => {
//     fetchPatients()
//   }, [fetchPatients])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsSubmitting(true)
//     try {
//       const response = await fetch("/api/patients", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       })

//       if (response.ok) {
//         toast({
//           title: "Success",
//           description: "Patient added successfully!",
//         })
//         setIsAddPatientOpen(false)
//         setFormData({
//           firstName: "",
//           lastName: "",
//           email: "",
//           phone: "",
//           dateOfBirth: "",
//           gender: "",
//           address: "",
//           emergencyContactName: "",
//           emergencyContactPhone: "",
//           insuranceProvider: "",
//           insurancePolicyNumber: "",
//           medicalHistory: "",
//           allergies: "",
//           currentMedications: "",
//         })
//         fetchPatients()
//       } else {
//         const errorData = await response.json()
//         toast({
//           title: "Error",
//           description: errorData.error || "Failed to add patient.",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       console.error("Error creating patient:", error)
//       toast({
//         title: "Error",
//         description: "An unexpected error occurred while creating the patient.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

//   const calculateAge = (dob: string | null) => {
//     if (!dob) return "N/A"
//     const birthDate = new Date(dob)
//     const today = new Date()
//     let age = today.getFullYear() - birthDate.getFullYear()
//     const m = today.getMonth() - birthDate.getMonth()
//     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//       age--
//     }
//     return age
//   }

//   return (
//     <Layout>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Page Header */}
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
//             <p className="text-gray-600">Manage patient records and information</p>
//           </div>
//           <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
//             <DialogTrigger asChild>
//               <Button>
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add New Patient
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>Add New Patient</DialogTitle>
//                 <DialogDescription>Enter patient information to create a new record</DialogDescription>
//               </DialogHeader>
//               <form onSubmit={handleSubmit}>
//                 <div className="grid grid-cols-2 gap-4 py-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="firstName">First Name *</Label>
//                     <Input
//                       id="firstName"
//                       value={formData.firstName}
//                       onChange={(e) => handleInputChange("firstName", e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="lastName">Last Name *</Label>
//                     <Input
//                       id="lastName"
//                       value={formData.lastName}
//                       onChange={(e) => handleInputChange("lastName", e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="email">Email</Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={formData.email}
//                       onChange={(e) => handleInputChange("email", e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="phone">Phone *</Label>
//                     <Input
//                       id="phone"
//                       value={formData.phone}
//                       onChange={(e) => handleInputChange("phone", e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="dateOfBirth">Date of Birth</Label>
//                     <Input
//                       id="dateOfBirth"
//                       type="date"
//                       value={formData.dateOfBirth}
//                       onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="gender">Gender</Label>
//                     <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select gender" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="male">Male</SelectItem>
//                         <SelectItem value="female">Female</SelectItem>
//                         <SelectItem value="other">Other</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="col-span-2 space-y-2">
//                     <Label htmlFor="address">Address</Label>
//                     <Textarea
//                       id="address"
//                       value={formData.address}
//                       onChange={(e) => handleInputChange("address", e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
//                     <Input
//                       id="emergencyContactName"
//                       value={formData.emergencyContactName}
//                       onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
//                     <Input
//                       id="emergencyContactPhone"
//                       value={formData.emergencyContactPhone}
//                       onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="insuranceProvider">Insurance Provider</Label>
//                     <Input
//                       id="insuranceProvider"
//                       value={formData.insuranceProvider}
//                       onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
//                     <Input
//                       id="insurancePolicyNumber"
//                       value={formData.insurancePolicyNumber}
//                       onChange={(e) => handleInputChange("insurancePolicyNumber", e.target.value)}
//                     />
//                   </div>
//                   <div className="col-span-2 space-y-2">
//                     <Label htmlFor="medicalHistory">Medical History</Label>
//                     <Textarea
//                       id="medicalHistory"
//                       value={formData.medicalHistory}
//                       onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="allergies">Allergies</Label>
//                     <Textarea
//                       id="allergies"
//                       value={formData.allergies}
//                       onChange={(e) => handleInputChange("allergies", e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="currentMedications">Current Medications</Label>
//                     <Textarea
//                       id="currentMedications"
//                       value={formData.currentMedications}
//                       onChange={(e) => handleInputChange("currentMedications", e.target.value)}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end space-x-2">
//                   <Button type="button" variant="outline" onClick={() => setIsAddPatientOpen(false)}>
//                     Cancel
//                   </Button>
//                   <Button type="submit" disabled={isSubmitting}>
//                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                     Add Patient
//                   </Button>
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* Search and Filters */}
//         <Card className="mb-6">
//           <CardContent className="pt-6">
//             <div className="flex flex-col md:flex-row gap-4">
//               <div className="flex-1">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                   <Input
//                     placeholder="Search patients by name, ID, or email..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-10"
//                   />
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Patients Table */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Patient Records</CardTitle>
//             <CardDescription>{patients.length} patients found</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="text-center py-8">
//                 <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
//                 <p className="text-gray-500 mt-2">Loading patients...</p>
//               </div>
//             ) : patients.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">No patients found for the selected criteria.</div>
//             ) : (
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Patient ID</TableHead>
//                     <TableHead>Name</TableHead>
//                     <TableHead>Contact</TableHead>
//                     <TableHead>Age/Gender</TableHead>
//                     <TableHead>Last Visit</TableHead>
//                     <TableHead>Next Appointment</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {patients.map((patient) => (
//                     <TableRow key={patient.id}>
//                       <TableCell className="font-medium">{patient.patient_id}</TableCell>
//                       <TableCell>
//                         <div>
//                           <div className="font-medium">
//                             {patient.first_name} {patient.last_name}
//                           </div>
//                           <div className="text-sm text-gray-500">{patient.insurance_provider || "No Insurance"}</div>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="space-y-1">
//                           <div className="flex items-center text-sm">
//                             <Phone className="h-3 w-3 mr-1" />
//                             {patient.phone}
//                           </div>
//                           {patient.email && (
//                             <div className="flex items-center text-sm">
//                               <Mail className="h-3 w-3 mr-1" />
//                               {patient.email}
//                             </div>
//                           )}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div>
//                           <div>{calculateAge(patient.date_of_birth)} years</div>
//                           <div className="text-sm text-gray-500 capitalize">{patient.gender || "N/A"}</div>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : "Never"}
//                       </TableCell>
//                       <TableCell>
//                         {patient.next_appointment ? (
//                           <div className="flex items-center text-sm">
//                             <Calendar className="h-3 w-3 mr-1" />
//                             {new Date(patient.next_appointment).toLocaleDateString()}
//                           </div>
//                         ) : (
//                           <span className="text-gray-400">None scheduled</span>
//                         )}
//                       </TableCell>
//                       <TableCell>

//                         <div className="flex space-x-2">
//                           <Button variant="ghost" size="sm">
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                           <Button variant="ghost" size="sm">
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   )
// }



"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Search, Plus, Edit, Eye, Phone, Mail, Calendar, Loader2 } from "lucide-react"
import { Layout } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"

interface Patient {
  id: number
  patient_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string
  date_of_birth: string | null
  gender: string | null
  address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  insurance_provider: string | null
  insurance_policy_number: string | null
  medical_history: string | null
  allergies: string | null
  current_medications: string | null
  last_visit: string | null
  next_appointment: string | null
}

export default function PatientsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    medicalHistory: "",
    allergies: "",
    currentMedications: "",
  })

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({ search: searchTerm }).toString()
      const response = await fetch(`/api/patients?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      } else {
        toast({ title: "Error", description: "Failed to fetch patients.", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast({ title: "Error", description: "Unexpected error occurred.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, toast])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const method = isEditDialogOpen ? "PUT" : "POST"
      const url = isEditDialogOpen && selectedPatient ? `/api/patients/${selectedPatient.id}` : "/api/patients"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({ title: "Success", description: `Patient ${isEditDialogOpen ? "updated" : "added"} successfully!` })
        setIsAddPatientOpen(false)
        setIsEditDialogOpen(false)
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          gender: "",
          address: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
          insuranceProvider: "",
          insurancePolicyNumber: "",
          medicalHistory: "",
          allergies: "",
          currentMedications: "",
        })
        fetchPatients()
      } else {
        const errorData = await response.json()
        toast({ title: "Error", description: errorData.error || "Failed to save patient.", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error saving patient:", error)
      toast({ title: "Error", description: "Unexpected error occurred.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateAge = (dob: string | null) => {
    if (!dob) return "N/A"
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
            <p className="text-gray-600">Manage patient records and information</p>
          </div>
          <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>Enter patient information to create a new record</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">                     <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                    <Input
                      id="insuranceProvider"
                      value={formData.insuranceProvider}
                      onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                    <Input
                      id="insurancePolicyNumber"
                      value={formData.insurancePolicyNumber}
                      onChange={(e) => handleInputChange("insurancePolicyNumber", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="medicalHistory">Medical History</Label>
                    <Textarea
                      id="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => handleInputChange("allergies", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentMedications">Current Medications</Label>
                    <Textarea
                      id="currentMedications"
                      value={formData.currentMedications}
                      onChange={(e) => handleInputChange("currentMedications", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddPatientOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Patient
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients by name, ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>{patients.length} patients found</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Age/Gender</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Next Appointment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>{patient.patient_id}</TableCell>
                    <TableCell>{patient.first_name} {patient.last_name}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{calculateAge(patient.date_of_birth)} / {patient.gender}</TableCell>
                    <TableCell>{patient.last_visit || "N/A"}</TableCell>
                    <TableCell>{patient.next_appointment || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="success" size="sm" onClick={() => { setSelectedPatient(patient); setIsViewDialogOpen(true) }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => {
                          setSelectedPatient(patient)
                          setFormData({
                            firstName: patient.first_name,
                            lastName: patient.last_name,
                            email: patient.email || "",
                            phone: patient.phone,
                            dateOfBirth: patient.date_of_birth || "",
                            gender: patient.gender || "",
                            address: patient.address || "",
                            emergencyContactName: patient.emergency_contact_name || "",
                            emergencyContactPhone: patient.emergency_contact_phone || "",
                            insuranceProvider: patient.insurance_provider || "",
                            insurancePolicyNumber: patient.insurance_policy_number || "",
                            medicalHistory: patient.medical_history || "",
                            allergies: patient.allergies || "",
                            currentMedications: patient.current_medications || "",
                          })
                          setIsEditDialogOpen(true)
                        }}>
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
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
            </DialogHeader>
            {selectedPatient && (
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {selectedPatient.first_name} {selectedPatient.last_name}</p>
                <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                <p><strong>Email:</strong> {selectedPatient.email || "N/A"}</p>
                <p><strong>Address:</strong> {selectedPatient.address || "N/A"}</p>
                <p><strong>Insurance:</strong> {selectedPatient.insurance_provider || "None"}</p>
                <p><strong>Allergies:</strong> {selectedPatient.allergies || "None"}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog uses same form as Add — reuse Dialog + formData + handleSubmit */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
              <DialogDescription>Update patient details and save changes.</DialogDescription>
            </DialogHeader><form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange("dateOfBirth", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                  <Input id="emergencyContactName" value={formData.emergencyContactName} onChange={(e) => handleInputChange("emergencyContactName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                  <Input id="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input id="insuranceProvider" value={formData.insuranceProvider} onChange={(e) => handleInputChange("insuranceProvider", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                  <Input id="insurancePolicyNumber" value={formData.insurancePolicyNumber} onChange={(e) => handleInputChange("insurancePolicyNumber", e.target.value)} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Textarea id="medicalHistory" value={formData.medicalHistory} onChange={(e) => handleInputChange("medicalHistory", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea id="allergies" value={formData.allergies} onChange={(e) => handleInputChange("allergies", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentMedications">Current Medications</Label>
                  <Textarea id="currentMedications" value={formData.currentMedications} onChange={(e) => handleInputChange("currentMedications", e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
