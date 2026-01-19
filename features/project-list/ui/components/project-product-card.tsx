"use client"

import type React from "react"
import { Calendar } from "lucide-react"
import type { DemoProject } from "@/lib/demo-db/types"
import type { ProjectItem } from "@/features/project-list/model/types"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export type ProjectProductCardProps = {
  project: DemoProject
  projectItem: ProjectItem
  statusBadge: React.ReactNode
  onClick: () => void
  onToggleStatus: (checked: boolean) => void
}

export function ProjectProductCard({ project, projectItem, statusBadge, onClick, onToggleStatus }: ProjectProductCardProps) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">案件No: {projectItem.projectNumber ?? "-"}</span>
                  {statusBadge}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">{projectItem.eventProductName || project.projectName}</h3>
                <p className="text-sm text-slate-600">{project.clientName}</p>
              </div>
              <div className="flex flex-col items-end" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`status-${String(project.id)}`} className="text-xs text-slate-600">
                    {project.status === "ordered" ? "受注済み" : "見積中"}
                  </Label>
                  <Switch
                    id={`status-${String(project.id)}`}
                    checked={project.status === "ordered"}
                    onCheckedChange={onToggleStatus}
                    className="scale-75"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
              <div>
                <div className="text-xs text-slate-500 mb-1">開催日</div>
                <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {projectItem.eventDate || project.date || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">商材カテゴリ</div>
                <div className="text-sm font-medium text-slate-900">{projectItem.category || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">イベント区分</div>
                <div className="text-sm font-medium text-slate-900">{projectItem.eventType || "-"}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 mb-1">見積金額</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {project.estimatedBillingAmount !== undefined ? `¥${project.estimatedBillingAmount.toLocaleString()}` : project.estimateAmount}
                  </div>
                </div>
                {projectItem.salesPersonName && (
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">担当営業</div>
                    <div className="text-sm font-medium text-slate-700">{projectItem.salesPersonName}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

