import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye } from "lucide-react"
import { ProjectStatusBadge } from "@/features/event-team-dashboard/ui/components/ProjectStatusBadge"
import type { Project } from "@/features/event-team-dashboard/hooks/useEventTeamDashboard"

type CastGroup = {
  castName: string
  castType: "companion" | "director" | "mc"
  status: "pending" | "confirmed_request"
  projects: Project[]
}

type ProductionGroup = {
  productionKey: string
  productionName: string
  casts: CastGroup[]
}

export type HoldRequestSectionViewProps = {
  temporaryHoldRequests: Project[]
  holdRequestGroupsByProduction: ProductionGroup[]
  hasHoldRequestCastGroups: boolean
  normalizeSelectedNames: (raw?: unknown) => string[]
  computeTentativeProgress: (
    names: string[],
    status: Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">,
    failure: Record<string, string>,
  ) => { done: number; total: number }
  onViewCastingInfo: (project: Project) => void
  onTemporaryHoldFailure: (project: Project) => void
}

export const HoldRequestSectionView = ({
  temporaryHoldRequests,
  holdRequestGroupsByProduction,
  hasHoldRequestCastGroups,
  normalizeSelectedNames,
  computeTentativeProgress,
  onViewCastingInfo,
  onTemporaryHoldFailure,
}: HoldRequestSectionViewProps) => {
  if (temporaryHoldRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">押さえ依頼</CardTitle>
          <CardDescription className="text-slate-600">キャスティング情報を確認して押さえ処理を行ってください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">押さえ依頼はありません</div>
        </CardContent>
      </Card>
    )
  }

  if (!hasHoldRequestCastGroups) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">押さえ依頼</CardTitle>
          <CardDescription className="text-slate-600">キャスティング情報を確認して押さえ処理を行ってください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-slate-600 bg-yellow-50 border border-yellow-200 rounded p-3">
              注意: 押さえ依頼状態のキャストが見つかりませんでした。すべての押さえ依頼案件を表示します。
            </div>
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
                {temporaryHoldRequests.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.projectName}</TableCell>
                    <TableCell>{project.projectNumber}</TableCell>
                    <TableCell>{project.clientName}</TableCell>
                    <TableCell>{project.date}</TableCell>
                    <TableCell>
                      <ProjectStatusBadge status={project.projectStatus || ""} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onViewCastingInfo(project)} className="gap-2">
                          <Eye className="h-4 w-4" />
                          キャスティング情報
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">押さえ依頼</CardTitle>
        <CardDescription className="text-slate-600">キャスティング情報を確認して押さえ処理を行ってください</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {holdRequestGroupsByProduction.map(({ productionKey, productionName, casts }) => (
            <div key={productionKey} className="border border-slate-300 rounded-lg p-4 space-y-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">プロダクション: {productionName}</h2>
                  <p className="text-xs text-slate-600 mt-1">キャスト: {casts.length}名</p>
                </div>
              </div>

              <div className="space-y-6">
                {casts.map(({ castName, castType, status, projects }) => {
                  const castTypeLabel = castType === "companion" ? "コンパニオン" : castType === "director" ? "ディレクター" : "MC"
                  const uniqueProjects = Array.from(new Map(projects.map((p) => [p.id, p])).values())

                  return (
                    <div key={`${productionKey}-${castType}-${castName}`} className="border border-slate-200 rounded-lg p-4 bg-white">
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {castTypeLabel}: {castName}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">{uniqueProjects.length}件の案件</p>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>案件名</TableHead>
                            <TableHead>案件No</TableHead>
                            <TableHead>クライアント</TableHead>
                            <TableHead>実施日</TableHead>
                            <TableHead>押さえ進捗</TableHead>
                            <TableHead>ステータス</TableHead>
                            <TableHead>操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uniqueProjects.map((project) => {
                            const selectedCompanions = normalizeSelectedNames((project as any).selectedCompanions)
                            const selectedDirectors = normalizeSelectedNames((project as any).selectedDirectors)
                            const selectedMcs = normalizeSelectedNames((project as any).selectedMcs)
                            const compStatus = ((project as any).companionBookingStatus ?? {}) as Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
                            const dirStatus = ((project as any).directorBookingStatus ?? {}) as Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
                            const mcStatus = ((project as any).mcBookingStatus ?? {}) as Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
                            const compFail = ((project as any).companionTentativeHoldFailureComment ?? {}) as Record<string, string>
                            const dirFail = ((project as any).directorTentativeHoldFailureComment ?? {}) as Record<string, string>
                            const mcFail = ((project as any).mcTentativeHoldFailureComment ?? {}) as Record<string, string>
                            const compProg = computeTentativeProgress(selectedCompanions, compStatus, compFail)
                            const dirProg = computeTentativeProgress(selectedDirectors, dirStatus, dirFail)
                            const mcProg = computeTentativeProgress(selectedMcs, mcStatus, mcFail)
                            const done = compProg.done + dirProg.done + mcProg.done
                            const total = compProg.total + dirProg.total + mcProg.total
                            return (
                              <TableRow key={project.id}>
                                <TableCell className="font-medium">{project.projectName}</TableCell>
                                <TableCell>{project.projectNumber}</TableCell>
                                <TableCell>{project.clientName}</TableCell>
                                <TableCell>{project.date}</TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <span className="font-medium">{done}</span>/<span>{total}</span>
                                    <div className="text-xs text-slate-500 mt-1">
                                      Co {compProg.done}/{compProg.total} ・ Dir {dirProg.done}/{dirProg.total} ・ MC {mcProg.done}/{mcProg.total}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <ProjectStatusBadge status={project.projectStatus || ""} />
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => onViewCastingInfo(project)} className="gap-2">
                                      <Eye className="h-4 w-4" />
                                      キャスティング情報
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => onTemporaryHoldFailure(project)}>
                                      {project.projectStatus === "本押さえ依頼" ? "本押さえ不可" : "仮押さえ不可"}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
