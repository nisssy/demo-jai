export type Role = "Sales" | "Internal"

export type ProjectData = {
  projectName: string
  clientName: string
  date: string
  venue: string
  talent: string
  talentStatus: "available" | "tentative" | "busy"
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
    hallId?: string
    companyId?: string
    companyName?: string
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
    /** キャストごとのブッキング状態（商材の実施期間に対する 仮押さえ依頼/仮押さえ/本押さえ） */
    companionBookingStatus?: Record<string, "pending" | "tentative" | "confirmed">
    directorBookingStatus?: Record<string, "pending" | "tentative" | "confirmed">
    mcBookingStatus?: Record<string, "pending" | "tentative" | "confirmed">
    /** キャストごとの「仮押さえ不可」理由（入っているキャストは仮押さえ不可扱い） */
    companionTentativeHoldFailureComment?: Record<string, string>
    directorTentativeHoldFailureComment?: Record<string, string>
    mcTentativeHoldFailureComment?: Record<string, string>
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
    pachitownLinked?: boolean
    pachitownLinkedDate?: string
    xAccountPostText?: string
    surveySent?: boolean
    surveySentDate?: string
    surveyResult?: {
      satisfaction?: string
      comment?: string
      nextEventDesired?: string
    }
    castingCost?: number
    transportationFee?: number
    accommodationFee?: number
    postPRCost?: number
    isTransportationAutoFilled?: boolean
    isAccommodationAutoFilled?: boolean
    correctionRequest?: string
    // 見積書作成モーダルで保存するデモ用フィールド
    quoteGenerated?: boolean
    quoteData?: ProjectData
  }>
}

