import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MonthlyBilling, PaymentCheckStatus } from "@/new/api/types"
import { PAYMENT_CHECK_STATUS_LABELS } from "@/new/api/display"
import { BillingChat } from "./BillingChat"

type PaymentDetailViewProps = {
  billing: MonthlyBilling
  checkStatus: PaymentCheckStatus
  chatText: string
  onChatTextChange: (text: string) => void
  onSendChat: () => void
  onSendToVendor: () => void
  onConfirm: () => void
  onBack: () => void
}

const checkStatusColor = (s: PaymentCheckStatus) => {
  switch (s) {
    case "unconfirmed": return "bg-slate-100 text-slate-700"
    case "confirming": return "bg-amber-100 text-amber-800"
    case "confirmed": return "bg-green-100 text-green-800"
  }
}

export const PaymentDetailView = ({
  billing,
  checkStatus,
  chatText,
  onChatTextChange,
  onSendChat,
  onSendToVendor,
  onConfirm,
  onBack,
}: PaymentDetailViewProps) => {
  const taxRate = 0.1
  const purchaseExTax = billing.totalAmount
  const purchaseIncTax = Math.round(billing.totalAmount * (1 + taxRate))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-xs">
            <ArrowLeft className="h-4 w-4 mr-1" />
            支払い一覧に戻る
          </Button>
        </div>
        <Badge className={`text-xs px-2 py-0.5 ${checkStatusColor(checkStatus)}`}>
          {PAYMENT_CHECK_STATUS_LABELS[checkStatus]}
        </Badge>
      </div>

      {/* Main content: left = details, right = chat */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: main column */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 border-r">
          {/* Vendor info */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold">支払依頼チェックリスト</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="text-xs text-slate-500 font-medium">発注先名</div>
                <div className="bg-slate-50 border rounded px-3 py-2 text-sm text-slate-900">{billing.vendorName}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-500 font-medium">発注先ID</div>
                <div className="bg-slate-50 border rounded px-3 py-2 text-sm text-slate-900 font-mono">{billing.vendorId}</div>
              </div>
            </div>
          </div>

          {/* Line items table matching screenshot 3 layout */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700 text-xs">計上月</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">科目</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">イベントID</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">取引先名</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">商品名</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs text-right">数量</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs text-right">単価(%)</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs text-right">税抜金額</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs text-center">開催期間</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billing.lineItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-xs">{billing.billingMonth.replace("-", "/")}</TableCell>
                      <TableCell className="text-xs">{billing.vendorType === "prize" ? "ポイント売上" : "ポイント売上"}</TableCell>
                      <TableCell className="text-xs font-mono">{item.projectNumber}</TableCell>
                      <TableCell className="text-xs">{item.productName}</TableCell>
                      <TableCell className="text-xs">{item.itemName}</TableCell>
                      <TableCell className="text-xs text-right">{item.quantity}</TableCell>
                      <TableCell className="text-xs text-right">¥{item.unitPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right font-medium">¥{item.subtotal.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-center">-</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between items-center p-3 border-t bg-muted/30 text-xs">
              <span className="font-semibold">合計</span>
              <div className="flex gap-6">
                <span>税抜: <strong>¥{purchaseExTax.toLocaleString()}</strong></span>
                <span>税込: <strong>¥{purchaseIncTax.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {checkStatus === "unconfirmed" && (
              <Button onClick={onSendToVendor} size="sm">
                業者へ確認依頼
              </Button>
            )}
            {checkStatus === "confirming" && (
              <Button onClick={onConfirm} size="sm">
                確定
              </Button>
            )}
            {checkStatus === "confirmed" && (
              <Badge className="bg-green-100 text-green-800 py-1.5 px-3">確定済み</Badge>
            )}
          </div>
        </div>

        {/* Right: chat column */}
        <div className="w-[360px] shrink-0 p-4 overflow-y-auto">
          <BillingChat
            messages={billing.chatMessages ?? []}
            chatText={chatText}
            onChatTextChange={onChatTextChange}
            onSend={onSendChat}
            currentAuthor="事務管理課"
          />
        </div>
      </div>
    </div>
  )
}
