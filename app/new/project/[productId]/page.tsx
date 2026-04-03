"use client"

import { Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { AppHeader } from "@/new/ui/AppHeader"
import { RecordDetail } from "@/new/features/record-detail/ui/record-detail"
import { ProjectRegistration } from "@/new/features/project-registration/ui/project-registration"
import { ProductChat } from "@/new/features/product-chat/ui/product-chat"
import type { Role } from "@/new/types/role"

function ProductContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const productId = Number(params.productId)
  const role = (searchParams?.get("role") ?? "Sales") as Role
  const mode = searchParams?.get("mode")

  // mode=edit の場合は従来の編集画面、それ以外はKintone風レコード詳細
  if (mode === "edit") {
    return (
      <>
        <AppHeader currentRole={role} />
        <main className="px-8 py-8 max-w-[1400px] mx-auto">
          <div className="flex gap-6 items-start">
            <div className="flex-1 min-w-0">
              <ProjectRegistration mode="product-edit" productId={productId} />
            </div>
            <div className="w-96 shrink-0 sticky top-24 h-[calc(100vh-8rem)]">
              <ProductChat productId={productId} />
            </div>
          </div>
        </main>
      </>
    )
  }

  // ロールごとのチャット設定
  const chatProps = role === "Internal"
    ? { author: "マネジメント部", channelDisplayNames: { "BS・CS": "営業" } }
    : {}

  // デフォルト: Kintone風レコード詳細
  return (
    <>
      <AppHeader currentRole={role} />
      <main className="px-8 py-8 max-w-[1400px] mx-auto">
        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0">
            <RecordDetail productId={productId} role={role} />
          </div>
          <div className="w-96 shrink-0 sticky top-24 h-[calc(100vh-8rem)]">
            <ProductChat productId={productId} {...chatProps} />
          </div>
        </div>
      </main>
    </>
  )
}

export default function ProductPage() {
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
      <ProductContent />
    </Suspense>
  )
}
