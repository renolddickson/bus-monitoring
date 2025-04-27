"use client";

import { RouteManagement } from "@/components/route-management";
import { db } from "@/lib/firebase";

export default function RouteManagementPage({
  routes,
  selectedRoute,
  setSelectedRoute,
}: {
  routes: any[];
  selectedRoute: any;
  setSelectedRoute: (route: any) => void;
}) {
  return (
    <RouteManagement
      db={db}
      routes={routes}
      selectedRoute={selectedRoute}
      setSelectedRoute={setSelectedRoute}
    />
  );
}