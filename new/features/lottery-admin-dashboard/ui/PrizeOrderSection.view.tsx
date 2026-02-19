import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send } from "lucide-react"
import type { PrizeOrderDocument, PrizeDeliveryInfoByVendor } from "@/new/api/types"

// ─── Step number badge ───

const StepNumber = ({ n }: { n: number }) => (
  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs shrink-0">
    {n}
  </span>
)

// ─── Helper ───

function fmtDate(iso: string): string {
  if (!iso) return "-"
  try {
    return new Date(iso).toLocaleString("ja-JP")
  } catch {
    return iso
  }
}

// ─── Props ───

export interface PrizeOrderSectionViewProps {
  prizeOrdersByVendor?: PrizeOrderDocument[]
  prizeOrderGeneratedAt?: string
  prizeOrderRequestedAt?: string
  prizeDeliveryInfoByVendor?: PrizeDeliveryInfoByVendor[]
  canGenerate: boolean
  desiredDeliveryDate: string
  onDesiredDeliveryDateChange: (date: string) => void
  onGenerate: () => void
  onRequestSend: (vendorId: string) => void
  onConfirmSend: () => void
  onCancelSend: () => void
  pendingVendorId: string | null
}

// ─── Main View ───

export const PrizeOrderSectionView = ({
  prizeOrdersByVendor,
  prizeOrderGeneratedAt,
  prizeOrderRequestedAt,
  prizeDeliveryInfoByVendor,
  canGenerate,
  desiredDeliveryDate,
  onDesiredDeliveryDateChange,
  onGenerate,
  onRequestSend,
  onConfirmSend,
  onCancelSend,
  pendingVendorId,
}: PrizeOrderSectionViewProps) => {
  const hasOrders = prizeOrdersByVendor && prizeOrdersByVendor.length > 0
  const allSent = hasOrders && prizeOrdersByVendor.every((o) => !!o.requestedAt)
  const hasDeliveryInfo = prizeDeliveryInfoByVendor && prizeDeliveryInfoByVendor.length > 0

  const pendingVendorOrder = pendingVendorId && hasOrders
    ? prizeOrdersByVendor.find((o) => o.vendorId === pendingVendorId) ?? null
    : null

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">景品発注処理</CardTitle>
          <CardDescription className="text-xs">
            1. 発注書生成 → 2. 業者ごとに発注メール送信 → 3. 配送情報確認
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* ── Step 1: 発注書の生成 ── */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <StepNumber n={1} />
              景品発注書の生成
            </h4>
            <p className="text-xs text-muted-foreground">
              景品情報を元に業者別の発注書を生成します。
            </p>
            {!prizeOrderGeneratedAt ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label htmlFor="desired-delivery-date" className="text-sm whitespace-nowrap">
                    納品希望日
                  </Label>
                  <Input
                    id="desired-delivery-date"
                    type="date"
                    value={desiredDeliveryDate}
                    onChange={(e) => onDesiredDeliveryDateChange(e.target.value)}
                    className="w-[200px] h-8 text-sm"
                  />
                </div>
                <Button onClick={onGenerate} size="sm" disabled={!canGenerate}>
                  発注書を生成
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm">
                  <p className="font-medium">発注書を生成しました</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {hasOrders ? `${prizeOrdersByVendor.length}社分` : "0社分"}の発注書
                  </p>
                  {hasOrders && prizeOrdersByVendor[0]?.desiredDeliveryDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      納品希望日: <span className="font-medium text-foreground">{prizeOrdersByVendor[0].desiredDeliveryDate}</span>
                    </p>
                  )}
                </div>

                {/* Vendor preview cards */}
                {hasOrders && (
                  <div className="space-y-3">
                    {prizeOrdersByVendor.map((order) => (
                      <div key={order.vendorId} className="border rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">{order.vendorName}</h5>
                          <Badge variant="secondary" className="text-xs">
                            {order.prizeItems.length}品目
                          </Badge>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>等級</TableHead>
                              <TableHead>景品名</TableHead>
                              <TableHead className="text-right">数量</TableHead>
                              {order.prizeItems.some((i) => i.unitPrice) && (
                                <TableHead className="text-right">単価</TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.prizeItems.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item.rank}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                {order.prizeItems.some((i) => i.unitPrice) && (
                                  <TableCell className="text-right">
                                    {item.unitPrice ? `¥${item.unitPrice.toLocaleString()}` : "-"}
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* ── Step 2: 発注メール送信 ── */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <StepNumber n={2} />
              発注依頼メールの送信
            </h4>

            {allSent ? (
              <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm space-y-2">
                <p className="font-medium">全業者に発注メール送信済み</p>
                {prizeOrdersByVendor.map((order) => (
                  <div key={order.vendorId} className="flex justify-between text-xs text-muted-foreground">
                    <span>{order.vendorName}</span>
                    <span>{fmtDate(order.requestedAt)}</span>
                  </div>
                ))}
              </div>
            ) : !prizeOrderGeneratedAt ? (
              <p className="text-xs text-muted-foreground">
                Step 1 で発注書を生成すると送信が可能になります。
              </p>
            ) : hasOrders ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  業者ごとに発注依頼メールを送信します。パスワード付きファイルが添付されます。
                </p>
                {prizeOrdersByVendor.map((order) => (
                  <div
                    key={order.vendorId}
                    className="flex items-center justify-between border rounded-md p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{order.vendorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.prizeItems.map((i) => i.name).join("、")}
                        （計 {order.prizeItems.reduce((s, i) => s + (parseInt(i.quantity, 10) || 0), 0)}個）
                      </p>
                    </div>
                    {order.requestedAt ? (
                      <Badge className="bg-green-100 text-green-800 text-xs shrink-0">
                        送信済み {fmtDate(order.requestedAt)}
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => onRequestSend(order.vendorId)}
                      >
                        発注メール送信
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                発注対象の業者がありません。景品情報に業者マスタを紐付けてください。
              </p>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* ── Step 3: 配送情報参照 ── */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <StepNumber n={3} />
              景品業者からの配送情報の参照
            </h4>
            <p className="text-xs text-muted-foreground">
              景品業者が入力した配送情報を確認できます。
            </p>

            {!hasDeliveryInfo ? (
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-md p-4 text-center bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  {allSent
                    ? "景品業者からの配送情報入力待ちです。"
                    : "Step 2 で発注メールを送信すると配送情報が入力可能になります。"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {prizeDeliveryInfoByVendor!.map((vendor) => (
                  <div key={vendor.vendorId} className="border rounded-md p-4 space-y-3 bg-background">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b">
                      <p className="font-medium text-sm">{vendor.vendorName}</p>
                      {vendor.deliveredAt && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          入力済み
                        </Badge>
                      )}
                    </div>

                    {/* Summary info */}
                    <div className="bg-muted/30 rounded-md p-3 text-sm space-y-1">
                      {vendor.carrierName && (
                        <p>
                          <span className="text-muted-foreground">配送業者:</span>{" "}
                          <span className="font-medium">{vendor.carrierName}</span>
                        </p>
                      )}
                      {vendor.trackingNumber && (
                        <p>
                          <span className="text-muted-foreground">追跡番号:</span>{" "}
                          <span className="font-mono">{vendor.trackingNumber}</span>
                        </p>
                      )}
                      {vendor.shippedAt && (
                        <p>
                          <span className="text-muted-foreground">発送日:</span>{" "}
                          {new Date(vendor.shippedAt).toLocaleDateString("ja-JP")}
                        </p>
                      )}
                      {vendor.deliveredAt && (
                        <p>
                          <span className="text-muted-foreground">入力日時:</span>{" "}
                          {fmtDate(vendor.deliveredAt)}
                        </p>
                      )}
                    </div>

                    {/* Per-winner delivery table */}
                    {vendor.deliveries && vendor.deliveries.length > 0 && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>当選者名</TableHead>
                            <TableHead>配送業者</TableHead>
                            <TableHead>追跡番号</TableHead>
                            <TableHead>発送日</TableHead>
                            <TableHead>発送完了日</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vendor.deliveries.map((d) => (
                            <TableRow key={d.winnerId}>
                              <TableCell>{d.winnerName}</TableCell>
                              <TableCell>{d.carrierName ?? "-"}</TableCell>
                              <TableCell className="font-mono text-xs">
                                {d.trackingNumber ?? "-"}
                              </TableCell>
                              <TableCell>
                                {d.shippedAt
                                  ? new Date(d.shippedAt).toLocaleDateString("ja-JP")
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {d.deliveredAt
                                  ? new Date(d.deliveredAt).toLocaleDateString("ja-JP")
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── 景品発注 送信確認モーダル ── */}
      <Dialog open={!!pendingVendorOrder} onOpenChange={(open) => { if (!open) onCancelSend() }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>景品発注メール送信</DialogTitle>
            <DialogDescription>
              以下の内容で発注依頼メールを送信します。
            </DialogDescription>
          </DialogHeader>
          {pendingVendorOrder && (
            <div className="rounded-md border p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">送信先業者</span>
                <span className="font-medium">{pendingVendorOrder.vendorName}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">対象景品</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {pendingVendorOrder.prizeItems.map((p, idx) => (
                    <li key={idx} className="text-sm">
                      {p.name} × {p.quantity}名分
                    </li>
                  ))}
                </ul>
              </div>
              {pendingVendorOrder.desiredDeliveryDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">納品希望日</span>
                  <span className="font-medium">{pendingVendorOrder.desiredDeliveryDate}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">添付ファイル</span>
                <span className="font-medium">発注データ（パスワード保護）</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={onCancelSend}>
              キャンセル
            </Button>
            <Button onClick={onConfirmSend} className="gap-2">
              <Send className="h-4 w-4" />
              メール送信を実行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
