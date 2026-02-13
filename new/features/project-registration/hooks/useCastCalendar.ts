"use client"

import { useState, useMemo, useCallback } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { CastSchedule, CastScheduleItem, Product } from "@/new/api/types"

// ─── 公開型 ───

export type AvailabilityStatus = "available" | "tentative" | "busy"

export type WeekDay = {
  date: Date
  dayOfWeek: string
  dayNum: number
  month: number
}

export type SlotInfo = {
  busy: boolean
  tentative: boolean
  nominated: boolean
}

export type CellInfo = SlotInfo & {
  isEventTime: boolean
}

export type CalendarModalState = {
  isOpen: boolean
  personName: string
  personStatus: AvailabilityStatus
  personType: "companion" | "director"
}

export type UseCastCalendarReturn = {
  // モーダル状態
  modal: CalendarModalState
  openModal: (name: string, status: AvailabilityStatus, type: "companion" | "director") => void
  closeModal: () => void
  // 週データ
  weekDays: WeekDay[]
  timeSlots: string[]
  weekRangeText: string
  goToPreviousWeek: () => void
  goToNextWeek: () => void
  // セル情報
  getCellInfo: (dayIndex: number, timeIndex: number) => CellInfo
  // 空き状況チェック
  checkAvailability: (castName: string, role: "companion" | "director") => AvailabilityStatus
}

// ─── ヘルパー ───

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart
}

function timeToMinutes(t: string): number | null {
  if (!t) return null
  const [h, m] = t.split(":").map(Number)
  return h * 60 + (m || 0)
}

// ─── Hook ───

export type UseCastCalendarArgs = {
  repository: ProjectRepository
  eventDate: string
  startTime: string
  endTime: string
}

export function useCastCalendar({ repository, eventDate, startTime, endTime }: UseCastCalendarArgs): UseCastCalendarReturn {
  // モーダル状態
  const [modal, setModal] = useState<CalendarModalState>({
    isOpen: false,
    personName: "",
    personStatus: "available",
    personType: "companion",
  })

  // 週の開始日（月曜）
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()))

  // データ取得
  const castSchedules = useMemo(() => repository.getCastSchedules(), [repository])
  const allProducts = useMemo(() => repository.getProducts(), [repository])

  // キャスト名→スケジュールアイテムのマップ
  const scheduleMap = useMemo(() => {
    const map = new Map<string, CastScheduleItem[]>()
    for (const cs of castSchedules) {
      map.set(cs.castName, cs.items)
    }
    return map
  }, [castSchedules])

  // 週データ
  const weekDays = useMemo<WeekDay[]>(() => {
    const days: WeekDay[] = []
    const dayLabels = ["月", "火", "水", "木", "金", "土", "日"]
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      days.push({
        date,
        dayOfWeek: dayLabels[i],
        dayNum: date.getDate(),
        month: date.getMonth() + 1,
      })
    }
    return days
  }, [weekStart])

  const timeSlots = useMemo(() => {
    const slots: string[] = []
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour}:00`)
    }
    return slots
  }, [])

  const weekRangeText = useMemo(() => {
    const endDate = new Date(weekStart)
    endDate.setDate(endDate.getDate() + 6)
    return `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}, ${weekStart.getFullYear()}`
  }, [weekStart])

  // スロットの予定判定
  const getSlotInfo = useCallback(
    (dayIndex: number, timeIndex: number, personName: string, personType: "companion" | "director", days: WeekDay[]): SlotInfo => {
      const schedules = scheduleMap.get(personName) || []
      const day = days[dayIndex]
      if (!day) return { busy: false, tentative: false, nominated: false }

      const dayOfWeek = day.date.getDay() // 0=日曜, 1=月曜, ...
      const targetHour = 9 + timeIndex

      // 保存されたブッキング（他商材の本押さえ/仮押さえ）を判定
      const dayDateStr = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`
      let tentative = false
      let busy = false
      let nominated = false

      for (const p of allProducts) {
        if (!p.eventDate) continue
        const pDate = p.eventDate.replace(/\//g, "-")
        if (pDate !== dayDateStr) continue

        const sMin = timeToMinutes(p.startTime ?? "") ?? 9 * 60
        const eMin = timeToMinutes(p.endTime ?? "") ?? 18 * 60
        const slotStart = targetHour * 60
        const slotEnd = slotStart + 60
        if (!overlaps(slotStart, slotEnd, sMin, eMin)) continue

        const statusMap = personType === "companion"
          ? p.companionBookingStatus
          : p.directorBookingStatus
        const st = statusMap?.[personName]
        if (!st) continue

        if (st === "confirmed_completed" || st === "confirmed_requesting") busy = true
        if (st === "tentative_completed" || st === "tentative_requesting") tentative = true

        // 指名フラグ
        // (Product型にはnominatedCompanions/nominatedDirectorsがないため、選択済みリストで判定)
        if (busy) break
      }

      if (busy) return { busy: true, tentative, nominated }

      // シードスケジュール（曜日ベース）から判定
      for (const schedule of schedules) {
        if (schedule.dayOfWeek === dayOfWeek) {
          const [scheduleStartHour] = schedule.startTime.split(":").map(Number)
          const [scheduleEndHour] = schedule.endTime.split(":").map(Number)
          if (targetHour >= scheduleStartHour && targetHour < scheduleEndHour) {
            const isTentative = schedule.holdType === "tentative"
            return { busy: !isTentative, tentative: isTentative, nominated: Boolean(schedule.nominated) }
          }
        }
      }

      return { busy: false, tentative, nominated }
    },
    [scheduleMap, allProducts],
  )

  // セル情報（スロット + イベント時間ハイライト）
  const getCellInfo = useCallback(
    (dayIndex: number, timeIndex: number): CellInfo => {
      const slotInfo = getSlotInfo(dayIndex, timeIndex, modal.personName, modal.personType, weekDays)

      let isEventTime = false
      if (eventDate && startTime && endTime) {
        const day = weekDays[dayIndex]
        if (day) {
          const eventDateObj = new Date(eventDate)
          const dayDateStr = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`
          const eventDateStr = `${eventDateObj.getFullYear()}-${String(eventDateObj.getMonth() + 1).padStart(2, "0")}-${String(eventDateObj.getDate()).padStart(2, "0")}`

          if (dayDateStr === eventDateStr) {
            const [eventStartHour] = startTime.split(":").map(Number)
            const [eventEndHour] = endTime.split(":").map(Number)
            const currentHour = 9 + timeIndex
            if (currentHour >= eventStartHour && currentHour < eventEndHour) {
              isEventTime = true
            }
          }
        }
      }

      return { ...slotInfo, isEventTime }
    },
    [getSlotInfo, modal.personName, modal.personType, weekDays, eventDate, startTime, endTime],
  )

  // 空き状況チェック（CastMemberCard のバッジ用）
  const checkAvailability = useCallback(
    (castName: string, role: "companion" | "director"): AvailabilityStatus => {
      const schedules = scheduleMap.get(castName) || []
      if (!eventDate || !startTime || !endTime) return "available"

      const eventDateObj = new Date(eventDate)
      const eventDayOfWeek = eventDateObj.getDay()
      const eventStartMin = timeToMinutes(startTime) ?? 9 * 60
      const eventEndMin = timeToMinutes(endTime) ?? 18 * 60

      // 保存されたブッキングをチェック
      const targetDateStr = eventDate.replace(/\//g, "-")
      let hasConfirmedBooking = false
      let hasTentativeBooking = false

      for (const p of allProducts) {
        if (!p.eventDate) continue
        const pDate = p.eventDate.replace(/\//g, "-")
        if (pDate !== targetDateStr) continue

        const sMin = timeToMinutes(p.startTime ?? "") ?? 9 * 60
        const eMin = timeToMinutes(p.endTime ?? "") ?? 18 * 60
        if (!overlaps(eventStartMin, eventEndMin, sMin, eMin)) continue

        const statusMap = role === "companion" ? p.companionBookingStatus : p.directorBookingStatus
        const st = statusMap?.[castName]
        if (st === "confirmed_completed" || st === "confirmed_requesting") hasConfirmedBooking = true
        if (st === "tentative_completed" || st === "tentative_requesting") hasTentativeBooking = true
      }

      // シードスケジュール（曜日ベース）から判定
      let hasTentativeSchedule = false
      for (const schedule of schedules) {
        if (schedule.dayOfWeek === eventDayOfWeek) {
          const schedStartMin = timeToMinutes(schedule.startTime) ?? 0
          const schedEndMin = timeToMinutes(schedule.endTime) ?? 0
          if (overlaps(eventStartMin, eventEndMin, schedStartMin, schedEndMin)) {
            if (schedule.holdType === "tentative") {
              hasTentativeSchedule = true
            } else {
              return "busy"
            }
          }
        }
      }

      if (hasConfirmedBooking) return "busy"
      if (hasTentativeBooking || hasTentativeSchedule) return "tentative"
      return "available"
    },
    [scheduleMap, allProducts, eventDate, startTime, endTime],
  )

  // モーダル操作
  const openModal = useCallback((name: string, status: AvailabilityStatus, type: "companion" | "director") => {
    setModal({ isOpen: true, personName: name, personStatus: status, personType: type })
  }, [])

  const closeModal = useCallback(() => {
    setModal((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const goToPreviousWeek = useCallback(() => {
    setWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 7)
      return d
    })
  }, [])

  const goToNextWeek = useCallback(() => {
    setWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 7)
      return d
    })
  }, [])

  return {
    modal,
    openModal,
    closeModal,
    weekDays,
    timeSlots,
    weekRangeText,
    goToPreviousWeek,
    goToNextWeek,
    getCellInfo,
    checkAvailability,
  }
}
