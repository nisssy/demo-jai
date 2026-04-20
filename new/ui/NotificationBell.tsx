"use client"

import { useMemo, useState } from "react"
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAppRouter } from "@/hooks/use-app-router"
import { useNotificationsForRole, type NotificationItem } from "@/new/notifications/notification-context"
import type { Role } from "@/new/types/role"

type Props = {
  currentRole: Role
}

const formatTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "たった今"
  if (m < 60) return `${m}分前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}時間前`
  const d = Math.floor(h / 24)
  return `${d}日前`
}

export const NotificationBell = ({ currentRole }: Props) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationsForRole(currentRole)
  const [open, setOpen] = useState(false)
  const router = useAppRouter()

  const sorted = useMemo(
    () => [...notifications].sort((a, b) => (a.read === b.read ? 0 : a.read ? 1 : -1)),
    [notifications],
  )

  const handleOpenItem = (n: NotificationItem) => {
    markAsRead(n.id)
    if (n.link?.path) {
      setOpen(false)
      router.push(n.link.path)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative gap-2"
          aria-label="通知"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-700" />
            <span className="font-semibold text-slate-900">通知</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                未確認 {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-3 w-3" />
              全て既読
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-slate-500"
              onClick={clearAll}
              disabled={sorted.length === 0}
            >
              <Trash2 className="h-3 w-3" />
              クリア
            </Button>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              通知はありません
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sorted.map((n) => (
                <li
                  key={n.id}
                  className={`cursor-pointer px-4 py-3 transition hover:bg-slate-50 ${
                    n.read ? "bg-white" : "bg-blue-50/40"
                  }`}
                  onClick={() => handleOpenItem(n)}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        n.read ? "bg-slate-300" : "bg-blue-500"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`truncate text-sm ${n.read ? "text-slate-600" : "font-semibold text-slate-900"}`}>
                          {n.title}
                        </p>
                        <span className="shrink-0 text-[11px] text-slate-400">{formatTime(n.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</p>
                      {n.link?.label && (
                        <span className="mt-1 inline-block text-[11px] font-medium text-blue-600">
                          {n.link.label} →
                        </span>
                      )}
                    </div>
                    {!n.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(n.id)
                        }}
                        aria-label="既読にする"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
