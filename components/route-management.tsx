"use client"

import { useState } from "react"
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Route, Stop } from "@/lib/types"
import { MapIcon, PlusCircle, Pencil, Trash2, MoveUp, MoveDown, Music } from "lucide-react"

interface RouteManagementProps {
  db: any
  routes: Route[]
  selectedRoute: Route | null
  setSelectedRoute: (route: Route | null) => void
}

export function RouteManagement({ db, routes, selectedRoute, setSelectedRoute }: RouteManagementProps) {
  const [activeTab, setActiveTab] = useState("routes")
  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false)
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false)
  const [isRouteAlertOpen, setIsRouteAlertOpen] = useState(false)
  const [isStopAlertOpen, setIsStopAlertOpen] = useState(false)
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null)
  const [isEditingRoute, setIsEditingRoute] = useState(false)
  const [isEditingStop, setIsEditingStop] = useState(false)
  
  const [routeFormData, setRouteFormData] = useState<Partial<Route>>({
    name: "",
    description: "",
    color: "#3b82f6",
    stops: []
  })
  
  const [stopFormData, setStopFormData] = useState<Partial<Stop>>({
    name: "",
    latitude: 0,
    longitude: 0,
    order: 0,
    description: ""
  })
  
  const [audioFile, setAudioFile] = useState<File | null>(null)

  // Route form handlers
  const handleOpenRouteDialog = (route?: Route) => {
    if (route) {
      setRouteFormData({
        name: route.name,
        description: route.description,
        color: route.color
      })
      setIsEditingRoute(true)
    } else {
      setRouteFormData({
        name: "",
        description: "",
        color: "#3b82f6",
        stops: []
      })
      setIsEditingRoute(false)
    }
    setIsRouteDialogOpen(true)
  }

  const handleRouteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRouteFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isEditingRoute && selectedRoute) {
        // Update existing route
        await updateDoc(doc(db, "routes", selectedRoute.id), {
          ...routeFormData,
          updatedAt: new Date().toISOString()
        })
      } else {
        // Add new route
        const routeDoc = await addDoc(collection(db, "routes"), {
          ...routeFormData,
          stops: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        
        // Select the new route
        setSelectedRoute({
          ...routeFormData as Route,
          id: routeDoc.id,
          stops: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        setActiveTab("stops")
      }
      
      setIsRouteDialogOpen(false)
    } catch (error) {
      console.error("Error saving route:", error)
    }
  }

  const handleDeleteRoute = async () => {
    if (!selectedRoute) return
    
    try {
      // Delete the route document
      await deleteDoc(doc(db, "routes", selectedRoute.id))
      
      // Update any buses using this route to have no route
      // In a real app you would query buses with this routeId and update them
      
      setIsRouteAlertOpen(false)
      setSelectedRoute(null)
    } catch (error) {
      console.error("Error deleting route:", error)
    }
  }

  // Stop form handlers
  const handleOpenStopDialog = (stop?: Stop) => {
    if (stop) {
      setStopFormData({
        name: stop.name,
        latitude: stop.latitude,
        longitude: stop.longitude,
        order: stop.order,
        description: stop.description || ""
      })
      setSelectedStop(stop)
      setIsEditingStop(true)
    } else {
      // For a new stop, set the order to be the next in sequence
      const nextOrder = selectedRoute?.stops.length 
        ? Math.max(...selectedRoute.stops.map(s => s.order)) + 1 
        : 1
      
      setStopFormData({
        name: "",
        latitude: 0,
        longitude: 0,
        order: nextOrder,
        description: ""
      })
      setSelectedStop(null)
      setIsEditingStop(false)
    }
    setAudioFile(null)
    setIsStopDialogOpen(true)
  }

  const handleStopChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setStopFormData((prev) => ({ 
      ...prev, 
      [name]: name === "latitude" || name === "longitude" || name === "order" 
        ? parseFloat(value) || 0 
        : value 
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0])
    }
  }

  const handleStopSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRoute) return
    
    try {
      let audioUrl = selectedStop?.audioUrl || ""
      
      // Upload audio file if provided
      if (audioFile) {
        const storage = getStorage()
        const storageRef = ref(storage, `audio/${selectedRoute.id}/${Date.now()}_${audioFile.name}`)
        await uploadBytes(storageRef, audioFile)
        audioUrl = await getDownloadURL(storageRef)
      }
      
      if (isEditingStop && selectedStop) {
        // Update existing stop within the route
        const updatedStops = [...selectedRoute.stops]
        const stopIndex = updatedStops.findIndex(s => s.id === selectedStop.id)
        
        if (stopIndex !== -1) {
          updatedStops[stopIndex] = {
            ...updatedStops[stopIndex],
            ...stopFormData,
            audioUrl
          } as Stop
          
          // Update the route with the modified stops array
          await updateDoc(doc(db, "routes", selectedRoute.id), {
            stops: updatedStops,
            updatedAt: new Date().toISOString()
          })
        }
      } else {
        // Add new stop to the route
        const newStop: Stop = {
          ...stopFormData as Required<Omit<typeof stopFormData, 'description'>> & { description?: string },
          id: `stop_${Date.now()}`, // Generate a temporary ID
          audioUrl,
          createdAt: new Date().toISOString()
        }
        
        const updatedStops = [...(selectedRoute.stops || []), newStop]
        
        // Update the route with the new stops array
        await updateDoc(doc(db, "routes", selectedRoute.id), {
          stops: updatedStops,
          updatedAt: new Date().toISOString()
        })
      }
      
      setIsStopDialogOpen(false)
    } catch (error) {
      console.error("Error saving stop:", error)
    }
  }

  const handleDeleteStop = async () => {
    if (!selectedRoute || !selectedStop) return
    
    try {
      // Filter out the selected stop
      const updatedStops = selectedRoute.stops.filter(stop => stop.id !== selectedStop.id)
      
      // Update the route with the modified stops array
      await updateDoc(doc(db, "routes", selectedRoute.id), {
        stops: updatedStops,
        updatedAt: new Date().toISOString()
      })
      
      setIsStopAlertOpen(false)
      setSelectedStop(null)
    } catch (error) {
      console.error("Error deleting stop:", error)
    }
  }

  const handleMoveStop = async (stopId: string, direction: 'up' | 'down') => {
    if (!selectedRoute) return
    
    try {
      const stops = [...selectedRoute.stops]
      const stopIndex = stops.findIndex(s => s.id === stopId)
      
      if (stopIndex === -1) return
      
      if (direction === 'up' && stopIndex > 0) {
        // Swap with the previous stop
        const temp = stops[stopIndex - 1].order
        stops[stopIndex - 1].order = stops[stopIndex].order
        stops[stopIndex].order = temp
      } else if (direction === 'down' && stopIndex < stops.length - 1) {
        // Swap with the next stop
        const temp = stops[stopIndex + 1].order
        stops[stopIndex + 1].order = stops[stopIndex].order
        stops[stopIndex].order = temp
      } else {
        return // Can't move further
      }
      
      // Sort stops by order
      stops.sort((a, b) => a.order - b.order)
      
      // Update the route with the reordered stops
      await updateDoc(doc(db, "routes", selectedRoute.id), {
        stops,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error reordering stops:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            {selectedRoute && <TabsTrigger value="stops">Stops</TabsTrigger>}
          </TabsList>
          
          {activeTab === "routes" ? (
            <Button onClick={() => handleOpenRouteDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Route
            </Button>
          ) : selectedRoute && (
            <Button onClick={() => handleOpenStopDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Stop
            </Button>
          )}
        </div>
        
        <TabsContent value="routes" className="space-y-4">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Routes</CardTitle>
              <CardDescription>Manage your bus routes</CardDescription>
            </CardHeader>
            <CardContent>
              {routes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MapIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No routes found</h3>
                  <p className="mb-4">Start by adding a new route</p>
                  <Button onClick={() => handleOpenRouteDialog()}>Add New Route</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Stops</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.map((route) => (
                      <TableRow 
                        key={route.id} 
                        className={selectedRoute?.id === route.id ? "bg-blue-50" : ""}
                        onClick={() => {
                          setSelectedRoute(route)
                          setActiveTab("stops")
                        }}
                      >
                        <TableCell className="font-medium">{route.name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {route.description || "No description"}
                        </TableCell>
                        <TableCell>{route.stops?.length || 0} stops</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: route.color || "#3b82f6" }}
                            />
                            <span>{route.color || "#3b82f6"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedRoute(route)
                              handleOpenRouteDialog(route)
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
                              setSelectedRoute(route)
                              setIsRouteAlertOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
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
        
        <TabsContent value="stops" className="space-y-4">
          {selectedRoute ? (
            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{selectedRoute.name} - Stops</CardTitle>
                  <CardDescription>
                    Manage stops for this route. The order matters for bus navigation.
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: selectedRoute.color || "#3b82f6" }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {!selectedRoute.stops || selectedRoute.stops.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MapIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No stops on this route</h3>
                    <p className="mb-4">Add stops to create the route path</p>
                    <Button onClick={() => handleOpenStopDialog()}>Add First Stop</Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Stop Name</TableHead>
                        <TableHead>Coordinates</TableHead>
                        <TableHead>Audio</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...selectedRoute.stops]
                        .sort((a, b) => a.order - b.order)
                        .map((stop) => (
                          <TableRow key={stop.id}>
                            <TableCell className="font-mono">{stop.order}</TableCell>
                            <TableCell className="font-medium">
                              {stop.name}
                              {stop.description && (
                                <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                  {stop.description}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="text-gray-500">Lat: {stop.latitude.toFixed(6)}</div>
                                <div className="text-gray-500">Lng: {stop.longitude.toFixed(6)}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {stop.audioUrl ? (
                                <div className="flex items-center">
                                  <Music className="h-4 w-4 mr-2 text-green-500" />
                                  <audio controls className="h-8 w-full max-w-xs">
                                    <source src={stop.audioUrl} type="audio/mpeg" />
                                    Your browser does not support audio.
                                  </audio>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">No audio</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  disabled={stop.order === 1}
                                  onClick={() => handleMoveStop(stop.id, 'up')}
                                >
                                  <MoveUp className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  disabled={stop.order === selectedRoute.stops.length}
                                  onClick={() => handleMoveStop(stop.id, 'down')}
                                >
                                  <MoveDown className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => {
                                    setSelectedStop(stop)
                                    handleOpenStopDialog(stop)
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setSelectedStop(stop)
                                    setIsStopAlertOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
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
          ) : (
            <div className="text-center py-12 text-gray-500">
              <h3 className="text-lg font-medium">No route selected</h3>
              <p>Please select a route to manage its stops</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Route Form Dialog */}
      <Dialog open={isRouteDialogOpen} onOpenChange={setIsRouteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditingRoute ? "Edit Route" : "Add New Route"}</DialogTitle>
            <DialogDescription>
              {isEditingRoute 
                ? "Update route information." 
                : "Add a new route to your transit system."
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleRouteSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Route Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={routeFormData.name || ""}
                  onChange={handleRouteChange}
                  placeholder="e.g. Downtown Express"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={routeFormData.description || ""}
                  onChange={handleRouteChange}
                  placeholder="Describe the route..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Route Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={routeFormData.color || "#3b82f6"}
                    onChange={handleRouteChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    name="color"
                    value={routeFormData.color || "#3b82f6"}
                    onChange={handleRouteChange}
                    placeholder="#3b82f6"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRouteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditingRoute ? "Update Route" : "Add Route"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Stop Form Dialog */}
      <Dialog open={isStopDialogOpen} onOpenChange={setIsStopDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditingStop ? "Edit Stop" : "Add New Stop"}</DialogTitle>
            <DialogDescription>
              {isEditingStop 
                ? "Update stop information." 
                : "Add a new stop to this route."
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleStopSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Stop Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={stopFormData.name || ""}
                  onChange={handleStopChange}
                  placeholder="e.g. Main Street"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="0.000001"
                    value={stopFormData.latitude || 0}
                    onChange={handleStopChange}
                    placeholder="e.g. 37.7749"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="0.000001"
                    value={stopFormData.longitude || 0}
                    onChange={handleStopChange}
                    placeholder="e.g. -122.4194"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="order">Order in Route</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  min="1"
                  value={stopFormData.order || 1}
                  onChange={handleStopChange}
                  required
                />
                <p className="text-xs text-gray-500">
                  Position of this stop in the route sequence
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={stopFormData.description || ""}
                  onChange={handleStopChange}
                  placeholder="Additional details about this stop..."
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="audio">Audio Announcement (Optional)</Label>
                <Input
                  id="audio"
                  name="audio"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-500">
                  Upload an audio file that will be played when approaching this stop
                </p>
              </div>
              
              {selectedStop?.audioUrl && !audioFile && (
                <div className="mt-2">
                  <Label>Current Audio</Label>
                  <div className="flex items-center mt-1">
                    <audio controls className="h-8 w-full max-w-full">
                      <source src={selectedStop.audioUrl} type="audio/mpeg" />
                      Your browser does not support audio.
                    </audio>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a new file to replace this audio
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsStopDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditingStop ? "Update Stop" : "Add Stop"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Route Confirmation Alert */}
      <AlertDialog open={isRouteAlertOpen} onOpenChange={setIsRouteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this route? This will also remove all stops associated with this route.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoute} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Stop Confirmation Alert */}
      <AlertDialog open={isStopAlertOpen} onOpenChange={setIsStopAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stop</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this stop? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStop} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}