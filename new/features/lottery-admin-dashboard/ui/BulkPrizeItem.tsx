"use client"

import { useEffect, useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useLotteryAdminDashboard } from "../hooks/useLotteryAdminDashboard"
import { PrizeOrderSectionView } from "./PrizeOrderSection.view"

type Props = {
  productIds: number[]
}

export const BulkPrizeItem = ({ productIds }: Props) => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])
  const d = useLotteryAdminDashboard(repository)

  const leadProductId = productIds[0]
  useEffect(() => {
    if (leadProductId) d.selectProduct(leadProductId)
  }, [leadProductId, d.selectProduct])

  const allProducts = repository.getProducts()
  const selected = productIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p)

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
              <span className="text-xs text-slate-500">景品 {s.prizeInfo?.length ?? 0} 種</span>
            </div>
          ))}
        </div>
      </div>

      {/* 一括の景品発注セクション（先頭レコードで駆動） */}
      <PrizeOrderSectionView
        prizeOrdersByVendor={p.prizeOrdersByVendor}
        prizeOrderGeneratedAt={p.prizeOrderGeneratedAt}
        prizeOrderRequestedAt={p.prizeOrderRequestedAt}
        prizeDeliveryInfoByVendor={p.prizeDeliveryInfoByVendor}
        canGenerate={selected.length > 0}
        desiredDeliveryDate={d.desiredDeliveryDate}
        onDesiredDeliveryDateChange={d.setDesiredDeliveryDate}
        onGenerate={d.generatePrizeOrders}
        onRequestSend={d.requestSendPrizeOrder}
        onConfirmSend={d.confirmSendPrizeOrder}
        onCancelSend={d.cancelSendPrizeOrder}
        pendingVendorId={d.pendingPrizeVendorId}
      />
    </div>
  )
}
