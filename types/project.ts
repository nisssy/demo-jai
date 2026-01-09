export type Role = "Sales" | "Internal"

export type ProjectData = {
  projectName: string
  clientName: string
  date: string
  venue: string
  talent: string
  talentStatus: "available" | "busy"
  quoteItems: Array<{ item: string; amount: number; subitems?: Array<{ item: string; amount: number }> }>
  emailDraft: string
  contractAmount: string
  billingAddress: string
  status: "proposed" | "ordered" | "confirmed"
  validationErrors: string[]
  correctionRequest: string
  projects?: Array<{
    id: number
    projectNumber?: string
    projectName: string
    clientName: string
    date: string
    venue: string
    talent: string
    estimateAmount: string
    status: "proposed" | "ordered"
    salesPersonName?: string
    requestDate?: string
    hallName?: string
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
    companionCostumes?: { [companionName: string]: string }
    mustSeeFlag?: string
    mustSeePublication?: string // 必見掲載 (要か不要)
    publicationDate?: string // 掲載日
    publicationTime?: string // 掲載時刻
    reportRequired?: string // レポート要否 (要か不要)
  }>
}

