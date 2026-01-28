import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"
import type { Project } from "@/features/event-team-dashboard/hooks/useEventTeamDashboard"

export type ConfirmationModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onClose: () => void
  onRequestCorrection: () => void
  onConfirmContent: () => void
}

export const ConfirmationModalView = ({
  open,
  onOpenChange,
  project,
  onClose,
  onRequestCorrection,
  onConfirmContent,
}: ConfirmationModalViewProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>内容確認</DialogTitle>
        <DialogDescription>案件の詳細を確認し、確認完了または修正依頼を行ってください</DialogDescription>
      </DialogHeader>
      {project && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-lg mb-3">案件情報</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-600">案件名</Label>
                <p className="font-medium">{project.projectName}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">案件No</Label>
                <p className="font-medium">{project.projectNumber}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">クライアント</Label>
                <p className="font-medium">{project.clientName}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">実施日</Label>
                <p className="font-medium">{project.date}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">会場</Label>
                <p className="font-medium">{project.venue}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">イベント種別</Label>
                <p className="font-medium">{project.eventType}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">見積金額</Label>
                <p className="font-medium">{project.estimateAmount}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">営業担当</Label>
                <p className="font-medium">{project.salesPersonName}</p>
              </div>
            </div>
          </div>
          {project.correctionComment && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <Label className="text-sm font-semibold text-blue-900">営業からのコメント</Label>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{project.correctionComment}</p>
            </div>
          )}
        </div>
      )}
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          閉じる
        </Button>
        <Button variant="destructive" onClick={onRequestCorrection}>
          修正依頼
        </Button>
        <Button onClick={onConfirmContent}>
          確認完了
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
