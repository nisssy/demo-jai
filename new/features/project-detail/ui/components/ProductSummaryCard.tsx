import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, CheckCircle2, Play, FileText, Gift, Mail, Image, BarChart3, ArrowUpCircle, RotateCcw } from "lucide-react"
import { PROPOSAL_STATUS_LABELS, BOOKING_STATUS_LABELS, EXECUTION_STATUS_LABELS, DESIGN_REQUEST_STATUS_LABELS } from "@/new/api/display"
import type { BookingStatus } from "@/new/api/types"
import type { ProductSummary } from "@/new/features/project-detail/model/types"

const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  "tentative_requesting": "bg-yellow-100 text-yellow-800",
  "tentative_failed": "bg-red-100 text-red-800",
  "tentative_completed": "bg-green-100 text-green-800",
  "confirmed_requesting": "bg-purple-100 text-purple-800",
  "confirmed_failed": "bg-red-100 text-red-800",
  "confirmed_completed": "bg-blue-100 text-blue-800",
}

type ProductSummaryCardProps = {
  product: ProductSummary
  salesPersonName?: string
  onEdit: () => void
  onUpdateCastBookingStatus?: (productId: number, castName: string, castType: string, targetStatus: BookingStatus) => void
}

export const ProductSummaryCard = ({ product, salesPersonName, onEdit, onUpdateCastBookingStatus }: ProductSummaryCardProps) => {
  const isLottery = product.category === "ポイント" && product.eventType === "合同抽選会"

  return (
    <div
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={onEdit}
    >
      <div className="space-y-3">
        {/* ヘッダー */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-700 text-white text-xs">{product.category}</Badge>
              <Badge variant="outline" className="text-xs">{product.eventType}</Badge>
              {product.threeSetPlan && (
                <Badge className="bg-amber-100 text-amber-800 text-xs">3点セット</Badge>
              )}
            </div>
            <h4 className="font-medium text-slate-900">
              {product.eventProductName || "商材名未設定"}
            </h4>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          {product.eventDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {product.eventDate}
            </span>
          )}
        </div>

        {/* ステータス */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {/* 提案ステータス */}
          <div className="flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-500 min-w-[60px]">提案:</span>
            <Badge className={`text-xs px-2 py-0.5 ${product.proposalStatusRaw === "order-received" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
              {product.proposalStatus ?? "-"}
            </Badge>
          </div>

          {/* ヨミ（受注前のみ表示） */}
          {product.proposalStatusRaw !== "order-received" && (
            <div className="flex items-center gap-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-500 min-w-[60px]">ヨミ:</span>
              <Badge className={`text-xs px-2 py-0.5 ${product.readingCertainty === "A" ? "bg-green-100 text-green-800" : product.readingCertainty === "B" ? "bg-yellow-100 text-yellow-800" : product.readingCertainty === "C" ? "bg-orange-100 text-orange-800" : "bg-slate-100 text-slate-600"}`}>
                {product.readingCertainty || "-"}
              </Badge>
            </div>
          )}

          {/* 実施ステータス */}
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
          {!isLottery && (product.casts.length > 0 || product.undecidedCasts.length > 0) && (
            <>
              <div className="text-xs text-slate-500 mt-2">キャスティング</div>
              <div className="space-y-1">
                {product.undecidedCasts.map((uc, index) => (
                  <div key={`undecided-${index}`} className="flex items-center gap-2 text-xs">
                    <Users className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-slate-600 min-w-[80px]">{uc.type}:</span>
                    <span className="text-slate-500">{uc.count}名</span>
                    <Badge className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5">
                      手配依頼中
                    </Badge>
                  </div>
                ))}
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
                      {cast.bookingStatus === "tentative_requesting" && onUpdateCastBookingStatus && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1 text-purple-700 border-purple-300 hover:bg-purple-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateCastBookingStatus(product.id, cast.name, cast.type, "confirmed_requesting")
                          }}
                        >
                          <ArrowUpCircle className="h-3 w-3" />
                          本押さえ依頼に変更
                        </Button>
                      )}
                      {cast.bookingStatus === "tentative_completed" && onUpdateCastBookingStatus && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1 text-purple-700 border-purple-300 hover:bg-purple-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateCastBookingStatus(product.id, cast.name, cast.type, "confirmed_requesting")
                          }}
                        >
                          <ArrowUpCircle className="h-3 w-3" />
                          本押さえ依頼
                        </Button>
                      )}
                      {cast.bookingStatus === "tentative_failed" && onUpdateCastBookingStatus && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1 text-orange-700 border-orange-300 hover:bg-orange-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateCastBookingStatus(product.id, cast.name, cast.type, "tentative_requesting")
                          }}
                        >
                          <RotateCcw className="h-3 w-3" />
                          仮押さえ再依頼
                        </Button>
                      )}
                      {cast.bookingStatus === "confirmed_failed" && onUpdateCastBookingStatus && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1 text-purple-700 border-purple-300 hover:bg-purple-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateCastBookingStatus(product.id, cast.name, cast.type, "confirmed_requesting")
                          }}
                        >
                          <RotateCcw className="h-3 w-3" />
                          本押さえ再依頼
                        </Button>
                      )}
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
                ¥{(product.estimatedBillingAmount ?? 0).toLocaleString()}
              </div>
            </div>
            {salesPersonName && (
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-1">担当営業</div>
                <div className="text-sm font-medium text-slate-700">
                  {salesPersonName}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
