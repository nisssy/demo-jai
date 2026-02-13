import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { CastMember } from "@/new/api/cast-data"
import { CastMemberCard } from "./CastMemberCard"

type CastTypeSectionProps = {
  title: string
  bgClass: string
  count: string
  castMembers: CastMember[]
  selectedNames: string[]
  nominations: Record<string, boolean>
  durationHours: number
  onCountChange: (count: string) => void
  onToggle: (name: string) => void
  onToggleNomination: (name: string) => void
}

export const CastTypeSection = ({
  title,
  bgClass,
  count,
  castMembers,
  selectedNames,
  nominations,
  durationHours,
  onCountChange,
  onToggle,
  onToggleNomination,
}: CastTypeSectionProps) => {
  const numCount = parseInt(count, 10) || 0
  const exclusiveMembers = castMembers.filter((m) => m.isExclusive)
  const externalMembers = castMembers.filter((m) => !m.isExclusive)

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
                    onToggle={() => onToggle(member.name)}
                    onToggleNomination={() => onToggleNomination(member.name)}
                  />
                )
              })}
            </div>
          </div>

          {/* 外部 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">外部</Label>
            <div className="grid grid-cols-3 gap-3">
              {externalMembers.map((member) => {
                const isSelected = selectedNames.includes(member.name)
                return (
                  <CastMemberCard
                    key={member.name}
                    name={member.name}
                    isSelected={isSelected}
                    isExclusive={false}
                    isNominated={Boolean(nominations[member.name])}
                    showNomination={isSelected}
                    hourlyRate={member.hourlyRate}
                    durationHours={durationHours}
                    onToggle={() => onToggle(member.name)}
                    onToggleNomination={() => onToggleNomination(member.name)}
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
