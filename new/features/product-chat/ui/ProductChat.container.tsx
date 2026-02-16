"use client"

import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { useProductChat } from "@/new/features/product-chat/hooks/useProductChat"
import { ProductChatView } from "./ProductChat.view"

type ProductChatContainerProps = {
  productId: number
}

export const ProductChatContainer = ({ productId }: ProductChatContainerProps) => {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])
  const result = useProductChat({ repository, productId })

  return (
    <ProductChatView
      productName={result.productName}
      channels={result.channels}
      departments={result.departments}
      activeChannel={result.activeChannel}
      onActiveChannelChange={result.setActiveChannel}
      onSendMessage={result.onSendMessage}
    />
  )
}
