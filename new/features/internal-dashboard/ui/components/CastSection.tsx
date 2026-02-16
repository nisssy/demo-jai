import { CastStatusBadge } from "./CastStatusBadge"
import type { BookingStatus } from "@/new/api/types"

export function CastSection({
  label,
  names,
  bookingStatus,
}: {
  label: string
  names: string[]
  bookingStatus: Record<string, BookingStatus>
}) {
  const filtered = names.filter(n => n !== "未定")
  if (filtered.length === 0) return null
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {filtered.map(name => (
          <CastStatusBadge
            key={name}
            name={name}
            status={bookingStatus[name] ?? "tentative_requesting"}
          />
        ))}
      </div>
    </div>
  )
}
