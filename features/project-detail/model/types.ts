import type { DemoProject } from "@/lib/demo-db/types"

/**
 * 案件情報
 */
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

/**
 * 商材サマリ
 */
export type ProductSummary = {
  id: number
  category: string
  eventType: string
  eventProductName?: string
  eventDate?: string
  projectStatus?: string
  estimatedBillingAmount?: number
}

/**
 * Container Props
 */
export type ProjectDetailContainerProps = {
  projectNumber: string
  addNotification?: (message: string) => void
}

/**
 * View Props
 */
export type ProjectDetailViewProps = {
  projectInfo: ProjectInfo | null
  products: ProductSummary[]
  isLoading: boolean

  // 案件情報編集
  onUpdateProjectInfo: () => void

  // 商材追加
  onAddProduct: () => void

  // 商材編集
  onEditProduct: (productId: number) => void

  // 戻る
  onBack: () => void
}
