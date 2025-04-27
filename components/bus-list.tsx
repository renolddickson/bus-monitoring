"use client"

import { useState, useEffect } from "react"
// Firebase imports are commented out but kept for reference
// import { collection, getDocs, deleteDoc, doc, type Firestore } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Bus } from "@/lib/types"
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react"

// Mock data for buses
const MOCK_BUSES: Bus[] = [
  { id: "1", busId: "bus_1", name: "Bus1", route: "tirunelveli" },
  { id: "2", busId: "bus_2", name: "Bus2", route: "chennai" },
  { id: "3", busId: "bus_3", name: "Bus3", route: "madurai" },
]

interface BusListProps {
  db: any // Changed from Firestore type to any
  onSelectBus: (bus: Bus) => void
  onAddBus: () => void
  onEditBus: (bus: Bus) => void
}

export function BusList({ db, onSelectBus, onAddBus, onEditBus }: BusListProps) {
  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [busToDelete, setBusToDelete] = useState<Bus | null>(null)

  useEffect(() => {
    // Mock fetching buses from Firestore
    const fetchBuses = async () => {
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        setBuses(MOCK_BUSES)
      } catch (error) {
        console.error("Error fetching buses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBuses()
  }, [db])

  const handleDeleteBus = async () => {
    if (!busToDelete) return

    try {
      // Mock deleting a bus from Firestore
      // await deleteDoc(doc(db, "buses", busToDelete.id))
      setBuses(buses.filter((bus) => bus.id !== busToDelete.id))
      setBusToDelete(null)
    } catch (error) {
      console.error("Error deleting bus:", error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Buses</CardTitle>
          <CardDescription>Manage your bus fleet</CardDescription>
        </div>
        <Button onClick={onAddBus}>
          <Plus className="mr-2 h-4 w-4" />
          Add Bus
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Loading buses...</div>
        ) : buses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-4">No buses found</p>
            <Button onClick={onAddBus}>
              <Plus className="mr-2 h-4 w-4" />
              Add your first bus
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bus Name</TableHead>
                <TableHead>Bus ID</TableHead>
                <TableHead>Route</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buses.map((bus) => (
                <TableRow key={bus.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell onClick={() => onSelectBus(bus)}>{bus.name}</TableCell>
                  <TableCell onClick={() => onSelectBus(bus)}>{bus.busId}</TableCell>
                  <TableCell onClick={() => onSelectBus(bus)}>{bus.route}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectBus(bus)
                      }}
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="sr-only">View Stops</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditBus(bus)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setBusToDelete(bus)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Bus</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this bus? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setBusToDelete(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteBus}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
