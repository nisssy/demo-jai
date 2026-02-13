"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ProjectRegistration } from "@/new/features/project-registration/ui/project-registration"
import type { RegistrationMode } from "@/new/features/project-registration/model/types"

function ProjectRegistrationContent() {
  const searchParams = useSearchParams()
  const mode = (searchParams?.get("mode") as RegistrationMode) ?? "new"
  const productIdParam = searchParams?.get("productId")
  const productId = productIdParam ? Number(productIdParam) : undefined
  const correctionRequest = searchParams?.get("correctionRequest") ?? undefined

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectRegistration
        mode={mode}
        productId={productId}
        correctionRequest={correctionRequest}
      />
    </main>
  )
}

export default function ProjectRegistrationPage() {
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
      <ProjectRegistrationContent />
    </Suspense>
  )
}
