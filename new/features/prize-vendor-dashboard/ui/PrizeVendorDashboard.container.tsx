"use client"

import type { ProjectRepository } from "@/new/api/project-repository"
import { usePrizeVendorDashboard } from "../hooks/usePrizeVendorDashboard"
import { PrizeVendorDashboardView } from "./PrizeVendorDashboard.view"
import { PrizeVendorBillingContainer } from "@/new/features/prize-vendor-billing/ui/PrizeVendorBilling.container"

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
      deliveryForm={deliveryForm}
      onSelect={handleSelect}
      onUpdateDeliveryRow={updateDeliveryFormRow}
      onSaveDelivery={handleSaveDelivery}
      billingTab={<PrizeVendorBillingContainer repository={repository} />}
    />
  )
}
