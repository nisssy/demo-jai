import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, User, Calendar, ExternalLink } from "lucide-react"
import type { ProjectGroupViewModel } from "@/new/features/project-list/hooks/useProjectList"

type ProjectCardProps = {
  project: ProjectGroupViewModel
  onClickDetail: (projectNumber: string) => void
}

export const ProjectCard = ({ project, onClickDetail }: ProjectCardProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900">
            {project.projectName}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {project.projectNumber}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {project.products.length}件の商材
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {project.companyName}
            <span className="text-slate-400">({project.companyId})</span>
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {project.hallName}
            <span className="text-slate-400">({project.hallId})</span>
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {project.salesPersonName}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {project.requestDate}
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => onClickDetail(project.projectNumber)}
      >
        <ExternalLink className="h-4 w-4" />
        案件詳細を見る
      </Button>
    </div>
  )
}
