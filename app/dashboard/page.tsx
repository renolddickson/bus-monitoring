"use client";

import { Dashboard } from "@/components/dashboard";

export default function DashboardPage({
  buses,
  routes,
  busLocations,
  handleSelectBus,
  loading,
}: {
  buses: any[];
  routes: any[];
  busLocations: any[];
  handleSelectBus: (bus: any) => void;
  loading: boolean;
}) {
  return (
    <Dashboard
      buses={buses}
      routes={routes}
      busLocations={busLocations}
      onSelectBus={handleSelectBus}
      loading={loading}
    />
  );
}