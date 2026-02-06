"use client"

import { useLotteryAdminDashboard } from "@/features/lottery-admin-dashboard/hooks/useLotteryAdminDashboard"
import { LotteryAdminDashboardView } from "@/features/lottery-admin-dashboard/ui/LotteryAdminDashboard.view"

export type LotteryAdminDashboardContainerProps = {
  addNotification: (message: string) => void
}

export const LotteryAdminDashboardContainer = ({ addNotification }: LotteryAdminDashboardContainerProps) => {
  const state = useLotteryAdminDashboard({ addNotification })

  return (
    <LotteryAdminDashboardView
      activeTab={state.activeTab}
      onActiveTabChange={state.setActiveTab}
      lotteryProducts={state.lotteryProducts}
      selectedProduct={state.selectedProduct}
      selectedProductId={state.selectedProductId}
      allDesignRequests={state.allDesignRequests}
      designVendors={state.designVendors}
      onSelectProduct={(product) => state.setSelectedProductId(product.id)}
      showWinnerListModal={state.showWinnerListModal}
      winnerListFile={state.winnerListFile}
      onWinnerListFileChange={state.setWinnerListFile}
      onOpenWinnerListModal={(product) => {
        state.setSelectedProductId(product.id)
        state.setShowWinnerListModal(true)
      }}
      onUploadWinnerList={state.handleUploadWinnerList}
      onCloseWinnerListModal={() => state.setShowWinnerListModal(false)}
      showDesignRequestModal={state.showDesignRequestModal}
      designRequestType={state.designRequestType}
      designVendorId={state.designVendorId}
      onDesignRequestTypeChange={state.setDesignRequestType}
      onDesignVendorIdChange={state.setDesignVendorId}
      onOpenDesignRequestModal={(product) => {
        state.setSelectedProductId(product.id)
        state.setShowDesignRequestModal(true)
      }}
      onCreateDesignRequest={state.handleCreateDesignRequest}
      onCloseDesignRequestModal={() => state.setShowDesignRequestModal(false)}
      showPrizeOrderModal={state.showPrizeOrderModal}
      onOpenPrizeOrderModal={(product) => {
        state.setSelectedProductId(product.id)
        state.setShowPrizeOrderModal(true)
      }}
      onGeneratePrizeOrder={state.handleGeneratePrizeOrder}
      onClosePrizeOrderModal={() => state.setShowPrizeOrderModal(false)}
    />
  )
}
