import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import type { Company, Hall } from "@/new/api/types"
import type { FormErrors } from "@/new/features/project-registration/model/types"

type BasicInfoSectionProps = {
  companyId: string
  companyName: string
  hallId: string
  hallName: string
  projectName: string
  salesPersonName: string
  insightPersonName?: string
  requestDate: string
  errors: FormErrors
  // 法人検索
  companySearchOpen: boolean
  onCompanySearchOpenChange: (open: boolean) => void
  companySearchQuery: string
  onCompanySearchQueryChange: (query: string) => void
  filteredCompanies: Company[]
  onSelectCompany: (company: Company) => void
  // ホール検索
  hallSearchOpen: boolean
  onHallSearchOpenChange: (open: boolean) => void
  hallSearchQuery: string
  onHallSearchQueryChange: (query: string) => void
  filteredHalls: Hall[]
  onSelectHall: (hall: Hall) => void
  // 更新
  onProjectNameChange: (value: string) => void
  onSalesPersonNameChange: (value: string) => void
  onRequestDateChange: (value: string) => void
}

export const BasicInfoSection = ({
  companyId,
  companyName,
  hallId,
  hallName,
  projectName,
  salesPersonName,
  insightPersonName,
  requestDate,
  errors,
  companySearchOpen,
  onCompanySearchOpenChange,
  companySearchQuery,
  onCompanySearchQueryChange,
  filteredCompanies,
  onSelectCompany,
  hallSearchOpen,
  onHallSearchOpenChange,
  hallSearchQuery,
  onHallSearchQueryChange,
  filteredHalls,
  onSelectHall,
  onProjectNameChange,
  onSalesPersonNameChange,
  onRequestDateChange,
}: BasicInfoSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>基本情報</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* 法人名 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">法人名</Label>
            <Popover open={companySearchOpen} onOpenChange={onCompanySearchOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={companySearchOpen}
                  className={`w-full justify-between ${errors.companyName ? "border-red-500" : ""}`}
                >
                  {companyName || "法人名を検索..."}
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
                          onSelect={() => onSelectCompany(company)}
                        >
                          <Check className={`mr-2 h-4 w-4 ${companyId === company.companyId ? "opacity-100" : "opacity-0"}`} />
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
            {errors.companyName && <p className="text-xs text-red-500">{errors.companyName}</p>}
          </div>

          {/* 法人ID */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">法人ID</Label>
            <Input value={companyId} disabled className="bg-slate-50" />
          </div>

          {/* ホール名 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">ホール名</Label>
            <Popover open={hallSearchOpen} onOpenChange={onHallSearchOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={hallSearchOpen}
                  className={`w-full justify-between ${errors.hallName ? "border-red-500" : ""}`}
                >
                  {hallName || "ホール名を検索..."}
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
                          onSelect={() => onSelectHall(hall)}
                        >
                          <Check className={`mr-2 h-4 w-4 ${hallId === hall.hallId ? "opacity-100" : "opacity-0"}`} />
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
            {errors.hallName && <p className="text-xs text-red-500">{errors.hallName}</p>}
          </div>

          {/* ホールID */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">ホールID</Label>
            <Input value={hallId} disabled className="bg-slate-50" />
          </div>

          {/* 案件名 */}
          <div className="space-y-2 col-span-2">
            <Label className="text-sm font-semibold">案件名</Label>
            <Input
              placeholder="例: マルハン渋谷店 - 山田 太郎"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              className={errors.projectName ? "border-red-500" : ""}
            />
            {errors.projectName && <p className="text-xs text-red-500">{errors.projectName}</p>}
          </div>

          {/* ホール担当営業 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">ホール担当営業</Label>
            <Input
              placeholder="例: 山田 太郎"
              value={salesPersonName}
              onChange={(e) => onSalesPersonNameChange(e.target.value)}
              className={errors.salesPersonName ? "border-red-500" : ""}
            />
            {errors.salesPersonName && <p className="text-xs text-red-500">{errors.salesPersonName}</p>}
          </div>

          {/* インサイト担当 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">インサイト担当</Label>
            <Input
              placeholder="ホール選択時に自動入力"
              value={insightPersonName ?? ""}
              readOnly
              className="bg-slate-50"
            />
          </div>

          {/* 作成日 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">作成日</Label>
            <Input
              type="date"
              value={requestDate}
              onChange={(e) => onRequestDateChange(e.target.value)}
              className={errors.requestDate ? "border-red-500" : ""}
            />
            {errors.requestDate && <p className="text-xs text-red-500">{errors.requestDate}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
