"use client"

import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useLotteryAdminDashboard } from "@/new/features/lottery-admin-dashboard/hooks/useLotteryAdminDashboard"
import { useProjectList } from "@/new/features/project-list/hooks/useProjectList"
import { LotteryAdminDashboardView } from "@/new/features/lottery-admin-dashboard/ui/LotteryAdminDashboard.view"
import { MonthlyBillingContainer } from "@/new/features/monthly-billing/ui/MonthlyBilling.container"

export const LotteryAdminDashboardContainer = () => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])

  const {
    productList,
    selectedProductId,
    selectProduct,
    selectedProduct,
    uploadWinnerListPsp,
    uploadWinnerListPspWithError,
    uploadWinnerListFile,
    resetWinnerList,
    dismissWinnerListError,
    winnerListHasError,
    validateWinnerList,
    generateNotificationOrder,
    selectNotificationVendor,
    selectedNotificationVendor,
    requestSendNotificationOrder,
    confirmSendNotificationOrder,
    cancelSendNotificationOrder,
    pendingNotificationVendor,
    notificationDraftDeadline,
    setNotificationDraftDeadline,
    designVendors,
    notificationDesignRequests,
    notificationCommentText,
    setNotificationCommentText,
    addNotificationComment,
    generatePrizeOrders,
    desiredDeliveryDate,
    setDesiredDeliveryDate,
    requestSendPrizeOrder,
    confirmSendPrizeOrder,
    cancelSendPrizeOrder,
    pendingPrizeVendorId,
  } = useLotteryAdminDashboard(repository)

  const projectList = useProjectList({ repository, role: "LotteryAdmin" })

  return (
    <LotteryAdminDashboardView
      productList={productList}
      selectedProductId={selectedProductId}
      onSelectProduct={selectProduct}
      selectedProduct={selectedProduct}
      onUploadWinnerListPsp={uploadWinnerListPsp}
      onUploadWinnerListPspWithError={uploadWinnerListPspWithError}
      onUploadWinnerListFile={uploadWinnerListFile}
      onResetWinnerList={resetWinnerList}
      onDismissWinnerListError={dismissWinnerListError}
      winnerListHasError={winnerListHasError}
      onValidateWinnerList={validateWinnerList}
      onGenerateNotificationOrder={generateNotificationOrder}
      onSelectNotificationVendor={selectNotificationVendor}
      selectedNotificationVendor={selectedNotificationVendor}
      onRequestSendNotification={requestSendNotificationOrder}
      onConfirmSendNotification={confirmSendNotificationOrder}
      onCancelSendNotification={cancelSendNotificationOrder}
      pendingNotificationVendor={pendingNotificationVendor}
      notificationDraftDeadline={notificationDraftDeadline}
      onNotificationDraftDeadlineChange={setNotificationDraftDeadline}
      designVendors={designVendors}
      notificationDesignRequests={notificationDesignRequests}
      notificationCommentText={notificationCommentText}
      onNotificationCommentTextChange={setNotificationCommentText}
      onAddNotificationComment={addNotificationComment}
      onGeneratePrizeOrders={generatePrizeOrders}
      desiredDeliveryDate={desiredDeliveryDate}
      onDesiredDeliveryDateChange={setDesiredDeliveryDate}
      onRequestSendPrizeOrder={requestSendPrizeOrder}
      onConfirmSendPrizeOrder={confirmSendPrizeOrder}
      onCancelSendPrizeOrder={cancelSendPrizeOrder}
      pendingPrizeVendorId={pendingPrizeVendorId}
      billingTab={<MonthlyBillingContainer repository={repository} />}
      projectList={projectList}
    />
  )
}
