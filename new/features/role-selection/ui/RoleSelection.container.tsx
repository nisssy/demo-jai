"use client"

import { useRoleSelection } from "@/new/features/role-selection/hooks/useRoleSelection"
import { RoleSelectionView } from "@/new/features/role-selection/ui/RoleSelection.view"

export const RoleSelectionContainer = () => {
  const { handleSelectRole } = useRoleSelection()

  return <RoleSelectionView onSelectRole={handleSelectRole} />
}
