import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, CheckCircle2, AlertCircle, Link2, ImageIcon, Edit2, Check, X } from "lucide-react"
import { BannerPreviewView } from "@/features/product-management-dashboard/ui/components/BannerPreview.view"
import type { BannerData } from "@/features/product-management-dashboard/model/types"

export type ProjectWithMachines = {
  id: number
  projectNumber?: string
  projectName: string
  eventProductName?: string
  targetMachineNames: string[]
  pachitownMachineNames: string[]
  pachitownLinked?: boolean
  pachitownLinkedDate?: string
  bannerGenerated?: boolean
  bannerData?: BannerData
}

export type ProjectMachinesSectionViewProps = {
  projects: ProjectWithMachines[]
  onOpenBanner: (productId: number) => void
  onPachitownLink: (productId: number) => void
  editingProductId: number | null
  editingMachineIndex: number | null
  editingMachineName: string
  onStartEditMachine: (productId: number, index: number, currentName: string) => void
  onEditMachineNameChange: (value: string) => void
  onSaveEditMachine: (productId: number, index: number) => void
  onCancelEditMachine: () => void
}

export const ProjectMachinesSectionView = ({
  projects,
  onOpenBanner,
  onPachitownLink,
  editingProductId,
  editingMachineIndex,
  editingMachineName,
  onStartEditMachine,
  onEditMachineNameChange,
  onSaveEditMachine,
  onCancelEditMachine,
}: ProjectMachinesSectionViewProps) => {
  const hasMachines = (p: ProjectWithMachines) => (p.targetMachineNames?.length ?? 0) > 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            <CardTitle>スロセレ案件</CardTitle>
          </div>
          <CardDescription>
            スロセレから連携された案件を表示します。機種が入力された案件は自動でパチタウン用名称に変換され、変換前・変換後が表示されます。バナー作成後にパチタウンへ連携できます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-slate-500 text-sm">スロセレの案件はありません。</p>
          ) : (
            <ul className="space-y-4">
              {projects.map((p) => {
                const registered = hasMachines(p)
                const hasConverted = (p.pachitownMachineNames?.length ?? 0) > 0
                const canLink = p.bannerGenerated && !p.pachitownLinked
                return (
                  <li
                    key={p.id}
                    className={`rounded-lg border-2 p-4 ${
                      registered
                        ? "border-amber-200 bg-amber-50/50"
                        : "border-slate-200 bg-slate-50/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-500">
                            案件No: {p.projectNumber ?? "-"}
                          </span>
                          {registered ? (
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-amber-800 border-amber-200 shrink-0 gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              機種登録済み
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 text-slate-600 border-slate-200 shrink-0 gap-1"
                            >
                              <AlertCircle className="h-3.5 w-3.5" />
                              機種未登録
                            </Badge>
                          )}
                          {p.pachitownLinked && (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-800 border-emerald-200 shrink-0 gap-1"
                            >
                              <Link2 className="h-3.5 w-3.5" />
                              パチタウン連携済み
                              {p.pachitownLinkedDate ? `（${p.pachitownLinkedDate}）` : ""}
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-slate-900 truncate">
                          {p.eventProductName || "無題"}
                        </p>
                        {p.projectName && p.projectName !== p.eventProductName && (
                          <p className="text-xs text-slate-500 truncate">
                            {p.projectName}
                          </p>
                        )}
                        {registered ? (
                          <div className="mt-3 space-y-2">
                            <div>
                              <span className="text-xs font-medium text-slate-500">変換前（顧客入力）: </span>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {p.targetMachineNames.map((name, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center rounded-md bg-slate-200 px-2.5 py-0.5 text-sm font-medium text-slate-700"
                                  >
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {hasConverted && (
                              <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-semibold text-amber-900">変換後（パチタウン用）</span>
                                  <Badge variant="outline" className="text-xs bg-white border-amber-200 text-amber-700">
                                    <Edit2 className="h-2.5 w-2.5 mr-1" />
                                    クリックで編集可能
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {p.pachitownMachineNames.map((name, i) => {
                                    const isEditing = editingProductId === p.id && editingMachineIndex === i
                                    return isEditing ? (
                                      <div key={i} className="inline-flex items-center gap-1 bg-white rounded-md border-2 border-amber-400 p-1">
                                        <Input
                                          value={editingMachineName}
                                          onChange={(e) => onEditMachineNameChange(e.target.value)}
                                          className="h-7 w-40 text-sm border-none focus-visible:ring-0"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              onSaveEditMachine(p.id, i)
                                            } else if (e.key === "Escape") {
                                              onCancelEditMachine()
                                            }
                                          }}
                                          placeholder="機種名を入力"
                                        />
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0 hover:bg-green-100"
                                          onClick={() => onSaveEditMachine(p.id, i)}
                                          title="保存 (Enter)"
                                        >
                                          <Check className="h-4 w-4 text-green-600" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0 hover:bg-red-100"
                                          onClick={onCancelEditMachine}
                                          title="キャンセル (Esc)"
                                        >
                                          <X className="h-4 w-4 text-red-600" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <button
                                        key={i}
                                        type="button"
                                        className="group inline-flex items-center gap-1.5 rounded-md bg-white border-2 border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-900 hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer"
                                        onClick={() => onStartEditMachine(p.id, i, name)}
                                        title="クリックして編集"
                                      >
                                        <span>{name}</span>
                                        <Edit2 className="h-3 w-3 text-amber-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                                      </button>
                                    )
                                  })}
                                </div>
                                <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                                  <Edit2 className="h-3 w-3" />
                                  機種名をクリックすると修正できます
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="mt-1 text-sm text-slate-500">
                            対象機種がまだ登録されていません。専用フォームで入力された機種がここに表示されます。
                          </p>
                        )}
                        {p.bannerData && (
                          <div className="mt-3 w-full max-w-xs">
                            <span className="text-xs font-medium text-slate-500 block mb-1">バナープレビュー</span>
                            <button
                              type="button"
                              className="w-full text-left rounded-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              onClick={() => onOpenBanner(p.id)}
                              aria-label="バナーを編集"
                            >
                              <BannerPreviewView bannerData={p.bannerData} size="small" className="cursor-pointer hover:opacity-90 transition-opacity" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => onOpenBanner(p.id)}
                        >
                          <ImageIcon className="h-4 w-4" />
                          バナー作成
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => onPachitownLink(p.id)}
                          disabled={!p.bannerGenerated || !!p.pachitownLinked}
                          title={!p.bannerGenerated ? "バナー作成後に連携できます" : p.pachitownLinked ? "連携済み" : "パチタウンに連携"}
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
