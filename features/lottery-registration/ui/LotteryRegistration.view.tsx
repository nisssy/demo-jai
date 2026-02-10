"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useState } from "react"
import { ChevronRight, Save, Eye, ArrowLeft, Download, Trash2, Plus, Pencil, X, Send } from "lucide-react"
import type { UseLotteryRegistrationReturn } from "../hooks/useLotteryRegistration"
import { BasicInfoSectionView } from "./sections/BasicInfoSection.view"
import { PrizeSetSectionView } from "./sections/PrizeSetSection.view"
import { QuoteConfigSectionView } from "./sections/QuoteConfigSection.view"
import { QuoteDisplaySectionView } from "./sections/QuoteDisplaySection.view"
import { StatusSectionView } from "./sections/StatusSection.view"
import { ProductionSectionView } from "./sections/ProductionSection.view"
import { PosterOrderModalView } from "./sections/PosterOrderModal.view"
import { DmCreateModalView } from "./sections/DmCreateModal.view"
import { PosterOrderDocumentModalView } from "./sections/PosterOrderDocumentModal.view"
import { DesignRequestDetailModalView } from "./sections/DesignRequestDetailModal.view"

export type LotteryRegistrationViewProps = {
  state: UseLotteryRegistrationReturn
  onSave: () => void
}

function PdfModal({ state }: { state: UseLotteryRegistrationReturn }) {
  const pdfTotal = state.pdfEditableItems
    .filter((i) => i.included)
    .reduce((sum, i) => sum + (i.id === 2 ? i.quantity * i.unitPrice : i.unitPrice), 0)
  const taxAmount = Math.floor(pdfTotal * 0.1)
  const hallEntry = state.halls.find((h) => h.hallName === state.pdfOutputHallName)

  if (state.pdfStep === "preview") {
    return (
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">見積書プレビュー</DialogTitle>
        </DialogHeader>
        <div className="border border-slate-200 rounded-lg p-6 space-y-4 text-xs">
          <div className="text-center border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold">御見積書</h3>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">{hallEntry?.companyName || ""}</p>
              <p>{state.pdfOutputHallName} 御中</p>
            </div>
            <div className="text-right text-slate-500">
              <p>{new Date().toLocaleDateString("ja-JP")}</p>
            </div>
          </div>
          <div>
            <p className="text-slate-500">件名: {state.eventName}</p>
            <p className="text-slate-500">期間: {state.eventStartDate} ～ {state.eventEndDate}</p>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="text-left py-1">項目</th>
                <th className="text-right py-1">数量</th>
                <th className="text-right py-1">単価</th>
                <th className="text-right py-1">金額</th>
              </tr>
            </thead>
            <tbody>
              {state.pdfEditableItems.filter((i) => i.included).map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-1">{item.name}</td>
                  <td className="py-1 text-right">{item.id === 2 ? item.quantity : 1}</td>
                  <td className="py-1 text-right">¥{item.unitPrice.toLocaleString()}</td>
                  <td className="py-1 text-right">¥{(item.id === 2 ? item.quantity * item.unitPrice : item.unitPrice).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-300">
                <td colSpan={3} className="py-1 font-semibold">小計</td>
                <td className="py-1 text-right font-semibold">¥{pdfTotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan={3} className="py-1">消費税（10%）</td>
                <td className="py-1 text-right">¥{taxAmount.toLocaleString()}</td>
              </tr>
              <tr className="border-t border-slate-300">
                <td colSpan={3} className="py-1 font-bold">合計</td>
                <td className="py-1 text-right font-bold">¥{(pdfTotal + taxAmount).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="flex justify-between pt-2">
          <Button variant="outline" size="sm" onClick={() => state.setPdfStep("template")} className="text-xs gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            戻る
          </Button>
          <Button size="sm" onClick={state.handlePdfDownload} className="text-xs gap-1">
            <Download className="h-3.5 w-3.5" />
            PDFダウンロード
          </Button>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-sm">見積書 - {state.pdfOutputHallName}</DialogTitle>
        <DialogDescription className="text-xs">項目を確認してPDFを出力できます</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        {state.isEditingPdf ? (
          <>
            {state.pdfEditableItems.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2 p-2 border border-slate-100 rounded">
                <Switch
                  checked={item.included}
                  onCheckedChange={(checked) => {
                    const next = [...state.pdfEditableItems]
                    next[idx] = { ...item, included: checked }
                    state.setPdfEditableItems(next)
                  }}
                  className="scale-75"
                />
                <Input
                  value={item.name}
                  onChange={(e) => {
                    const next = [...state.pdfEditableItems]
                    next[idx] = { ...item, name: e.target.value }
                    state.setPdfEditableItems(next)
                  }}
                  className="text-xs h-7 flex-1"
                />
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const next = [...state.pdfEditableItems]
                    next[idx] = { ...item, quantity: Number(e.target.value) || 0 }
                    state.setPdfEditableItems(next)
                  }}
                  className="text-xs h-7 w-16"
                  placeholder="数量"
                />
                <Input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => {
                    const next = [...state.pdfEditableItems]
                    next[idx] = { ...item, unitPrice: Number(e.target.value) || 0 }
                    state.setPdfEditableItems(next)
                  }}
                  className="text-xs h-7 w-24"
                  placeholder="単価"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => state.setPdfEditableItems(state.pdfEditableItems.filter((_, i) => i !== idx))}
                  className="h-7 w-7 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextId = Math.max(...state.pdfEditableItems.map((i) => i.id), 0) + 1
                state.setPdfEditableItems([...state.pdfEditableItems, { id: nextId, name: "", quantity: 1, unitPrice: 0, included: true }])
              }}
              className="text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              項目追加
            </Button>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => state.setIsEditingPdf(false)} className="text-xs">
                編集完了
              </Button>
            </div>
          </>
        ) : (
          <>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-1.5 font-medium text-slate-600">項目</th>
                  <th className="text-right py-1.5 font-medium text-slate-600">数量</th>
                  <th className="text-right py-1.5 font-medium text-slate-600">単価</th>
                  <th className="text-right py-1.5 font-medium text-slate-600">金額</th>
                </tr>
              </thead>
              <tbody>
                {state.pdfEditableItems.filter((i) => i.included).map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-1.5">{item.name}</td>
                    <td className="py-1.5 text-right">{item.id === 2 ? item.quantity : 1}</td>
                    <td className="py-1.5 text-right">¥{item.unitPrice.toLocaleString()}</td>
                    <td className="py-1.5 text-right">¥{(item.id === 2 ? item.quantity * item.unitPrice : item.unitPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => state.setIsEditingPdf(true)} className="text-xs gap-1">
                <Pencil className="h-3 w-3" />
                編集
              </Button>
            </div>
          </>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <span className="text-xs text-slate-600">合計（税抜）</span>
          <span className="text-sm font-semibold">¥{pdfTotal.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={state.closePdfModal} className="text-xs">キャンセル</Button>
        <Button size="sm" onClick={() => state.setPdfStep("preview")} className="text-xs gap-1">
          <Eye className="h-3.5 w-3.5" />
          プレビュー
        </Button>
      </div>
    </DialogContent>
  )
}

function NotifyModal({ state }: { state: UseLotteryRegistrationReturn }) {
  const [toSearchOpen, setToSearchOpen] = useState(false)
  const [toSearchType, setToSearchType] = useState<"company" | "hall">("hall")
  const [toSearchQuery, setToSearchQuery] = useState("")
  const [fromSuggestOpen, setFromSuggestOpen] = useState(false)
  const [ccSearchOpen, setCcSearchOpen] = useState(false)
  const [ccSearchQuery, setCcSearchQuery] = useState("")
  const [bccSearchOpen, setBccSearchOpen] = useState(false)
  const [bccSearchQuery, setBccSearchQuery] = useState("")

  const allEmployees = state.allEmployees
  const getEmployees = () => allEmployees

  if (state.notifyStep === 1) {
    const fromEmployee = typeof state.emailFrom === "number"
      ? allEmployees.find((e) => e.id === state.emailFrom)
      : null
    return (
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">送信プレビュー</DialogTitle>
          <DialogDescription className="text-xs">内容を確認して送信してください</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">送信先情報</h3>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="font-medium text-slate-600 w-12 shrink-0">To:</span>
                <div className="flex flex-col gap-0.5">
                  {state.emailTo.length > 0 ? state.emailTo.map((email, i) => (
                    <span key={i} className="text-slate-900">{email}</span>
                  )) : <span className="text-slate-400">（未設定）</span>}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-slate-600 w-12 shrink-0">From:</span>
                <span className="text-slate-900">
                  {fromEmployee ? `${fromEmployee.name} <${fromEmployee.email}>` : typeof state.emailFrom === "string" ? state.emailFrom : "（未設定）"}
                </span>
              </div>
              {state.emailCc.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-medium text-slate-600 w-12 shrink-0">CC:</span>
                  <div className="flex flex-col gap-0.5">
                    {state.emailCc.map((id) => {
                      const emp = allEmployees.find((e) => e.id === id)
                      return emp ? <span key={id} className="text-slate-900">{emp.name} &lt;{emp.email}&gt;</span> : null
                    })}
                  </div>
                </div>
              )}
              {state.emailBcc.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-medium text-slate-600 w-12 shrink-0">BCC:</span>
                  <div className="flex flex-col gap-0.5">
                    {state.emailBcc.map((id) => {
                      const emp = allEmployees.find((e) => e.id === id)
                      return emp ? <span key={id} className="text-slate-900">{emp.name} &lt;{emp.email}&gt;</span> : null
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-600">メッセージ</Label>
            <div className="border border-slate-200 rounded p-3 whitespace-pre-wrap bg-slate-50 text-xs">
              {state.notifyMessage}
            </div>
          </div>
        </div>
        <div className="flex justify-between pt-2">
          <Button variant="outline" size="sm" onClick={() => state.setNotifyStep(0)} className="text-xs gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            戻る
          </Button>
          <Button size="sm" onClick={state.handleSendNotification} className="text-xs gap-1">
            <Send className="h-3.5 w-3.5" />
            送信
          </Button>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-sm">顧客へ通知 - {state.notifyHallName}</DialogTitle>
        <DialogDescription className="text-xs">送信先を設定してメッセージを作成してください</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {/* To */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-700">To（宛先）</Label>
          {state.emailTo.length > 0 && (
            <div className="space-y-1.5">
              {state.emailTo.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={email}
                    onChange={(e) => {
                      const next = [...state.emailTo]
                      next[index] = e.target.value
                      state.setEmailTo(next)
                    }}
                    placeholder="メールアドレス"
                    className="flex-1 text-xs h-8"
                  />
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => state.setEmailTo(state.emailTo.filter((_, i) => i !== index))}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Popover open={toSearchOpen} onOpenChange={setToSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 justify-between text-xs h-8">
                  {toSearchType === "company" ? "法人" : "ホール"}から検索・追加
                  <Plus className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="start">
                <Command>
                  <CommandInput placeholder={toSearchType === "company" ? "法人名を検索..." : "ホール名を検索..."} value={toSearchQuery} onValueChange={setToSearchQuery} className="text-xs" />
                  <CommandList>
                    <CommandEmpty>{toSearchType === "company" ? "法人" : "ホール"}が見つかりませんでした</CommandEmpty>
                    <CommandGroup>
                      {toSearchType === "company"
                        ? state.searchCompanies(toSearchQuery)
                            .filter((c) => c.email && !state.emailTo.includes(c.email))
                            .slice(0, 10)
                            .map((company) => (
                              <CommandItem key={company.id} value={company.name} onSelect={() => { if (company.email) { state.setEmailTo([...state.emailTo, company.email]); setToSearchOpen(false); setToSearchQuery("") } }} className="text-xs">
                                <Plus className="mr-2 h-3.5 w-3.5" />
                                <div className="flex flex-col"><span>{company.name}</span><span className="text-slate-500">{company.email}</span></div>
                              </CommandItem>
                            ))
                        : state.searchHalls(toSearchQuery)
                            .filter((h) => h.email && !state.emailTo.includes(h.email))
                            .slice(0, 10)
                            .map((hall) => (
                              <CommandItem key={hall.id} value={hall.name} onSelect={() => { if (hall.email) { state.setEmailTo([...state.emailTo, hall.email]); setToSearchOpen(false); setToSearchQuery("") } }} className="text-xs">
                                <Plus className="mr-2 h-3.5 w-3.5" />
                                <div className="flex flex-col"><span>{hall.name}</span><span className="text-slate-500">{hall.email}</span></div>
                              </CommandItem>
                            ))
                      }
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="flex border rounded-md">
              <button type="button" onClick={() => { setToSearchType("hall"); setToSearchQuery("") }} className={`px-2.5 py-1 text-xs ${toSearchType === "hall" ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-50"}`}>ホール</button>
              <button type="button" onClick={() => { setToSearchType("company"); setToSearchQuery("") }} className={`px-2.5 py-1 text-xs border-l ${toSearchType === "company" ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-50"}`}>法人</button>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => state.setEmailTo([...state.emailTo, ""])} className="w-full text-xs h-8 gap-1">
            <Plus className="h-3.5 w-3.5" />
            メールアドレスを手動追加
          </Button>
        </div>

        {/* From */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-700">From（送信元）</Label>
          <div className="relative">
            <Input
              value={state.emailFromInput}
              onChange={(e) => {
                state.setEmailFromInput(e.target.value)
                state.setEmailFrom(e.target.value.includes("@") ? e.target.value : null)
                setFromSuggestOpen(true)
              }}
              onFocus={() => setFromSuggestOpen(true)}
              placeholder="従業員名を検索するか、メールアドレスを直接入力..."
              className="text-xs h-8"
            />
            {fromSuggestOpen && state.emailFromInput.trim() && (
              <div className="absolute z-50 mt-1 w-full border rounded-md bg-white shadow-lg max-h-40 overflow-y-auto">
                <div className="px-3 py-1 text-xs text-slate-500 border-b">
                  {state.emailFromInput.includes("@") ? "メールアドレスとして使用" : "従業員を選択"}
                </div>
                {allEmployees.filter((e) => e.name.includes(state.emailFromInput) || e.email.includes(state.emailFromInput)).slice(0, 8).map((emp) => (
                  <button key={emp.id} type="button" className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-slate-50 text-xs" onClick={() => { state.setEmailFrom(emp.id); state.setEmailFromInput(emp.name); setFromSuggestOpen(false) }}>
                    <div className="flex flex-col"><span>{emp.name}</span><span className="text-slate-500">{emp.email}</span></div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {state.emailFrom && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>{typeof state.emailFrom === "number" ? allEmployees.find((e) => e.id === state.emailFrom)?.email || "" : state.emailFrom}</span>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => { state.setEmailFrom(null); state.setEmailFromInput("") }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* CC */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-700">CC（複写）</Label>
          <Popover open={ccSearchOpen} onOpenChange={setCcSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8">
                従業員を検索・追加
                <Plus className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
              <Command>
                <CommandInput placeholder="従業員を検索..." value={ccSearchQuery} onValueChange={setCcSearchQuery} className="text-xs" />
                <CommandList>
                  <CommandEmpty>従業員が見つかりませんでした</CommandEmpty>
                  <CommandGroup>
                    {state.searchEmployees(ccSearchQuery).filter((e) => !state.emailCc.includes(e.id)).slice(0, 10).map((emp) => (
                      <CommandItem key={emp.id} value={emp.name} onSelect={() => { state.setEmailCc([...state.emailCc, emp.id]); setCcSearchOpen(false); setCcSearchQuery("") }} className="text-xs">
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        <div className="flex flex-col"><span>{emp.name}</span><span className="text-slate-500">{emp.email}</span></div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {state.emailCc.length > 0 && (
            <div className="space-y-1">
              {state.emailCc.map((id) => {
                const emp = allEmployees.find((e) => e.id === id)
                if (!emp) return null
                return (
                  <div key={id} className="flex items-center justify-between bg-slate-50 p-1.5 rounded text-xs">
                    <div className="flex flex-col"><span className="font-medium">{emp.name}</span><span className="text-slate-500">{emp.email}</span></div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => state.setEmailCc(state.emailCc.filter((eid) => eid !== id))}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* BCC */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-700">BCC（秘匿複写）</Label>
          <Popover open={bccSearchOpen} onOpenChange={setBccSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8">
                従業員を検索・追加
                <Plus className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
              <Command>
                <CommandInput placeholder="従業員を検索..." value={bccSearchQuery} onValueChange={setBccSearchQuery} className="text-xs" />
                <CommandList>
                  <CommandEmpty>従業員が見つかりませんでした</CommandEmpty>
                  <CommandGroup>
                    {state.searchEmployees(bccSearchQuery).filter((e) => !state.emailBcc.includes(e.id)).slice(0, 10).map((emp) => (
                      <CommandItem key={emp.id} value={emp.name} onSelect={() => { state.setEmailBcc([...state.emailBcc, emp.id]); setBccSearchOpen(false); setBccSearchQuery("") }} className="text-xs">
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        <div className="flex flex-col"><span>{emp.name}</span><span className="text-slate-500">{emp.email}</span></div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {state.emailBcc.length > 0 && (
            <div className="space-y-1">
              {state.emailBcc.map((id) => {
                const emp = allEmployees.find((e) => e.id === id)
                if (!emp) return null
                return (
                  <div key={id} className="flex items-center justify-between bg-slate-50 p-1.5 rounded text-xs">
                    <div className="flex flex-col"><span className="font-medium">{emp.name}</span><span className="text-slate-500">{emp.email}</span></div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => state.setEmailBcc(state.emailBcc.filter((eid) => eid !== id))}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* メッセージ */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-700">メッセージ</Label>
          <Textarea
            value={state.notifyMessage}
            onChange={(e) => state.setNotifyMessage(e.target.value)}
            rows={8}
            className="text-xs"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={state.closeNotifyModal} className="text-xs">キャンセル</Button>
        <Button size="sm" onClick={() => state.setNotifyStep(1)} className="text-xs gap-1">
          <Eye className="h-3.5 w-3.5" />
          プレビュー
        </Button>
      </div>
    </DialogContent>
  )
}

export function LotteryRegistrationView({ state, onSave }: LotteryRegistrationViewProps) {
  const isLastTab = state.activeTab === state.TAB_ORDER[state.TAB_ORDER.length - 1]

  return (
    <div className="space-y-4">
      <Tabs
        value={state.activeTab}
        onValueChange={(v) => state.setActiveTab(v as typeof state.TAB_ORDER[number])}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="basic-info" className="text-xs">基本情報</TabsTrigger>
          <TabsTrigger value="prize-set" className="text-xs">景品セット</TabsTrigger>
          <TabsTrigger value="quote" className="text-xs">見積り</TabsTrigger>
          <TabsTrigger value="status" className="text-xs">ステータス</TabsTrigger>
          <TabsTrigger value="production" className="text-xs">制作進行</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="mt-4">
          <BasicInfoSectionView
            halls={state.halls}
            dmMailing={state.dmMailing}
            eventStartDate={state.eventStartDate}
            eventEndDate={state.eventEndDate}
            salesPersonId={state.salesPersonId}
            salesPersonName={state.salesPersonName}
            insightPersonId={state.insightPersonId}
            insightPersonName={state.insightPersonName}
            eventName={state.eventName}
            allHalls={state.allHalls}
            allCompanies={state.allCompanies}
            allEmployees={state.allEmployees}
            onAddHall={state.addHall}
            onRemoveHall={state.removeHall}
            onSelectCompanyForHall={state.selectCompanyForHall}
            onSelectHallForEntry={state.selectHallForEntry}
            onDmMailingChange={state.setDmMailing}
            onEventStartDateChange={state.setEventStartDate}
            onEventEndDateChange={state.setEventEndDate}
            onSalesPersonChange={(id, name) => {
              state.setSalesPersonId(id)
              state.setSalesPersonName(name)
            }}
            onInsightPersonChange={(id, name) => {
              state.setInsightPersonId(id)
              state.setInsightPersonName(name)
            }}
            onEventNameChange={state.setEventName}
            getHallsByCompanyId={state.getHallsByCompanyId}
          />
        </TabsContent>

        <TabsContent value="prize-set" className="mt-4">
          <PrizeSetSectionView
            selectedPrizeSetId={state.selectedPrizeSetId}
            prizeInfo={state.prizeInfo}
            vendorCount={state.vendorCount}
            allPrizes={state.allPrizes}
            allPrizeVendors={state.allPrizeVendors}
            prizeMasterSearchQuery={state.prizeMasterSearchQuery}
            onSelectPrizeSet={state.selectPrizeSet}
            onAddPrize={state.addPrize}
            onRemovePrize={state.removePrize}
            onUpdatePrize={state.updatePrize}
            onAddPrizeFromMaster={state.addPrizeFromMaster}
            onPrizeMasterSearchQueryChange={state.setPrizeMasterSearchQuery}
          />
        </TabsContent>

        <TabsContent value="quote" className="mt-4">
          <div className="space-y-8">
            <QuoteConfigSectionView
              totalQuoteItems={state.quoteConfig.totalQuoteItems}
              posterPrintQuantity={state.posterPrintQuantity}
              posterPrintUnitPrice={state.posterPrintUnitPrice}
              dmOrderCount={state.dmOrderCount}
              dmMailing={state.dmMailing}
              onTotalQuoteItemChange={state.updateTotalQuoteItem}
              onPosterPrintQuantityChange={state.setPosterPrintQuantity}
              onPosterPrintUnitPriceChange={state.setPosterPrintUnitPrice}
              onDmOrderCountChange={state.setDmOrderCount}
              proportionMode={state.proportionMode}
              halls={state.halls}
              hallPercentages={state.hallPercentages}
              companyPercentages={state.companyPercentages}
              onProportionModeChange={state.setProportionMode}
              onHallPercentageChange={state.updateHallPercentage}
              onCompanyPercentageChange={state.updateCompanyPercentage}
              onDistributeEvenly={state.handleDistributeEvenly}
              totalAmount={state.quoteCalc.totalAmount}
              percentageSum={state.quoteCalc.percentageSum}
              isPercentageValid={state.quoteCalc.isPercentageValid}
              posterPrintTotal={state.quoteCalc.posterPrintTotal}
            />

            {state.quoteGenerated && state.hallQuotes.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">ホール別見積もり</h3>
                <QuoteDisplaySectionView
                  quoteGenerated={state.quoteGenerated}
                  hallQuotes={state.hallQuotes}
                  dmMailing={state.dmMailing}
                  onPdfExport={(hallName) => state.openPdfModal(hallName)}
                  onNotifyCustomer={(hallName) => state.openNotifyModal(hallName)}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="production" className="mt-4">
          <ProductionSectionView
            productId={state.productId}
            posterStatus={state.posterStatus}
            dmStatus={state.dmStatus}
            dmMailing={state.dmMailing}
            onOpenPosterOrderModal={() => state.setShowPosterOrderModal(true)}
            onOpenPosterOrderDocumentModal={() => state.setShowPosterOrderDocumentModal(true)}
            hasPosterRequests={state.posterRequests.length > 0}
            onOpenDmCreateModal={() => state.setShowDmCreateModal(true)}
            latestPosterRequest={state.latestPosterRequest}
            aiProofing={state.aiProofing}
            proofingComplete={state.proofingComplete}
            showDateError={state.showDateError}
            showFontError={state.showFontError}
            onAIProofing={state.handleAIProofing}
            posterCommentText={state.posterCommentText}
            onPosterCommentTextChange={state.setPosterCommentText}
            onSendPosterComment={state.handlePosterComment}
            posterSentToCustomer={state.posterSentToCustomer}
            onSendPosterToCustomer={state.handleSendPosterToCustomer}
            dmRequests={state.dmRequests}
            latestDmRequest={state.latestDmRequest}
            onOpenDmDetail={(requestId) => state.setDesignRequestDetailId(requestId)}
            eventName={state.eventName}
            eventStartDate={state.eventStartDate}
            eventEndDate={state.eventEndDate}
            halls={state.halls}
            salesPersonName={state.salesPersonName}
          />
        </TabsContent>

        <TabsContent value="status" className="mt-4">
          <StatusSectionView
            proposalStatus={state.proposalStatus}
            readingCertainty={state.readingCertainty}
            executionStatus={state.executionStatus}
            castAssignments={state.castAssignments}
            onStatusChange={state.handleStatusChange}
            onReadingCertaintyChange={state.setReadingCertainty}
            onExecutionStatusChange={state.setExecutionStatus}
            onConfirmOrder={state.handleConfirmOrder}
            onAddCast={state.addCast}
            onRemoveCast={state.removeCast}
            onUpdateCast={state.updateCast}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
        {isLastTab ? (
          <Button onClick={onSave} disabled={!state.isFormValid} className="gap-2">
            <Save className="h-4 w-4" />
            保存
          </Button>
        ) : (
          <Button onClick={state.goToNextTab} className="gap-2">
            次へ
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={state.showPdfModal} onOpenChange={(open) => { if (!open) state.closePdfModal() }}>
        <PdfModal state={state} />
      </Dialog>

      <Dialog open={state.showNotifyModal} onOpenChange={(open) => { if (!open) state.closeNotifyModal() }}>
        <NotifyModal state={state} />
      </Dialog>

      <Dialog open={state.showPosterOrderModal} onOpenChange={(open) => { if (!open) state.setShowPosterOrderModal(false) }}>
        <PosterOrderModalView
          printingPartners={state.printingPartners}
          posterOrderVendorId={state.posterOrderVendorId}
          onVendorChange={state.setPosterOrderVendorId}
          onSubmit={state.handlePosterOrder}
          onCancel={() => state.setShowPosterOrderModal(false)}
          eventName={state.eventName}
          eventStartDate={state.eventStartDate}
          eventEndDate={state.eventEndDate}
          hallNames={state.halls.filter((h) => h.hallName.trim()).map((h) => h.hallName)}
          posterPrintQuantity={state.posterPrintQuantity}
        />
      </Dialog>

      <Dialog open={state.showDmCreateModal} onOpenChange={(open) => { if (!open) state.setShowDmCreateModal(false) }}>
        <DmCreateModalView
          designPartners={state.designPartners}
          dmCreateVendorId={state.dmCreateVendorId}
          onVendorChange={state.setDmCreateVendorId}
          onSubmit={state.handleDmCreate}
          onCancel={() => state.setShowDmCreateModal(false)}
          eventName={state.eventName}
          eventStartDate={state.eventStartDate}
          eventEndDate={state.eventEndDate}
          hallNames={state.halls.filter((h) => h.hallName.trim()).map((h) => h.hallName)}
        />
      </Dialog>

      <Dialog open={state.showPosterOrderDocumentModal} onOpenChange={(open) => { if (!open) state.setShowPosterOrderDocumentModal(false) }}>
        <PosterOrderDocumentModalView
          vendorName={state.latestPosterRequest?.vendorName ?? "印刷会社"}
          eventName={state.eventName}
          eventStartDate={state.eventStartDate}
          eventEndDate={state.eventEndDate}
          hallNames={state.halls.filter((h) => h.hallName.trim()).map((h) => h.hallName)}
          posterPrintQuantity={state.posterPrintQuantity}
          salesPersonName={state.salesPersonName}
          onClose={() => state.setShowPosterOrderDocumentModal(false)}
        />
      </Dialog>

      {state.selectedDesignRequest && (
        <Dialog open={!!state.designRequestDetailId} onOpenChange={(open) => { if (!open) state.setDesignRequestDetailId(null) }}>
          <DesignRequestDetailModalView
            request={state.selectedDesignRequest}
            commentText={state.designRequestCommentText}
            onCommentTextChange={state.setDesignRequestCommentText}
            onSendComment={state.handleDesignRequestComment}
            onClose={() => state.setDesignRequestDetailId(null)}
          />
        </Dialog>
      )}
    </div>
  )
}
