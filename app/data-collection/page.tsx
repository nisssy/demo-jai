"use client"

import { useRouter } from "next/navigation"
import { DataCollection } from "@/components/screens/data-collection"
import { useProject } from "@/contexts/project-context"

export default function DataCollectionPage() {
  const router = useRouter()
  const { projectData } = useProject()

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <DataCollection
        projectData={projectData}
        onNext={() => router.push("/data-export")}
        onBack={() => router.push("/operations-management")}
      />
    </main>
  )
}

