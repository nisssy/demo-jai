"use client"

import { useState, useMemo, useCallback } from "react"
import { useProject } from "@/contexts/project-context"
import type { DesignRequest, PrizeOrderDocument } from "@/types/lottery"

export type UseLotteryAdminDashboardArgs = {
  addNotification: (message: string) => void
}

// 合同抽選会商材を表す型
type LotteryProduct = {
  id: number
  projectNumber?: string
  projectName?: string
  hallNames?: string[]
  eventStartDate?: string
  eventEndDate?: string
  area?: string
  prizeInfo?: any[]
  winnerListUploadedAt?: string
  prizeOrdersByVendor?: PrizeOrderDocument[]
}

export function useLotteryAdminDashboard({ addNotification }: UseLotteryAdminDashboardArgs) {
  const { getProducts, updateProduct, createDesignRequest, getDesignRequests, getTradingPartners } = useProject()

  // タブ状態
  const [activeTab, setActiveTab] = useState<"projects" | "designs" | "prizes">("projects")

  // 選択された商材
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

  // 当選者リストアップロードモーダル
  const [showWinnerListModal, setShowWinnerListModal] = useState(false)
  const [winnerListFile, setWinnerListFile] = useState("")

  // デザイン依頼作成モーダル
  const [showDesignRequestModal, setShowDesignRequestModal] = useState(false)
  const [designRequestType, setDesignRequestType] = useState<DesignRequest["requestType"]>("poster")
  const [designVendorId, setDesignVendorId] = useState("")

  // 景品発注モーダル
  const [showPrizeOrderModal, setShowPrizeOrderModal] = useState(false)

  // 合同抽選会の商材のみを取得（category === "ポイント" && eventType === "合同抽選会" && prizeInfo あり）
  const lotteryProducts = useMemo(() => {
    const products = getProducts()
    return products
      .filter((p) => {
        const category = (p as any).category
        const eventType = (p as any).eventType
        const prizeInfo = (p as any).prizeInfo
        // 景品情報が入力されている案件のみ
        return category === "ポイント" && eventType === "合同抽選会" && prizeInfo && prizeInfo.length > 0
      })
      .map((p) => ({
        id: p.id,
        projectNumber: (p as any).projectNumber,
        projectName: (p as any).projectName,
        hallNames: (p as any).hallNames,
        eventStartDate: (p as any).eventStartDate,
        eventEndDate: (p as any).eventEndDate,
        area: (p as any).area,
        prizeInfo: (p as any).prizeInfo,
        winnerListUploadedAt: (p as any).winnerListUploadedAt,
        prizeOrdersByVendor: (p as any).prizeOrdersByVendor,
      })) as LotteryProduct[]
  }, [getProducts])

  // 選択された商材
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null
    return lotteryProducts.find((p) => p.id === selectedProductId) || null
  }, [selectedProductId, lotteryProducts])

  // デザイン依頼一覧
  const allDesignRequests = useMemo(() => {
    return getDesignRequests()
  }, [getDesignRequests])

  // デザイン業者一覧
  const designVendors = useMemo(() => {
    return getTradingPartners().filter((tp) => tp.industry === "design")
  }, [getTradingPartners])

  // 当選者リストアップロード
  const handleUploadWinnerList = useCallback(() => {
    if (!selectedProduct || !winnerListFile.trim()) {
      addNotification("ファイル名を入力してください")
      return
    }

    updateProduct(selectedProduct.id, {
      winnerListUploadedAt: new Date().toISOString(),
      winnerList: [
        { id: "w1", name: "山田太郎", address: "東京都渋谷区...", phone: "090-1234-5678", prize: "液晶テレビ 50インチ" },
        { id: "w2", name: "鈴木花子", address: "東京都新宿区...", phone: "080-9876-5432", prize: "ノートパソコン" },
        { id: "w3", name: "佐藤次郎", address: "神奈川県横浜市...", phone: "070-1111-2222", prize: "掃除機ロボット" },
      ],
    })

    addNotification("当選者リストをアップロードしました（デモ用：3名登録）")
    setShowWinnerListModal(false)
    setWinnerListFile("")
  }, [selectedProduct, winnerListFile, updateProduct, addNotification])

  // デザイン依頼作成
  const handleCreateDesignRequest = useCallback(() => {
    if (!selectedProduct || !designVendorId) {
      addNotification("デザイン業者を選択してください")
      return
    }

    const vendor = designVendors.find((v) => v.id === Number.parseInt(designVendorId))
    if (!vendor) return

    const newRequest = createDesignRequest({
      requestType: designRequestType,
      projectId: selectedProduct.id,
      projectNumber: selectedProduct.projectNumber,
      projectName: selectedProduct.projectName || "",
      companyName: "", // 必要に応じて取得
      hallNames: selectedProduct.hallNames || [],
      eventStartDate: selectedProduct.eventStartDate,
      eventEndDate: selectedProduct.eventEndDate,
      requestedAt: new Date().toISOString(),
      requestedBy: "LotteryAdmin",
      requestedByName: "事務管理課",
      status: "requested",
      vendorId: vendor.id.toString(),
      vendorName: vendor.name,
      comments: [],
      prizeInfo: selectedProduct.prizeInfo,
    })

    addNotification(`${vendor.name}にデザイン依頼を作成しました`)
    setShowDesignRequestModal(false)
    setDesignRequestType("poster")
    setDesignVendorId("")
  }, [selectedProduct, designVendorId, designRequestType, designVendors, createDesignRequest, addNotification])

  // 景品発注書生成
  const handleGeneratePrizeOrder = useCallback(() => {
    if (!selectedProduct || !selectedProduct.prizeInfo || selectedProduct.prizeInfo.length === 0) {
      addNotification("景品情報が登録されていません")
      return
    }

    // 景品を業者ごとにグループ化
    const ordersByVendor: PrizeOrderDocument[] = []
    const vendorMap = new Map<string, any[]>()

    selectedProduct.prizeInfo.forEach((prize: any) => {
      if (!prize.vendorId) return
      if (!vendorMap.has(prize.vendorId)) {
        vendorMap.set(prize.vendorId, [])
      }
      vendorMap.get(prize.vendorId)!.push(prize)
    })

    vendorMap.forEach((prizes, vendorId) => {
      const vendorName = prizes[0]?.vendorName || `業者${vendorId}`
      ordersByVendor.push({
        vendorId,
        vendorName,
        requestedAt: new Date().toISOString(),
        prizeItems: prizes,
      })
    })

    updateProduct(selectedProduct.id, {
      prizeOrdersByVendor: ordersByVendor,
      prizeOrderGeneratedAt: new Date().toISOString(),
    })

    addNotification(`景品発注書を生成しました（${ordersByVendor.length}業者）`)
    setShowPrizeOrderModal(false)
  }, [selectedProduct, updateProduct, addNotification])

  // 選択をクリア
  const clearSelection = useCallback(() => {
    setSelectedProductId(null)
  }, [])

  return {
    // タブ
    activeTab,
    setActiveTab,

    // データ
    lotteryProducts,
    selectedProduct,
    selectedProductId,
    allDesignRequests,
    designVendors,

    // 当選者リストモーダル
    showWinnerListModal,
    winnerListFile,
    setWinnerListFile,
    setShowWinnerListModal,
    handleUploadWinnerList,

    // デザイン依頼モーダル
    showDesignRequestModal,
    designRequestType,
    designVendorId,
    setDesignRequestType,
    setDesignVendorId,
    setShowDesignRequestModal,
    handleCreateDesignRequest,

    // 景品発注モーダル
    showPrizeOrderModal,
    setShowPrizeOrderModal,
    handleGeneratePrizeOrder,

    // その他
    setSelectedProductId,
    clearSelection,
  }
}
