"use client";

import { BusManagement } from "@/components/bus-management";
import { db } from "@/lib/firebase";

export default function BusManagementPage({
  buses,
  routes,
  selectedBus,
  setSelectedBus,
}: {
  buses: any[];
  routes: any[];
  selectedBus: any;
  setSelectedBus: (bus: any) => void;
}) {
  return (
    <BusManagement
      db={db}
      buses={buses}
      routes={routes}
      selectedBus={selectedBus}
      setSelectedBus={setSelectedBus}
    />
  );
}