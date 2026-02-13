/** 見積のステップ（旧バージョン準拠の6ステップ） */
export type QuoteStep = "select" | "recipient" | "template" | "quote" | "email-settings" | "email"

/** 見積の宛先種別 */
export type QuoteRecipient = "hall" | "company"

/** メールテンプレート種別 */
export type EmailTemplate = "standard" | "polite" | "concise"

/** 見積テンプレート定義 */
export type QuoteTemplate = {
  id: number
  name: string
  description: string
  items: {
    item: string
    amount: number
    subitems?: { item: string; amount: number }[]
  }[]
}

/** 見積明細サブ項目（内訳） */
export type QuoteLineSubitem = {
  id: string
  name: string
  amount: number
  visible: boolean
}

/** 見積明細行 */
export type QuoteLineItem = {
  id: string
  name: string
  amount: number
  visible: boolean
  subitems?: QuoteLineSubitem[]
}

/** 見積書データ */
export type QuoteDocument = {
  projectNumber: string
  projectName: string
  clientName: string
  hallName: string
  salesPersonName: string
  issueDate: string
  items: QuoteLineItem[]
  totalAmount: number
  /** 商材別内訳（プレビュー用） */
  productBreakdowns?: {
    name: string
    eventDate: string
    items: { name: string; amount: number }[]
    subtotal: number
  }[]
}

/** メール設定 */
export type EmailSettings = {
  toEmails: string[]
  fromEmployeeId: number | null
  fromEmail: string
  ccEmployeeIds: number[]
  bccEmployeeIds: number[]
  subject: string
  body: string
}

/** 商材の見積用サマリ */
export type ProductQuoteSummary = {
  id: number
  category: string
  eventType: string
  eventProductName: string
  eventDate: string
  performanceFee: number
  transportFee: number
  accommodationFee: number
  eventBaseFee: number
  subtotal: number
  // 合同抽選会
  lotteryItems?: { name: string; amount: number }[]
}
