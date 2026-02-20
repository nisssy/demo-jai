import { useState, useEffect, useCallback, useMemo } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { DesignRequest, ChatMessage } from "@/new/api/types"

export function useDesignVendorDashboard(repository: ProjectRepository) {
  const [allRequests, setAllRequests] = useState<DesignRequest[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadRequests = useCallback(() => {
    const requests = repository.getAllDesignRequests()
    setAllRequests(requests)
  }, [repository])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  // chat-updated イベントでチャットを再読み込み
  useEffect(() => {
    const handleChatUpdated = () => {
      setRefreshKey((k) => k + 1)
      loadRequests()
    }
    window.addEventListener("chat-updated", handleChatUpdated)
    window.addEventListener("storage", handleChatUpdated)
    window.addEventListener("focus", handleChatUpdated)
    return () => {
      window.removeEventListener("chat-updated", handleChatUpdated)
      window.removeEventListener("storage", handleChatUpdated)
      window.removeEventListener("focus", handleChatUpdated)
    }
  }, [loadRequests])

  const requestedRequests = useMemo(() => {
    return allRequests.filter((r) => r.status === "requested")
  }, [allRequests])

  const uploadedRequests = useMemo(() => {
    return allRequests.filter((r) => r.status === "uploaded")
  }, [allRequests])

  const selectedRequest = useMemo(() => {
    if (!selectedRequestId) return null
    return allRequests.find((r) => r.id === selectedRequestId) ?? null
  }, [allRequests, selectedRequestId])

  // 選択中のリクエストに対応するチャットメッセージ
  const chatMessages = useMemo(() => {
    if (!selectedRequest) return []
    const channel = selectedRequest.requestType // "poster" | "dm" | "winner-list"

    // 当選通知書: DesignRequest.comments から変換
    if (channel === "winner-list") {
      if (!selectedRequest.comments) return []
      return selectedRequest.comments.map((c): ChatMessage => ({
        channel: "winner-list",
        author: c.role === "Sales" ? (c.authorName ?? "事務管理課") : (c.authorName ?? "デザイン業者"),
        content: c.text,
        timestamp: c.createdAt,
      }))
    }

    // ポスター・DM: Product.chatMessages からフィルタ
    const product = repository.getProducts().find(
      (p) => p.projectId === selectedRequest.projectId && p.category === "ポイント"
    )
    if (!product?.chatMessages) return []
    return product.chatMessages.filter((m) => m.channel === channel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRequest, repository, refreshKey])

  const handleSelectRequest = useCallback((id: string) => {
    setSelectedRequestId(id)
  }, [])

  const handleFileUpload = useCallback(
    (id: string) => {
      const now = new Date().toISOString()
      const request = allRequests.find((r) => r.id === id)
      repository.updateDesignRequest(id, {
        status: "uploaded",
        uploadedFileName: "design_v1.pdf",
        uploadedAt: now,
      })

      if (request) {
        if (request.requestType === "winner-list") {
          // 当選通知書: DesignRequest コメントとして自動メッセージ
          const vendorName = request.vendorName ?? "デザイン業者"
          repository.addDesignRequestComment(id, "当選通知書の初稿をアップロードしました。ご確認ください。", "DesignVendor", vendorName)
          window.dispatchEvent(new CustomEvent("chat-updated"))
        } else if (request.requestType === "poster" || request.requestType === "dm") {
          // ポスター・DM: Product chatMessages に自動メッセージ
          const product = repository.getProducts().find(
            (p) => p.projectId === request.projectId && p.category === "ポイント"
          )
          if (product) {
            const channel = request.requestType === "poster" ? "poster" : "dm"
            const label = request.requestType === "poster" ? "ポスター" : "DM"
            const vendorName = request.vendorName ?? "デザイン業者"
            const chatMessage = {
              channel,
              author: vendorName,
              content: `${label}の初稿をアップロードしました。ご確認ください。`,
              timestamp: now,
            }
            repository.updateProduct(product.id, {
              chatMessages: [...(product.chatMessages ?? []), chatMessage],
            })
            window.dispatchEvent(new CustomEvent("chat-updated", { detail: { productId: product.id } }))
          }
        }
      }
      loadRequests()
    },
    [repository, allRequests, loadRequests]
  )

  const handleChatSend = useCallback(
    (content: string) => {
      if (!selectedRequest) return
      const channel = selectedRequest.requestType

      // 当選通知書: DesignRequest コメントとして保存
      if (channel === "winner-list") {
        const vendorName = selectedRequest.vendorName ?? "デザイン業者"
        repository.addDesignRequestComment(selectedRequest.id, content, "DesignVendor", vendorName)
        setRefreshKey((k) => k + 1)
        loadRequests()
        window.dispatchEvent(new CustomEvent("chat-updated"))
        return
      }

      // ポスター・DM: Product chatMessages に保存
      if (channel !== "poster" && channel !== "dm") return
      const product = repository.getProducts().find(
        (p) => p.projectId === selectedRequest.projectId && p.category === "ポイント"
      )
      if (!product) return
      const vendorName = selectedRequest.vendorName ?? "デザイン業者"
      const chatMessage: ChatMessage = {
        channel,
        author: vendorName,
        content,
        timestamp: new Date().toISOString(),
      }
      repository.updateProduct(product.id, {
        chatMessages: [...(product.chatMessages ?? []), chatMessage],
      })
      window.dispatchEvent(new CustomEvent("chat-updated", { detail: { productId: product.id } }))
      setRefreshKey((k) => k + 1)
    },
    [selectedRequest, repository, loadRequests]
  )

  return {
    requestedRequests,
    uploadedRequests,
    selectedRequest,
    selectedRequestId,
    chatMessages,
    handleSelectRequest,
    handleFileUpload,
    handleChatSend,
  }
}

export type UseDesignVendorDashboardReturn = ReturnType<typeof useDesignVendorDashboard>
