import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { X, Plus, Search } from "lucide-react"
import type { Employee } from "@/new/api/types"
import type { EmailSettings } from "@/new/features/project-quote/model/types"

type EmailSettingsEditorProps = {
  settings: EmailSettings
  employees: Employee[]
  onAddToEmail: (email: string) => void
  onRemoveToEmail: (email: string) => void
  onUpdateToEmail: (index: number, value: string) => void
  onSetFromEmployee: (empId: number | null) => void
  onSetFromEmail: (email: string) => void
  onAddCcEmployee: (empId: number) => void
  onRemoveCcEmployee: (empId: number) => void
  onAddBccEmployee: (empId: number) => void
  onRemoveBccEmployee: (empId: number) => void
}

function employeeEmail(emp: Employee): string {
  return `${emp.name.replace(/\s+/g, ".")}@example.com`
}

export const EmailSettingsEditor = ({
  settings,
  employees,
  onAddToEmail,
  onRemoveToEmail,
  onUpdateToEmail,
  onSetFromEmployee,
  onSetFromEmail,
  onAddCcEmployee,
  onRemoveCcEmployee,
  onAddBccEmployee,
  onRemoveBccEmployee,
}: EmailSettingsEditorProps) => {
  const [toSearchOpen, setToSearchOpen] = useState(false)
  const [ccSearchOpen, setCcSearchOpen] = useState(false)
  const [bccSearchOpen, setBccSearchOpen] = useState(false)
  const [manualEmailInput, setManualEmailInput] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)
  const [fromSearchQuery, setFromSearchQuery] = useState("")

  const fromEmployee = settings.fromEmployeeId
    ? employees.find((e) => e.id === settings.fromEmployeeId)
    : null

  const fromDisplayEmail = fromEmployee
    ? employeeEmail(fromEmployee)
    : settings.fromEmail || "（未設定）"

  const ccEmployees = settings.ccEmployeeIds
    .map((id) => employees.find((e) => e.id === id))
    .filter(Boolean) as Employee[]

  const bccEmployees = settings.bccEmployeeIds
    .map((id) => employees.find((e) => e.id === id))
    .filter(Boolean) as Employee[]

  const filteredFromEmployees = employees.filter((e) =>
    fromSearchQuery ? e.name.includes(fromSearchQuery) : true,
  )

  return (
    <div className="space-y-6">
      {/* 宛先（To） */}
      <div>
        <Label className="text-sm font-medium text-slate-700">宛先（To）</Label>
        <div className="mt-2 space-y-2">
          {settings.toEmails.map((email, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={email}
                onChange={(e) => onUpdateToEmail(idx, e.target.value)}
                className="text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveToEmail(email)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex gap-2">
            <Popover open={toSearchOpen} onOpenChange={setToSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Search className="h-3.5 w-3.5 mr-1" />
                  検索して追加
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <Command>
                  <CommandInput placeholder="社員名で検索..." />
                  <CommandList>
                    <CommandEmpty>見つかりません</CommandEmpty>
                    <CommandGroup heading="社員">
                      {employees
                        .filter((e) => !settings.toEmails.includes(employeeEmail(e)))
                        .map((emp) => (
                          <CommandItem
                            key={emp.id}
                            onSelect={() => {
                              onAddToEmail(employeeEmail(emp))
                              setToSearchOpen(false)
                            }}
                          >
                            <div>
                              <div className="text-sm font-medium">{emp.name}</div>
                              <div className="text-xs text-slate-500">{employeeEmail(emp)}</div>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {showManualInput ? (
              <div className="flex items-center gap-1">
                <Input
                  value={manualEmailInput}
                  onChange={(e) => setManualEmailInput(e.target.value)}
                  placeholder="email@example.com"
                  className="h-8 text-sm w-48"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (manualEmailInput.trim()) {
                      onAddToEmail(manualEmailInput.trim())
                      setManualEmailInput("")
                      setShowManualInput(false)
                    }
                  }}
                >
                  追加
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowManualInput(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowManualInput(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                メールアドレスを手動追加
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 差出人（From） */}
      <div>
        <Label className="text-sm font-medium text-slate-700">差出人（From）</Label>
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                value={fromSearchQuery}
                onChange={(e) => {
                  setFromSearchQuery(e.target.value)
                  const match = employees.find((emp) => emp.name === e.target.value)
                  if (match) {
                    onSetFromEmployee(match.id)
                    setFromSearchQuery("")
                  }
                }}
                placeholder="社員名で検索..."
                className="text-sm"
              />
              {fromSearchQuery && filteredFromEmployees.length > 0 && (
                <div className="mt-1 border rounded-lg bg-white shadow-sm max-h-32 overflow-y-auto">
                  {filteredFromEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => {
                        onSetFromEmployee(emp.id)
                        setFromSearchQuery("")
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-sm"
                    >
                      <span className="font-medium">{emp.name}</span>
                      <span className="text-xs text-slate-500 ml-2">{employeeEmail(emp)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            現在: {fromEmployee?.name ?? "未設定"} ({fromDisplayEmail})
            {settings.fromEmployeeId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSetFromEmployee(null)}
                className="h-5 w-5 p-0 text-slate-400"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* CC */}
      <div>
        <Label className="text-sm font-medium text-slate-700">CC</Label>
        <div className="mt-2 space-y-2">
          {ccEmployees.map((emp) => (
            <div key={emp.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded">
              <div className="flex-1 text-sm">
                <span className="font-medium">{emp.name}</span>
                <span className="text-xs text-slate-500 ml-2">{employeeEmail(emp)}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveCcEmployee(emp.id)}
                className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Popover open={ccSearchOpen} onOpenChange={setCcSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3.5 w-3.5 mr-1" />
                CC を追加
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <Command>
                <CommandInput placeholder="社員名で検索..." />
                <CommandList>
                  <CommandEmpty>見つかりません</CommandEmpty>
                  <CommandGroup>
                    {employees
                      .filter((e) => !settings.ccEmployeeIds.includes(e.id))
                      .map((emp) => (
                        <CommandItem
                          key={emp.id}
                          onSelect={() => {
                            onAddCcEmployee(emp.id)
                            setCcSearchOpen(false)
                          }}
                        >
                          <div className="text-sm">{emp.name}</div>
                          <div className="text-xs text-slate-500">{employeeEmail(emp)}</div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* BCC */}
      <div>
        <Label className="text-sm font-medium text-slate-700">BCC</Label>
        <div className="mt-2 space-y-2">
          {bccEmployees.map((emp) => (
            <div key={emp.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded">
              <div className="flex-1 text-sm">
                <span className="font-medium">{emp.name}</span>
                <span className="text-xs text-slate-500 ml-2">{employeeEmail(emp)}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveBccEmployee(emp.id)}
                className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Popover open={bccSearchOpen} onOpenChange={setBccSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3.5 w-3.5 mr-1" />
                BCC を追加
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <Command>
                <CommandInput placeholder="社員名で検索..." />
                <CommandList>
                  <CommandEmpty>見つかりません</CommandEmpty>
                  <CommandGroup>
                    {employees
                      .filter((e) => !settings.bccEmployeeIds.includes(e.id))
                      .map((emp) => (
                        <CommandItem
                          key={emp.id}
                          onSelect={() => {
                            onAddBccEmployee(emp.id)
                            setBccSearchOpen(false)
                          }}
                        >
                          <div className="text-sm">{emp.name}</div>
                          <div className="text-xs text-slate-500">{employeeEmail(emp)}</div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
