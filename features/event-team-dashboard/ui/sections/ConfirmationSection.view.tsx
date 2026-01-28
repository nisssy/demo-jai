import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye } from "lucide-react"
import { ProjectStatusBadge } from "@/features/event-team-dashboard/ui/components/ProjectStatusBadge"
import type { Project } from "@/features/event-team-dashboard/hooks/useEventTeamDashboard"

export type ConfirmationSectionViewProps = {
  confirmationRequests: Project[]
  onViewDetails: (project: Project) => void
}

export const ConfirmationSectionView = ({ confirmationRequests, onViewDetails }: ConfirmationSectionViewProps) => {
  if (confirmationRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">内容確認依頼</CardTitle>
          <CardDescription className="text-slate-600">受注確定した案件の内容を確認し、確認完了または修正依頼を行ってください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">確認依頼はありません</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">内容確認依頼</CardTitle>
        <CardDescription className="text-slate-600">受注確定した案件の内容を確認し、確認完了または修正依頼を行ってください</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>案件名</TableHead>
              <TableHead>案件No</TableHead>
              <TableHead>クライアント</TableHead>
              <TableHead>実施日</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {confirmationRequests.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.projectName}</TableCell>
                <TableCell>{project.projectNumber}</TableCell>
                <TableCell>{project.clientName}</TableCell>
                <TableCell>{project.date}</TableCell>
                <TableCell>
                  <ProjectStatusBadge status={project.projectStatus || ""} />
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => onViewDetails(project)} className="gap-2">
                    <Eye className="h-4 w-4" />
                    詳細確認
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
