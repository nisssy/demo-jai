import type { LotteryHallEntry } from "@/new/features/project-registration/model/lottery-types"
import type { Company, Hall, Employee } from "@/new/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Plus, ChevronsUpDown } from "lucide-react"
import { LotteryHallRow } from "./LotteryHallRow"
import { useState } from "react"

type LotteryBasicInfoProps = {
  halls: LotteryHallEntry[]
  serviceName: "たまリッチ" | "SmartPoint" | ""
  posterDesignChange: "yes" | "no"
  eventStartDate: string
  eventEndDate: string
  salesPersonName: string
  insightPersonName: string
  eventName: string
  allHalls: Hall[]
  allCompanies: Company[]
  allEmployees: Employee[]
  onAddHall: () => void
  onRemoveHall: (index: number) => void
  onSelectCompanyForHall: (index: number, companyId: string) => void
  onSelectHallForEntry: (index: number, hallName: string) => void
  onServiceNameChange: (value: "たまリッチ" | "SmartPoint" | "") => void
  onPosterDesignChangeChange: (value: "yes" | "no") => void
  onEventStartDateChange: (value: string) => void
  onEventEndDateChange: (value: string) => void
  onSalesPersonChange: (id: string, name: string) => void
  onInsightPersonChange: (id: string, name: string) => void
  onEventNameChange: (value: string) => void
  getHallsByCompanyId: (companyId: number) => Hall[]
}

export const LotteryBasicInfo = ({
  halls,
  serviceName,
  posterDesignChange,
  eventStartDate,
  eventEndDate,
  salesPersonName,
  insightPersonName,
  eventName,
  allHalls,
  allCompanies,
  allEmployees,
  onAddHall,
  onRemoveHall,
  onSelectCompanyForHall,
  onSelectHallForEntry,
  onServiceNameChange,
  onPosterDesignChangeChange,
  onEventStartDateChange,
  onEventEndDateChange,
  onSalesPersonChange,
  onInsightPersonChange,
  onEventNameChange,
  getHallsByCompanyId,
}: LotteryBasicInfoProps) => {
  const [salesOpen, setSalesOpen] = useState(false)
  const [salesQuery, setSalesQuery] = useState("")
  const [insightOpen, setInsightOpen] = useState(false)
  const [insightQuery, setInsightQuery] = useState("")

  const filteredSalesEmployees = salesQuery
    ? allEmployees.filter((e) => e.name.includes(salesQuery))
    : allEmployees

  const filteredInsightEmployees = insightQuery
    ? allEmployees.filter((e) => e.name.includes(insightQuery))
    : allEmployees

  return (
    <div className="space-y-5">
      {/* サービス名 */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">サービス名</Label>
        <Select value={serviceName || "たまリッチ"} onValueChange={(v) => onServiceNameChange(v as "たまリッチ" | "SmartPoint")}>
          <SelectTrigger className="w-48 h-9 text-xs">
            <SelectValue placeholder="サービス名を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="たまリッチ" className="text-xs">たまリッチ</SelectItem>
            <SelectItem value="SmartPoint" className="text-xs">SmartPoint</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ホール情報 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">ホール情報</Label>
          <Button variant="outline" size="sm" onClick={onAddHall} className="text-xs gap-1">
            <Plus className="h-3.5 w-3.5" />
            ホールを追加
          </Button>
        </div>
        <div className="text-xs text-slate-500 grid grid-cols-[1fr_auto_1fr_auto_auto] gap-2 px-1">
          <span>法人名</span>
          <span className="w-24">法人営業担当</span>
          <span>ホール名</span>
          <span className="w-24">ホール営業担当</span>
          <span className="w-9" />
        </div>
        <div className="space-y-2">
          {halls.map((hall, index) => {
            const company = allCompanies.find((c) => c.companyId === hall.companyId)
            const companyNumId = company?.id
            const hallsForCompany = companyNumId ? getHallsByCompanyId(companyNumId) : allHalls
            return (
              <LotteryHallRow
                key={index}
                index={index}
                hall={hall}
                hallOptions={hallsForCompany}
                companyOptions={allCompanies}
                canRemove={halls.length > 1}
                onSelectCompany={(companyId) => onSelectCompanyForHall(index, companyId)}
                onSelectHall={(hallName) => onSelectHallForEntry(index, hallName)}
                onRemove={() => onRemoveHall(index)}
              />
            )
          })}
        </div>
      </div>

      {/* ポスター有無 */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">ポスター有無</Label>
        <Select value={posterDesignChange} onValueChange={(v) => onPosterDesignChangeChange(v as "yes" | "no")}>
          <SelectTrigger className="w-32 h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no" className="text-xs">無</SelectItem>
            <SelectItem value="yes" className="text-xs">有</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* イベント期間 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">イベント開始日</Label>
          <Input type="date" value={eventStartDate} max={eventEndDate || undefined} onChange={(e) => onEventStartDateChange(e.target.value)} className="text-xs h-9" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">イベント終了日</Label>
          <Input type="date" value={eventEndDate} min={eventStartDate || undefined} onChange={(e) => onEventEndDateChange(e.target.value)} className="text-xs h-9" />
        </div>
      </div>

      {/* 営業担当 / インサイト担当 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">営業担当</Label>
          <Popover open={salesOpen} onOpenChange={setSalesOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between text-xs h-9">
                <span className="truncate">{salesPersonName || "営業担当を選択"}</span>
                <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder="名前で検索..." value={salesQuery} onValueChange={setSalesQuery} className="text-xs" />
                <CommandList>
                  <CommandEmpty>見つかりませんでした</CommandEmpty>
                  <CommandGroup>
                    {filteredSalesEmployees.slice(0, 15).map((e) => (
                      <CommandItem key={e.id} value={e.name} onSelect={() => { onSalesPersonChange(String(e.id), e.name); setSalesOpen(false); setSalesQuery("") }} className="text-xs">
                        {e.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">インサイト担当</Label>
          <Popover open={insightOpen} onOpenChange={setInsightOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between text-xs h-9">
                <span className="truncate">{insightPersonName || "インサイト担当を選択"}</span>
                <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder="名前で検索..." value={insightQuery} onValueChange={setInsightQuery} className="text-xs" />
                <CommandList>
                  <CommandEmpty>見つかりませんでした</CommandEmpty>
                  <CommandGroup>
                    {filteredInsightEmployees.slice(0, 15).map((e) => (
                      <CommandItem key={e.id} value={e.name} onSelect={() => { onInsightPersonChange(String(e.id), e.name); setInsightOpen(false); setInsightQuery("") }} className="text-xs">
                        {e.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* イベント名 */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">イベント名</Label>
        <Input value={eventName} onChange={(e) => onEventNameChange(e.target.value)} placeholder="例: 年末大抽選会" className="text-xs h-9" />
      </div>
    </div>
  )
}
