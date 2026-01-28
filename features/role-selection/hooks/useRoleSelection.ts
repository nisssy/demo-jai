"use client"

import type { Role } from "@/types/project"

export type UseRoleSelectionArgs = {
  onSelectRole: (role: Role) => void
}

export function useRoleSelection({ onSelectRole }: UseRoleSelectionArgs) {
  const handleSelectRole = (role: Role) => {
    onSelectRole(role)
  }

  return {
    handleSelectRole,
  }
}
