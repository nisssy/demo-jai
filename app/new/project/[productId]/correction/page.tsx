"use client"

import { Suspense } from "react"
import { useParams } from "next/navigation"
import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { ProjectRegistration } from "@/new/features/project-registration/ui/project-registration"

function CorrectionContent() {
  const params = useParams()
  const productId = Number(params.productId)

  const repository = useMemo(() => new LocalStorageProjectRepository(), [])
  const product = repository.getProductById(productId)
  const correctionRequest = product?.correctionRequest ?? undefined

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectRegistration
        mode="product-edit"
        productId={productId}
        correctionRequest={correctionRequest}
      />
    </main>
  )
}

export default function CorrectionPage() {
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
      <CorrectionContent />
    </Suspense>
  )
}
