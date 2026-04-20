"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { Product, ManagementConfirmationStatus } from "@/new/api/types"
import type { ProjectFormState, ProductFormState } from "@/new/features/project-registration/model/types"
import type { OrderStatus, ExecutionStatus } from "@/new/features/project-registration/model/lottery-types"
import { PROPOSAL_STATUS_LABELS, EXECUTION_STATUS_LABELS } from "@/new/api/display"
import { LotteryStatus } from "./lottery/LotteryStatus"

type Props = {
  proposalStatus: string
  executionStatus?: string
  managementConfirmationStatus: ManagementConfirmationStatus
  productEntity?: Product
  form: ProjectFormState
  product: ProductFormState
  onStatusChange: (status: OrderStatus) => void
  onReadingCertaintyChange: (value: "A" | "B" | "C" | "") => void
  onExecutionStatusChange: (status: ExecutionStatus) => void
  onConfirmOrder: () => void
}

const getProposalColor = (s: string) => {
  switch (s) {
    case "order-received":
      return "bg-green-600 text-white"
    case "proposing":
      return "bg-blue-600 text-white"
    default:
      return "bg-slate-500 text-white"
  }
}

const getBoolColor = (done: boolean) =>
  done ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"

const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="space-y-1">
    <div className="text-xs text-slate-500 font-medium">{label}</div>
    <div className="text-sm text-slate-900 bg-slate-50 border rounded px-3 py-2 min-h-[38px] flex items-center">
      {value ?? "-"}
    </div>
  </div>
)

const StatusCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-[10px] text-slate-500 font-medium leading-none">{title}</span>
    {children}
  </div>
)

export const ProductEditHeader = ({
  proposalStatus,
  executionStatus,
  managementConfirmationStatus: _mc,
  productEntity,
  form,
  product,
  onStatusChange,
  onReadingCertaintyChange,
  onExecutionStatusChange,
  onConfirmOrder,
}: Props) => {
  const [open, setOpen] = useState(false)

  const isLottery = product.category === "ポイント"
  const estimated = Number((product as any).estimatedBillingAmount) || 0

  const proposalLabel = (PROPOSAL_STATUS_LABELS as Record<string, string>)[proposalStatus] ?? proposalStatus
  const executionLabel = executionStatus
    ? (EXECUTION_STATUS_LABELS as Record<string, string>)[executionStatus] ?? executionStatus
    : "-"

  const designOrdered = !!productEntity?.notificationOrderSentAt
  const prizeOrdered = !!productEntity?.prizeOrderRequestedAt
  const listConfirmed = !!productEntity?.winnerListValidatedAt

  return (
    <div className="sticky top-[72px] z-30 -mx-0 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-5 flex-wrap">
        <StatusCard title="ステータス">
          <Badge className={`${getProposalColor(proposalStatus)} px-2 py-0.5 text-xs`}>{proposalLabel}</Badge>
        </StatusCard>

        <StatusCard title="実施ステータス">
          <Badge className="bg-slate-100 text-slate-600 px-2 py-0.5 text-xs">{executionLabel}</Badge>
        </StatusCard>

        {isLottery && (
          <>
            <StatusCard title="当選デザイン依頼">
              <Badge className={`${getBoolColor(designOrdered)} px-2 py-0.5 text-xs`}>
                {designOrdered ? "実施済み" : "未実施"}
              </Badge>
            </StatusCard>

            <StatusCard title="景品発注依頼">
              <Badge className={`${getBoolColor(prizeOrdered)} px-2 py-0.5 text-xs`}>
                {prizeOrdered ? "実施済み" : "未実施"}
              </Badge>
            </StatusCard>

            <StatusCard title="リスト確認">
              <Badge className={`${getBoolColor(listConfirmed)} px-2 py-0.5 text-xs`}>
                {listConfirmed ? "確認済" : "確認前"}
              </Badge>
            </StatusCard>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
          >
            レコード情報
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-w-5xl mx-auto px-4 pb-4 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="レコード番号" value={(product as any).id ?? "-"} />
            <Field label="営業申込日" value={form.requestDate} />
            <Field label="発注日" value={(product as any).createdAt?.slice?.(0, 10)} />
            <Field label="担当営業" value={form.salesPersonName} />
          </div>

          <div className="rounded-lg border bg-slate-50/60 p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-700">店舗情報</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="案件番号" value={(form as any).projectNumber ?? form.projectName} />
              <Field label="店舗名" value={form.hallName} />
              <Field label="法人" value={form.companyName} />
              <Field label="法人ID" value={form.companyId} />
            </div>
          </div>

          <div className="rounded-lg border bg-slate-50/60 p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-700">商材情報</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="商材区分" value={product.category} />
              <Field label="商材名" value={product.eventProductName || product.eventType} />
              <Field label="イベント区分" value={product.eventType} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="実施日" value={product.eventDate} />
              {product.startTime && <Field label="開始時間" value={product.startTime} />}
              {product.endTime && <Field label="終了時間" value={product.endTime} />}
              <Field label="見積金額" value={`¥${estimated.toLocaleString()}`} />
            </div>
            {isLottery && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(product as any).eventStartDate && (
                  <Field label="掲載開始日" value={(product as any).eventStartDate} />
                )}
                {(product as any).eventEndDate && (
                  <Field label="掲載終了日" value={(product as any).eventEndDate} />
                )}
                {(product as any).area && <Field label="配信エリア" value={(product as any).area} />}
                {(product as any).budget && (
                  <Field label="日予算" value={`¥${Number((product as any).budget).toLocaleString()}`} />
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-blue-50/60 p-4">
            <LotteryStatus
              proposalStatus={proposalStatus as OrderStatus}
              readingCertainty={product.readingCertainty as "A" | "B" | "C" | ""}
              executionStatus={(executionStatus as ExecutionStatus) ?? null}
              onStatusChange={onStatusChange}
              onReadingCertaintyChange={onReadingCertaintyChange}
              onExecutionStatusChange={onExecutionStatusChange}
              onConfirmOrder={onConfirmOrder}
            />
          </div>
        </div>
      )}
    </div>
  )
}
