/** 案件一覧のタブ */
export type ProjectListTab = "projects" | "corrections" | "temporaryHoldFailure"

/** フィルタ条件（UI状態） */
export type FilterState = {
  projectNumber: string
  projectName: string
  salesPersonId: string
  dateMode: "execution" | "created"
  dateFrom: string
  dateTo: string
  category: string
  eventType: string
  hallName: string
  companyId: string
}
