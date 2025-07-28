// components/appointment-form.tsx
"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface AppointmentFormProps {
    mode: "add" | "edit"
    initialData?: any
    patients: any[]
    dentists: any[]
    onSubmit: (formData: any) => Promise<void>
    onCancel: () => void
    loading?: boolean
}

export function AppointmentForm({
    mode,
    initialData,
    patients,
    dentists,
    onSubmit,
    onCancel,
    loading,
}: AppointmentFormProps) {
    const [formData, setFormData] = useState({
        patientId: "",
        dentistId: "",
        appointmentDate: "",
        appointmentTime: "",
        duration: "60",
        treatmentType: "",
        notes: "",
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                patientId: initialData.patient_id_fk?.toString() || "",
                dentistId: initialData.dentist_id?.toString() || "",
                appointmentDate: initialData.appointment_date || "",
                appointmentTime: initialData.appointment_time || "",
                duration: initialData.duration_minutes?.toString() || "60",
                treatmentType: initialData.treatment_type || "",
                notes: initialData.notes || "",
            })
        }
    }, [initialData])

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit({
            ...formData,
            patientId: Number(formData.patientId),
            dentistId: Number(formData.dentistId),
            duration: Number(formData.duration),
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                    <Label>Patient *</Label>
                    <Select value={formData.patientId} onValueChange={(v) => handleChange("patientId", v)}>
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
                    <Select value={formData.dentistId} onValueChange={(v) => handleChange("dentistId", v)}>
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
                    <Input type="date" value={formData.appointmentDate} onChange={(e) => handleChange("appointmentDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Time *</Label>
                    <Input type="time" value={formData.appointmentTime} onChange={(e) => handleChange("appointmentTime", e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Duration *</Label>
                    <Select value={formData.duration} onValueChange={(v) => handleChange("duration", v)}>
                        <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="60">60 min</SelectItem>
                            <SelectItem value="90">90 min</SelectItem>
                            <SelectItem value="120">120 min</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Treatment</Label>
                    <Input value={formData.treatmentType} onChange={(e) => handleChange("treatmentType", e.target.value)} />
                </div>
                <div className="col-span-2 space-y-2">
                    <Label>Notes</Label>
                    <Textarea value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} />
                </div>
            </div>
            <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {mode === "edit" ? "Update" : "Book"} Appointment
                </Button>
            </div>
        </form>
    )
}
