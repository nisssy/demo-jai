import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import type { WeekDay, CellInfo, AvailabilityStatus } from "@/new/features/project-registration/hooks/useCastCalendar"

type CastCalendarModalProps = {
  isOpen: boolean
  personName: string
  personStatus: AvailabilityStatus
  weekDays: WeekDay[]
  timeSlots: string[]
  weekRangeText: string
  getCellInfo: (dayIndex: number, timeIndex: number) => CellInfo
  onClose: () => void
  onPreviousWeek: () => void
  onNextWeek: () => void
}

const LEGEND_ITEMS = [
  { color: "bg-red-100 border-red-200", label: "予定あり" },
  { color: "bg-yellow-100 border-yellow-200", label: "仮押さえあり" },
  { color: "bg-purple-100 border-purple-200", label: "指名予定あり" },
  { color: "bg-green-200 border-green-300", label: "開催時間" },
  { color: "bg-black border-slate-200", label: "重複" },
  { color: "bg-white border-slate-200", label: "空き" },
]

function getCellClassName(cell: CellInfo): string {
  const base = "p-2 border-l border-slate-200 min-h-[40px]"
  if (cell.busy && cell.isEventTime) return `${base} bg-black`
  if (cell.busy && cell.nominated) return `${base} bg-purple-100 border-purple-200`
  if (cell.tentative && !cell.busy) return `${base} bg-yellow-100 border-yellow-200`
  if (cell.busy) return `${base} bg-red-100 border-red-200`
  if (cell.isEventTime) return `${base} bg-green-200 border-green-300`
  return `${base} bg-white`
}

function CellLabel({ cell }: { cell: CellInfo }) {
  if (cell.busy && cell.isEventTime) {
    return <div className="text-xs text-white font-medium">重複</div>
  }
  if (cell.busy) {
    return (
      <div className={`text-xs font-medium ${cell.nominated ? "text-purple-800" : "text-red-700"}`}>
        {cell.nominated ? "指名予定あり" : "予定あり"}
      </div>
    )
  }
  if (cell.tentative && !cell.isEventTime) {
    return <div className="text-xs font-medium text-yellow-900">仮押さえあり</div>
  }
  if (cell.isEventTime) {
    return <div className="text-xs text-green-800 font-medium">開催時間</div>
  }
  return null
}

function StatusBadge({ status }: { status: AvailabilityStatus }) {
  const variant = status === "available" ? "default" : status === "tentative" ? "secondary" : "destructive"
  const className = status === "tentative" ? "bg-yellow-100 text-yellow-900 border border-yellow-200" : ""
  const label = status === "available" ? "空き" : status === "tentative" ? "仮押さえあり" : "埋まり"
  return (
    <Badge variant={variant} className={className}>
      リアルタイムステータス: {label}
    </Badge>
  )
}

export const CastCalendarModal = ({
  isOpen,
  personName,
  personStatus,
  weekDays,
  timeSlots,
  weekRangeText,
  getCellInfo,
  onClose,
  onPreviousWeek,
  onNextWeek,
}: CastCalendarModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Googleカレンダー連携 - {personName}のスケジュール</DialogTitle>
          <DialogDescription>予定ありの状況を確認できます</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {/* ヘッダー: タイトル + 週ナビゲーション */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm">Googleカレンダー連携 - {personName}のスケジュール</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[160px] text-center">{weekRangeText}</span>
              <Button variant="outline" size="sm" onClick={onNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* カレンダーグリッド */}
          <div className="w-full overflow-x-hidden">
            <div className="w-full">
              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-8 border-b border-slate-200">
                <div className="p-2 text-xs font-medium text-slate-500"></div>
                {weekDays.map((day, idx) => (
                  <div key={idx} className="p-2 text-center border-l border-slate-200">
                    <div className="text-xs font-medium text-slate-600">{day.dayOfWeek}</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {day.month}/{day.dayNum}
                    </div>
                  </div>
                ))}
              </div>

              {/* 時間スロット */}
              {timeSlots.map((time, timeIdx) => (
                <div key={time} className="grid grid-cols-8 border-b border-slate-200">
                  <div className="p-2 text-xs font-medium text-slate-500 flex items-start justify-end pr-3">
                    {time}
                  </div>
                  {weekDays.map((_day, dayIdx) => {
                    const cell = getCellInfo(dayIdx, timeIdx)
                    return (
                      <div key={dayIdx} className={getCellClassName(cell)}>
                        <CellLabel cell={cell} />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ステータスバッジ + 凡例 */}
          <div className="mt-4 flex items-center gap-3">
            <StatusBadge status={personStatus} />
            <div className="flex items-center gap-2 text-xs text-slate-600">
              {LEGEND_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <div className={`w-3 h-3 ${item.color} border rounded`}></div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
