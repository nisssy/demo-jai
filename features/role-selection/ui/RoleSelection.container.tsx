"use client"

import type { Role } from "@/types/project"
import { useRoleSelection } from "@/features/role-selection/hooks/useRoleSelection"
import { RoleSelectionView } from "@/features/role-selection/ui/RoleSelection.view"

type RoleSelectionProps = {
  onSelectRole: (role: Role) => void
}

export const RoleSelectionContainer = ({ onSelectRole }: RoleSelectionProps) => {
  const { handleSelectRole } = useRoleSelection({ onSelectRole })

  return <RoleSelectionView onSelectRole={handleSelectRole} />
}
