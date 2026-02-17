"use client"

import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useProductChat } from "@/new/features/product-chat/hooks/useProductChat"
import { ProductChatView } from "./ProductChat.view"

type ProductChatContainerProps = {
  productId: number
  author?: string
  departments?: string[]
}

export const ProductChatContainer = ({ productId, author, departments }: ProductChatContainerProps) => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])
  const result = useProductChat({ repository, productId, author, departments })

  return (
    <ProductChatView
      productName={result.productName}
      channels={result.channels}
      departments={result.departments}
      activeChannel={result.activeChannel}
      onActiveChannelChange={result.setActiveChannel}
      onSendMessage={result.onSendMessage}
      currentAuthor={author ?? "営業"}
    />
  )
}
