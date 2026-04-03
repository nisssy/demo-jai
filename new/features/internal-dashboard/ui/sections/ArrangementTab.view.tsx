import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { History, Send, MessageCircle } from "lucide-react"
import type { Product, Project } from "@/new/api/types"

export type ArrangementTabViewProps = {
  trinityGirlProducts: Product[]
  getProjectForProduct: (product: Product) => Project | undefined
  onOpenAutoArrangement: (product: Product) => void
  onOpenCostumeArrangement: (product: Product) => void
  onOpenStatusHistory: (product: Product) => void
  onOpenChat: (product: Product) => void
  onClickProduct: (productId: number) => void
}

function TrinityGirlTable({
  products,
  onOpenAutoArrangement,
  onOpenCostumeArrangement,
  onOpenStatusHistory,
  onOpenChat,
  onClickProduct,
}: {
  products: Product[]
  onOpenAutoArrangement: (product: Product) => void
  onOpenCostumeArrangement: (product: Product) => void
  onOpenStatusHistory: (product: Product) => void
  onOpenChat: (product: Product) => void
  onClickProduct: (productId: number) => void
}) {
  if (products.length === 0) {
    return <div className="text-center py-8 text-slate-500">トリニティガールの手配案件はありません</div>
  }

  return (
    <div className="overflow-x-auto">
      <div className="relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-white z-10">商材名</TableHead>
              <TableHead>案件No</TableHead>
              <TableHead>実施日</TableHead>
              <TableHead>コンパニオン確定</TableHead>
              <TableHead>ディレクター確定</TableHead>
              <TableHead>MC確定</TableHead>
              <TableHead>ぱちタウン公開状況</TableHead>
              <TableHead className="sticky right-0 bg-white z-10">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const companions = product.selectedCompanions.filter(n => n !== "未定")
              const directors = product.selectedDirectors.filter(n => n !== "未定")
              const mcs = product.selectedMcs.filter(n => n !== "未定")

              const confirmedCompanions = companions.filter(n => {
                const s = product.companionBookingStatus[n]
                return s === "confirmed_completed" || s === "tentative_completed"
              })
              const confirmedDirectors = directors.filter(n => {
                const s = product.directorBookingStatus[n]
                return s === "confirmed_completed" || s === "tentative_completed"
              })
              const confirmedMcs = mcs.filter(n => {
                const s = product.mcBookingStatus[n]
                return s === "confirmed_completed" || s === "tentative_completed"
              })

              const companionCount = Number(product.companionCount) || 0
              const directorCount = Number(product.directorCount) || 0
              const mcCount = Number(product.mcCount) || 0

              let pachitownStatus: string | null = null
              let badgeColor = ""
              if (product.mustSeePublication === "要") {
                if (product.pachitownLinked) {
                  pachitownStatus = "公開済み"
                  badgeColor = "bg-blue-100 text-blue-800"
                } else {
                  pachitownStatus = "公開待ち"
                  badgeColor = "bg-yellow-100 text-yellow-800"
                }
              }

              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium sticky left-0 bg-white z-10">
                    <button type="button" className="text-blue-600 hover:text-blue-800 hover:underline" onClick={() => onClickProduct(product.id)}>
                      {product.eventProductName}
                    </button>
                  </TableCell>
                  <TableCell>{product.projectNumber}</TableCell>
                  <TableCell>{product.eventDate || "未定"}</TableCell>
                  <TableCell>
                    {confirmedCompanions.length > 0 ? (
                      <div className="space-y-1">
                        {confirmedCompanions.map((name, idx) => (
                          <div key={idx} className="text-sm">{name}</div>
                        ))}
                        {confirmedCompanions.length < companionCount && (
                          <p className="text-xs text-slate-500">({companionCount - confirmedCompanions.length}名未確定)</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">{companionCount > 0 ? "未確定" : "-"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {confirmedDirectors.length > 0 ? (
                      <div className="space-y-1">
                        {confirmedDirectors.map((name, idx) => (
                          <div key={idx} className="text-sm">{name}</div>
                        ))}
                        {confirmedDirectors.length < directorCount && (
                          <p className="text-xs text-slate-500">({directorCount - confirmedDirectors.length}名未確定)</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">{directorCount > 0 ? "未確定" : "-"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {confirmedMcs.length > 0 ? (
                      <div className="space-y-1">
                        {confirmedMcs.map((name, idx) => (
                          <div key={idx} className="text-sm">{name}</div>
                        ))}
                        {confirmedMcs.length < mcCount && (
                          <p className="text-xs text-slate-500">({mcCount - confirmedMcs.length}名未確定)</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">{mcCount > 0 ? "未確定" : "-"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {pachitownStatus === null ? (
                      <span className="text-sm text-slate-400">-</span>
                    ) : (
                      <Badge className={badgeColor}>{pachitownStatus}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="sticky right-0 bg-white z-10">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-slate-500 hover:text-blue-600" onClick={() => onOpenChat(product)}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onOpenStatusHistory(product)} className="gap-2">
                        <History className="h-4 w-4" />
                        履歴
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onOpenCostumeArrangement(product)}>
                        衣装手配
                      </Button>
                      <Button size="sm" variant="default" onClick={() => onOpenAutoArrangement(product)} className="gap-2">
                        <Send className="h-4 w-4" />
                        各種手配実行
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function ArrangementTabView({
  trinityGirlProducts,
  onOpenAutoArrangement,
  onOpenCostumeArrangement,
  onOpenStatusHistory,
  onOpenChat,
  onClickProduct,
}: ArrangementTabViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">各種手配</CardTitle>
        <CardDescription className="text-slate-600">受注済みのトリニティガール案件に対して各種手配を実行してください</CardDescription>
      </CardHeader>
      <CardContent>
        <TrinityGirlTable
          products={trinityGirlProducts}
          onOpenAutoArrangement={onOpenAutoArrangement}
          onOpenCostumeArrangement={onOpenCostumeArrangement}
          onOpenStatusHistory={onOpenStatusHistory}
          onOpenChat={onOpenChat}
          onClickProduct={onClickProduct}
        />
      </CardContent>
    </Card>
  )
}
