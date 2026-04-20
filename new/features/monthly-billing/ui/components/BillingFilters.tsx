import { useState } from "react"
import { Search, ChevronsUpDown, Check } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Company, Hall, Employee } from "@/new/api/types"
import { getAllCategories, getAllEventTypes } from "@/new/api/display"

export type BillingFilterState = {
  companyId: string
  hallName: string
  prefectures: string[]
  areas: string[]
  departments: string[]
  category: string
  productName: string
  quoteId: string
  dateFrom: string
  dateTo: string
  hallSalesPerson: string
  projectNumber: string
  recordNumber: string
  projectName: string
  // 請求タブ追加フィルタ
  proposalStatuses: string[]
  executionStatuses: string[]
  designOrderStatuses: string[]
  prizeOrderStatuses: string[]
  listConfirmStatuses: string[]
  serviceName: string
  adminPersonId: string
}

export const INITIAL_BILLING_FILTERS: BillingFilterState = {
  companyId: "",
  hallName: "",
  prefectures: [],
  areas: [],
  departments: [],
  category: "",
  productName: "",
  quoteId: "",
  dateFrom: "",
  dateTo: "",
  hallSalesPerson: "",
  projectNumber: "",
  recordNumber: "",
  projectName: "",
  proposalStatuses: [],
  executionStatuses: [],
  designOrderStatuses: [],
  prizeOrderStatuses: [],
  listConfirmStatuses: [],
  serviceName: "",
  adminPersonId: "",
}

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

const AREA_OPTIONS = ["東京本社①", "東京本社②", "関東①", "関東②", "関西", "中部", "九州", "東北", "北海道"]
const DEPARTMENT_OPTIONS = ["営業部", "管理部", "経理部", "企画部"]
const CATEGORY_OPTIONS = getAllCategories()
const PRODUCT_NAME_OPTIONS = getAllEventTypes()
const PROPOSAL_STATUS_OPTIONS = [
  { value: "before-proposal", label: "提案前" },
  { value: "proposing", label: "提案中" },
  { value: "order-received", label: "受注済み" },
]
const EXECUTION_STATUS_OPTIONS = ["実施前", "実施中", "終了"]
const DONE_NOT_OPTIONS = [
  { value: "done", label: "実施済み" },
  { value: "not", label: "未実施" },
]
const LIST_CONFIRM_OPTIONS = [
  { value: "done", label: "確認済" },
  { value: "not", label: "確認前" },
]
const SERVICE_NAME_OPTIONS = ["たまリッチ", "SmartPoint"]

type BillingFiltersProps = {
  filters: BillingFilterState
  onFiltersChange: (filters: BillingFilterState) => void
  companies: Company[]
  halls: Hall[]
  employees?: Employee[]
  showInvoiceFilters?: boolean
}

export const BillingFilters = ({ filters, onFiltersChange, companies, halls, employees = [], showInvoiceFilters = false }: BillingFiltersProps) => {
  const [companyOpen, setCompanyOpen] = useState(false)
  const [companyQuery, setCompanyQuery] = useState("")
  const [hallOpen, setHallOpen] = useState(false)
  const [hallQuery, setHallQuery] = useState("")

  const update = <K extends keyof BillingFilterState>(key: K, value: BillingFilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleMulti = (key: "prefectures" | "areas" | "departments" | "proposalStatuses" | "executionStatuses" | "designOrderStatuses" | "prizeOrderStatuses" | "listConfirmStatuses", value: string) => {
    const cur = filters[key]
    update(key, cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value])
  }

  const hasAny = Object.entries(filters).some(([, v]) => (Array.isArray(v) ? v.length > 0 : Boolean(v)))

  const filteredCompanies = companyQuery
    ? companies.filter((c) => c.name.includes(companyQuery) || c.companyId.includes(companyQuery))
    : companies.slice(0, 20)

  const filteredHalls = hallQuery
    ? halls.filter((h) => h.name.includes(hallQuery))
    : halls.slice(0, 20)

  const selectedCompany = filters.companyId ? companies.find((c) => c.companyId === filters.companyId) : undefined

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">検索条件</span>
        </div>
        {hasAny && (
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onFiltersChange(INITIAL_BILLING_FILTERS)}>
            クリア
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {/* 法人 */}
        <div className="space-y-1">
          <Label className="text-xs">法人</Label>
          <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8 font-normal">
                {selectedCompany ? selectedCompany.name : "選択"}
                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput placeholder="法人検索..." value={companyQuery} onValueChange={setCompanyQuery} className="text-xs" />
                <CommandList>
                  <CommandEmpty>見つかりません</CommandEmpty>
                  <CommandGroup>
                    {filteredCompanies.map((c) => (
                      <CommandItem key={c.companyId} onSelect={() => { update("companyId", filters.companyId === c.companyId ? "" : c.companyId); setCompanyOpen(false) }} className="text-xs">
                        <Check className={`mr-2 h-3 w-3 ${filters.companyId === c.companyId ? "opacity-100" : "opacity-0"}`} />
                        {c.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* ホール */}
        <div className="space-y-1">
          <Label className="text-xs">ホール</Label>
          <Popover open={hallOpen} onOpenChange={setHallOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8 font-normal">
                {filters.hallName || "選択"}
                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput placeholder="ホール検索..." value={hallQuery} onValueChange={setHallQuery} className="text-xs" />
                <CommandList>
                  <CommandEmpty>見つかりません</CommandEmpty>
                  <CommandGroup>
                    {filteredHalls.map((h) => (
                      <CommandItem key={h.hallId} onSelect={() => { update("hallName", filters.hallName === h.name ? "" : h.name); setHallOpen(false) }} className="text-xs">
                        <Check className={`mr-2 h-3 w-3 ${filters.hallName === h.name ? "opacity-100" : "opacity-0"}`} />
                        {h.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* 都道府県 */}
        <div className="space-y-1">
          <Label className="text-xs">都道府県</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8 font-normal">
                {filters.prefectures.length > 0 ? `${filters.prefectures.length}件選択` : "選択"}
                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2 max-h-[300px] overflow-y-auto">
              {PREFECTURES.map((p) => (
                <label key={p} className="flex items-center gap-2 py-0.5 cursor-pointer">
                  <Checkbox checked={filters.prefectures.includes(p)} onCheckedChange={() => toggleMulti("prefectures", p)} className="h-3.5 w-3.5" />
                  <span className="text-xs">{p}</span>
                </label>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* 担当エリア */}
        <div className="space-y-1">
          <Label className="text-xs">担当エリア</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8 font-normal">
                {filters.areas.length > 0 ? `${filters.areas.length}件選択` : "選択"}
                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-2">
              {AREA_OPTIONS.map((a) => (
                <label key={a} className="flex items-center gap-2 py-0.5 cursor-pointer">
                  <Checkbox checked={filters.areas.includes(a)} onCheckedChange={() => toggleMulti("areas", a)} className="h-3.5 w-3.5" />
                  <span className="text-xs">{a}</span>
                </label>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* 部署 */}
        <div className="space-y-1">
          <Label className="text-xs">部署</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8 font-normal">
                {filters.departments.length > 0 ? `${filters.departments.length}件選択` : "選択"}
                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[160px] p-2">
              {DEPARTMENT_OPTIONS.map((d) => (
                <label key={d} className="flex items-center gap-2 py-0.5 cursor-pointer">
                  <Checkbox checked={filters.departments.includes(d)} onCheckedChange={() => toggleMulti("departments", d)} className="h-3.5 w-3.5" />
                  <span className="text-xs">{d}</span>
                </label>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* 商材区分 */}
        <div className="space-y-1">
          <Label className="text-xs">商材区分</Label>
          <Select value={filters.category || "_all"} onValueChange={(v) => update("category", v === "_all" ? "" : v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all" className="text-xs">すべて</SelectItem>
              {CATEGORY_OPTIONS.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* 商材名 */}
        <div className="space-y-1">
          <Label className="text-xs">商材名</Label>
          <Select value={filters.productName || "_all"} onValueChange={(v) => update("productName", v === "_all" ? "" : v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all" className="text-xs">すべて</SelectItem>
              {PRODUCT_NAME_OPTIONS.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* 見積書ID */}
        <div className="space-y-1">
          <Label className="text-xs">見積書ID</Label>
          <Input value={filters.quoteId} onChange={(e) => update("quoteId", e.target.value)} className="h-8 text-xs" placeholder="Q-..." />
        </div>

        {/* 期間 */}
        <div className="space-y-1">
          <Label className="text-xs">期間（開始）</Label>
          <Input type="date" value={filters.dateFrom} onChange={(e) => update("dateFrom", e.target.value)} className="h-8 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">期間（終了）</Label>
          <Input type="date" value={filters.dateTo} onChange={(e) => update("dateTo", e.target.value)} className="h-8 text-xs" />
        </div>

        {/* ホール担当 */}
        <div className="space-y-1">
          <Label className="text-xs">ホール担当</Label>
          <Input value={filters.hallSalesPerson} onChange={(e) => update("hallSalesPerson", e.target.value)} className="h-8 text-xs" placeholder="担当者名" />
        </div>

        {/* 案件番号 */}
        <div className="space-y-1">
          <Label className="text-xs">案件番号</Label>
          <Input value={filters.projectNumber} onChange={(e) => update("projectNumber", e.target.value)} className="h-8 text-xs" placeholder="PJ-..." />
        </div>

        {/* レコード番号 */}
        <div className="space-y-1">
          <Label className="text-xs">レコード番号</Label>
          <Input value={filters.recordNumber} onChange={(e) => update("recordNumber", e.target.value)} className="h-8 text-xs" placeholder="R-..." />
        </div>

        {/* 案件名 */}
        <div className="space-y-1">
          <Label className="text-xs">案件名</Label>
          <Input value={filters.projectName} onChange={(e) => update("projectName", e.target.value)} className="h-8 text-xs" placeholder="案件名" />
        </div>

        {/* 請求タブ固有フィルタ */}
        {showInvoiceFilters && (
          <>
            {/* 見積ステータス */}
            <div className="space-y-1">
              <Label className="text-xs">見積ステータス</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8 font-normal">
                    {filters.proposalStatuses.length > 0 ? `${filters.proposalStatuses.length}件選択` : "選択"}
                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[160px] p-2">
                  {PROPOSAL_STATUS_OPTIONS.map((o) => (
                    <label key={o.value} className="flex items-center gap-2 py-0.5 cursor-pointer">
                      <Checkbox checked={filters.proposalStatuses.includes(o.value)} onCheckedChange={() => toggleMulti("proposalStatuses", o.value)} className="h-3.5 w-3.5" />
                      <span className="text-xs">{o.label}</span>
                    </label>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* 実施ステータス */}
            <div className="space-y-1">
              <Label className="text-xs">実施ステータス</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8 font-normal">
                    {filters.executionStatuses.length > 0 ? `${filters.executionStatuses.length}件選択` : "選択"}
                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[140px] p-2">
                  {EXECUTION_STATUS_OPTIONS.map((s) => (
                    <label key={s} className="flex items-center gap-2 py-0.5 cursor-pointer">
                      <Checkbox checked={filters.executionStatuses.includes(s)} onCheckedChange={() => toggleMulti("executionStatuses", s)} className="h-3.5 w-3.5" />
                      <span className="text-xs">{s}</span>
                    </label>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* 当選デザイン依頼 */}
            <div className="space-y-1">
              <Label className="text-xs">当選デザイン依頼</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8 font-normal">
                    {filters.designOrderStatuses.length > 0 ? `${filters.designOrderStatuses.length}件選択` : "選択"}
                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[140px] p-2">
                  {DONE_NOT_OPTIONS.map((o) => (
                    <label key={o.value} className="flex items-center gap-2 py-0.5 cursor-pointer">
                      <Checkbox checked={filters.designOrderStatuses.includes(o.value)} onCheckedChange={() => toggleMulti("designOrderStatuses", o.value)} className="h-3.5 w-3.5" />
                      <span className="text-xs">{o.label}</span>
                    </label>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* 景品発注依頼 */}
            <div className="space-y-1">
              <Label className="text-xs">景品発注依頼</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8 font-normal">
                    {filters.prizeOrderStatuses.length > 0 ? `${filters.prizeOrderStatuses.length}件選択` : "選択"}
                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[140px] p-2">
                  {DONE_NOT_OPTIONS.map((o) => (
                    <label key={o.value} className="flex items-center gap-2 py-0.5 cursor-pointer">
                      <Checkbox checked={filters.prizeOrderStatuses.includes(o.value)} onCheckedChange={() => toggleMulti("prizeOrderStatuses", o.value)} className="h-3.5 w-3.5" />
                      <span className="text-xs">{o.label}</span>
                    </label>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* リスト確認 */}
            <div className="space-y-1">
              <Label className="text-xs">リスト確認</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8 font-normal">
                    {filters.listConfirmStatuses.length > 0 ? `${filters.listConfirmStatuses.length}件選択` : "選択"}
                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[140px] p-2">
                  {LIST_CONFIRM_OPTIONS.map((o) => (
                    <label key={o.value} className="flex items-center gap-2 py-0.5 cursor-pointer">
                      <Checkbox checked={filters.listConfirmStatuses.includes(o.value)} onCheckedChange={() => toggleMulti("listConfirmStatuses", o.value)} className="h-3.5 w-3.5" />
                      <span className="text-xs">{o.label}</span>
                    </label>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* サービス名 */}
            <div className="space-y-1">
              <Label className="text-xs">サービス名</Label>
              <Select value={filters.serviceName || "_all"} onValueChange={(v) => update("serviceName", v === "_all" ? "" : v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all" className="text-xs">すべて</SelectItem>
                  {SERVICE_NAME_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 事務担当者 */}
            <div className="space-y-1">
              <Label className="text-xs">事務担当者</Label>
              <Select value={filters.adminPersonId || "_all"} onValueChange={(v) => update("adminPersonId", v === "_all" ? "" : v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all" className="text-xs">すべて</SelectItem>
                  {employees.filter((e) => e.department === "事務管理課").map((e) => (
                    <SelectItem key={e.id} value={String(e.id)} className="text-xs">{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Active filter badges */}
      {hasAny && (
        <div className="flex flex-wrap gap-1">
          {selectedCompany && <Badge variant="secondary" className="text-xs">{selectedCompany.name}</Badge>}
          {filters.hallName && <Badge variant="secondary" className="text-xs">{filters.hallName}</Badge>}
          {filters.prefectures.map((p) => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
          {filters.areas.map((a) => <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>)}
          {filters.departments.map((d) => <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>)}
          {filters.category && <Badge variant="secondary" className="text-xs">{filters.category}</Badge>}
          {filters.productName && <Badge variant="secondary" className="text-xs">{filters.productName}</Badge>}
          {filters.quoteId && <Badge variant="secondary" className="text-xs">見積書ID: {filters.quoteId}</Badge>}
          {filters.hallSalesPerson && <Badge variant="secondary" className="text-xs">担当: {filters.hallSalesPerson}</Badge>}
          {filters.projectNumber && <Badge variant="secondary" className="text-xs">案件: {filters.projectNumber}</Badge>}
          {filters.recordNumber && <Badge variant="secondary" className="text-xs">レコード: {filters.recordNumber}</Badge>}
          {filters.projectName && <Badge variant="secondary" className="text-xs">{filters.projectName}</Badge>}
          {filters.proposalStatuses.map((s) => <Badge key={s} variant="secondary" className="text-xs">{PROPOSAL_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s}</Badge>)}
          {filters.executionStatuses.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
          {filters.designOrderStatuses.map((s) => <Badge key={s} variant="secondary" className="text-xs">デザイン: {DONE_NOT_OPTIONS.find((o) => o.value === s)?.label ?? s}</Badge>)}
          {filters.prizeOrderStatuses.map((s) => <Badge key={s} variant="secondary" className="text-xs">景品: {DONE_NOT_OPTIONS.find((o) => o.value === s)?.label ?? s}</Badge>)}
          {filters.listConfirmStatuses.map((s) => <Badge key={s} variant="secondary" className="text-xs">リスト: {LIST_CONFIRM_OPTIONS.find((o) => o.value === s)?.label ?? s}</Badge>)}
          {filters.serviceName && <Badge variant="secondary" className="text-xs">{filters.serviceName}</Badge>}
          {filters.adminPersonId && <Badge variant="secondary" className="text-xs">事務: {employees.find((e) => String(e.id) === filters.adminPersonId)?.name ?? filters.adminPersonId}</Badge>}
        </div>
      )}
    </div>
  )
}
