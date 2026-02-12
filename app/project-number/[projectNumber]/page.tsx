"use client"

import { Suspense } from "react"
import { useParams } from "next/navigation"
import { ProjectDetail } from "@/features/project-detail/ui/project-detail"

function ProjectDetailContent() {
  const params = useParams()
  const projectNumber = params.projectNumber as string

  return <ProjectDetail projectNumber={projectNumber} />
}

export default function ProjectDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          読み込み中...
        </div>
      }
    >
      <ProjectDetailContent />
    </Suspense>
  )
}
