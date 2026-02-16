"use client"

import type { ProjectRepository } from "@/new/api/project-repository"
import { usePrizeVendorDashboard } from "../hooks/usePrizeVendorDashboard"
import { PrizeVendorDashboardView } from "./PrizeVendorDashboard.view"

export type PrizeVendorDashboardContainerProps = {
  repository: ProjectRepository
}

export const PrizeVendorDashboardContainer = ({
  repository,
}: PrizeVendorDashboardContainerProps) => {
  const {
    orderEntries,
    selectedKey,
    selectedEntry,
    existingDeliveries,
    deliveryForm,
    handleSelect,
    updateDeliveryFormRow,
    handleSaveDelivery,
  } = usePrizeVendorDashboard(repository)

  return (
    <PrizeVendorDashboardView
      orderEntries={orderEntries}
      selectedKey={selectedKey}
      selectedEntry={selectedEntry}
      existingDeliveries={existingDeliveries}
      deliveryForm={deliveryForm}
      onSelect={handleSelect}
      onUpdateDeliveryRow={updateDeliveryFormRow}
      onSaveDelivery={handleSaveDelivery}
    />
  )
}
