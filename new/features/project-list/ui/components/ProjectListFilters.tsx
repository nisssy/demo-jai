import { useState } from "react"
import { Search, ChevronsUpDown, Check, Save, Trash2, Download, FolderOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import type { FilterState, SavedSearchCondition } from "@/new/features/project-list/model/types"
import type { Company, Hall } from "@/new/api/types"

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

/** 商材名の選択肢 */
const PRODUCT_NAME_OPTIONS = [
  "トリニティガール",
  "合同抽選会",
  "LINE広告",
  "お知らせバナー",
  "メインバナー",
  "スロセレ",
]

/** ステータス選択肢 */
const STATUS_OPTIONS = [
  { value: "提案前", label: "提案前" },
  { value: "提案中", label: "提案中" },
  { value: "受注済み", label: "受注済み" },
  { value: "実施前", label: "実施前" },
  { value: "実施中", label: "実施中" },
  { value: "終了", label: "終了" },
]

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
      filters.prefecture ||
      filters.statuses.length > 0,
  )

  const clearAll = () => {
    onFiltersChange({
      projectNumber: "",
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
      prefecture: "",
      statuses: [],
    })
  }

  const filteredProductNames = productNameQuery
    ? PRODUCT_NAME_OPTIONS.filter((n) => n.toLowerCase().includes(productNameQuery.toLowerCase()))
    : PRODUCT_NAME_OPTIONS

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

          {/* エリア（都道府県） */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">エリア</Label>
            <Select
              value={filters.prefecture || "all"}
              onValueChange={(value) => updateFilter("prefecture", value === "all" ? "" : value)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {PREFECTURES.map((pref) => (
                  <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 商材区分（旧: 商品カテゴリ） */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">商材区分</Label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) => {
                const newCategory = value === "all" ? "" : value
                updateFilter("category", newCategory)
                if (filters.eventType) {
                  if (newCategory && !PRODUCT_NAME_OPTIONS.some((n) => n === filters.eventType)) {
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
                <SelectItem value="オプション">オプション</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 商材名（旧: イベント区分）- コンボボックス（input+select） */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">商材名</Label>
            <Popover open={productNameSearchOpen} onOpenChange={setProductNameSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between bg-white">
                  {filters.eventType || "商材名を検索/選択..."}
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
              <span className="text-sm text-slate-500 shrink-0">〜</span>
              <Input type="date" value={filters.dateTo} onChange={(e) => updateFilter("dateTo", e.target.value)} className="bg-white flex-1 min-w-0" />
            </div>
          </div>

          {/* ステータス（複数選択） */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">ステータス</Label>
            <div className="bg-white border rounded-md p-3 space-y-2">
              {STATUS_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={filters.statuses.includes(opt.value)}
                    onCheckedChange={() => toggleStatus(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
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
              {filters.prefecture && (
                <Badge variant="secondary" className="gap-1">
                  エリア: {filters.prefecture}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateFilter("prefecture", "") }}
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
