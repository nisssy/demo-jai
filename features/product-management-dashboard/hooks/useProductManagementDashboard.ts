"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectData } from "@/types/project"
import { useProject } from "@/contexts/project-context"
import type { MachineMaster, BannerEditState, BannerData } from "@/features/product-management-dashboard/model/types"
import {
  MACHINE_MASTERS_STORAGE_KEY,
  INITIAL_MACHINE_MASTERS,
} from "@/features/product-management-dashboard/model/types"
import type { DemoProject } from "@/lib/demo-db/types"

export type UseProductManagementDashboardArgs = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  addNotification: (message: string) => void
}

export type ProductManagementDashboardTab = "project-list" | "machineMaster" | "projectMachines"

function loadMachineMasters(): MachineMaster[] {
  if (typeof window === "undefined") return INITIAL_MACHINE_MASTERS
  try {
    const raw = localStorage.getItem(MACHINE_MASTERS_STORAGE_KEY)
    if (!raw) return INITIAL_MACHINE_MASTERS
    const parsed = JSON.parse(raw) as MachineMaster[]
    if (!Array.isArray(parsed)) return INITIAL_MACHINE_MASTERS

    // 既存のマスタに、INITIAL_MACHINE_MASTERSから不足しているものをマージ
    const existingNames = new Set(parsed.map(m => m.name.toLowerCase()))
    const merged = [...parsed]
    for (const initial of INITIAL_MACHINE_MASTERS) {
      if (!existingNames.has(initial.name.toLowerCase())) {
        merged.push(initial)
      }
    }
    return merged
  } catch {
    return INITIAL_MACHINE_MASTERS
  }
}

function saveMachineMasters(list: MachineMaster[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(MACHINE_MASTERS_STORAGE_KEY, JSON.stringify(list))
  } catch {}
}

/** 開催日（YYYY/MM/DD または YYYY-MM-DD）からバナー用の日付（M/d）と曜日を算出 */
function getDateAndDayOfWeek(eventDate: string | undefined): { date: string; dayOfWeek: string } {
  if (!eventDate || typeof eventDate !== "string") return { date: "2/1", dayOfWeek: "日曜日" }
  const normalized = eventDate.replace(/\//g, "-").trim()
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return { date: "2/1", dayOfWeek: "日曜日" }
  const month = d.getMonth() + 1
  const day = d.getDate()
  const date = `${month}/${day}`
  const dayNames = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"]
  const dayOfWeek = dayNames[d.getDay()] ?? "日曜日"
  return { date, dayOfWeek }
}

/** 機種名から類似の機種マスタを検出（部分一致・前方一致を優先） */
export function findSimilarMachine(
  machineName: string,
  masters: MachineMaster[]
): { master: MachineMaster; score: number } | null {
  const normalized = machineName.trim().toLowerCase()
  if (!normalized) return null
  let best: { master: MachineMaster; score: number } | null = null
  for (const m of masters) {
    const nameNorm = m.name.trim().toLowerCase()
    const pachiNorm = m.pachitownName.trim().toLowerCase()
    let score = 0
    if (nameNorm === normalized || pachiNorm === normalized) score = 100
    else if (nameNorm.includes(normalized) || normalized.includes(nameNorm)) score = 80
    else if (pachiNorm.includes(normalized) || normalized.includes(pachiNorm)) score = 70
    else if (nameNorm.startsWith(normalized) || normalized.startsWith(nameNorm)) score = 60
    if (score > 0 && (!best || score > best.score)) best = { master: m, score }
  }
  return best
}

const DEFAULT_BANNER_EDIT: BannerEditState = {
  productId: null,
  date: "2/1",
  dayOfWeek: "日曜日",
  prefecture: "長野県",
  storeName: "",
  targetMachines: [""],
}

export function useProductManagementDashboard({
  projectData,
  setProjectData,
  addNotification,
}: UseProductManagementDashboardArgs) {
  const router = useAppRouter()
  const searchParams = useSearchParams()
  const { getProducts, getHalls, updateProduct } = useProject()

  // URLパラメータからタブの初期値を取得
  const tabFromUrl = searchParams?.get("tab") as ProductManagementDashboardTab | null

  const [activeTab, setActiveTab] = useState<ProductManagementDashboardTab>(
    tabFromUrl && ["machineMaster", "projectMachines"].includes(tabFromUrl) ? tabFromUrl : "machineMaster"
  )
  const [machineMasters, setMachineMastersState] = useState<MachineMaster[]>(loadMachineMasters)
  const [bannerEdit, setBannerEdit] = useState<BannerEditState>(DEFAULT_BANNER_EDIT)
  const [bannerModalOpen, setBannerModalOpen] = useState(false)
  const [bannerModalProductId, setBannerModalProductId] = useState<number | null>(null)
  const [newMachineName, setNewMachineName] = useState("")
  const [newPachitownName, setNewPachitownName] = useState("")
  const autoConvertDoneRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    saveMachineMasters(machineMasters)
  }, [machineMasters])

  const products = getProducts()

  /** 機種が入力された案件に対して自動でパチタウン用名称に変換（変換結果のみ保存、連携はしない） */
  useEffect(() => {
    if (machineMasters.length === 0) return
    products.forEach((p) => {
      const targetNames = (p as any).targetMachineNames as string[] | undefined
      const current = (p as any).pachitownMachineNames as string[] | undefined
      if (!targetNames?.length || (current?.length ?? 0) > 0) return
      if (autoConvertDoneRef.current.has(p.id)) return
      const converted: string[] = []
      const seen = new Set<string>()
      for (const name of targetNames) {
        const found = findSimilarMachine(name, machineMasters)
        if (found) {
          const pac = found.master.pachitownName
          if (!seen.has(pac)) {
            seen.add(pac)
            converted.push(pac)
          }
        }
      }
      if (converted.length > 0) {
        autoConvertDoneRef.current.add(p.id)
        updateProduct(p.id, { pachitownMachineNames: converted })
      }
    })
  }, [products, machineMasters, updateProduct])

  const addMachineMaster = useCallback(() => {
    const name = newMachineName.trim()
    const pachitownName = newPachitownName.trim()
    if (!name || !pachitownName) return
    const maxId = Math.max(0, ...machineMasters.map((m) => m.id))
    setMachineMastersState((prev) => [...prev, { id: maxId + 1, name, pachitownName }])
    setNewMachineName("")
    setNewPachitownName("")
    addNotification("機種マスタを追加しました")
  }, [machineMasters, newMachineName, newPachitownName, addNotification])

  const updateMachineMaster = useCallback((id: number, updates: Partial<Pick<MachineMaster, "name" | "pachitownName">>) => {
    setMachineMastersState((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    )
    addNotification("機種マスタを更新しました")
  }, [addNotification])

  const removeMachineMaster = useCallback((id: number) => {
    setMachineMastersState((prev) => prev.filter((m) => m.id !== id))
    addNotification("機種マスタを削除しました")
  }, [addNotification])

  const openBannerModal = useCallback((product: DemoProject) => {
    const existing = (product as any).bannerData
    const pachitownNames = (product as any).pachitownMachineNames as string[] | undefined
    const targetNames = (product as any).targetMachineNames as string[] | undefined
    const machineList =
      pachitownNames?.length ? pachitownNames : targetNames?.length ? targetNames : []

    // 案件情報から自動決定: 日付＝開催日、曜日＝開催日から算出、都道府県＝ホール、店舗名＝ホール名
    const eventDate = (product as any).eventDate as string | undefined
    const { date, dayOfWeek } = getDateAndDayOfWeek(eventDate)
    const hallName = (product as any).hallName as string | undefined
    const halls = getHalls()
    const hall = hallName ? halls.find((h) => h.name === hallName) : undefined
    const prefecture = hall?.prefecture ?? DEFAULT_BANNER_EDIT.prefecture
    const storeName = hallName ?? ""

    // 既存バナーがあれば取材対象機種は引き継ぎ、なければ案件の機種リストを使用
    const hasNewFormat =
      existing &&
      typeof (existing as any).date === "string" &&
      typeof (existing as any).storeName === "string"
    const existingMachines = hasNewFormat && Array.isArray((existing as any).targetMachines)
      ? (existing as any).targetMachines
      : null
    const targetMachines =
      existingMachines?.length
        ? existingMachines
        : machineList.length
          ? machineList
          : [""]

    setBannerEdit({
      ...DEFAULT_BANNER_EDIT,
      productId: product.id,
      date,
      dayOfWeek,
      prefecture,
      storeName,
      targetMachines,
    })
    setBannerModalProductId(product.id)
    setBannerModalOpen(true)
  }, [getHalls])

  const closeBannerModal = useCallback(() => {
    if (bannerModalProductId != null) {
      const data: BannerData = {
        date: bannerEdit.date,
        dayOfWeek: bannerEdit.dayOfWeek,
        prefecture: bannerEdit.prefecture,
        storeName: bannerEdit.storeName,
        targetMachines: bannerEdit.targetMachines.filter((s) => s.trim()),
      }
      updateProduct(bannerModalProductId, { bannerGenerated: true, bannerData: data })
      addNotification("バナーを作成しました。パチタウン連携ボタンから連携できます。")
    }
    setBannerModalOpen(false)
    setBannerModalProductId(null)
  }, [bannerModalProductId, bannerEdit, updateProduct, addNotification])

  const updateBannerEdit = useCallback((updates: Partial<BannerEditState>) => {
    setBannerEdit((prev) => ({ ...prev, ...updates }))
  }, [])

  const handlePachitownLink = useCallback(
    (productId: number) => {
      const linkedDate = new Date().toISOString().split("T")[0]
      updateProduct(productId, { pachitownLinked: true, pachitownLinkedDate: linkedDate })
      addNotification("パチタウンに連携しました。")
    },
    [updateProduct, addNotification]
  )

  // 変換後の機種名編集
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [editingMachineIndex, setEditingMachineIndex] = useState<number | null>(null)
  const [editingMachineName, setEditingMachineName] = useState("")

  const handleStartEditMachine = useCallback((productId: number, index: number, currentName: string) => {
    setEditingProductId(productId)
    setEditingMachineIndex(index)
    setEditingMachineName(currentName)
  }, [])

  const handleEditMachineNameChange = useCallback((value: string) => {
    setEditingMachineName(value)
  }, [])

  const handleSaveEditMachine = useCallback((productId: number, index: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const pachitownMachineNames = [...((product as any).pachitownMachineNames || [])]
    pachitownMachineNames[index] = editingMachineName.trim()

    updateProduct(productId, { pachitownMachineNames })
    setEditingProductId(null)
    setEditingMachineIndex(null)
    setEditingMachineName("")
    addNotification("機種名を更新しました。")
  }, [products, editingMachineName, updateProduct, addNotification])

  const handleCancelEditMachine = useCallback(() => {
    setEditingProductId(null)
    setEditingMachineIndex(null)
    setEditingMachineName("")
  }, [])

  // タブ変更時にURLを更新する関数
  const handleActiveTabChange = useCallback((tab: ProductManagementDashboardTab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("tab", tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  return {
    activeTab,
    setActiveTab: handleActiveTabChange,
    products,
    machineMasters,
    newMachineName,
    setNewMachineName,
    newPachitownName,
    setNewPachitownName,
    addMachineMaster,
    updateMachineMaster,
    removeMachineMaster,
    openBannerModal,
    closeBannerModal,
    bannerModalOpen,
    setBannerModalOpen,
    bannerEdit,
    updateBannerEdit,
    handlePachitownLink,
    addNotification,
    // 機種名編集
    editingProductId,
    editingMachineIndex,
    editingMachineName,
    handleStartEditMachine,
    handleEditMachineNameChange,
    handleSaveEditMachine,
    handleCancelEditMachine,
  }
}
