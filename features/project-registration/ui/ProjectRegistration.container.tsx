"use client"

import type { ProjectRegistrationProps } from "@/features/project-registration/types"
import { ProjectRegistrationImpl } from "./ProjectRegistrationImpl"

export function ProjectRegistrationContainer(props: ProjectRegistrationProps) {
  return <ProjectRegistrationImpl {...props} />
}
