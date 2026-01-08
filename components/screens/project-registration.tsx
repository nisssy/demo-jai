"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Sparkles, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"
import type { ProjectData } from "@/types/project"
import { useState, useMemo, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useProject } from "@/contexts/project-context"

type ProjectRegistrationProps = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onNext: () => void
  onBack: () => void
  addNotification: (message: string) => void
  projectId?: number | null
}

export function ProjectRegistration({
  projectData,
  setProjectData,
  onNext,
  onBack,
  addNotification,
  projectId,
}: ProjectRegistrationProps) {
  const router = useRouter()
  const { createProjects, createProject, getProjectById, updateProject } = useProject()
  const isEditMode = projectId !== undefined && projectId !== null
  const [showResourceSection, setShowResourceSection] = useState(false)
  const [acquirerName, setAcquirerName] = useState("")
  const [requestDate, setRequestDate] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  })
  const [hallName, setHallName] = useState("")
  const [status, setStatus] = useState("営業確認待ち")
  
  // 商材情報の型定義
  type ProductInfo = {
    id: number
    category: string
    eventType: string
    eventProductName: string
    eventDate: string
    startTime: string
    endTime: string
    isOpen: boolean
  }

  // 商材情報の初期値
  const getInitialProductInfo = (id: number): ProductInfo => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return {
      id,
      category: "イベント",
      eventType: "トリニティガール",
      eventProductName: "",
      eventDate: `${year}-${month}-${day}`,
      startTime: "08:00",
      endTime: "15:00",
      isOpen: true,
    }
  }

  const [productInfos, setProductInfos] = useState<ProductInfo[]>([getInitialProductInfo(1)])
  
  // 既存のstateを商材情報①と互換性を保つために残す（後方互換性のため）
  const category = productInfos[0]?.category || "イベント"
  const eventType = productInfos[0]?.eventType || "トリニティガール"
  const eventProductName = productInfos[0]?.eventProductName || ""
  const eventDate = productInfos[0]?.eventDate || ""
  const startTime = productInfos[0]?.startTime || "08:00"
  const endTime = productInfos[0]?.endTime || "15:00"
  const isProductInfoOpen = productInfos[0]?.isOpen ?? true

  // 商材情報の更新関数
  const updateProductInfo = (index: number, updates: Partial<ProductInfo>) => {
    setProductInfos((prev) => {
      const newInfos = [...prev]
      newInfos[index] = { ...newInfos[index], ...updates }
      return newInfos
    })
  }

  // 商材情報の追加
  const addProductInfo = () => {
    if (productInfos.length < 5) {
      const newId = Math.max(...productInfos.map((p) => p.id), 0) + 1
      setProductInfos((prev) => [...prev, getInitialProductInfo(newId)])
    }
  }

  // 商材情報の削除
  const removeProductInfo = (id: number) => {
    if (productInfos.length > 1) {
      setProductInfos((prev) => prev.filter((p) => p.id !== id))
    }
  }

  // 開催時間数を計算する関数
  const calculateDurationForProduct = (start: string, end: string): string => {
    if (!start || !end) {
      return ""
    }

    const [startHour, startMinute] = start.split(":").map(Number)
    const [endHour, endMinute] = end.split(":").map(Number)

    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute

    if (endTotalMinutes < startTotalMinutes) {
      return ""
    }

    const diffMinutes = endTotalMinutes - startTotalMinutes
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60

    return `${hours}時間${minutes.toString().padStart(2, "0")}分`
  }
  const [selectedCompanions, setSelectedCompanions] = useState<Set<string>>(new Set())
  const [selectedDirectors, setSelectedDirectors] = useState<Set<string>>(new Set())
  const [selectedMcs, setSelectedMcs] = useState<Set<string>>(new Set())
  const [transportationFeePerPerson, setTransportationFeePerPerson] = useState("")
  const [accommodationFeePerPerson, setAccommodationFeePerPerson] = useState("")
  const [eventBaseFee, setEventBaseFee] = useState("")
  const [calendarModalOpen, setCalendarModalOpen] = useState(false)
  const [modalPersonName, setModalPersonName] = useState("")
  const [modalPersonStatus, setModalPersonStatus] = useState<"available" | "busy">("available")
  const [modalPersonType, setModalPersonType] = useState<"companion" | "director" | "mc">("companion")
  const [modalCurrentWeekStart, setModalCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(today.setDate(diff))
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // 開催時間数を自動計算
  const calculateDuration = (): string => {
    if (!startTime || !endTime) {
      return ""
    }

    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute

    if (endTotalMinutes < startTotalMinutes) {
      return "" // 終了時間が開始時間より前の場合は計算しない
    }

    const diffMinutes = endTotalMinutes - startTotalMinutes
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60

    return `${hours}時間${minutes.toString().padStart(2, "0")}分`
  }

  const duration = calculateDuration()

  // 開催時間数を数値（時間）で取得
  const getDurationInHours = (): number => {
    if (!startTime || !endTime) {
      return 0
    }

    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute

    if (endTotalMinutes < startTotalMinutes) {
      return 0
    }

    const diffMinutes = endTotalMinutes - startTotalMinutes
    return diffMinutes / 60 // 時間に変換
  }

  // 各人材の時給データ（円/時間）
  const companionHourlyRates: { [key: string]: number } = {
    // 専属コンパニオン
    "Rio": 5000,
    "Ayaka": 5500,
    "Nanaka": 5200,
    // 外部コンパニオン
    "山田 花子": 6000,
    "佐藤 美咲": 5800,
    "鈴木 さくら": 6200,
    "高橋 みゆき": 5900,
    "伊藤 あかり": 6100,
  }

  const directorHourlyRates: { [key: string]: number } = {
    // 専属ディレクター
    "Takeshi": 8000,
    "Kenji": 8500,
    "Hiroshi": 8200,
    // 外部ディレクター
    "田中 ディレクター": 9000,
    "佐藤 ディレクター": 8800,
    "鈴木 ディレクター": 9200,
    "高橋 ディレクター": 8900,
    "伊藤 ディレクター": 9100,
  }

  const mcHourlyRates: { [key: string]: number } = {
    // 専属MC
    "Yuki": 7000,
    "Saki": 7200,
    "Mai": 7100,
    // 外部MC
    "山田 MC": 7500,
    "中村 MC": 7300,
    "小林 MC": 7600,
    "加藤 MC": 7400,
    "松本 MC": 7500,
  }

  // 総コスト計算
  const totalCompanionCost = useMemo(() => {
    const durationHours = getDurationInHours()
    return Array.from(selectedCompanions).reduce((total, name) => {
      const hourlyRate = companionHourlyRates[name] || 0
      return total + (hourlyRate * durationHours)
    }, 0)
  }, [selectedCompanions, startTime, endTime])

  const totalDirectorCost = useMemo(() => {
    const durationHours = getDurationInHours()
    return Array.from(selectedDirectors).reduce((total, name) => {
      const hourlyRate = directorHourlyRates[name] || 0
      return total + (hourlyRate * durationHours)
    }, 0)
  }, [selectedDirectors, startTime, endTime])

  const totalMcCost = useMemo(() => {
    const durationHours = getDurationInHours()
    return Array.from(selectedMcs).reduce((total, name) => {
      const hourlyRate = mcHourlyRates[name] || 0
      return total + (hourlyRate * durationHours)
    }, 0)
  }, [selectedMcs, startTime, endTime])

  const totalCost = totalCompanionCost + totalDirectorCost + totalMcCost

  // キャストの総人数
  const totalCastCount = selectedCompanions.size + selectedDirectors.size + selectedMcs.size

  // 交通費の合計
  const totalTransportationFee = useMemo(() => {
    const feePerPerson = Number(transportationFeePerPerson) || 0
    return feePerPerson * totalCastCount
  }, [transportationFeePerPerson, totalCastCount])

  // 宿泊費の合計
  const totalAccommodationFee = useMemo(() => {
    const feePerPerson = Number(accommodationFeePerPerson) || 0
    return feePerPerson * totalCastCount
  }, [accommodationFeePerPerson, totalCastCount])

  // 請求予定金額の合計
  const totalBillingAmount = totalCost + totalTransportationFee + totalAccommodationFee + (Number(eventBaseFee) || 0)

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    
    if (!acquirerName.trim()) {
      newErrors.acquirerName = "ホール担当営業を入力してください"
    }
    if (!requestDate) {
      newErrors.requestDate = "依頼日を入力してください"
    }
    if (!hallName.trim()) {
      newErrors.hallName = "ホール名を入力してください"
    }
    if (!status) {
      newErrors.status = "ステータスを選択してください"
    }
    
    // 商材情報のバリデーション
    productInfos.forEach((productInfo, index) => {
      if (!productInfo.eventProductName.trim()) {
        newErrors[`eventProductName-${index}`] = `商材情報${index + 1 === 1 ? "①" : index + 1 === 2 ? "②" : index + 1 === 3 ? "③" : index + 1 === 4 ? "④" : "⑤"}のイベント商材名を入力してください`
      }
      if (!productInfo.eventDate) {
        newErrors[`eventDate-${index}`] = `商材情報${index + 1 === 1 ? "①" : index + 1 === 2 ? "②" : index + 1 === 3 ? "③" : index + 1 === 4 ? "④" : "⑤"}の開催日を入力してください`
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateProjects = () => {
    if (!validateForm()) {
      return
    }
    
    if (isEditMode && projectId) {
      // 編集モード: 既存案件を更新
      const updatedProject = {
        projectName: productInfos[0]?.eventProductName || `${hallName} - ${productInfos[0]?.category || "イベント"}`,
        clientName: hallName,
        date: productInfos[0]?.eventDate.replace(/-/g, "/") || "",
        venue: hallName,
        talent: acquirerName,
        estimateAmount: `¥${totalBillingAmount.toLocaleString()}`,
        status: "proposed" as const,
        salesPersonName: acquirerName,
        requestDate: requestDate.replace(/-/g, "/"),
        hallName: hallName,
        projectStatus: status,
        category: productInfos[0]?.category || "イベント",
        eventType: productInfos[0]?.eventType || "トリニティガール",
        eventProductName: productInfos[0]?.eventProductName || "",
        eventDate: productInfos[0]?.eventDate.replace(/-/g, "/") || "",
        estimatedBillingAmount: totalBillingAmount,
      }
      
      updateProject(projectId, updatedProject)
      addNotification("案件を更新しました")
      router.push("/")
    } else {
      // 新規作成モード: 各商材情報ごとに案件を作成
      const newProjectsData = productInfos.map((productInfo) => {
        // 各商材情報の請求予定金額を計算
        // 注意: 現在の実装では各商材情報ごとに独立したキャスティング情報を持っていないため、
        // 暫定的に商材情報①の請求予定金額を使用（将来的には各商材情報ごとに計算する必要がある）
        const estimatedBillingAmount = productInfo.id === productInfos[0].id 
          ? totalBillingAmount 
          : 0 // 暫定値として0を設定（将来的には各商材情報ごとに計算）
        
        return {
          projectName: productInfo.eventProductName || `${hallName} - ${productInfo.category}`,
          clientName: hallName,
          date: productInfo.eventDate.replace(/-/g, "/"),
          venue: hallName,
          talent: acquirerName,
          estimateAmount: `¥${estimatedBillingAmount.toLocaleString()}`,
          status: "proposed" as const,
          // 新しい項目を追加
          salesPersonName: acquirerName,
          requestDate: requestDate.replace(/-/g, "/"),
          hallName: hallName,
          projectStatus: status,
          category: productInfo.category,
          eventType: productInfo.eventType,
          eventProductName: productInfo.eventProductName,
          eventDate: productInfo.eventDate.replace(/-/g, "/"),
          estimatedBillingAmount: estimatedBillingAmount,
        }
      })
      
      // 仮想DBに案件を作成
      createProjects(newProjectsData)
      addNotification(`${newProjectsData.length}件の案件を作成しました`)
      router.push("/")
    }
  }

  const handleSave = () => {
    if (!validateForm()) {
      return
    }
    
    // 仮想DBに案件を作成
    createProject({
      projectName: `${hallName} - ${acquirerName}`,
      clientName: hallName,
      date: requestDate.replace(/-/g, "/"),
      venue: hallName,
      talent: "",
      estimateAmount: "¥0",
      status: "proposed",
    })
    addNotification("案件を保存しました")
    router.push("/")
  }

  const handleSaveAndContinue = () => {
    if (!validateForm()) {
      return
    }
    
    // 仮想DBに案件を作成
    createProject({
      projectName: `${hallName} - ${acquirerName}`,
      clientName: hallName,
      date: requestDate.replace(/-/g, "/"),
      venue: hallName,
      talent: "",
      estimateAmount: "¥0",
      status: "proposed",
    })
    addNotification("案件を保存しました")
    setShowResourceSection(true)
  }
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
    return new Date(today.setDate(diff))
  })

  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)
  const [isLoadingBooking, setIsLoadingBooking] = useState(false)
  const [directorWorkingHours, setDirectorWorkingHours] = useState("")

  // 編集モードで既存データを読み込む
  useEffect(() => {
    if (isEditMode && projectId && getProjectById) {
      const project = getProjectById(projectId)
      if (project) {
        // 基本情報を読み込み
        if (project.salesPersonName) setAcquirerName(project.salesPersonName)
        if (project.requestDate) {
          // YYYY/MM/DD形式をYYYY-MM-DD形式に変換
          const dateStr = project.requestDate.replace(/\//g, "-")
          setRequestDate(dateStr)
        }
        if (project.hallName) setHallName(project.hallName)
        if (project.projectStatus) setStatus(project.projectStatus)
        
        // 商材情報を読み込み
        if (project.category && project.eventType && project.eventProductName && project.eventDate) {
          const eventDateStr = project.eventDate.replace(/\//g, "-")
          setProductInfos([{
            id: 1,
            category: project.category,
            eventType: project.eventType,
            eventProductName: project.eventProductName,
            eventDate: eventDateStr,
            startTime: "08:00", // デフォルト値（将来的には保存する必要がある）
            endTime: "15:00", // デフォルト値（将来的には保存する必要がある）
            isOpen: true,
          }])
        }
      }
    }
  }, [isEditMode, projectId, getProjectById])

  useEffect(() => {
    if (projectData.date) {
      const selectedDate = new Date(projectData.date)
      const day = selectedDate.getDay()
      const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1) // Monday of the week
      const weekStart = new Date(selectedDate)
      weekStart.setDate(diff)
      setCurrentWeekStart(weekStart)
    }
  }, [projectData.date])

  const weekData = useMemo(() => {
    const weekDays = []
    const timeSlots = []

    // Generate time slots from 9:00 to 18:00
    for (let hour = 9; hour <= 18; hour++) {
      timeSlots.push(`${hour}:00`)
    }

    // Generate 7 days starting from Monday
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(date.getDate() + i)
      weekDays.push({
        date: date,
        dayOfWeek: ["月", "火", "水", "木", "金", "土", "日"][i],
        dayNum: date.getDate(),
        month: date.getMonth() + 1,
      })
    }

    return { weekDays, timeSlots }
  }, [currentWeekStart])

  const getBusySlots = (dayIndex: number, timeIndex: number, companionName?: string, weekDays?: typeof weekData.weekDays, status?: "available" | "busy") => {
    if (!companionName) {
      const talentStatus = status || projectData.talentStatus
      if (talentStatus === "available") {
        return dayIndex === 2 && timeIndex >= 5 && timeIndex <= 7 // Wednesday 14:00-17:00
      } else {
        return (
          (dayIndex === 1 && timeIndex >= 1 && timeIndex <= 3) || // Tuesday 10:00-13:00
          (dayIndex === 3 && timeIndex >= 4 && timeIndex <= 8) || // Thursday 13:00-18:00
          (dayIndex === 4 && timeIndex >= 0 && timeIndex <= 2) // Friday 9:00-12:00
        )
      }
    }

    // 人材名が指定されている場合は、予定データから判定
    let schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string }> = []
    if (companionName) {
      if (modalPersonType === "companion") {
        schedules = companionSchedules[companionName as keyof typeof companionSchedules] || []
      } else if (modalPersonType === "director") {
        schedules = directorSchedules[companionName as keyof typeof directorSchedules] || []
      } else if (modalPersonType === "mc") {
        schedules = mcSchedules[companionName as keyof typeof mcSchedules] || []
      }
    }
    const days = weekDays || modalWeekData.weekDays
    const day = days[dayIndex]
    if (!day) return false

    const dayOfWeek = day.date.getDay() // 0=日曜日, 1=月曜日, ...
    const targetHour = 9 + timeIndex

    for (const schedule of schedules) {
      if (schedule.dayOfWeek === dayOfWeek) {
        const [scheduleStartHour] = schedule.startTime.split(":").map(Number)
        const [scheduleEndHour] = schedule.endTime.split(":").map(Number)
        if (targetHour >= scheduleStartHour && targetHour < scheduleEndHour) {
          return true
        }
      }
    }

    return false
  }

  const modalWeekData = useMemo(() => {
    const weekDays = []
    const timeSlots = []

    // Generate time slots from 9:00 to 18:00
    for (let hour = 9; hour <= 18; hour++) {
      timeSlots.push(`${hour}:00`)
    }

    // Generate 7 days starting from Monday
    for (let i = 0; i < 7; i++) {
      const date = new Date(modalCurrentWeekStart)
      date.setDate(date.getDate() + i)
      weekDays.push({
        date: date,
        dayOfWeek: ["月", "火", "水", "木", "金", "土", "日"][i],
        dayNum: date.getDate(),
        month: date.getMonth() + 1,
      })
    }

    return { weekDays, timeSlots }
  }, [modalCurrentWeekStart])

  const modalWeekRangeText = useMemo(() => {
    const endDate = new Date(modalCurrentWeekStart)
    endDate.setDate(endDate.getDate() + 6)
    return `${modalCurrentWeekStart.getMonth() + 1}/${modalCurrentWeekStart.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}, ${modalCurrentWeekStart.getFullYear()}`
  }, [modalCurrentWeekStart])

  const handleOpenCalendarModal = (personName: string, status: "available" | "busy", personType: "companion" | "director" | "mc") => {
    setModalPersonName(personName)
    setModalPersonStatus(status)
    setModalPersonType(personType)
    setCalendarModalOpen(true)
  }

  const handleModalGoToPreviousWeek = () => {
    const newWeekStart = new Date(modalCurrentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() - 7)
    setModalCurrentWeekStart(newWeekStart)
  }

  const handleModalGoToNextWeek = () => {
    const newWeekStart = new Date(modalCurrentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() + 7)
    setModalCurrentWeekStart(newWeekStart)
  }

  const handleTalentSelect = (talent: string, status: "available" | "busy") => {
    setProjectData({ ...projectData, talent, talentStatus: status })
    setSelectedSlots(new Set())
  }

  const getSlotId = (dayIdx: number, timeIdx: number) => {
    return `${dayIdx}-${timeIdx}`
  }

  const handleSlotClick = (dayIdx: number, timeIdx: number, isBusy: boolean) => {
    if (isBusy) return // Don't allow selecting busy slots

    const slotId = getSlotId(dayIdx, timeIdx)
    const newSelectedSlots = new Set(selectedSlots)

    if (newSelectedSlots.has(slotId)) {
      newSelectedSlots.delete(slotId)
    } else {
      newSelectedSlots.add(slotId)
    }

    setSelectedSlots(newSelectedSlots)
  }

  const handleProvisionalBooking = () => {
    if (selectedSlots.size === 0) {
      addNotification(`エラー: 仮押さえする時間帯を選択してください`)
      return
    }

    const slotDetails = Array.from(selectedSlots)
      .map((slotId) => {
        const [dayIdx, timeIdx] = slotId.split("-").map(Number)
        const day = weekData.weekDays[dayIdx]
        const time = weekData.timeSlots[timeIdx]
        return `${day.month}/${day.dayNum} ${time}`
      })
      .join(", ")

    setIsLoadingBooking(true)
    addNotification(`Slack通知: ${projectData.talent}の仮押さえ完了（${slotDetails}）`)
    setTimeout(() => {
      setIsLoadingBooking(false)
      onNext()
    }, 500)
  }

  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() - 7)
    setCurrentWeekStart(newWeekStart)
    setSelectedSlots(new Set())
  }

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() + 7)
    setCurrentWeekStart(newWeekStart)
    setSelectedSlots(new Set())
  }

  const weekRangeText = useMemo(() => {
    const endDate = new Date(currentWeekStart)
    endDate.setDate(endDate.getDate() + 6)
    return `${currentWeekStart.getMonth() + 1}/${currentWeekStart.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}, ${currentWeekStart.getFullYear()}`
  }, [currentWeekStart])

  // 各コンパニオンの予定データ（曜日ベース）
  // 0=日曜日, 1=月曜日, 2=火曜日, 3=水曜日, 4=木曜日, 5=金曜日, 6=土曜日
  const companionSchedules = {
    "Rio": [
      { dayOfWeek: 1, startTime: "10:00", endTime: "13:00" }, // 月曜日 10:00-13:00 (3時間)
      { dayOfWeek: 3, startTime: "14:00", endTime: "17:00" }, // 水曜日 14:00-17:00 (3時間)
      { dayOfWeek: 5, startTime: "15:00", endTime: "18:00" }, // 金曜日 15:00-18:00 (3時間)
    ],
    "Ayaka": [
      { dayOfWeek: 2, startTime: "11:00", endTime: "14:00" }, // 火曜日 11:00-14:00 (3時間)
      { dayOfWeek: 4, startTime: "13:00", endTime: "16:00" }, // 木曜日 13:00-16:00 (3時間)
      { dayOfWeek: 6, startTime: "10:00", endTime: "13:00" }, // 土曜日 10:00-13:00 (3時間)
    ],
    "Nanaka": [
      { dayOfWeek: 1, startTime: "9:00", endTime: "12:00" }, // 月曜日 9:00-12:00 (3時間)
      { dayOfWeek: 3, startTime: "13:00", endTime: "17:00" }, // 水曜日 13:00-17:00 (4時間)
      { dayOfWeek: 5, startTime: "14:00", endTime: "18:00" }, // 金曜日 14:00-18:00 (4時間)
    ],
  }

  // 各ディレクターの予定データ（曜日ベース）
  const directorSchedules = {
    "Takeshi": [
      { dayOfWeek: 1, startTime: "9:00", endTime: "12:00" }, // 月曜日 9:00-12:00 (3時間)
      { dayOfWeek: 2, startTime: "14:00", endTime: "17:00" }, // 水曜日 14:00-17:00 (3時間)
      { dayOfWeek: 3, startTime: "10:00", endTime: "13:00" }, // 金曜日 10:00-13:00 (3時間)
    ],
    "Kenji": [
      { dayOfWeek: 4, startTime: "13:00", endTime: "16:00" }, // 木曜日 13:00-16:00 (3時間)
      { dayOfWeek: 6, startTime: "11:00", endTime: "14:00" }, // 土曜日 11:00-14:00 (3時間)
    ],
    "Hiroshi": [
      { dayOfWeek: 2, startTime: "13:00", endTime: "16:00" }, // 月曜日 13:00-16:00 (3時間)
      { dayOfWeek: 5, startTime: "14:00", endTime: "17:00" }, // 金曜日 14:00-17:00 (3時間)
    ],
  }

  // 各MCの予定データ（曜日ベース）
  const mcSchedules = {
    "Yuki": [
      { dayOfWeek: 1, startTime: "11:00", endTime: "14:00" }, // 月曜日 11:00-14:00 (3時間)
      { dayOfWeek: 3, startTime: "15:00", endTime: "18:00" }, // 水曜日 15:00-18:00 (3時間)
      { dayOfWeek: 5, startTime: "9:00", endTime: "12:00" }, // 金曜日 9:00-12:00 (3時間)
    ],
    "Saki": [
      { dayOfWeek: 2, startTime: "9:00", endTime: "12:00" }, // 火曜日 9:00-12:00 (3時間)
      { dayOfWeek: 4, startTime: "14:00", endTime: "17:00" }, // 木曜日 14:00-17:00 (3時間)
      { dayOfWeek: 6, startTime: "10:00", endTime: "13:00" }, // 土曜日 10:00-13:00 (3時間)
    ],
    "Mai": [
      { dayOfWeek: 1, startTime: "14:00", endTime: "17:00" }, // 月曜日 14:00-17:00 (3時間)
      { dayOfWeek: 3, startTime: "10:00", endTime: "13:00" }, // 水曜日 10:00-13:00 (3時間)
      { dayOfWeek: 5, startTime: "13:00", endTime: "16:00" }, // 金曜日 13:00-16:00 (3時間)
    ],
  }

  // 開催日時と予定の重複チェック
  const checkCompanionAvailability = (companionName: string): "available" | "busy" => {
    if (!eventDate || !startTime || !endTime) {
      // 開催日時が入力されていない場合は、デフォルトのステータスを返す
      const defaultStatus: { [key: string]: "available" | "busy" } = {
        "田中 太郎": "available",
        "佐藤 花子": "available",
        "鈴木 一郎": "busy",
      }
      return defaultStatus[companionName] || "available"
    }

    const schedules = companionSchedules[companionName as keyof typeof companionSchedules] || []
    const eventDateObj = new Date(eventDate)
    const eventDayOfWeek = eventDateObj.getDay() // 0=日曜日, 1=月曜日, ...
    const [eventStartHour, eventStartMinute] = startTime.split(":").map(Number)
    const [eventEndHour, eventEndMinute] = endTime.split(":").map(Number)
    const eventStartMinutes = eventStartHour * 60 + eventStartMinute
    const eventEndMinutes = eventEndHour * 60 + eventEndMinute

    // 同じ曜日の予定をチェック
    for (const schedule of schedules) {
      if (schedule.dayOfWeek === eventDayOfWeek) {
        const [scheduleStartHour, scheduleStartMinute] = schedule.startTime.split(":").map(Number)
        const [scheduleEndHour, scheduleEndMinute] = schedule.endTime.split(":").map(Number)
        const scheduleStartMinutes = scheduleStartHour * 60 + scheduleStartMinute
        const scheduleEndMinutes = scheduleEndHour * 60 + scheduleEndMinute

        // 時間が重複しているかチェック
        if (
          (eventStartMinutes >= scheduleStartMinutes && eventStartMinutes < scheduleEndMinutes) ||
          (eventEndMinutes > scheduleStartMinutes && eventEndMinutes <= scheduleEndMinutes) ||
          (eventStartMinutes <= scheduleStartMinutes && eventEndMinutes >= scheduleEndMinutes)
        ) {
          return "busy"
        }
      }
    }

    return "available"
  }

  const talents = useMemo(() => [
    { name: "Rio", status: checkCompanionAvailability("Rio") },
    { name: "Ayaka", status: checkCompanionAvailability("Ayaka") },
    { name: "Nanaka", status: checkCompanionAvailability("Nanaka") },
  ], [eventDate, startTime, endTime])

  const externalCompanions = [
    "山田 花子",
    "佐藤 美咲",
    "鈴木 さくら",
    "高橋 みゆき",
    "伊藤 あかり",
  ]

  // ディレクターの空き状況チェック関数
  const checkDirectorAvailability = (directorName: string): "available" | "busy" => {
    if (!eventDate || !startTime || !endTime) {
      return "available"
    }

    const schedules = directorSchedules[directorName as keyof typeof directorSchedules] || []
    const eventDateObj = new Date(eventDate)
    const eventDayOfWeek = eventDateObj.getDay()
    const [eventStartHour, eventStartMinute] = startTime.split(":").map(Number)
    const [eventEndHour, eventEndMinute] = endTime.split(":").map(Number)
    const eventStartMinutes = eventStartHour * 60 + eventStartMinute
    const eventEndMinutes = eventEndHour * 60 + eventEndMinute

    for (const schedule of schedules) {
      if (schedule.dayOfWeek === eventDayOfWeek) {
        const [scheduleStartHour, scheduleStartMinute] = schedule.startTime.split(":").map(Number)
        const [scheduleEndHour, scheduleEndMinute] = schedule.endTime.split(":").map(Number)
        const scheduleStartMinutes = scheduleStartHour * 60 + scheduleStartMinute
        const scheduleEndMinutes = scheduleEndHour * 60 + scheduleEndMinute

        if (
          (eventStartMinutes >= scheduleStartMinutes && eventStartMinutes < scheduleEndMinutes) ||
          (eventEndMinutes > scheduleStartMinutes && eventEndMinutes <= scheduleEndMinutes) ||
          (eventStartMinutes <= scheduleStartMinutes && eventEndMinutes >= scheduleEndMinutes)
        ) {
          return "busy"
        }
      }
    }

    return "available"
  }

  // MCの空き状況チェック関数
  const checkMcAvailability = (mcName: string): "available" | "busy" => {
    if (!eventDate || !startTime || !endTime) {
      return "available"
    }

    const schedules = mcSchedules[mcName as keyof typeof mcSchedules] || []
    const eventDateObj = new Date(eventDate)
    const eventDayOfWeek = eventDateObj.getDay()
    const [eventStartHour, eventStartMinute] = startTime.split(":").map(Number)
    const [eventEndHour, eventEndMinute] = endTime.split(":").map(Number)
    const eventStartMinutes = eventStartHour * 60 + eventStartMinute
    const eventEndMinutes = eventEndHour * 60 + eventEndMinute

    for (const schedule of schedules) {
      if (schedule.dayOfWeek === eventDayOfWeek) {
        const [scheduleStartHour, scheduleStartMinute] = schedule.startTime.split(":").map(Number)
        const [scheduleEndHour, scheduleEndMinute] = schedule.endTime.split(":").map(Number)
        const scheduleStartMinutes = scheduleStartHour * 60 + scheduleStartMinute
        const scheduleEndMinutes = scheduleEndHour * 60 + scheduleEndMinute

        if (
          (eventStartMinutes >= scheduleStartMinutes && eventStartMinutes < scheduleEndMinutes) ||
          (eventEndMinutes > scheduleStartMinutes && eventEndMinutes <= scheduleEndMinutes) ||
          (eventStartMinutes <= scheduleStartMinutes && eventEndMinutes >= scheduleEndMinutes)
        ) {
          return "busy"
        }
      }
    }

    return "available"
  }

  const directors = useMemo(() => [
    { name: "Takeshi", status: checkDirectorAvailability("Takeshi") },
    { name: "Kenji", status: checkDirectorAvailability("Kenji") },
    { name: "Hiroshi", status: checkDirectorAvailability("Hiroshi") },
  ], [eventDate, startTime, endTime])

  const externalDirectors = [
    "田中 ディレクター",
    "佐藤 ディレクター",
    "鈴木 ディレクター",
    "高橋 ディレクター",
    "伊藤 ディレクター",
  ]

  const mcs = useMemo(() => [
    { name: "Yuki", status: checkMcAvailability("Yuki") },
    { name: "Saki", status: checkMcAvailability("Saki") },
    { name: "Mai", status: checkMcAvailability("Mai") },
  ], [eventDate, startTime, endTime])

  const externalMcs = [
    "山田 MC",
    "中村 MC",
    "小林 MC",
    "加藤 MC",
    "松本 MC",
  ]

  const workingHoursOptions = [
    { label: "2時間", value: "2" },
    { label: "4時間", value: "4" },
    { label: "6時間", value: "6" },
    { label: "8時間", value: "8" },
    { label: "全日", value: "full" },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {isLoadingBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-700">仮押さえ依頼を送信中...</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-slate-900">{isEditMode ? "案件編集" : "新規案件作成"}</h1>
      </div>

      {/* Step 1: Basic Info */}
      <Card>
      <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">基本情報</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="acquirerName">ホール担当営業</Label>
              <Input
                id="acquirerName"
                value={acquirerName}
                onChange={(e) => {
                  setAcquirerName(e.target.value)
                  if (errors.acquirerName) {
                    setErrors({ ...errors, acquirerName: "" })
                  }
                }}
                placeholder="例: 山田 太郎"
                className={errors.acquirerName ? "border-red-500" : ""}
              />
              {errors.acquirerName && (
                <p className="text-sm text-red-600">{errors.acquirerName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestDate">依頼日</Label>
              <Input
                id="requestDate"
                type="date"
                value={requestDate}
                onChange={(e) => {
                  setRequestDate(e.target.value)
                  if (errors.requestDate) {
                    setErrors({ ...errors, requestDate: "" })
                  }
                }}
                className={errors.requestDate ? "border-red-500" : ""}
              />
              {errors.requestDate && (
                <p className="text-sm text-red-600">{errors.requestDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hallName">ホール名</Label>
              <Input
                id="hallName"
                value={hallName}
                onChange={(e) => {
                  setHallName(e.target.value)
                  if (errors.hallName) {
                    setErrors({ ...errors, hallName: "" })
                  }
                }}
                placeholder="例: マルハン渋谷店"
                className={errors.hallName ? "border-red-500" : ""}
              />
              {errors.hallName && (
                <p className="text-sm text-red-600">{errors.hallName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value)
                  if (errors.status) {
                    setErrors({ ...errors, status: "" })
                  }
                }}
              >
                <SelectTrigger id="status" className={errors.status ? "border-red-500" : ""}>
                  <SelectValue placeholder="ステータスを選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="営業確認待ち">営業確認待ち</SelectItem>
                  <SelectItem value="営業依頼中">営業依頼中</SelectItem>
                  <SelectItem value="手配中">手配中</SelectItem>
                  <SelectItem value="手配完了">手配完了</SelectItem>
                  <SelectItem value="キャンセル">キャンセル</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 商材情報 */}
      {productInfos.map((productInfo, index) => {
        const productNumber = index + 1
        const productDuration = calculateDurationForProduct(productInfo.startTime, productInfo.endTime)
        
        return (
          <Card key={productInfo.id}>
            <Collapsible 
              open={productInfo.isOpen} 
              onOpenChange={(open) => updateProductInfo(index, { isOpen: open })}
            >
              <CardHeader>
                <CollapsibleTrigger className="w-full cursor-pointer">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">商材情報{productNumber === 1 ? "①" : productNumber === 2 ? "②" : productNumber === 3 ? "③" : productNumber === 4 ? "④" : "⑤"}</h3>
                    <div className="flex items-center gap-2">
                      {productInfos.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeProductInfo(productInfo.id)
                          }}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <ChevronDown
                        className={`h-5 w-5 text-slate-600 transition-transform duration-200 ${
                          productInfo.isOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">基本情報</h3>
              <div className="border-b border-slate-300 w-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor={`category-${productInfo.id}`}>カテゴリ</Label>
              <Select
                value={productInfo.category}
                onValueChange={(value) => {
                  updateProductInfo(index, { category: value })
                  if (errors.category && index === 0) {
                    setErrors({ ...errors, category: "" })
                  }
                }}
                disabled
              >
                <SelectTrigger id={`category-${productInfo.id}`} className={errors.category && index === 0 ? "border-red-500" : ""}>
                  <SelectValue placeholder="カテゴリを選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="基本契約">基本契約</SelectItem>
                  <SelectItem value="イベント">イベント</SelectItem>
                  <SelectItem value="オプション">オプション</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && index === 0 && (
                <p className="text-sm text-red-600">{errors.category}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`eventType-${productInfo.id}`}>イベント区分</Label>
              <Select
                value={productInfo.eventType}
                onValueChange={(value) => {
                  updateProductInfo(index, { eventType: value })
                  if (errors.eventType && index === 0) {
                    setErrors({ ...errors, eventType: "" })
                  }
                }}
                disabled
              >
                <SelectTrigger id={`eventType-${productInfo.id}`} className={errors.eventType && index === 0 ? "border-red-500" : ""}>
                  <SelectValue placeholder="イベント種別を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="トリニティガール">トリニティガール</SelectItem>
                  <SelectItem value="スロセレ">スロセレ</SelectItem>
                </SelectContent>
              </Select>
              {errors.eventType && index === 0 && (
                <p className="text-sm text-red-600">{errors.eventType}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`eventProductName-${productInfo.id}`}>イベント商材名</Label>
              <Input
                id={`eventProductName-${productInfo.id}`}
                value={productInfo.eventProductName}
                onChange={(e) => {
                  updateProductInfo(index, { eventProductName: e.target.value })
                  const errorKey = `eventProductName-${index}`
                  if (errors[errorKey]) {
                    const newErrors = { ...errors }
                    delete newErrors[errorKey]
                    setErrors(newErrors)
                  }
                }}
                placeholder="例: 新台入替イベント"
                className={errors[`eventProductName-${index}`] ? "border-red-500" : ""}
              />
              {errors[`eventProductName-${index}`] && (
                <p className="text-sm text-red-600">{errors[`eventProductName-${index}`]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`eventDate-${productInfo.id}`}>開催日</Label>
              <Input
                id={`eventDate-${productInfo.id}`}
                type="date"
                value={productInfo.eventDate}
                onChange={(e) => {
                  updateProductInfo(index, { eventDate: e.target.value })
                  const errorKey = `eventDate-${index}`
                  if (errors[errorKey]) {
                    const newErrors = { ...errors }
                    delete newErrors[errorKey]
                    setErrors(newErrors)
                  }
                }}
                className={errors[`eventDate-${index}`] ? "border-red-500" : ""}
              />
              {errors[`eventDate-${index}`] && (
                <p className="text-sm text-red-600">{errors[`eventDate-${index}`]}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`startTime-${productInfo.id}`}>開始時間</Label>
                <Input
                  id={`startTime-${productInfo.id}`}
                  type="time"
                  value={productInfo.startTime}
                  onChange={(e) => {
                    updateProductInfo(index, { startTime: e.target.value })
                    if (errors.startTime && index === 0) {
                      setErrors({ ...errors, startTime: "" })
                    }
                  }}
                  className={errors.startTime && index === 0 ? "border-red-500" : ""}
                />
                {errors.startTime && index === 0 && (
                  <p className="text-sm text-red-600">{errors.startTime}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`endTime-${productInfo.id}`}>終了時間</Label>
                <Input
                  id={`endTime-${productInfo.id}`}
                  type="time"
                  value={productInfo.endTime}
                  onChange={(e) => {
                    updateProductInfo(index, { endTime: e.target.value })
                    if (errors.endTime && index === 0) {
                      setErrors({ ...errors, endTime: "" })
                    }
                  }}
                  className={errors.endTime && index === 0 ? "border-red-500" : ""}
                />
                {errors.endTime && index === 0 && (
                  <p className="text-sm text-red-600">{errors.endTime}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`duration-${productInfo.id}`}>開催時間数</Label>
              <Input
                id={`duration-${productInfo.id}`}
                value={productDuration}
                disabled
                className="bg-slate-50"
              />
            </div>
          </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">キャスティング情報</h3>
              <div className="border-b border-slate-300 w-full"></div>
            </div>
            <div className="space-y-4 pt-2">
              {/* コンパニオン */}
              <div className="space-y-4 bg-rose-50/50 border border-rose-200/50 rounded-lg p-4">
                <Label className="text-base font-semibold">コンパニオン</Label>
                
                {/* 専属コンパニオン */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">専属</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {talents.map((talent) => {
                      const isSelected = selectedCompanions.has(talent.name)
                      return (
                        <div
                          key={talent.name}
                          className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : talent.status === "busy"
                              ? "border-slate-200 opacity-60 cursor-not-allowed"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => {
                            if (talent.status === "busy") return // 埋まっている場合は選択不可
                            const newSelected = new Set(selectedCompanions)
                            if (isSelected) {
                              newSelected.delete(talent.name)
                            } else {
                              newSelected.add(talent.name)
                            }
                            setSelectedCompanions(newSelected)
                          }}
                        >
                          <div className="w-full text-left">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-slate-900">{talent.name}</div>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <Badge variant={talent.status === "available" ? "default" : "destructive"} className="mt-2">
                              {talent.status === "available" ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  空き（手配可）
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  埋まり（NG）
                                </>
                              )}
                            </Badge>
                            <div className="mt-2 text-sm text-slate-900">
                              <span className="text-slate-600">予想金額: </span>
                              <span className="font-semibold">¥{((companionHourlyRates[talent.name] || 0) * getDurationInHours()).toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenCalendarModal(talent.name, talent.status, "companion")
                            }}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Calendar className="h-3 w-3" />
                            カレンダーで詳細を確認
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 外部コンパニオン */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">外部</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {externalCompanions.map((companion) => {
                      const isSelected = selectedCompanions.has(companion)
                      return (
                        <div
                          key={companion}
                          className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => {
                            const newSelected = new Set(selectedCompanions)
                            if (isSelected) {
                              newSelected.delete(companion)
                            } else {
                              newSelected.add(companion)
                            }
                            setSelectedCompanions(newSelected)
                          }}
                        >
                          <div className="w-full text-left">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-slate-900">{companion}</div>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <Badge variant="outline" className="mt-2">
                              外部
                            </Badge>
                            <div className="mt-2 text-sm text-slate-900">
                              <span className="text-slate-600">予想金額: </span>
                              <span className="font-semibold">¥{((companionHourlyRates[companion] || 0) * getDurationInHours()).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* ディレクター */}
              <div className="space-y-4 bg-sky-50/50 border border-sky-200/50 rounded-lg p-4">
                <Label className="text-base font-semibold">ディレクター</Label>
                
                {/* 専属ディレクター */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">専属</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {directors.map((director) => {
                      const isSelected = selectedDirectors.has(director.name)
                      return (
                        <div
                          key={director.name}
                          className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : director.status === "busy"
                              ? "border-slate-200 opacity-60 cursor-not-allowed"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => {
                            if (director.status === "busy") return // 埋まっている場合は選択不可
                            const newSelected = new Set(selectedDirectors)
                            if (isSelected) {
                              newSelected.delete(director.name)
                            } else {
                              newSelected.add(director.name)
                            }
                            setSelectedDirectors(newSelected)
                          }}
                        >
                          <div className="w-full text-left">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-slate-900">{director.name}</div>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <Badge variant={director.status === "available" ? "default" : "destructive"} className="mt-2">
                              {director.status === "available" ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  空き（手配可）
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  埋まり（NG）
                                </>
                              )}
                            </Badge>
                            <div className="mt-2 text-sm text-slate-900">
                              <span className="text-slate-600">予想金額: </span>
                              <span className="font-semibold">¥{((directorHourlyRates[director.name] || 0) * getDurationInHours()).toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenCalendarModal(director.name, director.status, "director")
                            }}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Calendar className="h-3 w-3" />
                            カレンダーで詳細を確認
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 外部ディレクター */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">外部</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {externalDirectors.map((director) => {
                      const isSelected = selectedDirectors.has(director)
                      return (
                        <div
                          key={director}
                          className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => {
                            const newSelected = new Set(selectedDirectors)
                            if (isSelected) {
                              newSelected.delete(director)
                            } else {
                              newSelected.add(director)
                            }
                            setSelectedDirectors(newSelected)
                          }}
                        >
                          <div className="w-full text-left">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-slate-900">{director}</div>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <Badge variant="outline" className="mt-2">
                              外部
                            </Badge>
                            <div className="mt-2 text-sm text-slate-900">
                              <span className="text-slate-600">予想金額: </span>
                              <span className="font-semibold">¥{((directorHourlyRates[director] || 0) * getDurationInHours()).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* MC */}
              <div className="space-y-4 bg-emerald-50/50 border border-emerald-200/50 rounded-lg p-4">
                <Label className="text-base font-semibold">MC</Label>
                
                {/* 専属MC */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">専属</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {mcs.map((mc) => {
                      const isSelected = selectedMcs.has(mc.name)
                      return (
                        <div
                          key={mc.name}
                          className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : mc.status === "busy"
                              ? "border-slate-200 opacity-60 cursor-not-allowed"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => {
                            if (mc.status === "busy") return // 埋まっている場合は選択不可
                            const newSelected = new Set(selectedMcs)
                            if (isSelected) {
                              newSelected.delete(mc.name)
                            } else {
                              newSelected.add(mc.name)
                            }
                            setSelectedMcs(newSelected)
                          }}
                        >
                          <div className="w-full text-left">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-slate-900">{mc.name}</div>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <Badge variant={mc.status === "available" ? "default" : "destructive"} className="mt-2">
                              {mc.status === "available" ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  空き（手配可）
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  埋まり（NG）
                                </>
                              )}
                            </Badge>
                            <div className="mt-2 text-sm text-slate-900">
                              <span className="text-slate-600">予想金額: </span>
                              <span className="font-semibold">¥{((mcHourlyRates[mc.name] || 0) * getDurationInHours()).toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenCalendarModal(mc.name, mc.status, "mc")
                            }}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Calendar className="h-3 w-3" />
                            カレンダーで詳細を確認
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 外部MC */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">外部</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {externalMcs.map((mc) => {
                      const isSelected = selectedMcs.has(mc)
                      return (
                        <div
                          key={mc}
                          className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => {
                            const newSelected = new Set(selectedMcs)
                            if (isSelected) {
                              newSelected.delete(mc)
                            } else {
                              newSelected.add(mc)
                            }
                            setSelectedMcs(newSelected)
                          }}
                        >
                          <div className="w-full text-left">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-slate-900">{mc}</div>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <Badge variant="outline" className="mt-2">
                              外部
                            </Badge>
                            <div className="mt-2 text-sm text-slate-900">
                              <span className="text-slate-600">予想金額: </span>
                              <span className="font-semibold">¥{((mcHourlyRates[mc] || 0) * getDurationInHours()).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 請求予定金額 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">請求予定金額</h3>
              <div className="border-b border-slate-300 w-full"></div>
            </div>
            <div className="space-y-4 pt-2">
              {/* 出演料 */}
              <div className="bg-slate-50/50 border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-slate-900">出演料</Label>
                  <div className="text-xl font-bold text-slate-900">
                    ¥{totalCost.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 一人当たりの交通費 */}
              <div className="bg-slate-50/50 border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label htmlFor={`transportationFeePerPerson-${productInfo.id}`} className="text-base font-semibold text-slate-900">
                      一人当たりの交通費
                    </Label>
                    <Input
                      id={`transportationFeePerPerson-${productInfo.id}`}
                      type="number"
                      value={transportationFeePerPerson}
                      onChange={(e) => setTransportationFeePerPerson(e.target.value)}
                      placeholder="0"
                      className="mt-2"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600 mb-1">合計</div>
                    <div className="text-xl font-bold text-slate-900">
                      ¥{totalTransportationFee.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      （{totalCastCount}名 × ¥{Number(transportationFeePerPerson) || 0}）
                    </div>
                  </div>
                </div>
              </div>

              {/* 一人当たりの宿泊費 */}
              <div className="bg-slate-50/50 border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label htmlFor={`accommodationFeePerPerson-${productInfo.id}`} className="text-base font-semibold text-slate-900">
                      一人当たりの宿泊費
                    </Label>
                    <Input
                      id={`accommodationFeePerPerson-${productInfo.id}`}
                      type="number"
                      value={accommodationFeePerPerson}
                      onChange={(e) => setAccommodationFeePerPerson(e.target.value)}
                      placeholder="0"
                      className="mt-2"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600 mb-1">合計</div>
                    <div className="text-xl font-bold text-slate-900">
                      ¥{totalAccommodationFee.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      （{totalCastCount}名 × ¥{Number(accommodationFeePerPerson) || 0}）
                    </div>
                  </div>
                </div>
              </div>

              {/* イベント基本料金 */}
              <div className="bg-slate-50/50 border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`eventBaseFee-${productInfo.id}`} className="text-base font-semibold text-slate-900">
                    イベント基本料金
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`eventBaseFee-${productInfo.id}`}
                      type="number"
                      value={eventBaseFee}
                      onChange={(e) => setEventBaseFee(e.target.value)}
                      placeholder="0"
                      className="w-32 text-right"
                    />
                    <span className="text-slate-600">円</span>
                  </div>
                </div>
              </div>

              {/* 請求予定金額の合計 */}
              <div className="bg-blue-50/50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold text-slate-900">請求予定金額（合計）</Label>
                  <div className="text-2xl font-bold text-slate-900">
                    ¥{totalBillingAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )
      })}

      {/* 商材を追加ボタンと案件を作成ボタン */}
      <div className="flex justify-center gap-4 mt-4">
        {productInfos.length < 5 && (
          <Button
            onClick={addProductInfo}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            商材を追加
          </Button>
        )}
        <Button
          onClick={handleCreateProjects}
          className="flex items-center gap-2"
        >
          {isEditMode ? "案件を更新" : "案件を作成"}
        </Button>
      </div>

      {/* Step 2: Resource Check */}
      {showResourceSection && (
        <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle>Step 2: リソース・タレント手配（AI連携）</CardTitle>
          </div>
          <CardDescription>AIがタレントのスケジュールをリアルタイムで確認します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>タレント選択</Label>
            <div className="grid grid-cols-3 gap-3">
              {talents.map((talent) => (
                <button
                  key={talent.name}
                  onClick={() => handleTalentSelect(talent.name, talent.status)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    projectData.talent === talent.name
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-medium text-slate-900">{talent.name}</div>
                  <Badge variant={talent.status === "available" ? "default" : "destructive"} className="mt-2">
                    {talent.status === "available" ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        空き（手配可）
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        埋まり（NG）
                      </>
                    )}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {projectData.talent && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-sm">Googleカレンダー連携 - {projectData.talent}のスケジュール</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[160px] text-center">{weekRangeText}</span>
                  <Button variant="outline" size="sm" onClick={goToNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                時間帯をクリックして仮押さえする時間を選択してください（複数選択可）
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Header row with days */}
                  <div className="grid grid-cols-8 border-b border-slate-200">
                    <div className="p-2 text-xs font-medium text-slate-500"></div>
                    {weekData.weekDays.map((day, idx) => (
                      <div key={idx} className="p-2 text-center border-l border-slate-200">
                        <div className="text-xs font-medium text-slate-600">{day.dayOfWeek}</div>
                        <div className="text-sm font-semibold text-slate-900">
                          {day.month}/{day.dayNum}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Time slots */}
                  {weekData.timeSlots.map((time, timeIdx) => (
                    <div key={time} className="grid grid-cols-8 border-b border-slate-200">
                      <div className="p-2 text-xs font-medium text-slate-500 flex items-start justify-end pr-3">
                        {time}
                      </div>
                      {weekData.weekDays.map((day, dayIdx) => {
                        const isBusy = getBusySlots(dayIdx, timeIdx, projectData.talent, weekData.weekDays)
                        const isEventDay =
                          projectData.date && new Date(projectData.date).toDateString() === day.date.toDateString()
                        const slotId = getSlotId(dayIdx, timeIdx)
                        const isSelected = selectedSlots.has(slotId)

                        // 開催日時をチェック（eventDate, startTime, endTimeを使用）
                        let isEventTime = false
                        if (eventDate && startTime && endTime) {
                          const eventDateObj = new Date(eventDate)
                          const dayDateStr = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`
                          const eventDateStr = `${eventDateObj.getFullYear()}-${String(eventDateObj.getMonth() + 1).padStart(2, "0")}-${String(eventDateObj.getDate()).padStart(2, "0")}`
                          
                          if (dayDateStr === eventDateStr) {
                            const [eventStartHour] = startTime.split(":").map(Number)
                            const [eventEndHour] = endTime.split(":").map(Number)
                            const currentHour = 9 + timeIdx
                            if (currentHour >= eventStartHour && currentHour < eventEndHour) {
                              isEventTime = true
                            }
                          }
                        }

                        return (
                          <button
                            key={dayIdx}
                            onClick={() => handleSlotClick(dayIdx, timeIdx, isBusy)}
                            disabled={isBusy}
                            className={`p-2 border-l border-slate-200 min-h-[40px] transition-colors ${
                              isBusy && isEventTime
                                ? "bg-black cursor-not-allowed"
                                : isBusy
                                ? "bg-red-100 border-red-200 cursor-not-allowed"
                                : isSelected
                                  ? "bg-blue-500 border-blue-600 hover:bg-blue-600"
                                  : isEventTime
                                    ? "bg-green-200 border-green-300 hover:bg-green-300 cursor-pointer"
                                    : "bg-white hover:bg-blue-50 cursor-pointer"
                            }`}
                          >
                            {isBusy && !isEventTime && <div className="text-xs text-red-700 font-medium">予定あり</div>}
                            {isEventTime && !isBusy && <div className="text-xs text-green-800 font-medium">開催時間</div>}
                            {isBusy && isEventTime && <div className="text-xs text-white font-medium">重複</div>}
                            {isSelected && <div className="text-xs text-white font-medium">選択中</div>}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={projectData.talentStatus === "available" ? "default" : "destructive"}>
                    リアルタイムステータス: {projectData.talentStatus === "available" ? "空き" : "埋まり"}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                      <span>予定あり</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
                      <span>開催時間</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-black border border-slate-200 rounded"></div>
                      <span>重複</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 border border-blue-600 rounded"></div>
                      <span>選択中</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-white border border-slate-200 rounded"></div>
                      <span>空き</span>
                    </div>
                  </div>
                  {selectedSlots.size > 0 && (
                    <Badge variant="outline" className="bg-blue-50">
                      {selectedSlots.size}時間選択中
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}


          {projectData.talent && projectData.talentStatus === "available" && (
            <div className="mt-6 pt-4 border-t border-purple-200">
              <Button onClick={handleProvisionalBooking} className="w-full gap-2" size="lg">
                <Sparkles className="h-4 w-4" />
                仮押さえ依頼を送信
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Calendar Modal */}
      <Dialog open={calendarModalOpen} onOpenChange={setCalendarModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>Googleカレンダー連携 - {modalPersonName}のスケジュール</DialogTitle>
            <DialogDescription>予定ありの状況を確認できます</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm">Googleカレンダー連携 - {modalPersonName}のスケジュール</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleModalGoToPreviousWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[160px] text-center">{modalWeekRangeText}</span>
                <Button variant="outline" size="sm" onClick={handleModalGoToNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="w-full overflow-x-hidden">
              <div className="w-full">
                {/* Header row with days */}
                <div className="grid grid-cols-8 border-b border-slate-200">
                  <div className="p-2 text-xs font-medium text-slate-500"></div>
                  {modalWeekData.weekDays.map((day, idx) => (
                    <div key={idx} className="p-2 text-center border-l border-slate-200">
                      <div className="text-xs font-medium text-slate-600">{day.dayOfWeek}</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {day.month}/{day.dayNum}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time slots */}
                {modalWeekData.timeSlots.map((time, timeIdx) => (
                  <div key={time} className="grid grid-cols-8 border-b border-slate-200">
                    <div className="p-2 text-xs font-medium text-slate-500 flex items-start justify-end pr-3">
                      {time}
                    </div>
                    {modalWeekData.weekDays.map((day, dayIdx) => {
                      const isBusy = getBusySlots(dayIdx, timeIdx, modalPersonName, modalWeekData.weekDays)
                      
                      // 開催日時をチェック
                      let isEventTime = false
                      if (eventDate && startTime && endTime) {
                        const eventDateObj = new Date(eventDate)
                        const dayDateStr = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`
                        const eventDateStr = `${eventDateObj.getFullYear()}-${String(eventDateObj.getMonth() + 1).padStart(2, "0")}-${String(eventDateObj.getDate()).padStart(2, "0")}`
                        
                        if (dayDateStr === eventDateStr) {
                          const [eventStartHour] = startTime.split(":").map(Number)
                          const [eventEndHour] = endTime.split(":").map(Number)
                          const currentHour = 9 + timeIdx
                          if (currentHour >= eventStartHour && currentHour < eventEndHour) {
                            isEventTime = true
                          }
                        }
                      }

                      return (
                        <div
                          key={dayIdx}
                          className={`p-2 border-l border-slate-200 min-h-[40px] ${
                            isBusy && isEventTime
                              ? "bg-black"
                              : isBusy
                              ? "bg-red-100 border-red-200"
                              : isEventTime
                              ? "bg-green-200 border-green-300"
                              : "bg-white"
                          }`}
                        >
                          {isBusy && !isEventTime && <div className="text-xs text-red-700 font-medium">予定あり</div>}
                          {isEventTime && !isBusy && <div className="text-xs text-green-800 font-medium">開催時間</div>}
                          {isBusy && isEventTime && <div className="text-xs text-white font-medium">重複</div>}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Badge variant={modalPersonStatus === "available" ? "default" : "destructive"}>
                リアルタイムステータス: {modalPersonStatus === "available" ? "空き" : "埋まり"}
              </Badge>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                  <span>予定あり</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
                  <span>開催時間</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-black border border-slate-200 rounded"></div>
                  <span>重複</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-white border border-slate-200 rounded"></div>
                  <span>空き</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

