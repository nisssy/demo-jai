"use client"

import { useCallback } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import type { Role } from "@/new/types/role"

export function useRoleSelection() {
  const router = useAppRouter()

  const handleSelectRole = useCallback((role: Role) => {
    router.push(`/?role=${role}`)
  }, [router])

  return {
    handleSelectRole,
  }
}
