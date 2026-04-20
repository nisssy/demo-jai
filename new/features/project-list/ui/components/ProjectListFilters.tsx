import { useState } from "react"
import { Search, ChevronsUpDown, Check, Save, Trash2, Download, FolderOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import type { FilterState, SavedSearchCondition } from "@/new/features/project-list/model/types"
import type { Company, Hall } from "@/new/api/types"
import { getAllCategories, getAllEventTypes, getEventTypesByCategory } from "@/new/api/display"

/** 47都道府県 */
const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
]

/** 担当エリア選択肢 */
const AREA_OPTIONS = [
  "東京本社①",
  "東京本社②",
  "関東①",
  "関東②",
  "関西",
  "中部",
  "九州",
  "東北",
  "北海道",
]

/** 部署選択肢 */
const DEPARTMENT_OPTIONS = [
  "営業部",
  "管理部",
  "経理部",
  "企画部",
]

const CATEGORY_OPTIONS = getAllCategories()

/** ステータス（提案ステータス）選択肢 */
const STATUS_OPTIONS = [
  { value: "提案前", label: "提案前" },
  { value: "提案中", label: "提案中" },
  { value: "受注済み", label: "受注済み" },
]

/** 実施ステータス選択肢 */
const EXECUTION_STATUS_OPTIONS = [
  { value: "実施前", label: "実施前" },
  { value: "実施中", label: "実施中" },
  { value: "終了", label: "終了" },
]

/** 当選デザイン依頼ステータス選択肢 */
const DESIGN_ORDER_STATUS_OPTIONS = [
  { value: "未依頼", label: "未依頼" },
  { value: "依頼済み", label: "依頼済み" },
]

/** 景品発注依頼ステータス選択肢 */
const PRIZE_ORDER_STATUS_OPTIONS = [
  { value: "未発注", label: "未発注" },
  { value: "発注済み", label: "発注済み" },
]

/** リスト確認ステータス選択肢 */
const LIST_CONFIRM_STATUS_OPTIONS = [
  { value: "未確認", label: "未確認" },
  { value: "確認済み", label: "確認済み" },
]

type ProjectListFiltersProps = {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  // 法人検索
  companySearchOpen: boolean
  onCompanySearchOpenChange: (open: boolean) => void
  companySearchQuery: string
  onCompanySearchQueryChange: (query: string) => void
  filteredCompanies: Company[]
  getCompanyByCompanyId: (companyId: string) => Company | undefined
  onSelectCompany: (companyId: string) => void
  // ホール検索
  hallSearchOpen: boolean
  onHallSearchOpenChange: (open: boolean) => void
  hallSearchQuery: string
  onHallSearchQueryChange: (query: string) => void
  filteredHalls: Hall[]
  onSelectHall: (hallName: string) => void
  // 検索条件管理
  savedConditions: SavedSearchCondition[]
  onSaveCondition: (name: string) => void
  onDeleteCondition: (id: string) => void
  onApplyCondition: (id: string) => void
  onExportConditions: () => void
}

export const ProjectListFilters = ({
  filters,
  onFiltersChange,
  companySearchOpen,
  onCompanySearchOpenChange,
  companySearchQuery,
  onCompanySearchQueryChange,
  filteredCompanies,
  getCompanyByCompanyId,
  onSelectCompany,
  hallSearchOpen,
  onHallSearchOpenChange,
  hallSearchQuery,
  onHallSearchQueryChange,
  filteredHalls,
  onSelectHall,
  savedConditions,
  onSaveCondition,
  onDeleteCondition,
  onApplyCondition,
  onExportConditions,
}: ProjectListFiltersProps) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [savedListOpen, setSavedListOpen] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [productNameSearchOpen, setProductNameSearchOpen] = useState(false)
  const [productNameQuery, setProductNameQuery] = useState("")

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleStatus = (status: string) => {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status]
    updateFilter("statuses", next)
  }

  const toggleMultiSelect = (key: "prefectures" | "areas" | "departments" | "executionStatuses" | "designOrderStatuses" | "prizeOrderStatuses" | "listConfirmStatuses", value: string) => {
    const current = filters[key]
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    updateFilter(key, next)
  }

  const hasAnyFilter = Boolean(
    filters.projectNumber ||
      filters.recordNumber ||
      filters.projectName ||
      filters.salesPersonId ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.category ||
      filters.eventType ||
      filters.hallName ||
      filters.companyId ||
      filters.prefectures.length > 0 ||
      filters.areas.length > 0 ||
      filters.departments.length > 0 ||
      filters.statuses.length > 0 ||
      filters.executionStatuses.length > 0 ||
      filters.designOrderStatuses.length > 0 ||
      filters.prizeOrderStatuses.length > 0 ||
      filters.listConfirmStatuses.length > 0,
  )

  const clearAll = () => {
    onFiltersChange({
      projectNumber: "",
      projectNo: "",
      recordNumber: "",
      projectName: "",
      salesPersonId: "",
      dateMode: "execution",
      dateFrom: "",
      dateTo: "",
      category: "",
      eventType: "",
      hallName: "",
      companyId: "",
      prefectures: [],
      areas: [],
      departments: [],
      statuses: [],
      executionStatuses: [],
      designOrderStatuses: [],
      prizeOrderStatuses: [],
      listConfirmStatuses: [],
    })
  }

  const availableProductNames = filters.category
    ? getEventTypesByCategory(filters.category)
    : getAllEventTypes()
  const filteredProductNames = productNameQuery
    ? availableProductNames.filter((n) => n.toLowerCase().includes(productNameQuery.toLowerCase()))
    : availableProductNames

  return (
    <Card className="mb-6 border-slate-200 bg-slate-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900">
              <Search className="h-5 w-5 text-slate-600" />
              案件検索
            </CardTitle>
            <CardDescription>複数の条件で案件を絞り込むことができます</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* 保存済み条件一覧 */}
            <Dialog open={savedListOpen} onOpenChange={setSavedListOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <FolderOpen className="h-4 w-4" />
                  保存済み条件
                  {savedConditions.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5">{savedConditions.length}</Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>保存済み検索条件</DialogTitle>
                </DialogHeader>
                {savedConditions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">保存済みの条件はありません</div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {savedConditions.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                        <div>
                          <div className="font-medium text-sm">{c.name}</div>
                          <div className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString("ja-JP")}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => { onApplyCondition(c.id); setSavedListOpen(false) }}
                          >
                            適用
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-red-600 hover:text-red-700"
                            onClick={() => onDeleteCondition(c.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={onExportConditions} disabled={savedConditions.length === 0}>
                    <Download className="h-4 w-4" />
                    エクスポート
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* 条件保存ダイアログ */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5" disabled={!hasAnyFilter}>
                  <Save className="h-4 w-4" />
                  条件を保存
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>検索条件を保存</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Label>条件名</Label>
                  <Input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="例: 東京エリア イベント案件"
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      if (saveName.trim()) {
                        onSaveCondition(saveName.trim())
                        setSaveName("")
                        setSaveDialogOpen(false)
                      }
                    }}
                    disabled={!saveName.trim()}
                  >
                    保存
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 法人検索 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">法人</Label>
            <Popover open={companySearchOpen} onOpenChange={onCompanySearchOpenChange}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={companySearchOpen} className="w-full justify-between bg-white">
                  {filters.companyId
                    ? getCompanyByCompanyId(filters.companyId)?.name || "法人を検索..."
                    : "法人を検索..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="法人名を検索..."
                    value={companySearchQuery}
                    onValueChange={onCompanySearchQueryChange}
                  />
                  <CommandList>
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
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* ホール検索 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">ホール</Label>
            <Popover open={hallSearchOpen} onOpenChange={onHallSearchOpenChange}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={hallSearchOpen} className="w-full justify-between bg-white">
                  {filters.hallName || "ホールを検索..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="ホール名を検索..."
                    value={hallSearchQuery}
                    onValueChange={onHallSearchQueryChange}
                  />
                  <CommandList>
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
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* 都道府県（複数選択・検索付き） */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">都道府県</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between bg-white">
                  {filters.prefectures.length > 0
                    ? `${filters.prefectures.length}件選択中`
                    : "都道府県を検索..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="都道府県を検索..." />
                  <CommandList>
                    <CommandEmpty>見つかりませんでした</CommandEmpty>
                    <CommandGroup>
                      {PREFECTURES.map((pref) => (
                        <CommandItem
                          key={pref}
                          value={pref}
                          onSelect={() => toggleMultiSelect("prefectures", pref)}
                        >
                          <Check className={`mr-2 h-4 w-4 ${filters.prefectures.includes(pref) ? "opacity-100" : "opacity-0"}`} />
                          {pref}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* 担当エリア（複数選択・検索付き） */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">担当エリア</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between bg-white">
                  {filters.areas.length > 0
                    ? `${filters.areas.length}件選択中`
                    : "エリアを検索..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="エリアを検索..." />
                  <CommandList>
                    <CommandEmpty>見つかりませんでした</CommandEmpty>
                    <CommandGroup>
                      {AREA_OPTIONS.map((area) => (
                        <CommandItem
                          key={area}
                          value={area}
                          onSelect={() => toggleMultiSelect("areas", area)}
                        >
                          <Check className={`mr-2 h-4 w-4 ${filters.areas.includes(area) ? "opacity-100" : "opacity-0"}`} />
                          {area}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* 部署（複数選択・検索付き） */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">部署</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between bg-white">
                  {filters.departments.length > 0
                    ? `${filters.departments.length}件選択中`
                    : "部署を検索..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="部署を検索..." />
                  <CommandList>
                    <CommandEmpty>見つかりませんでした</CommandEmpty>
                    <CommandGroup>
                      {DEPARTMENT_OPTIONS.map((dept) => (
                        <CommandItem
                          key={dept}
                          value={dept}
                          onSelect={() => toggleMultiSelect("departments", dept)}
                        >
                          <Check className={`mr-2 h-4 w-4 ${filters.departments.includes(dept) ? "opacity-100" : "opacity-0"}`} />
                          {dept}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* ステータス（提案ステータス・複数選択） */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">ステータス</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-white">
                  {filters.statuses.length > 0
                    ? `${filters.statuses.length}件選択中`
                    : "ステータスを選択..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="p-3 space-y-1">
                  {STATUS_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
                      <Checkbox
                        checked={filters.statuses.includes(opt.value)}
                        onCheckedChange={() => toggleStatus(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* 実施ステータス（複数選択） */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">実施ステータス</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-white">
                  {filters.executionStatuses.length > 0
                    ? `${filters.executionStatuses.length}件選択中`
                    : "実施ステータスを選択..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="p-3 space-y-1">
                  {EXECUTION_STATUS_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
                      <Checkbox
                        checked={filters.executionStatuses.includes(opt.value)}
                        onCheckedChange={() => toggleMultiSelect("executionStatuses", opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* 当選デザイン依頼（複数選択） */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">当選デザイン依頼</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-white">
                  {filters.designOrderStatuses.length > 0
                    ? `${filters.designOrderStatuses.length}件選択中`
                    : "選択..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="p-3 space-y-1">
                  {DESIGN_ORDER_STATUS_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
                      <Checkbox
                        checked={filters.designOrderStatuses.includes(opt.value)}
                        onCheckedChange={() => toggleMultiSelect("designOrderStatuses", opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* 景品発注依頼（複数選択） */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">景品発注依頼</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-white">
                  {filters.prizeOrderStatuses.length > 0
                    ? `${filters.prizeOrderStatuses.length}件選択中`
                    : "選択..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="p-3 space-y-1">
                  {PRIZE_ORDER_STATUS_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
                      <Checkbox
                        checked={filters.prizeOrderStatuses.includes(opt.value)}
                        onCheckedChange={() => toggleMultiSelect("prizeOrderStatuses", opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* リスト確認（複数選択） */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">リスト確認</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-white">
                  {filters.listConfirmStatuses.length > 0
                    ? `${filters.listConfirmStatuses.length}件選択中`
                    : "選択..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="p-3 space-y-1">
                  {LIST_CONFIRM_STATUS_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
                      <Checkbox
                        checked={filters.listConfirmStatuses.includes(opt.value)}
                        onCheckedChange={() => toggleMultiSelect("listConfirmStatuses", opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* 商材区分 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">商材区分</Label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) => {
                const newCategory = value === "all" ? "" : value
                updateFilter("category", newCategory)
                if (filters.eventType && newCategory) {
                  const allowed = getEventTypesByCategory(newCategory)
                  if (!allowed.includes(filters.eventType)) {
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
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 商材名 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">商材名</Label>
            <Popover open={productNameSearchOpen} onOpenChange={setProductNameSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between bg-white">
                  {filters.eventType || "商材名を検索..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="商材名を入力..."
                    value={productNameQuery}
                    onValueChange={setProductNameQuery}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {productNameQuery && (
                        <CommandItem
                          value={productNameQuery}
                          onSelect={() => {
                            updateFilter("eventType", productNameQuery)
                            setProductNameSearchOpen(false)
                            setProductNameQuery("")
                          }}
                        >
                          「{productNameQuery}」で検索
                        </CommandItem>
                      )}
                    </CommandEmpty>
                    <CommandGroup heading="選択肢">
                      {filteredProductNames.map((name) => (
                        <CommandItem
                          key={name}
                          value={name}
                          onSelect={() => {
                            updateFilter("eventType", name)
                            setProductNameSearchOpen(false)
                            setProductNameQuery("")
                          }}
                        >
                          <Check className={`mr-2 h-4 w-4 ${filters.eventType === name ? "opacity-100" : "opacity-0"}`} />
                          {name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
              <span className="text-sm text-slate-500 shrink-0">-</span>
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

          {/* 案件番号検索 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">案件番号</Label>
            <Input
              placeholder="案件番号を入力..."
              value={filters.projectNumber}
              onChange={(e) => updateFilter("projectNumber", e.target.value)}
              className="bg-white"
            />
          </div>

          {/* レコード番号検索 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">レコード番号</Label>
            <Input
              placeholder="レコード番号を入力..."
              value={filters.recordNumber}
              onChange={(e) => updateFilter("recordNumber", e.target.value)}
              className="bg-white"
            />
          </div>

          {/* 案件名検索 */}
          <div className="lg:col-span-3 md:col-span-2 space-y-2">
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
              {filters.prefectures.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  都道府県: {filters.prefectures.join(", ")}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("prefectures", []) }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.areas.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  担当エリア: {filters.areas.join(", ")}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("areas", []) }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.departments.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  部署: {filters.departments.join(", ")}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("departments", []) }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  商材区分: {filters.category}
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
                  商材名: {filters.eventType}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("eventType", "") }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.statuses.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  ステータス: {filters.statuses.join(", ")}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("statuses", []) }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.executionStatuses.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  実施ステータス: {filters.executionStatuses.join(", ")}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("executionStatuses", []) }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.designOrderStatuses.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  当選デザイン依頼: {filters.designOrderStatuses.join(", ")}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("designOrderStatuses", []) }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.prizeOrderStatuses.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  景品発注依頼: {filters.prizeOrderStatuses.join(", ")}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("prizeOrderStatuses", []) }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.listConfirmStatuses.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  リスト確認: {filters.listConfirmStatuses.join(", ")}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("listConfirmStatuses", []) }}
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
                    onClick={(e) => { e.stopPropagation(); onFiltersChange({ ...filters, dateFrom: "", dateTo: "" }) }}
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
                  案件番号: {filters.projectNumber}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("projectNumber", "") }}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.recordNumber && (
                <Badge variant="secondary" className="gap-1">
                  レコード番号: {filters.recordNumber}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("recordNumber", "") }}
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
