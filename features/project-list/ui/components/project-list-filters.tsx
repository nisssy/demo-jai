"use client"

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
import type { CompanyData, HallData } from "@/lib/demo-db/types"

export type ProjectListFiltersProps = {
  // free text
  searchProjectNumber: string
  onSearchProjectNumberChange: (v: string) => void
  searchProjectName: string
  onSearchProjectNameChange: (v: string) => void
  searchSalesPersonName: string
  onSearchSalesPersonNameChange: (v: string) => void

  // date (mode switch)
  searchDateMode: "execution" | "created"
  onSearchDateModeChange: (v: "execution" | "created") => void
  searchDateFrom: string
  onSearchDateFromChange: (v: string) => void
  searchDateTo: string
  onSearchDateToChange: (v: string) => void

  // selects
  searchCategory: string | null
  onSearchCategoryChange: (v: string | null) => void
  searchEventType: string | null
  onSearchEventTypeChange: (v: string | null) => void

  // company/hall picker
  searchOpen: boolean
  onSearchOpenChange: (open: boolean) => void
  searchType: "hall" | "company"
  onSearchTypeChange: (t: "hall" | "company") => void
  searchQuery: string
  onSearchQueryChange: (v: string) => void
  selectedHallName: string | null
  onSelectedHallNameChange: (v: string | null) => void
  selectedCompanyId: string | null
  onSelectedCompanyIdChange: (v: string | null) => void

  // deps
  searchHalls: (query: string, companyId?: number) => HallData[]
  searchCompanies: (query: string) => CompanyData[]
  getCompanyByCompanyId: (companyId: string) => CompanyData | null
}

export function ProjectListFilters(props: ProjectListFiltersProps) {
  const {
    searchProjectNumber,
    onSearchProjectNumberChange,
    searchProjectName,
    onSearchProjectNameChange,
    searchSalesPersonName,
    onSearchSalesPersonNameChange,
    searchDateMode,
    onSearchDateModeChange,
    searchDateFrom,
    onSearchDateFromChange,
    searchDateTo,
    onSearchDateToChange,
    searchCategory,
    onSearchCategoryChange,
    searchEventType,
    onSearchEventTypeChange,
    searchOpen,
    onSearchOpenChange,
    searchType,
    onSearchTypeChange,
    searchQuery,
    onSearchQueryChange,
    selectedHallName,
    onSelectedHallNameChange,
    selectedCompanyId,
    onSelectedCompanyIdChange,
    searchHalls,
    searchCompanies,
    getCompanyByCompanyId,
  } = props

  const hasAnyFilter = Boolean(
    searchProjectNumber ||
      searchProjectName ||
      searchSalesPersonName ||
      searchDateFrom ||
      searchDateTo ||
      searchCategory ||
      searchEventType ||
      selectedHallName ||
      selectedCompanyId,
  )

  const clearAll = () => {
    onSearchProjectNumberChange("")
    onSearchProjectNameChange("")
    onSearchSalesPersonNameChange("")
    onSearchDateModeChange("execution")
    onSearchDateFromChange("")
    onSearchDateToChange("")
    onSearchCategoryChange(null)
    onSearchEventTypeChange(null)
    onSelectedHallNameChange(null)
    onSelectedCompanyIdChange(null)
    onSearchQueryChange("")
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
          {/* 案件No検索 */}
          <div className="space-y-2">
            <Label htmlFor="search-project-number" className="text-sm font-semibold">
              案件No
            </Label>
            <Input
              id="search-project-number"
              placeholder="案件Noを入力..."
              value={searchProjectNumber}
              onChange={(e) => onSearchProjectNumberChange(e.target.value)}
              className="bg-white"
            />
          </div>

          {/* 案件名検索 */}
          <div className="space-y-2">
            <Label htmlFor="search-project-name" className="text-sm font-semibold">
              案件名
            </Label>
            <Input
              id="search-project-name"
              placeholder="案件名を入力..."
              value={searchProjectName}
              onChange={(e) => onSearchProjectNameChange(e.target.value)}
              className="bg-white"
            />
          </div>

          {/* ホール担当営業検索 */}
          <div className="space-y-2">
            <Label htmlFor="search-sales-person" className="text-sm font-semibold">
              ホール担当営業
            </Label>
            <Input
              id="search-sales-person"
              placeholder="担当営業を入力..."
              value={searchSalesPersonName}
              onChange={(e) => onSearchSalesPersonNameChange(e.target.value)}
              className="bg-white"
            />
          </div>

          {/* 日付検索 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">日付</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={searchDateMode} onValueChange={(v) => onSearchDateModeChange(v as "execution" | "created")}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="execution">実施日</SelectItem>
                  <SelectItem value="created">作成日</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={searchDateFrom} onChange={(e) => onSearchDateFromChange(e.target.value)} className="bg-white" />
              <Input type="date" value={searchDateTo} onChange={(e) => onSearchDateToChange(e.target.value)} className="bg-white" />
            </div>
          </div>

          {/* 商材カテゴリ検索 */}
          <div className="space-y-2">
            <Label htmlFor="search-category" className="text-sm font-semibold">
              商材カテゴリ
            </Label>
            <Select
              value={searchCategory || undefined}
              onValueChange={(value: string) => onSearchCategoryChange(value === "all" ? null : value)}
            >
              <SelectTrigger id="search-category" className="bg-white">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="イベント">イベント</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* イベント区分検索 */}
          <div className="space-y-2">
            <Label htmlFor="search-event-type" className="text-sm font-semibold">
              イベント区分
            </Label>
            <Select
              value={searchEventType || undefined}
              onValueChange={(value: string) => onSearchEventTypeChange(value === "all" ? null : value)}
            >
              <SelectTrigger id="search-event-type" className="bg-white">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="トリニティガール">トリニティガール</SelectItem>
                <SelectItem value="スロセレ">スロセレ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 法人/ホール検索 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">法人/ホール</Label>
            <div className="flex gap-2">
              <Popover open={searchOpen} onOpenChange={onSearchOpenChange}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={searchOpen} className="flex-1 justify-between bg-white">
                    {searchType === "company"
                      ? selectedCompanyId
                        ? getCompanyByCompanyId(selectedCompanyId)?.name || "法人名を検索..."
                        : "法人名を検索..."
                      : selectedHallName || "ホール名を検索..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder={searchType === "hall" ? "ホール名を検索..." : "法人名を検索..."}
                      value={searchQuery}
                      onValueChange={onSearchQueryChange}
                    />
                    <CommandList>
                      {searchType === "hall" ? (
                        <>
                          <CommandEmpty>ホールが見つかりませんでした</CommandEmpty>
                          <CommandGroup>
                            {searchHalls(searchQuery).map((hall) => (
                              <CommandItem
                                key={hall.id}
                                value={hall.name}
                                onSelect={() => {
                                  onSelectedHallNameChange(hall.name)
                                  onSelectedCompanyIdChange(null)
                                  onSearchOpenChange(false)
                                  onSearchQueryChange("")
                                }}
                              >
                                <Check className={`mr-2 h-4 w-4 ${selectedHallName === hall.name ? "opacity-100" : "opacity-0"}`} />
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
                            {searchCompanies(searchQuery).map((company) => (
                              <CommandItem
                                key={company.id}
                                value={company.name}
                                onSelect={() => {
                                  onSelectedCompanyIdChange(company.companyId)
                                  onSelectedHallNameChange(null)
                                  onSearchOpenChange(false)
                                  onSearchQueryChange("")
                                }}
                              >
                                <Check className={`mr-2 h-4 w-4 ${selectedCompanyId === company.companyId ? "opacity-100" : "opacity-0"}`} />
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
                value={searchType}
                onValueChange={(value) => {
                  onSearchTypeChange(value as "hall" | "company")
                  onSelectedHallNameChange(null)
                  onSelectedCompanyIdChange(null)
                  onSearchQueryChange("")
                }}
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
        </div>

        {/* 検索条件の表示とクリアボタン */}
        {hasAnyFilter && (
          <div className="mt-4 pt-4 border-t border-blue-200 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-700">検索条件:</span>
              {searchProjectNumber && (
                <Badge variant="secondary" className="gap-1">
                  案件No: {searchProjectNumber}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSearchProjectNumberChange("")
                    }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchProjectName && (
                <Badge variant="secondary" className="gap-1">
                  案件名: {searchProjectName}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSearchProjectNameChange("")
                    }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchSalesPersonName && (
                <Badge variant="secondary" className="gap-1">
                  担当営業: {searchSalesPersonName}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSearchSalesPersonNameChange("")
                    }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {(searchDateFrom || searchDateTo) && (
                <Badge variant="secondary" className="gap-1">
                  {searchDateMode === "execution" ? "実施日" : "作成日"}: {searchDateFrom || "-"} 〜 {searchDateTo || "-"}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSearchDateFromChange("")
                      onSearchDateToChange("")
                    }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchCategory && (
                <Badge variant="secondary" className="gap-1">
                  カテゴリ: {searchCategory}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSearchCategoryChange(null)
                    }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchEventType && (
                <Badge variant="secondary" className="gap-1">
                  イベント区分: {searchEventType}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSearchEventTypeChange(null)
                    }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedHallName && (
                <Badge variant="secondary" className="gap-1">
                  ホール: {selectedHallName}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectedHallNameChange(null)
                    }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCompanyId && (
                <Badge variant="secondary" className="gap-1">
                  法人: {getCompanyByCompanyId(selectedCompanyId)?.name || selectedCompanyId}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectedCompanyIdChange(null)
                    }}
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

