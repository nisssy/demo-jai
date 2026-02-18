import type { LotteryFormState, OrderStatus, ExecutionStatus } from "./lottery-types"

/** 登録画面のモード */
export type RegistrationMode = "new" | "edit" | "project-edit" | "product-add" | "product-edit"

/** 商材フォームの状態 */
export type ProductFormState = {
  id?: number
  category: string
  eventType: string
  eventProductName: string
  eventDate: string
  startTime: string
  endTime: string
  mustSeeFlag: string
  mustSeePublication: string
  publicationDate: string
  publicationTime: string
  reportRequired: string
  isOpen: boolean
  // キャスティング
  companionCount: string
  directorCount: string
  selectedCompanions: string[]
  selectedDirectors: string[]
  nominatedCompanions: Record<string, boolean>
  nominatedDirectors: Record<string, boolean>
  companionHoldTypes: Record<string, "tentative" | "confirmed">
  directorHoldTypes: Record<string, "tentative" | "confirmed">
  // 請求予定金額
  performanceFeeDiscount: string
  accommodationFeePerPerson: string
  eventBaseFeeDiscount: string
  // 3点セットプラン（スロセレ専用）
  threeSetPlan: boolean
  // ステータス（全商材共通）
  proposalStatus: OrderStatus
  readingCertainty: "A" | "B" | "C" | ""
  executionStatus: ExecutionStatus | null
  // 合同抽選会
  lottery?: LotteryFormState
}

/** 案件フォーム全体の状態 */
export type ProjectFormState = {
  projectNumber: string
  companyId: string
  companyName: string
  hallId: string
  hallName: string
  projectName: string
  salesPersonName: string
  requestDate: string
  products: ProductFormState[]
}

/** バリデーションエラー */
export type FormErrors = Record<string, string>

/** 商材フォームの初期値 */
export const EMPTY_PRODUCT: ProductFormState = {
  category: "",
  eventType: "",
  eventProductName: "",
  eventDate: "",
  startTime: "08:00",
  endTime: "15:00",
  mustSeeFlag: "0",
  mustSeePublication: "不要",
  publicationDate: "",
  publicationTime: "",
  reportRequired: "不要",
  isOpen: true,
  companionCount: "",
  directorCount: "",
  selectedCompanions: ["未定"],
  selectedDirectors: ["未定"],
  nominatedCompanions: {},
  nominatedDirectors: {},
  companionHoldTypes: {},
  directorHoldTypes: {},
  performanceFeeDiscount: "",
  accommodationFeePerPerson: "",
  eventBaseFeeDiscount: "",
  threeSetPlan: false,
  proposalStatus: "before-proposal",
  readingCertainty: "",
  executionStatus: "実施前",
}
