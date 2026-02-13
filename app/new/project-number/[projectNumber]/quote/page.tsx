"use client"

import { Suspense } from "react"
import { useParams } from "next/navigation"
import { ProjectQuote } from "@/new/features/project-quote/ui/project-quote"

function QuoteContent() {
  const params = useParams()
  const projectNumber = params.projectNumber as string

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <ProjectQuote projectNumber={projectNumber} />
    </main>
  )
}

export default function QuotePage() {
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
      <QuoteContent />
    </Suspense>
  )
}
