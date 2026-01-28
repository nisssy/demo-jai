import type { ProjectData } from "@/types/project"

export type CompanyData = {
  id: number
  companyId: string
  name: string
  email?: string
}

export type HallData = {
  id: number
  hallId: string
  name: string
  salesPersonName: string
  companyId: number
  discountAmount: number
  address?: string
  email?: string
}

export type ProductionData = {
  id: number
  name: string
  address: string
  phone: string
}

export type CompanionData = {
  id: number
  name: string
  productionId: number
}

export type EmployeeData = {
  id: number
  name: string
  email: string
  department?: string
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
  nominatedCompanions?: Record<string, boolean>
  nominatedDirectors?: Record<string, boolean>
  nominatedMcs?: Record<string, boolean>
  /** キャストごとのブッキング状態（商材の実施期間に対する 仮押さえ依頼/仮押さえ/本押さえ依頼/本押さえ） */
  companionBookingStatus?: Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
  directorBookingStatus?: Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
  mcBookingStatus?: Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
  /** キャストごとの「仮押さえ不可」理由（入っているキャストは仮押さえ不可扱い） */
  companionTentativeHoldFailureComment?: Record<string, string>
  directorTentativeHoldFailureComment?: Record<string, string>
  mcTentativeHoldFailureComment?: Record<string, string>
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
  /** ステータス変更履歴 */
  statusHistory?: Array<{
    status: string
    timestamp: string
    changedBy?: string
    note?: string
  }>
  [key: string]: unknown
}

