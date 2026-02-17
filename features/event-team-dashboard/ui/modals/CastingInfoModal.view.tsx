import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Project } from "@/features/event-team-dashboard/hooks/useEventTeamDashboard"

type BookingStatus = "pending" | "tentative" | "confirmed_request" | "confirmed"

type CastStatusRowProps = {
  name: string
  currentStatus: BookingStatus | undefined
  originalStatus: BookingStatus | undefined
  failureComment: string | undefined
  disabled: boolean
  onStatusChange: (value: string) => void
  onFailureCommentChange: (value: string) => void
}

const CastStatusRow = ({
  name,
  currentStatus,
  originalStatus,
  failureComment,
  disabled,
  onStatusChange,
  onFailureCommentChange,
}: CastStatusRowProps) => {
  const actualStatus = currentStatus ?? originalStatus
  const value =
    actualStatus === "confirmed"
      ? "confirmed"
      : actualStatus === "confirmed_request"
        ? "confirmed_request"
        : failureComment !== undefined
          ? "failed"
          : actualStatus === "tentative"
            ? "tentative"
            : "pending"
  const isPending =
    originalStatus === "pending" ||
    (!originalStatus && actualStatus !== "confirmed_request" && actualStatus !== "confirmed")
  const isConfirmedRequest =
    originalStatus === "confirmed_request" || (actualStatus === "confirmed_request" && originalStatus !== "pending")

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-slate-900 min-w-[140px]">{name}</div>
        <Select value={value} onValueChange={onStatusChange} disabled={disabled}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="状態" />
          </SelectTrigger>
          <SelectContent>
            {isPending && (
              <>
                <SelectItem value="pending">仮押さえ依頼</SelectItem>
                <SelectItem value="tentative">仮押さえ</SelectItem>
                <SelectItem value="failed">仮押さえ不可</SelectItem>
              </>
            )}
            {isConfirmedRequest && (
              <>
                <SelectItem value="confirmed_request">本押さえ依頼</SelectItem>
                <SelectItem value="confirmed">本押さえ</SelectItem>
                <SelectItem value="failed">本押さえ不可</SelectItem>
              </>
            )}
            {!isPending && !isConfirmedRequest && (
              <>
                <SelectItem value="pending">仮押さえ依頼</SelectItem>
                <SelectItem value="tentative">仮押さえ</SelectItem>
                <SelectItem value="failed">仮押さえ不可</SelectItem>
                <SelectItem value="confirmed_request">本押さえ依頼</SelectItem>
                <SelectItem value="confirmed" disabled>
                  本押さえ
                </SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      {value === "failed" && (
        <Input
          value={failureComment ?? ""}
          onChange={(e) => onFailureCommentChange(e.target.value)}
          placeholder="不可理由（例：スケジュール都合/体調/移動不可 など）"
        />
      )}
    </div>
  )
}

export type CastingInfoModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  normalizeSelectedNames: (raw?: unknown) => string[]
  computeTentativeProgress: (
    names: string[],
    status: Record<string, BookingStatus>,
    failure: Record<string, string>,
  ) => { done: number; total: number }
  draftCompanionBookingStatus: Record<string, BookingStatus>
  draftDirectorBookingStatus: Record<string, BookingStatus>
  draftMcBookingStatus: Record<string, BookingStatus>
  draftCompanionFailureComment: Record<string, string>
  draftDirectorFailureComment: Record<string, string>
  draftMcFailureComment: Record<string, string>
  onCompanionStatusChange: (name: string, value: string) => void
  onDirectorStatusChange: (name: string, value: string) => void
  onMcStatusChange: (name: string, value: string) => void
  onCompanionFailureCommentChange: (name: string, value: string) => void
  onDirectorFailureCommentChange: (name: string, value: string) => void
  onMcFailureCommentChange: (name: string, value: string) => void
  onSave: () => void
  onClose: () => void
}

export const CastingInfoModalView = ({
  open,
  onOpenChange,
  project,
  normalizeSelectedNames,
  computeTentativeProgress,
  draftCompanionBookingStatus,
  draftDirectorBookingStatus,
  draftMcBookingStatus,
  draftCompanionFailureComment,
  draftDirectorFailureComment,
  draftMcFailureComment,
  onCompanionStatusChange,
  onDirectorStatusChange,
  onMcStatusChange,
  onCompanionFailureCommentChange,
  onDirectorFailureCommentChange,
  onMcFailureCommentChange,
  onSave,
  onClose,
}: CastingInfoModalViewProps) => {
  if (!project) return null

  const selectedCompanions = normalizeSelectedNames((project as any).selectedCompanions)
  const selectedDirectors = normalizeSelectedNames((project as any).selectedDirectors)
  const selectedMcs = normalizeSelectedNames((project as any).selectedMcs)
  const compProg = computeTentativeProgress(selectedCompanions, draftCompanionBookingStatus, draftCompanionFailureComment)
  const dirProg = computeTentativeProgress(selectedDirectors, draftDirectorBookingStatus, draftDirectorFailureComment)
  const mcProg = computeTentativeProgress(selectedMcs, draftMcBookingStatus, draftMcFailureComment)
  const progressLabel = `${compProg.done + dirProg.done + mcProg.done}/${compProg.total + dirProg.total + mcProg.total}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>キャスティング情報</DialogTitle>
          <DialogDescription>イベントの実施日時とキャスティング情報を確認してください</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-lg mb-3">イベント情報</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-600">案件名</Label>
                <p className="font-medium">{project.projectName}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">案件No</Label>
                <p className="font-medium">{project.projectNumber}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">実施日</Label>
                <p className="font-medium">{project.eventDate || project.date}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">開催時間</Label>
                <p className="font-medium">
                  {project.startTime && project.endTime ? `${project.startTime} - ${project.endTime}` : "未設定"}
                </p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">クライアント</Label>
                <p className="font-medium">{project.clientName}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">会場</Label>
                <p className="font-medium">{project.venue}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg space-y-4">
            <h4 className="font-semibold text-lg mb-3">キャスティング情報</h4>
            <div className="bg-rose-50/50 border border-rose-200/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">コンパニオン</Label>
                <span className="text-sm text-slate-600">人数: {project.companionCount || "0"}名</span>
              </div>
              {project.selectedCompanions?.length ? (
                <div className="space-y-1">
                  {project.selectedCompanions.map((name, index) => {
                    const isNominated = Boolean((project as any).nominatedCompanions?.[name])
                    return (
                      <div key={index} className="text-sm text-slate-700">
                        {name !== "未定" ? `・${name}` : "・未定"}
                        {name !== "未定" && isNominated && (
                          <Badge variant="outline" className="ml-2 text-xs border-purple-200 bg-purple-50 text-purple-700">
                            指名
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">未選択</p>
              )}
            </div>
            <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">ディレクター</Label>
                <span className="text-sm text-slate-600">人数: {project.directorCount || "0"}名</span>
              </div>
              {project.selectedDirectors?.length ? (
                <div className="space-y-1">
                  {project.selectedDirectors.map((name, index) => {
                    const isNominated = Boolean((project as any).nominatedDirectors?.[name])
                    return (
                      <div key={index} className="text-sm text-slate-700">
                        {name !== "未定" ? `・${name}` : "・未定"}
                        {name !== "未定" && isNominated && (
                          <Badge variant="outline" className="ml-2 text-xs border-purple-200 bg-purple-50 text-purple-700">
                            指名
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">未選択</p>
              )}
            </div>
            <div className="bg-green-50/50 border border-green-200/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">MC</Label>
                <span className="text-sm text-slate-600">人数: {project.mcCount || "0"}名</span>
              </div>
              {project.selectedMcs?.length ? (
                <div className="space-y-1">
                  {project.selectedMcs.map((name, index) => {
                    const isNominated = Boolean((project as any).nominatedMcs?.[name])
                    return (
                      <div key={index} className="text-sm text-slate-700">
                        {name !== "未定" ? `・${name}` : "・未定"}
                        {name !== "未定" && isNominated && (
                          <Badge variant="outline" className="ml-2 text-xs border-purple-200 bg-purple-50 text-purple-700">
                            指名
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">未選択</p>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">押さえ状況（キャストごと）</h4>
              <Badge className="bg-yellow-100 text-yellow-900 border border-yellow-200">進捗: {progressLabel}</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">コンパニオン</div>
              {selectedCompanions.length === 0 ? (
                <div className="text-sm text-slate-500">対象なし</div>
              ) : (
                <div className="space-y-1">
                  {selectedCompanions.map((name) => {
                    const originalStatus = ((project as any).companionBookingStatus ?? {})[name] as BookingStatus | undefined
                    return (
                      <CastStatusRow
                        key={name}
                        name={name}
                        currentStatus={draftCompanionBookingStatus[name]}
                        originalStatus={originalStatus}
                        failureComment={draftCompanionFailureComment[name]}
                        disabled={draftCompanionBookingStatus[name] === "confirmed"}
                        onStatusChange={(v) => onCompanionStatusChange(name, v)}
                        onFailureCommentChange={(v) => onCompanionFailureCommentChange(name, v)}
                      />
                    )
                  })}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">ディレクター</div>
              {selectedDirectors.length === 0 ? (
                <div className="text-sm text-slate-500">対象なし</div>
              ) : (
                <div className="space-y-1">
                  {selectedDirectors.map((name) => {
                    const originalStatus = ((project as any).directorBookingStatus ?? {})[name] as BookingStatus | undefined
                    return (
                      <CastStatusRow
                        key={name}
                        name={name}
                        currentStatus={draftDirectorBookingStatus[name]}
                        originalStatus={originalStatus}
                        failureComment={draftDirectorFailureComment[name]}
                        disabled={draftDirectorBookingStatus[name] === "confirmed"}
                        onStatusChange={(v) => onDirectorStatusChange(name, v)}
                        onFailureCommentChange={(v) => onDirectorFailureCommentChange(name, v)}
                      />
                    )
                  })}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">MC</div>
              {selectedMcs.length === 0 ? (
                <div className="text-sm text-slate-500">対象なし</div>
              ) : (
                <div className="space-y-1">
                  {selectedMcs.map((name) => {
                    const originalStatus = ((project as any).mcBookingStatus ?? {})[name] as BookingStatus | undefined
                    return (
                      <CastStatusRow
                        key={name}
                        name={name}
                        currentStatus={draftMcBookingStatus[name]}
                        originalStatus={originalStatus}
                        failureComment={draftMcFailureComment[name]}
                        disabled={draftMcBookingStatus[name] === "confirmed"}
                        onStatusChange={(v) => onMcStatusChange(name, v)}
                        onFailureCommentChange={(v) => onMcFailureCommentChange(name, v)}
                      />
                    )
                  })}
                </div>
              )}
            </div>
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-sm text-yellow-900">
                「仮押さえ」はカレンダーに反映されます。「仮押さえ不可」は営業への共有（サマリコメント）に反映されます。本押さえ（確定）は手配詳細で確定した場合に自動で反映されます。
              </AlertDescription>
            </Alert>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
          <Button onClick={onSave}>
            押さえ状況を保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
