import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { Product } from "@/new/api/types"
import type { ArrangementChecks } from "../../hooks/useEventTeamDashboard"

export type AutoArrangementModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  checks: ArrangementChecks
  onCheckChange: (key: keyof ArrangementChecks, checked: boolean) => void
  onExecute: () => void
  onClose: () => void
}

export function AutoArrangementModalView({
  open,
  onOpenChange,
  product,
  checks,
  onCheckChange,
  onExecute,
  onClose,
}: AutoArrangementModalViewProps) {
  return (
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
        {product && (
          <div className="space-y-4">
            <div className="space-y-3">
              {product.mustSeePublication === "要" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pachitownLink"
                    checked={checks.pachitownLink}
                    onCheckedChange={(checked) => onCheckChange("pachitownLink", checked === true)}
                  />
                  <Label htmlFor="pachitownLink" className="text-sm font-medium cursor-pointer">
                    ぱちタウン連携
                  </Label>
                </div>
              )}
              {product.reportRequired === "要" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reportRequest"
                    checked={checks.reportRequest}
                    onCheckedChange={(checked) => onCheckChange("reportRequest", checked === true)}
                  />
                  <Label htmlFor="reportRequest" className="text-sm font-medium cursor-pointer">
                    レポート作成依頼
                  </Label>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="surveyForm"
                  checked={checks.surveyForm}
                  onCheckedChange={(checked) => onCheckChange("surveyForm", checked === true)}
                />
                <Label htmlFor="surveyForm" className="text-sm font-medium cursor-pointer">
                  Googleアンケートフォームの配布
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="xAnnouncement"
                  checked={checks.xAnnouncement}
                  onCheckedChange={(checked) => onCheckChange("xAnnouncement", checked === true)}
                />
                <Label htmlFor="xAnnouncement" className="text-sm font-medium cursor-pointer">
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
}
