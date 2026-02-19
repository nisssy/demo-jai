import { useState, useEffect, useCallback, useMemo } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Product, PrizeOrderDocument, WinnerInfo, DesignRequest } from "@/new/api/types"
import { SEED_DESIGN_VENDORS } from "@/new/api/seed-data"

// ─── ViewModel Types ───

export interface ProductListItem {
  id: number
  projectNumber: string
  eventProductName: string
  hallNames: string[]
  eventStartDate?: string
  eventEndDate?: string
}

export interface DesignVendorOption {
  id: string
  name: string
}

// ─── Hook ───

/** デモ用の氏名・住所・電話のプール */
const DEMO_PEOPLE = [
  { name: "山田太郎", address: "東京都渋谷区1-1-1", phone: "090-1234-5678" },
  { name: "佐藤花子", address: "神奈川県横浜市2-2-2", phone: "080-2345-6789" },
  { name: "鈴木一郎", address: "大阪府大阪市3-3-3", phone: "070-3456-7890" },
  { name: "高橋美咲", address: "北海道札幌市4-4-4", phone: "090-9876-5432" },
  { name: "伊藤健太", address: "福岡県福岡市5-5-5", phone: "080-8765-4321" },
  { name: "渡辺さくら", address: "愛知県名古屋市6-6-6", phone: "070-7654-3210" },
  { name: "小林大輔", address: "宮城県仙台市7-7-7", phone: "090-6543-2109" },
  { name: "加藤優子", address: "広島県広島市8-8-8", phone: "080-5432-1098" },
]

export function useLotteryAdminDashboard(repository: ProjectRepository) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [winnerListHasError, setWinnerListHasError] = useState(false)
  const [notificationCommentText, setNotificationCommentText] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  // Notification: selected vendor (Step 1, before send)
  const [selectedNotificationVendor, setSelectedNotificationVendor] = useState<{ id: string; name: string } | null>(null)
  // Prize order: desired delivery date
  const [desiredDeliveryDate, setDesiredDeliveryDate] = useState("")
  // Send confirmation modal states
  const [pendingNotificationVendor, setPendingNotificationVendor] = useState<{ id: string; name: string } | null>(null)
  const [pendingPrizeVendorId, setPendingPrizeVendorId] = useState<string | null>(null)

  // ─── Data Loading ───

  const loadProducts = useCallback(() => {
    const allProducts = repository.getProducts()
    const lotteryProducts = allProducts.filter(
      (p) =>
        p.category === "ポイント" &&
        p.eventType === "合同抽選会" &&
        p.prizeInfo &&
        p.prizeInfo.length > 0
    )
    setProducts(lotteryProducts)
  }, [repository])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // ─── Derived Data ───

  const productList: ProductListItem[] = useMemo(() => {
    return products.map((p) => ({
      id: p.id,
      projectNumber: p.projectNumber,
      eventProductName: p.eventProductName,
      hallNames: p.hallNames ?? [],
      eventStartDate: p.eventStartDate,
      eventEndDate: p.eventEndDate,
    }))
  }, [products])

  const selectedProduct = useMemo(() => {
    if (selectedProductId === null) return null
    return products.find((p) => p.id === selectedProductId) ?? null
  }, [products, selectedProductId])

  const designVendors: DesignVendorOption[] = useMemo(() => {
    return SEED_DESIGN_VENDORS.map((v) => ({ id: v.id, name: v.name }))
  }, [])

  /** 選択中商材の当選通知書デザイン依頼 */
  const notificationDesignRequests: DesignRequest[] = useMemo(() => {
    if (!selectedProduct) return []
    return repository
      .getDesignRequestsByProjectId(selectedProduct.id)
      .filter((r) => r.requestType === "winner-list")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository, selectedProduct?.id, refreshKey])

  // ─── Handlers ───

  const selectProduct = useCallback((id: number) => {
    setSelectedProductId(id)
    setNotificationCommentText("")
    setSelectedNotificationVendor(null)
  }, [])

  /** 景品情報に基づいてデモ当選者リストを生成 */
  const generateDemoWinners = useCallback((prizeInfo: Product["prizeInfo"]): WinnerInfo[] => {
    const winners: WinnerInfo[] = []
    let id = 1
    let personIndex = 0
    if (!prizeInfo || prizeInfo.length === 0) {
      DEMO_PEOPLE.slice(0, 3).forEach((p) => {
        winners.push({ id: String(id++), name: p.name, address: p.address, phone: p.phone, prize: "（景品未設定）" })
      })
      return winners
    }
    for (const prize of prizeInfo) {
      const qty = Math.max(0, parseInt(prize.quantity, 10) || 0)
      const prizeName = prize.name?.trim() || "（景品名未設定）"
      for (let i = 0; i < qty; i++) {
        const p = DEMO_PEOPLE[personIndex % DEMO_PEOPLE.length]
        winners.push({ id: String(id++), name: p.name, address: p.address, phone: p.phone, prize: prizeName })
        personIndex++
      }
    }
    return winners.length > 0 ? winners : [{ id: "1", ...DEMO_PEOPLE[0], prize: "（景品未設定）" }]
  }, [])

  /** PSP連携: 正常データを同期（アップロード＋検証完了） */
  const uploadWinnerListPsp = useCallback(() => {
    if (!selectedProduct) return
    const now = new Date().toISOString()
    const winnerList = generateDemoWinners(selectedProduct.prizeInfo)
    repository.updateProduct(selectedProduct.id, {
      winnerList,
      winnerListUploadedAt: now,
      winnerListValidatedAt: now,
    })
    setWinnerListHasError(false)
    loadProducts()
  }, [selectedProduct, repository, loadProducts, generateDemoWinners])

  /** PSP連携: 異常データを同期（アップロードのみ、検証なし） */
  const uploadWinnerListPspWithError = useCallback(() => {
    if (!selectedProduct) return
    const now = new Date().toISOString()
    const winnerList = generateDemoWinners(selectedProduct.prizeInfo)
    repository.updateProduct(selectedProduct.id, {
      winnerList,
      winnerListUploadedAt: now,
    })
    setWinnerListHasError(true)
    loadProducts()
  }, [selectedProduct, repository, loadProducts, generateDemoWinners])

  /** ファイルアップロード（正常データと同じ扱い） */
  const uploadWinnerListFile = useCallback(() => {
    if (!selectedProduct) return
    const now = new Date().toISOString()
    const winnerList = generateDemoWinners(selectedProduct.prizeInfo)
    repository.updateProduct(selectedProduct.id, {
      winnerList,
      winnerListUploadedAt: now,
      winnerListValidatedAt: now,
    })
    setWinnerListHasError(false)
    loadProducts()
  }, [selectedProduct, repository, loadProducts, generateDemoWinners])

  /** 当選者リストをリセット */
  const resetWinnerList = useCallback(() => {
    if (!selectedProduct) return
    repository.updateProduct(selectedProduct.id, {
      winnerList: undefined,
      winnerListUploadedAt: undefined,
      winnerListValidatedAt: undefined,
    })
    setWinnerListHasError(false)
    loadProducts()
  }, [selectedProduct, repository, loadProducts])

  /** エラー表示を消す（再アップロード依頼） */
  const dismissWinnerListError = useCallback(() => {
    setWinnerListHasError(false)
  }, [])

  const validateWinnerList = useCallback(() => {
    if (!selectedProduct) return
    repository.updateProduct(selectedProduct.id, {
      winnerListValidatedAt: new Date().toISOString(),
    })
    setWinnerListHasError(false)
    loadProducts()
  }, [selectedProduct, repository, loadProducts])

  const generateNotificationOrder = useCallback(() => {
    if (!selectedProduct) return
    repository.updateProduct(selectedProduct.id, {
      notificationOrderGeneratedAt: new Date().toISOString(),
    })
    loadProducts()
  }, [selectedProduct, repository, loadProducts])

  /** 当選通知書: Step 1 業者選択（記憶するだけ） */
  const selectNotificationVendor = useCallback(
    (vendorId: string, vendorName: string) => {
      setSelectedNotificationVendor({ id: vendorId, name: vendorName })
    },
    []
  )

  /** 当選通知書: Step 3 送信ボタン → モーダル表示 */
  const requestSendNotificationOrder = useCallback(() => {
    if (!selectedNotificationVendor) return
    setPendingNotificationVendor(selectedNotificationVendor)
  }, [selectedNotificationVendor])

  /** 当選通知書: モーダルで確認 → 送信実行 */
  const confirmSendNotificationOrder = useCallback(() => {
    if (!selectedProduct || !pendingNotificationVendor) return
    const { id: vendorId, name: vendorName } = pendingNotificationVendor
    const now = new Date().toISOString()
    repository.updateProduct(selectedProduct.id, {
      notificationOrderSentAt: now,
      notificationOrderDesignVendorId: vendorId,
      notificationOrderDesignVendorName: vendorName,
    })
    repository.createDesignRequest({
      requestType: "winner-list",
      projectId: selectedProduct.id,
      projectNumber: selectedProduct.projectNumber,
      projectName: selectedProduct.eventProductName,
      companyName: "",
      hallNames: selectedProduct.hallNames ?? [],
      eventStartDate: selectedProduct.eventStartDate,
      eventEndDate: selectedProduct.eventEndDate,
      status: "requested",
      vendorId,
      vendorName,
      requestedAt: now,
      requestedBy: "admin",
      requestedByName: "事務管理課",
      comments: [],
      prizeInfo: selectedProduct.prizeInfo,
    })
    setPendingNotificationVendor(null)
    setRefreshKey((k) => k + 1)
    loadProducts()
  }, [selectedProduct, pendingNotificationVendor, repository, loadProducts])

  /** 当選通知書: モーダルキャンセル */
  const cancelSendNotificationOrder = useCallback(() => {
    setPendingNotificationVendor(null)
  }, [])

  const addNotificationComment = useCallback(
    (requestId: string, text: string) => {
      if (!text.trim()) return
      repository.addDesignRequestComment(requestId, text.trim(), "Sales", "事務管理課")
      setNotificationCommentText("")
      setRefreshKey((k) => k + 1)
      window.dispatchEvent(new CustomEvent("chat-updated"))
    },
    [repository]
  )

  const generatePrizeOrders = useCallback(() => {
    if (!selectedProduct || !selectedProduct.prizeInfo) return
    const grouped: Record<string, PrizeOrderDocument> = {}
    for (const prize of selectedProduct.prizeInfo) {
      const vId = prize.vendorId ?? "unknown"
      const vName = prize.vendorName ?? "不明"
      if (!grouped[vId]) {
        grouped[vId] = {
          vendorId: vId,
          vendorName: vName,
          requestedAt: "",
          desiredDeliveryDate: desiredDeliveryDate || undefined,
          prizeItems: [],
        }
      }
      grouped[vId].prizeItems.push(prize)
    }
    const prizeOrdersByVendor = Object.values(grouped)
    repository.updateProduct(selectedProduct.id, {
      prizeOrdersByVendor,
      prizeOrderGeneratedAt: new Date().toISOString(),
    })
    loadProducts()
  }, [selectedProduct, repository, loadProducts, desiredDeliveryDate])

  /** 景品発注: 送信ボタン → モーダル表示 */
  const requestSendPrizeOrder = useCallback((vendorId: string) => {
    setPendingPrizeVendorId(vendorId)
  }, [])

  /** 景品発注: モーダルで確認 → 送信実行 */
  const confirmSendPrizeOrder = useCallback(() => {
    if (!selectedProduct || !selectedProduct.prizeOrdersByVendor || !pendingPrizeVendorId) return
    const now = new Date().toISOString()
    const updated = selectedProduct.prizeOrdersByVendor.map((o) =>
      o.vendorId === pendingPrizeVendorId ? { ...o, requestedAt: now } : o
    )
    const allSent = updated.every((o) => !!o.requestedAt)
    repository.updateProduct(selectedProduct.id, {
      prizeOrdersByVendor: updated,
      ...(allSent ? { prizeOrderRequestedAt: now } : {}),
    })
    setPendingPrizeVendorId(null)
    loadProducts()
  }, [selectedProduct, pendingPrizeVendorId, repository, loadProducts])

  /** 景品発注: モーダルキャンセル */
  const cancelSendPrizeOrder = useCallback(() => {
    setPendingPrizeVendorId(null)
  }, [])

  return {
    // List
    productList,
    selectedProductId,
    selectProduct,
    // Selected product detail
    selectedProduct,
    // Winner list
    uploadWinnerListPsp,
    uploadWinnerListPspWithError,
    uploadWinnerListFile,
    resetWinnerList,
    dismissWinnerListError,
    winnerListHasError,
    validateWinnerList,
    // Notification order
    generateNotificationOrder,
    selectNotificationVendor,
    selectedNotificationVendor,
    requestSendNotificationOrder,
    confirmSendNotificationOrder,
    cancelSendNotificationOrder,
    pendingNotificationVendor,
    designVendors,
    notificationDesignRequests,
    notificationCommentText,
    setNotificationCommentText,
    addNotificationComment,
    // Prize orders
    generatePrizeOrders,
    desiredDeliveryDate,
    setDesiredDeliveryDate,
    requestSendPrizeOrder,
    confirmSendPrizeOrder,
    cancelSendPrizeOrder,
    pendingPrizeVendorId,
  }
}

export type UseLotteryAdminDashboardReturn = ReturnType<typeof useLotteryAdminDashboard>
