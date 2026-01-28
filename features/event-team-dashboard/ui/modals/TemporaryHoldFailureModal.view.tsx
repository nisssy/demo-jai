import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Project } from "@/features/event-team-dashboard/hooks/useEventTeamDashboard"

export type TemporaryHoldFailureModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  comment: string
  onCommentChange: (value: string) => void
  onConfirm: () => void
}

export const TemporaryHoldFailureModalView = ({
  open,
  onOpenChange,
  project,
  comment,
  onCommentChange,
  onConfirm,
}: TemporaryHoldFailureModalViewProps) => (
  <Dialog
    open={open}
    onOpenChange={(o) => {
      onOpenChange(o)
      if (!o) onCommentChange("")
    }}
  >
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>仮押さえ不可の通知</DialogTitle>
        <DialogDescription>仮押さえができない理由をコメントで営業に通知してください</DialogDescription>
      </DialogHeader>
      {project && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
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
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="temporaryHoldFailureComment">仮押さえ不可の理由・コメント</Label>
            <Textarea
              id="temporaryHoldFailureComment"
              placeholder="仮押さえができない理由を入力してください（例：希望キャストのスケジュールが合わない、キャストが不足しているなど）"
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-900">
              ※ コメントを入力して送信すると、営業に通知されます。ステータスが「営業確認中」に更新されます。
            </p>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          キャンセル
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          営業に通知
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
