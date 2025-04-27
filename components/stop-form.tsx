"use client"

import type React from "react"

import { useState } from "react"
// Firebase imports are commented out but kept for reference
// import { collection, addDoc, type Firestore } from "firebase/firestore"
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface StopFormProps {
  db: any // Changed from Firestore type to any
  busId: string
  onClose: () => void
}

export function StopForm({ db, busId, onClose }: StopFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
  })
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!formData.name || !formData.latitude || !formData.longitude) {
        throw new Error("Stop name, latitude, and longitude are required")
      }

      // Validate latitude and longitude
      const lat = Number.parseFloat(formData.latitude)
      const lon = Number.parseFloat(formData.longitude)

      if (isNaN(lat) || lat < -90 || lat > 90) {
        throw new Error("Latitude must be a number between -90 and 90")
      }

      if (isNaN(lon) || lon < -180 || lon > 180) {
        throw new Error("Longitude must be a number between -180 and 180")
      }

      // Mock file upload and database operations
      await new Promise((resolve) => setTimeout(resolve, 1000))

      /*
      let audioUrl = ""

      // Upload audio file if provided
      if (audioFile) {
        const storage = getStorage()
        const storageRef = ref(storage, `audio/${busId}/${Date.now()}_${audioFile.name}`)
        await uploadBytes(storageRef, audioFile)
        audioUrl = await getDownloadURL(storageRef)
      }

      // Add new stop
      await addDoc(collection(db, "stops"), {
        busId,
        name: formData.name,
        latitude: lat,
        longitude: lon,
        audioUrl,
        createdAt: new Date().toISOString(),
      })
      */

      onClose()
      // For demo purposes, we'll just reload the page to simulate a refresh
      window.location.reload()
    } catch (error) {
      console.error("Error saving stop:", error)
      setError(error instanceof Error ? error.message : "Failed to save stop")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Add New Stop</CardTitle>
          <CardDescription>Enter details for a new bus stop</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Stop Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter stop name"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g. 37.7749"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g. -122.4194"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="audio">Audio File (optional)</Label>
            <Input id="audio" type="file" accept="audio/*" onChange={handleFileChange} />
            <p className="text-xs text-muted-foreground">Upload an audio announcement for this stop</p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Stop"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
