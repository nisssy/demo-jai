import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, MessageCircle } from "lucide-react"
import { BOOKING_STATUS_LABELS } from "@/new/api/display"
import type { ProductionGroup, CastSubTab, UndecidedCastRequest } from "../../hooks/useEventTeamDashboard"
import type { BookingStatus, Product } from "@/new/api/types"

export type CastArrangementTabViewProps = {
  castSubTab: CastSubTab
  onSubTabChange: (tab: CastSubTab) => void
  tentativeGroups: ProductionGroup[]
  confirmedGroups: ProductionGroup[]
  tentativeEntryCount: number
  confirmedEntryCount: number
  undecidedCastRequests: UndecidedCastRequest[]
  onCompleteCast: (castName: string, castRole: "companion" | "director" | "mc", productId: number) => void
  onOpenHoldFailure: (castName: string, castRole: "companion" | "director" | "mc", productId: number) => void
  onOpenCastAssignment: (product: Product) => void
  onOpenChat: (product: Product) => void
  onClickProduct: (productId: number) => void
}

const subTabTriggerClass = "relative px-3 py-2 text-sm font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"

function getStatusBadgeClass(status: BookingStatus): string {
  if (status.includes("failed")) return "bg-red-50 text-red-700 border-red-200"
  if (status === "tentative_completed") return "bg-green-50 text-green-700 border-green-200"
  return "bg-yellow-50 text-yellow-700 border-yellow-200"
}

function ProductionGroupList({
  groups,
  renderActions,
  onOpenChat,
  onClickProduct,
}: {
  groups: ProductionGroup[]
  renderActions: (castName: string, roleKey: "companion" | "director" | "mc", productId: number, status: BookingStatus) => React.ReactNode
  onOpenChat: (product: Product) => void
  onClickProduct: (productId: number) => void
}) {
  if (groups.length === 0) {
    return <div className="text-center py-8 text-slate-500">対象のキャストはありません</div>
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.productionName} className="border border-slate-300 rounded-lg p-4 space-y-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">プロダクション: {group.productionName}</h2>
            <p className="text-xs text-slate-600 mt-1">キャスト: {group.casts.length}名</p>
          </div>
          <div className="space-y-6">
            {group.casts.map((cast) => {
              const roleKey = cast.castRole === "コンパニオン" ? "companion" : cast.castRole === "ディレクター" ? "director" : "mc" as const
              return (
                <div key={`${group.productionName}-${cast.castRole}-${cast.castName}`} className="border border-slate-200 rounded-lg p-4 bg-white">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {cast.castRole}: {cast.castName}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">{cast.entries.length}件の案件</p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>商材名</TableHead>
                        <TableHead>案件No</TableHead>
                        <TableHead>実施日</TableHead>
                        <TableHead>イベント区分</TableHead>
                        <TableHead>押さえ状態</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cast.entries.map((entry, i) => (
                        <TableRow key={`${entry.product.id}-${i}`}>
                          <TableCell className="font-medium">
                            <button type="button" className="text-blue-600 hover:text-blue-800 hover:underline" onClick={() => onClickProduct(entry.product.id)}>
                              {entry.product.eventProductName}
                            </button>
                          </TableCell>
                          <TableCell>{entry.product.projectNumber}</TableCell>
                          <TableCell>{entry.product.eventDate || "未定"}</TableCell>
                          <TableCell>{entry.product.eventType}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeClass(entry.bookingStatus)}>
                              {BOOKING_STATUS_LABELS[entry.bookingStatus]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {renderActions(cast.castName, roleKey, entry.product.id, entry.bookingStatus)}
                              <Button size="sm" variant="ghost" className="text-slate-500 hover:text-blue-600" onClick={() => onOpenChat(entry.product)}>
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export function CastArrangementTabView({
  castSubTab,
  onSubTabChange,
  tentativeGroups,
  confirmedGroups,
  tentativeEntryCount,
  confirmedEntryCount,
  undecidedCastRequests,
  onCompleteCast,
  onOpenHoldFailure,
  onOpenCastAssignment,
  onOpenChat,
  onClickProduct,
}: CastArrangementTabViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">キャスト手配</CardTitle>
        <CardDescription className="text-slate-600">キャスティング情報を確認して押さえ処理を行ってください</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={castSubTab} onValueChange={(v) => onSubTabChange(v as CastSubTab)}>
          <div className="border-b border-slate-100 mb-6">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger value="tentative" className={subTabTriggerClass}>
                仮押さえ
                {tentativeEntryCount > 0 && (
                  <Badge className="ml-1.5 bg-yellow-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {tentativeEntryCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="confirmed" className={subTabTriggerClass}>
                本押さえ
                {confirmedEntryCount > 0 && (
                  <Badge className="ml-1.5 bg-blue-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {confirmedEntryCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tentative" className="mt-0">
            <ProductionGroupList
              groups={tentativeGroups}
              onOpenChat={onOpenChat}
              onClickProduct={onClickProduct}
              renderActions={(castName, roleKey, productId, status) => (
                <>
                  <Button size="sm" variant="outline" onClick={() => onCompleteCast(castName, roleKey, productId)}>
                    仮押さえ完了
                  </Button>
                  {status === "tentative_requesting" && (
                    <Button size="sm" variant="destructive" onClick={() => onOpenHoldFailure(castName, roleKey, productId)}>
                      仮押さえ不可
                    </Button>
                  )}
                </>
              )}
            />
          </TabsContent>

          <TabsContent value="confirmed" className="mt-0">
            <ProductionGroupList
              groups={confirmedGroups}
              onOpenChat={onOpenChat}
              onClickProduct={onClickProduct}
              renderActions={(castName, roleKey, productId, status) => (
                <>
                  <Button size="sm" variant="outline" onClick={() => onCompleteCast(castName, roleKey, productId)}>
                    本押さえ完了
                  </Button>
                  {status === "confirmed_requesting" && (
                    <Button size="sm" variant="destructive" onClick={() => onOpenHoldFailure(castName, roleKey, productId)}>
                      本押さえ不可
                    </Button>
                  )}
                </>
              )}
            />
          </TabsContent>
        </Tabs>

        {/* 未定キャスト手配依頼 */}
        {undecidedCastRequests.length > 0 && (
          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-orange-500" />
              <h3 className="text-base font-semibold text-slate-900">未定キャスト手配依頼</h3>
              <Badge className="bg-orange-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                {undecidedCastRequests.length}
              </Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商材名</TableHead>
                  <TableHead>案件名</TableHead>
                  <TableHead>案件No</TableHead>
                  <TableHead>実施日</TableHead>
                  <TableHead>イベント区分</TableHead>
                  <TableHead>手配依頼</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {undecidedCastRequests.map((req) => (
                  <TableRow key={req.product.id}>
                    <TableCell className="font-medium">
                      <button type="button" className="text-blue-600 hover:text-blue-800 hover:underline" onClick={() => onClickProduct(req.product.id)}>
                        {req.product.eventProductName}
                      </button>
                    </TableCell>
                    <TableCell>{req.projectName}</TableCell>
                    <TableCell>{req.product.projectNumber}</TableCell>
                    <TableCell>{req.product.eventDate || "未定"}</TableCell>
                    <TableCell>{req.product.eventType}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {req.companionCount > 0 && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            コンパニオン {req.companionCount}名
                          </Badge>
                        )}
                        {req.directorCount > 0 && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            ディレクター {req.directorCount}名
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-slate-500 hover:text-blue-600" onClick={() => onOpenChat(req.product)}>
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onOpenCastAssignment(req.product)}>
                          キャスト割り当て
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
