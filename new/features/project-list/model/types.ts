/** 案件一覧のタブ */
export type ProjectListTab = "projects" | "messages"

/** フィルタ条件（UI状態） */
export type FilterState = {
  projectNumber: string
  /** 案件No（案件番号とは別の管理番号） */
  projectNo: string
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
  prefectures: string[]
  /** 担当エリア（複数選択） */
  areas: string[]
  /** 部署（複数選択） */
  departments: string[]
  statuses: string[]
}

/** 保存済み検索条件 */
export type SavedSearchCondition = {
  id: string
  name: string
  filters: FilterState
  createdAt: string
}
