import { Search, ChevronsUpDown, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import type { FilterState } from "@/new/features/project-list/model/types"
import type { Company, Hall } from "@/new/api/types"

type ProjectListFiltersProps = {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  // 法人/ホール検索
  companyHallSearchOpen: boolean
  onCompanyHallSearchOpenChange: (open: boolean) => void
  companyHallSearchType: "hall" | "company"
  onCompanyHallSearchTypeChange: (type: "hall" | "company") => void
  companyHallSearchQuery: string
  onCompanyHallSearchQueryChange: (query: string) => void
  filteredCompanies: Company[]
  filteredHalls: Hall[]
  getCompanyByCompanyId: (companyId: string) => Company | undefined
  onSelectHall: (hallName: string) => void
  onSelectCompany: (companyId: string) => void
}

export const ProjectListFilters = ({
  filters,
  onFiltersChange,
  companyHallSearchOpen,
  onCompanyHallSearchOpenChange,
  companyHallSearchType,
  onCompanyHallSearchTypeChange,
  companyHallSearchQuery,
  onCompanyHallSearchQueryChange,
  filteredCompanies,
  filteredHalls,
  getCompanyByCompanyId,
  onSelectHall,
  onSelectCompany,
}: ProjectListFiltersProps) => {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasAnyFilter = Boolean(
    filters.projectNumber ||
      filters.projectName ||
      filters.salesPersonId ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.category ||
      filters.eventType ||
      filters.hallName ||
      filters.companyId,
  )

  const clearAll = () => {
    onFiltersChange({
      projectNumber: "",
      projectName: "",
      salesPersonId: "",
      dateMode: "execution",
      dateFrom: "",
      dateTo: "",
      category: "",
      eventType: "",
      hallName: "",
      companyId: "",
    })
  }

  return (
    <Card className="mb-6 border-slate-200 bg-slate-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900">
          <Search className="h-5 w-5 text-slate-600" />
          案件検索
        </CardTitle>
        <CardDescription>複数の条件で案件を絞り込むことができます</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 法人/ホール検索 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">法人/ホール</Label>
            <div className="flex gap-2">
              <Popover open={companyHallSearchOpen} onOpenChange={onCompanyHallSearchOpenChange}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={companyHallSearchOpen} className="flex-1 justify-between bg-white">
                    {companyHallSearchType === "company"
                      ? filters.companyId
                        ? getCompanyByCompanyId(filters.companyId)?.name || "法人名を検索..."
                        : "法人名を検索..."
                      : filters.hallName || "ホール名を検索..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder={companyHallSearchType === "hall" ? "ホール名を検索..." : "法人名を検索..."}
                      value={companyHallSearchQuery}
                      onValueChange={onCompanyHallSearchQueryChange}
                    />
                    <CommandList>
                      {companyHallSearchType === "hall" ? (
                        <>
                          <CommandEmpty>ホールが見つかりませんでした</CommandEmpty>
                          <CommandGroup>
                            {filteredHalls.map((hall) => (
                              <CommandItem
                                key={hall.id}
                                value={hall.name}
                                onSelect={() => onSelectHall(hall.name)}
                              >
                                <Check className={`mr-2 h-4 w-4 ${filters.hallName === hall.name ? "opacity-100" : "opacity-0"}`} />
                                <div className="flex flex-col">
                                  <span>{hall.name}</span>
                                  <span className="text-xs text-slate-500">担当: {hall.salesPersonName}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      ) : (
                        <>
                          <CommandEmpty>法人が見つかりませんでした</CommandEmpty>
                          <CommandGroup>
                            {filteredCompanies.map((company) => (
                              <CommandItem
                                key={company.id}
                                value={company.name}
                                onSelect={() => onSelectCompany(company.companyId)}
                              >
                                <Check className={`mr-2 h-4 w-4 ${filters.companyId === company.companyId ? "opacity-100" : "opacity-0"}`} />
                                <div className="flex flex-col">
                                  <span>{company.name}</span>
                                  <span className="text-xs text-slate-500">法人ID: {company.companyId}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Tabs
                value={companyHallSearchType}
                onValueChange={(value) => onCompanyHallSearchTypeChange(value as "hall" | "company")}
              >
                <TabsList className="h-10 bg-white">
                  <TabsTrigger value="company" className="px-3">
                    法人
                  </TabsTrigger>
                  <TabsTrigger value="hall" className="px-3">
                    ホール
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* 商品カテゴリ検索 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">商品カテゴリ</Label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) => {
                const newCategory = value === "all" ? "" : value
                updateFilter("category", newCategory)
                if (filters.eventType) {
                  if (newCategory === "イベント" && filters.eventType === "合同抽選会") {
                    updateFilter("eventType", "")
                  } else if (newCategory === "ポイント" && (filters.eventType === "トリニティガール" || filters.eventType === "スロセレ")) {
                    updateFilter("eventType", "")
                  }
                }
              }}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="イベント">イベント</SelectItem>
                <SelectItem value="ポイント">ポイント</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* イベント区分検索 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">イベント区分</Label>
            <Select
              value={filters.eventType || "all"}
              onValueChange={(value) => {
                const newEventType = value === "all" ? "" : value
                if (newEventType === "トリニティガール" || newEventType === "スロセレ") {
                  onFiltersChange({ ...filters, eventType: newEventType, category: "イベント" })
                } else if (newEventType === "合同抽選会") {
                  onFiltersChange({ ...filters, eventType: newEventType, category: "ポイント" })
                } else {
                  updateFilter("eventType", newEventType)
                }
              }}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {(() => {
                  if (filters.category === "イベント") {
                    return (
                      <>
                        <SelectItem value="トリニティガール">トリニティガール</SelectItem>
                        <SelectItem value="スロセレ">スロセレ</SelectItem>
                      </>
                    )
                  }
                  if (filters.category === "ポイント") {
                    return <SelectItem value="合同抽選会">合同抽選会</SelectItem>
                  }
                  return (
                    <>
                      <SelectItem value="トリニティガール">トリニティガール</SelectItem>
                      <SelectItem value="スロセレ">スロセレ</SelectItem>
                      <SelectItem value="合同抽選会">合同抽選会</SelectItem>
                    </>
                  )
                })()}
              </SelectContent>
            </Select>
          </div>

          {/* 期間検索 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">期間</Label>
            <Select value={filters.dateMode} onValueChange={(v) => updateFilter("dateMode", v as "execution" | "created")}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="execution">実施日</SelectItem>
                <SelectItem value="created">作成日</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input type="date" value={filters.dateFrom} onChange={(e) => updateFilter("dateFrom", e.target.value)} className="bg-white flex-1 min-w-0" />
              <span className="text-sm text-slate-500 shrink-0">〜</span>
              <Input type="date" value={filters.dateTo} onChange={(e) => updateFilter("dateTo", e.target.value)} className="bg-white flex-1 min-w-0" />
            </div>
          </div>

          {/* ホール担当検索 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">ホール担当</Label>
            <Input
              placeholder="ホール担当を検索..."
              value={filters.salesPersonId}
              onChange={(e) => updateFilter("salesPersonId", e.target.value)}
              className="bg-white"
            />
          </div>

          {/* 案件No検索 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">案件No</Label>
            <Input
              placeholder="案件Noを入力..."
              value={filters.projectNumber}
              onChange={(e) => updateFilter("projectNumber", e.target.value)}
              className="bg-white"
            />
          </div>

          {/* 案件名検索 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">案件名</Label>
            <Input
              placeholder="案件名を入力..."
              value={filters.projectName}
              onChange={(e) => updateFilter("projectName", e.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        {/* 検索条件の表示とクリアボタン */}
        {hasAnyFilter && (
          <div className="mt-4 pt-4 border-t border-blue-200 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-700">検索条件:</span>
              {filters.companyId && (
                <Badge variant="secondary" className="gap-1">
                  法人: {getCompanyByCompanyId(filters.companyId)?.name || filters.companyId}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("companyId", "") }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.hallName && (
                <Badge variant="secondary" className="gap-1">
                  ホール: {filters.hallName}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("hallName", "") }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  カテゴリ: {filters.category}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("category", "") }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.eventType && (
                <Badge variant="secondary" className="gap-1">
                  イベント区分: {filters.eventType}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("eventType", "") }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <Badge variant="secondary" className="gap-1">
                  {filters.dateMode === "execution" ? "実施日" : "作成日"}: {filters.dateFrom || "-"} 〜 {filters.dateTo || "-"}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("dateFrom", ""); updateFilter("dateTo", "") }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.salesPersonId && (
                <Badge variant="secondary" className="gap-1">
                  ホール担当: {filters.salesPersonId}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("salesPersonId", "") }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.projectNumber && (
                <Badge variant="secondary" className="gap-1">
                  案件No: {filters.projectNumber}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("projectNumber", "") }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.projectName && (
                <Badge variant="secondary" className="gap-1">
                  案件名: {filters.projectName}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("projectName", "") }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={clearAll} className="gap-2">
              すべてクリア
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
