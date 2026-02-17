import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { History, Send } from "lucide-react"
import { ProjectStatusBadge } from "@/features/event-team-dashboard/ui/components/ProjectStatusBadge"
import type { Project } from "@/features/event-team-dashboard/hooks/useEventTeamDashboard"

export type InProgressSectionViewProps = {
  arrangementProjects: Project[]
  getPachitownPublicationStatus: (project: Project) => string | null
  onViewStatusHistory: (project: Project) => void
  onNavigateToArrangement: (projectId: number) => void
  onNavigateToAutoArrangement: (projectId: number) => void
}

export const InProgressSectionView = ({
  arrangementProjects,
  getPachitownPublicationStatus,
  onViewStatusHistory,
  onNavigateToArrangement,
  onNavigateToAutoArrangement,
}: InProgressSectionViewProps) => {
  if (arrangementProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">進行中</CardTitle>
          <CardDescription className="text-slate-600">手配中の案件一覧</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">手配中の案件はありません</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">進行中</CardTitle>
        <CardDescription className="text-slate-600">手配中の案件一覧</CardDescription>
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
                  <TableHead>コンパニオン確定</TableHead>
                  <TableHead>ディレクター確定</TableHead>
                  <TableHead>MC確定</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>ぱちタウン公開状況</TableHead>
                  <TableHead className="sticky right-0 bg-white z-10">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arrangementProjects.map((project) => {
                  const confirmedCompanions = project.confirmedCompanions ?? []
                  const confirmedDirectors = project.confirmedDirectors ?? []
                  const confirmedMcs = project.confirmedMcs ?? []
                  const nominatedCompanions = (project as any).nominatedCompanions as Record<string, boolean> | undefined
                  const nominatedDirectors = (project as any).nominatedDirectors as Record<string, boolean> | undefined
                  const nominatedMcs = (project as any).nominatedMcs as Record<string, boolean> | undefined
                  const companionCount = Number(project.companionCount) || 0
                  const directorCount = Number(project.directorCount) || 0
                  const mcCount = Number(project.mcCount) || 0

                  const isCastingIncomplete =
                    confirmedCompanions.length < companionCount ||
                    confirmedDirectors.length < directorCount ||
                    confirmedMcs.length < mcCount ||
                    (companionCount > 0 && confirmedCompanions.length === 0) ||
                    (directorCount > 0 && confirmedDirectors.length === 0) ||
                    (mcCount > 0 && confirmedMcs.length === 0)

                  const publicationStatus = getPachitownPublicationStatus(project)
                  let badgeColor = ""
                  if (publicationStatus === "公開待ち") {
                    badgeColor = "bg-yellow-100 text-yellow-800"
                  } else if (publicationStatus === "公開中") {
                    badgeColor = "bg-green-100 text-green-800"
                  } else if (publicationStatus === "公開済み") {
                    badgeColor = "bg-blue-100 text-blue-800"
                  }

                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium sticky left-0 bg-white z-10">{project.projectName}</TableCell>
                      <TableCell>{project.projectNumber}</TableCell>
                      <TableCell>{project.clientName}</TableCell>
                      <TableCell>{project.date}</TableCell>
                      <TableCell>
                        {confirmedCompanions.length > 0 ? (
                          <div className="space-y-1">
                            {confirmedCompanions.map((name: string, idx: number) => (
                              <div key={idx} className="text-sm">
                                {name}
                                {nominatedCompanions?.[name] && (
                                  <Badge variant="outline" className="ml-2 text-xs border-purple-200 bg-purple-50 text-purple-700">
                                    指名
                                  </Badge>
                                )}
                                {project.companionCostumes && project.companionCostumes[name] && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {project.companionCostumes[name]}
                                  </Badge>
                                )}
                              </div>
                            ))}
                            {confirmedCompanions.length < companionCount && (
                              <p className="text-xs text-slate-500">({companionCount - confirmedCompanions.length}名未確定)</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">未確定</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {confirmedDirectors.length > 0 ? (
                          <div className="space-y-1">
                            {confirmedDirectors.map((name: string, idx: number) => (
                              <div key={idx} className="text-sm">
                                {name}
                                {nominatedDirectors?.[name] && (
                                  <Badge variant="outline" className="ml-2 text-xs border-purple-200 bg-purple-50 text-purple-700">
                                    指名
                                  </Badge>
                                )}
                              </div>
                            ))}
                            {confirmedDirectors.length < directorCount && (
                              <p className="text-xs text-slate-500">({directorCount - confirmedDirectors.length}名未確定)</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">未確定</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {confirmedMcs.length > 0 ? (
                          <div className="space-y-1">
                            {confirmedMcs.map((name: string, idx: number) => (
                              <div key={idx} className="text-sm">
                                {name}
                                {nominatedMcs?.[name] && (
                                  <Badge variant="outline" className="ml-2 text-xs border-purple-200 bg-purple-50 text-purple-700">
                                    指名
                                  </Badge>
                                )}
                              </div>
                            ))}
                            {confirmedMcs.length < mcCount && (
                              <p className="text-xs text-slate-500">({mcCount - confirmedMcs.length}名未確定)</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">未確定</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ProjectStatusBadge status={project.projectStatus || ""} />
                      </TableCell>
                      <TableCell>
                        {publicationStatus === null ? (
                          <span className="text-sm text-slate-400">-</span>
                        ) : (
                          <Badge className={badgeColor}>{publicationStatus}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="sticky right-0 bg-white z-10">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => onViewStatusHistory(project)} className="gap-2">
                            <History className="h-4 w-4" />
                            履歴
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              if (isCastingIncomplete) {
                                onNavigateToArrangement(project.id)
                              } else {
                                onNavigateToAutoArrangement(project.id)
                              }
                            }}
                            className="gap-2"
                          >
                            <Send className="h-4 w-4" />
                            各種手配実行
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
