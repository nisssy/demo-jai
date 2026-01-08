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
  }>
}

