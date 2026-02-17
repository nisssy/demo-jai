// Re-export all types from other type files
export * from "./project"
export * from "./lottery"

/** ロール: 営業・インサイト / デザイン業者 / 景品業者 / 事務管理課 */
export type GoudouRole = "SalesInsight" | "DesignVendor" | "PrizeVendor" | "Admin"

/** 
 * 合同抽選会用のProject型
 * vendor screensで使用される簡略化されたプロジェクト型
 */
export type Project = {
  id: number | string
  projectNumber?: string
  projectName?: string
  companyName: string
  hallNames: string[]
  eventStartDate: string
  eventEndDate: string
  area?: string
  status: "before-proposal" | "proposing" | "order-received"
  readingCertainty?: "A" | "B" | "C"
  dmMailing?: "yes" | "no"
  budget: string
  createdAt?: string
  salesPersonId?: string
  insightPersonId?: string
  posterCount?: string
  target?: string
  hallQuotes?: import("./lottery").HallQuote[]
  prizeInfo?: import("./lottery").PrizeInfo[]
  deliveryVendor?: string
  orderFileName?: string
  prizeOrderedAt?: string
  deliveryInfos?: import("./lottery").DeliveryInfo[]
  [key: string]: unknown
}
