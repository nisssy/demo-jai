"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useLotteryAdminDashboard } from "@/new/features/lottery-admin-dashboard/hooks/useLotteryAdminDashboard"
import { useNotifications } from "@/new/notifications/notification-context"
import { WinnerListSectionView } from "@/new/features/lottery-admin-dashboard/ui/WinnerListSection.view"
import { NotificationOrderSectionView } from "@/new/features/lottery-admin-dashboard/ui/NotificationOrderSection.view"
import { PrizeOrderSectionView } from "@/new/features/lottery-admin-dashboard/ui/PrizeOrderSection.view"
import { Upload } from "lucide-react"
import type { Role } from "@/new/types/role"

type Props = {
  productId: number
  serviceName?: string
}

export const ProductManagementSection = ({ productId, serviceName }: Props) => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])
  const d = useLotteryAdminDashboard(repository)
  const notif = useNotifications()
  const search = useSearchParams()
  const role = (search?.get("role") as Role | null) ?? "Sales"
  const isAdmin = role === "LotteryAdmin"

  useEffect(() => {
    d.selectProduct(productId)
  }, [productId, d.selectProduct])

  const handleUploadFileWithNotification = useCallback(() => {
    d.uploadWinnerListFile()
    notif.addNotification({
      title: "BS/CSが当選者リストをアップロードしました",
      message: `レコード ${productId} の当選者リストがアップロードされました。確認してください。`,
      targetRoles: ["LotteryAdmin"],
      fromRole: role,
      category: "winner-list",
      link: { path: `/new/project-registration?mode=product-edit&productId=${productId}&role=LotteryAdmin` },
    })
  }, [d.uploadWinnerListFile, notif, productId, role])

  if (!d.selectedProduct) {
    return (
      <div className="text-center py-6 text-xs text-slate-400">
        商材管理データを読み込み中...
      </div>
    )
  }

  const p = d.selectedProduct
  const isSales = !isAdmin
  const isSmartPoint = serviceName === "SmartPoint"
  const hasUploaded = !!p.winnerListUploadedAt

  return (
    <div className="space-y-6">
      {/* BS/CS + たまリッチ: ファイルアップロードのみ */}
      {isSales && !isSmartPoint && (
        <WinnerListSectionView
          winnerList={p.winnerList}
          winnerListUploadedAt={p.winnerListUploadedAt}
          winnerListValidatedAt={p.winnerListValidatedAt}
          winnerListHasError={d.winnerListHasError}
          onUploadPsp={d.uploadWinnerListPsp}
          onUploadPspWithError={d.uploadWinnerListPspWithError}
          onUploadFile={handleUploadFileWithNotification}
          onReset={d.resetWinnerList}
          onDismissError={d.dismissWinnerListError}
          onValidate={d.validateWinnerList}
          mode="sales"
        />
      )}

      {/* LotteryAdmin + SmartPoint: PSP連携アップロード */}
      {isAdmin && isSmartPoint && (
        <WinnerListSectionView
          winnerList={p.winnerList}
          winnerListUploadedAt={p.winnerListUploadedAt}
          winnerListValidatedAt={p.winnerListValidatedAt}
          winnerListHasError={d.winnerListHasError}
          onUploadPsp={d.uploadWinnerListPsp}
          onUploadPspWithError={d.uploadWinnerListPspWithError}
          onUploadFile={handleUploadFileWithNotification}
          onReset={d.resetWinnerList}
          onDismissError={d.dismissWinnerListError}
          onValidate={d.validateWinnerList}
          mode="admin"
        />
      )}

      {/* LotteryAdmin + たまリッチ: 営業からのアップロード待ち / アップロード済み表示 */}
      {isAdmin && !isSmartPoint && (
        hasUploaded ? (
          <WinnerListSectionView
            winnerList={p.winnerList}
            winnerListUploadedAt={p.winnerListUploadedAt}
            winnerListValidatedAt={p.winnerListValidatedAt}
            winnerListHasError={d.winnerListHasError}
            onUploadPsp={d.uploadWinnerListPsp}
            onUploadPspWithError={d.uploadWinnerListPspWithError}
            onUploadFile={handleUploadFileWithNotification}
            onReset={d.resetWinnerList}
            onDismissError={d.dismissWinnerListError}
            onValidate={d.validateWinnerList}
            mode="admin"
          />
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center space-y-2">
            <Upload className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-sm font-medium text-slate-600">営業担当者からの当選者リストアップロードを待っています</p>
            <p className="text-xs text-slate-400">営業がファイルをアップロードすると、ここに当選者リストが表示されます</p>
          </div>
        )
      )}

      {/* 当選者通知書依頼・景品発注依頼: LotteryAdmin のみ */}
      {isAdmin && (
        <>
          <NotificationOrderSectionView
            notificationOrderGeneratedAt={p.notificationOrderGeneratedAt}
            notificationOrderSentAt={p.notificationOrderSentAt}
            notificationOrderDesignVendorName={p.notificationOrderDesignVendorName}
            winnerCount={p.winnerList?.length ?? 0}
            designVendors={d.designVendors}
            notificationDesignRequests={d.notificationDesignRequests}
            notificationCommentText={d.notificationCommentText}
            onNotificationCommentTextChange={d.setNotificationCommentText}
            onGenerate={d.generateNotificationOrder}
            onSelectVendor={d.selectNotificationVendor}
            selectedVendor={d.selectedNotificationVendor}
            onRequestSend={d.requestSendNotificationOrder}
            onConfirmSend={d.confirmSendNotificationOrder}
            onCancelSend={d.cancelSendNotificationOrder}
            pendingVendor={d.pendingNotificationVendor}
            draftDeadline={d.notificationDraftDeadline}
            onDraftDeadlineChange={d.setNotificationDraftDeadline}
            onAddComment={d.addNotificationComment}
            canGenerate={!!p.winnerListValidatedAt}
          />
          <PrizeOrderSectionView
            prizeOrdersByVendor={p.prizeOrdersByVendor}
            prizeOrderGeneratedAt={p.prizeOrderGeneratedAt}
            prizeOrderRequestedAt={p.prizeOrderRequestedAt}
            prizeDeliveryInfoByVendor={p.prizeDeliveryInfoByVendor}
            canGenerate={!!p.winnerListValidatedAt}
            desiredDeliveryDate={d.desiredDeliveryDate}
            onDesiredDeliveryDateChange={d.setDesiredDeliveryDate}
            onGenerate={d.generatePrizeOrders}
            onRequestSend={d.requestSendPrizeOrder}
            onConfirmSend={d.confirmSendPrizeOrder}
            onCancelSend={d.cancelSendPrizeOrder}
            pendingVendorId={d.pendingPrizeVendorId}
          />
        </>
      )}
    </div>
  )
}
