"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  User,
  Calendar,
  Phone,
  Mail,
  Heart,
  AlertTriangle,
  Pill,
  TestTube,
  FileText,
  Camera,
  Eye,
  Download,
  Loader2,
  Activity,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Layout } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"

interface Patient {
  id: number
  patient_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  address: string
  medical_history: string
  allergies: string
  current_medications: string
}

interface Treatment {
  id: number
  treatment_name: string
  treatment_date: string
  dentist_name: string
  status: string
  cost: number
  procedure_notes: string
  medicines: any[]
  tests: any[]
  reports: any[]
}

export default function PatientViewPage() {
  const params = useParams()
  const { toast } = useToast()
  const patientId = params.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  useEffect(() => {
    fetchPatientData()
  }, [patientId])

  const fetchPatientData = async () => {
    try {
      setLoading(true)

      // Fetch patient details
      const patientRes = await fetch(`/api/patients/${patientId}`)
      if (patientRes.ok) {
        const patientData = await patientRes.json()
        setPatient(patientData)
      }

      // Fetch patient treatments with full details
      const treatmentsRes = await fetch(`/api/patients/${patientId}/treatments`)
      if (treatmentsRes.ok) {
        const treatmentsData = await treatmentsRes.json()
        setTreatments(treatmentsData)
      }
    } catch (error) {
      console.error("Error fetching patient data:", error)
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
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

  const openTreatmentDetails = async (treatment: Treatment) => {
    try {
      // Fetch detailed treatment data including medicines, tests, and reports
      const [medicinesRes, testsRes, reportsRes] = await Promise.all([
        fetch(`/api/treatments/${treatment.id}/medicines`),
        fetch(`/api/treatments/${treatment.id}/tests`),
        fetch(`/api/treatments/${treatment.id}/reports`),
      ])

      const medicines = medicinesRes.ok ? await medicinesRes.json() : []
      const tests = testsRes.ok ? await testsRes.json() : []
      const reports = reportsRes.ok ? await reportsRes.json() : []

      setSelectedTreatment({
        ...treatment,
        medicines,
        tests,
        reports,
      })
      setIsDetailDialogOpen(true)
    } catch (error) {
      console.error("Error fetching treatment details:", error)
      toast({
        title: "Error",
        description: "Failed to load treatment details",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    )
  }

  if (!patient) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-gray-500">Patient not found</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 rounded-full p-3">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.first_name} {patient.last_name}
                </h1>
                <p className="text-gray-600">Patient ID: {patient.patient_id}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {calculateAge(patient.date_of_birth)} years old
                  </span>
                  <span className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {patient.phone}
                  </span>
                  {patient.email && (
                    <span className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {patient.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-2">
                {patient.gender}
              </Badge>
              <p className="text-sm text-gray-500">{treatments.length} treatments</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="treatments">Treatment History</TabsTrigger>
            <TabsTrigger value="medical">Medical Info</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Treatment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Treatments:</span>
                      <span className="font-semibold">{treatments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-semibold text-green-600">
                        {treatments.filter((t) => t.status === "completed").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Progress:</span>
                      <span className="font-semibold text-blue-600">
                        {treatments.filter((t) => t.status === "in_progress").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span className="font-semibold">
                        ₹{treatments.reduce((sum, t) => sum + (t.cost || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Treatments */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Treatments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {treatments.slice(0, 5).map((treatment) => (
                      <div key={treatment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{treatment.treatment_name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(treatment.treatment_date).toLocaleDateString()} • Dr. {treatment.dentist_name}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(treatment.status)}>
                            {getStatusIcon(treatment.status)}
                            {treatment.status.replace("_", " ")}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => openTreatmentDetails(treatment)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Treatment History Tab */}
          <TabsContent value="treatments">
            <Card>
              <CardHeader>
                <CardTitle>Complete Treatment History</CardTitle>
                <CardDescription>All treatments and procedures for this patient</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Treatment</TableHead>
                      <TableHead>Dentist</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {treatments.map((treatment) => (
                      <TableRow key={treatment.id}>
                        <TableCell>{new Date(treatment.treatment_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {treatment.treatment_name}
                            {/* Show icons for medicines, tests, reports */}
                            <div className="flex gap-1">
                              {treatment.medicines?.length > 0 && (
                                <span className="inline-flex items-center">
                                  <Pill className="h-4 w-4 text-blue-500" />
                                  <span className="sr-only">Has prescriptions</span>
                                </span>
                              )}
                              {treatment.tests?.length > 0 && (
                                <span className="inline-flex items-center">
                                  <TestTube className="h-4 w-4 text-green-500" />
                                  <span className="sr-only">Has test requests</span>
                                </span>
                              )}
                              {treatment.reports?.length > 0 && (
                                <span className="inline-flex items-center">
                                  <FileText className="h-4 w-4 text-purple-500" />
                                  <span className="sr-only">Has reports</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>Dr. {treatment.dentist_name}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(treatment.status)}>
                            {getStatusIcon(treatment.status)}
                            {treatment.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{treatment.cost?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => openTreatmentDetails(treatment)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Information Tab */}
          <TabsContent value="medical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {patient.medical_history || "No medical history recorded"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{patient.allergies || "No known allergies"}</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-500" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {patient.current_medications || "No current medications"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Patient Documents & Reports</CardTitle>
                <CardDescription>All documents, reports, and photos from treatments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {treatments
                    .flatMap(
                      (treatment) =>
                        treatment.reports?.map((report) => ({
                          ...report,
                          treatment_name: treatment.treatment_name,
                          treatment_date: treatment.treatment_date,
                        })) || [],
                    )
                    .map((report, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline">{report.report_type?.replace("_", " ")}</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {report.file_url?.includes(".pdf") ? (
                            <div className="bg-gray-100 rounded-lg p-8 text-center">
                              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">PDF Document</p>
                            </div>
                          ) : (
                            <img
                              src={report.file_url || "/placeholder.svg"}
                              alt={report.file_name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          )}

                          <div className="mt-2">
                            <p className="text-sm font-medium truncate">{report.file_name}</p>
                            <p className="text-xs text-gray-500">
                              {report.treatment_name} • {new Date(report.treatment_date).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex gap-1 mt-2">
                            <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                              <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a href={report.file_url} download>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Treatment Details Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Treatment Details</DialogTitle>
            </DialogHeader>

            {selectedTreatment && (
              <div className="space-y-6">
                {/* Basic Treatment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Treatment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p>
                        <strong>Treatment:</strong> {selectedTreatment.treatment_name}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(selectedTreatment.treatment_date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Dentist:</strong> Dr. {selectedTreatment.dentist_name}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Status:</strong>
                        <Badge className={`ml-2 ${getStatusColor(selectedTreatment.status)}`}>
                          {getStatusIcon(selectedTreatment.status)}
                          {selectedTreatment.status.replace("_", " ")}
                        </Badge>
                      </p>
                      <p>
                        <strong>Cost:</strong> ₹{selectedTreatment.cost?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

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

                {/* Medicines */}
                {selectedTreatment.medicines && selectedTreatment.medicines.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Pill className="h-5 w-5 text-blue-500" />
                        Prescribed Medicines
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medicine</TableHead>
                            <TableHead>Dosage</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Instructions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedTreatment.medicines.map((medicine, index) => (
                            <TableRow key={index}>
                              <TableCell>{medicine.medicine_name}</TableCell>
                              <TableCell>{medicine.dosage}</TableCell>
                              <TableCell>{medicine.quantity}</TableCell>
                              <TableCell>{medicine.duration_days} days</TableCell>
                              <TableCell>{medicine.instructions || "N/A"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Tests */}
                {selectedTreatment.tests && selectedTreatment.tests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TestTube className="h-5 w-5 text-green-500" />
                        Laboratory Tests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Test Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead>Report</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedTreatment.tests.map((test, index) => (
                            <TableRow key={index}>
                              <TableCell>{test.test_name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{test.category}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    test.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : test.status === "requested"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }
                                >
                                  {test.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{test.result_value || "Pending"}</TableCell>
                              <TableCell>
                                {test.report_url ? (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={test.report_url} target="_blank" rel="noopener noreferrer">
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </a>
                                  </Button>
                                ) : (
                                  <span className="text-gray-400">No report</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Reports and Photos */}
                {selectedTreatment.reports && selectedTreatment.reports.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Camera className="h-5 w-5 text-purple-500" />
                        Reports & Photos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedTreatment.reports.map((report, index) => (
                          <div key={index} className="relative group">
                            {report.file_url?.includes(".pdf") ? (
                              <div className="bg-gray-100 rounded-lg p-8 text-center">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">PDF Report</p>
                              </div>
                            ) : (
                              <img
                                src={report.file_url || "/placeholder.svg"}
                                alt={report.file_name}
                                className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              />
                            )}
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {report.report_type?.replace("_", " ")}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
                              asChild
                            >
                              <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
