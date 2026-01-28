import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import type { Project } from "@/features/event-team-dashboard/hooks/useEventTeamDashboard"

export type SurveyResultModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onDownloadCsv: () => void
}

export const SurveyResultModalView = ({ open, onOpenChange, project, onDownloadCsv }: SurveyResultModalViewProps) => {
  const surveyResult = (project as any)?.surveyResult
  const hasSurveyResult = surveyResult && (surveyResult.satisfaction || surveyResult.comment || surveyResult.nextEventDesired)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>アンケート結果</DialogTitle>
          <DialogDescription>クライアントからのアンケート回答を確認します</DialogDescription>
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
                  <p className="font-medium">{project.eventDate || project.date}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">アンケート回答内容</h4>
                {hasSurveyResult && (
                  <Button variant="outline" size="sm" onClick={onDownloadCsv} className="gap-2">
                    <Download className="h-4 w-4" />
                    CSVダウンロード
                  </Button>
                )}
              </div>
              {hasSurveyResult ? (
                <div className="border rounded-lg p-4 space-y-3">
                  <div>
                    <Label className="text-sm font-medium">満足度</Label>
                    <p className="text-sm text-slate-700">{surveyResult.satisfaction || "未回答"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">コメント</Label>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{surveyResult.comment || "コメントなし"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">次回開催希望</Label>
                    <p className="text-sm text-slate-700">{surveyResult.nextEventDesired || "未回答"}</p>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 text-center text-slate-500">
                  <p>アンケート結果はまだ回答されていません</p>
                  <p className="text-xs mt-2">送付日: {(project as any).surveySentDate || "未送付"}</p>
                </div>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
