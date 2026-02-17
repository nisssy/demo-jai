"use client"

import { useState, useMemo, useCallback } from "react"
import { useProject } from "@/contexts/project-context"
import type { DesignRequest } from "@/types/lottery"

export type UseDesignVendorDashboardArgs = {
  addNotification: (message: string) => void
}

export function useDesignVendorDashboard({ addNotification }: UseDesignVendorDashboardArgs) {
  const { getDesignRequests, updateDesignRequest, addDesignRequestComment } = useProject()

  // 選択された依頼
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

  // アップロード関連の状態
  const [uploadFileName, setUploadFileName] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadingRequestId, setUploadingRequestId] = useState<string | null>(null)

  // コメント関連の状態
  const [commentText, setCommentText] = useState("")
  const [showCommentModal, setShowCommentModal] = useState(false)

  // デザイン依頼一覧を取得（デモ用：全件表示）
  const allRequests = useMemo(() => {
    return getDesignRequests()
  }, [getDesignRequests])

  // ステータスでグループ化
  const requestsGroupedByStatus = useMemo(() => {
    const requested = allRequests.filter((r) => r.status === "requested")
    const uploaded = allRequests.filter((r) => r.status === "uploaded")

    return {
      requested: { label: "依頼受付中", requests: requested },
      uploaded: { label: "アップロード済み", requests: uploaded },
    }
  }, [allRequests])

  // 選択された依頼の詳細
  const selectedRequest = useMemo(() => {
    if (!selectedRequestId) return null
    return allRequests.find((r) => r.id === selectedRequestId) || null
  }, [selectedRequestId, allRequests])

  // デザインタイプのラベル取得
  const getRequestTypeLabel = useCallback((type: DesignRequest["requestType"]) => {
    switch (type) {
      case "poster":
        return "ポスター"
      case "dm":
        return "DM"
      case "winner-list":
        return "当選通知書"
      default:
        return type
    }
  }, [])

  // アップロードモーダルを開く
  const handleOpenUploadModal = useCallback((requestId: string) => {
    setUploadingRequestId(requestId)
    setUploadFileName("")
    setShowUploadModal(true)
  }, [])

  // デザインアップロード処理
  const handleUpload = useCallback(() => {
    if (!uploadingRequestId || !uploadFileName.trim()) {
      addNotification("ファイル名を入力してください")
      return
    }

    const updated = updateDesignRequest(uploadingRequestId, {
      status: "uploaded",
      uploadedFileName: uploadFileName,
      uploadedAt: new Date().toISOString(),
    })

    if (updated) {
      addNotification("デザインをアップロードしました")
      setShowUploadModal(false)
      setUploadFileName("")
      setUploadingRequestId(null)
    }
  }, [uploadingRequestId, uploadFileName, updateDesignRequest, addNotification])

  // コメントモーダルを開く
  const handleOpenCommentModal = useCallback(() => {
    setCommentText("")
    setShowCommentModal(true)
  }, [])

  // コメント追加処理
  const handleAddComment = useCallback(() => {
    if (!selectedRequestId || !commentText.trim()) {
      addNotification("コメントを入力してください")
      return
    }

    const success = addDesignRequestComment(selectedRequestId, {
      role: "DesignVendor",
      authorName: "デザイン業者",
      text: commentText,
    })

    if (success) {
      addNotification("コメントを追加しました")
      setShowCommentModal(false)
      setCommentText("")
    }
  }, [selectedRequestId, commentText, addDesignRequestComment, addNotification])

  // 選択をクリア
  const clearSelection = useCallback(() => {
    setSelectedRequestId(null)
  }, [])

  return {
    // データ
    allRequests,
    requestsGroupedByStatus,
    selectedRequest,
    selectedRequestId,

    // アップロード関連
    uploadFileName,
    showUploadModal,
    uploadingRequestId,
    setUploadFileName,
    handleOpenUploadModal,
    handleUpload,
    setShowUploadModal,

    // コメント関連
    commentText,
    showCommentModal,
    setCommentText,
    handleOpenCommentModal,
    handleAddComment,
    setShowCommentModal,

    // その他
    setSelectedRequestId,
    clearSelection,
    getRequestTypeLabel,
  }
}
