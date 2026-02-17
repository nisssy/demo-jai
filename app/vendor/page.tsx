"use client"

import { useEffect } from "react"
import { useProject } from "@/contexts/project-context"
import { DesignVendorScreen } from "@/components/screens/design-vendor-screen"

export default function VendorPage() {
  const { setCurrentGoudouRole } = useProject()

  useEffect(() => {
    setCurrentGoudouRole("DesignVendor")
  }, [setCurrentGoudouRole])

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto p-6">
          <DesignVendorScreen />
        </main>
      </div>
    </div>
  )
}
