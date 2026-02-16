"use client"

import { Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { AppHeader } from "@/new/ui/AppHeader"
import { ProjectDetail } from "@/new/features/project-detail/ui/project-detail"
import type { Role } from "@/new/types/role"

function ProjectDetailContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectNumber = params.projectNumber as string
  const role = (searchParams?.get("role") as Role) || "Sales"

  return (
    <>
      <AppHeader currentRole={role} />
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <ProjectDetail projectNumber={projectNumber} />
      </main>
    </>
  )
}

export default function ProjectDetailPage() {
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
      <ProjectDetailContent />
    </Suspense>
  )
}
