// "use client"
// import { useState, useEffect } from "react"
// import { CardDescription } from "@/components/ui/card"

// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import {
//     User,
//     Calendar,
//     Activity,
//     FileText,
//     Phone,
//     Mail,
//     MapPin,
//     Clock,
//     CheckCircle,
//     AlertCircle,
//     Loader2,
//     X,
//     Pill,
//     Smile,
// } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"

// interface Patient {
//     id: number
//     patient_id: string
//     first_name: string
//     last_name: string
//     email?: string
//     phone: string
//     date_of_birth?: string
//     gender?: string
//     address?: string
//     emergency_contact_name?: string
//     emergency_contact_phone?: string
//     insurance_provider?: string
//     insurance_policy_number?: string
//     medical_history?: string
//     allergies?: string
//     current_medications?: string
//     created_at: string
// }

// interface Medicine {
//     id: number
//     treatment_id: number
//     medicine_name: string
//     dosage: string
//     frequency: string
//     duration?: string
//     instructions?: string
//     quantity: number
//     created_at: string
// }

// interface Treatment {
//     id: number
//     treatment_name: string
//     treatment_type?: string
//     treatment_date: string
//     tooth_number?: string
//     procedure_notes?: string
//     cost?: number
//     status: string
//     dentist_name: string
//     photos?: string[]
//     medicines?: Medicine[]
// }

// interface Appointment {
//     id: number
//     appointment_date: string
//     appointment_time: string
//     treatment_type?: string
//     status: string
//     dentist_name: string
//     notes?: string
//     duration_minutes: number
// }

// interface TreatmentPlan {
//     id: number
//     diagnosis: string
//     treatment_description: string
//     estimated_cost?: number
//     status: string
//     priority: string
//     dentist_name: string
//     created_at: string
// }

// interface PatientHistoryDialogProps {
//     patient: Patient | null
//     isOpen: boolean
//     onClose: () => void
// }

// export function PatientHistoryDialog({ patient, isOpen, onClose }: PatientHistoryDialogProps) {
//     const { toast } = useToast()
//     const [loading, setLoading] = useState(false)
//     const [treatments, setTreatments] = useState<Treatment[]>([])
//     const [appointments, setAppointments] = useState<Appointment[]>([])
//     const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([])
//     const [allMedicines, setAllMedicines] = useState<Medicine[]>([])
//     const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null)
//     const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)

//     useEffect(() => {
//         if (patient && isOpen) {
//             fetchPatientHistory()
//         }
//     }, [patient, isOpen])

//     const fetchPatientHistory = async () => {
//         if (!patient) return
//         setLoading(true)
//         try {
//             // Fetch treatments
//             const treatmentsResponse = await fetch(`/api/patients/${patient.id}/treatments`)
//             if (treatmentsResponse.ok) {
//                 const treatmentsData = await treatmentsResponse.json()

//                 // Fetch medicines for each treatment
//                 const treatmentsWithMedicines = await Promise.all(
//                     treatmentsData.map(async (treatment: Treatment) => {
//                         try {
//                             const medicinesResponse = await fetch(`/api/treatments/${treatment.id}/medicines`)
//                             if (medicinesResponse.ok) {
//                                 const medicines = await medicinesResponse.json()
//                                 return { ...treatment, medicines }
//                             }
//                             return { ...treatment, medicines: [] }
//                         } catch (error) {
//                             console.error(`Error fetching medicines for treatment ${treatment.id}:`, error)
//                             return { ...treatment, medicines: [] }
//                         }
//                     }),
//                 )

//                 setTreatments(treatmentsWithMedicines)

//                 // Collect all medicines for the medicines tab
//                 const allMeds: Medicine[] = []
//                 treatmentsWithMedicines.forEach((treatment) => {
//                     if (treatment.medicines) {
//                         allMeds.push(...treatment.medicines)
//                     }
//                 })
//                 setAllMedicines(allMeds)
//             }

//             // Fetch appointments
//             const appointmentsResponse = await fetch(`/api/patients/${patient.id}/appointments`)
//             console.log("Name", patient.first_name);

//             if (appointmentsResponse.ok) {
//                 const appointmentsData = await appointmentsResponse.json()
//                 setAppointments(appointmentsData)
//             }

//             // Fetch treatment plans
//             const plansResponse = await fetch(`/api/patients/${patient.id}/treatment-plans`)
//             if (plansResponse.ok) {
//                 const plansData = await plansResponse.json()
//                 setTreatmentPlans(plansData)
//             }
//         } catch (error) {
//             console.error("Error fetching patient history:", error)
//             toast({
//                 title: "Error",
//                 description: "Failed to load patient history",
//                 variant: "destructive",
//             })
//         } finally {
//             setLoading(false)
//         }
//     }

//     const getStatusColor = (status: string) => {
//         switch (status.toLowerCase()) {
//             case "completed":
//                 return "bg-green-100 text-green-800"
//             case "in_progress":
//             case "scheduled":
//             case "confirmed":
//                 return "bg-blue-100 text-blue-800"
//             case "cancelled":
//             case "no_show":
//                 return "bg-red-100 text-red-800"
//             case "proposed":
//                 return "bg-yellow-100 text-yellow-800"
//             default:
//                 return "bg-gray-100 text-gray-800"
//         }
//     }

//     const getStatusIcon = (status: string) => {
//         switch (status.toLowerCase()) {
//             case "completed":
//                 return <CheckCircle className="h-4 w-4" />
//             case "in_progress":
//             case "scheduled":
//             case "confirmed":
//                 return <Clock className="h-4 w-4" />
//             case "cancelled":
//             case "no_show":
//                 return <X className="h-4 w-4" />
//             default:
//                 return <AlertCircle className="h-4 w-4" />
//         }
//     }

//     const openPhotoModal = (photoUrl: string) => {
//         setSelectedPhotoUrl(photoUrl)
//         setIsPhotoModalOpen(true)
//     }

//     const closePhotoModal = () => {
//         setSelectedPhotoUrl(null)
//         setIsPhotoModalOpen(false)
//     }

//     const calculateAge = (dateOfBirth: string) => {
//         const today = new Date()
//         const birthDate = new Date(dateOfBirth)
//         let age = today.getFullYear() - birthDate.getFullYear()
//         const monthDiff = today.getMonth() - birthDate.getMonth()
//         if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//             age--
//         }
//         return age
//     }

//     const getTreatmentByMedicine = (medicine: Medicine) => {
//         return treatments.find((t) => t.id === medicine.treatment_id)
//     }

//     if (!patient) return null

//     return (
//         <>
//             <Dialog open={isOpen} onOpenChange={onClose}>
//                 <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//                     <DialogHeader>
//                         <DialogTitle className="flex items-center gap-2">
//                             <User className="h-5 w-5" />
//                             Patient History - {patient.first_name} {patient.last_name}
//                         </DialogTitle>
//                         <DialogDescription>
//                             Complete medical and treatment history for Patient ID: {patient.patient_id}
//                         </DialogDescription>
//                     </DialogHeader>

//                     {loading ? (
//                         <div className="flex items-center justify-center py-8">
//                             <Smile className="h-8 w-8 animate-spin text-blue-600" />
//                             <span className="ml-2 text-gray-600">Loading patient history...</span>
//                         </div>
//                     ) : (
//                         <Tabs defaultValue="overview" className="w-full">
//                             <TabsList className="grid w-full grid-cols-6">
//                                 <TabsTrigger value="overview">Overview</TabsTrigger>
//                                 <TabsTrigger value="treatments">Treatments ({treatments.length})</TabsTrigger>
//                                 <TabsTrigger value="medicines">
//                                     <Pill className="h-4 w-4 mr-1" />
//                                     Medicine Prescription ({allMedicines.length})
//                                 </TabsTrigger>
//                                 <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
//                                 <TabsTrigger value="plans">Treatment Plans ({treatmentPlans.length})</TabsTrigger>
//                                 <TabsTrigger value="medical">Medical Info</TabsTrigger>
//                             </TabsList>

//                             {/* Overview Tab */}
//                             <TabsContent value="overview" className="space-y-6">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     {/* Patient Information */}
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle className="flex items-center gap-2">
//                                                 <User className="h-5 w-5" />
//                                                 Patient Information
//                                             </CardTitle>
//                                         </CardHeader>
//                                         <CardContent className="space-y-3">
//                                             <div className="flex justify-between">
//                                                 <span className="font-medium">Name:</span>
//                                                 <span>
//                                                     {patient.first_name} {patient.last_name}
//                                                 </span>
//                                             </div>
//                                             <div className="flex justify-between">
//                                                 <span className="font-medium">Patient ID:</span>
//                                                 <span>{patient.patient_id}</span>
//                                             </div>
//                                             {patient.date_of_birth && (
//                                                 <div className="flex justify-between">
//                                                     <span className="font-medium">Age:</span>
//                                                     <span>{calculateAge(patient.date_of_birth)} years</span>
//                                                 </div>
//                                             )}
//                                             {patient.gender && (
//                                                 <div className="flex justify-between">
//                                                     <span className="font-medium">Gender:</span>
//                                                     <span className="capitalize">{patient.gender}</span>
//                                                 </div>
//                                             )}
//                                             <div className="flex justify-between items-center">
//                                                 <span className="font-medium">Phone:</span>
//                                                 <span className="flex items-center gap-1">
//                                                     <Phone className="h-4 w-4" />
//                                                     {patient.phone}
//                                                 </span>
//                                             </div>
//                                             {patient.email && (
//                                                 <div className="flex justify-between items-center">
//                                                     <span className="font-medium">Email:</span>
//                                                     <span className="flex items-center gap-1">
//                                                         <Mail className="h-4 w-4" />
//                                                         {patient.email}
//                                                     </span>
//                                                 </div>
//                                             )}
//                                             {patient.address && (
//                                                 <div className="flex justify-between items-start">
//                                                     <span className="font-medium">Address:</span>
//                                                     <span className="flex items-start gap-1 text-right max-w-[200px]">
//                                                         <MapPin className="h-4 w-4 mt-0.5" />
//                                                         {patient.address}
//                                                     </span>
//                                                 </div>
//                                             )}
//                                         </CardContent>
//                                     </Card>

//                                     {/* Quick Stats */}
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle className="flex items-center gap-2">
//                                                 <Activity className="h-5 w-5" />
//                                                 Quick Statistics
//                                             </CardTitle>
//                                         </CardHeader>
//                                         <CardContent className="space-y-4">
//                                             <div className="grid grid-cols-2 gap-4">
//                                                 <div className="text-center p-3 bg-blue-50 rounded-lg">
//                                                     <div className="text-2xl font-bold text-blue-600">{treatments.length}</div>
//                                                     <div className="text-sm text-gray-600">Total Treatments</div>
//                                                 </div>
//                                                 <div className="text-center p-3 bg-green-50 rounded-lg">
//                                                     <div className="text-2xl font-bold text-green-600">
//                                                         {treatments.filter((t) => t.status === "completed").length}
//                                                     </div>
//                                                     <div className="text-sm text-gray-600">Completed</div>
//                                                 </div>
//                                                 <div className="text-center p-3 bg-purple-50 rounded-lg">
//                                                     <div className="text-2xl font-bold text-purple-600">{allMedicines.length}</div>
//                                                     <div className="text-sm text-gray-600">Medicines Prescribed</div>
//                                                 </div>
//                                                 <div className="text-center p-3 bg-orange-50 rounded-lg">
//                                                     <div className="text-2xl font-bold text-orange-600">
//                                                         ₹{Number(treatments.reduce((sum, t) => sum + (t.cost || 0), 0)).toFixed(2)}
//                                                     </div>
//                                                     <div className="text-sm text-gray-600">Total Cost</div>
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </div>

//                                 {/* Recent Activity */}
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle>Recent Activity</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="space-y-3">
//                                             {treatments.slice(0, 5).map((treatment) => (
//                                                 <div key={treatment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                                                     <div className="flex items-center gap-3">
//                                                         <Activity className="h-4 w-4 text-blue-500" />
//                                                         <div>
//                                                             <div className="font-medium">{treatment.treatment_name}</div>
//                                                             <div className="text-sm text-gray-500 flex items-center gap-2">
//                                                                 {new Date(treatment.treatment_date).toLocaleDateString()} - Dr. {treatment.dentist_name}
//                                                                 {treatment.medicines && treatment.medicines.length > 0 && (
//                                                                     <Badge variant="outline" className="text-xs">
//                                                                         <Pill className="h-3 w-3 mr-1" />
//                                                                         {treatment.medicines.length} medicines
//                                                                     </Badge>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                     <Badge className={getStatusColor(treatment.status)}>
//                                                         {treatment.status.replace("_", " ")}
//                                                     </Badge>
//                                                 </div>
//                                             ))}
//                                             {treatments.length === 0 && (
//                                                 <div className="text-center py-4 text-gray-500">No treatments recorded yet</div>
//                                             )}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </TabsContent>

//                             {/* Treatments Tab */}
//                             <TabsContent value="treatments" className="space-y-4">
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle>Treatment History</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <Table>
//                                             <TableHeader>
//                                                 <TableRow>
//                                                     <TableHead>Date</TableHead>
//                                                     <TableHead>Treatment</TableHead>
//                                                     <TableHead>Type</TableHead>
//                                                     <TableHead>Dentist</TableHead>
//                                                     <TableHead>Cost</TableHead>
//                                                     <TableHead>Status</TableHead>
//                                                     <TableHead>Medicines</TableHead>
//                                                     <TableHead>Photos</TableHead>
//                                                 </TableRow>
//                                             </TableHeader>
//                                             <TableBody>
//                                                 {treatments.map((treatment) => (
//                                                     <TableRow key={treatment.id}>
//                                                         <TableCell>{new Date(treatment.treatment_date).toLocaleDateString()}</TableCell>
//                                                         <TableCell>
//                                                             <div>
//                                                                 <div className="font-medium">{treatment.treatment_name}</div>
//                                                                 {treatment.tooth_number && (
//                                                                     <div className="text-sm text-gray-500">Tooth: {treatment.tooth_number}</div>
//                                                                 )}
//                                                             </div>
//                                                         </TableCell>
//                                                         <TableCell>
//                                                             {treatment.treatment_type && <Badge variant="outline">{treatment.treatment_type}</Badge>}
//                                                         </TableCell>
//                                                         <TableCell>{treatment.dentist_name}</TableCell>
//                                                         <TableCell>{treatment.cost ? `₹${Number(treatment.cost).toFixed(2)}` : "N/A"}</TableCell>
//                                                         <TableCell>
//                                                             <Badge className={getStatusColor(treatment.status)}>
//                                                                 {getStatusIcon(treatment.status)}
//                                                                 {treatment.status.replace("_", " ")}
//                                                             </Badge>
//                                                         </TableCell>
//                                                         <TableCell>
//                                                             {treatment.medicines && treatment.medicines.length > 0 ? (
//                                                                 <Badge variant="outline" className="bg-green-50 text-green-700">
//                                                                     <Pill className="h-3 w-3 mr-1" />
//                                                                     {treatment.medicines.length} prescribed
//                                                                 </Badge>
//                                                             ) : (
//                                                                 <span className="text-gray-400">No medicines</span>
//                                                             )}
//                                                         </TableCell>
//                                                         <TableCell>
//                                                             {treatment.photos && treatment.photos.length > 0 ? (
//                                                                 <div className="flex gap-1">
//                                                                     {treatment.photos.slice(0, 3).map((photo, index) => (
//                                                                         <img
//                                                                             key={index}
//                                                                             src={photo || "/placeholder.svg"}
//                                                                             alt={`Treatment photo ${index + 1}`}
//                                                                             className="w-8 h-8 object-cover rounded cursor-pointer hover:opacity-80"
//                                                                             onClick={() => openPhotoModal(photo)}
//                                                                         />
//                                                                     ))}
//                                                                     {treatment.photos.length > 3 && (
//                                                                         <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
//                                                                             +{treatment.photos.length - 3}
//                                                                         </div>
//                                                                     )}
//                                                                 </div>
//                                                             ) : (
//                                                                 <span className="text-gray-400">No photos</span>
//                                                             )}
//                                                         </TableCell>
//                                                     </TableRow>
//                                                 ))}
//                                             </TableBody>
//                                         </Table>
//                                         {treatments.length === 0 && (
//                                             <div className="text-center py-8 text-gray-500">
//                                                 <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
//                                                 No treatments recorded for this patient
//                                             </div>
//                                         )}
//                                     </CardContent>
//                                 </Card>
//                             </TabsContent>

//                             {/* Medicines Tab */}
//                             <TabsContent value="medicines" className="space-y-4">
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle className="flex items-center gap-2">
//                                             <Pill className="h-5 w-5" />
//                                             Medicine Prescription History
//                                         </CardTitle>
//                                         <CardDescription>Complete history of all medicines prescribed to this patient</CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         {allMedicines.length > 0 ? (
//                                             <div className="space-y-4">
//                                                 {allMedicines.map((medicine) => {
//                                                     const treatment = getTreatmentByMedicine(medicine)
//                                                     return (
//                                                         <Card key={medicine.id} className="border-l-4 border-l-blue-500">
//                                                             <CardContent className="pt-4">
//                                                                 <div className="flex justify-between items-start mb-3">
//                                                                     <div className="flex-1">
//                                                                         <h4 className="font-semibold text-lg text-blue-600 mb-1">
//                                                                             {medicine.medicine_name}
//                                                                         </h4>
//                                                                         <div className="text-sm text-gray-600 mb-2">
//                                                                             Prescribed on {new Date(medicine.created_at).toLocaleDateString()}
//                                                                             {treatment && (
//                                                                                 <span className="ml-2">
//                                                                                     for <strong>{treatment.treatment_name}</strong> by Dr.{" "}
//                                                                                     {treatment.dentist_name}
//                                                                                 </span>
//                                                                             )}
//                                                                         </div>
//                                                                     </div>
//                                                                     <Badge variant="outline" className="bg-blue-50">
//                                                                         {new Date(medicine.created_at).toLocaleDateString()}
//                                                                     </Badge>
//                                                                 </div>

//                                                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
//                                                                     <div className="bg-gray-50 p-3 rounded-lg">
//                                                                         <div className="text-xs text-gray-500 uppercase tracking-wide">Dosage</div>
//                                                                         <div className="font-medium">{medicine.dosage}</div>
//                                                                     </div>
//                                                                     <div className="bg-gray-50 p-3 rounded-lg">
//                                                                         <div className="text-xs text-gray-500 uppercase tracking-wide">Frequency</div>
//                                                                         <div className="font-medium">{medicine.frequency}</div>
//                                                                     </div>
//                                                                     <div className="bg-gray-50 p-3 rounded-lg">
//                                                                         <div className="text-xs text-gray-500 uppercase tracking-wide">Duration</div>
//                                                                         <div className="font-medium">{medicine.duration || "As needed"}</div>
//                                                                     </div>
//                                                                     <div className="bg-gray-50 p-3 rounded-lg">
//                                                                         <div className="text-xs text-gray-500 uppercase tracking-wide">Quantity</div>
//                                                                         <div className="font-medium">{medicine.quantity}</div>
//                                                                     </div>
//                                                                 </div>

//                                                                 {medicine.instructions && (
//                                                                     <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
//                                                                         <div className="text-xs text-yellow-700 uppercase tracking-wide mb-1">
//                                                                             Special Instructions
//                                                                         </div>
//                                                                         <div className="text-sm text-yellow-800">{medicine.instructions}</div>
//                                                                     </div>
//                                                                 )}

//                                                                 {treatment && (
//                                                                     <div className="mt-3 pt-3 border-t border-gray-200">
//                                                                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                                                                             <Activity className="h-4 w-4" />
//                                                                             <span>
//                                                                                 Related to: <strong>{treatment.treatment_name}</strong>
//                                                                                 {treatment.tooth_number && ` (Tooth: ${treatment.tooth_number})`}
//                                                                             </span>
//                                                                         </div>
//                                                                     </div>
//                                                                 )}
//                                                             </CardContent>
//                                                         </Card>
//                                                     )
//                                                 })}
//                                             </div>
//                                         ) : (
//                                             <div className="text-center py-12 text-gray-500">
//                                                 <Pill className="h-16 w-16 mx-auto mb-4 text-gray-300" />
//                                                 <h3 className="text-lg font-medium mb-2">No Medicines Prescribed</h3>
//                                                 <p className="text-sm">No medicine prescriptions found for this patient.</p>
//                                             </div>
//                                         )}
//                                     </CardContent>
//                                 </Card>
//                             </TabsContent>

//                             {/* Appointments Tab */}
//                             <TabsContent value="appointments" className="space-y-4">
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle>Appointment History</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <Table>
//                                             <TableHeader>
//                                                 <TableRow>
//                                                     <TableHead>Date & Time</TableHead>
//                                                     <TableHead>Treatment Type</TableHead>
//                                                     <TableHead>Dentist</TableHead>
//                                                     <TableHead>Duration</TableHead>
//                                                     <TableHead>Status</TableHead>
//                                                     <TableHead>Notes</TableHead>
//                                                 </TableRow>
//                                             </TableHeader>
//                                             <TableBody>
//                                                 {appointments.map((appointment) => (
//                                                     <TableRow key={appointment.id}>
//                                                         <TableCell>
//                                                             <div>
//                                                                 <div className="font-medium">
//                                                                     {new Date(appointment.appointment_date).toLocaleDateString()}
//                                                                 </div>
//                                                                 <div className="text-sm text-gray-500">{appointment.appointment_time}</div>
//                                                             </div>
//                                                         </TableCell>
//                                                         <TableCell>{appointment.treatment_type || "General Consultation"}</TableCell>
//                                                         <TableCell>{appointment.dentist_name}</TableCell>
//                                                         <TableCell>{appointment.duration_minutes} min</TableCell>
//                                                         <TableCell>
//                                                             <Badge className={getStatusColor(appointment.status)}>
//                                                                 {getStatusIcon(appointment.status)}
//                                                                 {appointment.status.replace("_", " ")}
//                                                             </Badge>
//                                                         </TableCell>
//                                                         <TableCell>
//                                                             <div className="max-w-[200px] truncate" title={appointment.notes}>
//                                                                 {appointment.notes || "No notes"}
//                                                             </div>
//                                                         </TableCell>
//                                                     </TableRow>
//                                                 ))}
//                                             </TableBody>
//                                         </Table>
//                                         {appointments.length === 0 && (
//                                             <div className="text-center py-8 text-gray-500">
//                                                 <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
//                                                 No appointments recorded for this patient
//                                             </div>
//                                         )}
//                                     </CardContent>
//                                 </Card>
//                             </TabsContent>

//                             {/* Treatment Plans Tab */}
//                             <TabsContent value="plans" className="space-y-4">
//                                 <div className="grid gap-4">
//                                     {treatmentPlans.map((plan) => (
//                                         <Card key={plan.id}>
//                                             <CardHeader>
//                                                 <div className="flex justify-between items-start">
//                                                     <div>
//                                                         <CardTitle className="text-lg">Treatment Plan #{plan.id}</CardTitle>
//                                                         <p className="text-sm text-gray-500">
//                                                             Created on {new Date(plan.created_at).toLocaleDateString()} by {plan.dentist_name}
//                                                         </p>
//                                                     </div>
//                                                     <div className="flex gap-2">
//                                                         <Badge className={getStatusColor(plan.status)}>{plan.status.replace("_", " ")}</Badge>
//                                                         <Badge
//                                                             variant="outline"
//                                                             className={
//                                                                 plan.priority === "urgent"
//                                                                     ? "border-red-500 text-red-700"
//                                                                     : plan.priority === "high"
//                                                                         ? "border-orange-500 text-orange-700"
//                                                                         : plan.priority === "medium"
//                                                                             ? "border-yellow-500 text-yellow-700"
//                                                                             : "border-green-500 text-green-700"
//                                                             }
//                                                         >
//                                                             {plan.priority} priority
//                                                         </Badge>
//                                                     </div>
//                                                 </div>
//                                             </CardHeader>
//                                             <CardContent className="space-y-4">
//                                                 <div>
//                                                     <h4 className="font-medium mb-2">Diagnosis</h4>
//                                                     <p className="text-gray-700 bg-gray-50 p-3 rounded">{plan.diagnosis}</p>
//                                                 </div>
//                                                 <div>
//                                                     <h4 className="font-medium mb-2">Treatment Description</h4>
//                                                     <p className="text-gray-700 bg-gray-50 p-3 rounded">{plan.treatment_description}</p>
//                                                 </div>
//                                                 {plan.estimated_cost && (
//                                                     <div className="flex justify-between items-center pt-2 border-t">
//                                                         <span className="font-medium">Estimated Cost:</span>
//                                                         <span className="text-lg font-bold text-green-600">
//                                                             ₹{Number(plan.estimated_cost).toFixed(2)}
//                                                         </span>
//                                                     </div>
//                                                 )}
//                                             </CardContent>
//                                         </Card>
//                                     ))}
//                                     {treatmentPlans.length === 0 && (
//                                         <Card>
//                                             <CardContent className="text-center py-8 text-gray-500">
//                                                 <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
//                                                 No treatment plans created for this patient
//                                             </CardContent>
//                                         </Card>
//                                     )}
//                                 </div>
//                             </TabsContent>

//                             {/* Medical Information Tab */}
//                             <TabsContent value="medical" className="space-y-4">
//                                 <div className="grid gap-6">
//                                     {/* Emergency Contact */}
//                                     {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
//                                         <Card>
//                                             <CardHeader>
//                                                 <CardTitle>Emergency Contact</CardTitle>
//                                             </CardHeader>
//                                             <CardContent className="space-y-2">
//                                                 {patient.emergency_contact_name && (
//                                                     <div className="flex justify-between">
//                                                         <span className="font-medium">Name:</span>
//                                                         <span>{patient.emergency_contact_name}</span>
//                                                     </div>
//                                                 )}
//                                                 {patient.emergency_contact_phone && (
//                                                     <div className="flex justify-between">
//                                                         <span className="font-medium">Phone:</span>
//                                                         <span>{patient.emergency_contact_phone}</span>
//                                                     </div>
//                                                 )}
//                                             </CardContent>
//                                         </Card>
//                                     )}

//                                     {/* Insurance Information */}
//                                     {(patient.insurance_provider || patient.insurance_policy_number) && (
//                                         <Card>
//                                             <CardHeader>
//                                                 <CardTitle>Insurance Information</CardTitle>
//                                             </CardHeader>
//                                             <CardContent className="space-y-2">
//                                                 {patient.insurance_provider && (
//                                                     <div className="flex justify-between">
//                                                         <span className="font-medium">Provider:</span>
//                                                         <span>{patient.insurance_provider}</span>
//                                                     </div>
//                                                 )}
//                                                 {patient.insurance_policy_number && (
//                                                     <div className="flex justify-between">
//                                                         <span className="font-medium">Policy Number:</span>
//                                                         <span>{patient.insurance_policy_number}</span>
//                                                     </div>
//                                                 )}
//                                             </CardContent>
//                                         </Card>
//                                     )}

//                                     {/* Medical History */}
//                                     {patient.medical_history && (
//                                         <Card>
//                                             <CardHeader>
//                                                 <CardTitle>Medical History</CardTitle>
//                                             </CardHeader>
//                                             <CardContent>
//                                                 <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">
//                                                     {patient.medical_history}
//                                                 </p>
//                                             </CardContent>
//                                         </Card>
//                                     )}

//                                     {/* Allergies */}
//                                     {patient.allergies && (
//                                         <Card>
//                                             <CardHeader>
//                                                 <CardTitle className="text-red-600">Allergies</CardTitle>
//                                             </CardHeader>
//                                             <CardContent>
//                                                 <p className="text-gray-700 whitespace-pre-wrap bg-red-50 p-4 rounded border border-red-200">
//                                                     {patient.allergies}
//                                                 </p>
//                                             </CardContent>
//                                         </Card>
//                                     )}

//                                     {/* Current Medications */}
//                                     {patient.current_medications && (
//                                         <Card>
//                                             <CardHeader>
//                                                 <CardTitle>Current Medications</CardTitle>
//                                             </CardHeader>
//                                             <CardContent>
//                                                 <p className="text-gray-700 whitespace-pre-wrap bg-blue-50 p-4 rounded">
//                                                     {patient.current_medications}
//                                                 </p>
//                                             </CardContent>
//                                         </Card>
//                                     )}

//                                     {/* If no medical information */}
//                                     {!patient.medical_history &&
//                                         !patient.allergies &&
//                                         !patient.current_medications &&
//                                         !patient.emergency_contact_name &&
//                                         !patient.insurance_provider && (
//                                             <Card>
//                                                 <CardContent className="text-center py-8 text-gray-500">
//                                                     <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
//                                                     No medical information recorded for this patient
//                                                 </CardContent>
//                                             </Card>
//                                         )}
//                                 </div>
//                             </TabsContent>
//                         </Tabs>
//                     )}
//                 </DialogContent>
//             </Dialog>

//             {/* Photo Modal */}
//             <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
//                 <DialogContent className="max-w-4xl max-h-[90vh] p-2">
//                     <DialogHeader className="sr-only">
//                         <DialogTitle>Treatment Photo</DialogTitle>
//                     </DialogHeader>
//                     {selectedPhotoUrl && (
//                         <div className="relative">
//                             <img
//                                 src={selectedPhotoUrl || "/placeholder.svg"}
//                                 alt="Treatment photo full size"
//                                 className="w-full h-auto max-h-[80vh] object-contain rounded"
//                             />
//                             <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="absolute top-2 right-2 bg-white/80 hover:bg-white"
//                                 onClick={closePhotoModal}
//                             >
//                                 <X className="h-4 w-4" />
//                             </Button>
//                         </div>
//                     )}
//                 </DialogContent>
//             </Dialog>
//         </>
//     )
// }



// --------------Responsive Web design--------------------

"use client"
import { useState, useEffect } from "react"
import { CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    User,
    Calendar,
    Activity,
    FileText,
    Phone,
    Mail,
    MapPin,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    X,
    Pill,
    Smile,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

interface Medicine {
    id: number
    treatment_id: number
    medicine_name: string
    dosage: string
    frequency: string
    duration?: string
    instructions?: string
    quantity: number
    created_at: string
}

interface Treatment {
    id: number
    treatment_name: string
    treatment_type?: string
    treatment_date: string
    tooth_number?: string
    procedure_notes?: string
    cost?: number
    status: string
    dentist_name: string
    photos?: string[]
    medicines?: Medicine[]
}

interface Appointment {
    id: number
    appointment_date: string
    appointment_time: string
    treatment_type?: string
    status: string
    dentist_name: string
    notes?: string
    duration_minutes: number
}

interface TreatmentPlan {
    id: number
    diagnosis: string
    treatment_description: string
    estimated_cost?: number
    status: string
    priority: string
    dentist_name: string
    created_at: string
}

interface PatientHistoryDialogProps {
    patient: Patient | null
    isOpen: boolean
    onClose: () => void
}

export function PatientHistoryDialog({ patient, isOpen, onClose }: PatientHistoryDialogProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [treatments, setTreatments] = useState<Treatment[]>([])
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([])
    const [allMedicines, setAllMedicines] = useState<Medicine[]>([])
    const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null)
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)

    useEffect(() => {
        if (patient && isOpen) {
            fetchPatientHistory()
        }
    }, [patient, isOpen])

    const fetchPatientHistory = async () => {
        if (!patient) return
        setLoading(true)
        try {
            // Fetch treatments
            const treatmentsResponse = await fetch(`/api/patients/${patient.id}/treatments`)
            if (treatmentsResponse.ok) {
                const treatmentsData = await treatmentsResponse.json()

                // Fetch medicines for each treatment
                const treatmentsWithMedicines = await Promise.all(
                    treatmentsData.map(async (treatment: Treatment) => {
                        try {
                            const medicinesResponse = await fetch(`/api/treatments/${treatment.id}/medicines`)
                            if (medicinesResponse.ok) {
                                const medicines = await medicinesResponse.json()
                                return { ...treatment, medicines }
                            }
                            return { ...treatment, medicines: [] }
                        } catch (error) {
                            console.error(`Error fetching medicines for treatment ${treatment.id}:`, error)
                            return { ...treatment, medicines: [] }
                        }
                    }),
                )

                setTreatments(treatmentsWithMedicines)

                // Collect all medicines for the medicines tab
                const allMeds: Medicine[] = []
                treatmentsWithMedicines.forEach((treatment) => {
                    if (treatment.medicines) {
                        allMeds.push(...treatment.medicines)
                    }
                })
                setAllMedicines(allMeds)
            }

            // Fetch appointments
            const appointmentsResponse = await fetch(`/api/patients/${patient.id}/appointments`)
            if (appointmentsResponse.ok) {
                const appointmentsData = await appointmentsResponse.json()
                setAppointments(appointmentsData)
            }

            // Fetch treatment plans
            const plansResponse = await fetch(`/api/patients/${patient.id}/treatment-plans`)
            if (plansResponse.ok) {
                const plansData = await plansResponse.json()
                setTreatmentPlans(plansData)
            }
        } catch (error) {
            console.error("Error fetching patient history:", error)
            toast({
                title: "Error",
                description: "Failed to load patient history",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "bg-green-100 text-green-800"
            case "in_progress":
            case "scheduled":
            case "confirmed":
                return "bg-blue-100 text-blue-800"
            case "cancelled":
            case "no_show":
                return "bg-red-100 text-red-800"
            case "proposed":
                return "bg-yellow-100 text-yellow-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return <CheckCircle className="h-4 w-4" />
            case "in_progress":
            case "scheduled":
            case "confirmed":
                return <Clock className="h-4 w-4" />
            case "cancelled":
            case "no_show":
                return <X className="h-4 w-4" />
            default:
                return <AlertCircle className="h-4 w-4" />
        }
    }

    const openPhotoModal = (photoUrl: string) => {
        setSelectedPhotoUrl(photoUrl)
        setIsPhotoModalOpen(true)
    }

    const closePhotoModal = () => {
        setSelectedPhotoUrl(null)
        setIsPhotoModalOpen(false)
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

    const getTreatmentByMedicine = (medicine: Medicine) => {
        return treatments.find((t) => t.id === medicine.treatment_id)
    }

    if (!patient) return null

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <span className="text-lg sm:text-xl">Patient History - {patient.first_name} {patient.last_name}</span>
                        </DialogTitle>
                        <DialogDescription>
                            Complete medical and treatment history for Patient ID: {patient.patient_id}
                        </DialogDescription>
                    </DialogHeader>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Smile className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading patient history...</span>
                        </div>
                    ) : (
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1">
                                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                                <TabsTrigger value="treatments" className="text-xs sm:text-sm">Treatments ({treatments.length})</TabsTrigger>
                                <TabsTrigger value="medicines" className="text-xs sm:text-sm">
                                    <Pill className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span className="hidden sm:inline">Medicine</span> ({allMedicines.length})
                                </TabsTrigger>
                                <TabsTrigger value="appointments" className="text-xs sm:text-sm">Appts ({appointments.length})</TabsTrigger>
                                <TabsTrigger value="plans" className="text-xs sm:text-sm">Plans ({treatmentPlans.length})</TabsTrigger>
                                <TabsTrigger value="medical" className="text-xs sm:text-sm">Medical</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Patient Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <User className="h-5 w-5" />
                                                Patient Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 sm:space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-sm sm:text-base">Name:</span>
                                                <span className="text-sm sm:text-base">
                                                    {patient.first_name} {patient.last_name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-sm sm:text-base">Patient ID:</span>
                                                <span className="text-sm sm:text-base">{patient.patient_id}</span>
                                            </div>
                                            {patient.date_of_birth && (
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-sm sm:text-base">Age:</span>
                                                    <span className="text-sm sm:text-base">{calculateAge(patient.date_of_birth)} years</span>
                                                </div>
                                            )}
                                            {patient.gender && (
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-sm sm:text-base">Gender:</span>
                                                    <span className="text-sm sm:text-base capitalize">{patient.gender}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-sm sm:text-base">Phone:</span>
                                                <span className="flex items-center gap-1 text-sm sm:text-base">
                                                    <Phone className="h-4 w-4" />
                                                    {patient.phone}
                                                </span>
                                            </div>
                                            {patient.email && (
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-sm sm:text-base">Email:</span>
                                                    <span className="flex items-center gap-1 text-sm sm:text-base">
                                                        <Mail className="h-4 w-4" />
                                                        {patient.email}
                                                    </span>
                                                </div>
                                            )}
                                            {patient.address && (
                                                <div className="flex justify-between items-start">
                                                    <span className="font-medium text-sm sm:text-base">Address:</span>
                                                    <span className="flex items-start gap-1 text-right text-sm sm:text-base max-w-[150px] sm:max-w-[200px]">
                                                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                        {patient.address}
                                                    </span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Quick Stats */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Activity className="h-5 w-5" />
                                                Quick Statistics
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 sm:space-y-4">
                                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                                <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                                                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{treatments.length}</div>
                                                    <div className="text-xs sm:text-sm text-gray-600">Total Treatments</div>
                                                </div>
                                                <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                                                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                                                        {treatments.filter((t) => t.status === "completed").length}
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-gray-600">Completed</div>
                                                </div>
                                                <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg">
                                                    <div className="text-xl sm:text-2xl font-bold text-purple-600">{allMedicines.length}</div>
                                                    <div className="text-xs sm:text-sm text-gray-600">Medicines</div>
                                                </div>
                                                <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
                                                    <div className="text-xl sm:text-2xl font-bold text-orange-600">
                                                        ₹{Number(treatments.reduce((sum, t) => sum + (t.cost || 0), 0)).toFixed(2)}
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-gray-600">Total Cost</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Recent Activity */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 sm:space-y-3">
                                            {treatments.slice(0, 5).map((treatment) => (
                                                <div key={treatment.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <Activity className="h-4 w-4 text-blue-500" />
                                                        <div>
                                                            <div className="font-medium text-sm sm:text-base">{treatment.treatment_name}</div>
                                                            <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 sm:gap-2">
                                                                {new Date(treatment.treatment_date).toLocaleDateString()} - Dr. {treatment.dentist_name}
                                                                {treatment.medicines && treatment.medicines.length > 0 && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        <Pill className="h-3 w-3 mr-1" />
                                                                        {treatment.medicines.length}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge className={`text-xs sm:text-sm ${getStatusColor(treatment.status)}`}>
                                                        {treatment.status.replace("_", " ")}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {treatments.length === 0 && (
                                                <div className="text-center py-4 text-gray-500">No treatments recorded yet</div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Treatments Tab */}
                            <TabsContent value="treatments" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Treatment History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table className="min-w-full">
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="whitespace-nowrap">Date</TableHead>
                                                        <TableHead className="whitespace-nowrap">Treatment</TableHead>
                                                        <TableHead className="whitespace-nowrap">Type</TableHead>
                                                        <TableHead className="whitespace-nowrap">Dentist</TableHead>
                                                        <TableHead className="whitespace-nowrap">Cost</TableHead>
                                                        <TableHead className="whitespace-nowrap">Status</TableHead>
                                                        <TableHead className="whitespace-nowrap">Medicines</TableHead>
                                                        <TableHead className="whitespace-nowrap">Photos</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {treatments.map((treatment) => (
                                                        <TableRow key={treatment.id}>
                                                            <TableCell className="whitespace-nowrap">
                                                                {new Date(treatment.treatment_date).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <div className="font-medium text-sm sm:text-base">{treatment.treatment_name}</div>
                                                                    {treatment.tooth_number && (
                                                                        <div className="text-xs text-gray-500">Tooth: {treatment.tooth_number}</div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {treatment.treatment_type && (
                                                                    <Badge variant="outline" className="text-xs sm:text-sm">
                                                                        {treatment.treatment_type}
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap">{treatment.dentist_name}</TableCell>
                                                            <TableCell className="whitespace-nowrap">
                                                                {treatment.cost ? `₹${Number(treatment.cost).toFixed(2)}` : "N/A"}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={`text-xs sm:text-sm ${getStatusColor(treatment.status)}`}>
                                                                    {getStatusIcon(treatment.status)}
                                                                    <span className="ml-1">{treatment.status.replace("_", " ")}</span>
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {treatment.medicines && treatment.medicines.length > 0 ? (
                                                                    <Badge variant="outline" className="bg-green-50 text-green-700 text-xs sm:text-sm">
                                                                        <Pill className="h-3 w-3 mr-1" />
                                                                        {treatment.medicines.length}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-gray-400 text-xs sm:text-sm">None</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {treatment.photos && treatment.photos.length > 0 ? (
                                                                    <div className="flex gap-1">
                                                                        {treatment.photos.slice(0, 3).map((photo, index) => (
                                                                            <img
                                                                                key={index}
                                                                                src={photo || "/placeholder.svg"}
                                                                                alt={`Treatment photo ${index + 1}`}
                                                                                className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded cursor-pointer hover:opacity-80"
                                                                                onClick={() => openPhotoModal(photo)}
                                                                            />
                                                                        ))}
                                                                        {treatment.photos.length > 3 && (
                                                                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
                                                                                +{treatment.photos.length - 3}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400 text-xs sm:text-sm">None</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        {treatments.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                No treatments recorded for this patient
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Medicines Tab */}
                            <TabsContent value="medicines" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Pill className="h-5 w-5" />
                                            Medicine Prescription History
                                        </CardTitle>
                                        <CardDescription>Complete history of all medicines prescribed to this patient</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {allMedicines.length > 0 ? (
                                            <div className="space-y-3">
                                                {allMedicines.map((medicine) => {
                                                    const treatment = getTreatmentByMedicine(medicine)
                                                    return (
                                                        <Card key={medicine.id} className="border-l-4 border-l-blue-500">
                                                            <CardContent className="pt-3 sm:pt-4">
                                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-3 gap-2">
                                                                    <div className="flex-1">
                                                                        <h4 className="font-semibold text-base sm:text-lg text-blue-600 mb-1">
                                                                            {medicine.medicine_name}
                                                                        </h4>
                                                                        <div className="text-xs sm:text-sm text-gray-600 mb-2">
                                                                            Prescribed on {new Date(medicine.created_at).toLocaleDateString()}
                                                                            {treatment && (
                                                                                <span className="ml-1 sm:ml-2">
                                                                                    for <strong>{treatment.treatment_name}</strong> by Dr.{" "}
                                                                                    {treatment.dentist_name}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline" className="bg-blue-50 text-xs sm:text-sm">
                                                                        {new Date(medicine.created_at).toLocaleDateString()}
                                                                    </Badge>
                                                                </div>

                                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-2 sm:mb-3">
                                                                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Dosage</div>
                                                                        <div className="font-medium text-sm sm:text-base">{medicine.dosage}</div>
                                                                    </div>
                                                                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Frequency</div>
                                                                        <div className="font-medium text-sm sm:text-base">{medicine.frequency}</div>
                                                                    </div>
                                                                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Duration</div>
                                                                        <div className="font-medium text-sm sm:text-base">{medicine.duration || "As needed"}</div>
                                                                    </div>
                                                                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Quantity</div>
                                                                        <div className="font-medium text-sm sm:text-base">{medicine.quantity}</div>
                                                                    </div>
                                                                </div>

                                                                {medicine.instructions && (
                                                                    <div className="bg-yellow-50 border border-yellow-200 p-2 sm:p-3 rounded-lg">
                                                                        <div className="text-xs text-yellow-700 uppercase tracking-wide mb-1">
                                                                            Special Instructions
                                                                        </div>
                                                                        <div className="text-xs sm:text-sm text-yellow-800">{medicine.instructions}</div>
                                                                    </div>
                                                                )}

                                                                {treatment && (
                                                                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                                                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                                                            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                            <span>
                                                                                Related to: <strong>{treatment.treatment_name}</strong>
                                                                                {treatment.tooth_number && ` (Tooth: ${treatment.tooth_number})`}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Pill className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                <h3 className="text-base sm:text-lg font-medium mb-2">No Medicines Prescribed</h3>
                                                <p className="text-xs sm:text-sm">No medicine prescriptions found for this patient.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Appointments Tab */}
                            <TabsContent value="appointments" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Appointment History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table className="min-w-full">
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="whitespace-nowrap">Date & Time</TableHead>
                                                        <TableHead className="whitespace-nowrap">Treatment Type</TableHead>
                                                        <TableHead className="whitespace-nowrap">Dentist</TableHead>
                                                        <TableHead className="whitespace-nowrap">Duration</TableHead>
                                                        <TableHead className="whitespace-nowrap">Status</TableHead>
                                                        <TableHead className="whitespace-nowrap">Notes</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {appointments.map((appointment) => (
                                                        <TableRow key={appointment.id}>
                                                            <TableCell className="whitespace-nowrap">
                                                                <div>
                                                                    <div className="font-medium text-sm sm:text-base">
                                                                        {new Date(appointment.appointment_date).toLocaleDateString()}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">{appointment.appointment_time}</div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap">
                                                                {appointment.treatment_type || "General Consultation"}
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap">{appointment.dentist_name}</TableCell>
                                                            <TableCell className="whitespace-nowrap">{appointment.duration_minutes} min</TableCell>
                                                            <TableCell>
                                                                <Badge className={`text-xs sm:text-sm ${getStatusColor(appointment.status)}`}>
                                                                    {getStatusIcon(appointment.status)}
                                                                    <span className="ml-1">{appointment.status.replace("_", " ")}</span>
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="max-w-[150px] sm:max-w-[200px] truncate text-xs sm:text-sm" title={appointment.notes}>
                                                                    {appointment.notes || "No notes"}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        {appointments.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                No appointments recorded for this patient
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Treatment Plans Tab */}
                            <TabsContent value="plans" className="space-y-4">
                                <div className="grid gap-3 sm:gap-4">
                                    {treatmentPlans.map((plan) => (
                                        <Card key={plan.id}>
                                            <CardHeader>
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                    <div>
                                                        <CardTitle className="text-base sm:text-lg">Treatment Plan #{plan.id}</CardTitle>
                                                        <p className="text-xs sm:text-sm text-gray-500">
                                                            Created on {new Date(plan.created_at).toLocaleDateString()} by {plan.dentist_name}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Badge className={`text-xs sm:text-sm ${getStatusColor(plan.status)}`}>
                                                            {plan.status.replace("_", " ")}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs sm:text-sm ${plan.priority === "urgent"
                                                                ? "border-red-500 text-red-700"
                                                                : plan.priority === "high"
                                                                    ? "border-orange-500 text-orange-700"
                                                                    : plan.priority === "medium"
                                                                        ? "border-yellow-500 text-yellow-700"
                                                                        : "border-green-500 text-green-700"
                                                                }`}
                                                        >
                                                            {plan.priority} priority
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3 sm:space-y-4">
                                                <div>
                                                    <h4 className="font-medium text-sm sm:text-base mb-1 sm:mb-2">Diagnosis</h4>
                                                    <p className="text-gray-700 bg-gray-50 p-2 sm:p-3 rounded text-xs sm:text-sm">{plan.diagnosis}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-sm sm:text-base mb-1 sm:mb-2">Treatment Description</h4>
                                                    <p className="text-gray-700 bg-gray-50 p-2 sm:p-3 rounded text-xs sm:text-sm">{plan.treatment_description}</p>
                                                </div>
                                                {plan.estimated_cost && (
                                                    <div className="flex justify-between items-center pt-2 sm:pt-3 border-t">
                                                        <span className="font-medium text-sm sm:text-base">Estimated Cost:</span>
                                                        <span className="text-base sm:text-lg font-bold text-green-600">
                                                            ₹{Number(plan.estimated_cost).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {treatmentPlans.length === 0 && (
                                        <Card>
                                            <CardContent className="text-center py-8 text-gray-500">
                                                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                No treatment plans created for this patient
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Medical Information Tab */}
                            <TabsContent value="medical" className="space-y-4">
                                <div className="grid gap-3 sm:gap-4">
                                    {/* Emergency Contact */}
                                    {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Emergency Contact</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                {patient.emergency_contact_name && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-sm sm:text-base">Name:</span>
                                                        <span className="text-sm sm:text-base">{patient.emergency_contact_name}</span>
                                                    </div>
                                                )}
                                                {patient.emergency_contact_phone && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-sm sm:text-base">Phone:</span>
                                                        <span className="text-sm sm:text-base">{patient.emergency_contact_phone}</span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Insurance Information */}
                                    {(patient.insurance_provider || patient.insurance_policy_number) && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Insurance Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                {patient.insurance_provider && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-sm sm:text-base">Provider:</span>
                                                        <span className="text-sm sm:text-base">{patient.insurance_provider}</span>
                                                    </div>
                                                )}
                                                {patient.insurance_policy_number && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-sm sm:text-base">Policy Number:</span>
                                                        <span className="text-sm sm:text-base">{patient.insurance_policy_number}</span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Medical History */}
                                    {patient.medical_history && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Medical History</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 sm:p-4 rounded text-sm">
                                                    {patient.medical_history}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Allergies */}
                                    {patient.allergies && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-red-600 text-lg">Allergies</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-gray-700 whitespace-pre-wrap bg-red-50 p-3 sm:p-4 rounded border border-red-200 text-sm">
                                                    {patient.allergies}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Current Medications */}
                                    {patient.current_medications && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Current Medications</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-gray-700 whitespace-pre-wrap bg-blue-50 p-3 sm:p-4 rounded text-sm">
                                                    {patient.current_medications}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* If no medical information */}
                                    {!patient.medical_history &&
                                        !patient.allergies &&
                                        !patient.current_medications &&
                                        !patient.emergency_contact_name &&
                                        !patient.insurance_provider && (
                                            <Card>
                                                <CardContent className="text-center py-8 text-gray-500">
                                                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                    No medical information recorded for this patient
                                                </CardContent>
                                            </Card>
                                        )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>

            {/* Photo Modal */}
            <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] p-1 sm:p-2">
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
        </>
    )
}