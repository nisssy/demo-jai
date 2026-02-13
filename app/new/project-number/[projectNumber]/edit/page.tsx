"use client"

import { Suspense } from "react"
import { useParams } from "next/navigation"
import { useMemo } from "react"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
import { ProjectRegistration } from "@/new/features/project-registration/ui/project-registration"

function ProjectEditContent() {
  const params = useParams()
  const projectNumber = params.projectNumber as string

  const repository = useMemo(() => new LocalStorageProjectRepository(), [])
  const products = repository.getProductsByProjectNumber(projectNumber)
  const firstProductId = products.length > 0 ? products[0].id : undefined

  if (!firstProductId) {
    return (
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <div className="text-center py-12 text-slate-500">案件に商材がありません</div>
      </main>
    )
  }

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectRegistration mode="edit" productId={firstProductId} />
    </main>
  )
}

export default function ProjectEditPage() {
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
      <ProjectEditContent />
    </Suspense>
  )
}
