import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { Project } from "@/features/event-team-dashboard/hooks/useEventTeamDashboard"

export type AutoArrangementChecks = {
  pachitown: boolean
  report: boolean
  googleForm: boolean
  xAccount: boolean
}

export type AutoArrangementModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  checks: AutoArrangementChecks
  onCheckChange: (key: keyof AutoArrangementChecks, checked: boolean) => void
  onExecute: () => void
  onClose: () => void
}

export const AutoArrangementModalView = ({
  open,
  onOpenChange,
  project,
  checks,
  onCheckChange,
  onExecute,
  onClose,
}: AutoArrangementModalViewProps) => (
  <Dialog
    open={open}
    onOpenChange={(o) => {
      onOpenChange(o)
      if (!o) onClose()
    }}
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>各種自動手配実行</DialogTitle>
        <DialogDescription>以下の操作を自動で実行します。実行しない項目はチェックを外してください。</DialogDescription>
      </DialogHeader>
      {project && (
        <div className="space-y-4">
          <div className="space-y-3">
            {project.mustSeePublication === "要" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pachitown"
                  checked={checks.pachitown}
                  onCheckedChange={(checked) => onCheckChange("pachitown", checked === true)}
                />
                <Label htmlFor="pachitown" className="text-sm font-medium cursor-pointer">
                  ぱちタウン連携
                </Label>
              </div>
            )}
            {project.reportRequired === "要" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="report"
                  checked={checks.report}
                  onCheckedChange={(checked) => onCheckChange("report", checked === true)}
                />
                <Label htmlFor="report" className="text-sm font-medium cursor-pointer">
                  レポート作成依頼
                </Label>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="googleForm"
                checked={checks.googleForm}
                onCheckedChange={(checked) => onCheckChange("googleForm", checked === true)}
              />
              <Label htmlFor="googleForm" className="text-sm font-medium cursor-pointer">
                Googleアンケートフォームの配布
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="xAccount"
                checked={checks.xAccount}
                onCheckedChange={(checked) => onCheckChange("xAccount", checked === true)}
              />
              <Label htmlFor="xAccount" className="text-sm font-medium cursor-pointer">
                専用Xアカウントによる事前告知依頼
              </Label>
            </div>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={onExecute}>
          実行
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
