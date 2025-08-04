"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Eye, Users, UserCheck, Calendar, Phone } from "lucide-react"
import { Layout } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"
import { PatientHistoryDialog } from "./components/patient-history-dialog"
import { PatientFormDialog } from "./components/patient-form-dialog"

interface Patient {
  id: number
  patient_id: string
  first_name: string
  last_name: string
  email?: string
  phone: string
  date_of_birth?: string
  gender?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  insurance_provider?: string
  insurance_policy_number?: string
  medical_history?: string
  allergies?: string
  current_medications?: string
  created_at: string
}

export default function PatientsPage() {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
      }).toString()
      const response = await fetch(`/api/patients?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch patients.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching patients.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, toast])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsViewDialogOpen(true)
  }

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsEditDialogOpen(true)
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Calculate quick stats
  const totalPatients = patients.length
  const malePatients = patients.filter((p) => p.gender === "male").length
  const femalePatients = patients.filter((p) => p.gender === "female").length
  const thisMonthPatients = patients.filter((p) => {
    const createdDate = new Date(p.created_at)
    const now = new Date()
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
  }).length

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
            <p className="text-gray-600">Manage patient records and medical history</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold">{totalPatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Male Patients</p>
                  <p className="text-2xl font-bold">{malePatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-pink-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Female Patients</p>
                  <p className="text-2xl font-bold">{femalePatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">{thisMonthPatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients by name, phone, or patient ID..."
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
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age/Gender</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <Badge variant="outline">{patient.patient_id}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {patient.first_name} {patient.last_name}
                        </div>
                        {patient.allergies && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            Allergies
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {patient.date_of_birth && <div>{calculateAge(patient.date_of_birth)} years</div>}
                        {patient.gender && <div className="text-sm text-gray-500 capitalize">{patient.gender}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {patient.phone}
                      </div>
                    </TableCell>
                    <TableCell>{patient.email || "N/A"}</TableCell>
                    <TableCell>{new Date(patient.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                          <Eye className="h-4 w-4" /> <PatientHistoryDialog
                            patient={{
                              id: 1,
                              patient_id: "12345",
                              first_name: "John",
                              last_name: "Doe",
                              phone: "123-456-7890",
                              created_at: new Date().toISOString(),
                            }}
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                          />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditPatient(patient)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* <button onClick={() => setIsOpen(true)}>Open Patient History</button> */}

                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {patients.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                No patients found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient History Dialog */}
        <PatientHistoryDialog
          patient={selectedPatient}
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false)
            setSelectedPatient(null)
          }}
        />

        {/* Add Patient Dialog */}
        <PatientFormDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSuccess={() => {
            setIsAddDialogOpen(false)
            fetchPatients()
          }}
          mode="add"
        />

        {/* Edit Patient Dialog */}
        <PatientFormDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedPatient(null)
          }}
          onSuccess={() => {
            setIsEditDialogOpen(false)
            setSelectedPatient(null)
            fetchPatients()
          }}
          mode="edit"
          patient={selectedPatient}
        />
      </div>
    </Layout>
  )
}
