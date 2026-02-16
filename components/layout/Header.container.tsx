"use client"

import { usePathname } from "next/navigation"
import { useHeader } from "@/components/layout/hooks/useHeader"
import { HeaderView } from "@/components/layout/Header.view"

export const HeaderContainer = () => {
  const pathname = usePathname()
  const { currentRole, currentGoudouRole, handleBackToRoleSelection, handleResetDemoData } = useHeader()

  // /new 配下は独自ヘッダーを使用するため非表示
  if (pathname?.startsWith("/new")) return null

  return (
    <HeaderView
      currentRole={currentRole}
      currentGoudouRole={currentGoudouRole}
      onBackToRoleSelection={handleBackToRoleSelection}
      onResetDemoData={handleResetDemoData}
    />
  )
}
