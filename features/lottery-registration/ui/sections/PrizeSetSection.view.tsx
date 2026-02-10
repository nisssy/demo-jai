import type { PrizeInfo } from "@/types/lottery"
import type { PrizeData, PrizeVendorData } from "@/lib/demo-db/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { AlertTriangle, Plus, Search } from "lucide-react"
import { PrizeRowView } from "./PrizeRow.view"
import { PRIZE_SETS } from "../../constants"
import { useState } from "react"

export type PrizeSetSectionViewProps = {
  selectedPrizeSetId: string
  prizeInfo: PrizeInfo[]
  vendorCount: number
  allPrizes: PrizeData[]
  allPrizeVendors: PrizeVendorData[]
  prizeMasterSearchQuery: string
  onSelectPrizeSet: (setId: string) => void
  onAddPrize: () => void
  onRemovePrize: (index: number) => void
  onUpdatePrize: (index: number, updates: Partial<PrizeInfo>) => void
  onAddPrizeFromMaster: (prizeId: string) => void
  onPrizeMasterSearchQueryChange: (query: string) => void
}

export function PrizeSetSectionView({
  selectedPrizeSetId,
  prizeInfo,
  vendorCount,
  allPrizes,
  allPrizeVendors,
  prizeMasterSearchQuery,
  onSelectPrizeSet,
  onAddPrize,
  onRemovePrize,
  onUpdatePrize,
  onAddPrizeFromMaster,
  onPrizeMasterSearchQueryChange,
}: PrizeSetSectionViewProps) {
  const [masterOpen, setMasterOpen] = useState(false)

  const filteredPrizes = prizeMasterSearchQuery
    ? allPrizes.filter((p) => p.name.includes(prizeMasterSearchQuery))
    : allPrizes

  return (
    <div className="space-y-5">
      {/* 景品セットテンプレート */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">景品セットテンプレート</Label>
        <Select value={selectedPrizeSetId} onValueChange={onSelectPrizeSet}>
          <SelectTrigger className="w-full h-9 text-xs">
            <SelectValue placeholder="テンプレートを選択..." />
          </SelectTrigger>
          <SelectContent>
            {PRIZE_SETS.map((set) => (
              <SelectItem key={set.id} value={set.id} className="text-xs">
                {set.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 景品テーブル */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">景品情報</Label>
          <div className="flex gap-2">
            <Popover open={masterOpen} onOpenChange={setMasterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  <Search className="h-3.5 w-3.5" />
                  景品マスタから追加
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="end">
                <Command>
                  <CommandInput
                    placeholder="景品名で検索..."
                    value={prizeMasterSearchQuery}
                    onValueChange={onPrizeMasterSearchQueryChange}
                    className="text-xs"
                  />
                  <CommandList>
                    <CommandEmpty>見つかりませんでした</CommandEmpty>
                    <CommandGroup>
                      {filteredPrizes.slice(0, 20).map((p) => {
                        const vendor = allPrizeVendors.find((v) => v.id === p.vendorId)
                        return (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            onSelect={() => {
                              onAddPrizeFromMaster(String(p.id))
                              setMasterOpen(false)
                              onPrizeMasterSearchQueryChange("")
                            }}
                            className="text-xs"
                          >
                            <div className="flex-1">{p.name}</div>
                            {vendor && (
                              <span className="text-slate-400 text-[10px]">{vendor.name}</span>
                            )}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={onAddPrize} className="text-xs gap-1">
              <Plus className="h-3.5 w-3.5" />
              手動追加
            </Button>
          </div>
        </div>

        {/* テーブルヘッダー */}
        <div className="grid grid-cols-[80px_1fr_80px_120px_32px] gap-2 text-xs text-slate-500 px-1">
          <span>賞</span>
          <span>景品名</span>
          <span>数量</span>
          <span>業者</span>
          <span />
        </div>

        {/* 景品行 */}
        <div className="space-y-1">
          {prizeInfo.map((prize, index) => (
            <PrizeRowView
              key={index}
              index={index}
              prize={prize}
              onUpdate={(updates) => onUpdatePrize(index, updates)}
              onRemove={() => onRemovePrize(index)}
            />
          ))}
        </div>

        {/* 業者数警告 */}
        {vendorCount >= 3 && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-xs text-amber-800">
              景品業者が{vendorCount}社あります。1イベントにつき2社以内を推奨します。
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
