"use client"

import { usePrizeVendorDashboard } from "@/features/prize-vendor-dashboard/hooks/usePrizeVendorDashboard"
import { PrizeVendorDashboardView } from "@/features/prize-vendor-dashboard/ui/PrizeVendorDashboard.view"

export type PrizeVendorDashboardContainerProps = {
  addNotification: (message: string) => void
}

export const PrizeVendorDashboardContainer = ({ addNotification }: PrizeVendorDashboardContainerProps) => {
  const state = usePrizeVendorDashboard({ addNotification })

  return (
    <PrizeVendorDashboardView
      ordersGroupedByStatus={state.ordersGroupedByStatus}
      selectedProductId={state.selectedProductId}
      selectedOrder={state.selectedOrder}
      onSelectOrder={(item) => state.setSelectedProductId(item.id)}
      onCloseDetail={state.clearSelection}
      getDeliveryInfo={state.getDeliveryInfo}
      showDeliveryModal={state.showDeliveryModal}
      carrierName={state.carrierName}
      trackingNumber={state.trackingNumber}
      shippedAt={state.shippedAt}
      onCarrierNameChange={state.setCarrierName}
      onTrackingNumberChange={state.setTrackingNumber}
      onShippedAtChange={state.setShippedAt}
      onOpenDeliveryModal={state.handleOpenDeliveryModal}
      onSaveDelivery={state.handleSaveDelivery}
      onCloseDeliveryModal={() => state.setShowDeliveryModal(false)}
    />
  )
}
