"use client"

import { useOutsourcingVendorDashboard } from "@/features/outsourcing-vendor-dashboard/hooks/useOutsourcingVendorDashboard"
import { OutsourcingVendorDashboardView } from "@/features/outsourcing-vendor-dashboard/ui/OutsourcingVendorDashboard.view"
import type { ProjectData } from "@/types/project"

export type OutsourcingVendorDashboardContainerProps = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  addNotification: (message: string) => void
}

export const OutsourcingVendorDashboardContainer = ({
  projectData,
  setProjectData,
  addNotification,
}: OutsourcingVendorDashboardContainerProps) => {
  const state = useOutsourcingVendorDashboard({ projectData, setProjectData, addNotification })

  return (
    <OutsourcingVendorDashboardView
      activeTab={state.activeTab}
      onActiveTabChange={state.setActiveTab}
      requestsCount={state.products.length}
    />
  )
}
