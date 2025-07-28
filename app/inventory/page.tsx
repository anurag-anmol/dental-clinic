"use client"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Package, Plus, Edit, AlertTriangle, Search, TrendingDown, TrendingUp, Loader2, Smile } from "lucide-react"
import { Layout } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"

interface InventoryItem {
  id: number
  item_name: string
  category: string
  current_stock: number
  minimum_stock: number
  unit_price: number
  supplier: string
  expiry_date: string | null
  status: "in_stock" | "low_stock" | "critical" | "out_of_stock"
}

export default function InventoryPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const [isEditItemOpen, setIsEditItemOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }
  const handleEditClick = (item: InventoryItem) => {
    setFormData({
      itemName: item.item_name,
      category: item.category,
      currentStock: item.current_stock.toString(),
      minimumStock: item.minimum_stock.toString(),
      unitPrice: item.unit_price.toString(),
      supplier: item.supplier || "",
      expiryDate: item.expiry_date || "",
    })
    setEditingItemId(item.id)
    setIsEditItemOpen(true)
  }


  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    currentStock: "",
    minimumStock: "",
    unitPrice: "",
    supplier: "",
    expiryDate: "",
  })

  const fetchInventoryItems = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus,
      }).toString()
      const response = await fetch(`/api/inventory?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setInventoryItems(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch inventory items.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching inventory.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory, selectedStatus, toast])

  useEffect(() => {
    fetchInventoryItems()
  }, [fetchInventoryItems])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const method = editingItemId ? "PUT" : "POST"
    const url = editingItemId ? `/api/inventory/${editingItemId}` : "/api/inventory"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          currentStock: Number(formData.currentStock),
          minimumStock: Number(formData.minimumStock),
          unitPrice: Number(formData.unitPrice),
        }),
      })


      if (response.ok) {
        toast({
          title: "Success",
          description: editingItemId ? "Item updated!" : "Item added!",
        })
        setFormData({
          itemName: "",
          category: "",
          currentStock: "",
          minimumStock: "",
          unitPrice: "",
          supplier: "",
          expiryDate: "",
        })
        setIsAddItemOpen(false)
        setIsEditItemOpen(false)
        setEditingItemId(null)
        fetchInventoryItems()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Operation failed.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting item:", error)
      toast({
        title: "Error",
        description: "Unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800"
      case "low_stock":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      case "out_of_stock":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStockPercentage = (current: number, minimum: number) => {
    if (minimum === 0) return current > 0 ? 100 : 0 // Avoid division by zero, if min is 0, any stock is 100%
    return Math.min((current / (minimum * 2)) * 100, 100)
  }

  // Calculate stats from fetched data
  const totalItems = inventoryItems.length
  const lowStockItems = inventoryItems.filter((item) => item.status === "low_stock").length
  const criticalItems = inventoryItems.filter((item) => item.status === "critical").length
  const totalValue = inventoryItems.reduce((sum, item) => sum + item.current_stock * item.unit_price, 0)

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
            <p className="text-gray-600">Track supplies, equipment, and stock levels</p>
          </div>
          <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
                <DialogDescription>Add a new item to your inventory</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemName">Item Name *</Label>
                    <Input
                      id="itemName"
                      value={formData.itemName}
                      onChange={(e) => handleInputChange("itemName", e.target.value)}
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PPE">PPE</SelectItem>
                        <SelectItem value="Restorative">Restorative</SelectItem>
                        <SelectItem value="Anesthesia">Anesthesia</SelectItem>
                        <SelectItem value="Instruments">Instruments</SelectItem>
                        <SelectItem value="Imaging">Imaging</SelectItem>
                        <SelectItem value="Cleaning">Cleaning</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentStock">Current Stock *</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => handleInputChange("currentStock", e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumStock">Minimum Stock *</Label>
                    <Input
                      id="minimumStock"
                      type="number"
                      value={formData.minimumStock}
                      onChange={(e) => handleInputChange("minimumStock", e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit Price *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => handleInputChange("unitPrice", e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => handleInputChange("supplier", e.target.value)}
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddItemOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Inventory Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold">{totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold">{lowStockItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Critical</p>
                  <p className="text-2xl font-bold">{criticalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
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
                    placeholder="Search items by name, category, or supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="PPE">PPE</SelectItem>
                    <SelectItem value="Restorative">Restorative</SelectItem>
                    <SelectItem value="Anesthesia">Anesthesia</SelectItem>
                    <SelectItem value="Instruments">Instruments</SelectItem>
                    <SelectItem value="Imaging">Imaging</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>{inventoryItems.length} items found</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Smile className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-gray-500 mt-2">Loading inventory...</p>
              </div>
            ) : inventoryItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No inventory items found for the selected criteria.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.item_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              {item.current_stock} / {item.minimum_stock} min
                            </span>
                          </div>
                          <Progress
                            value={getStockPercentage(item.current_stock, item.minimum_stock)}
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>₹{Number(item.unit_price).toFixed(2)}</TableCell>
                      <TableCell>${(item.current_stock * item.unit_price).toFixed(2)}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>
                        {item.expiry_date ? (
                          <div className="text-sm">{new Date(item.expiry_date).toLocaleDateString()}</div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>{item.status.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="success" size="sm" onClick={() => handleEditClick(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => console.log("Show details for:", item.id)}>
                            <Package className="h-4 w-4" />
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

        <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
              <DialogDescription>Update the details of this item</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Item Name</Label>
                    <Input name="itemName" value={formData.itemName} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input name="category" value={formData.category} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Stock</Label>
                    <Input name="currentStock" value={formData.currentStock} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>Minimum Stock</Label>
                    <Input name="minimumStock" value={formData.minimumStock} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>Unit Price</Label>
                    <Input name="unitPrice" value={formData.unitPrice} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Supplier</Label>
                    <Input name="supplier" value={formData.supplier} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditItemOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Item
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>


      </div>
    </Layout>
  )
}
