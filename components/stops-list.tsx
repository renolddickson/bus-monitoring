"use client"

import { useState, useEffect } from "react"
// Firebase imports are commented out but kept for reference
// import { collection, query, where, getDocs, deleteDoc, doc, type Firestore } from "firebase/firestore"
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
import type { Stop } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"

// Mock data for stops
const MOCK_STOPS: Record<string, Stop[]> = {
  "1": [
    { id: "s1", busId: "1", name: "Stop 1", latitude: 8.7139, longitude: 77.7567, createdAt: new Date().toISOString() },
    { id: "s2", busId: "1", name: "Stop 2", latitude: 8.7234, longitude: 77.7361, createdAt: new Date().toISOString() },
    { id: "s3", busId: "1", name: "Stop 3", latitude: 8.7325, longitude: 77.7289, createdAt: new Date().toISOString() },
  ],
  "2": [
    {
      id: "s4",
      busId: "2",
      name: "Chennai Central",
      latitude: 13.0827,
      longitude: 80.2707,
      createdAt: new Date().toISOString(),
    },
    {
      id: "s5",
      busId: "2",
      name: "T Nagar",
      latitude: 13.0418,
      longitude: 80.2341,
      createdAt: new Date().toISOString(),
    },
  ],
  "3": [
    {
      id: "s6",
      busId: "3",
      name: "Madurai Junction",
      latitude: 9.9252,
      longitude: 78.1198,
      createdAt: new Date().toISOString(),
    },
  ],
}

interface StopsListProps {
  db: any // Changed from Firestore type to any
  busId: string
  onAddStop: () => void
}

export function StopsList({ db, busId, onAddStop }: StopsListProps) {
  const [stops, setStops] = useState<Stop[]>([])
  const [loading, setLoading] = useState(true)
  const [stopToDelete, setStopToDelete] = useState<Stop | null>(null)

  useEffect(() => {
    // Mock fetching stops from Firestore
    const fetchStops = async () => {
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        setStops(MOCK_STOPS[busId] || [])
      } catch (error) {
        console.error("Error fetching stops:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStops()
  }, [db, busId])

  const handleDeleteStop = async () => {
    if (!stopToDelete) return

    try {
      // Mock deleting a stop from Firestore
      // await deleteDoc(doc(db, "stops", stopToDelete.id))
      setStops(stops.filter((stop) => stop.id !== stopToDelete.id))
      setStopToDelete(null)
    } catch (error) {
      console.error("Error deleting stop:", error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Bus Stops</CardTitle>
          <CardDescription>Manage stops for this bus route</CardDescription>
        </div>
        <Button onClick={onAddStop}>
          <Plus className="mr-2 h-4 w-4" />
          Add Stop
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Loading stops...</div>
        ) : stops.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-4">No stops found for this bus</p>
            <Button onClick={onAddStop}>
              <Plus className="mr-2 h-4 w-4" />
              Add your first stop
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stop Name</TableHead>
                <TableHead>Latitude</TableHead>
                <TableHead>Longitude</TableHead>
                <TableHead>Audio</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stops.map((stop) => (
                <TableRow key={stop.id}>
                  <TableCell>{stop.name}</TableCell>
                  <TableCell>{stop.latitude}</TableCell>
                  <TableCell>{stop.longitude}</TableCell>
                  <TableCell>
                    {stop.audioUrl ? (
                      <audio controls className="h-8 w-full max-w-xs">
                        <source src={stop.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <span className="text-muted-foreground">No audio</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setStopToDelete(stop)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Stop</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this stop? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setStopToDelete(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteStop}>Delete</AlertDialogAction>
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
