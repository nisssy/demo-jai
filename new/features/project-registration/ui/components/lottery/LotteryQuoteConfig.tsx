import { Fragment } from "react"
import type { HallQuote, QuoteItem } from "@/new/api/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

type LotteryQuoteConfigProps = {
  quoteGenerated: boolean
  hallQuotes: HallQuote[]
  dmMailing: "yes" | "no"
  onUpdateItem: (hallName: string, itemId: number, updates: Partial<QuoteItem>) => void
  readOnly?: boolean
}

export const LotteryQuoteConfig = ({
  quoteGenerated,
  hallQuotes,
  dmMailing,
  onUpdateItem,
  readOnly = false,
}: LotteryQuoteConfigProps) => {
  if (!quoteGenerated || hallQuotes.length === 0) return null

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-800">明細一覧</h3>
      {hallQuotes.map((hq) => {
        const items = hq.quoteItems.filter((item) => dmMailing === "yes" || item.id !== 3)
        const purchaseTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
        const salesTotal = items.reduce((sum, item) => sum + item.quantity * (item.salesUnitPrice || item.unitPrice), 0)

        return (
          <div key={hq.hallName} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">{hq.hallName}</div>
              {hq.percentage !== undefined && (
                <span className="text-xs text-slate-500">割合: {hq.percentage}%</span>
              )}
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    {/* ── ヘッダー1行目 ── */}
                    <tr className="bg-slate-500 text-white">
                      <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-center">明細<br />番号</th>
                      <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-left">商品名</th>
                      <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 text-left">イベント区分</th>
                      <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 text-left">型番</th>
                      <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-right">数量<br />人数</th>
                      <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-center">仕入<br />軽減税</th>
                      <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 text-right">仕入単価</th>
                      <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-center">販売<br />軽減税</th>
                      <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 text-right">販売単価</th>
                      <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-left">発注先名</th>
                      <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 text-center">納品予定日</th>
                      <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-center">発注<br />期限</th>
                      <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 text-center">発注書ID</th>
                      <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap border-r border-slate-400 align-middle text-center">備配</th>
                      <th rowSpan={2} className="font-medium px-2 py-1.5 whitespace-nowrap align-middle text-center">明細<br />コピー</th>
                    </tr>
                    {/* ── ヘッダー2行目（サブ） ── */}
                    <tr className="bg-slate-500 text-white">
                      <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 border-t border-slate-400 text-left">イベント科目</th>
                      <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 border-t border-slate-400 text-left">貸品等級</th>
                      <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 border-t border-slate-400 text-right">仕入金額</th>
                      <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 border-t border-slate-400 text-right">販売金額</th>
                      <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 border-t border-slate-400 text-center">仕入計上日</th>
                      <th className="font-medium px-2 py-1 whitespace-nowrap border-r border-slate-400 border-t border-slate-400 text-center">発注日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const purchaseAmount = item.quantity * item.unitPrice
                      const salesPrice = item.salesUnitPrice || item.unitPrice
                      const salesAmount = item.quantity * salesPrice
                      const textCell = "text-xs text-slate-700 whitespace-nowrap"
                      return (
                        <Fragment key={item.id}>
                          {/* ── データ1行目 ── */}
                          <tr className="border-t border-slate-200 hover:bg-slate-50">
                            <td rowSpan={2} className="px-2 py-1 text-center text-slate-600 border-r border-slate-100 align-middle font-mono">
                              H{String(item.id).padStart(4, "0")}
                            </td>
                            <td rowSpan={2} className="px-2 py-1 border-r border-slate-100 align-middle">
                              {readOnly ? (
                                <span className={textCell}>{item.name}</span>
                              ) : (
                                <Input
                                  value={item.name}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { name: e.target.value })}
                                  className="h-7 text-xs border-slate-200 min-w-[120px]"
                                />
                              )}
                            </td>
                            <td className="px-2 py-0.5 border-r border-slate-100">
                              {readOnly ? (
                                <span className={textCell}>{item.category || ""}</span>
                              ) : (
                                <Input
                                  value={item.category || ""}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { category: e.target.value })}
                                  className="h-6 text-xs border-slate-200 min-w-[70px]"
                                />
                              )}
                            </td>
                            <td className="px-2 py-0.5 border-r border-slate-100">
                              {readOnly ? (
                                <span className={textCell}>{item.modelNumber || ""}</span>
                              ) : (
                                <Input
                                  value={item.modelNumber || ""}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { modelNumber: e.target.value })}
                                  className="h-6 text-xs border-slate-200 min-w-[65px]"
                                />
                              )}
                            </td>
                            <td rowSpan={2} className="px-2 py-1 border-r border-slate-100 align-middle">
                              {readOnly ? (
                                <div className={`${textCell} text-right`}>{item.quantity}</div>
                              ) : (
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { quantity: parseInt(e.target.value) || 0 })}
                                  className="h-7 text-xs text-right border-slate-200 w-[60px] ml-auto"
                                />
                              )}
                            </td>
                            <td rowSpan={2} className="px-2 py-1 border-r border-slate-100 align-middle text-center">
                              <input
                                type="checkbox"
                                checked={item.purchaseReducedTax === "対象"}
                                onChange={(e) => onUpdateItem(hq.hallName, item.id, { purchaseReducedTax: e.target.checked ? "対象" : "対象外" })}
                                disabled={readOnly}
                                className="h-4 w-4 rounded border-slate-300 accent-slate-600 cursor-pointer disabled:cursor-default disabled:opacity-70"
                              />
                            </td>
                            <td className="px-2 py-0.5 border-r border-slate-100">
                              {readOnly ? (
                                <div className={`${textCell} text-right`}>{item.unitPrice}</div>
                              ) : (
                                <Input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { unitPrice: parseInt(e.target.value) || 0 })}
                                  className="h-6 text-xs text-right border-slate-200 w-[75px] ml-auto"
                                />
                              )}
                            </td>
                            <td rowSpan={2} className="px-2 py-1 border-r border-slate-100 align-middle text-center">
                              <input
                                type="checkbox"
                                checked={item.salesReducedTax === "対象"}
                                onChange={(e) => onUpdateItem(hq.hallName, item.id, { salesReducedTax: e.target.checked ? "対象" : "対象外" })}
                                disabled={readOnly}
                                className="h-4 w-4 rounded border-slate-300 accent-slate-600 cursor-pointer disabled:cursor-default disabled:opacity-70"
                              />
                            </td>
                            <td className="px-2 py-0.5 border-r border-slate-100">
                              {readOnly ? (
                                <div className={`${textCell} text-right`}>{salesPrice}</div>
                              ) : (
                                <Input
                                  type="number"
                                  value={salesPrice}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { salesUnitPrice: parseInt(e.target.value) || 0 })}
                                  className="h-6 text-xs text-right border-slate-200 w-[75px] ml-auto"
                                />
                              )}
                            </td>
                            <td rowSpan={2} className="px-2 py-1 border-r border-slate-100 align-middle">
                              {readOnly ? (
                                <span className={textCell}>{item.orderVendorName || ""}</span>
                              ) : (
                                <Input
                                  value={item.orderVendorName || ""}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { orderVendorName: e.target.value })}
                                  className="h-7 text-xs border-slate-200 min-w-[80px]"
                                />
                              )}
                            </td>
                            <td className="px-2 py-0.5 border-r border-slate-100">
                              {readOnly ? (
                                <span className={textCell}>{item.deliveryDate || ""}</span>
                              ) : (
                                <Input
                                  type="date"
                                  value={item.deliveryDate || ""}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { deliveryDate: e.target.value })}
                                  className="h-6 text-xs border-slate-200 min-w-[120px]"
                                />
                              )}
                            </td>
                            <td rowSpan={2} className="px-2 py-1 border-r border-slate-100 align-middle">
                              {readOnly ? (
                                <span className={textCell}>{item.orderDeadline || ""}</span>
                              ) : (
                                <Input
                                  type="date"
                                  value={item.orderDeadline || ""}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { orderDeadline: e.target.value })}
                                  className="h-7 text-xs border-slate-200 min-w-[120px]"
                                />
                              )}
                            </td>
                            <td className="px-2 py-0.5 border-r border-slate-100">
                              {readOnly ? (
                                <span className={textCell}>{item.orderId || ""}</span>
                              ) : (
                                <Input
                                  value={item.orderId || ""}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { orderId: e.target.value })}
                                  className="h-6 text-xs border-slate-200 min-w-[70px]"
                                />
                              )}
                            </td>
                            <td rowSpan={2} className="px-2 py-1 border-r border-slate-100 align-middle">
                              {readOnly ? (
                                <span className={textCell}>{item.note || ""}</span>
                              ) : (
                                <Input
                                  value={item.note || ""}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { note: e.target.value })}
                                  className="h-7 text-xs border-slate-200 min-w-[60px]"
                                />
                              )}
                            </td>
                            <td rowSpan={2} className="px-2 py-1 text-center align-middle">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    [item.name, item.category, item.eventSubject, item.modelNumber, item.rentalGrade, item.quantity, item.unitPrice].join("\t")
                                  )
                                }}
                              >
                                <Copy className="h-3.5 w-3.5 text-slate-500" />
                              </Button>
                            </td>
                          </tr>
                          {/* ── データ2行目（サブ行） ── */}
                          <tr className="hover:bg-slate-50">
                            <td className="px-2 py-0.5 border-r border-slate-100 border-t border-slate-50">
                              {readOnly ? (
                                <span className={textCell}>{item.eventSubject || ""}</span>
                              ) : (
                                <Input
                                  value={item.eventSubject || ""}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { eventSubject: e.target.value })}
                                  className="h-6 text-xs border-slate-200 min-w-[70px]"
                                />
                              )}
                            </td>
                            <td className="px-2 py-0.5 border-r border-slate-100 border-t border-slate-50">
                              {readOnly ? (
                                <span className={textCell}>{item.rentalGrade || ""}</span>
                              ) : (
                                <Input
                                  value={item.rentalGrade || ""}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { rentalGrade: e.target.value })}
                                  className="h-6 text-xs border-slate-200 min-w-[65px]"
                                />
                              )}
                            </td>
                            <td className="px-2 py-0.5 border-r border-slate-100 border-t border-slate-50 text-right font-medium text-slate-900 whitespace-nowrap">
                              ¥{purchaseAmount.toLocaleString()}
                            </td>
                            <td className="px-2 py-0.5 border-r border-slate-100 border-t border-slate-50 text-right font-medium text-slate-900 whitespace-nowrap">
                              ¥{salesAmount.toLocaleString()}
                            </td>
                            <td className="px-2 py-0.5 border-r border-slate-100 border-t border-slate-50">
                              {readOnly ? (
                                <span className={textCell}>{item.purchaseRecordDate || ""}</span>
                              ) : (
                                <Input
                                  type="date"
                                  value={item.purchaseRecordDate || ""}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { purchaseRecordDate: e.target.value })}
                                  className="h-6 text-xs border-slate-200 min-w-[120px]"
                                />
                              )}
                            </td>
                            <td className="px-2 py-0.5 border-r border-slate-100 border-t border-slate-50">
                              {readOnly ? (
                                <span className={textCell}>{item.orderDate || ""}</span>
                              ) : (
                                <Input
                                  type="date"
                                  value={item.orderDate || ""}
                                  onChange={(e) => onUpdateItem(hq.hallName, item.id, { orderDate: e.target.value })}
                                  className="h-6 text-xs border-slate-200 min-w-[120px]"
                                />
                              )}
                            </td>
                          </tr>
                        </Fragment>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-300 bg-slate-50">
                      <td colSpan={6} className="px-2 py-2 font-semibold text-xs text-slate-700">合計 金額</td>
                      <td className="px-2 py-2 text-right font-bold text-xs text-slate-900 whitespace-nowrap border-r border-slate-100">
                        ¥{purchaseTotal.toLocaleString()}
                      </td>
                      <td />
                      <td className="px-2 py-2 text-right font-bold text-xs text-slate-900 whitespace-nowrap border-r border-slate-100">
                        ¥{salesTotal.toLocaleString()}
                      </td>
                      <td colSpan={6} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )
      })}
      {hallQuotes.length > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <span className="text-sm font-semibold text-slate-700">全ホール合計金額</span>
          <span className="text-lg font-bold text-slate-900">
            ¥{hallQuotes.reduce((sum, hq) => {
              const items = hq.quoteItems.filter((i) => dmMailing === "yes" || i.id !== 3)
              return sum + items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
            }, 0).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  )
}
