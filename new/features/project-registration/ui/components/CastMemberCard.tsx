import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, Calendar } from "lucide-react"
import type { AvailabilityStatus } from "@/new/features/project-registration/hooks/useCastCalendar"

type CastMemberCardProps = {
  name: string
  isSelected: boolean
  isExclusive: boolean
  isNominated: boolean
  showNomination: boolean
  hourlyRate: number
  durationHours: number
  availability?: AvailabilityStatus
  onToggle: () => void
  onToggleNomination: () => void
  onOpenCalendar?: () => void
}

function AvailabilityBadge({ availability, isExclusive }: { availability: AvailabilityStatus; isExclusive: boolean }) {
  if (availability === "busy") {
    return (
      <Badge variant="destructive" className="mt-2">
        埋まり
      </Badge>
    )
  }
  if (availability === "tentative") {
    return (
      <Badge className="mt-2 bg-yellow-100 text-yellow-900 border border-yellow-200">
        仮押さえあり
      </Badge>
    )
  }
  // available
  if (isExclusive) {
    return (
      <Badge className="mt-2">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        空き（手配可）
      </Badge>
    )
  }
  return (
    <div className="mt-2 flex items-center gap-2">
      <Badge variant="outline">外部</Badge>
      <Badge>空き</Badge>
    </div>
  )
}

export const CastMemberCard = ({
  name,
  isSelected,
  isExclusive,
  isNominated,
  showNomination,
  hourlyRate,
  durationHours,
  availability,
  onToggle,
  onToggleNomination,
  onOpenCalendar,
}: CastMemberCardProps) => {
  const estimatedFee = hourlyRate * durationHours
  const isUndecided = name === "未定"
  const status = availability ?? "available"

  return (
    <div
      className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
      }`}
      onClick={onToggle}
    >
      <div className="w-full text-left">
        <div className="flex items-center gap-2">
          <div className="font-medium text-slate-900">{name}</div>
          {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
          {isSelected && isNominated && (
            <Badge variant="outline" className="ml-1 border-purple-200 bg-purple-50 text-purple-700">
              指名
            </Badge>
          )}
        </div>

        {isUndecided ? (
          <Badge variant="outline" className="mt-2">
            未定
          </Badge>
        ) : (
          <>
            <AvailabilityBadge availability={status} isExclusive={isExclusive} />

            <div className="mt-2 text-sm text-slate-900">
              <span className="text-slate-600">予想金額: </span>
              <span className="font-semibold">¥{estimatedFee.toLocaleString()}</span>
            </div>

            {showNomination && (
              <div
                className="mt-2 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox checked={isNominated} onCheckedChange={onToggleNomination} />
                <span className="text-xs text-slate-700">指名</span>
              </div>
            )}

            {onOpenCalendar && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenCalendar()
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                カレンダーで詳細を確認
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
