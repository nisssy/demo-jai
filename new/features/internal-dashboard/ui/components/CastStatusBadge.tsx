import { Badge } from "@/components/ui/badge"
import { BOOKING_STATUS_LABELS } from "@/new/api/display"
import type { BookingStatus } from "@/new/api/types"

const bookingStatusColor: Record<BookingStatus, string> = {
  tentative_requesting: "bg-yellow-100 text-yellow-800 border-yellow-300",
  tentative_failed: "bg-red-100 text-red-800 border-red-300",
  tentative_completed: "bg-blue-100 text-blue-800 border-blue-300",
  confirmed_requesting: "bg-orange-100 text-orange-800 border-orange-300",
  confirmed_failed: "bg-red-100 text-red-800 border-red-300",
  confirmed_completed: "bg-green-100 text-green-800 border-green-300",
}

export function CastStatusBadge({ name, status }: { name: string; status: BookingStatus }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{name}</span>
      <Badge className={bookingStatusColor[status]}>
        {BOOKING_STATUS_LABELS[status]}
      </Badge>
    </div>
  )
}
