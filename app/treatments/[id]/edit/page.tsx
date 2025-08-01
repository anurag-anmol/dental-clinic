"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Save, Plus, Trash2, Upload, FileText, Camera, TestTube, Pill, Eye, Download, X, Loader2 } from "lucide-react"
import { Layout } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"

interface Treatment {
  id: number
  patient_name: string
  treatment_name: string
  treatment_date: string
  procedure_notes: string
  cost: number
  status: string
}

interface Medicine {
  id?: number
  medicine_id?: number
  medicine_name: string
  dosage: string
  quantity: number
  duration_days?: number
  instructions?: string
}

interface Test {
  id?: number
  test_id?: number
  test_name: string
  category: "pathological" | "radiological" | "other"
  instructions?: string
  status: string
  result_value?: string
  result_notes?: string
  report_url?: string
}

interface Report {
  id: number
  report_type: "before_photo" | "after_photo" | "internal_report" | "test_report"
  file_url: string
  file_name: string
  description?: string
  uploaded_by_name: string
  created_at: string
}

export default function EditTreatmentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const treatmentId = params.id as string

  const [treatment, setTreatment] = useState<Treatment | null>(null)
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [tests, setTests] = useState<Test[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Available medicines and tests
  const [availableMedicines, setAvailableMedicines] = useState<Array<{ id: number; name: string; strength: string; dosage_form: string }>>([])
  const [availableTests, setAvailableTests] = useState<Array<{ id: number; name: string; category: string }>>([])

  // Form states
  const [newMedicine, setNewMedicine] = useState<Medicine>({
    medicine_name: "",
    dosage: "",
    quantity: 1,
    duration_days: 7,
    instructions: "",
  })
  const [newTest, setNewTest] = useState<Test>({
    test_name: "",
    category: "pathological",
    instructions: "",
    status: "requested",
  })

  // Dialog states
  const [isMedicineDialogOpen, setIsMedicineDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState<string>("before_photo")
  const [uploadingReport, setUploadingReport] = useState(false)

  useEffect(() => {
    fetchTreatmentData()
    fetchAvailableOptions()
  }, [treatmentId])

  const fetchTreatmentData = async () => {
    try {
      setLoading(true)

      // Fetch treatment details
      const treatmentRes = await fetch(`/api/treatments/${treatmentId}`)
      if (treatmentRes.ok) {
        const treatmentData = await treatmentRes.json()
        setTreatment(treatmentData)
      }

      // Fetch medicines
      const medicinesRes = await fetch(`/api/treatments/${treatmentId}/medicines`)
      if (medicinesRes.ok) {
        const medicinesData = await medicinesRes.json()
        setMedicines(medicinesData)
      }

      // Fetch tests
      const testsRes = await fetch(`/api/treatments/${treatmentId}/tests`)
      if (testsRes.ok) {
        const testsData = await testsRes.json()
        setTests(testsData)
      }

      // Fetch reports
      const reportsRes = await fetch(`/api/treatments/${treatmentId}/reports`)
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setReports(reportsData)
      }
    } catch (error) {
      console.error("Error fetching treatment data:", error)
      toast({
        title: "Error",
        description: "Failed to load treatment data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableOptions = async () => {
    try {
      // Fetch available medicines
      const medicinesRes = await fetch("/api/medicines")
      if (medicinesRes.ok) {
        const medicinesData = await medicinesRes.json()
        setAvailableMedicines(medicinesData)
      }

      // Fetch available tests
      const testsRes = await fetch("/api/tests")
      if (testsRes.ok) {
        const testsData = await testsRes.json()
        setAvailableTests(testsData)
      }
    } catch (error) {
      console.error("Error fetching available options:", error)
    }
  }

  const handleAddMedicine = async () => {
    try {
      const response = await fetch(`/api/treatments/${treatmentId}/medicines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMedicine),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Medicine added successfully" })
        setIsMedicineDialogOpen(false)
        setNewMedicine({
          medicine_name: "",
          dosage: "",
          quantity: 1,
          duration_days: 7,
          instructions: "",
        })
        fetchTreatmentData()
      } else {
        throw new Error("Failed to add medicine")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add medicine",
        variant: "destructive",
      })
    }
  }

  const handleAddTest = async () => {
    try {
      const response = await fetch(`/api/treatments/${treatmentId}/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTest),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Test added successfully" })
        setIsTestDialogOpen(false)
        setNewTest({
          test_name: "",
          category: "pathological",
          instructions: "",
          status: "requested",
        })
        fetchTreatmentData()
      } else {
        throw new Error("Failed to add test")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add test",
        variant: "destructive",
      })
    }
  }

  const handleUploadReport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingReport(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("reportType", selectedReportType)
      formData.append("description", "")

      const response = await fetch(`/api/treatments/${treatmentId}/reports`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({ title: "Success", description: "Report uploaded successfully" })
        setIsReportDialogOpen(false)
        fetchTreatmentData()
      } else {
        throw new Error("Failed to upload report")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload report",
        variant: "destructive",
      })
    } finally {
      setUploadingReport(false)
    }
  }

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "before_photo":
        return "Before Photo"
      case "after_photo":
        return "After Photo"
      case "internal_report":
        return "Internal Report"
      case "test_report":
        return "Test Report"
      default:
        return type
    }
  }

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case "before_photo":
        return "bg-blue-100 text-blue-800"
      case "after_photo":
        return "bg-green-100 text-green-800"
      case "internal_report":
        return "bg-purple-100 text-purple-800"
      case "test_report":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Treatment</h2>
            <p className="text-gray-600">
              {treatment?.patient_name} - {treatment?.treatment_name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={() => router.push("/treatments")} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save & Close
            </Button>
          </div>
        </div>

        <Tabs defaultValue="medicines" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="medicines" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Medicines
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Tests
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photos
            </TabsTrigger>
          </TabsList>

          {/* Medicines Tab */}
          <TabsContent value="medicines">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Medicine Prescriptions</CardTitle>
                    <CardDescription>Manage prescribed medicines for this treatment</CardDescription>
                  </div>
                  <Dialog open={isMedicineDialogOpen} onOpenChange={setIsMedicineDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medicine
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Medicine Prescription</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="col-span-2 space-y-2">
                          <Label>Medicine</Label>
                          <Select
                            value={newMedicine.medicine_id?.toString() || ""}
                            onValueChange={(value) => {
                              const medicine = availableMedicines.find((m: any) => m.id.toString() === value)
                              setNewMedicine((prev) => ({
                                ...prev,
                                medicine_id: medicine ? medicine.id : undefined,
                                medicine_name: medicine
                                  ? `${medicine.name} (${medicine.strength})`
                                  : prev.medicine_name,
                              }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select medicine or enter custom name below" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableMedicines.map((medicine: any) => (
                                <SelectItem key={medicine.id} value={medicine.id.toString()}>
                                  {medicine.name} - {medicine.strength} ({medicine.dosage_form})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Or enter custom medicine name"
                            value={newMedicine.medicine_name}
                            onChange={(e) => setNewMedicine((prev) => ({ ...prev, medicine_name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Dosage</Label>
                          <Input
                            placeholder="e.g., 1 tablet twice daily"
                            value={newMedicine.dosage}
                            onChange={(e) => setNewMedicine((prev) => ({ ...prev, dosage: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={newMedicine.quantity}
                            onChange={(e) =>
                              setNewMedicine((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration (Days)</Label>
                          <Input
                            type="number"
                            value={newMedicine.duration_days}
                            onChange={(e) =>
                              setNewMedicine((prev) => ({ ...prev, duration_days: Number.parseInt(e.target.value) }))
                            }
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label>Instructions</Label>
                          <Textarea
                            placeholder="Special instructions for the patient"
                            value={newMedicine.instructions}
                            onChange={(e) => setNewMedicine((prev) => ({ ...prev, instructions: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsMedicineDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddMedicine}>Add Medicine</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicines.map((medicine) => (
                      <TableRow key={medicine.id}>
                        <TableCell>{medicine.medicine_name || newMedicine.medicine_name}</TableCell>
                        <TableCell>{medicine.dosage}</TableCell>
                        <TableCell>{medicine.quantity}</TableCell>
                        <TableCell>{medicine.duration_days} days</TableCell>
                        <TableCell>{medicine.instructions || "N/A"}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Laboratory Tests</CardTitle>
                    <CardDescription>Manage pathological and radiological test requests</CardDescription>
                  </div>
                  <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Test
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Test Request</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="col-span-2 space-y-2">
                          <Label>Test</Label>
                          <Select
                            value={newTest.test_id?.toString() || ""}
                            onValueChange={(value) => {
                              const test = availableTests.find((t: any) => t.id.toString() === value)
                              setNewTest((prev) => ({
                                ...prev,
                                test_id: test ? test.id : undefined,
                                test_name: test ? test.name : prev.test_name,
                                category: test
                                  ? (["pathological", "radiological", "other"].includes(test.category)
                                    ? (test.category as "pathological" | "radiological" | "other")
                                    : prev.category)
                                  : prev.category,
                              }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select test or enter custom name below" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTests.map((test: any) => (
                                <SelectItem key={test.id} value={test.id.toString()}>
                                  {test.name} ({test.category})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Or enter custom test name"
                            value={newTest.test_name}
                            onChange={(e) => setNewTest((prev) => ({ ...prev, test_name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={newTest.category}
                            onValueChange={(value: any) => setNewTest((prev) => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pathological">Pathological</SelectItem>
                              <SelectItem value="radiological">Radiological</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={newTest.status}
                            onValueChange={(value) => setNewTest((prev) => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="requested">Requested</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label>Instructions</Label>
                          <Textarea
                            placeholder="Special instructions for the test"
                            value={newTest.instructions}
                            onChange={(e) => setNewTest((prev) => ({ ...prev, instructions: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddTest}>Add Test</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Instructions</TableHead>
                      <TableHead>Report</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tests.map((test) => (
                      <TableRow key={test.id}>
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
                        <TableCell>{test.instructions || "N/A"}</TableCell>
                        <TableCell>
                          {test.report_url ? (
                            <Button variant="outline" size="sm" asChild>
                              <a href={test.report_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          ) : (
                            <span className="text-gray-400">No report</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Upload className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Treatment Reports & Documents</CardTitle>
                    <CardDescription>Upload and manage treatment-related documents</CardDescription>
                  </div>
                  <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Report</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Report Type</Label>
                          <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="before_photo">Before Photo</SelectItem>
                              <SelectItem value="after_photo">After Photo</SelectItem>
                              <SelectItem value="internal_report">Internal Report</SelectItem>
                              <SelectItem value="test_report">Test Report</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>File</Label>
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleUploadReport}
                            disabled={uploadingReport}
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className={getReportTypeColor(report.report_type)}>
                            {getReportTypeLabel(report.report_type)}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {report.file_url.includes(".pdf") ? (
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
                            By {report.uploaded_by_name} • {new Date(report.created_at).toLocaleDateString()}
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

          {/* Photos Tab - Existing functionality */}
          <TabsContent value="photos">
            <Card>
              <CardHeader>
                <CardTitle>Treatment Photos</CardTitle>
                <CardDescription>View and manage treatment photos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Treatment photos functionality (existing implementation)</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
