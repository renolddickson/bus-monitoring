"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { Dashboard } from "@/components/dashboard"
import { BusManagement } from "@/components/bus-management"
import { RouteManagement } from "@/components/route-management"
import { MapIcon, BusIcon, RouteIcon } from "lucide-react"
import { Bus, Route, BusLocation } from "@/lib/types"
import { db } from "@/lib/firebase" // <-- use your exported Firestore instance

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: MapIcon },
  { id: "buses", label: "Bus Management", icon: BusIcon },
  { id: "routes", label: "Routes", icon: RouteIcon },
]

export default function BusDashboard() {
  const [activeSection, setActiveSection] = useState<string>("dashboard")
  const [buses, setBuses] = useState<Bus[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [busLocations, setBusLocations] = useState<BusLocation[]>([])
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsubscribeBuses = onSnapshot(collection(db, "buses"), (snapshot) => {
      const busData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bus[]
      setBuses(busData)
      console.log(busData);
      
    })

    const unsubscribeRoutes = onSnapshot(collection(db, "routes"), (snapshot) => {
      const routeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Route[]
      setRoutes(routeData)
    })

    const unsubscribeLocations = onSnapshot(collection(db, "busLocations"), (snapshot) => {
      const locationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BusLocation[]
      setBusLocations(locationData)
      setLoading(false)
    })

    return () => {
      unsubscribeBuses()
      unsubscribeRoutes()
      unsubscribeLocations()
    }
  }, [])

  const handleSelectBus = (bus: Bus) => {
    setSelectedBus(bus)
    setActiveSection("buses")
  }

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route)
    setActiveSection("routes")
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <Dashboard 
            buses={buses}
            routes={routes}
            busLocations={busLocations}
            onSelectBus={handleSelectBus}
            loading={loading}
          />
        )
      case "buses":
        return (
          <BusManagement 
            db={db}
            buses={buses}
            routes={routes}
            selectedBus={selectedBus}
            setSelectedBus={setSelectedBus}
          />
        )
      case "routes":
        return (
          <RouteManagement
            db={db}
            routes={routes}
            selectedRoute={selectedRoute}
            setSelectedRoute={setSelectedRoute}
          />
        )
      default:
        return <div>Select a section</div>
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-gray-900 text-white overflow-y-auto shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold">Bus Transit System</h1>
          <p className="text-gray-400 text-sm mt-1">Management Dashboard</p>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`flex items-center w-full px-6 py-3 transition-colors ${
                activeSection === item.id 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-6 py-4 mt-auto border-t border-gray-800">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="font-semibold text-sm">J</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b h-16 flex items-center justify-between px-6">
          <h2 className="text-lg font-medium">
            {navItems.find(item => item.id === activeSection)?.label}
          </h2>
          <div className="flex items-center">
            <span className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <span className="text-sm font-semibold">J</span>
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
