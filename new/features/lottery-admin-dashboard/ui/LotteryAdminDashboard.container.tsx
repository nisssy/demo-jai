"use client"

import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useLotteryAdminDashboard } from "@/new/features/lottery-admin-dashboard/hooks/useLotteryAdminDashboard"
import { LotteryAdminDashboardView } from "@/new/features/lottery-admin-dashboard/ui/LotteryAdminDashboard.view"

export const LotteryAdminDashboardContainer = () => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])

  const {
    productList,
    selectedProductId,
    selectProduct,
    selectedProduct,
    uploadWinnerList,
    validateWinnerList,
    generateNotificationOrder,
    sendNotificationOrder,
    designVendors,
    generatePrizeOrders,
    sendPrizeOrder,
    checkQuoCardLetter,
    designRequests,
    commentText,
    setCommentText,
    addComment,
  } = useLotteryAdminDashboard(repository)

  return (
    <LotteryAdminDashboardView
      productList={productList}
      selectedProductId={selectedProductId}
      onSelectProduct={selectProduct}
      selectedProduct={selectedProduct}
      onUploadWinnerList={uploadWinnerList}
      onValidateWinnerList={validateWinnerList}
      onGenerateNotificationOrder={generateNotificationOrder}
      onSendNotificationOrder={sendNotificationOrder}
      designVendors={designVendors}
      onGeneratePrizeOrders={generatePrizeOrders}
      onSendPrizeOrder={sendPrizeOrder}
      onCheckQuoCardLetter={checkQuoCardLetter}
      designRequests={designRequests}
      commentText={commentText}
      onCommentTextChange={setCommentText}
      onAddComment={addComment}
    />
  )
}
