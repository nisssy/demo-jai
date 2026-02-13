/** 案件情報 */
export type ProjectInfo = {
  projectNumber: string
  projectName?: string
  companyId?: string
  companyName?: string
  hallId?: string
  hallName?: string
  salesPersonName?: string
  requestDate?: string
}

/** 商材サマリ */
export type ProductSummary = {
  id: number
  category: string
  eventType: string
  eventProductName?: string
  eventDate?: string
  proposalStatus?: string
  estimatedBillingAmount?: number
}
