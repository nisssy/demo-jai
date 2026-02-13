import type { LotteryHallEntry } from "@/new/features/project-registration/model/lottery-types"
import type { Company, Hall } from "@/new/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronsUpDown, X } from "lucide-react"
import { useState } from "react"

type LotteryHallRowProps = {
  index: number
  hall: LotteryHallEntry
  hallOptions: Hall[]
  companyOptions: Company[]
  canRemove: boolean
  onSelectCompany: (companyId: string) => void
  onSelectHall: (hallName: string) => void
  onRemove: () => void
}

export const LotteryHallRow = ({
  hall,
  hallOptions,
  companyOptions,
  canRemove,
  onSelectCompany,
  onSelectHall,
  onRemove,
}: LotteryHallRowProps) => {
  const [companyOpen, setCompanyOpen] = useState(false)
  const [companyQuery, setCompanyQuery] = useState("")
  const [hallOpen, setHallOpen] = useState(false)
  const [hallQuery, setHallQuery] = useState("")

  const filteredCompanies = companyQuery
    ? companyOptions.filter((c) => c.name.includes(companyQuery))
    : companyOptions

  const filteredHalls = hallQuery
    ? hallOptions.filter((h) => h.name.includes(hallQuery))
    : hallOptions

  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto_auto] gap-2 items-center">
      {/* 法人名 */}
      <div>
        <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between text-xs h-9">
              <span className="truncate">{hall.companyName || "法人を選択"}</span>
              <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput placeholder="法人名で検索..." value={companyQuery} onValueChange={setCompanyQuery} className="text-xs" />
              <CommandList>
                <CommandEmpty>見つかりませんでした</CommandEmpty>
                <CommandGroup>
                  {filteredCompanies.slice(0, 20).map((c) => (
                    <CommandItem
                      key={c.id}
                      value={c.name}
                      onSelect={() => {
                        onSelectCompany(c.companyId)
                        setCompanyOpen(false)
                        setCompanyQuery("")
                      }}
                      className="text-xs"
                    >
                      {c.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* 法人営業担当 */}
      <div className="w-24">
        <Input value={hall.companySalesPersonName || "-"} readOnly className="text-xs h-9 bg-slate-50" />
      </div>

      {/* ホール名 */}
      <div>
        <Popover open={hallOpen} onOpenChange={setHallOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between text-xs h-9">
              <span className="truncate">{hall.hallName || "ホールを選択"}</span>
              <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput placeholder="ホール名で検索..." value={hallQuery} onValueChange={setHallQuery} className="text-xs" />
              <CommandList>
                <CommandEmpty>見つかりませんでした</CommandEmpty>
                <CommandGroup>
                  {filteredHalls.slice(0, 20).map((h) => (
                    <CommandItem
                      key={h.id}
                      value={h.name}
                      onSelect={() => {
                        onSelectHall(h.name)
                        setHallOpen(false)
                        setHallQuery("")
                      }}
                      className="text-xs"
                    >
                      {h.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* ホール営業担当 */}
      <div className="w-24">
        <Input value={hall.hallSalesPersonName || "-"} readOnly className="text-xs h-9 bg-slate-50" />
      </div>

      {/* 削除 */}
      <div>
        {canRemove ? (
          <Button variant="ghost" size="sm" onClick={onRemove} className="h-9 w-9 p-0">
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <div className="w-9" />
        )}
      </div>
    </div>
  )
}
