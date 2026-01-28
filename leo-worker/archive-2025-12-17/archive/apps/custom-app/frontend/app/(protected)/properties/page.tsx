"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/contexts/auth-context"
import { type Property } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { 
  Plus, 
  Home, 
  MapPin, 
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Camera
} from "lucide-react"

export default function PropertiesPage() {
  const router = useRouter()
  const { currentProperty, setCurrentProperty } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    address: '',
    unit_number: '',
    property_type: 'apartment',
    bedrooms: '',
    bathrooms: '',
    monthly_rent: '',
    move_in_date: '',
    landlord_name: '',
    landlord_email: '',
    landlord_phone: '',
  })

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      const data = await apiClient.getProperties()
      setProperties(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProperty = async () => {
    // Validate required fields
    if (!formData.address || !formData.bedrooms || !formData.bathrooms || !formData.monthly_rent || !formData.move_in_date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const property = await apiClient.createProperty({
        ...formData,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        monthly_rent: parseFloat(formData.monthly_rent),
      })
      
      setProperties([...properties, property])
      setShowAddModal(false)
      resetForm()
      
      toast({
        title: "Property added",
        description: "Your property has been added successfully",
      })
      
      // Set as current property if it's the first one
      if (properties.length === 0) {
        setCurrentProperty(property)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add property",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return

    try {
      await apiClient.deleteProperty(id)
      setProperties(properties.filter(p => p.id !== id))
      
      // If this was the current property, select another
      if (currentProperty?.id === id) {
        const remaining = properties.filter(p => p.id !== id)
        setCurrentProperty(remaining[0] || null)
      }
      
      toast({
        title: "Property deleted",
        description: "The property has been removed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      })
    }
  }

  const handleSetCurrent = (property: Property) => {
    setCurrentProperty(property)
    toast({
      title: "Current property updated",
      description: `${property.address} is now your current property`,
    })
  }

  const resetForm = () => {
    setFormData({
      address: '',
      unit_number: '',
      property_type: 'apartment',
      bedrooms: '',
      bathrooms: '',
      monthly_rent: '',
      move_in_date: '',
      landlord_name: '',
      landlord_email: '',
      landlord_phone: '',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Properties</h1>
          <p className="text-muted-foreground mt-1">
            Manage your rental properties and documentation
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Home className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Add your rental property to start documenting, tracking deposits, and managing disputes.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Property
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="relative">
              {currentProperty?.id === property.id && (
                <Badge className="absolute -top-2 -right-2 z-10" variant="default">
                  Current
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg">{property.address}</span>
                    </div>
                    {property.unit_number && (
                      <p className="text-sm text-muted-foreground">Unit {property.unit_number}</p>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{property.property_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rent</p>
                    <p className="font-medium">${property.monthly_rent}/mo</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Beds/Baths</p>
                    <p className="font-medium">{property.bedrooms}bd / {property.bathrooms}ba</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Move-in</p>
                    <p className="font-medium">{format(new Date(property.move_in_date), 'MMM yyyy')}</p>
                  </div>
                </div>
                
                {property.landlord_name && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Landlord</p>
                    <p className="font-medium">{property.landlord_name}</p>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  {currentProperty?.id !== property.id && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSetCurrent(property)}
                    >
                      Set as Current
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <Link href={`/documents/property/${property.id}`}>
                      <Camera className="h-4 w-4 mr-1" />
                      Document
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteProperty(property.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Enter your rental property information
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St, City, State ZIP"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit/Apt</Label>
                <Input
                  id="unit"
                  value={formData.unit_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit_number: e.target.value }))}
                  placeholder="2A"
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="type">Property Type *</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, property_type: value }))}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_family">Single Family Home</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="mobile_home">Mobile Home</SelectItem>
                    <SelectItem value="room">Room Rental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bedrooms">Bedrooms *</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                  placeholder="2"
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms *</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  step="0.5"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                  placeholder="1.5"
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="rent">Monthly Rent *</Label>
                <Input
                  id="rent"
                  type="number"
                  value={formData.monthly_rent}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_rent: e.target.value }))}
                  placeholder="1500"
                />
              </div>
              <div>
                <Label htmlFor="move_in">Move-in Date *</Label>
                <Input
                  id="move_in"
                  type="date"
                  value={formData.move_in_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, move_in_date: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Landlord Information (Optional)</h4>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="landlord_name">Landlord Name</Label>
                  <Input
                    id="landlord_name"
                    value={formData.landlord_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, landlord_name: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="landlord_email">Email</Label>
                    <Input
                      id="landlord_email"
                      type="email"
                      value={formData.landlord_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, landlord_email: e.target.value }))}
                      placeholder="landlord@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="landlord_phone">Phone</Label>
                    <Input
                      id="landlord_phone"
                      type="tel"
                      value={formData.landlord_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, landlord_phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddModal(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddProperty}>
              Add Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}