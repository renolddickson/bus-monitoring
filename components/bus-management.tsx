"use client"

import { useState } from "react"
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Bus, Route } from "@/lib/types"
import { BusIcon, PlusCircle, Pencil, MapPin, Trash2 } from "lucide-react"

interface BusManagementProps {
  db: any
  buses: Bus[]
  routes: Route[]
  selectedBus: Bus | null
  setSelectedBus: (bus: Bus | null) => void
}

export function BusManagement({ db, buses, routes, selectedBus, setSelectedBus }: BusManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Bus>>({
    busId: "",
    name: "",
    routeId: "",
    capacity: 40,
    status: "active"
  })
  const [isEditing, setIsEditing] = useState(false)

  const handleOpenDialog = (bus?: Bus) => {
    if (bus) {
      setFormData({
        busId: bus.busId,
        name: bus.name,
        routeId: bus.routeId,
        capacity: bus.capacity,
        status: bus.status
      })
      setIsEditing(true)
    } else {
      setFormData({
        busId: "",
        name: "",
        routeId: "",
        capacity: 40,
        status: "active"
      })
      setIsEditing(false)
    }
    setIsDialogOpen(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isEditing && selectedBus) {
        // Update existing bus
        await updateDoc(doc(db, "buses", selectedBus.id), {
          ...formData,
          capacity: Number(formData.capacity) || 40,
          updatedAt: new Date().toISOString()
        })
      } else {
        // Add new bus
        await addDoc(collection(db, "buses"), {
          ...formData,
          capacity: Number(formData.capacity) || 40,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        
        // Also create a bus location entry
        await addDoc(collection(db, "busLocations"), {
          busId: formData.busId,
          active: false,
          latitude: 0,
          longitude: 0,
          lastPassedStopOrder: 0,
          updatedAt: new Date().toISOString()
        })
      }
      
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving bus:", error)
    }
  }

  const handleDelete = async () => {
    if (!selectedBus) return
    
    try {
      // Delete the bus document
      await deleteDoc(doc(db, "buses", selectedBus.id))
      
      // Delete the bus location document
      // In a real app, you would query for the location first
      const locationsQuery = collection(db, "busLocations")
      // TODO: Implement query to find and delete bus location
      
      setIsAlertOpen(false)
      setSelectedBus(null)
    } catch (error) {
      console.error("Error deleting bus:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bus Fleet Management</h2>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Bus
        </Button>
      </div>
      
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Bus Fleet</CardTitle>
          <CardDescription>Manage your bus fleet and assign routes</CardDescription>
        </CardHeader>
        <CardContent>
          {buses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BusIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No buses found</h3>
              <p className="mb-4">Start by adding a new bus to your fleet</p>
              <Button onClick={() => handleOpenDialog()}>Add New Bus</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.map((bus) => {
                  const route = routes.find(r => r.id === bus.routeId)
                  return (
                    <TableRow 
                      key={bus.id} 
                      className={selectedBus?.id === bus.id ? "bg-blue-50" : ""}
                      onClick={() => setSelectedBus(bus)}
                    >
                      <TableCell className="font-medium">{bus.busId}</TableCell>
                      <TableCell>{bus.name}</TableCell>
                      <TableCell>
                        {route ? (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                            {route.name}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>{bus.capacity || 40} seats</TableCell>
                      <TableCell>
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bus.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {bus.status || 'inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedBus(bus)
                            handleOpenDialog(bus)
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedBus(bus)
                            setIsAlertOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Bus Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Bus" : "Add New Bus"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update bus information in your fleet." : "Add a new bus to your fleet."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="busId">Bus ID</Label>
                  <Input
                    id="busId"
                    name="busId"
                    value={formData.busId || ""}
                    onChange={handleChange}
                    placeholder="TN-01-2345"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Bus Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    placeholder="City Express 42"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="routeId">Assign Route</Label>
                <Select 
                  value={formData.routeId || ""} 
                  onValueChange={(value) => handleSelectChange("routeId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">None</SelectItem>
                    {routes.map(route => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (Seats)</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.capacity || 40}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status || "active"} 
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Bus" : "Add Bus"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Alert */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bus</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bus? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}