import { useState, useEffect, useCallback, useMemo } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { BillingChatMessage } from "@/new/api/types"
import { SEED_DESIGN_VENDORS } from "@/new/api/seed-data"

export function useDesignVendorBilling(repository: ProjectRepository) {
  const [selectedVendorId, setSelectedVendorId] = useState<string>(SEED_DESIGN_VENDORS[0]?.id ?? "V-001")
  const [selectedBillingId, setSelectedBillingId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const vendors = useMemo(() => SEED_DESIGN_VENDORS, [])

  const billings = useMemo(() => {
    return repository.getMonthlyBillingsByVendor(selectedVendorId).filter(
      (b) => b.vendorType === "design"
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository, selectedVendorId, refreshKey])

  const selectedBilling = useMemo(() => {
    if (!selectedBillingId) return null
    return billings.find((b) => b.id === selectedBillingId) ?? null
  }, [billings, selectedBillingId])

  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1)
    window.addEventListener("billing-chat-updated", handler)
    window.addEventListener("storage", handler)
    window.addEventListener("focus", handler)
    return () => {
      window.removeEventListener("billing-chat-updated", handler)
      window.removeEventListener("storage", handler)
      window.removeEventListener("focus", handler)
    }
  }, [])

  const selectedVendorName = useMemo(() => {
    return vendors.find((v) => v.id === selectedVendorId)?.name ?? ""
  }, [vendors, selectedVendorId])

  const requestCorrection = useCallback(
    (billingId: string) => {
      const billing = repository.getMonthlyBillingById(billingId)
      if (!billing || billing.status !== "sent") return
      const now = new Date().toISOString()
      const chatMessage: BillingChatMessage = {
        author: selectedVendorName || "デザイン業者",
        content: "計上データの内容に相違があります。修正をお願いいたします。",
        timestamp: now,
      }
      repository.updateMonthlyBilling(billingId, {
        status: "correction-requested",
        correctionRequestedAt: now,
        updatedAt: now,
        chatMessages: [...(billing.chatMessages ?? []), chatMessage],
      })
      window.dispatchEvent(new CustomEvent("billing-chat-updated", { detail: { billingId } }))
      setRefreshKey((k) => k + 1)
    },
    [repository, selectedVendorName]
  )

  const confirmBilling = useCallback(
    (billingId: string) => {
      const billing = repository.getMonthlyBillingById(billingId)
      if (!billing || billing.status !== "sent") return
      const now = new Date().toISOString()
      const chatMessage: BillingChatMessage = {
        author: selectedVendorName || "デザイン業者",
        content: "計上データの内容を確認しました。問題ございません。",
        timestamp: now,
      }
      repository.updateMonthlyBilling(billingId, {
        status: "confirmed",
        confirmedAt: now,
        updatedAt: now,
        chatMessages: [...(billing.chatMessages ?? []), chatMessage],
      })
      window.dispatchEvent(new CustomEvent("billing-chat-updated", { detail: { billingId } }))
      setRefreshKey((k) => k + 1)
    },
    [repository, selectedVendorName]
  )

  const submitInvoice = useCallback(
    (billingId: string) => {
      const billing = repository.getMonthlyBillingById(billingId)
      if (!billing || billing.status !== "confirmed") return
      const now = new Date().toISOString()
      const chatMessage: BillingChatMessage = {
        author: selectedVendorName || "デザイン業者",
        content: `請求書を送付いたします。\n請求金額: ¥${billing.totalAmount.toLocaleString()}`,
        timestamp: now,
      }
      repository.updateMonthlyBilling(billingId, {
        status: "invoice-received",
        invoiceReceivedAt: now,
        updatedAt: now,
        chatMessages: [...(billing.chatMessages ?? []), chatMessage],
      })
      window.dispatchEvent(new CustomEvent("billing-chat-updated", { detail: { billingId } }))
      setRefreshKey((k) => k + 1)
    },
    [repository, selectedVendorName]
  )

  const acknowledgeAgreement = useCallback(
    (billingId: string) => {
      const billing = repository.getMonthlyBillingById(billingId)
      if (!billing || billing.status !== "agreed") return
      const now = new Date().toISOString()
      const chatMessage: BillingChatMessage = {
        author: selectedVendorName || "デザイン業者",
        content: "合意内容を確認し、了承いたしました。",
        timestamp: now,
      }
      repository.updateMonthlyBilling(billingId, {
        status: "acknowledged",
        acknowledgedAt: now,
        updatedAt: now,
        chatMessages: [...(billing.chatMessages ?? []), chatMessage],
      })
      window.dispatchEvent(new CustomEvent("billing-chat-updated", { detail: { billingId } }))
      setRefreshKey((k) => k + 1)
    },
    [repository, selectedVendorName]
  )

  const sendChatMessage = useCallback(
    (billingId: string, content: string) => {
      const billing = repository.getMonthlyBillingById(billingId)
      if (!billing || !content.trim()) return
      const chatMessage: BillingChatMessage = {
        author: selectedVendorName || "デザイン業者",
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }
      repository.updateMonthlyBilling(billingId, {
        chatMessages: [...(billing.chatMessages ?? []), chatMessage],
        updatedAt: new Date().toISOString(),
      })
      window.dispatchEvent(new CustomEvent("billing-chat-updated", { detail: { billingId } }))
      setRefreshKey((k) => k + 1)
    },
    [repository, selectedVendorName]
  )

  return {
    vendors,
    selectedVendorId,
    setSelectedVendorId,
    selectedVendorName,
    billings,
    selectedBillingId,
    setSelectedBillingId,
    selectedBilling,
    requestCorrection,
    confirmBilling,
    submitInvoice,
    acknowledgeAgreement,
    sendChatMessage,
  }
}
