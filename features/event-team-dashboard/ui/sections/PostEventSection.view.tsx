import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText } from "lucide-react"
import { ProjectStatusBadge } from "@/features/event-team-dashboard/ui/components/ProjectStatusBadge"
import type { Project } from "@/features/event-team-dashboard/hooks/useEventTeamDashboard"

export type PostEventSectionViewProps = {
  postEventProjects: Project[]
  onNavigateToCost: (projectId: number) => void
  onViewSurveyResult: (project: Project) => void
}

export const PostEventSectionView = ({ postEventProjects, onNavigateToCost, onViewSurveyResult }: PostEventSectionViewProps) => {
  if (postEventProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">イベント終了処理中</CardTitle>
          <CardDescription className="text-slate-600">実施日の翌日以降のイベントのコスト入力を行ってください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">イベント終了処理中の案件はありません</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">イベント終了処理中</CardTitle>
        <CardDescription className="text-slate-600">実施日の翌日以降のイベントのコスト入力を行ってください</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="relative">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-white z-10">案件名</TableHead>
                  <TableHead>案件No</TableHead>
                  <TableHead>クライアント</TableHead>
                  <TableHead>実施日</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>アンケート状況</TableHead>
                  <TableHead className="sticky right-0 bg-white z-10">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {postEventProjects.map((project) => {
                  const surveyResult = (project as any).surveyResult
                  const hasSurveyResult = surveyResult && (surveyResult.satisfaction || surveyResult.comment || surveyResult.nextEventDesired)

                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium sticky left-0 bg-white z-10">{project.projectName}</TableCell>
                      <TableCell>{project.projectNumber}</TableCell>
                      <TableCell>{project.clientName}</TableCell>
                      <TableCell>{project.date}</TableCell>
                      <TableCell>
                        <ProjectStatusBadge status={project.projectStatus || ""} />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={hasSurveyResult ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"}
                        >
                          {hasSurveyResult ? "アンケート回答受領済み" : "アンケート送付済み"}
                        </Badge>
                      </TableCell>
                      <TableCell className="sticky right-0 bg-white z-10">
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" onClick={() => onNavigateToCost(project.id)} className="gap-2">
                            コスト入力
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onViewSurveyResult(project)} className="gap-2">
                            <FileText className="h-4 w-4" />
                            アンケート結果
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
      </CardContent>
    </Card>
  )
}
