"use client"

import type React from "react"
import { useMemo } from "react"
import { Calendar, FileText, Mail, FileCheck, Package, CheckCircle2, Play, Users } from "lucide-react"
import type { DemoProject } from "@/lib/demo-db/types"
import type { ProjectItem } from "@/features/project-list/model/types"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useProject } from "@/contexts/project-context"
import { PROPOSAL_STATUS_LABELS } from "@/features/lottery-registration/constants"

type BookingStatus = "pending" | "tentative" | "confirmed_request" | "confirmed"

export type ProjectProductCardProps = {
  project: DemoProject
  projectItem: ProjectItem
  statusBadge: React.ReactNode
  onClick: () => void
  onToggleStatus: (checked: boolean) => void
}

export function ProjectProductCard({ project, projectItem, statusBadge, onClick, onToggleStatus }: ProjectProductCardProps) {
  const { getDesignRequestsByProjectAndType } = useProject()

  // 合同抽選会のステータス計算
  const lotteryStatuses = useMemo(() => {
    if (projectItem.category !== "ポイント" && projectItem.category !== "Point") {
      return null
    }

    const projectId = (project as any).id
    const getDesignStatus = (type: "poster" | "dm" | "winner-list"): { label: string; color: string } => {
      const requests = getDesignRequestsByProjectAndType(projectId, type)
      if (requests.length === 0) return { label: "未依頼", color: "bg-slate-100 text-slate-600" }

      const latest = requests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())[0]
      if (latest.status === "requested") return { label: "初稿待ち", color: "bg-yellow-100 text-yellow-800" }
      if (latest.status === "uploaded") return { label: "アップロード済み", color: "bg-green-100 text-green-800" }
      return { label: "完了", color: "bg-blue-100 text-blue-800" }
    }

    const proposalStatus = (project as any).proposalStatus || "before-proposal"
    const executionStatus = (project as any).executionStatus
    const prizeOrderedAt = (project as any).prizeOrderedAt
    const dmMailing = (project as any).dmMailing

    const orderStatusLabel = (PROPOSAL_STATUS_LABELS as any)[proposalStatus] || proposalStatus
    const orderStatusColor = proposalStatus === "order-received"
      ? "bg-green-100 text-green-800"
      : proposalStatus === "proposing"
        ? "bg-blue-100 text-blue-800"
        : "bg-slate-100 text-slate-600"

    const execStatusLabel = executionStatus || "実施前"
    const execStatusColor = executionStatus === "終了"
      ? "bg-green-100 text-green-800"
      : executionStatus === "実施中"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-slate-100 text-slate-600"

    const prizeOrderStatus = prizeOrderedAt
      ? { label: "発注済み", color: "bg-green-100 text-green-800" }
      : { label: "未発注", color: "bg-slate-100 text-slate-600" }

    return {
      proposalStatus,
      orderStatusLabel,
      orderStatusColor,
      executionStatus,
      execStatusLabel,
      execStatusColor,
      dmMailing,
      posterStatus: getDesignStatus("poster"),
      dmStatus: getDesignStatus("dm"),
      winnerListStatus: getDesignStatus("winner-list"),
      prizeOrderStatus,
    }
  }, [projectItem.category, project, getDesignRequestsByProjectAndType])

  // トリニティガール・スロセレのキャスティングステータス計算
  const castingStatuses = useMemo(() => {
    if (projectItem.category !== "トリニティガール" && projectItem.category !== "スロセレ") {
      return null
    }

    const getBookingStatusLabel = (status: BookingStatus): { label: string; color: string } => {
      switch (status) {
        case "pending":
          return { label: "未依頼", color: "bg-slate-100 text-slate-600" }
        case "tentative":
          return { label: "仮押さえ済み", color: "bg-yellow-100 text-yellow-800" }
        case "confirmed_request":
          return { label: "本押さえ依頼", color: "bg-blue-100 text-blue-800" }
        case "confirmed":
          return { label: "本押さえ済み", color: "bg-green-100 text-green-800" }
        default:
          return { label: "未依頼", color: "bg-slate-100 text-slate-600" }
      }
    }

    const selectedCompanions = (project as any).selectedCompanions || []
    const selectedDirectors = (project as any).selectedDirectors || []
    const selectedMcs = (project as any).selectedMcs || []
    const companionBookingStatus = (project as any).companionBookingStatus || {}
    const directorBookingStatus = (project as any).directorBookingStatus || {}
    const mcBookingStatus = (project as any).mcBookingStatus || {}

    const castList: Array<{ name: string; type: string; status: { label: string; color: string } }> = []

    // コンパニオン
    selectedCompanions.forEach((name: string) => {
      const status = companionBookingStatus[name] || "pending"
      castList.push({
        name,
        type: "コンパニオン",
        status: getBookingStatusLabel(status as BookingStatus),
      })
    })

    // ディレクター
    selectedDirectors.forEach((name: string) => {
      const status = directorBookingStatus[name] || "pending"
      castList.push({
        name,
        type: "ディレクター",
        status: getBookingStatusLabel(status as BookingStatus),
      })
    })

    // MC
    selectedMcs.forEach((name: string) => {
      const status = mcBookingStatus[name] || "pending"
      castList.push({
        name,
        type: "MC",
        status: getBookingStatusLabel(status as BookingStatus),
      })
    })

    return { castList }
  }, [projectItem.category, project])

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
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-semibold text-slate-900">{projectItem.eventProductName || project.projectName}</h3>
                  {statusBadge}
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">案件No: {projectItem.projectNumber ?? "-"}</span>
                </div>
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
                <div className="text-xs text-slate-500 mb-1">実施日</div>
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

            {/* 合同抽選会のステータス表示 */}
            {lotteryStatuses && (
              <>
                {/* 受注ステータス */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 mb-2">受注ステータス</div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
                    <Badge className={`${lotteryStatuses.orderStatusColor} text-xs px-2 py-0.5`}>
                      {lotteryStatuses.orderStatusLabel}
                    </Badge>
                  </div>
                </div>

                {/* 実施ステータス */}
                {lotteryStatuses.proposalStatus === "order-received" && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500 mb-2">実施ステータス</div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Play className="h-3.5 w-3.5 text-slate-500" />
                      <Badge className={`${lotteryStatuses.execStatusColor} text-xs px-2 py-0.5`}>
                        {lotteryStatuses.execStatusLabel}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* 制作・発注ステータス */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 mb-2">制作・発注ステータス</div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* ポスター制作 */}
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-slate-600">ポスター:</span>
                      <Badge className={`${lotteryStatuses.posterStatus.color} text-xs px-2 py-0.5`}>
                        {lotteryStatuses.posterStatus.label}
                      </Badge>
                    </div>

                    {/* DM制作 */}
                    {lotteryStatuses.dmMailing === "yes" && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-slate-600">DM:</span>
                        <Badge className={`${lotteryStatuses.dmStatus.color} text-xs px-2 py-0.5`}>
                          {lotteryStatuses.dmStatus.label}
                        </Badge>
                      </div>
                    )}

                    {/* 当選通知書 */}
                    <div className="flex items-center gap-1.5">
                      <FileCheck className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-slate-600">当選通知書:</span>
                      <Badge className={`${lotteryStatuses.winnerListStatus.color} text-xs px-2 py-0.5`}>
                        {lotteryStatuses.winnerListStatus.label}
                      </Badge>
                    </div>

                    {/* 景品発注 */}
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-slate-600">景品:</span>
                      <Badge className={`${lotteryStatuses.prizeOrderStatus.color} text-xs px-2 py-0.5`}>
                        {lotteryStatuses.prizeOrderStatus.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* トリニティガール・スロセレのキャスティングステータス表示 */}
            {castingStatuses && (
              <>
                {/* 受注ステータス（通常商材） */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 mb-2">受注ステータス</div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
                    <Badge className={`${project.status === "ordered" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"} text-xs px-2 py-0.5`}>
                      {project.status === "ordered" ? "受注済み" : "見積中"}
                    </Badge>
                  </div>
                </div>

                {/* 実施ステータス（通常商材） */}
                {project.status === "ordered" && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500 mb-2">実施ステータス</div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Play className="h-3.5 w-3.5 text-slate-500" />
                      <Badge className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5">
                        実施前
                      </Badge>
                    </div>
                  </div>
                )}

                {/* キャスティングステータス */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 mb-2">キャスティングステータス</div>
                  {castingStatuses.castList.length > 0 ? (
                    <div className="space-y-2">
                      {castingStatuses.castList.map((cast, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <Users className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-slate-600 min-w-[80px]">{cast.type}:</span>
                          <span className="text-slate-800 font-medium">{cast.name}</span>
                          <Badge className={`${cast.status.color} text-xs px-2 py-0.5`}>
                            {cast.status.label}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">キャスト未選択</div>
                  )}
                </div>
              </>
            )}

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

