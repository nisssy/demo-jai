import type { ProjectData } from "@/types/project"

export type CompanyData = {
  id: number
  companyId: string
  name: string
}

export type HallData = {
  id: number
  hallId: string
  name: string
  salesPersonName: string
  companyId: number
  discountAmount: number
}

// v2までの「1行=商材(案件情報も含む)」形式（UI互換のため残す）
export type DemoProject = NonNullable<ProjectData["projects"]>[number]

// v3の案件(Project) / 商材(Product) エンティティ（正規化）
export type DemoProjectEntity = {
  id: number
  projectNumber: string
  projectName: string
  /** HallData.id（参照用） */
  hallRefId?: number
  companyId?: string
  companyName?: string
  hallName?: string
  /** ホールID（文字列） */
  hallCode?: string
  salesPersonName?: string
  requestDate?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export type DemoProductEntity = {
  id: number
  projectId: number
  status: "proposed" | "ordered"
  estimateAmount: string
  clientName?: string
  date?: string
  venue?: string
  talent?: string
  projectStatus?: string
  category?: string
  eventType?: string
  eventProductName?: string
  eventDate?: string
  estimatedBillingAmount?: number
  startTime?: string
  endTime?: string
  companionCount?: string
  directorCount?: string
  mcCount?: string
  selectedCompanions?: string[]
  selectedDirectors?: string[]
  selectedMcs?: string[]
  correctionRequest?: string
  correctionComment?: string
  temporaryHoldFailureComment?: string
  confirmedCompanions?: string[]
  confirmedDirectors?: string[]
  confirmedMcs?: string[]
  companionCostumes?: Record<string, string>
  mustSeeFlag?: string
  mustSeePublication?: string
  publicationDate?: string
  publicationTime?: string
  reportRequired?: string
  pachitownLinked?: boolean
  pachitownLinkedDate?: string
  xAccountPostText?: string
  surveySent?: boolean
  surveySentDate?: string
  surveyResult?: { satisfaction?: string; comment?: string; nextEventDesired?: string }
  castingCost?: number
  transportationFee?: number
  accommodationFee?: number
  postPRCost?: number
  isTransportationAutoFilled?: boolean
  isAccommodationAutoFilled?: boolean
  quoteGenerated?: boolean
  quoteData?: unknown
  [key: string]: unknown
}

