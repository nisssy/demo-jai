import { useState, useEffect, useCallback, useMemo } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Product, DesignRequest, PrizeOrderDocument, WinnerInfo, PrizeDeliveryInfoByVendor } from "@/new/api/types"
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

export function useLotteryAdminDashboard(repository: ProjectRepository) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [designRequests, setDesignRequests] = useState<DesignRequest[]>([])
  const [commentText, setCommentText] = useState("")

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

  const loadDesignRequests = useCallback(
    (productId: number) => {
      const product = products.find((p) => p.id === productId)
      if (!product) {
        setDesignRequests([])
        return
      }
      const requests = repository.getDesignRequestsByProjectId(product.projectId)
      setDesignRequests(requests)
    },
    [repository, products]
  )

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (selectedProductId !== null) {
      loadDesignRequests(selectedProductId)
    } else {
      setDesignRequests([])
    }
  }, [selectedProductId, loadDesignRequests])

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

  // ─── Handlers ───

  const selectProduct = useCallback((id: number) => {
    setSelectedProductId(id)
    setCommentText("")
  }, [])

  const uploadWinnerList = useCallback(() => {
    if (!selectedProduct) return
    const dummyWinners: WinnerInfo[] = [
      { id: "W-001", name: "当選者A", address: "東京都渋谷区1-1-1", phone: "090-1111-1111", prize: "特賞" },
      { id: "W-002", name: "当選者B", address: "東京都新宿区2-2-2", phone: "090-2222-2222", prize: "1等" },
      { id: "W-003", name: "当選者C", address: "東京都豊島区3-3-3", phone: "090-3333-3333", prize: "1等" },
      { id: "W-004", name: "当選者D", address: "東京都港区4-4-4", phone: "090-4444-4444", prize: "2等" },
      { id: "W-005", name: "当選者E", address: "東京都品川区5-5-5", phone: "090-5555-5555", prize: "3等" },
    ]
    repository.updateProduct(selectedProduct.id, {
      winnerList: dummyWinners,
      winnerListUploadedAt: new Date().toISOString(),
    })
    loadProducts()
  }, [selectedProduct, repository, loadProducts])

  const validateWinnerList = useCallback(() => {
    if (!selectedProduct) return
    repository.updateProduct(selectedProduct.id, {
      winnerListValidatedAt: new Date().toISOString(),
    })
    loadProducts()
  }, [selectedProduct, repository, loadProducts])

  const generateNotificationOrder = useCallback(() => {
    if (!selectedProduct) return
    repository.updateProduct(selectedProduct.id, {
      notificationOrderGeneratedAt: new Date().toISOString(),
    })
    loadProducts()
  }, [selectedProduct, repository, loadProducts])

  const sendNotificationOrder = useCallback(
    (vendorId: string, vendorName: string) => {
      if (!selectedProduct) return
      repository.updateProduct(selectedProduct.id, {
        notificationOrderSentAt: new Date().toISOString(),
        notificationOrderDesignVendorId: vendorId,
        notificationOrderDesignVendorName: vendorName,
      })
      loadProducts()
    },
    [selectedProduct, repository, loadProducts]
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
          requestedAt: new Date().toISOString(),
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
  }, [selectedProduct, repository, loadProducts])

  const sendPrizeOrder = useCallback(() => {
    if (!selectedProduct) return
    repository.updateProduct(selectedProduct.id, {
      prizeOrderRequestedAt: new Date().toISOString(),
    })
    loadProducts()
  }, [selectedProduct, repository, loadProducts])

  const checkQuoCardLetter = useCallback(() => {
    if (!selectedProduct) return
    repository.updateProduct(selectedProduct.id, {
      quoCardLetterCheckedAt: new Date().toISOString(),
    })
    loadProducts()
  }, [selectedProduct, repository, loadProducts])

  const addComment = useCallback(
    (requestId: string) => {
      if (!commentText.trim()) return
      repository.addDesignRequestComment(requestId, commentText.trim(), "Admin", "事務管理課")
      setCommentText("")
      if (selectedProductId !== null) {
        loadDesignRequests(selectedProductId)
      }
    },
    [commentText, repository, selectedProductId, loadDesignRequests]
  )

  return {
    // List
    productList,
    selectedProductId,
    selectProduct,
    // Selected product detail
    selectedProduct,
    // Winner list
    uploadWinnerList,
    validateWinnerList,
    // Notification order
    generateNotificationOrder,
    sendNotificationOrder,
    designVendors,
    // Prize orders
    generatePrizeOrders,
    sendPrizeOrder,
    // QuoCard
    checkQuoCardLetter,
    // Design requests
    designRequests,
    commentText,
    setCommentText,
    addComment,
  }
}

export type UseLotteryAdminDashboardReturn = ReturnType<typeof useLotteryAdminDashboard>
