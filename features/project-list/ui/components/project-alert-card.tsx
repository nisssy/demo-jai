"use client"

import type React from "react"
import { AlertTriangle, Calendar } from "lucide-react"
import type { DemoProject } from "@/lib/demo-db/types"
import type { ProjectItem } from "@/features/project-list/model/types"
import { Button } from "@/components/ui/button"

export type ProjectAlertCardProps = {
  project: DemoProject
  projectItem: ProjectItem
  statusBadge: React.ReactNode
  alertTitle: string
  alertText?: string
  actionLabel: string
  actionIcon?: React.ReactNode
  onAction: () => void
}

export function ProjectAlertCard({
  project,
  projectItem,
  statusBadge,
  alertTitle,
  alertText,
  actionLabel,
  actionIcon,
  onAction,
}: ProjectAlertCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="p-5">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-base font-semibold text-slate-900">{projectItem.eventProductName || project.projectName}</h3>
                {statusBadge}
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">案件No: {projectItem.projectNumber ?? "-"}</span>
              </div>
              <p className="text-sm text-slate-600">{project.clientName}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            <div>
              <div className="text-xs text-slate-500 mb-1">実施日</div>
              <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {projectItem.eventDate || project.date || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">見積金額</div>
              <div className="text-sm font-medium text-slate-900">
                {project.estimatedBillingAmount !== undefined ? `¥${project.estimatedBillingAmount.toLocaleString()}` : project.estimateAmount}
              </div>
            </div>
            {projectItem.salesPersonName && (
              <div>
                <div className="text-xs text-slate-500 mb-1">担当営業</div>
                <div className="text-sm font-medium text-slate-700">{projectItem.salesPersonName}</div>
              </div>
            )}
          </div>

          {alertText && (
            <div className="pt-3 border-t border-slate-100">
              <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-900">{alertTitle}</span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{alertText}</p>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onAction()
              }}
              size="sm"
              className="gap-2"
            >
              {actionIcon}
              {actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

