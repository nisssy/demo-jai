import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Link2, MessageCircle, CheckCircle2, AlertCircle } from "lucide-react"
import type { SlotReport } from "@/new/api/types"

export type DuringEventProduct = {
  id: number
  projectNumber?: string
  projectName: string
  eventProductName?: string
  interimReport?: SlotReport
  interimPachitownLinked?: boolean
  interimPachitownLinkedDate?: string
}

export type DuringEventSectionViewProps = {
  products: DuringEventProduct[]
  onLinkInterimPachitown: (productId: number) => void
  onOpenChat: (productId: number) => void
}

const SlotReportDisplay = ({ report }: { report: SlotReport }) => {
  return (
    <div className="mt-3 space-y-3">
      <div className="bg-white rounded-lg p-3 border border-blue-100">
        <span className="text-xs font-semibold text-blue-900 block mb-2">20スロ 全体データ</span>
        {report.uploadedAt && (
          <span className="text-xs text-slate-500 block mb-2">入力日: {report.uploadedAt}</span>
        )}
        <div className="grid grid-cols-4 gap-3">
          <div>
            <span className="text-xs text-slate-500">台数</span>
            <p className="text-sm font-medium">{report.slot20Count ?? "-"}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">総差枚</span>
            <p className="text-sm font-medium">{report.slot20TotalDiff ?? "-"}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">平均G数</span>
            <p className="text-sm font-medium">{report.slot20AvgGames ?? "-"}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">平均差枚</span>
            <p className="text-sm font-medium">{report.slot20AvgDiff ?? "-"}</p>
          </div>
        </div>
      </div>

      {report.machineReports && report.machineReports.length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <span className="text-xs font-semibold text-blue-900 block mb-2">対象機種別データ</span>
          <div className="space-y-2">
            {report.machineReports.map((m) => (
              <div key={m.machineName} className="flex items-center gap-4 text-sm">
                <Badge variant="outline" className="text-xs shrink-0">{m.machineName}</Badge>
                <span className="text-slate-500">台数: <span className="text-slate-900 font-medium">{m.count ?? "-"}</span></span>
                <span className="text-slate-500">平均G数: <span className="text-slate-900 font-medium">{m.avgGames ?? "-"}</span></span>
                <span className="text-slate-500">平均差枚: <span className="text-slate-900 font-medium">{m.avgDiff ?? "-"}</span></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const DuringEventSectionView = ({
  products,
  onLinkInterimPachitown,
  onOpenChat,
}: DuringEventSectionViewProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle>実施中の案件</CardTitle>
          </div>
          <CardDescription>
            外注業者から入力された中間レポートを確認し、パチタウンに連携してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-slate-500 text-sm">実施中の案件はありません。</p>
          ) : (
            <ul className="space-y-4">
              {products.map((p) => {
                const hasInterimReport = !!p.interimReport
                return (
                  <li
                    key={p.id}
                    className={`rounded-lg border-2 p-4 ${
                      hasInterimReport
                        ? "border-blue-200 bg-blue-50/50"
                        : "border-slate-200 bg-slate-50/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-500">
                            案件No: {p.projectNumber ?? "-"}
                          </span>
                          {hasInterimReport ? (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 border-blue-200 shrink-0 gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              中間レポート入力済み
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 text-slate-600 border-slate-200 shrink-0 gap-1"
                            >
                              <AlertCircle className="h-3.5 w-3.5" />
                              中間レポート未入力
                            </Badge>
                          )}
                          {p.interimPachitownLinked && (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-800 border-emerald-200 shrink-0 gap-1"
                            >
                              <Link2 className="h-3.5 w-3.5" />
                              パチタウン連携済み
                              {p.interimPachitownLinkedDate ? `（${p.interimPachitownLinkedDate}）` : ""}
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-slate-900 truncate">
                          {p.eventProductName || "無題"}
                        </p>
                        {p.projectName && p.projectName !== p.eventProductName && (
                          <p className="text-xs text-slate-500 truncate">{p.projectName}</p>
                        )}
                        {hasInterimReport && (
                          <SlotReportDisplay report={p.interimReport!} />
                        )}
                        {!hasInterimReport && (
                          <p className="mt-1 text-sm text-slate-500">
                            外注業者からの中間レポートがまだ入力されていません。
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => onOpenChat(p.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          チャット
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => onLinkInterimPachitown(p.id)}
                          disabled={!hasInterimReport || !!p.interimPachitownLinked}
                          title={!hasInterimReport ? "中間レポート入力後に連携できます" : p.interimPachitownLinked ? "連携済み" : "パチタウンに連携"}
                        >
                          <Link2 className="h-4 w-4" />
                          パチタウン連携
                        </Button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
