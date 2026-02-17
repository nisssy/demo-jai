import type { ProjectData, Role } from "@/types/project"

export type ProjectListProps = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onNext: () => void
  onBack: () => void
  addNotification: (message: string) => void
  role: Role
  setCurrentScreen: (screen: number) => void
  onCreateNewProject: () => void
  initialTab?: "projects" | "corrections"
}

export type ProjectItem = {
  id: number | string
  projectNumber?: string
  projectName: string
  clientName: string
  talent: string
  date: string
  venue: string
  status: "proposed" | "ordered"
  estimateAmount: string
  salesPersonName?: string
  requestDate?: string
  hallName?: string
  hallId?: string
  companyId?: string
  companyName?: string
  projectStatus?: string
  category?: string
  eventType?: string
  eventProductName?: string
  eventDate?: string
}

export type ValidationResult = {
  isValid: boolean
  errors: string[]
}

