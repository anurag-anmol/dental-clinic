"use client"

import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"

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
  DialogTitle, DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Plus, Edit, Eye, Search, CreditCard, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Layout } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

interface Invoice {
  id: number
  invoice_number: string
  patient_name: string
  patient_id: string
  date: string
  due_date: string
  total_amount: number
  paid_amount: number
  balance_amount: number
  status: string
  notes: string
  payment_method: string
}

interface Payment {
  id: number
  invoice_id: number
  invoice_number: string
  patient_name: string
  amount: number
  payment_method: string
  payment_date: string
  transaction_id: string
}

interface Patient {
  id: number
  first_name: string
  last_name: string
  patient_id: string
}

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export default function BillingPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState("all")
  const [selectedInvoiceDate, setSelectedInvoiceDate] = useState("")

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false)

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  const [isViewInvoiceOpen, setIsViewInvoiceOpen] = useState(false)
  const [isEditInvoiceOpen, setIsEditInvoiceOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)



  const [invoiceFormData, setInvoiceFormData] = useState<{
    patientId: string
    dueDate: string
    items: InvoiceItem[]
    paymentMethod: string
    totalAmount: number
    notes: string
  }>({
    patientId: "",
    dueDate: new Date().toISOString().split("T")[0],
    items: [{ description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
    paymentMethod: "",
    totalAmount: 0,
    notes: "",
  })

  const fetchInvoices = useCallback(async () => {
    setLoadingInvoices(true)
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        status: selectedInvoiceStatus,
        date: selectedInvoiceDate,
      }).toString()
      const response = await fetch(`/api/invoices?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch invoices.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching invoices.",
        variant: "destructive",
      })
    } finally {
      setLoadingInvoices(false)
    }
  }, [searchTerm, selectedInvoiceStatus, selectedInvoiceDate, toast])

  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true)
    try {
      const response = await fetch("/api/payments") // Add search/filter params if needed
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch payments.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching payments.",
        variant: "destructive",
      })
    } finally {
      setLoadingPayments(false)
    }
  }, [toast])

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

  useEffect(() => {
    fetchInvoices()
    fetchPayments()
  }, [fetchInvoices, fetchPayments])

  useEffect(() => {
    if (isCreateInvoiceOpen) {
      fetchPatients()
    }
  }, [isCreateInvoiceOpen, fetchPatients])

  const handleInvoiceFormChange = (field: string, value: any) => {
    setInvoiceFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...invoiceFormData.items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Calculate total price for the item
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice
    }

    // Calculate overall total amount
    const newTotalAmount = newItems.reduce((sum, item) => sum + item.totalPrice, 0)

    setInvoiceFormData((prev) => ({
      ...prev,
      items: newItems,
      totalAmount: newTotalAmount,
    }))
  }

  const handleAddItem = () => {
    setInvoiceFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
    }))
  }

  const handleRemoveItem = (index: number) => {
    const newItems = invoiceFormData.items.filter((_, i) => i !== index)
    const newTotalAmount = newItems.reduce((sum, item) => sum + item.totalPrice, 0)
    setInvoiceFormData((prev) => ({
      ...prev,
      items: newItems,
      totalAmount: newTotalAmount,
    }))
  }

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingInvoice(true)
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...invoiceFormData,
          patientId: Number(invoiceFormData.patientId),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Invoice created successfully!",
        })
        setIsCreateInvoiceOpen(false)
        setInvoiceFormData({
          patientId: "",
          dueDate: new Date().toISOString().split("T")[0],
          items: [{ description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
          paymentMethod: "",
          totalAmount: 0,
          notes: "",
        })
        fetchInvoices()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to create invoice.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating invoice:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the invoice.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingInvoice(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "partial":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "partial":
        return <Clock className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "overdue":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Calculate totals from fetched data
  // const totalRevenue = inppnvoices.reduce((sum, invoice) => sum + invoice.paid_amount, 0)
  const totalRevenue = 5000;
  const pendingAmount = invoices.reduce((sum, invoice) => sum + invoice.balance_amount, 0)
  const overdueAmount = invoices
    .filter((inv) => inv.status === "overdue")
    .reduce((sum, invoice) => sum + invoice.balance_amount, 0)

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Billing & Pa yments</h2>
            <p className="text-gray-600">Manage invoices, payments, and financial records</p>
          </div>
          <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>Generate an invoice for patient treatments</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateInvoiceSubmit}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient *</Label>
                    <Select
                      value={invoiceFormData.patientId}
                      onValueChange={(value) => handleInvoiceFormChange("patientId", value)}
                      required
                    >
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
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoiceFormData.dueDate}
                      onChange={(e) => handleInvoiceFormChange("dueDate", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Treatment Items *</Label>
                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-600">
                        <div>Description</div>
                        <div>Quantity</div>
                        <div>Unit Price</div>
                        <div>Total</div>
                      </div>
                      {invoiceFormData.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 items-center">
                          <Input
                            placeholder="Treatment description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            required
                          />
                          <Input
                            type="number"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                            min="1"
                            required
                          />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, "unitPrice", Number(e.target.value))}
                            required
                          />
                          <div className="flex items-center">
                            <Input placeholder="0.00" value={item.totalPrice.toFixed(2)} disabled />
                            {invoiceFormData.items.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(index)}
                                className="ml-2"
                              >
                                X
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                        Add Item
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={invoiceFormData.paymentMethod}
                      onValueChange={(value) => handleInvoiceFormChange("paymentMethod", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalAmount">Total Amount</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={invoiceFormData.totalAmount.toFixed(2)}
                      disabled
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={invoiceFormData.notes}
                      onChange={(e) => handleInvoiceFormChange("notes", e.target.value)}
                      placeholder="Additional notes for the invoice"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateInvoiceOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmittingInvoice}>
                    {isSubmittingInvoice && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Invoice
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold"> ₹{new Intl.NumberFormat("en-IN", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  }).format(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                  <p className="text-2xl font-bold">₹{overdueAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold">
                    ₹{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Invoices and Payments */}
        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="insurance">Insurance Claims</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search invoices by patient name or invoice number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedInvoiceStatus} onValueChange={setSelectedInvoiceStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      className="w-40"
                      value={selectedInvoiceDate}
                      onChange={(e) => setSelectedInvoiceDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoices Table */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Records</CardTitle>
                <CardDescription>{invoices.length} invoices found</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingInvoices ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-500 mt-2">Loading invoices...</p>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No invoices found for the selected criteria.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{invoice.patient_name}</div>
                              <div className="text-sm text-gray-500">{invoice.patient_id}</div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                          <TableCell>₹{Number(invoice.total_amount).toFixed(2)}</TableCell>
                          <TableCell>₹{Number(invoice.total_amount).toFixed(2)}</TableCell>
                          <TableCell>₹{Number(invoice.total_amount).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(invoice.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(invoice.status)}
                                <span>{invoice.status}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(invoice)
                                  setIsViewInvoiceOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(invoice)
                                  setIsEditInvoiceOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(invoice)
                                  setIsPaymentDialogOpen(true)
                                }}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>

                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Recent payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPayments ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-500 mt-2">Loading payments...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No payments found.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.invoice_number}</TableCell>
                          <TableCell>{payment.patient_name}</TableCell>
                          <TableCell>₹{Number(payment.amount).toFixed(2)}</TableCell>
                          <TableCell>{payment.payment_method}</TableCell>
                          <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                          <TableCell>{payment.transaction_id || "N/A"}</TableCell>
                          <TableCell>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment)
                                setIsViewInvoiceOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insurance">
            <Card>
              <CardHeader>
                <CardTitle>Insurance Claims</CardTitle>
                <CardDescription>Track insurance claim submissions and approvals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">Insurance claims management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isViewInvoiceOpen} onOpenChange={setIsViewInvoiceOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>
            {selectedInvoice ? (
              <div>
                <p><strong>Invoice #: </strong>{selectedInvoice.invoice_number}</p>
                <p><strong>Patient: </strong>{selectedInvoice.patient_name}</p>
                <p><strong>Status: </strong>{selectedInvoice.status}</p>
                <p><strong>Total: </strong>₹{Number(selectedInvoice.total_amount).toFixed(2)}</p>
                <p><strong>Paid: </strong>₹{Number(selectedInvoice.paid_amount).toFixed(2)}</p>
                <p><strong>Balance: </strong>₹{Number(selectedInvoice.balance_amount).toFixed(2)}</p>
                <p><strong>Notes:</strong> {selectedInvoice.notes || "N/A"}</p>
              </div>
            ) : (
              <p>Loading invoice...</p>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isEditInvoiceOpen} onOpenChange={setIsEditInvoiceOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Invoice</DialogTitle>
            </DialogHeader>
            {selectedInvoice ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setIsSubmittingInvoice(true)

                  const response = await fetch(`/api/invoices/${selectedInvoice.id}`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(selectedInvoice),
                  })

                  if (response.ok) {
                    toast({ title: "Success", description: "Invoice updated." })
                    setIsEditInvoiceOpen(false)
                    fetchInvoices()
                  } else {
                    toast({
                      title: "Error",
                      description: "Failed to update invoice.",
                      variant: "destructive",
                    })
                  }

                  setIsSubmittingInvoice(false)
                }}
              >
                <div className="space-y-4">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={selectedInvoice.notes}
                    onChange={(e) =>
                      setSelectedInvoice({ ...selectedInvoice, notes: e.target.value })
                    }
                  />

                  <Label>Status</Label>
                  <Select
                    value={selectedInvoice.status}
                    onValueChange={(value) =>
                      setSelectedInvoice({ ...selectedInvoice, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsEditInvoiceOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmittingInvoice}>
                    {isSubmittingInvoice && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <p>Loading invoice data...</p>
            )}
          </DialogContent>
        </Dialog>


        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>

            {selectedInvoice ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()

                  const paymentAmount = selectedInvoice.balance_amount
                  const paymentMethod = "cash" // you can use Select instead for dynamic input

                  const res = await fetch(`/api/payments`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      invoiceId: selectedInvoice.id,
                      amount: paymentAmount,
                      paymentMethod,
                      paymentDate: new Date().toISOString(),
                      transactionId: `TXN-${Date.now()}`,
                    }),
                  })

                  if (res.ok) {
                    toast({ title: "Payment Recorded", description: "Payment successfully recorded." })
                    setIsPaymentDialogOpen(false)
                    fetchInvoices()
                    fetchPayments()
                  } else {
                    toast({ title: "Error", description: "Failed to record payment", variant: "destructive" })
                  }
                }}
              >
                <div className="space-y-4">
                  <p><strong>Invoice:</strong> #{selectedInvoice.invoice_number}</p>
                  <p><strong>Outstanding Balance:</strong> ₹{Number(selectedInvoice.balance_amount).toFixed(2)}</p>

                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    onValueChange={(method) =>
                      setSelectedInvoice((prev) =>
                        prev ? { ...prev, payment_method: method } : prev
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Record Full Payment
                  </Button>
                </div>
              </form>
            ) : (
              <p>Loading payment form...</p>
            )}
          </DialogContent>
        </Dialog>



      </div>
    </Layout>
  )
}
