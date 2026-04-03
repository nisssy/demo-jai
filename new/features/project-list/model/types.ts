/** 案件一覧のタブ */
export type ProjectListTab = "projects" | "messages"

/** フィルタ条件（UI状態） */
export type FilterState = {
  projectNumber: string
  recordNumber: string
  projectName: string
  salesPersonId: string
  dateMode: "execution" | "created"
  dateFrom: string
  dateTo: string
  category: string
  eventType: string
  hallName: string
  companyId: string
  prefecture: string
  statuses: string[]
}

/** 保存済み検索条件 */
export type SavedSearchCondition = {
  id: string
  name: string
  filters: FilterState
  createdAt: string
}
