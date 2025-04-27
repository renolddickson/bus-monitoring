"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, Route, BusLocation } from "@/lib/types";
import { CheckCircle, AlertCircle, Clock, MapPin, BusIcon } from "lucide-react";

interface DashboardProps {
  buses: Bus[];
  routes: Route[];
  busLocations: BusLocation[];
  onSelectBus: (bus: Bus) => void;
  loading: boolean;
}

export function Dashboard({ buses = [], routes = [], busLocations = [], onSelectBus, loading }: DashboardProps) {
  const [activeBuses, setActiveBuses] = useState<
    Array<
      Bus & {
        location: BusLocation | undefined;
        route: Route | undefined;
        eta: number;
        progress: number;
      }
    >
  >([]);

  useEffect(() => {
    if (buses.length && routes.length && busLocations.length) {
      const processedBuses = buses.map((bus) => {
        const location = busLocations.find((loc) => loc.busId === bus.id);
        const route = routes.find((r) => r.id === bus.routeId);

        let eta = 0;
        let progress = 0;

        if (location && route && route.stops?.length > 0) {
          const nextStopIndex = route.stops.findIndex(
            (stop) => stop.order > location.lastPassedStopOrder
          );

          if (nextStopIndex !== -1) {
            const nextStop = route.stops[nextStopIndex];
            eta = Math.round((nextStop.order - location.lastPassedStopOrder) * 5);
            progress = Math.min(
              100,
              Math.round((location.lastPassedStopOrder / route.stops.length) * 100)
            );
          }
        }

        return {
          ...bus,
          location,
          route,
          eta,
          progress,
        };
      });

      setActiveBuses(processedBuses);
    }
  }, [buses, routes, busLocations]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Buses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">
                {activeBuses.filter((b) => b.location?.active).length}
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {activeBuses.length
                  ? Math.round(
                      (activeBuses.filter((b) => b.location?.active).length / activeBuses.length) * 100
                    )
                  : 0}
                % Fleet Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">{routes.length}</div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {routes.reduce((acc, route) => acc + (route.stops?.length || 0), 0)} Stops
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-lg font-medium">All Systems Operational</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Active Buses</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeBuses.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">No active buses found</div>
        ) : (
          activeBuses.map((bus) => (
            <Card
              key={bus.id}
              className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectBus(bus)}
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="font-medium">{bus.name}</CardTitle>
                <Badge
                  variant="outline"
                  className={bus.location?.active ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}
                >
                  {bus.location?.active ? "Active" : "Inactive"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>Route: {bus.route?.name || "Not assigned"}</span>
                  </div>

                  {bus.location?.active && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{bus.progress}%</span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                          style={{ width: `${bus.progress}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-amber-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="font-medium">{bus.eta} mins to next stop</span>
                        </div>
                        <div className="text-gray-500 text-sm">Bus ID: {bus.busId}</div>
                      </div>
                    </>
                  )}

                  {!bus.location?.active && (
                    <div className="flex items-center text-gray-500 mt-2">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>Bus currently not in service</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Recent Activity</h2>
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {activeBuses.slice(0, 5).map((bus, index) => (
              <div
                key={`activity-${bus.id}-${index}`}
                className="flex items-center pb-4 border-b border-gray-100 last:border-0"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                  <BusIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{bus.name}</p>
                  <p className="text-sm text-gray-500">
                    {bus.location?.active
                      ? `Passed stop #${bus.location.lastPassedStopOrder} on route ${bus.route?.name || "Unknown"}`
                      : "Currently inactive"}
                  </p>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}