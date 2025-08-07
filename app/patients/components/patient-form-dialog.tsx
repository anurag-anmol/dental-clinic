"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, Phone, Shield, FileText } from "lucide-react"
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

interface PatientFormDialogProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    mode: "add" | "edit"
    patient?: Patient | null
}

export function PatientFormDialog({ isOpen, onClose, onSuccess, mode, patient }: PatientFormDialogProps) {
    const { toast } = useToast()
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

    // Reset form when dialog opens/closes or mode changes
    useEffect(() => {
        if (isOpen) {
            if (mode === "edit" && patient) {
                setFormData({
                    firstName: patient.first_name || "",
                    lastName: patient.last_name || "",
                    email: patient.email || "",
                    phone: patient.phone || "",
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
            } else {
                // Reset form for add mode
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
            }
        }
    }, [isOpen, mode, patient])

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const url = mode === "add" ? "/api/patients" : `/api/patients/${patient?.id}`
            const method = mode === "add" ? "POST" : "PUT"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email || null,
                    phone: formData.phone,
                    dateOfBirth: formData.dateOfBirth || null,
                    gender: formData.gender || null,
                    address: formData.address || null,
                    emergencyContactName: formData.emergencyContactName || null,
                    emergencyContactPhone: formData.emergencyContactPhone || null,
                    insuranceProvider: formData.insuranceProvider || null,
                    insurancePolicyNumber: formData.insurancePolicyNumber || null,
                    medicalHistory: formData.medicalHistory || null,
                    allergies: formData.allergies || null,
                    currentMedications: formData.currentMedications || null,
                }),
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: `Patient ${mode === "add" ? "added" : "updated"} successfully!`,
                })
                onSuccess()
            } else {
                const errorData = await response.json()
                toast({
                    title: "Error",
                    description: errorData.error || `Failed to ${mode} patient.`,
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error(`Error ${mode}ing patient:`, error)
            toast({
                title: "Error",
                description: `An unexpected error occurred while ${mode}ing the patient.`,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {mode === "add" ? "Add New Patient" : `Edit Patient - ${patient?.first_name} ${patient?.last_name}`}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "add" ? "Enter patient information to create a new record" : "Update patient information below"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="contact">Contact</TabsTrigger>
                            <TabsTrigger value="insurance">Insurance</TabsTrigger>
                            <TabsTrigger value="medical">Medical</TabsTrigger>
                        </TabsList>

                        {/* Basic Information Tab */}
                        <TabsContent value="basic" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
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
                                            placeholder="Enter full address"
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Contact Information Tab */}
                        <TabsContent value="contact" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                            placeholder="Enter phone number"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                    <div className="space-y-2wha">
                                        <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                                        <Input
                                            id="emergencyContactName"
                                            value={formData.emergencyContactName}
                                            onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                                            placeholder="Enter emergency contact name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                                        <Input
                                            id="emergencyContactPhone"
                                            value={formData.emergencyContactPhone}
                                            onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                                            placeholder="Enter emergency contact phone"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Insurance Information Tab */}
                        <TabsContent value="insurance" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Insurance Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                                        <Input
                                            id="insuranceProvider"
                                            value={formData.insuranceProvider}
                                            onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
                                            placeholder="Enter insurance provider name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                                        <Input
                                            id="insurancePolicyNumber"
                                            value={formData.insurancePolicyNumber}
                                            onChange={(e) => handleInputChange("insurancePolicyNumber", e.target.value)}
                                            placeholder="Enter policy number"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Medical Information Tab */}
                        <TabsContent value="medical" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Medical Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="medicalHistory">Medical History</Label>
                                        <Textarea
                                            id="medicalHistory"
                                            value={formData.medicalHistory}
                                            onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                                            placeholder="Enter patient's medical history, previous surgeries, chronic conditions, etc."
                                            rows={4}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="allergies" className="text-red-600 font-medium">
                                            Allergies (Important!)
                                        </Label>
                                        <Textarea
                                            id="allergies"
                                            value={formData.allergies}
                                            onChange={(e) => handleInputChange("allergies", e.target.value)}
                                            placeholder="List any known allergies (medications, materials, foods, etc.)"
                                            rows={3}
                                            className="border-red-200 focus:border-red-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currentMedications">Current Medications</Label>
                                        <Textarea
                                            id="currentMedications"
                                            value={formData.currentMedications}
                                            onChange={(e) => handleInputChange("currentMedications", e.target.value)}
                                            placeholder="List current medications, dosages, and frequency"
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === "add" ? "Add Patient" : "Update Patient"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
