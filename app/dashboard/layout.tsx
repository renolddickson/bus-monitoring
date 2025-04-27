"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Map as MapIcon, Bus as BusIcon, Route as RouteIcon } from "lucide-react";
import { Bus, Route, BusLocation } from "@/lib/types";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Define a context to provide data to child components
export interface DataContextType {
  buses: Bus[];
  routes: Route[];
  busLocations: BusLocation[];
  selectedBus: Bus | null;
  selectedRoute: Route | null;
  loading: boolean;
  selectBus: (bus: Bus) => void;
  selectRoute: (route: Route) => void;
  clearBus: () => void;
  clearRoute: () => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: MapIcon, path: "/" },
  { id: "buses", label: "Bus Management", icon: BusIcon, path: "/buses" },
  { id: "routes", label: "Routes", icon: RouteIcon, path: "/routes" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const unsubBuses = onSnapshot(collection(db, "buses"), (snap) => {
      setBuses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bus)));
    });
    const unsubRoutes = onSnapshot(collection(db, "routes"), (snap) => {
      setRoutes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route)));
    });
    const unsubLocations = onSnapshot(collection(db, "busLocations"), (snap) => {
      setBusLocations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusLocation)));
      setLoading(false);
    });

    return () => {
      unsubBuses();
      unsubRoutes();
      unsubLocations();
    };
  }, []);

  // Handlers
  const selectBus = (bus: Bus) => setSelectedBus(bus);
  const selectRoute = (route: Route) => setSelectedRoute(route);
  const clearBus = () => setSelectedBus(null);
  const clearRoute = () => setSelectedRoute(null);

  const contextValue: DataContextType = {
    buses,
    routes,
    busLocations,
    selectedBus,
    selectedRoute,
    loading,
    selectBus,
    selectRoute,
    clearBus,
    clearRoute,
  };

  return (
    <DataContext.Provider value={contextValue}>
      <html lang="en">
        <body className="flex h-screen bg-background">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-900 text-white flex flex-col overflow-y-auto shadow-lg">
            <div className="p-6">
              <h1 className="text-xl font-bold">Bus Transit System</h1>
              <p className="text-gray-400 text-sm mt-1">Management Dashboard</p>
            </div>
            <nav className="mt-6 flex-1">
              {navItems.map(item => (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`flex items-center px-6 py-3 transition-colors ${
                    pathname === item.path
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="px-6 py-4 border-t border-gray-800">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-semibold">J</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-gray-400">Administrator</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white border-b h-16 flex items-center justify-between px-6">
              <h2 className="text-lg font-medium">
                {navItems.find(item => item.path === pathname)?.label}
              </h2>
              <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <span className="text-sm font-semibold">J</span>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {children}
            </main>
          </div>
        </body>
      </html>
    </DataContext.Provider>
  );
}
