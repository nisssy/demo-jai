import { useState, useEffect, useCallback, useMemo } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { DesignRequest, DesignRequestComment } from "@/new/api/types"

export interface DesignVendorDashboardViewModel {
  requestedRequests: DesignRequest[]
  uploadedRequests: DesignRequest[]
  selectedRequest: DesignRequest | null
  commentText: string
}

export function useDesignVendorDashboard(repository: ProjectRepository) {
  const [allRequests, setAllRequests] = useState<DesignRequest[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")

  const loadRequests = useCallback(() => {
    const requests = repository.getAllDesignRequests()
    setAllRequests(requests)
  }, [repository])

  useEffect(() => {
    loadRequests()
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

  const handleSelectRequest = useCallback((id: string) => {
    setSelectedRequestId(id)
    setCommentText("")
  }, [])

  const handleFileUpload = useCallback(
    (id: string) => {
      const now = new Date().toISOString()
      repository.updateDesignRequest(id, {
        status: "uploaded",
        uploadedFileName: "design_v1.pdf",
        uploadedAt: now,
      })
      loadRequests()
    },
    [repository, loadRequests]
  )

  const handleCommentSubmit = useCallback(
    (id: string) => {
      if (!commentText.trim()) return
      const request = allRequests.find((r) => r.id === id)
      const vendorName = request?.vendorName ?? "デザイン業者"
      repository.addDesignRequestComment(id, commentText.trim(), "DesignVendor", vendorName)
      setCommentText("")
      loadRequests()
    },
    [commentText, allRequests, repository, loadRequests]
  )

  return {
    requestedRequests,
    uploadedRequests,
    selectedRequest,
    selectedRequestId,
    commentText,
    setCommentText,
    handleSelectRequest,
    handleFileUpload,
    handleCommentSubmit,
  }
}

export type UseDesignVendorDashboardReturn = ReturnType<typeof useDesignVendorDashboard>
