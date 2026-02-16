import { Badge } from "@/components/ui/badge"
import { Calendar, Users, CheckCircle2, Play, FileText, Gift, Mail, Image, BarChart3 } from "lucide-react"
import type { ProductViewModel } from "@/new/features/project-list/hooks/useProjectList"
import { PROPOSAL_STATUS_LABELS, BOOKING_STATUS_LABELS, EXECUTION_STATUS_LABELS, DESIGN_REQUEST_STATUS_LABELS } from "@/new/api/display"
import type { BookingStatus } from "@/new/api/types"

const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  "tentative_requesting": "bg-yellow-100 text-yellow-800",
  "tentative_failed": "bg-red-100 text-red-800",
  "tentative_completed": "bg-green-100 text-green-800",
  "confirmed_requesting": "bg-purple-100 text-purple-800",
  "confirmed_failed": "bg-red-100 text-red-800",
  "confirmed_completed": "bg-blue-100 text-blue-800",
}

type ProductCardProps = {
  product: ProductViewModel
  projectSalesPersonName: string
}

export const ProductCard = ({ product, projectSalesPersonName }: ProductCardProps) => {
  const isLottery = product.category === "ポイント" && product.eventType === "合同抽選会"

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="space-y-3">
        {/* ヘッダー */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-700 text-white text-xs">{product.category}</Badge>
              <Badge variant="outline" className="text-xs">{product.eventType}</Badge>
            </div>
            <h4 className="font-medium text-slate-900">
              {product.eventProductName}
            </h4>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {product.eventDate}
          </span>
        </div>

        {/* 提案ステータス（全商材共通） */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-500 min-w-[60px]">提案:</span>
            <Badge className={`text-xs px-2 py-0.5 ${product.proposalStatus === "order-received" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
              {PROPOSAL_STATUS_LABELS[product.proposalStatus] ?? product.proposalStatus}
            </Badge>
          </div>

          {/* ヨミ（受注済み以外で表示） */}
          {product.proposalStatus !== "order-received" && product.readingCertainty && (
            <div className="flex items-center gap-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-500 min-w-[60px]">ヨミ:</span>
              <Badge className={`text-xs px-2 py-0.5 ${
                product.readingCertainty === "A" ? "bg-green-100 text-green-800" :
                product.readingCertainty === "B" ? "bg-yellow-100 text-yellow-800" :
                "bg-orange-100 text-orange-800"
              }`}>
                {product.readingCertainty}
              </Badge>
            </div>
          )}

          {/* 実施ステータス（全商材共通） */}
          <div className="flex items-center gap-1.5 text-xs">
            <Play className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-500 min-w-[60px]">実施:</span>
            <Badge className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5">
              {product.executionStatus ? EXECUTION_STATUS_LABELS[product.executionStatus] : "-"}
            </Badge>
          </div>

          {/* 合同抽選会固有ステータス */}
          {isLottery && (
            <>
              <div className="flex items-center gap-1.5 text-xs">
                <Image className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-slate-500 min-w-[60px]">ポスター:</span>
                <Badge className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5">
                  {product.posterStatus ? DESIGN_REQUEST_STATUS_LABELS[product.posterStatus] : "-"}
                </Badge>
              </div>
              {product.dmMailing === "yes" && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-slate-500 min-w-[60px]">DM:</span>
                  <Badge className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5">
                    {product.dmStatus ? DESIGN_REQUEST_STATUS_LABELS[product.dmStatus] : "-"}
                  </Badge>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-slate-500 min-w-[60px]">通知書:</span>
                <Badge className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5">
                  {product.winnerListStatus ? DESIGN_REQUEST_STATUS_LABELS[product.winnerListStatus] : "-"}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Gift className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-slate-500 min-w-[60px]">景品:</span>
                <Badge className={`text-xs px-2 py-0.5 ${product.prizeOrdered ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                  {product.prizeOrdered ? "発注済み" : "-"}
                </Badge>
              </div>
            </>
          )}

          {/* イベント系キャスティング */}
          {!isLottery && product.casts && product.casts.length > 0 && (
            <>
              <div className="text-xs text-slate-500 mt-2">キャスティング</div>
              <div className="space-y-1">
                {product.casts.map((cast, index) => {
                  const label = BOOKING_STATUS_LABELS[cast.bookingStatus] ?? cast.bookingStatus
                  const color = BOOKING_STATUS_COLORS[cast.bookingStatus] ?? "bg-slate-100 text-slate-600"
                  return (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-slate-600 min-w-[80px]">{cast.type}:</span>
                      <span className="text-slate-800 font-medium">{cast.name}</span>
                      <Badge className={`${color} text-xs px-2 py-0.5`}>
                        {label}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* フッター */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-1">見積金額</div>
              <div className="text-lg font-semibold text-slate-900">
                ¥{product.estimatedBillingAmount.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 mb-1">担当営業</div>
              <div className="text-sm font-medium text-slate-700">
                {projectSalesPersonName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
