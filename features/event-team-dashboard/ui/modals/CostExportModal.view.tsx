import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import type { Project } from "@/features/event-team-dashboard/hooks/useEventTeamDashboard"

export type CostExportStatuses = {
  inProgress: boolean
  postEvent: boolean
}

export type CostExportModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  dateFrom: string
  dateTo: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  format: "billing" | "cowboy"
  onFormatChange: (value: "billing" | "cowboy") => void
  statuses: CostExportStatuses
  onStatusChange: (key: keyof CostExportStatuses, checked: boolean) => void
  targetProjects: Project[]
  totalAmount: number
  onDownload: () => void
  downloadDisabled: boolean
  onClose: () => void
}

export const CostExportModalView = ({
  open,
  onOpenChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  format,
  onFormatChange,
  statuses,
  onStatusChange,
  targetProjects,
  totalAmount,
  onDownload,
  downloadDisabled,
  onClose,
}: CostExportModalViewProps) => {
  const showForm = dateFrom && dateTo && (statuses.inProgress || statuses.postEvent)
  const hasProjects = targetProjects.length > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) onClose()
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>コストデータ出力</DialogTitle>
          <DialogDescription>期間を指定して複数案件のコストデータを出力します</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costExportDateFrom">開始日</Label>
                <Input id="costExportDateFrom" type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costExportDateTo">終了日</Label>
                <Input id="costExportDateTo" type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>対象ステータス</Label>
            <div className="flex flex-col gap-3 p-4 border border-slate-200 rounded-lg bg-slate-50">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-in-progress"
                  checked={statuses.inProgress}
                  onCheckedChange={(checked) => onStatusChange("inProgress", checked === true)}
                />
                <Label htmlFor="status-in-progress" className="text-sm font-medium cursor-pointer">
                  手配進行中
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-post-event"
                  checked={statuses.postEvent}
                  onCheckedChange={(checked) => onStatusChange("postEvent", checked === true)}
                />
                <Label htmlFor="status-post-event" className="text-sm font-medium cursor-pointer">
                  イベント終了処理中
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>出力形式</Label>
            <Select value={format} onValueChange={(value) => onFormatChange(value as "billing" | "cowboy")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="billing">請求データ(CSV)</SelectItem>
                <SelectItem value="cowboy">Cowboy形式</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!dateFrom || !dateTo ? (
            <div className="text-center py-8 text-slate-500">開始日と終了日を選択してください</div>
          ) : !statuses.inProgress && !statuses.postEvent ? (
            <div className="text-center py-8 text-slate-500">少なくとも1つのステータスを選択してください</div>
          ) : !hasProjects ? (
            <div className="text-center py-8 text-slate-500">指定期間内に対象案件がありません</div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">対象案件数</span>
                  <span className="text-lg font-semibold text-slate-900">{targetProjects.length}件</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-slate-700">合計金額</span>
                  <span className="text-lg font-semibold text-blue-600">¥{Math.round(totalAmount).toLocaleString()}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>案件名</TableHead>
                        <TableHead>案件No</TableHead>
                        <TableHead>実施日</TableHead>
                        <TableHead className="text-right">合計金額</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {targetProjects.map((project) => {
                        const projectTotal =
                          (project.castingCost || 0) +
                          (project.transportationFee || 0) +
                          (project.accommodationFee || 0) +
                          (project.postPRCost || 0)
                        return (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.projectName}</TableCell>
                            <TableCell>{project.projectNumber}</TableCell>
                            <TableCell>{project.eventDate || project.date}</TableCell>
                            <TableCell className="text-right">¥{Math.round(projectTotal).toLocaleString()}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button onClick={onDownload} className="w-full gap-2" disabled={downloadDisabled}>
                  <Download className="h-4 w-4" />
                  {format === "billing" ? "請求データ(CSV)でダウンロード" : "Cowboy形式でダウンロード"}
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
