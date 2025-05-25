"use client"

import type React from "react"

import { useState } from "react"
// Firebase imports are commented out but kept for reference
// import { collection, addDoc, updateDoc, doc, type Firestore } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Bus } from "@/lib/types"
import { X } from "lucide-react"

interface BusFormProps {
  db: any // Changed from Firestore type to any
  bus?: Bus
  onClose: () => void
}

export function BusForm({ db, bus, onClose }: BusFormProps) {
  const [formData, setFormData] = useState<{
    busId: string
    name: string
    route: string
  }>({
    busId: bus?.busId || "",
    name: bus?.name || "",
    route: bus?.routeId || "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!formData.busId || !formData.name) {
        throw new Error("Bus ID and Name are required")
      }

      // Mock saving to Firestore
      await new Promise((resolve) => setTimeout(resolve, 500))

      /*
      if (bus) {
        // Update existing bus
        await updateDoc(doc(db, "buses", bus.id), {
          busId: formData.busId,
          name: formData.name,
          route: formData.route,
        })
      } else {
        // Add new bus
        await addDoc(collection(db, "buses"), {
          busId: formData.busId,
          name: formData.name,
          route: formData.route,
        })
      }
      */

      onClose()
      // For demo purposes, we'll just reload the page to simulate a refresh
      window.location.reload()
    } catch (error) {
      console.error("Error saving bus:", error)
      setError(error instanceof Error ? error.message : "Failed to save bus")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{bus ? "Edit Bus" : "Add New Bus"}</CardTitle>
          <CardDescription>{bus ? "Update bus information" : "Enter details for a new bus"}</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="busId">Bus ID</Label>
            <Input
              id="busId"
              name="busId"
              value={formData.busId}
              onChange={handleChange}
              placeholder="Enter bus ID"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Bus Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter bus name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="route">Route</Label>
            <Input
              id="route"
              name="route"
              value={formData.route}
              onChange={handleChange}
              placeholder="Enter bus route"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : bus ? "Update Bus" : "Add Bus"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
