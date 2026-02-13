import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2 } from "lucide-react"

type CastMemberCardProps = {
  name: string
  isSelected: boolean
  isExclusive: boolean
  isNominated: boolean
  showNomination: boolean
  hourlyRate: number
  durationHours: number
  onToggle: () => void
  onToggleNomination: () => void
}

export const CastMemberCard = ({
  name,
  isSelected,
  isExclusive,
  isNominated,
  showNomination,
  hourlyRate,
  durationHours,
  onToggle,
  onToggleNomination,
}: CastMemberCardProps) => {
  const estimatedFee = hourlyRate * durationHours
  const isUndecided = name === "未定"

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
            {isExclusive ? (
              <Badge className="mt-2">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                空き（手配可）
              </Badge>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline">外部</Badge>
                <Badge>空き</Badge>
              </div>
            )}

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
          </>
        )}
      </div>
    </div>
  )
}
