"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Sparkles, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"
import type { ProjectData } from "@/types/project"
import { useState, useMemo, useEffect, useRef, useCallback } from "react"
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
import { useAppRouter } from "@/hooks/use-app-router"
import { useProject } from "@/contexts/project-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { TimePicker } from "@/components/ui/time-picker"

type ProjectRegistrationProps = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onNext: () => void
  onBack: () => void
  addNotification: (message: string) => void
  projectId?: number | null
  isProductAddMode?: boolean
  isProductEditMode?: boolean
  correctionComment?: string
  onCorrectionCommentChange?: (comment: string) => void
  correctionRequest?: string
}

export function ProjectRegistration({
  projectData,
  setProjectData,
  onNext,
  onBack,
  addNotification,
  projectId,
  isProductAddMode = false,
  isProductEditMode = false,
  correctionComment,
  onCorrectionCommentChange,
  correctionRequest,
}: ProjectRegistrationProps) {
  const router = useAppRouter()
  const { createProjects, createProject, getProjectById, updateProject, getHalls, getHallByName, searchHalls, getProjects, generateProjectNumber, getCompanies, getCompanyById, getCompanyByCompanyId, searchCompanies, getHallsByCompanyId } = useProject()
  const isEditMode = projectId !== undefined && projectId !== null
  const isProductMode = isProductAddMode || isProductEditMode
  const [hallSearchOpen, setHallSearchOpen] = useState(false)
  const [hallSearchQuery, setHallSearchQuery] = useState("")
  const [companySearchOpen, setCompanySearchOpen] = useState(false)
  const [companySearchQuery, setCompanySearchQuery] = useState("")
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)
  const [companyId, setCompanyId] = useState("")
  const [companyName, setCompanyName] = useState("")
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
  const [hallId, setHallId] = useState("")
  
  // 商材情報の型定義
  type ProductInfo = {
    id: number
    category: string
    eventType: string
    eventProductName: string
    eventDate: string
    mustSeeFlag: string // 必見フラグ (0か1)
    mustSeePublication: string // 必見掲載 (要か不要)
    publicationDate: string // 掲載日
    publicationTime: string // 掲載時刻
    reportRequired: string // レポート要否 (要か不要)
    startTime: string
    endTime: string
    status: string
    companionCount: string
    directorCount: string
    mcCount: string
    selectedCompanions: Set<string>
    selectedDirectors: Set<string>
    selectedMcs: Set<string>
    transportationFeePerPerson: string
    accommodationFeePerPerson: string
    performanceFeeDiscount: string
    eventBaseFee: string
    eventBaseFeeDiscount: string
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
      mustSeeFlag: "0",
      mustSeePublication: "不要",
      publicationDate: "",
      publicationTime: "",
      reportRequired: "不要",
      startTime: "08:00",
      endTime: "15:00",
      status: "仮押さえ済み",
      companionCount: "",
      directorCount: "",
      mcCount: "",
      selectedCompanions: new Set(["未定"]),
      selectedDirectors: new Set(["未定"]),
      selectedMcs: new Set(["未定"]),
      transportationFeePerPerson: "",
      accommodationFeePerPerson: "",
      performanceFeeDiscount: "",
      eventBaseFee: "",
      eventBaseFeeDiscount: "",
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
  const updateProductInfo = useCallback((index: number, updates: Partial<ProductInfo>) => {
    setProductInfos((prev) => {
      const newInfos = [...prev]
      newInfos[index] = { ...newInfos[index], ...updates }
      return newInfos
    })
  }, [])

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

  // 時間数を時間に変換する関数（各商材情報用）
  const getDurationInHoursForProduct = (start: string, end: string): number => {
    if (!start || !end) {
      return 0
    }

    const [startHour, startMinute] = start.split(":").map(Number)
    const [endHour, endMinute] = end.split(":").map(Number)

    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute

    if (endTotalMinutes < startTotalMinutes) {
      return 0
    }

    const diffMinutes = endTotalMinutes - startTotalMinutes
    return diffMinutes / 60 // 時間に変換
  }

  // 選択状態の更新関数（各商材情報ごとに管理）
  const updateSelectedCompanions = (index: number, name: string) => {
    const productInfo = productInfos[index]
    const newSelected = new Set(productInfo.selectedCompanions)
    const maxCount = Number(productInfo.companionCount) || 0
    
    if (name === "未定") {
      // 「未定」を選択する場合、他の選択肢をすべて解除
      newSelected.clear()
      newSelected.add("未定")
    } else {
      // 他の選択肢を選択する場合、「未定」を解除してから追加
      newSelected.delete("未定")
      if (newSelected.has(name)) {
        newSelected.delete(name)
        // すべて解除された場合は「未定」を選択
        if (newSelected.size === 0) {
          newSelected.add("未定")
        }
      } else {
        // 人数制限をチェック（未定以外の選択数がmaxCountを超えないように）
        const selectedWithoutUndecided = Array.from(newSelected).filter(n => n !== "未定")
        if (maxCount > 0 && selectedWithoutUndecided.length >= maxCount) {
          // 既に最大数に達している場合は追加しない
          return
        }
        newSelected.add(name)
      }
    }
    updateProductInfo(index, { selectedCompanions: newSelected })
  }

  const updateSelectedDirectors = (index: number, name: string) => {
    const productInfo = productInfos[index]
    const newSelected = new Set(productInfo.selectedDirectors)
    const maxCount = Number(productInfo.directorCount) || 0
    
    if (name === "未定") {
      // 「未定」を選択する場合、他の選択肢をすべて解除
      newSelected.clear()
      newSelected.add("未定")
    } else {
      // 他の選択肢を選択する場合、「未定」を解除してから追加
      newSelected.delete("未定")
      if (newSelected.has(name)) {
        newSelected.delete(name)
        // すべて解除された場合は「未定」を選択
        if (newSelected.size === 0) {
          newSelected.add("未定")
        }
      } else {
        // 人数制限をチェック（未定以外の選択数がmaxCountを超えないように）
        const selectedWithoutUndecided = Array.from(newSelected).filter(n => n !== "未定")
        if (maxCount > 0 && selectedWithoutUndecided.length >= maxCount) {
          // 既に最大数に達している場合は追加しない
          return
        }
        newSelected.add(name)
      }
    }
    updateProductInfo(index, { selectedDirectors: newSelected })
  }

  const updateSelectedMcs = (index: number, name: string) => {
    const productInfo = productInfos[index]
    const newSelected = new Set(productInfo.selectedMcs)
    const maxCount = Number(productInfo.mcCount) || 0
    
    if (name === "未定") {
      // 「未定」を選択する場合、他の選択肢をすべて解除
      newSelected.clear()
      newSelected.add("未定")
    } else {
      // 他の選択肢を選択する場合、「未定」を解除してから追加
      newSelected.delete("未定")
      if (newSelected.has(name)) {
        newSelected.delete(name)
        // すべて解除された場合は「未定」を選択
        if (newSelected.size === 0) {
          newSelected.add("未定")
        }
      } else {
        // 人数制限をチェック（未定以外の選択数がmaxCountを超えないように）
        const selectedWithoutUndecided = Array.from(newSelected).filter(n => n !== "未定")
        if (maxCount > 0 && selectedWithoutUndecided.length >= maxCount) {
          // 既に最大数に達している場合は追加しない
          return
        }
        newSelected.add(name)
      }
    }
    updateProductInfo(index, { selectedMcs: newSelected })
  }
  // 既存のstateを商材情報①と互換性を保つために残す（後方互換性のため）
  const transportationFeePerPerson = productInfos[0]?.transportationFeePerPerson || ""
  const accommodationFeePerPerson = productInfos[0]?.accommodationFeePerPerson || ""
  const eventBaseFee = productInfos[0]?.eventBaseFee || ""
  const performanceFeeDiscount = productInfos[0]?.performanceFeeDiscount || ""
  const eventBaseFeeDiscount = productInfos[0]?.eventBaseFeeDiscount || ""
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
  
  // エラーフィールドへのref
  const errorRefs = useRef<{ [key: string]: HTMLElement | null }>({})

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

  // 平均時給を計算する関数
  const getAverageHourlyRate = (rates: { [key: string]: number }): number => {
    const values = Object.values(rates)
    if (values.length === 0) return 0
    return values.reduce((sum, rate) => sum + rate, 0) / values.length
  }

  const averageCompanionRate = getAverageHourlyRate(companionHourlyRates)
  const averageDirectorRate = getAverageHourlyRate(directorHourlyRates)
  const averageMcRate = getAverageHourlyRate(mcHourlyRates)

  // 専属キャストの定義
  const exclusiveCompanions = new Set(["Rio", "Ayaka", "Nanaka"])
  const exclusiveDirectors = new Set(["Takeshi", "Kenji", "Hiroshi"])
  const exclusiveMcs = new Set(["Yuki", "Saki", "Mai"])

  // ステータスを決定する関数
  const determineProjectStatus = (productInfo: ProductInfo): string => {
    // コンパニオンのチェック
    const companionCountStr = productInfo.companionCount?.toString().trim() || ""
    const companionCount = companionCountStr ? Number(companionCountStr) : 0
    const selectedCompanions = Array.from(productInfo.selectedCompanions).filter(n => n !== "未定")
    const hasUndecidedCompanion = productInfo.selectedCompanions.has("未定")
    
    // ディレクターのチェック
    const directorCountStr = productInfo.directorCount?.toString().trim() || ""
    const directorCount = directorCountStr ? Number(directorCountStr) : 0
    const selectedDirectors = Array.from(productInfo.selectedDirectors).filter(n => n !== "未定")
    const hasUndecidedDirector = productInfo.selectedDirectors.has("未定")
    
    // MCのチェック
    const mcCountStr = productInfo.mcCount?.toString().trim() || ""
    const mcCount = mcCountStr ? Number(mcCountStr) : 0
    const selectedMcs = Array.from(productInfo.selectedMcs).filter(n => n !== "未定")
    const hasUndecidedMc = productInfo.selectedMcs.has("未定")
    
    // キャスティングの合計人数を計算
    const totalCount = companionCount + directorCount + mcCount
    
    // 合計が0名の場合は見込み入力完了
    if (totalCount === 0) {
      return "見込み入力完了"
    }
    
    // 人数が入力されている場合のみチェック
    if (companionCount > 0) {
      // 人数が足りない、または「未定」が選択されている
      if (companionCount !== selectedCompanions.length || hasUndecidedCompanion) {
        return "仮押さえ依頼"
      }
      
      // 専属以外のキャストが選択されている
      const hasExternalCompanion = selectedCompanions.some(name => !exclusiveCompanions.has(name))
      if (hasExternalCompanion) {
        return "仮押さえ依頼"
      }
    } else if (selectedCompanions.length > 0 || hasUndecidedCompanion) {
      // 人数が入力されていないが、キャストが選択されている場合は仮押さえ依頼
      return "仮押さえ依頼"
    }
    
    if (directorCount > 0) {
      if (directorCount !== selectedDirectors.length || hasUndecidedDirector) {
        return "仮押さえ依頼"
      }
      
      const hasExternalDirector = selectedDirectors.some(name => !exclusiveDirectors.has(name))
      if (hasExternalDirector) {
        return "仮押さえ依頼"
      }
    } else if (selectedDirectors.length > 0 || hasUndecidedDirector) {
      // 人数が入力されていないが、キャストが選択されている場合は仮押さえ依頼
      return "仮押さえ依頼"
    }
    
    if (mcCount > 0) {
      if (mcCount !== selectedMcs.length || hasUndecidedMc) {
        return "仮押さえ依頼"
      }
      
      const hasExternalMc = selectedMcs.some(name => !exclusiveMcs.has(name))
      if (hasExternalMc) {
        return "仮押さえ依頼"
      }
    } else if (selectedMcs.length > 0 || hasUndecidedMc) {
      // 人数が入力されていないが、キャストが選択されている場合は仮押さえ依頼
      return "仮押さえ依頼"
    }
    
    // すべて専属のみで人数分選択されている場合
    return "仮押さえ済み"
  }

  // イベント区分に応じた基本料金を取得する関数
  const getEventBaseFee = (eventType: string): number => {
    switch (eventType) {
      case "トリニティガール":
        return 100000
      default:
        return 0
    }
  }

  // コスト計算は各商材情報ごとに行うため、ここでは削除

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    
    // 商材追加/編集モードでは基本情報のバリデーションをスキップ
    if (!isProductMode) {
      if (!companyName.trim()) {
        newErrors.companyName = "法人名を入力してください"
      }
      if (!acquirerName.trim()) {
        newErrors.acquirerName = "ホール担当営業を入力してください"
      }
      if (!requestDate) {
        newErrors.requestDate = "依頼日を入力してください"
      }
      if (!hallName.trim()) {
        newErrors.hallName = "ホール名を入力してください"
      }
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
    
    // エラーがある場合、最初のエラーまでスクロール
    if (Object.keys(newErrors).length > 0) {
      // エラーの優先順位に従って最初のエラーフィールドを探す
      const errorOrder = [
        'companyName',
        'acquirerName',
        'requestDate',
        'hallName',
        ...productInfos.map((_, index) => `eventProductName-${index}`),
        ...productInfos.map((_, index) => `eventDate-${index}`),
      ]
      
      const firstErrorKey = errorOrder.find(key => newErrors[key])
      
      if (firstErrorKey && errorRefs.current[firstErrorKey]) {
        setTimeout(() => {
          errorRefs.current[firstErrorKey]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }, 100)
      }
    }
    
    return Object.keys(newErrors).length === 0
  }

  const handleCreateProjects = () => {
    if (!validateForm()) {
      return
    }
    
    if (isProductAddMode && projectId) {
      // 商材追加モード: 既存案件に新しい商材を追加
      const productInfo = productInfos[0]
      const durationHours = getDurationInHoursForProduct(productInfo.startTime, productInfo.endTime)
      // コンパニオンのコスト計算
      const companionCost = (() => {
        const selectedWithoutUndecided = Array.from(productInfo.selectedCompanions).filter(n => n !== "未定")
        const hasUndecided = productInfo.selectedCompanions.has("未定")
        const count = Number(productInfo.companionCount) || 0
        
        // 選択されているキャストのコスト
        let cost = selectedWithoutUndecided.reduce((total, name) => {
          const hourlyRate = companionHourlyRates[name] || 0
          return total + (hourlyRate * durationHours)
        }, 0)
        
        // 人数が入力されている場合、選択数が人数より少ない分の推定金額を計算
        if (count > 0) {
          const selectedCount = selectedWithoutUndecided.length
          const undecidedCount = count - selectedCount
          if (undecidedCount > 0) {
            cost += averageCompanionRate * durationHours * undecidedCount
          }
        }
        
        return Math.round(cost)
      })()
      
      // ディレクターのコスト計算
      const directorCost = (() => {
        const selectedWithoutUndecided = Array.from(productInfo.selectedDirectors).filter(n => n !== "未定")
        const hasUndecided = productInfo.selectedDirectors.has("未定")
        const count = Number(productInfo.directorCount) || 0
        
        // 選択されているキャストのコスト
        let cost = selectedWithoutUndecided.reduce((total, name) => {
          const hourlyRate = directorHourlyRates[name] || 0
          return total + (hourlyRate * durationHours)
        }, 0)
        
        // 人数が入力されている場合、選択数が人数より少ない分の推定金額を計算
        if (count > 0) {
          const selectedCount = selectedWithoutUndecided.length
          const undecidedCount = count - selectedCount
          if (undecidedCount > 0) {
            cost += averageDirectorRate * durationHours * undecidedCount
          }
        }
        
        return Math.round(cost)
      })()
      
      // MCのコスト計算
      const mcCost = (() => {
        const selectedWithoutUndecided = Array.from(productInfo.selectedMcs).filter(n => n !== "未定")
        const hasUndecided = productInfo.selectedMcs.has("未定")
        const count = Number(productInfo.mcCount) || 0
        
        // 選択されているキャストのコスト
        let cost = selectedWithoutUndecided.reduce((total, name) => {
          const hourlyRate = mcHourlyRates[name] || 0
          return total + (hourlyRate * durationHours)
        }, 0)
        
        // 「未定」が選択されている場合、人数から推定金額を計算
        if (hasUndecided && count > 0) {
          const selectedCount = selectedWithoutUndecided.length
          const undecidedCount = count - selectedCount
          if (undecidedCount > 0) {
            cost += averageMcRate * durationHours * undecidedCount
          }
        }
        
        return cost
      })()
      const totalCost = companionCost + directorCost + mcCost
      // 交通費・宿泊費の計算用：入力された人数の合計（未定を含む）
      const totalCastCount = 
        (Number(productInfo.companionCount) || 0) +
        (Number(productInfo.directorCount) || 0) +
        (Number(productInfo.mcCount) || 0)
      const performanceFeeDiscountValue = Number(productInfo.performanceFeeDiscount) || 0
      const performanceFeeAfterDiscount = Math.max(0, totalCost - performanceFeeDiscountValue)
      const transportationFeePerPersonValue = Number(productInfo.transportationFeePerPerson) || 0
      const totalTransportationFee = transportationFeePerPersonValue * totalCastCount
      const accommodationFeePerPersonValue = Number(productInfo.accommodationFeePerPerson) || 0
      const totalAccommodationFee = accommodationFeePerPersonValue * totalCastCount
      const eventBaseFeeValue = getEventBaseFee(productInfo.eventType)
      // ホールの割引金額を取得
      const hall = hallName ? getHallByName(hallName) : null
      const hallDiscountAmount = hall?.discountAmount || 0
      // 手動入力の割引とホールの割引を合計
      const manualDiscountValue = Number(productInfo.eventBaseFeeDiscount) || 0
      const eventBaseFeeDiscountValue = hallDiscountAmount + manualDiscountValue
      const eventBaseFeeAfterDiscount = Math.round(Math.max(0, eventBaseFeeValue - eventBaseFeeDiscountValue))
      const estimatedBillingAmount = Math.round(performanceFeeAfterDiscount + totalTransportationFee + totalAccommodationFee + eventBaseFeeAfterDiscount)
      
      const existingProject = getProjectById(projectId)
      if (!existingProject) {
        addNotification("案件が見つかりませんでした")
        return
      }
      
      // 新しい商材として案件を作成（同じホール情報と案件Noを使用）
      const existingProjectNumber = (existingProject as any).projectNumber
      const newProductProject = {
        projectName: productInfo.eventProductName || `${(existingProject as any).hallName || existingProject.clientName} - ${productInfo.category}`,
        clientName: (existingProject as any).hallName || existingProject.clientName,
        date: productInfo.eventDate.replace(/-/g, "/"),
        venue: (existingProject as any).hallName || existingProject.clientName,
        talent: (existingProject as any).salesPersonName || existingProject.talent,
        estimateAmount: `¥${estimatedBillingAmount.toLocaleString()}`,
        status: "proposed" as const,
        salesPersonName: (existingProject as any).salesPersonName,
        requestDate: (existingProject as any).requestDate,
        hallName: (existingProject as any).hallName || existingProject.clientName,
        projectStatus: determineProjectStatus(productInfo),
        category: productInfo.category,
        eventType: productInfo.eventType,
        eventProductName: productInfo.eventProductName,
        eventDate: productInfo.eventDate.replace(/-/g, "/"),
        mustSeeFlag: productInfo.mustSeeFlag,
        mustSeePublication: productInfo.mustSeePublication,
        publicationDate: productInfo.publicationDate ? productInfo.publicationDate.replace(/-/g, "/") : "",
        publicationTime: productInfo.publicationTime,
        reportRequired: productInfo.reportRequired,
        estimatedBillingAmount: estimatedBillingAmount,
        projectNumber: existingProjectNumber, // 既存の案件Noを使用
        companyId: companyId || (existingProject as any).companyId, // 法人ID
        companyName: companyName || (existingProject as any).companyName, // 法人名
        hallId: hallId || (existingProject as any).hallId, // ホールID
        startTime: productInfo.startTime,
        endTime: productInfo.endTime,
        companionCount: productInfo.companionCount,
        directorCount: productInfo.directorCount,
        mcCount: productInfo.mcCount,
        selectedCompanions: Array.from(productInfo.selectedCompanions),
        selectedDirectors: Array.from(productInfo.selectedDirectors),
        selectedMcs: Array.from(productInfo.selectedMcs),
      } as any
      
      createProject(newProductProject)
      addNotification("商材を追加しました")
      router.push("/")
    } else if (isProductEditMode && projectId) {
      // 商材編集モード: 既存商材を更新
      // 各商材情報ごとの請求予定金額を計算
      const productInfo = productInfos[0]
      const durationHours = getDurationInHoursForProduct(productInfo.startTime, productInfo.endTime)
      // コンパニオンのコスト計算
      const companionCost = (() => {
        const selectedWithoutUndecided = Array.from(productInfo.selectedCompanions).filter(n => n !== "未定")
        const hasUndecided = productInfo.selectedCompanions.has("未定")
        const count = Number(productInfo.companionCount) || 0
        
        // 選択されているキャストのコスト
        let cost = selectedWithoutUndecided.reduce((total, name) => {
          const hourlyRate = companionHourlyRates[name] || 0
          return total + (hourlyRate * durationHours)
        }, 0)
        
        // 人数が入力されている場合、選択数が人数より少ない分の推定金額を計算
        if (count > 0) {
          const selectedCount = selectedWithoutUndecided.length
          const undecidedCount = count - selectedCount
          if (undecidedCount > 0) {
            cost += averageCompanionRate * durationHours * undecidedCount
          }
        }
        
        return Math.round(cost)
      })()
      
      // ディレクターのコスト計算
      const directorCost = (() => {
        const selectedWithoutUndecided = Array.from(productInfo.selectedDirectors).filter(n => n !== "未定")
        const hasUndecided = productInfo.selectedDirectors.has("未定")
        const count = Number(productInfo.directorCount) || 0
        
        // 選択されているキャストのコスト
        let cost = selectedWithoutUndecided.reduce((total, name) => {
          const hourlyRate = directorHourlyRates[name] || 0
          return total + (hourlyRate * durationHours)
        }, 0)
        
        // 人数が入力されている場合、選択数が人数より少ない分の推定金額を計算
        if (count > 0) {
          const selectedCount = selectedWithoutUndecided.length
          const undecidedCount = count - selectedCount
          if (undecidedCount > 0) {
            cost += averageDirectorRate * durationHours * undecidedCount
          }
        }
        
        return Math.round(cost)
      })()
      
      // MCのコスト計算
      const mcCost = (() => {
        const selectedWithoutUndecided = Array.from(productInfo.selectedMcs).filter(n => n !== "未定")
        const hasUndecided = productInfo.selectedMcs.has("未定")
        const count = Number(productInfo.mcCount) || 0
        
        // 選択されているキャストのコスト
        let cost = selectedWithoutUndecided.reduce((total, name) => {
          const hourlyRate = mcHourlyRates[name] || 0
          return total + (hourlyRate * durationHours)
        }, 0)
        
        // 人数が入力されている場合、選択数が人数より少ない分の推定金額を計算
        if (count > 0) {
          const selectedCount = selectedWithoutUndecided.length
          const undecidedCount = count - selectedCount
          if (undecidedCount > 0) {
            cost += averageMcRate * durationHours * undecidedCount
          }
        }
        
        return Math.round(cost)
      })()
      const totalCost = Math.round(companionCost + directorCost + mcCost)
      const castCount = 
        (productInfo.selectedCompanions.has("未定") ? 0 : productInfo.selectedCompanions.size) +
        (productInfo.selectedDirectors.has("未定") ? 0 : productInfo.selectedDirectors.size) +
        (productInfo.selectedMcs.has("未定") ? 0 : productInfo.selectedMcs.size)
      const performanceFeeDiscountValue = Number(productInfo.performanceFeeDiscount) || 0
      const performanceFeeAfterDiscount = Math.round(Math.max(0, totalCost - performanceFeeDiscountValue))
      const transportationFeePerPersonValue = Number(productInfo.transportationFeePerPerson) || 0
      const totalTransportationFee = Math.round(transportationFeePerPersonValue * castCount)
      const accommodationFeePerPersonValue = Number(productInfo.accommodationFeePerPerson) || 0
      const totalAccommodationFee = Math.round(accommodationFeePerPersonValue * castCount)
      const eventBaseFeeValue = getEventBaseFee(productInfo.eventType)
      // ホールの割引金額を取得
      const hall = hallName ? getHallByName(hallName) : null
      const hallDiscountAmount = hall?.discountAmount || 0
      // 手動入力の割引とホールの割引を合計
      const manualDiscountValue = Number(productInfo.eventBaseFeeDiscount) || 0
      const eventBaseFeeDiscountValue = hallDiscountAmount + manualDiscountValue
      const eventBaseFeeAfterDiscount = Math.round(Math.max(0, eventBaseFeeValue - eventBaseFeeDiscountValue))
      const totalBillingAmount = Math.round(performanceFeeAfterDiscount + totalTransportationFee + totalAccommodationFee + eventBaseFeeAfterDiscount)
      
      const existingProject = getProjectById(projectId)
      if (!existingProject) {
        addNotification("案件が見つかりませんでした")
        return
      }
      
      // 手配進行中の場合はステータスを保持
      const currentProjectStatus = (existingProject as any).projectStatus || ""
      const shouldPreserveStatus = currentProjectStatus === "手配進行中"
      
      // 仮押さえ不可の案件（営業確認中でtemporaryHoldFailureCommentが存在）を更新する場合は、
      // キャスティング情報を変更したので仮押さえ依頼に戻す
      const isTemporaryHoldFailure = currentProjectStatus === "営業確認中" && (existingProject as any).temporaryHoldFailureComment
      const newProjectStatus = isTemporaryHoldFailure 
        ? "仮押さえ依頼" 
        : (shouldPreserveStatus ? currentProjectStatus : determineProjectStatus(productInfo))

      const updatedProject = {
        projectName: productInfo.eventProductName || `${(existingProject as any).hallName || existingProject.clientName} - ${productInfo.category}`,
        clientName: (existingProject as any).hallName || existingProject.clientName,
        date: productInfo.eventDate.replace(/-/g, "/"),
        venue: (existingProject as any).hallName || existingProject.clientName,
        talent: (existingProject as any).salesPersonName || existingProject.talent,
        estimateAmount: `¥${totalBillingAmount.toLocaleString()}`,
        status: existingProject.status,
        salesPersonName: (existingProject as any).salesPersonName,
        requestDate: (existingProject as any).requestDate,
        hallName: (existingProject as any).hallName || existingProject.clientName,
        projectStatus: newProjectStatus,
        // 仮押さえ不可の案件を更新する場合は、コメントをクリア
        ...(isTemporaryHoldFailure && { temporaryHoldFailureComment: undefined }),
        // イベントチームへのコメントを保存
        ...(correctionComment !== undefined && { correctionComment: correctionComment }),
        category: productInfo.category,
        eventType: productInfo.eventType,
        eventProductName: productInfo.eventProductName,
        eventDate: productInfo.eventDate.replace(/-/g, "/"),
        mustSeeFlag: productInfo.mustSeeFlag,
        mustSeePublication: productInfo.mustSeePublication,
        publicationDate: productInfo.publicationDate ? productInfo.publicationDate.replace(/-/g, "/") : "",
        publicationTime: productInfo.publicationTime,
        reportRequired: productInfo.reportRequired,
        estimatedBillingAmount: totalBillingAmount,
        companyId: companyId || (existingProject as any).companyId, // 法人ID
        companyName: companyName || (existingProject as any).companyName, // 法人名
        hallId: hallId || (existingProject as any).hallId, // ホールID
        startTime: productInfo.startTime,
        endTime: productInfo.endTime,
        companionCount: productInfo.companionCount,
        directorCount: productInfo.directorCount,
        mcCount: productInfo.mcCount,
        selectedCompanions: Array.from(productInfo.selectedCompanions),
        selectedDirectors: Array.from(productInfo.selectedDirectors),
        selectedMcs: Array.from(productInfo.selectedMcs),
      } as any
      
      updateProject(projectId, updatedProject)
      addNotification("商材を更新しました")
      router.push("/")
    } else if (isEditMode && projectId) {
      // 編集モード: 既存案件を更新
      // 各商材情報ごとの請求予定金額を計算
      const productInfo = productInfos[0]
      const durationHours = getDurationInHoursForProduct(productInfo.startTime, productInfo.endTime)
      // コンパニオンのコスト計算
      const companionCost = (() => {
        const selectedWithoutUndecided = Array.from(productInfo.selectedCompanions).filter(n => n !== "未定")
        const hasUndecided = productInfo.selectedCompanions.has("未定")
        const count = Number(productInfo.companionCount) || 0
        
        // 選択されているキャストのコスト
        let cost = selectedWithoutUndecided.reduce((total, name) => {
          const hourlyRate = companionHourlyRates[name] || 0
          return total + (hourlyRate * durationHours)
        }, 0)
        
        // 人数が入力されている場合、選択数が人数より少ない分の推定金額を計算
        if (count > 0) {
          const selectedCount = selectedWithoutUndecided.length
          const undecidedCount = count - selectedCount
          if (undecidedCount > 0) {
            cost += averageCompanionRate * durationHours * undecidedCount
          }
        }
        
        return Math.round(cost)
      })()
      
      // ディレクターのコスト計算
      const directorCost = (() => {
        const selectedWithoutUndecided = Array.from(productInfo.selectedDirectors).filter(n => n !== "未定")
        const hasUndecided = productInfo.selectedDirectors.has("未定")
        const count = Number(productInfo.directorCount) || 0
        
        // 選択されているキャストのコスト
        let cost = selectedWithoutUndecided.reduce((total, name) => {
          const hourlyRate = directorHourlyRates[name] || 0
          return total + (hourlyRate * durationHours)
        }, 0)
        
        // 人数が入力されている場合、選択数が人数より少ない分の推定金額を計算
        if (count > 0) {
          const selectedCount = selectedWithoutUndecided.length
          const undecidedCount = count - selectedCount
          if (undecidedCount > 0) {
            cost += averageDirectorRate * durationHours * undecidedCount
          }
        }
        
        return Math.round(cost)
      })()
      
      // MCのコスト計算
      const mcCost = (() => {
        const selectedWithoutUndecided = Array.from(productInfo.selectedMcs).filter(n => n !== "未定")
        const hasUndecided = productInfo.selectedMcs.has("未定")
        const count = Number(productInfo.mcCount) || 0
        
        // 選択されているキャストのコスト
        let cost = selectedWithoutUndecided.reduce((total, name) => {
          const hourlyRate = mcHourlyRates[name] || 0
          return total + (hourlyRate * durationHours)
        }, 0)
        
        // 人数が入力されている場合、選択数が人数より少ない分の推定金額を計算
        if (count > 0) {
          const selectedCount = selectedWithoutUndecided.length
          const undecidedCount = count - selectedCount
          if (undecidedCount > 0) {
            cost += averageMcRate * durationHours * undecidedCount
          }
        }
        
        return Math.round(cost)
      })()
      const totalCost = Math.round(companionCost + directorCost + mcCost)
      const castCount = 
        (productInfo.selectedCompanions.has("未定") ? 0 : productInfo.selectedCompanions.size) +
        (productInfo.selectedDirectors.has("未定") ? 0 : productInfo.selectedDirectors.size) +
        (productInfo.selectedMcs.has("未定") ? 0 : productInfo.selectedMcs.size)
      const performanceFeeDiscountValue = Number(productInfo.performanceFeeDiscount) || 0
      const performanceFeeAfterDiscount = Math.round(Math.max(0, totalCost - performanceFeeDiscountValue))
      const transportationFeePerPersonValue = Number(productInfo.transportationFeePerPerson) || 0
      const totalTransportationFee = Math.round(transportationFeePerPersonValue * castCount)
      const accommodationFeePerPersonValue = Number(productInfo.accommodationFeePerPerson) || 0
      const totalAccommodationFee = Math.round(accommodationFeePerPersonValue * castCount)
      const eventBaseFeeValue = getEventBaseFee(productInfo.eventType)
      // ホールの割引金額を取得
      const hall = hallName ? getHallByName(hallName) : null
      const hallDiscountAmount = hall?.discountAmount || 0
      // 手動入力の割引とホールの割引を合計
      const manualDiscountValue = Number(productInfo.eventBaseFeeDiscount) || 0
      const eventBaseFeeDiscountValue = hallDiscountAmount + manualDiscountValue
      const eventBaseFeeAfterDiscount = Math.round(Math.max(0, eventBaseFeeValue - eventBaseFeeDiscountValue))
      const totalBillingAmount = Math.round(performanceFeeAfterDiscount + totalTransportationFee + totalAccommodationFee + eventBaseFeeAfterDiscount)
      
      // 手配進行中の場合はステータスを保持
      const existingProject = projectId ? getProjectById(projectId) : null
      const currentProjectStatus = existingProject ? ((existingProject as any).projectStatus || "") : ""
      const shouldPreserveStatus = currentProjectStatus === "手配進行中"
      
      // 仮押さえ不可の案件（営業確認中でtemporaryHoldFailureCommentが存在）を更新する場合は、
      // キャスティング情報を変更したので仮押さえ依頼に戻す
      const isTemporaryHoldFailure = existingProject && currentProjectStatus === "営業確認中" && (existingProject as any).temporaryHoldFailureComment
      const newProjectStatus = isTemporaryHoldFailure 
        ? "仮押さえ依頼" 
        : (shouldPreserveStatus ? currentProjectStatus : determineProjectStatus(productInfo))
      
      const updatedProject = {
        projectName: productInfo.eventProductName || `${hallName} - ${productInfo.category}`,
        clientName: hallName,
        date: productInfo.eventDate.replace(/-/g, "/"),
        venue: hallName,
        talent: acquirerName,
        estimateAmount: `¥${totalBillingAmount.toLocaleString()}`,
        status: "proposed" as const,
        salesPersonName: acquirerName,
        requestDate: requestDate.replace(/-/g, "/"),
        hallName: hallName,
        projectStatus: newProjectStatus,
        // 仮押さえ不可の案件を更新する場合は、コメントをクリア
        ...(isTemporaryHoldFailure && { temporaryHoldFailureComment: undefined }),
        category: productInfo.category,
        eventType: productInfo.eventType,
        eventProductName: productInfo.eventProductName,
        eventDate: productInfo.eventDate.replace(/-/g, "/"),
        estimatedBillingAmount: totalBillingAmount,
        companyId: companyId, // 法人ID
        companyName: companyName, // 法人名
        hallId: hallId, // ホールID
      } as any
      
      updateProject(projectId, updatedProject)
      addNotification("案件を更新しました")
      router.push("/")
    } else {
      // 新規作成モード: 同じ基本情報を持つ商材には同じ案件Noを付与
      // まず、案件Noを1つ生成（同じ基本情報なので1つの案件として扱う）
      const allProjects = getProjects()
      const newProjectNumber = generateProjectNumber(allProjects)
      
      const newProjectsData = productInfos.map((productInfo) => {
        // 各商材情報の請求予定金額を計算
        const durationHours = getDurationInHoursForProduct(productInfo.startTime, productInfo.endTime)
                // コンパニオンのコスト計算
                const companionCost = (() => {
                  const selectedWithoutUndecided = Array.from(productInfo.selectedCompanions).filter(n => n !== "未定")
                  const hasUndecided = productInfo.selectedCompanions.has("未定")
                  const count = Number(productInfo.companionCount) || 0
                  
                  // 選択されているキャストのコスト
                  let cost = selectedWithoutUndecided.reduce((total, name) => {
                    const hourlyRate = companionHourlyRates[name] || 0
                    return total + (hourlyRate * durationHours)
                  }, 0)
                  
                  // 「未定」が選択されている場合、人数から推定金額を計算
                  if (hasUndecided && count > 0) {
                    const selectedCount = selectedWithoutUndecided.length
                    const undecidedCount = count - selectedCount
                    if (undecidedCount > 0) {
                      cost += averageCompanionRate * durationHours * undecidedCount
                    }
                  }
                  
                  return cost
                })()
                
                // ディレクターのコスト計算
                const directorCost = (() => {
                  const selectedWithoutUndecided = Array.from(productInfo.selectedDirectors).filter(n => n !== "未定")
                  const hasUndecided = productInfo.selectedDirectors.has("未定")
                  const count = Number(productInfo.directorCount) || 0
                  
                  // 選択されているキャストのコスト
                  let cost = selectedWithoutUndecided.reduce((total, name) => {
                    const hourlyRate = directorHourlyRates[name] || 0
                    return total + (hourlyRate * durationHours)
                  }, 0)
                  
                  // 「未定」が選択されている場合、人数から推定金額を計算
                  if (hasUndecided && count > 0) {
                    const selectedCount = selectedWithoutUndecided.length
                    const undecidedCount = count - selectedCount
                    if (undecidedCount > 0) {
                      cost += averageDirectorRate * durationHours * undecidedCount
                    }
                  }
                  
                  return cost
                })()
                
                // MCのコスト計算
                const mcCost = (() => {
                  const selectedWithoutUndecided = Array.from(productInfo.selectedMcs).filter(n => n !== "未定")
                  const hasUndecided = productInfo.selectedMcs.has("未定")
                  const count = Number(productInfo.mcCount) || 0
                  
                  // 選択されているキャストのコスト
                  let cost = selectedWithoutUndecided.reduce((total, name) => {
                    const hourlyRate = mcHourlyRates[name] || 0
                    return total + (hourlyRate * durationHours)
                  }, 0)
                  
                  // 「未定」が選択されている場合、人数から推定金額を計算
                  if (hasUndecided && count > 0) {
                    const selectedCount = selectedWithoutUndecided.length
                    const undecidedCount = count - selectedCount
                    if (undecidedCount > 0) {
                      cost += averageMcRate * durationHours * undecidedCount
                    }
                  }
                  
                  return cost
                })()
        const totalCost = companionCost + directorCost + mcCost
        const castCount = 
        (productInfo.selectedCompanions.has("未定") ? 0 : productInfo.selectedCompanions.size) +
        (productInfo.selectedDirectors.has("未定") ? 0 : productInfo.selectedDirectors.size) +
        (productInfo.selectedMcs.has("未定") ? 0 : productInfo.selectedMcs.size)
        const performanceFeeDiscountValue = Number(productInfo.performanceFeeDiscount) || 0
        const performanceFeeAfterDiscount = Math.max(0, totalCost - performanceFeeDiscountValue)
        const transportationFeePerPersonValue = Number(productInfo.transportationFeePerPerson) || 0
        const totalTransportationFee = transportationFeePerPersonValue * castCount
        const accommodationFeePerPersonValue = Number(productInfo.accommodationFeePerPerson) || 0
        const totalAccommodationFee = accommodationFeePerPersonValue * castCount
        const eventBaseFeeValue = Number(productInfo.eventBaseFee) || 0
        const eventBaseFeeDiscountValue = Number(productInfo.eventBaseFeeDiscount) || 0
        const eventBaseFeeAfterDiscount = Math.max(0, eventBaseFeeValue - eventBaseFeeDiscountValue)
        const estimatedBillingAmount = Math.round(performanceFeeAfterDiscount + totalTransportationFee + totalAccommodationFee + eventBaseFeeAfterDiscount)
        
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
          projectStatus: determineProjectStatus(productInfo),
          category: productInfo.category,
          eventType: productInfo.eventType,
          eventProductName: productInfo.eventProductName,
          eventDate: productInfo.eventDate.replace(/-/g, "/"),
          mustSeeFlag: productInfo.mustSeeFlag,
          mustSeePublication: productInfo.mustSeePublication,
          publicationDate: productInfo.publicationDate ? productInfo.publicationDate.replace(/-/g, "/") : "",
          publicationTime: productInfo.publicationTime,
          estimatedBillingAmount: estimatedBillingAmount,
          projectNumber: newProjectNumber, // 同じ案件Noを付与
          companyId: companyId, // 法人ID
          companyName: companyName, // 法人名
          hallId: hallId, // ホールID
          startTime: productInfo.startTime,
          endTime: productInfo.endTime,
          companionCount: productInfo.companionCount,
          directorCount: productInfo.directorCount,
          mcCount: productInfo.mcCount,
          selectedCompanions: Array.from(productInfo.selectedCompanions),
          selectedDirectors: Array.from(productInfo.selectedDirectors),
          selectedMcs: Array.from(productInfo.selectedMcs),
        } as any
      })
      
      // 仮想DBに案件を作成
      createProjects(newProjectsData)
      addNotification(`案件No ${newProjectNumber} で ${newProjectsData.length}件の商材を作成しました`)
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

  // 編集モードで既存データを読み込む（初期化フラグ）
  const hasInitialized = useRef(false)
  
  useEffect(() => {
    // 商材追加モードの場合は既存データを読み込まない
    if (isProductAddMode) {
      hasInitialized.current = true
      return
    }
    
    if (isEditMode && projectId && getProjectById && getHallByName && !hasInitialized.current) {
      const project = getProjectById(projectId)
      if (project) {
        hasInitialized.current = true
        // 基本情報を読み込み
        if (project.requestDate) {
          // YYYY/MM/DD形式をYYYY-MM-DD形式に変換
          const dateStr = project.requestDate.replace(/\//g, "-")
          setRequestDate(dateStr)
        }
        // 法人情報を読み込み
        if ((project as any).companyId) {
          const company = getCompanyByCompanyId((project as any).companyId)
          if (company) {
            setCompanyId(company.companyId)
            setCompanyName(company.name)
            setSelectedCompanyId(company.id)
          }
        }
        if (project.hallName) {
          setHallName(project.hallName)
          // ホール名からホール担当営業を自動設定
          const hall = getHallByName(project.hallName)
          if (hall) {
            setHallId(hall.hallId)
            setAcquirerName(hall.salesPersonName)
            // ホールから法人IDを取得
            if (hall.companyId && !selectedCompanyId) {
              const company = getCompanyById(hall.companyId)
              if (company) {
                setCompanyId(company.companyId)
                setCompanyName(company.name)
                setSelectedCompanyId(company.id)
              }
            }
          } else if (project.salesPersonName) {
            // ホールデータにない場合は既存の値を保持
            setAcquirerName(project.salesPersonName)
            // 既存のホールIDがあれば設定
            if ((project as any).hallId) {
              setHallId((project as any).hallId)
            }
          }
        } else if (project.salesPersonName) {
          setAcquirerName(project.salesPersonName)
        }
        
        // 商材情報を読み込み
        if (project.category && project.eventType && project.eventProductName && project.eventDate) {
          const eventDateStr = project.eventDate.replace(/\//g, "-")
          // キャスティング情報を読み込み（配列からSetに変換）
          const selectedCompanions = (project as any).selectedCompanions && Array.isArray((project as any).selectedCompanions)
            ? new Set<string>((project as any).selectedCompanions)
            : new Set<string>(["未定"])
          const selectedDirectors = (project as any).selectedDirectors && Array.isArray((project as any).selectedDirectors)
            ? new Set<string>((project as any).selectedDirectors)
            : new Set<string>(["未定"])
          const selectedMcs = (project as any).selectedMcs && Array.isArray((project as any).selectedMcs)
            ? new Set<string>((project as any).selectedMcs)
            : new Set<string>(["未定"])
          
          setProductInfos([{
            id: 1,
            category: project.category,
            eventType: project.eventType,
            eventProductName: project.eventProductName,
            eventDate: eventDateStr,
            mustSeeFlag: (project as any).mustSeeFlag || "0",
            mustSeePublication: (project as any).mustSeePublication || "不要",
            publicationDate: (project as any).publicationDate ? (project as any).publicationDate.replace(/\//g, "-") : "",
            publicationTime: (project as any).publicationTime || "",
            reportRequired: (project as any).reportRequired || "不要",
            startTime: (project as any).startTime || "08:00",
            endTime: (project as any).endTime || "15:00",
            status: project.projectStatus || "仮押さえ済み",
            companionCount: (project as any).companionCount || "",
            directorCount: (project as any).directorCount || "",
            mcCount: (project as any).mcCount || "",
            selectedCompanions: selectedCompanions,
            selectedDirectors: selectedDirectors,
            selectedMcs: selectedMcs,
            transportationFeePerPerson: "",
            accommodationFeePerPerson: "",
            performanceFeeDiscount: "",
            eventBaseFee: String(getEventBaseFee(project.eventType)),
            eventBaseFeeDiscount: "",
            isOpen: true,
          }])
        }
      }
    }
    // projectId が変わった場合は初期化フラグをリセット
    if (!isEditMode || !projectId) {
      hasInitialized.current = false
    }
  }, [isEditMode, isProductAddMode, projectId, getProjectById, getHallByName, getCompanyByCompanyId, getCompanyById, selectedCompanyId])

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

  const handleOpenCalendarModal = (personName: string, status: "available" | "busy", personType: "companion" | "director" | "mc", productIndex: number = 0) => {
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
        <h1 className="text-3xl font-bold text-slate-900">
          {isProductAddMode ? "商材追加" : isProductEditMode ? "商材編集" : isEditMode ? "案件編集" : "新規案件作成"}
        </h1>
      </div>

      {/* 修正依頼内容の表示（商材編集モードで修正依頼がある場合のみ） */}
      {isProductEditMode && correctionRequest && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-900">修正依頼内容</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{correctionRequest}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Basic Info */}
      {!isProductMode && (
      <Card>
      <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">基本情報</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">法人名</Label>
              <Popover open={companySearchOpen} onOpenChange={setCompanySearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={companySearchOpen}
                    className={`w-full justify-between ${errors.companyName ? "border-red-500" : ""}`}
                  >
                    {companyName || "法人名を検索..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="法人名を検索..." 
                      value={companySearchQuery}
                      onValueChange={setCompanySearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>法人が見つかりませんでした</CommandEmpty>
                      <CommandGroup>
                        {searchCompanies(companySearchQuery).map((company) => (
                          <CommandItem
                            key={company.id}
                            value={company.name}
                            onSelect={() => {
                              setCompanyName(company.name)
                              setCompanyId(company.companyId)
                              setSelectedCompanyId(company.id)
                              setCompanySearchOpen(false)
                              setCompanySearchQuery("")
                              // 法人を変更したらホール名をリセット
                              setHallName("")
                              setAcquirerName("")
                              setErrors((prev) => {
                                if (prev.companyName) {
                                  const newErrors = { ...prev }
                                  delete newErrors.companyName
                                  return newErrors
                                }
                                return prev
                              })
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${companyName === company.name ? "opacity-100" : "opacity-0"}`}
                            />
                            <div className="flex flex-col">
                              <span>{company.name}</span>
                              <span className="text-xs text-slate-500">法人ID: {company.companyId}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.companyName && (
                <p ref={(el) => { errorRefs.current.companyName = el }} className="text-sm text-red-600">{errors.companyName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyId">法人ID</Label>
              <Input
                id="companyId"
                value={companyId}
                disabled
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hallName">ホール名</Label>
              <Popover open={hallSearchOpen} onOpenChange={setHallSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={hallSearchOpen}
                    className={`w-full justify-between ${errors.hallName ? "border-red-500" : ""}`}
                  >
                    {hallName || "ホール名を検索..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="ホール名を検索..." 
                      value={hallSearchQuery}
                      onValueChange={setHallSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>ホールが見つかりませんでした</CommandEmpty>
                      <CommandGroup>
                        {searchHalls(hallSearchQuery, selectedCompanyId || undefined).map((hall) => (
                          <CommandItem
                            key={hall.id}
                            value={hall.name}
                            onSelect={() => {
                              setHallName(hall.name)
                              setHallId(hall.hallId)
                              setAcquirerName(hall.salesPersonName)
                              setHallSearchOpen(false)
                              setHallSearchQuery("")
                              setErrors((prev) => {
                                const newErrors = { ...prev }
                                let hasChanges = false
                                if (prev.hallName) {
                                  delete newErrors.hallName
                                  hasChanges = true
                                }
                                if (prev.acquirerName) {
                                  delete newErrors.acquirerName
                                  hasChanges = true
                                }
                                return hasChanges ? newErrors : prev
                              })
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${hallName === hall.name ? "opacity-100" : "opacity-0"}`}
                            />
                            <div className="flex flex-col">
                              <span>{hall.name}</span>
                              <span className="text-xs text-slate-500">担当: {hall.salesPersonName}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.hallName && (
                <p ref={(el) => { errorRefs.current.hallName = el }} className="text-sm text-red-600">{errors.hallName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hallId">ホールID</Label>
              <Input
                id="hallId"
                value={hallId}
                disabled
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acquirerName">ホール担当営業</Label>
              <Input
                id="acquirerName"
                value={acquirerName}
                onChange={(e) => {
                  setAcquirerName(e.target.value)
                  setErrors((prev) => {
                    if (prev.acquirerName) {
                      const newErrors = { ...prev }
                      delete newErrors.acquirerName
                      return newErrors
                    }
                    return prev
                  })
                }}
                placeholder="例: 山田 太郎"
                className={errors.acquirerName ? "border-red-500" : ""}
              />
              {errors.acquirerName && (
                <p ref={(el) => { errorRefs.current.acquirerName = el }} className="text-sm text-red-600">{errors.acquirerName}</p>
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
                    setErrors((prev) => {
                      if (prev.requestDate) {
                        const newErrors = { ...prev }
                        delete newErrors.requestDate
                        return newErrors
                      }
                      return prev
                    })
                  }
                }}
                className={errors.requestDate ? "border-red-500" : ""}
              />
              {errors.requestDate && (
                <p ref={(el) => { errorRefs.current.requestDate = el }} className="text-sm text-red-600">{errors.requestDate}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      )}

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
                <div className="flex items-center justify-between gap-2">
                  <CollapsibleTrigger className="flex flex-1 items-center justify-between text-left w-full cursor-pointer">
                    <h3 className="text-lg font-semibold text-slate-900">
                      商材情報{productNumber === 1 ? "①" : productNumber === 2 ? "②" : productNumber === 3 ? "③" : productNumber === 4 ? "④" : "⑤"}
                    </h3>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-600 transition-transform duration-200 ${
                        productInfo.isOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>

                  {productInfos.length > 1 && (
                    <button
                      type="button"
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
                </div>
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
                          value={productInfo.category || undefined}
                          onValueChange={(value) => {
                            updateProductInfo(index, { category: value })
                            if (index === 0) {
                              setErrors((prev) => {
                                if (prev.category) {
                                  const newErrors = { ...prev }
                                  delete newErrors.category
                                  return newErrors
                                }
                                return prev
                              })
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
                          value={productInfo.eventType || undefined}
                          onValueChange={(value) => {
                            updateProductInfo(index, { eventType: value })
                            if (index === 0) {
                              setErrors((prev) => {
                                if (prev.eventType) {
                                  const newErrors = { ...prev }
                                  delete newErrors.eventType
                                  return newErrors
                                }
                                return prev
                              })
                            }
                          }}
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
                            setErrors((prev) => {
                              if (prev[errorKey]) {
                                const newErrors = { ...prev }
                                delete newErrors[errorKey]
                                return newErrors
                              }
                              return prev
                            })
                          }}
                          placeholder="例: 新台入替イベント"
                          className={errors[`eventProductName-${index}`] ? "border-red-500" : ""}
                        />
                        {errors[`eventProductName-${index}`] && (
                          <p ref={(el) => { errorRefs.current[`eventProductName-${index}`] = el }} className="text-sm text-red-600">{errors[`eventProductName-${index}`]}</p>
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
                            setErrors((prev) => {
                              if (prev[errorKey]) {
                                const newErrors = { ...prev }
                                delete newErrors[errorKey]
                                return newErrors
                              }
                              return prev
                            })
                          }}
                          className={errors[`eventDate-${index}`] ? "border-red-500" : ""}
                        />
                        {errors[`eventDate-${index}`] && (
                          <p ref={(el) => { errorRefs.current[`eventDate-${index}`] = el }} className="text-sm text-red-600">{errors[`eventDate-${index}`]}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`startTime-${productInfo.id}`}>開始時間</Label>
                          <TimePicker
                            id={`startTime-${productInfo.id}`}
                            value={productInfo.startTime}
                            onChange={(value) => {
                              updateProductInfo(index, { startTime: value })
                            }}
                            max={productInfo.endTime || undefined}
                            placeholder="開始時間を選択"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`endTime-${productInfo.id}`}>終了時間</Label>
                          <TimePicker
                            id={`endTime-${productInfo.id}`}
                            value={productInfo.endTime}
                            onChange={(value) => {
                              updateProductInfo(index, { endTime: value })
                            }}
                            min={productInfo.startTime || undefined}
                            placeholder="終了時間を選択"
                          />
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
                      <div className="space-y-2">
                        <Label htmlFor={`mustSeeFlag-${productInfo.id}`}>必見フラグ</Label>
                        <Select
                          value={productInfo.mustSeeFlag}
                          onValueChange={(value) => {
                            // 必見フラグに応じて必見掲載を自動設定
                            const mustSeePublication = value === "1" ? "要" : "不要"
                            updateProductInfo(index, { 
                              mustSeeFlag: value,
                              mustSeePublication: mustSeePublication
                            })
                          }}
                        >
                          <SelectTrigger id={`mustSeeFlag-${productInfo.id}`}>
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`mustSeePublication-${productInfo.id}`}>必見掲載</Label>
                        <Select
                          value={productInfo.mustSeePublication}
                          onValueChange={(value) => updateProductInfo(index, { mustSeePublication: value })}
                        >
                          <SelectTrigger id={`mustSeePublication-${productInfo.id}`}>
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="要">要</SelectItem>
                            <SelectItem value="不要">不要</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`publicationDate-${productInfo.id}`}>必見掲載日</Label>
                        <Input
                          id={`publicationDate-${productInfo.id}`}
                          type="date"
                          value={productInfo.publicationDate}
                          onChange={(e) => updateProductInfo(index, { publicationDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`publicationTime-${productInfo.id}`}>必見掲載時刻</Label>
                        <Input
                          id={`publicationTime-${productInfo.id}`}
                          type="time"
                          value={productInfo.publicationTime}
                          onChange={(e) => updateProductInfo(index, { publicationTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`reportRequired-${productInfo.id}`}>レポート要否</Label>
                        <Select
                          value={productInfo.reportRequired}
                          onValueChange={(value) => updateProductInfo(index, { reportRequired: value })}
                        >
                          <SelectTrigger id={`reportRequired-${productInfo.id}`}>
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="要">要</SelectItem>
                            <SelectItem value="不要">不要</SelectItem>
                          </SelectContent>
                        </Select>
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
              {productInfo.eventType !== "スロセレ" && (
              <div className="space-y-4 bg-rose-50/50 border border-rose-200/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">コンパニオン</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`companionCount-${productInfo.id}`} className="text-sm text-slate-700">
                      人数:
                    </Label>
                    <Input
                      id={`companionCount-${productInfo.id}`}
                      type="number"
                      min="0"
                      value={productInfo.companionCount}
                      onChange={(e) => {
                        const count = e.target.value
                        updateProductInfo(index, { companionCount: count })
                        // 人数が0になった場合、選択をクリア
                        if (count === "0" || count === "") {
                          updateProductInfo(index, { selectedCompanions: new Set(["未定"]) })
                        }
                      }}
                      className="w-20"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                {Number(productInfo.companionCount) > 0 && (
                  <>
                    {/* 未定選択肢 */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-3">
                    <div
                      className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                        productInfo.selectedCompanions.has("未定")
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => {
                        updateSelectedCompanions(index, "未定")
                      }}
                    >
                      <div className="w-full text-left">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-slate-900">未定</div>
                          {productInfo.selectedCompanions.has("未定") && (
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <Badge variant="outline" className="mt-2">
                          未定
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 専属コンパニオン */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">専属</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {talents.map((talent) => {
                      const isSelected = productInfo.selectedCompanions.has(talent.name)
                      const durationHours = getDurationInHoursForProduct(productInfo.startTime, productInfo.endTime)
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
                            updateSelectedCompanions(index, talent.name)
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
                              <span className="font-semibold">¥{((companionHourlyRates[talent.name] || 0) * durationHours).toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenCalendarModal(talent.name, talent.status, "companion", index)
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
                      const isSelected = productInfo.selectedCompanions.has(companion)
                      const durationHours = getDurationInHoursForProduct(productInfo.startTime, productInfo.endTime)
                      return (
                        <div
                          key={companion}
                          className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => {
                            updateSelectedCompanions(index, companion)
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
                              <span className="font-semibold">¥{((companionHourlyRates[companion] || 0) * durationHours).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                  </>
                )}
              </div>
              )}

              {/* ディレクター */}
              <div className="space-y-4 bg-sky-50/50 border border-sky-200/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">ディレクター</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`directorCount-${productInfo.id}`} className="text-sm text-slate-700">
                      人数:
                    </Label>
                    <Input
                      id={`directorCount-${productInfo.id}`}
                      type="number"
                      min="0"
                      value={productInfo.directorCount}
                      onChange={(e) => {
                        const count = e.target.value
                        updateProductInfo(index, { directorCount: count })
                        // 人数が0になった場合、選択をクリア
                        if (count === "0" || count === "") {
                          updateProductInfo(index, { selectedDirectors: new Set(["未定"]) })
                        }
                      }}
                      className="w-20"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                {Number(productInfo.directorCount) > 0 && (
                  <>
                    {/* 未定選択肢 */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-3">
                    <div
                      className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                        productInfo.selectedDirectors.has("未定")
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => {
                        updateSelectedDirectors(index, "未定")
                      }}
                    >
                      <div className="w-full text-left">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-slate-900">未定</div>
                          {productInfo.selectedDirectors.has("未定") && (
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <Badge variant="outline" className="mt-2">
                          未定
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 専属ディレクター */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">専属</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {directors.map((director) => {
                      const isSelected = productInfo.selectedDirectors.has(director.name)
                      const durationHours = getDurationInHoursForProduct(productInfo.startTime, productInfo.endTime)
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
                            updateSelectedDirectors(index, director.name)
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
                              <span className="font-semibold">¥{((directorHourlyRates[director.name] || 0) * durationHours).toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenCalendarModal(director.name, director.status, "director", index)
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
                      const isSelected = productInfo.selectedDirectors.has(director)
                      const durationHours = getDurationInHoursForProduct(productInfo.startTime, productInfo.endTime)
                      return (
                        <div
                          key={director}
                          className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => {
                            updateSelectedDirectors(index, director)
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
                              <span className="font-semibold">¥{((directorHourlyRates[director] || 0) * durationHours).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                  </>
                )}
              </div>

              {/* MC */}
              <div className="space-y-4 bg-emerald-50/50 border border-emerald-200/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">MC</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`mcCount-${productInfo.id}`} className="text-sm text-slate-700">
                      人数:
                    </Label>
                    <Input
                      id={`mcCount-${productInfo.id}`}
                      type="number"
                      min="0"
                      value={productInfo.mcCount}
                      onChange={(e) => {
                        const count = e.target.value
                        updateProductInfo(index, { mcCount: count })
                        // 人数が0になった場合、選択をクリア
                        if (count === "0" || count === "") {
                          updateProductInfo(index, { selectedMcs: new Set(["未定"]) })
                        }
                      }}
                      className="w-20"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                {Number(productInfo.mcCount) > 0 && (
                  <>
                    {/* 未定選択肢 */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-3">
                    <div
                      className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                        productInfo.selectedMcs.has("未定")
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => {
                        updateSelectedMcs(index, "未定")
                      }}
                    >
                      <div className="w-full text-left">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-slate-900">未定</div>
                          {productInfo.selectedMcs.has("未定") && (
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <Badge variant="outline" className="mt-2">
                          未定
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 専属MC */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">専属</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {mcs.map((mc) => {
                      const isSelected = productInfo.selectedMcs.has(mc.name)
                      const durationHours = getDurationInHoursForProduct(productInfo.startTime, productInfo.endTime)
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
                            updateSelectedMcs(index, mc.name)
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
                              <span className="font-semibold">¥{((mcHourlyRates[mc.name] || 0) * durationHours).toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenCalendarModal(mc.name, mc.status, "mc", index)
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
                      const isSelected = productInfo.selectedMcs.has(mc)
                      const durationHours = getDurationInHoursForProduct(productInfo.startTime, productInfo.endTime)
                      return (
                        <div
                          key={mc}
                          className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => {
                            updateSelectedMcs(index, mc)
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
                              <span className="font-semibold">¥{((mcHourlyRates[mc] || 0) * durationHours).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                  </>
                )}
              </div>

              {/* 交通費・宿泊費 */}
              <div className="space-y-4 bg-slate-50/50 border border-slate-200/50 rounded-lg p-4">
                <Label className="text-base font-semibold">交通費・宿泊費</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`transportationFeePerPerson-${productInfo.id}`} className="text-sm text-slate-700">
                      一人当たりの交通費
                    </Label>
                    <Input
                      id={`transportationFeePerPerson-${productInfo.id}`}
                      type="number"
                      value={productInfo.transportationFeePerPerson}
                      onChange={(e) => updateProductInfo(index, { transportationFeePerPerson: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`accommodationFeePerPerson-${productInfo.id}`} className="text-sm text-slate-700">
                      一人当たりの宿泊費
                    </Label>
                    <Input
                      id={`accommodationFeePerPerson-${productInfo.id}`}
                      type="number"
                      value={productInfo.accommodationFeePerPerson}
                      onChange={(e) => updateProductInfo(index, { accommodationFeePerPerson: e.target.value })}
                      placeholder="0"
                    />
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
              {(() => {
                // 各商材情報ごとのコスト計算
                const durationHours = getDurationInHoursForProduct(productInfo.startTime, productInfo.endTime)
                // コンパニオンのコスト計算
                const companionCost = (() => {
                  const selectedWithoutUndecided = Array.from(productInfo.selectedCompanions).filter(n => n !== "未定")
                  const hasUndecided = productInfo.selectedCompanions.has("未定")
                  const count = Number(productInfo.companionCount) || 0
                  
                  // 選択されているキャストのコスト
                  let cost = selectedWithoutUndecided.reduce((total, name) => {
                    const hourlyRate = companionHourlyRates[name] || 0
                    return total + (hourlyRate * durationHours)
                  }, 0)
                  
                  // 人数が入力されている場合、選択数が人数より少ない分の推定金額を計算
                  if (count > 0) {
                    const selectedCount = selectedWithoutUndecided.length
                    const undecidedCount = count - selectedCount
                    if (undecidedCount > 0) {
                      cost += averageCompanionRate * durationHours * undecidedCount
                    }
                  }
                  
                  return Math.round(cost)
                })()
                
                // ディレクターのコスト計算
                const directorCost = (() => {
                  const selectedWithoutUndecided = Array.from(productInfo.selectedDirectors).filter(n => n !== "未定")
                  const hasUndecided = productInfo.selectedDirectors.has("未定")
                  const count = Number(productInfo.directorCount) || 0
                  
                  // 選択されているキャストのコスト
                  let cost = selectedWithoutUndecided.reduce((total, name) => {
                    const hourlyRate = directorHourlyRates[name] || 0
                    return total + (hourlyRate * durationHours)
                  }, 0)
                  
                  // 人数が入力されている場合、選択数が人数より少ない分の推定金額を計算
                  if (count > 0) {
                    const selectedCount = selectedWithoutUndecided.length
                    const undecidedCount = count - selectedCount
                    if (undecidedCount > 0) {
                      cost += averageDirectorRate * durationHours * undecidedCount
                    }
                  }
                  
                  return Math.round(cost)
                })()
                
                // MCのコスト計算
                const mcCost = (() => {
                  const selectedWithoutUndecided = Array.from(productInfo.selectedMcs).filter(n => n !== "未定")
                  const hasUndecided = productInfo.selectedMcs.has("未定")
                  const count = Number(productInfo.mcCount) || 0
                  
                  // 選択されているキャストのコスト
                  let cost = selectedWithoutUndecided.reduce((total, name) => {
                    const hourlyRate = mcHourlyRates[name] || 0
                    return total + (hourlyRate * durationHours)
                  }, 0)
                  
                  // 人数が入力されている場合、選択数が人数より少ない分の推定金額を計算
                  if (count > 0) {
                    const selectedCount = selectedWithoutUndecided.length
                    const undecidedCount = count - selectedCount
                    if (undecidedCount > 0) {
                      cost += averageMcRate * durationHours * undecidedCount
                    }
                  }
                  
                  return Math.round(cost)
                })()
                const totalCost = Math.round(companionCost + directorCost + mcCost)
                // 交通費・宿泊費の計算用：入力された人数の合計（未定を含む）
                const totalCastCount = 
                  (Number(productInfo.companionCount) || 0) +
                  (Number(productInfo.directorCount) || 0) +
                  (Number(productInfo.mcCount) || 0)
                const performanceFeeDiscountValue = Number(productInfo.performanceFeeDiscount) || 0
                const performanceFeeAfterDiscount = Math.round(Math.max(0, totalCost - performanceFeeDiscountValue))
                const transportationFeePerPersonValue = Number(productInfo.transportationFeePerPerson) || 0
                const totalTransportationFee = Math.round(transportationFeePerPersonValue * totalCastCount)
                const accommodationFeePerPersonValue = Number(productInfo.accommodationFeePerPerson) || 0
                const totalAccommodationFee = Math.round(accommodationFeePerPersonValue * totalCastCount)
                const eventBaseFeeValue = getEventBaseFee(productInfo.eventType)
                // ホールの割引金額を取得
                const hall = hallName ? getHallByName(hallName) : null
                const hallDiscountAmount = hall?.discountAmount || 0
                // 手動入力の割引とホールの割引を合計
                const manualDiscountValue = Number(productInfo.eventBaseFeeDiscount) || 0
                const eventBaseFeeDiscountValue = hallDiscountAmount + manualDiscountValue
                const eventBaseFeeAfterDiscount = Math.round(Math.max(0, eventBaseFeeValue - eventBaseFeeDiscountValue))
                const totalBillingAmount = Math.round(performanceFeeAfterDiscount + totalTransportationFee + totalAccommodationFee + eventBaseFeeAfterDiscount)
                
                return (
                  <>
                    {/* 出演料 */}
                    <div className="bg-slate-50/50 border border-slate-200/50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold text-slate-900">出演料</Label>
                          <div className="text-xl font-bold text-slate-900">
                            ¥{totalCost.toLocaleString()}
                          </div>
                        </div>
                        {/* 内訳 */}
                        <div className="space-y-3 pt-2 border-t border-slate-200">
                          {/* コンパニオン内訳 */}
                          {Number(productInfo.companionCount) > 0 && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 font-medium">コンパニオン</span>
                                <span className="font-medium text-slate-900">¥{Math.round(companionCost).toLocaleString()}</span>
                              </div>
                            {(() => {
                              const selectedWithoutUndecided = Array.from(productInfo.selectedCompanions).filter(n => n !== "未定")
                              const selectedCount = selectedWithoutUndecided.length
                              const count = Number(productInfo.companionCount) || 0
                              const undecidedCount = count > 0 ? count - selectedCount : 0
                              const selectedCost = selectedWithoutUndecided.reduce((total, name) => {
                                const hourlyRate = companionHourlyRates[name] || 0
                                return total + (hourlyRate * durationHours)
                              }, 0)
                              const undecidedCost = undecidedCount > 0 ? averageCompanionRate * durationHours * undecidedCount : 0
                              
                              return (
                                <div className="pl-4 space-y-1 text-xs">
                                  <div className="text-slate-500 mb-1">
                                    稼働時間: {durationHours.toFixed(1)}時間
                                  </div>
                                  {selectedCount > 0 && (
                                    <div className="flex items-center justify-between text-slate-500">
                                      <span>選択済み ({selectedCount}人)</span>
                                      <span>¥{Math.round(selectedCost).toLocaleString()}</span>
                                    </div>
                                  )}
                                  {undecidedCount > 0 && (
                                    <div className="flex items-center justify-between text-slate-500">
                                      <span>未確定 ({undecidedCount}人)</span>
                                      <span>¥{Math.round(undecidedCost).toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                            </div>
                          )}
                          
                          {/* ディレクター内訳 */}
                          {Number(productInfo.directorCount) > 0 && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 font-medium">ディレクター</span>
                                <span className="font-medium text-slate-900">¥{Math.round(directorCost).toLocaleString()}</span>
                              </div>
                            {(() => {
                              const selectedWithoutUndecided = Array.from(productInfo.selectedDirectors).filter(n => n !== "未定")
                              const selectedCount = selectedWithoutUndecided.length
                              const count = Number(productInfo.directorCount) || 0
                              const undecidedCount = count > 0 ? count - selectedCount : 0
                              const selectedCost = selectedWithoutUndecided.reduce((total, name) => {
                                const hourlyRate = directorHourlyRates[name] || 0
                                return total + (hourlyRate * durationHours)
                              }, 0)
                              const undecidedCost = undecidedCount > 0 ? averageDirectorRate * durationHours * undecidedCount : 0
                              
                              return (
                                <div className="pl-4 space-y-1 text-xs">
                                  <div className="text-slate-500 mb-1">
                                    稼働時間: {durationHours.toFixed(1)}時間
                                  </div>
                                  {selectedCount > 0 && (
                                    <div className="flex items-center justify-between text-slate-500">
                                      <span>選択済み ({selectedCount}人)</span>
                                      <span>¥{Math.round(selectedCost).toLocaleString()}</span>
                                    </div>
                                  )}
                                  {undecidedCount > 0 && (
                                    <div className="flex items-center justify-between text-slate-500">
                                      <span>未確定 ({undecidedCount}人)</span>
                                      <span>¥{Math.round(undecidedCost).toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                            </div>
                          )}
                          
                          {/* MC内訳 */}
                          {Number(productInfo.mcCount) > 0 && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 font-medium">MC</span>
                                <span className="font-medium text-slate-900">¥{Math.round(mcCost).toLocaleString()}</span>
                              </div>
                            {(() => {
                              const selectedWithoutUndecided = Array.from(productInfo.selectedMcs).filter(n => n !== "未定")
                              const selectedCount = selectedWithoutUndecided.length
                              const count = Number(productInfo.mcCount) || 0
                              const undecidedCount = count > 0 ? count - selectedCount : 0
                              const selectedCost = selectedWithoutUndecided.reduce((total, name) => {
                                const hourlyRate = mcHourlyRates[name] || 0
                                return total + (hourlyRate * durationHours)
                              }, 0)
                              const undecidedCost = undecidedCount > 0 ? averageMcRate * durationHours * undecidedCount : 0
                              
                              return (
                                <div className="pl-4 space-y-1 text-xs">
                                  <div className="text-slate-500 mb-1">
                                    稼働時間: {durationHours.toFixed(1)}時間
                                  </div>
                                  {selectedCount > 0 && (
                                    <div className="flex items-center justify-between text-slate-500">
                                      <span>選択済み ({selectedCount}人)</span>
                                      <span>¥{Math.round(selectedCost).toLocaleString()}</span>
                                    </div>
                                  )}
                                  {undecidedCount > 0 && (
                                    <div className="flex items-center justify-between text-slate-500">
                                      <span>未確定 ({undecidedCount}人)</span>
                                      <span>¥{Math.round(undecidedCost).toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200">
                          <div className="flex-1">
                            <Label htmlFor={`performanceFeeDiscount-${productInfo.id}`} className="text-sm text-slate-600">
                              割引
                            </Label>
                            <Input
                              id={`performanceFeeDiscount-${productInfo.id}`}
                              type="number"
                              value={productInfo.performanceFeeDiscount}
                              onChange={(e) => updateProductInfo(index, { performanceFeeDiscount: e.target.value })}
                              placeholder="0"
                              className="mt-1"
                            />
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-600 mb-1">割引後</div>
                            <div className="text-xl font-bold text-slate-900">
                              ¥{performanceFeeAfterDiscount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 交通費合計 */}
                    <div className="bg-slate-50/50 border border-slate-200/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold text-slate-900">交通費（合計）</Label>
                        <div className="text-right">
                          <div className="text-xl font-bold text-slate-900">
                            ¥{Math.round(totalTransportationFee).toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {totalCastCount > 0 ? `（${totalCastCount}名 × ¥${Math.round(transportationFeePerPersonValue).toLocaleString()}）` : ""}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 宿泊費合計 */}
                    <div className="bg-slate-50/50 border border-slate-200/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold text-slate-900">宿泊費（合計）</Label>
                        <div className="text-right">
                          <div className="text-xl font-bold text-slate-900">
                            ¥{Math.round(totalAccommodationFee).toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {totalCastCount > 0 ? `（${totalCastCount}名 × ¥${Math.round(accommodationFeePerPersonValue).toLocaleString()}）` : ""}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* イベント基本料金 */}
                    <div className="bg-slate-50/50 border border-slate-200/50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold text-slate-900">
                            イベント基本料金
                          </Label>
                          <div className="text-right">
                            <div className="text-xl font-bold text-slate-900">
                              ¥{Math.round(eventBaseFeeValue).toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              （{productInfo.eventType}）
                            </div>
                          </div>
                        </div>
                        {hallDiscountAmount > 0 && (
                          <div className="pt-2 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm text-slate-600">
                                ホール割引
                              </Label>
                              <div className="text-sm font-semibold text-slate-900">
                                -¥{Math.round(hallDiscountAmount).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-xs text-slate-500">
                              （{hallName}）
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200">
                          <div className="flex-1">
                            <Label htmlFor={`eventBaseFeeDiscount-${productInfo.id}`} className="text-sm text-slate-600">
                              追加割引
                            </Label>
                            <Input
                              id={`eventBaseFeeDiscount-${productInfo.id}`}
                              type="number"
                              value={productInfo.eventBaseFeeDiscount}
                              onChange={(e) => updateProductInfo(index, { eventBaseFeeDiscount: e.target.value })}
                              placeholder="0"
                              className="mt-1"
                            />
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-600 mb-1">割引後</div>
                            <div className="text-xl font-bold text-slate-900">
                              ¥{Math.round(eventBaseFeeAfterDiscount).toLocaleString()}
                            </div>
                          </div>
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
                  </>
                )
              })()}
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
        {!isProductMode && productInfos.length < 5 && (
          <Button
            onClick={addProductInfo}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            商材を追加
          </Button>
        )}
        {/* 修正依頼がある商材編集の場合は「商材を更新」ボタンを表示しない */}
        {!(isProductEditMode && correctionRequest) && (
          <Button
            onClick={handleCreateProjects}
            className="flex items-center gap-2"
          >
            {isProductAddMode ? "商材を追加" : isProductEditMode ? "商材を更新" : isEditMode ? "案件を更新" : "案件を作成"}
          </Button>
        )}
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

      {/* イベントチームへのコメント入力と送信ボタン（修正依頼がある商材編集の場合のみ、一番下に配置） */}
      {isProductEditMode && correctionRequest && correctionComment !== undefined && onCorrectionCommentChange && (
        <Card>
          <CardHeader>
            <CardTitle>イベントチームへのコメント</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="correction-comment">修正内容についてイベントチームに伝えたいことがあれば記入してください（任意）</Label>
              <Textarea
                id="correction-comment"
                value={correctionComment ?? ""}
                onChange={(e) => {
                  if (onCorrectionCommentChange) {
                    onCorrectionCommentChange(e.target.value)
                  }
                }}
                placeholder="修正内容についてイベントチームに伝えたいことがあれば記入してください"
                rows={4}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={onNext} className="gap-2">
                更新してイベントチームへ送信
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

