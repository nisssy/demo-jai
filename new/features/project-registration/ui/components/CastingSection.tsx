import { getCompanionList, getDirectorList, getDurationInHours } from "@/new/api/cast-data"
import type { ProductFormState } from "@/new/features/project-registration/model/types"
import type { AvailabilityStatus } from "@/new/features/project-registration/hooks/useCastCalendar"
import { CastTypeSection } from "./CastTypeSection"

type CastingSectionProps = {
  product: ProductFormState
  checkAvailability?: (name: string, role: "companion" | "director") => AvailabilityStatus
  onCastCountChange: (role: "companion" | "director", count: string) => void
  onToggleCast: (role: "companion" | "director", name: string) => void
  onToggleNomination: (role: "companion" | "director", name: string) => void
  onOpenCalendar?: (name: string, status: AvailabilityStatus, type: "companion" | "director") => void
}

export const CastingSection = ({
  product,
  checkAvailability,
  onCastCountChange,
  onToggleCast,
  onToggleNomination,
  onOpenCalendar,
}: CastingSectionProps) => {
  // 表示制御はタブ側で行うため、ここでは常にレンダリング
  const companions = getCompanionList()
  const directors = getDirectorList()
  const durationHours = getDurationInHours(product.startTime, product.endTime)

  return (
    <div className="space-y-4 pt-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-2">キャスティング情報</h3>
        <div className="border-b border-slate-300 w-full" />
      </div>

      <div className="space-y-4">
        {/* コンパニオン: スロセレ以外で表示 */}
        {product.eventType !== "スロセレ" && (
          <CastTypeSection
            title="コンパニオン"
            bgClass="bg-rose-50/50 border border-rose-200/50"
            count={product.companionCount}
            castMembers={companions}
            selectedNames={product.selectedCompanions}
            nominations={product.nominatedCompanions}
            durationHours={durationHours}
            checkAvailability={checkAvailability ? (name) => checkAvailability(name, "companion") : undefined}
            onCountChange={(count) => onCastCountChange("companion", count)}
            onToggle={(name) => onToggleCast("companion", name)}
            onToggleNomination={(name) => onToggleNomination("companion", name)}
            onOpenCalendar={onOpenCalendar ? (name, status) => onOpenCalendar(name, status, "companion") : undefined}
          />
        )}

        {/* ディレクター: 常に表示 */}
        <CastTypeSection
          title="ディレクター"
          bgClass="bg-sky-50/50 border border-sky-200/50"
          count={product.directorCount}
          castMembers={directors}
          selectedNames={product.selectedDirectors}
          nominations={product.nominatedDirectors}
          durationHours={durationHours}
          checkAvailability={checkAvailability ? (name) => checkAvailability(name, "director") : undefined}
          onCountChange={(count) => onCastCountChange("director", count)}
          onToggle={(name) => onToggleCast("director", name)}
          onToggleNomination={(name) => onToggleNomination("director", name)}
          onOpenCalendar={onOpenCalendar ? (name, status) => onOpenCalendar(name, status, "director") : undefined}
        />
      </div>
    </div>
  )
}
