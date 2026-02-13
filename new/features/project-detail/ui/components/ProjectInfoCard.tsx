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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>案件情報</CardTitle>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit2 className="h-4 w-4 mr-2" />
          編集
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">法人:</span>
            <span className="font-medium text-slate-900">
              {projectInfo.companyName || "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">ホール:</span>
            <span className="font-medium text-slate-900">
              {projectInfo.hallName || "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">担当営業:</span>
            <span className="font-medium text-slate-900">
              {projectInfo.salesPersonName || "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">依頼日:</span>
            <span className="font-medium text-slate-900">
              {projectInfo.requestDate || "-"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
