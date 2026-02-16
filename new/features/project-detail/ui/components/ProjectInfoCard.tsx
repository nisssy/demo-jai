import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Building2, MapPin, User, Calendar } from "lucide-react"
import type { ProjectInfo } from "@/new/features/project-detail/model/types"

type ProjectInfoCardProps = {
  projectInfo: ProjectInfo
  onEdit: () => void
}

export const ProjectInfoCard = ({ projectInfo, onEdit }: ProjectInfoCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">案件情報</CardTitle>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit2 className="h-3.5 w-3.5 mr-1.5" />
          編集
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-slate-500">法人</div>
              <div className="font-medium text-slate-900">{projectInfo.companyName || "-"}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-slate-500">ホール</div>
              <div className="font-medium text-slate-900">{projectInfo.hallName || "-"}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-slate-500">担当営業</div>
              <div className="font-medium text-slate-900">{projectInfo.salesPersonName || "-"}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-slate-500">依頼日</div>
              <div className="font-medium text-slate-900">{projectInfo.requestDate || "-"}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
