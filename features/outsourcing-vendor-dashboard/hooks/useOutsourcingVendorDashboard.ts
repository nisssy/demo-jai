"use client"

import { useState } from "react"
import type { ProjectData } from "@/types/project"
import { useProject } from "@/contexts/project-context"

export type UseOutsourcingVendorDashboardArgs = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  addNotification: (message: string) => void
}

export type OutsourcingVendorDashboardTab = "requests" | "status"

export function useOutsourcingVendorDashboard({
  projectData,
  setProjectData,
  addNotification,
}: UseOutsourcingVendorDashboardArgs) {
  const { getProducts } = useProject()
  const [activeTab, setActiveTab] = useState<OutsourcingVendorDashboardTab>("requests")

  const products = getProducts()

  return {
    activeTab,
    setActiveTab,
    products,
    addNotification,
  }
}
