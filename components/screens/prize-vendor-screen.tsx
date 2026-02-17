"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  MapPin,
  Building,
  Upload,
  FileText,
  Send,
  DollarSign,
  Eye,
  ArrowLeft,
  Package,
  FileSpreadsheet,
  Download,
  Truck,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useProject } from "@/contexts/project-context"
import type { Project } from "@/types"

const mockCsvData = [
  { No: 1, 品名: "クオカード1000円分", 数量: 1, 配送先名: "山田太郎", 住所: "東京都渋谷区...", 電話番号: "090-1234-5678" },
  { No: 2, 品名: "カタログギフト", 数量: 1, 配送先名: "佐藤花子", 住所: "神奈川県横浜市...", 電話番号: "080-2345-6789" },
  { No: 3, 品名: "和牛セット", 数量: 1, 配送先名: "鈴木一郎", 住所: "大阪府大阪市...", 電話番号: "070-3456-7890" },
  { No: 4, 品名: "旅行券", 数量: 1, 配送先名: "高橋美咲", 住所: "北海道札幌市...", 電話番号: "090-9876-5432" },
  { No: 5, 品名: "お米券", 数量: 2, 配送先名: "伊藤健太", 住所: "福岡県福岡市...", 電話番号: "080-8765-4321" },
]

/** 当選者リストがプロジェクトにない場合のデモ用（mockCsvData から生成） */
function getDemoWinnersFromMock(): { id: string; name: string; address?: string; phone?: string; prize?: string }[] {
  return mockCsvData.map((r, i) => ({
    id: String(i + 1),
    name: r.配送先名,
    address: r.住所,
    phone: r.電話番号,
    prize: r.品名,
  }))
}

/** 配送情報を送信する際の「担当業者」候補 */
function getVendorOptions(project: Project | null): { vendorId: string; vendorName: string }[] {
  if (!project) return []
  if (project.prizeOrdersByVendor && project.prizeOrdersByVendor.length > 0) {
    return project.prizeOrdersByVendor.map((o) => ({ vendorId: o.vendorId, vendorName: o.vendorName }))
  }
  if (project.prizeOrderDocument?.vendorName) {
    return [{ vendorId: "legacy", vendorName: project.prizeOrderDocument.vendorName }]
  }
  return []
}

export function PrizeVendorScreen() {
  const { toast } = useToast()
  const { projects, getProjectById, updateProject } = useProject()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  /** 表示用: 選択中案件は常にコンテキストから最新を取得（事務管理課で発注済みなら発注書・依頼を表示） */
  const project = selectedProject ? (getProjectById(selectedProject.id) ?? selectedProject) : null
  const vendorOptions = useMemo(() => getVendorOptions(project), [project])
  /** 配送情報を送信する担当業者（複数ある場合は選択、1件の場合は自動） */
  const [currentVendorId, setCurrentVendorId] = useState<string>("")
  const currentVendor = useMemo(() => vendorOptions.find((v) => v.vendorId === currentVendorId) ?? vendorOptions[0] ?? null, [vendorOptions, currentVendorId])
  const [showConfirm, setShowConfirm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showOrderDocModal, setShowOrderDocModal] = useState(false)
  /** プレビューする発注書（業者ごとがある場合はどれを表示するか） */
  const [selectedOrderDocForPreview, setSelectedOrderDocForPreview] = useState<{ vendorName: string; requestedAt: string; document: { projectName: string; hallNames: string; prizeNames: string; totalQuantity: number } } | null>(null)
  const [previewData, setPreviewData] = useState<typeof mockCsvData>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  /** 当選者ごとの配送情報（一人ひとり入力） */
  type DeliveryRow = { winnerId: string; winnerName: string; carrierName: string; trackingNumber: string; shippedAt: string }
  const [deliveryRows, setDeliveryRows] = useState<DeliveryRow[]>([])

  /** 表示する当選者リスト（プロジェクトに保存済み or デモ用） */
  const winners = useMemo(() => {
    if (project?.winnerList && project.winnerList.length > 0) return project.winnerList
    return getDemoWinnersFromMock()
  }, [project?.winnerList])

  useEffect(() => {
    if (vendorOptions.length > 0 && !currentVendorId) setCurrentVendorId(vendorOptions[0].vendorId)
  }, [vendorOptions, currentVendorId])

  /** 選択中業者で既に送信済みの配送情報があればフォームに反映。当選者リストが変わったら行を再構成 */
  useEffect(() => {
    if (!project || !currentVendor) return
    const entry = project.prizeDeliveryInfoByVendor?.find((d) => d.vendorId === currentVendor.vendorId)
    const list = project.winnerList && project.winnerList.length > 0 ? project.winnerList : getDemoWinnersFromMock()
    if (entry?.deliveries && entry.deliveries.length > 0) {
      setDeliveryRows(
        list.map((w) => {
          const d = entry.deliveries!.find((x) => x.winnerId === w.id)
          return {
            winnerId: w.id,
            winnerName: w.name,
            carrierName: d?.carrierName ?? "",
            trackingNumber: d?.trackingNumber ?? "",
            shippedAt: d?.shippedAt ?? "",
          }
        })
      )
    } else {
      setDeliveryRows(
        list.map((w) => ({
          winnerId: w.id,
          winnerName: w.name,
          carrierName: entry?.carrierName ?? "",
          trackingNumber: entry?.trackingNumber ?? "",
          shippedAt: entry?.shippedAt ?? "",
        }))
      )
    }
  }, [project?.id, project?.winnerList, currentVendor?.vendorId, project?.prizeDeliveryInfoByVendor])

  const handleFileClick = () => fileInputRef.current?.click()
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      toast({ title: "ファイル選択", description: `配送情報ファイル「${file.name}」を選択しました` })
    }
  }

  const updateDeliveryRow = (winnerId: string, field: keyof Omit<DeliveryRow, "winnerId" | "winnerName">, value: string) => {
    setDeliveryRows((prev) =>
      prev.map((r) => (r.winnerId === winnerId ? { ...r, [field]: value } : r))
    )
  }

  const handleSubmit = () => {
    if (!project || !currentVendor) return
    setShowConfirm(false)
    const deliveredAt = new Date().toISOString()
    const deliveries = deliveryRows.map((r) => ({
      winnerId: r.winnerId,
      winnerName: r.winnerName,
      carrierName: r.carrierName.trim() || undefined,
      trackingNumber: r.trackingNumber.trim() || undefined,
      shippedAt: r.shippedAt.trim() || undefined,
    }))
    const existing = project.prizeDeliveryInfoByVendor ?? []
    const next = existing.filter((d) => d.vendorId !== currentVendor.vendorId).concat({
      vendorId: currentVendor.vendorId,
      vendorName: currentVendor.vendorName,
      deliveredAt,
      deliveries,
    })
    updateProject(project.id, { prizeDeliveryInfoByVendor: next })
    toast({
      title: "送信完了",
      description: `配送情報を${deliveryRows.length}件送信しました。事務管理課で確認できます。`,
    })
    setDeliveryRows((prev) => prev.map((r) => ({ ...r, carrierName: "", trackingNumber: "", shippedAt: "" })))
  }

  const canSubmit = deliveryRows.some(
    (r) => r.carrierName.trim() !== "" || r.trackingNumber.trim() !== "" || r.shippedAt.trim() !== ""
  )
  const handlePreview = () => {
    setPreviewData(mockCsvData)
    setShowPreview(true)
  }

  if (!selectedProject) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-8 max-w-5xl mx-auto">
            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-sm">{project.id}</Badge>
                          <Badge variant={project.status === "order-received" ? "default" : "secondary"}>
                            {project.status === "before-proposal" ? "提案前" : project.status === "proposing" ? "提案中" : "受注"}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">{project.hallNames.join(" / ")}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{project.eventStartDate === project.eventEndDate ? project.eventStartDate : `${project.eventStartDate} ～ ${project.eventEndDate}`}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{project.area}</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />¥{project.budget}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">作成日: {project.createdAt}</div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedProject(project)}>
                        <Eye className="w-4 h-4 mr-2" />詳細
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="h-full">
          <div className="container mx-auto py-6 max-w-4xl px-4">
            <div className="mb-4">
              <Button variant="ghost" onClick={() => setSelectedProject(null)} className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft className="w-4 h-4" />案件一覧に戻る
              </Button>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                {project.companyName}
                <Badge variant="outline" className="ml-2 font-normal">{project.id}</Badge>
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center"><Building className="w-4 h-4 mr-1" /> {project.hallNames.join(" / ")}</span>
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {project.area}</span>
              </div>
            </div>
            <Separator className="my-6" />
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />案件情報</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">イベント名</Label><div className="font-medium mt-1">{project.companyName} 抽選会イベント</div></div>
                <div><Label className="text-muted-foreground">開催日</Label><div className="font-medium mt-1">{project.eventStartDate} 〜 {project.eventEndDate}</div></div>
                <div><Label className="text-muted-foreground">会場</Label><div className="font-medium mt-1">{project.hallNames.join(", ")}</div></div>
                <div><Label className="text-muted-foreground">ターゲット</Label><div className="font-medium mt-1">{project.target || "未定"}</div></div>
              </CardContent>
            </Card>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" />景品領域</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><FileText className="w-4 h-4" />発注書・依頼</h3>
                  {(project.prizeOrdersByVendor && project.prizeOrdersByVendor.length > 0) || (project.prizeOrderRequestedAt && project.prizeOrderDocument) ? (
                    <div className="space-y-3">
                      <p className="text-sm text-primary font-medium">事務管理課から発注依頼が届いています</p>
                      {project.prizeOrdersByVendor && project.prizeOrdersByVendor.length > 0 ? (
                        project.prizeOrdersByVendor.map((order) => (
                          <div key={order.vendorId} className="bg-muted/50 p-4 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{order.vendorName}</span>
                              <span className="text-xs text-muted-foreground">{new Date(order.requestedAt).toLocaleString("ja")}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => {
                                  setSelectedOrderDocForPreview({ vendorName: order.vendorName, requestedAt: order.requestedAt, document: order.document })
                                  setShowOrderDocModal(true)
                                }}
                              >
                                <Eye className="w-4 h-4" />発注書をプレビュー
                              </Button>
                              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast({ title: "ダウンロード", description: "発注書をPDFでダウンロードしました" })}>
                                <Download className="w-4 h-4" />DL
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        project.prizeOrderDocument && (
                          <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">依頼日時</span>
                              <span className="font-medium">{project.prizeOrderRequestedAt ? new Date(project.prizeOrderRequestedAt).toLocaleString("ja") : "ー"}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => {
                                  setSelectedOrderDocForPreview({
                                    vendorName: project.prizeOrderDocument!.vendorName,
                                    requestedAt: project.prizeOrderDocument!.requestedAt,
                                    document: {
                                      projectName: project.prizeOrderDocument!.projectName,
                                      hallNames: project.prizeOrderDocument!.hallNames,
                                      prizeNames: project.prizeOrderDocument!.prizeNames,
                                      totalQuantity: project.prizeOrderDocument!.totalQuantity,
                                    },
                                  })
                                  setShowOrderDocModal(true)
                                }}
                              >
                                <Eye className="w-4 h-4" />発注書をプレビュー
                              </Button>
                              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast({ title: "ダウンロード", description: "発注書をPDFでダウンロードしました" })}>
                                <Download className="w-4 h-4" />DL
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="bg-muted/50 p-4 rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground">発注書・依頼はまだ届いていません。事務管理課で景品発注処理（発注依頼メール送信）が完了するとここに表示されます。</p>
                    </div>
                  )}
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><Truck className="w-4 h-4" />配送情報入力</h3>
                  {vendorOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">発注依頼が届いている業者のみ、配送情報を送信できます。事務管理課で発注依頼メールが送信されるとここで入力・送信でき、事務管理課画面で参照されます。</p>
                  ) : (
                    <>
                      {vendorOptions.length > 1 && (
                        <div className="mb-4">
                          <Label className="text-muted-foreground">担当業者（送信する発注先）</Label>
                          <select
                            className="mt-1 flex h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={currentVendorId}
                            onChange={(e) => setCurrentVendorId(e.target.value)}
                          >
                            {vendorOptions.map((v) => (
                              <option key={v.vendorId} value={v.vendorId}>{v.vendorName}</option>
                            ))}
                          </select>
                        </div>
                      )}
                  <p className="text-xs text-muted-foreground mb-4">当選者ごとに配送会社名・追跡番号・発送日を入力し送信すると、事務管理課の「景品業者が入力した配送情報の参照」で確認できます。</p>
                  <div className="border rounded-md overflow-hidden mb-6">
                    <div className="h-[440px] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">当選者名</TableHead>
                            <TableHead>配送会社名</TableHead>
                            <TableHead>追跡番号</TableHead>
                            <TableHead className="w-[140px]">発送日</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {deliveryRows.map((row) => (
                            <TableRow key={row.winnerId}>
                              <TableCell className="font-medium">{row.winnerName}</TableCell>
                              <TableCell>
                                <Input
                                  placeholder="例: ヤマト運輸"
                                  value={row.carrierName}
                                  onChange={(e) => updateDeliveryRow(row.winnerId, "carrierName", e.target.value)}
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  placeholder="例: 1234-5678-9012"
                                  value={row.trackingNumber}
                                  onChange={(e) => updateDeliveryRow(row.winnerId, "trackingNumber", e.target.value)}
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="date"
                                  value={row.shippedAt}
                                  onChange={(e) => updateDeliveryRow(row.winnerId, "shippedAt", e.target.value)}
                                  className="h-8"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">または、追跡番号等が含まれたファイルをアップロードすることもできます。</p>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer bg-muted/10" onClick={handleFileClick}>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2"><Upload className="w-5 h-5 text-muted-foreground" /></div>
                    <p className="text-sm text-muted-foreground">クリックしてファイルを選択</p>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); handleFileClick() }}>ファイルを選択</Button>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => setShowConfirm(true)}
                      disabled={!canSubmit}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      送信する
                    </Button>
                  </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>配送情報の送信</DialogTitle>
            <DialogDescription>以下の内容で配送情報を送信しますか？（当選者ごと）</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] rounded-lg border bg-muted/30 p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>当選者名</TableHead>
                  <TableHead>配送会社名</TableHead>
                  <TableHead>追跡番号</TableHead>
                  <TableHead>発送日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryRows.map((row) => (
                  <TableRow key={row.winnerId}>
                    <TableCell className="font-medium">{row.winnerName}</TableCell>
                    <TableCell className="text-sm">{row.carrierName || "ー"}</TableCell>
                    <TableCell className="text-sm">{row.trackingNumber || "ー"}</TableCell>
                    <TableCell className="text-sm">{row.shippedAt || "ー"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>キャンセル</Button>
            <Button onClick={handleSubmit}>送信</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>発注書プレビュー</DialogTitle>
          </DialogHeader>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(mockCsvData[0] || {}).map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, i) => (
                  <TableRow key={i}>
                    {Object.values(row).map((cell, j) => (
                      <TableCell key={j}>{String(cell)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showOrderDocModal}
        onOpenChange={(open) => {
          setShowOrderDocModal(open)
          if (!open) setSelectedOrderDocForPreview(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              景品発注書{selectedOrderDocForPreview ? `（${selectedOrderDocForPreview.vendorName} 宛）` : ""}
            </DialogTitle>
            <DialogDescription>事務管理課から送信された発注書の内容です</DialogDescription>
          </DialogHeader>
          {selectedOrderDocForPreview && (
            <div className="rounded-lg border bg-white p-6 text-black space-y-4">
              <div className="text-center border-b-2 border-black pb-2">
                <h2 className="text-xl font-bold">発注書</h2>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="text-muted-foreground">発注日</div>
                <div>{selectedOrderDocForPreview.requestedAt ? new Date(selectedOrderDocForPreview.requestedAt).toLocaleDateString("ja") : "ー"}</div>
                <div className="text-muted-foreground">発注先</div>
                <div className="font-medium">{selectedOrderDocForPreview.vendorName}</div>
                <div className="text-muted-foreground">案件名</div>
                <div>{selectedOrderDocForPreview.document.projectName || "ー"}</div>
                <div className="text-muted-foreground">会場</div>
                <div>{selectedOrderDocForPreview.document.hallNames || "ー"}</div>
                <div className="text-muted-foreground">品名</div>
                <div>{selectedOrderDocForPreview.document.prizeNames || "ー"}</div>
                <div className="text-muted-foreground">数量</div>
                <div>{selectedOrderDocForPreview.document.totalQuantity}名分</div>
                <div className="text-muted-foreground">納期</div>
                <div>要相談</div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">上記のとおり発注いたします。</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowOrderDocModal(false); setSelectedOrderDocForPreview(null) }}>閉じる</Button>
            <Button variant="outline" onClick={() => toast({ title: "ダウンロード", description: "発注書をPDFでダウンロードしました" })}>
              PDFでダウンロード
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
