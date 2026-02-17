"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { ChatChannel } from "@/new/features/product-chat/model/types"

/** イベント区分ごとのチャット対象部門 */
const CHAT_DEPARTMENTS: Record<string, string[]> = {
  "トリニティガール": ["BS・CS"],
  "スロセレ": ["BS・CS", "外注業者"],
}

export type UseProductChatArgs = {
  repository: ProjectRepository
  productId: number
  author?: string
}

export function useProductChat({ repository, productId, author = "営業" }: UseProductChatArgs) {
  const [refreshKey, setRefreshKey] = useState(0)

  // 他コンポーネントからの chatMessages 更新を検知して再読み込み
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!detail?.productId || detail.productId === productId) {
        setRefreshKey(k => k + 1)
      }
    }
    window.addEventListener("chat-updated", handler)
    return () => window.removeEventListener("chat-updated", handler)
  }, [productId])

  const product = useMemo(() => {
    return repository.getProductById(productId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository, productId, refreshKey])

  const eventType = product?.eventType ?? ""
  const productName = product?.eventProductName ?? eventType

  // このイベント区分で使えるチャンネル
  const departments = useMemo(() => CHAT_DEPARTMENTS[eventType] ?? [], [eventType])

  // 部門ごとのメッセージを分類
  const channels = useMemo<ChatChannel[]>(() => {
    const allMessages = product?.chatMessages ?? []
    return departments.map((dept) => ({
      department: dept,
      messages: allMessages.filter((m) => m.channel === dept),
    }))
  }, [product?.chatMessages, departments])

  // アクティブなチャンネル
  const [activeChannel, setActiveChannel] = useState<string>(departments[0] ?? "")

  // メッセージ送信
  const handleSendMessage = useCallback((channel: string, content: string) => {
    if (!product) return
    const newMessage = {
      channel,
      author,
      content,
      timestamp: new Date().toISOString(),
    }
    repository.updateProduct(productId, {
      chatMessages: [...(product.chatMessages ?? []), newMessage],
    })
    setRefreshKey((k) => k + 1)
  }, [repository, productId, product])

  return {
    productName,
    eventType,
    channels,
    departments,
    activeChannel,
    setActiveChannel,
    onSendMessage: handleSendMessage,
  }
}
