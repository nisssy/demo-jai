import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { CastMember } from "@/new/api/cast-data"
import type { AvailabilityStatus } from "@/new/features/project-registration/hooks/useCastCalendar"
import { CastMemberCard } from "./CastMemberCard"

type CastTypeSectionProps = {
  title: string
  bgClass: string
  count: string
  castMembers: CastMember[]
  selectedNames: string[]
  nominations: Record<string, boolean>
  holdTypes: Record<string, "tentative" | "confirmed" | "availability-check">
  durationHours: number
  checkAvailability?: (name: string) => AvailabilityStatus
  onCountChange: (count: string) => void
  onToggle: (name: string) => void
  onToggleNomination: (name: string) => void
  onHoldTypeChange: (name: string, holdType: "tentative" | "confirmed" | "availability-check") => void
  onOpenCalendar?: (name: string, status: AvailabilityStatus) => void
}

export const CastTypeSection = ({
  title,
  bgClass,
  count,
  castMembers,
  selectedNames,
  nominations,
  holdTypes,
  durationHours,
  checkAvailability,
  onCountChange,
  onToggle,
  onToggleNomination,
  onHoldTypeChange,
  onOpenCalendar,
}: CastTypeSectionProps) => {
  const numCount = parseInt(count, 10) || 0
  const exclusiveMembers = castMembers.filter((m) => m.isExclusive)

  return (
    <div className={`space-y-4 ${bgClass} rounded-lg p-4`}>
      {/* ヘッダー: タイトル + 人数入力 */}
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">{title}</Label>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-slate-700">人数:</Label>
          <Input
            type="number"
            min="0"
            value={count}
            onChange={(e) => onCountChange(e.target.value)}
            className="w-20"
            placeholder="0"
          />
        </div>
      </div>

      {numCount > 0 && (
        <>
          {/* 未定カード */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-3">
              <CastMemberCard
                name="未定"
                isSelected={selectedNames.includes("未定")}
                isExclusive={false}
                isNominated={false}
                showNomination={false}
                hourlyRate={0}
                durationHours={0}
                onToggle={() => onToggle("未定")}
                onToggleNomination={() => {}}
              />
            </div>
          </div>

          {/* 専属 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">専属</Label>
            <div className="grid grid-cols-3 gap-3">
              {exclusiveMembers.map((member) => {
                const isSelected = selectedNames.includes(member.name)
                const availability = checkAvailability?.(member.name)
                return (
                  <CastMemberCard
                    key={member.name}
                    name={member.name}
                    isSelected={isSelected}
                    isExclusive={true}
                    isNominated={Boolean(nominations[member.name])}
                    showNomination={isSelected}
                    hourlyRate={member.hourlyRate}
                    durationHours={durationHours}
                    availability={availability}
                    holdType={holdTypes[member.name]}
                    onToggle={() => onToggle(member.name)}
                    onToggleNomination={() => onToggleNomination(member.name)}
                    onHoldTypeChange={(ht) => onHoldTypeChange(member.name, ht)}
                    onOpenCalendar={onOpenCalendar ? () => onOpenCalendar(member.name, availability ?? "available") : undefined}
                  />
                )
              })}
            </div>
          </div>

        </>
      )}
    </div>
  )
}
