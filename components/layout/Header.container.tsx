"use client"

import { useHeader } from "@/components/layout/hooks/useHeader"
import { HeaderView } from "@/components/layout/Header.view"

export const HeaderContainer = () => {
  const { currentRole, handleBackToRoleSelection, handleResetDemoData } = useHeader()

  return (
    <HeaderView
      currentRole={currentRole}
      onBackToRoleSelection={handleBackToRoleSelection}
      onResetDemoData={handleResetDemoData}
    />
  )
}
