"use client"

import { useCallback } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import { useProject } from "@/contexts/project-context"

export function useHeader() {
  const router = useAppRouter()
  const { currentRole, setCurrentRole, resetDemoData } = useProject()

  const handleBackToRoleSelection = useCallback(() => {
    setCurrentRole(null)
    // 全てのURLパラメータをクリアしてロール選択画面に戻る
    router.push("/", { scroll: false })
  }, [setCurrentRole, router])

  const handleResetDemoData = useCallback(() => {
    resetDemoData()
    setCurrentRole(null)
    // 全てのURLパラメータをクリアしてロール選択画面に戻る
    router.push("/", { scroll: false })
  }, [resetDemoData, setCurrentRole, router])

  return {
    currentRole,
    handleBackToRoleSelection,
    handleResetDemoData,
  }
}
