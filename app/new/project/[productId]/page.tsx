"use client"

import { Suspense } from "react"
import { useParams } from "next/navigation"
import { ProjectRegistration } from "@/new/features/project-registration/ui/project-registration"
import { ProductChat } from "@/new/features/product-chat/ui/product-chat"

function ProductEditContent() {
  const params = useParams()
  const productId = Number(params.productId)

  return (
    <main className="px-8 py-8 max-w-[1400px] mx-auto">
      <div className="flex gap-6 items-start">
        {/* 左: 商材編集フォーム */}
        <div className="flex-1 min-w-0">
          <ProjectRegistration mode="product-edit" productId={productId} />
        </div>
        {/* 右: チャットパネル */}
        <div className="w-96 shrink-0 sticky top-8 h-[calc(100vh-8rem)]">
          <ProductChat productId={productId} />
        </div>
      </div>
    </main>
  )
}

export default function ProductEditPage() {
  return (
    <Suspense
      fallback={
        <main className="px-8 py-8 max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      }
    >
      <ProductEditContent />
    </Suspense>
  )
}
