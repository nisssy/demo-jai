"use client"

import { useEffect } from "react"
import { useProject } from "@/contexts/project-context"
import { PrizeVendorScreen } from "@/components/screens/prize-vendor-screen"

export default function PrizeVendorPage() {
  const { setCurrentGoudouRole } = useProject()

  useEffect(() => {
    setCurrentGoudouRole("PrizeVendor")
  }, [setCurrentGoudouRole])

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto p-6">
          <PrizeVendorScreen />
        </main>
      </div>
    </div>
  )
}
