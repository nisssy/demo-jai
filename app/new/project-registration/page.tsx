"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AppHeader } from "@/new/ui/AppHeader"
import { ProjectRegistration } from "@/new/features/project-registration/ui/project-registration"
import { ProductChat } from "@/new/features/product-chat/ui/product-chat"
import type { RegistrationMode } from "@/new/features/project-registration/model/types"
import type { Role } from "@/new/types/role"

function ProjectRegistrationContent() {
  const searchParams = useSearchParams()
  const mode = (searchParams?.get("mode") as RegistrationMode) ?? "new"
  const productIdParam = searchParams?.get("productId")
  const productId = productIdParam ? Number(productIdParam) : undefined
  const correctionRequest = searchParams?.get("correctionRequest") ?? undefined
  const role = (searchParams?.get("role") as Role | null) ?? "Sales"

  const showChat = mode === "product-edit" && productId != null

  return (
    <>
      <AppHeader currentRole={role} />
      <main className="px-8 py-8 max-w-[1400px] mx-auto">
        {showChat ? (
          <div className="flex gap-6 items-start">
            <div className="flex-1 min-w-0">
              <ProjectRegistration
                mode={mode}
                productId={productId}
                correctionRequest={correctionRequest}
              />
            </div>
            <div className="w-96 shrink-0 sticky top-24 h-[calc(100vh-8rem)]">
              <ProductChat productId={productId} channelDisplayNames={{ "BS・CS": "マネジメント部" }} />
            </div>
          </div>
        ) : (
          <ProjectRegistration
            mode={mode}
            productId={productId}
            correctionRequest={correctionRequest}
          />
        )}
      </main>
    </>
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
