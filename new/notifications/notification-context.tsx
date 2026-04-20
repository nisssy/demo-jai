"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { Role } from "@/new/types/role"

export type NotificationItem = {
  id: string
  title: string
  message: string
  createdAt: string
  read: boolean
  targetRoles: Role[]
  fromRole?: Role
  link?: {
    path: string
    label?: string
  }
  category?:
    | "design-request"
    | "prize-order"
    | "extraction"
    | "poster-order"
    | "dm-order"
    | "winner-list"
    | "estimate"
    | "chat"
    | "general"
}

type NotificationContextValue = {
  notifications: NotificationItem[]
  unreadCount: number
  addNotification: (n: Omit<NotificationItem, "id" | "createdAt" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

const STORAGE_KEY = "new_notifications_v1"
const SEED_KEY = "new_notifications_seeded_v1"

const seedNotifications = (): NotificationItem[] => {
  const now = Date.now()
  return [
    {
      id: "seed-1",
      title: "デザイン業者から仮見積が届きました",
      message: "GW大感謝抽選会2026の仮見積金額が返却されました。見積セクションで確認してください。",
      createdAt: new Date(now - 1000 * 60 * 15).toISOString(),
      read: false,
      targetRoles: ["Sales"],
      fromRole: "DesignVendor",
      category: "estimate",
      link: { path: "/new/project/14?role=Sales" },
    },
    {
      id: "seed-2",
      title: "BS/CSから抽出依頼が届きました",
      message: "「20P以上保有」のDM可お客様リストの抽出依頼",
      createdAt: new Date(now - 1000 * 60 * 60).toISOString(),
      read: false,
      targetRoles: ["LotteryAdmin"],
      fromRole: "Internal",
      category: "extraction",
      link: { path: "/new/project/14?role=LotteryAdmin" },
    },
    {
      id: "seed-3",
      title: "当選者リストがアップロードされました",
      message: "事務管理課が当選者リストをアップロードしました。",
      createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
      read: true,
      targetRoles: ["Internal"],
      fromRole: "LotteryAdmin",
      category: "winner-list",
    },
  ]
}

const loadFromStorage = (): NotificationItem[] => {
  if (typeof window === "undefined") return []
  try {
    const seeded = localStorage.getItem(SEED_KEY)
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!seeded) {
      const seed = seedNotifications()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      localStorage.setItem(SEED_KEY, "1")
      return seed
    }
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveToStorage = (items: NotificationItem[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    setNotifications(loadFromStorage())
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setNotifications(loadFromStorage())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const persist = useCallback((next: NotificationItem[]) => {
    setNotifications(next)
    saveToStorage(next)
  }, [])

  const addNotification = useCallback<NotificationContextValue["addNotification"]>(
    (n) => {
      const item: NotificationItem = {
        ...n,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        read: false,
      }
      persist([item, ...notifications])
    },
    [notifications, persist],
  )

  const markAsRead = useCallback(
    (id: string) => {
      persist(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
    },
    [notifications, persist],
  )

  const markAllAsRead = useCallback(() => {
    persist(notifications.map((n) => ({ ...n, read: true })))
  }, [notifications, persist])

  const clearAll = useCallback(() => {
    persist([])
  }, [persist])

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
    }),
    [notifications, addNotification, markAsRead, markAllAsRead, clearAll],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    return {
      notifications: [],
      unreadCount: 0,
      addNotification: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearAll: () => {},
    } as NotificationContextValue
  }
  return ctx
}

export const useNotificationsForRole = (role: Role) => {
  const ctx = useNotifications()
  const visible = useMemo(
    () => ctx.notifications.filter((n) => n.targetRoles.includes(role)),
    [ctx.notifications, role],
  )
  return {
    ...ctx,
    notifications: visible,
    unreadCount: visible.filter((n) => !n.read).length,
  }
}
