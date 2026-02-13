"use client"

import { Suspense } from "react"
import { useParams } from "next/navigation"
import { ProjectRegistration } from "@/new/features/project-registration/ui/project-registration"

function ProductEditContent() {
  const params = useParams()
  const productId = Number(params.productId)

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectRegistration mode="product-edit" productId={productId} />
    </main>
  )
}

export default function ProductEditPage() {
  return (
    <Suspense
      fallback={
        <main className="px-8 py-8 max-w-7xl mx-auto">
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
