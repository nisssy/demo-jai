import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { MonthlyBilling, BillingStatus } from "@/new/api/types"
import { BILLING_STATUS_LABELS } from "@/new/api/display"
import { BillingChat } from "@/new/features/monthly-billing/ui/components/BillingChat"

const STATUS_BADGE_STYLES: Record<BillingStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  "correction-requested": "bg-orange-100 text-orange-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  "invoice-received": "bg-purple-100 text-purple-800",
  agreed: "bg-indigo-100 text-indigo-800",
  acknowledged: "bg-green-100 text-green-800",
}

interface BillingConfirmationDetailProps {
  billing: MonthlyBilling
  vendorName: string
  chatText: string
  onChatTextChange: (text: string) => void
  onSendChat: () => void
  onRequestCorrection: () => void
  onConfirm: () => void
  onSubmitInvoice: () => void
  onAcknowledge: () => void
}

export const BillingConfirmationDetail = ({
  billing,
  vendorName,
  chatText,
  onChatTextChange,
  onSendChat,
  onRequestCorrection,
  onConfirm,
  onSubmitInvoice,
  onAcknowledge,
}: BillingConfirmationDetailProps) => {
  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold">{billing.billingMonth.replace("-", "年")}月 計上データ</h3>
          <p className="text-xs text-muted-foreground">
            送信元: 事務管理課
          </p>
        </div>
        <Badge className={STATUS_BADGE_STYLES[billing.status]}>
          {BILLING_STATUS_LABELS[billing.status]}
        </Badge>
      </div>

      {/* Line items table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>案件番号</TableHead>
              <TableHead>商材名</TableHead>
              <TableHead>品目</TableHead>
              <TableHead className="text-right">数量</TableHead>
              <TableHead className="text-right">単価</TableHead>
              <TableHead className="text-right">小計</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billing.lineItems.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-xs font-mono">{item.projectNumber}</TableCell>
                <TableCell className="text-sm">{item.productName}</TableCell>
                <TableCell className="text-sm">{item.itemName}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">¥{item.unitPrice.toLocaleString()}</TableCell>
                <TableCell className="text-right font-medium">¥{item.subtotal.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end p-3 border-t bg-muted/30">
          <span className="text-sm font-bold">合計: ¥{billing.totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        {billing.status === "sent" && (
          <>
            <Button onClick={onConfirm} size="sm">
              データ確認OK
            </Button>
            <Button onClick={onRequestCorrection} size="sm" variant="outline">
              修正依頼
            </Button>
          </>
        )}
        {billing.status === "confirmed" && (
          <Button onClick={onSubmitInvoice} size="sm">
            請求書を送信
          </Button>
        )}
        {billing.status === "agreed" && (
          <Button onClick={onAcknowledge} size="sm">
            了承
          </Button>
        )}
      </div>

      {/* Chat */}
      <BillingChat
        messages={billing.chatMessages ?? []}
        chatText={chatText}
        onChatTextChange={onChatTextChange}
        onSend={onSendChat}
        currentAuthor={vendorName}
      />
    </div>
  )
}
