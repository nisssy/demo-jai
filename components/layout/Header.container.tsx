"use client"

import { useHeader } from "@/components/layout/hooks/useHeader"
import { HeaderView } from "@/components/layout/Header.view"

export const HeaderContainer = () => {
  const { currentRole, currentGoudouRole, handleBackToRoleSelection, handleResetDemoData } = useHeader()

  return (
    <HeaderView
      currentRole={currentRole}
      currentGoudouRole={currentGoudouRole}
      onBackToRoleSelection={handleBackToRoleSelection}
      onResetDemoData={handleResetDemoData}
    />
  )
}
