import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import type { FilterState } from "@/new/features/project-list/model/types"

type ProjectListFiltersProps = {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export const ProjectListFilters = ({ filters, onFiltersChange }: ProjectListFiltersProps) => {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 案件No検索 */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">案件No</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="案件Noで検索"
              className="pl-8 h-9 text-sm"
              value={filters.projectNumber}
              onChange={(e) => updateFilter("projectNumber", e.target.value)}
            />
          </div>
        </div>

        {/* 案件名検索 */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">案件名</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="案件名で検索"
              className="pl-8 h-9 text-sm"
              value={filters.projectName}
              onChange={(e) => updateFilter("projectName", e.target.value)}
            />
          </div>
        </div>

        {/* カテゴリ */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">カテゴリ</Label>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
          >
            <option value="">すべて</option>
            <option value="イベント">イベント</option>
            <option value="ポイント">ポイント</option>
          </select>
        </div>

        {/* イベント区分 */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">イベント区分</Label>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={filters.eventType}
            onChange={(e) => updateFilter("eventType", e.target.value)}
          >
            <option value="">すべて</option>
            <option value="トリニティガール">トリニティガール</option>
            <option value="スロセレ">スロセレ</option>
            <option value="合同抽選会">合同抽選会</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 期間（実施日） */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">期間（開始）</Label>
          <Input
            type="date"
            className="h-9 text-sm"
            value={filters.dateFrom}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">期間（終了）</Label>
          <Input
            type="date"
            className="h-9 text-sm"
            value={filters.dateTo}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
          />
        </div>

        {/* ホール */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">ホール</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="ホール名で検索"
              className="pl-8 h-9 text-sm"
              value={filters.hallName}
              onChange={(e) => updateFilter("hallName", e.target.value)}
            />
          </div>
        </div>

        {/* 法人 */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">法人</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="法人名で検索"
              className="pl-8 h-9 text-sm"
              value={filters.companyId}
              onChange={(e) => updateFilter("companyId", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
