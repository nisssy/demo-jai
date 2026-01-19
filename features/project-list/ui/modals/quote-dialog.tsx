"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { ProjectData } from "@/types/project"
import type { DemoProject } from "@/lib/demo-db/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Check, Download, Mail, Plus, Send } from "lucide-react"

type QuoteStep = "select" | "recipient" | "template" | "quote" | "email"

type QuoteRecipient = "company" | "hall"

type EditableQuoteSubitem = { id: string; item: string; amount: number; visible: boolean }
type EditableQuoteItem = {
  id: string
  item: string
  amount: number
  visible: boolean
  subitems?: EditableQuoteSubitem[]
}

type QuoteTemplate = {
  id: number
  name: string
  description: string
  items: Array<{
    item: string
    amount: number
    subitems?: Array<{ item: string; amount: number }>
  }>
}

type SelectedProjectForQuote = {
  projectNumber: string
  products: DemoProject[]
}

type QuoteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: SelectedProjectForQuote | null
  onRequestClose: () => void

  // deps
  updateProduct: (id: number, updates: Partial<DemoProject>) => DemoProject | null
  addNotification: (message: string) => void
}

export function QuoteDialog({ open, onOpenChange, project, onRequestClose, updateProduct, addNotification }: QuoteDialogProps) {
  const [quoteStep, setQuoteStep] = useState<QuoteStep>("select")
  const [quoteGenerated, setQuoteGenerated] = useState(false)
  const [emailGenerated, setEmailGenerated] = useState(false)
  const [selectedProductsForQuote, setSelectedProductsForQuote] = useState<Set<number>>(new Set())
  const [isLoadingSend, setIsLoadingSend] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [quoteRecipient, setQuoteRecipient] = useState<QuoteRecipient>("hall")
  const [editableQuoteItems, setEditableQuoteItems] = useState<EditableQuoteItem[]>([])
  const [isEditingAllItems, setIsEditingAllItems] = useState(false)
  const editableQuoteItemsBackupRef = useRef<EditableQuoteItem[] | null>(null)
  const quoteItemsScrollRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const [quoteProjectData, setQuoteProjectData] = useState<ProjectData>({
    projectName: "",
    clientName: "",
    date: "",
    venue: "",
    talent: "",
    talentStatus: "available",
    quoteItems: [],
    emailDraft: "",
    contractAmount: "",
    billingAddress: "",
    status: "proposed",
    validationErrors: [],
    correctionRequest: "",
  })

  const quoteTemplates: QuoteTemplate[] = useMemo(
    () => [
      {
        id: 1,
        name: "標準テンプレート",
        description: "出演料・交通費・宿泊費・管理費",
        items: [
          {
            item: "出演料",
            amount: 500000,
            subitems: [
              { item: "　タレント", amount: 300000 },
              { item: "　ディレクター", amount: 200000 },
            ],
          },
          { item: "交通費", amount: 50000 },
          { item: "宿泊費", amount: 30000 },
          { item: "管理費", amount: 20000 },
        ],
      },
      {
        id: 2,
        name: "テンプレートB",
        description: "人件費・移動費・滞在費・運営費",
        items: [
          {
            item: "人件費",
            amount: 500000,
            subitems: [
              { item: "　コンパニオン", amount: 300000 },
              { item: "　ディレクター", amount: 200000 },
            ],
          },
          { item: "移動費", amount: 50000 },
          { item: "滞在費", amount: 30000 },
          { item: "運営費", amount: 20000 },
        ],
      },
      {
        id: 3,
        name: "テンプレートC",
        description: "スタッフ費用・旅費・宿泊代・事務費",
        items: [
          {
            item: "スタッフ費用",
            amount: 500000,
            subitems: [
              { item: "　キャスト", amount: 300000 },
              { item: "　演出", amount: 200000 },
            ],
          },
          { item: "旅費", amount: 50000 },
          { item: "宿泊代", amount: 30000 },
          { item: "事務費", amount: 20000 },
        ],
      },
    ],
    [],
  )

  const resetState = () => {
    setQuoteStep("select")
    setQuoteGenerated(false)
    setEmailGenerated(false)
    setSelectedProductsForQuote(new Set())
    setIsLoadingSend(false)
    setSelectedTemplate(null)
    setQuoteRecipient("hall")
    setEditableQuoteItems([])
    setIsEditingAllItems(false)
    editableQuoteItemsBackupRef.current = null
    itemRefs.current = {}
    setQuoteProjectData({
      projectName: "",
      clientName: "",
      date: "",
      venue: "",
      talent: "",
      talentStatus: "available",
      quoteItems: [],
      emailDraft: "",
      contractAmount: "",
      billingAddress: "",
      status: "proposed",
      validationErrors: [],
      correctionRequest: "",
    })
  }

  useEffect(() => {
    if (!open) {
      resetState()
    }
  }, [open])

  const closeAndReset = () => {
    onRequestClose()
  }

  const selectedProjectForQuote = project

  const selectedProducts = useMemo(() => {
    if (!selectedProjectForQuote) return []
    return selectedProjectForQuote.products.filter((p) => selectedProductsForQuote.has(p.id))
  }, [selectedProductsForQuote, selectedProjectForQuote])

  const selectedProductsTotal = useMemo(() => {
    if (!selectedProjectForQuote) return 0
    const parseEstimateAmount = (raw?: string) => {
      if (!raw) return 0
      const num = Number(String(raw).replace(/[^\d]/g, ""))
      return Number.isFinite(num) ? num : 0
    }
    return selectedProducts.reduce((sum, p) => {
      const n = typeof p.estimatedBillingAmount === "number" ? p.estimatedBillingAmount : parseEstimateAmount(p.estimateAmount)
      return sum + (Number.isFinite(n) ? n : 0)
    }, 0)
  }, [selectedProducts, selectedProjectForQuote])

  // 商材ごとの項目を計算（見積書編集画面で編集した項目を各商材の比率で分割）
  const productQuoteItems = useMemo(() => {
    if (!selectedProjectForQuote || selectedProducts.length === 0 || quoteProjectData.quoteItems.length === 0) return []
    const parseEstimateAmount = (raw?: string) => {
      if (!raw) return 0
      const num = Number(String(raw).replace(/[^\d]/g, ""))
      return Number.isFinite(num) ? num : 0
    }
    const totalAmount = selectedProductsTotal
    if (totalAmount === 0) return []

    return selectedProducts.map((product) => {
      const productAmount = typeof product.estimatedBillingAmount === "number" 
        ? product.estimatedBillingAmount 
        : parseEstimateAmount(product.estimateAmount)
      const ratio = totalAmount > 0 ? productAmount / totalAmount : 0

      return {
        product,
        items: quoteProjectData.quoteItems.map((item) => ({
          item: item.item,
          amount: Math.round(item.amount * ratio),
          subitems: item.subitems?.map((subitem) => ({
            item: subitem.item,
            amount: Math.round(subitem.amount * ratio),
          })),
        })),
      }
    })
  }, [selectedProducts, selectedProductsTotal, quoteProjectData.quoteItems, selectedProjectForQuote])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1000px] sm:!max-w-[1000px] !w-[75vw] max-h-[85vh] overflow-hidden flex flex-col">
        <div className="relative flex-1 overflow-hidden flex flex-col min-h-0">
          {/* スライドコンテナ */}
          <div
            className="flex transition-transform duration-500 ease-in-out h-full items-stretch"
            style={{
              transform: `translateX(-${
                quoteStep === "recipient" ? 100 : quoteStep === "template" ? 200 : quoteStep === "quote" ? 300 : quoteStep === "email" ? 400 : 0
              }%)`,
            }}
          >
            {/* 商材選択画面 */}
            <div className="min-w-full flex-shrink-0 px-1 w-full h-full flex flex-col">
              <DialogHeader className="pb-4 pt-2">
                <DialogTitle>見積書作成・送付</DialogTitle>
                <DialogDescription>
                  {selectedProjectForQuote && `案件No: ${selectedProjectForQuote.projectNumber} の見積書を作成します`}
                </DialogDescription>
              </DialogHeader>

              {selectedProjectForQuote && (
                <div className="space-y-4 py-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm text-slate-900 mb-3">見積に含める商材を選択してください</h4>
                    <div className="space-y-2">
                      {selectedProjectForQuote.products.map((product) => {
                        const productName = product.eventProductName || product.projectName
                        const eventDate = product.eventDate || product.date
                        const estimatedAmount =
                          product.estimatedBillingAmount !== undefined
                            ? `¥${product.estimatedBillingAmount.toLocaleString()}`
                            : product.estimateAmount

                        return (
                          <div
                            key={product.id}
                            className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200 hover:bg-slate-50"
                          >
                            <Checkbox
                              checked={selectedProductsForQuote.has(product.id)}
                              onCheckedChange={(checked) => {
                                const newSet = new Set(selectedProductsForQuote)
                                if (checked) {
                                  newSet.add(product.id)
                                } else {
                                  newSet.delete(product.id)
                                }
                                setSelectedProductsForQuote(newSet)
                              }}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-slate-900">{productName}</div>
                              <div className="text-sm text-slate-600">
                                実施日: {eventDate} | 見積金額: {estimatedAmount}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" onClick={closeAndReset}>
                        キャンセル
                      </Button>
                      <Button
                        onClick={() => {
                          if (selectedProductsForQuote.size > 0) {
                            const firstProduct = selectedProducts[0]
                            if (!firstProduct) {
                              addNotification("見積に含める商材が取得できませんでした。再度選択してください。")
                              setQuoteStep("select")
                              return
                            }
                            const hallName = firstProduct.hallName || firstProduct.clientName
                            const contractAmount = selectedProducts.reduce((sum, p) => {
                              const v = typeof p.estimatedBillingAmount === "number" ? p.estimatedBillingAmount : Number(String(p.estimateAmount || "").replace(/[^\d]/g, ""))
                              return sum + (Number.isFinite(v) ? v : 0)
                            }, 0)

                            const defaultItems = [
                              {
                                item: "出演料",
                                amount: 500000,
                                subitems: [
                                  { item: "　タレント", amount: 300000 },
                                  { item: "　ディレクター", amount: 200000 },
                                ],
                              },
                              { item: "交通費", amount: 50000 },
                              { item: "宿泊費", amount: 30000 },
                              { item: "管理費", amount: 20000 },
                            ]

                            const quoteData: ProjectData = {
                              projectName: selectedProducts.map((p) => p.eventProductName || p.projectName).join("、"),
                              clientName: hallName,
                              date: selectedProducts.map((p) => p.eventDate || p.date).join("、"),
                              venue: hallName,
                              talent: firstProduct.salesPersonName || firstProduct.talent,
                              talentStatus: "available",
                              quoteItems: defaultItems,
                              emailDraft: "",
                              contractAmount: String(Math.round(contractAmount)),
                              billingAddress: "",
                              status: "proposed",
                              validationErrors: [],
                              correctionRequest: "",
                            }

                            setQuoteProjectData(quoteData)
                            setQuoteStep("recipient")
                          }
                        }}
                        disabled={selectedProductsForQuote.size === 0}
                      >
                        次へ
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 宛先選択画面（2枚目） */}
            <div className="min-w-full flex-shrink-0 px-1 w-full h-full flex flex-col">
              <DialogHeader className="pb-4 pt-2 flex-shrink-0">
                <DialogTitle>宛先選択</DialogTitle>
                <DialogDescription>
                  {selectedProjectForQuote && `案件No: ${selectedProjectForQuote.projectNumber} の見積書の宛先を選択してください`}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto py-4">
                {selectedProjectForQuote &&
                  (() => {
                    const firstProduct = selectedProducts[0]
                    if (!firstProduct) {
                      return (
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <div className="text-sm text-slate-700">見積に含める商材が未選択です。前の画面に戻って商材を選択してください。</div>
                        </div>
                      )
                    }
                    const hallName = firstProduct.hallName || firstProduct.clientName
                    const companyName = firstProduct.companyName || ""

                    return (
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <h4 className="font-medium text-sm text-slate-900 mb-4">見積書の宛先を選択してください</h4>
                          <div className="space-y-3">
                            <div
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                quoteRecipient === "hall" ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                              }`}
                              onClick={() => setQuoteRecipient("hall")}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 ${
                                    quoteRecipient === "hall" ? "border-blue-500 bg-blue-500" : "border-slate-300"
                                  }`}
                                >
                                  {quoteRecipient === "hall" && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900">ホール名</div>
                                  <div className="text-sm text-slate-600 mt-1">{hallName}</div>
                                </div>
                              </div>
                            </div>

                            {companyName && (
                              <div
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  quoteRecipient === "company"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                                onClick={() => setQuoteRecipient("company")}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 ${
                                      quoteRecipient === "company" ? "border-blue-500 bg-blue-500" : "border-slate-300"
                                    }`}
                                  >
                                    {quoteRecipient === "company" && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900">法人名</div>
                                    <div className="text-sm text-slate-600 mt-1">{companyName}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t pt-4 flex-shrink-0">
                <Button variant="outline" onClick={() => setQuoteStep("select")}>
                  戻る
                </Button>
                <Button
                  onClick={() => {
                    if (selectedProjectForQuote) {
                      const firstProduct = selectedProducts[0]
                      if (!firstProduct) {
                        addNotification("見積に含める商材が未選択です")
                        setQuoteStep("select")
                        return
                      }
                      const hallName = firstProduct.hallName || firstProduct.clientName
                      const companyName = firstProduct.companyName || ""
                      const recipientName = quoteRecipient === "company" ? companyName : hallName

                      setQuoteProjectData({
                        ...quoteProjectData,
                        clientName: recipientName || quoteProjectData.clientName,
                      })
                      setQuoteGenerated(true)
                      setQuoteStep("template")
                    }
                  }}
                >
                  次へ
                </Button>
              </div>
            </div>

            {/* 見積書編集画面（3枚目） */}
            <div className="min-w-full flex-shrink-0 px-1 w-full flex flex-col h-full overflow-hidden">
              <DialogHeader className="pb-4 pt-2 flex-shrink-0">
                <DialogTitle>見積書作成</DialogTitle>
                <DialogDescription>
                  {selectedProjectForQuote && `案件No: ${selectedProjectForQuote.projectNumber} の見積書項目を編集してください`}
                </DialogDescription>
              </DialogHeader>

              <div ref={quoteItemsScrollRef} className="flex-1 overflow-y-auto py-4 space-y-6 min-h-0" style={{ maxHeight: "calc(85vh - 250px)" }}>
                {/* テンプレート選択セクション */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">テンプレートから選択</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {quoteTemplates.map((template) => (
                      <Button
                        key={template.id}
                        variant={selectedTemplate === template.id ? "default" : "outline"}
                        className={`h-auto p-4 flex flex-col items-start justify-start ${
                          selectedTemplate === template.id ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" : "bg-white hover:bg-slate-50 border-slate-300"
                        }`}
                        onClick={() => {
                          setSelectedTemplate(template.id)
                          const items = template.items.map((item, idx) => ({
                            id: `item-${Date.now()}-${idx}`,
                            item: item.item,
                            amount: item.amount,
                            visible: true,
                            subitems: item.subitems?.map((subitem, subIdx) => ({
                              id: `subitem-${Date.now()}-${idx}-${subIdx}`,
                              item: subitem.item,
                              amount: subitem.amount,
                              visible: true,
                            })),
                          }))
                          setEditableQuoteItems(items)
                        }}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className={`font-semibold text-sm ${selectedTemplate === template.id ? "text-white" : "text-slate-900"}`}>{template.name}</span>
                          {selectedTemplate === template.id && <Check className="h-4 w-4 text-white" />}
                        </div>
                        <span className={`text-xs text-left ${selectedTemplate === template.id ? "text-blue-100" : "text-slate-600"}`}>{template.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 項目編集セクション */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">見積書項目</h3>
                    <div className="flex items-center gap-2">
                      {isEditingAllItems ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (editableQuoteItemsBackupRef.current) {
                                setEditableQuoteItems(editableQuoteItemsBackupRef.current)
                              }
                              editableQuoteItemsBackupRef.current = null
                              setIsEditingAllItems(false)
                            }}
                          >
                            キャンセル
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              editableQuoteItemsBackupRef.current = null
                              setIsEditingAllItems(false)
                            }}
                          >
                            保存
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            editableQuoteItemsBackupRef.current = JSON.parse(JSON.stringify(editableQuoteItems)) as EditableQuoteItem[]
                            setIsEditingAllItems(true)
                          }}
                          disabled={editableQuoteItems.length === 0}
                        >
                          編集
                        </Button>
                      )}

                      {isEditingAllItems && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newItem: EditableQuoteItem = {
                              id: `item-${Date.now()}`,
                              item: "新しい項目",
                              amount: 0,
                              visible: true,
                            }
                            setEditableQuoteItems([...editableQuoteItems, newItem])
                            setTimeout(() => {
                              const itemElement = itemRefs.current[newItem.id]
                              if (itemElement && quoteItemsScrollRef.current) {
                                itemElement.scrollIntoView({ behavior: "smooth", block: "center" })
                              }
                            }, 100)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          項目を追加
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {editableQuoteItems.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-sm">項目がありません。テンプレートを選択するか、項目を追加してください。</div>
                    ) : (
                      editableQuoteItems.map((item) => (
                        <div
                          key={item.id}
                          ref={(el) => {
                            itemRefs.current[item.id] = el
                          }}
                        >
                          <Card className="border-slate-200">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Switch
                                  checked={item.visible}
                                  disabled={!isEditingAllItems}
                                  onCheckedChange={(checked) => {
                                    setEditableQuoteItems(editableQuoteItems.map((i) => (i.id === item.id ? { ...i, visible: checked } : i)))
                                  }}
                                />
                                <div className="flex-1 space-y-2">
                                  {isEditingAllItems ? (
                                    <div className="space-y-2">
                                      <div className="flex gap-2">
                                        <Input
                                          value={item.item}
                                          onChange={(e) => {
                                            setEditableQuoteItems(editableQuoteItems.map((i) => (i.id === item.id ? { ...i, item: e.target.value } : i)))
                                          }}
                                          className="flex-1"
                                          placeholder="項目名"
                                        />
                                        <Input
                                          type="number"
                                          value={item.amount}
                                          onChange={(e) => {
                                            setEditableQuoteItems(editableQuoteItems.map((i) => (i.id === item.id ? { ...i, amount: Number(e.target.value) } : i)))
                                          }}
                                          className="w-32"
                                          placeholder="金額"
                                        />
                                        <Button size="sm" variant="outline" onClick={() => setEditableQuoteItems(editableQuoteItems.filter((i) => i.id !== item.id))}>
                                          削除
                                        </Button>
                                      </div>

                                      <div className="pl-4 space-y-2 border-l-2 border-slate-200">
                                        {item.subitems && item.subitems.length > 0 && (
                                          <>
                                            {item.subitems.map((subitem) => (
                                              <div key={subitem.id} className="flex items-center gap-2">
                                                <Switch
                                                  checked={subitem.visible}
                                                  onCheckedChange={(checked) => {
                                                    setEditableQuoteItems(
                                                      editableQuoteItems.map((i) =>
                                                        i.id === item.id
                                                          ? { ...i, subitems: i.subitems?.map((s) => (s.id === subitem.id ? { ...s, visible: checked } : s)) }
                                                          : i,
                                                      ),
                                                    )
                                                  }}
                                                />
                                                <Input
                                                  value={subitem.item}
                                                  onChange={(e) => {
                                                    setEditableQuoteItems(
                                                      editableQuoteItems.map((i) =>
                                                        i.id === item.id ? { ...i, subitems: i.subitems?.map((s) => (s.id === subitem.id ? { ...s, item: e.target.value } : s)) } : i,
                                                      ),
                                                    )
                                                  }}
                                                  className="flex-1"
                                                />
                                                <Input
                                                  type="number"
                                                  value={subitem.amount}
                                                  onChange={(e) => {
                                                    setEditableQuoteItems(
                                                      editableQuoteItems.map((i) =>
                                                        i.id === item.id ? { ...i, subitems: i.subitems?.map((s) => (s.id === subitem.id ? { ...s, amount: Number(e.target.value) } : s)) } : i,
                                                      ),
                                                    )
                                                  }}
                                                  className="w-32"
                                                />
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => {
                                                    setEditableQuoteItems(
                                                      editableQuoteItems.map((i) =>
                                                        i.id === item.id ? { ...i, subitems: (i.subitems || []).filter((s) => s.id !== subitem.id) } : i,
                                                      ),
                                                    )
                                                  }}
                                                >
                                                  削除
                                                </Button>
                                              </div>
                                            ))}
                                          </>
                                        )}

                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            const next: EditableQuoteSubitem = {
                                              id: `subitem-${Date.now()}`,
                                              item: "　内訳",
                                              amount: 0,
                                              visible: true,
                                            }
                                            setEditableQuoteItems(editableQuoteItems.map((i) => (i.id === item.id ? { ...i, subitems: [...(i.subitems || []), next] } : i)))
                                          }}
                                        >
                                          内訳を追加
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-slate-900">{item.item}</div>
                                          <div className="text-sm text-slate-600">¥{item.amount.toLocaleString()}</div>
                                        </div>
                                      </div>

                                      {item.subitems && item.subitems.length > 0 && (
                                        <div className="pl-4 space-y-1 border-l-2 border-slate-200">
                                          {item.subitems
                                            .filter((s) => s.visible)
                                            .map((subitem) => (
                                              <div key={subitem.id} className="flex items-center justify-between text-sm text-slate-600">
                                                <div className="flex-1">{subitem.item}</div>
                                                <div className="w-32 text-right">¥{subitem.amount.toLocaleString()}</div>
                                              </div>
                                            ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t pt-4 flex-shrink-0">
                <Button variant="outline" onClick={() => setQuoteStep("recipient")}>
                  戻る
                </Button>
                <Button
                  onClick={() => {
                    // editableQuoteItems -> quoteProjectData.quoteItems へ反映（visibleのみ反映）
                    const quoteItems = editableQuoteItems
                      .filter((i) => i.visible)
                      .map((i) => ({
                        item: i.item,
                        amount: i.amount,
                        subitems: i.subitems?.filter((s) => s.visible).map((s) => ({ item: s.item, amount: s.amount })),
                      }))
                    const updatedQuoteData: ProjectData = { ...quoteProjectData, quoteItems, contractAmount: String(Math.round(selectedProductsTotal)) }
                    setQuoteProjectData(updatedQuoteData)

                    // 選択された商材に見積生成情報を保存（デモ用）
                    if (selectedProjectForQuote && selectedProductsForQuote.size > 0) {
                      selectedProjectForQuote.products
                        .filter((p) => selectedProductsForQuote.has(p.id))
                        .forEach((product) => {
                          updateProduct(product.id, {
                            ...product,
                            quoteGenerated: true,
                            quoteData: updatedQuoteData,
                          })
                        })
                    }
                    setQuoteStep("quote")
                    setQuoteGenerated(true)
                  }}
                  disabled={editableQuoteItems.filter((i) => i.visible).length === 0}
                >
                  見積書を生成
                </Button>
              </div>
            </div>

            {/* 見積書プレビュー画面（4枚目） */}
            <div className="min-w-full flex-shrink-0 px-1 w-full flex flex-col h-full overflow-hidden">
              <DialogHeader className="pb-4 pt-2 flex-shrink-0">
                <DialogTitle>見積書プレビュー</DialogTitle>
                <DialogDescription>生成した見積書を確認してください</DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0" style={{ maxHeight: "calc(85vh - 200px)" }}>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">PDFプレビュー</Badge>
                </div>

                <div className="bg-white border-2 border-slate-300 rounded-lg shadow-lg p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-slate-900">見積書</h2>
                      <div className="text-right text-sm text-slate-600">
                        <div>発行日: {new Date().toLocaleDateString("ja-JP")}</div>
                        <div>案件No: {selectedProjectForQuote?.projectNumber}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-lg font-medium">{quoteProjectData.clientName} 御中</div>
                      <p className="text-sm text-slate-600">下記の通りお見積もりいたします。</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">案件名</div>
                        <div className="font-medium text-slate-900">{quoteProjectData.projectName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">実施日</div>
                        <div className="font-medium text-slate-900">{quoteProjectData.date}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-900">見積明細</h3>
                      {productQuoteItems.map((productQuote, productIdx) => {
                        const productName = productQuote.product.eventProductName || productQuote.product.projectName
                        const productDate = productQuote.product.eventDate || productQuote.product.date
                        const productTotal = productQuote.items.reduce((sum, item) => sum + item.amount, 0)
                        return (
                          <div key={productIdx} className="space-y-2">
                            <div className="bg-slate-50 p-2 rounded border border-slate-200">
                              <div className="font-semibold text-slate-900">{productName}</div>
                              <div className="text-xs text-slate-600">実施日: {productDate}</div>
                            </div>
                            <table className="w-full border border-slate-300">
                              <thead className="bg-slate-100">
                                <tr>
                                  <th className="text-left p-3 text-sm font-medium text-slate-700 border-b border-slate-300">項目</th>
                                  <th className="text-right p-3 text-sm font-medium text-slate-700 border-b border-slate-300">金額</th>
                                </tr>
                              </thead>
                              <tbody>
                                {productQuote.items.map((item, idx) => (
                                  <>
                                    <tr key={idx} className="border-b border-slate-200">
                                      <td className="p-3 text-sm font-medium">{item.item}</td>
                                      <td className="p-3 text-sm text-right font-medium">¥{item.amount.toLocaleString()}</td>
                                    </tr>
                                    {item.subitems?.map((subitem, subIdx) => (
                                      <tr key={`${idx}-${subIdx}`} className="border-b border-slate-100 bg-slate-50/50">
                                        <td className="p-2 pl-6 text-sm text-slate-600">{subitem.item}</td>
                                        <td className="p-2 text-sm text-right text-slate-600">¥{subitem.amount.toLocaleString()}</td>
                                      </tr>
                                    ))}
                                  </>
                                ))}
                              </tbody>
                              <tfoot className="bg-slate-100 border-t border-slate-300">
                                <tr>
                                  <td className="p-2 text-sm font-semibold text-slate-700">小計</td>
                                  <td className="p-2 text-sm text-right font-semibold text-slate-700">
                                    ¥{productTotal.toLocaleString()}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )
                      })}
                      <div className="border-t-2 border-slate-400 pt-2">
                        <table className="w-full">
                          <tfoot className="bg-slate-100">
                            <tr>
                              <td className="p-3 text-sm font-bold">合計金額（税込）</td>
                              <td className="p-3 text-sm text-right font-bold text-blue-600 text-lg">
                                ¥{Math.round(selectedProductsTotal).toLocaleString()}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                        <div className="text-xs text-slate-500 mt-2">
                          ※ 合計金額は「選択した商材の合計見積金額」を表示しています
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t pt-4 flex-shrink-0">
                <Button variant="outline" onClick={() => setQuoteStep("template")}>
                  戻る
                </Button>
                <Button
                  onClick={() => {
                    // メール文面を自動生成
                    const email = `${quoteProjectData.clientName} 御中

平素より大変お世話になっております。
DMM の営業担当でございます。

このたびは「${quoteProjectData.projectName}」の件につきまして、
お見積書をお送りいたします。

ご検討のほど、何卒よろしくお願い申し上げます。
`
                    setQuoteProjectData({ ...quoteProjectData, emailDraft: email })
                    setEmailGenerated(true)
                    setQuoteStep("email")
                  }}
                  className="gap-2"
                  disabled={!quoteGenerated}
                >
                  <Mail className="h-4 w-4" />
                  メール文面へ
                </Button>
              </div>
            </div>

            {/* メール送付画面（5枚目） */}
            <div className="min-w-full flex-shrink-0 px-1 w-full flex flex-col h-full overflow-hidden">
              <DialogHeader className="pb-4 pt-2 flex-shrink-0">
                <DialogTitle>メール送付</DialogTitle>
                <DialogDescription>見積書をメールで送付します</DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
                <div className="bg-white border-2 border-slate-300 rounded-lg shadow-lg p-4">
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">送付メール文面</Label>
                  <Textarea
                    value={quoteProjectData.emailDraft}
                    onChange={(e) => setQuoteProjectData({ ...quoteProjectData, emailDraft: e.target.value })}
                    rows={16}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setQuoteStep("quote")}>
                  戻る
                </Button>
                <Button
                  onClick={() => {
                    setIsLoadingSend(true)
                    setTimeout(() => {
                      if (selectedProjectForQuote && selectedProductsForQuote.size > 0) {
                        selectedProjectForQuote.products
                          .filter((p) => selectedProductsForQuote.has(p.id))
                          .forEach((product) => {
                            updateProduct(product.id, {
                              ...product,
                              projectStatus: "見積送付完了",
                            })
                          })
                      }

                      setIsLoadingSend(false)
                      closeAndReset()
                      addNotification("見積書を送付しました")
                    }, 500)
                  }}
                  className="gap-2"
                  disabled={!emailGenerated || isLoadingSend}
                >
                  <Send className="h-4 w-4" />
                  {isLoadingSend ? "送付中..." : "見積書送付"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

