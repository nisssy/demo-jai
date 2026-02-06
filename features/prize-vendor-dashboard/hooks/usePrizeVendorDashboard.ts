"use client"

import { useState, useMemo, useCallback } from "react"
import { useProject } from "@/contexts/project-context"
import type { PrizeOrderDocument, PrizeDeliveryInfoByVendor } from "@/types/lottery"

export type UsePrizeVendorDashboardArgs = {
  addNotification: (message: string) => void
}

// 商材情報を表す型（発注書付き）
type ProductWithOrder = {
  id: number
  projectName?: string
  projectNumber?: string
  eventDate?: string
  hallNames?: string[]
  order: PrizeOrderDocument
}

export function usePrizeVendorDashboard({ addNotification }: UsePrizeVendorDashboardArgs) {
  const { getProducts, updateProduct } = useProject()

  // 選択された発注
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

  // 配送情報入力モーダル
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [carrierName, setCarrierName] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [shippedAt, setShippedAt] = useState("")

  // 全商材から景品発注書を取得（デモ用：全業者の発注を表示）
  const allProductsWithOrders = useMemo(() => {
    const products = getProducts()
    const result: ProductWithOrder[] = []

    products.forEach((product) => {
      const orders = (product as any).prizeOrdersByVendor as PrizeOrderDocument[] | undefined
      if (orders && orders.length > 0) {
        orders.forEach((order) => {
          result.push({
            id: product.id,
            projectName: (product as any).projectName,
            projectNumber: (product as any).projectNumber,
            eventDate: (product as any).eventDate || (product as any).date,
            hallNames: (product as any).hallNames,
            order,
          })
        })
      }
    })

    return result
  }, [getProducts])

  // ステータスでグループ化（配送情報あり/なし）
  const ordersGroupedByStatus = useMemo(() => {
    const pending: ProductWithOrder[] = []
    const shipped: ProductWithOrder[] = []

    allProductsWithOrders.forEach((item) => {
      const product = getProducts().find((p) => p.id === item.id)
      const deliveryInfo = (product as any)?.prizeDeliveryInfoByVendor as PrizeDeliveryInfoByVendor[] | undefined
      const hasDelivery = deliveryInfo?.some((d) => d.vendorId === item.order.vendorId && d.shippedAt)

      if (hasDelivery) {
        shipped.push(item)
      } else {
        pending.push(item)
      }
    })

    return {
      pending: { label: "配送情報未入力", orders: pending },
      shipped: { label: "配送済み", orders: shipped },
    }
  }, [allProductsWithOrders, getProducts])

  // 選択された発注の詳細
  const selectedOrder = useMemo(() => {
    if (!selectedProductId) return null
    return allProductsWithOrders.find((item) => item.id === selectedProductId) || null
  }, [selectedProductId, allProductsWithOrders])

  // 配送情報を取得
  const getDeliveryInfo = useCallback(
    (productId: number, vendorId: string): PrizeDeliveryInfoByVendor | null => {
      const product = getProducts().find((p) => p.id === productId)
      if (!product) return null

      const deliveryInfos = (product as any).prizeDeliveryInfoByVendor as PrizeDeliveryInfoByVendor[] | undefined
      return deliveryInfos?.find((d) => d.vendorId === vendorId) || null
    },
    [getProducts],
  )

  // 配送情報入力モーダルを開く
  const handleOpenDeliveryModal = useCallback((item: ProductWithOrder) => {
    setSelectedProductId(item.id)

    // 既存の配送情報があれば初期値にセット
    const product = getProducts().find((p) => p.id === item.id)
    const deliveryInfos = (product as any)?.prizeDeliveryInfoByVendor as PrizeDeliveryInfoByVendor[] | undefined
    const existingDelivery = deliveryInfos?.find((d) => d.vendorId === item.order.vendorId)

    if (existingDelivery) {
      setCarrierName(existingDelivery.carrierName || "")
      setTrackingNumber(existingDelivery.trackingNumber || "")
      setShippedAt(existingDelivery.shippedAt || "")
    } else {
      setCarrierName("")
      setTrackingNumber("")
      setShippedAt("")
    }

    setShowDeliveryModal(true)
  }, [getProducts])

  // 配送情報を保存
  const handleSaveDelivery = useCallback(() => {
    if (!selectedOrder || !carrierName.trim() || !trackingNumber.trim() || !shippedAt.trim()) {
      addNotification("すべての項目を入力してください")
      return
    }

    const product = getProducts().find((p) => p.id === selectedOrder.id)
    if (!product) return

    const existingDeliveryInfos = ((product as any).prizeDeliveryInfoByVendor as PrizeDeliveryInfoByVendor[] | undefined) || []
    const existingIndex = existingDeliveryInfos.findIndex((d) => d.vendorId === selectedOrder.order.vendorId)

    const newDeliveryInfo: PrizeDeliveryInfoByVendor = {
      vendorId: selectedOrder.order.vendorId,
      vendorName: selectedOrder.order.vendorName,
      carrierName,
      trackingNumber,
      shippedAt,
      deliveredAt: new Date().toISOString(),
    }

    let updatedDeliveryInfos: PrizeDeliveryInfoByVendor[]
    if (existingIndex >= 0) {
      // 既存の配送情報を更新
      updatedDeliveryInfos = [...existingDeliveryInfos]
      updatedDeliveryInfos[existingIndex] = newDeliveryInfo
    } else {
      // 新規追加
      updatedDeliveryInfos = [...existingDeliveryInfos, newDeliveryInfo]
    }

    updateProduct(selectedOrder.id, {
      prizeDeliveryInfoByVendor: updatedDeliveryInfos,
    })

    addNotification("配送情報を保存しました")
    setShowDeliveryModal(false)
    setCarrierName("")
    setTrackingNumber("")
    setShippedAt("")
  }, [selectedOrder, carrierName, trackingNumber, shippedAt, getProducts, updateProduct, addNotification])

  // 選択をクリア
  const clearSelection = useCallback(() => {
    setSelectedProductId(null)
  }, [])

  return {
    // データ
    allProductsWithOrders,
    ordersGroupedByStatus,
    selectedOrder,
    selectedProductId,
    getDeliveryInfo,

    // 配送情報モーダル
    showDeliveryModal,
    carrierName,
    trackingNumber,
    shippedAt,
    setCarrierName,
    setTrackingNumber,
    setShippedAt,
    handleOpenDeliveryModal,
    handleSaveDelivery,
    setShowDeliveryModal,

    // その他
    setSelectedProductId,
    clearSelection,
  }
}
