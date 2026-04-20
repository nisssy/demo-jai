"use client"

import { useEffect, useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useLotteryAdminDashboard } from "../hooks/useLotteryAdminDashboard"
import { NotificationOrderSectionView } from "./NotificationOrderSection.view"

type Props = {
  productIds: number[]
}

export const BulkNotificationItem = ({ productIds }: Props) => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])
  const d = useLotteryAdminDashboard(repository)

  // 代表として先頭の商材でセクションを駆動
  const leadProductId = productIds[0]
  useEffect(() => {
    if (leadProductId) d.selectProduct(leadProductId)
  }, [leadProductId, d.selectProduct])

  const allProducts = repository.getProducts()
  const selected = productIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p)

  const totalWinners = selected.reduce((sum, p) => sum + (p.winnerList?.length ?? 0), 0)

  const p = d.selectedProduct
  if (!p) {
    return <div className="text-xs text-slate-400 py-4">読み込み中...</div>
  }

  return (
    <div className="space-y-4">
      {/* 対象レコード一覧 */}
      <div className="border rounded-lg bg-white p-4">
        <div className="text-xs font-semibold text-slate-700 mb-2">対象レコード（{selected.length}件）</div>
        <div className="space-y-1">
          {selected.map((s) => (
            <div key={s.id} className="flex items-center gap-3 text-sm text-slate-700 border-b last:border-0 py-1.5">
              <span className="text-xs text-blue-600 font-medium min-w-[90px]">{s.projectNumber}</span>
              <span className="flex-1">{s.eventProductName}</span>
              <span className="text-xs text-slate-500">{s.hallNames?.join("、") ?? ""}</span>
              <span className="text-xs text-slate-500">当選者 {s.winnerList?.length ?? 0} 名</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t text-sm">
          <span className="text-slate-500">合計当選者数:</span>{" "}
          <span className="font-bold text-slate-900">{totalWinners} 名</span>
        </div>
      </div>

      {/* 一括の発注セクション（先頭レコードで駆動） */}
      <NotificationOrderSectionView
        notificationOrderGeneratedAt={p.notificationOrderGeneratedAt}
        notificationOrderSentAt={p.notificationOrderSentAt}
        notificationOrderDesignVendorName={p.notificationOrderDesignVendorName}
        winnerCount={totalWinners}
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
        canGenerate={selected.length > 0}
      />
    </div>
  )
}
