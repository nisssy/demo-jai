import { useState } from "react"
import { Search, ChevronsUpDown, Check } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PaymentCheckStatus } from "@/new/api/types"
import { PAYMENT_CHECK_STATUS_LABELS } from "@/new/api/display"

export type PaymentFilterState = {
  vendorId: string
  vendorName: string
  checkStatus: string
}

export const INITIAL_PAYMENT_FILTERS: PaymentFilterState = {
  vendorId: "",
  vendorName: "",
  checkStatus: "",
}

const CHECK_STATUS_OPTIONS: { value: PaymentCheckStatus; label: string }[] = [
  { value: "unconfirmed", label: "確認前" },
  { value: "confirming", label: "確認中" },
  { value: "confirmed", label: "確定済み" },
]

type VendorOption = {
  vendorId: string
  vendorName: string
}

type PaymentFiltersProps = {
  filters: PaymentFilterState
  onFiltersChange: (filters: PaymentFilterState) => void
  vendors: VendorOption[]
}

export const PaymentFilters = ({ filters, onFiltersChange, vendors }: PaymentFiltersProps) => {
  const [vendorSearchOpen, setVendorSearchOpen] = useState(false)
  const [vendorSearchQuery, setVendorSearchQuery] = useState("")

  const update = <K extends keyof PaymentFilterState>(key: K, value: PaymentFilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasAny = Object.values(filters).some((v) => Boolean(v))

  const filteredVendors = vendors.filter((v) =>
    v.vendorName.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
    v.vendorId.includes(vendorSearchQuery)
  )

  const selectedVendor = vendors.find((v) => v.vendorName === filters.vendorName)

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">検索条件</span>
        </div>
        {hasAny && (
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onFiltersChange(INITIAL_PAYMENT_FILTERS)}>
            クリア
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* 発注先ID */}
        <div className="space-y-1">
          <Label className="text-xs">発注先ID</Label>
          <Input value={filters.vendorId} onChange={(e) => update("vendorId", e.target.value)} className="h-8 text-xs" placeholder="V-..." />
        </div>

        {/* 発注先名 - Popover+Command combobox */}
        <div className="space-y-1">
          <Label className="text-xs">発注先名</Label>
          <Popover open={vendorSearchOpen} onOpenChange={setVendorSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={vendorSearchOpen} className="w-full justify-between h-8 text-xs bg-white">
                {filters.vendorName
                  ? <span className="truncate">{filters.vendorName}</span>
                  : <span className="text-muted-foreground">発注先名を検索...</span>}
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="発注先名を検索..."
                  value={vendorSearchQuery}
                  onValueChange={setVendorSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>発注先が見つかりませんでした</CommandEmpty>
                  <CommandGroup>
                    {filteredVendors.map((vendor) => (
                      <CommandItem
                        key={vendor.vendorId}
                        value={vendor.vendorName}
                        onSelect={() => {
                          update("vendorName", filters.vendorName === vendor.vendorName ? "" : vendor.vendorName)
                          setVendorSearchOpen(false)
                          setVendorSearchQuery("")
                        }}
                      >
                        <Check className={`mr-2 h-4 w-4 ${filters.vendorName === vendor.vendorName ? "opacity-100" : "opacity-0"}`} />
                        <div className="flex flex-col">
                          <span className="text-sm">{vendor.vendorName}</span>
                          <span className="text-xs text-slate-500">ID: {vendor.vendorId}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* ステータス */}
        <div className="space-y-1">
          <Label className="text-xs">ステータス</Label>
          <Select value={filters.checkStatus || "_all"} onValueChange={(v) => update("checkStatus", v === "_all" ? "" : v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all" className="text-xs">すべて</SelectItem>
              {CHECK_STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasAny && (
        <div className="flex flex-wrap gap-1">
          {filters.vendorId && <Badge variant="secondary" className="text-xs">ID: {filters.vendorId}</Badge>}
          {filters.vendorName && <Badge variant="secondary" className="text-xs">{filters.vendorName}</Badge>}
          {filters.checkStatus && <Badge variant="secondary" className="text-xs">{PAYMENT_CHECK_STATUS_LABELS[filters.checkStatus as PaymentCheckStatus]}</Badge>}
        </div>
      )}
    </div>
  )
}
