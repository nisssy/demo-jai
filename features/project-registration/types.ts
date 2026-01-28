import type { ProjectData } from "@/types/project"

export type ProjectRegistrationProps = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onNext: () => void
  onBack: () => void
  addNotification: (message: string) => void
  projectId?: number | null
  isProductAddMode?: boolean
  isProductEditMode?: boolean
  correctionComment?: string
  onCorrectionCommentChange?: (comment: string) => void
  correctionRequest?: string
}

export type ProductInfo = {
  id: number
  category: string
  eventType: string
  eventProductName: string
  eventDate: string
  mustSeeFlag: string
  mustSeePublication: string
  publicationDate: string
  publicationTime: string
  reportRequired: string
  startTime: string
  endTime: string
  status: string
  companionCount: string
  directorCount: string
  mcCount: string
  selectedCompanions: Set<string>
  selectedDirectors: Set<string>
  selectedMcs: Set<string>
  nominatedCompanions: Record<string, boolean>
  nominatedDirectors: Record<string, boolean>
  nominatedMcs: Record<string, boolean>
  transportationFeeTotal: string
  accommodationFeePerPerson: string
  performanceFeeDiscount: string
  eventBaseFee: string
  eventBaseFeeDiscount: string
  isOpen: boolean
}
