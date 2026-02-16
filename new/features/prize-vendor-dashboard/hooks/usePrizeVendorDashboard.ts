import { useState, useEffect, useCallback, useMemo } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Product, PrizeOrderDocument, PrizeDeliveryInfoByVendor, DeliveryInfo } from "@/new/api/types"

// ─── ViewModel types ───

export type OrderEntry = {
  productId: number
  product: Product
  order: PrizeOrderDocument
}

export type DeliveryFormRow = {
  winnerId: string
  winnerName: string
  prize: string
  carrierName: string
  trackingNumber: string
  shippedAt: string
}

export type SelectedKey = {
  productId: number
  vendorId: string
} | null

// ─── Hook ───

export function usePrizeVendorDashboard(repository: ProjectRepository) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedKey, setSelectedKey] = useState<SelectedKey>(null)
  const [deliveryForm, setDeliveryForm] = useState<DeliveryFormRow[]>([])

  // Load products from repository
  const loadProducts = useCallback(() => {
    const allProducts = repository.getProducts()
    setProducts(allProducts)
  }, [repository])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Flatten: for each product, for each order -> entry
  const orderEntries: OrderEntry[] = useMemo(() => {
    const entries: OrderEntry[] = []
    for (const product of products) {
      if (!product.prizeOrdersByVendor || product.prizeOrdersByVendor.length === 0) continue
      for (const order of product.prizeOrdersByVendor) {
        entries.push({ productId: product.id, product, order })
      }
    }
    return entries
  }, [products])

  // Selected entry
  const selectedEntry: OrderEntry | null = useMemo(() => {
    if (!selectedKey) return null
    return orderEntries.find(
      (e) => e.productId === selectedKey.productId && e.order.vendorId === selectedKey.vendorId
    ) ?? null
  }, [orderEntries, selectedKey])

  // Existing delivery info for selected vendor
  const existingDeliveries: DeliveryInfo[] = useMemo(() => {
    if (!selectedEntry) return []
    const product = selectedEntry.product
    const vendorId = selectedEntry.order.vendorId
    const vendorDelivery = product.prizeDeliveryInfoByVendor?.find(
      (d) => d.vendorId === vendorId
    )
    return vendorDelivery?.deliveries ?? []
  }, [selectedEntry])

  // Initialize delivery form when selection changes
  useEffect(() => {
    if (!selectedEntry) {
      setDeliveryForm([])
      return
    }

    const product = selectedEntry.product
    const vendorId = selectedEntry.order.vendorId
    const vendorDelivery = product.prizeDeliveryInfoByVendor?.find(
      (d) => d.vendorId === vendorId
    )

    // Get winners relevant to this vendor's order
    const winnerList = product.winnerList ?? []
    const orderedPrizeNames = selectedEntry.order.prizeItems.map((p) => p.name)

    // Filter winners whose prize matches this vendor's ordered items
    const relevantWinners = winnerList.filter(
      (w) => w.prize && orderedPrizeNames.includes(w.prize)
    )

    if (vendorDelivery?.deliveries && vendorDelivery.deliveries.length > 0) {
      // Populate from existing delivery data
      setDeliveryForm(
        vendorDelivery.deliveries.map((d) => ({
          winnerId: d.winnerId,
          winnerName: d.winnerName,
          prize: relevantWinners.find((w) => w.id === d.winnerId)?.prize ?? "",
          carrierName: d.carrierName ?? "",
          trackingNumber: d.trackingNumber ?? "",
          shippedAt: d.shippedAt ?? "",
        }))
      )
    } else {
      // Initialize empty form from relevant winners
      setDeliveryForm(
        relevantWinners.map((w) => ({
          winnerId: w.id,
          winnerName: w.name,
          prize: w.prize ?? "",
          carrierName: "",
          trackingNumber: "",
          shippedAt: "",
        }))
      )
    }
  }, [selectedEntry])

  // Select an order entry
  const handleSelect = useCallback((productId: number, vendorId: string) => {
    setSelectedKey({ productId, vendorId })
  }, [])

  // Update a delivery form row
  const updateDeliveryFormRow = useCallback(
    (index: number, field: keyof DeliveryFormRow, value: string) => {
      setDeliveryForm((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [field]: value }
        return next
      })
    },
    []
  )

  // Save delivery info
  const handleSaveDelivery = useCallback(() => {
    if (!selectedEntry) return

    const product = selectedEntry.product
    const vendorId = selectedEntry.order.vendorId
    const vendorName = selectedEntry.order.vendorName

    const newDeliveries: DeliveryInfo[] = deliveryForm.map((row) => ({
      winnerId: row.winnerId,
      winnerName: row.winnerName,
      carrierName: row.carrierName || undefined,
      trackingNumber: row.trackingNumber || undefined,
      shippedAt: row.shippedAt || undefined,
    }))

    const existingVendorDeliveries = product.prizeDeliveryInfoByVendor ?? []
    const otherVendors = existingVendorDeliveries.filter((d) => d.vendorId !== vendorId)

    const updatedVendorDelivery: PrizeDeliveryInfoByVendor = {
      vendorId,
      vendorName,
      deliveries: newDeliveries,
    }

    const updatedDeliveryInfo = [...otherVendors, updatedVendorDelivery]

    repository.updateProduct(product.id, {
      prizeDeliveryInfoByVendor: updatedDeliveryInfo,
    })

    loadProducts()
  }, [selectedEntry, deliveryForm, repository, loadProducts])

  return {
    orderEntries,
    selectedKey,
    selectedEntry,
    existingDeliveries,
    deliveryForm,
    handleSelect,
    updateDeliveryFormRow,
    handleSaveDelivery,
  }
}

export type UsePrizeVendorDashboardReturn = ReturnType<typeof usePrizeVendorDashboard>
