"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useProject } from "@/contexts/project-context"
import type { Project } from "@/types"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload,
  FileCheck,
  FileText,
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Eye,
  MessageSquare,
} from "lucide-react"

export type LotteryAdminContentProps = {
  project: Project
}

/** デモ用の氏名・住所・電話のプール（当選者リスト生成時に景品情報の数量に合わせて使用） */
const DEMO_PEOPLE = [
  { name: "山田太郎", address: "東京都渋谷区1-1-1", phone: "090-1234-5678" },
  { name: "佐藤花子", address: "神奈川県横浜市2-2-2", phone: "080-2345-6789" },
  { name: "鈴木一郎", address: "大阪府大阪市3-3-3", phone: "070-3456-7890" },
  { name: "高橋美咲", address: "北海道札幌市4-4-4", phone: "090-9876-5432" },
  { name: "伊藤健太", address: "福岡県福岡市5-5-5", phone: "080-8765-4321" },
  { name: "渡辺さくら", address: "愛知県名古屋市6-6-6", phone: "070-7654-3210" },
  { name: "小林大輔", address: "宮城県仙台市7-7-7", phone: "090-6543-2109" },
  { name: "加藤優子", address: "広島県広島市8-8-8", phone: "080-5432-1098" },
]

/** デザイン業者（取引先マスタの industry: design） */
function useDesignVendors() {
  const { getTradingPartnersByIndustry } = useProject()
  return useMemo(
    () => getTradingPartnersByIndustry("design"),
    [getTradingPartnersByIndustry]
  )
}

/** 景品業者一覧 */
function usePrizeVendors() {
  const { getPrizeVendors } = useProject()
  return useMemo(() => getPrizeVendors(), [getPrizeVendors])
}

/** 景品マスタ一覧 */
function usePrizes() {
  const { getPrizes } = useProject()
  return useMemo(() => getPrizes(), [getPrizes])
}

export function LotteryAdminContent({ project: initialProject }: LotteryAdminContentProps) {
  const { toast } = useToast()
  const {
    updateProject,
    createDesignRequest: addDesignRequest,
    getDesignRequestsByProjectAndType,
    getDesignRequestById,
    addDesignRequestComment,
    projects,
  } = useProject()

  const prizes = usePrizes()
  const prizeVendors = usePrizeVendors()

  // updateProject後に常に最新のデータを使用するため、projects配列から再取得
  const project = (projects.find((p) => p.id === initialProject.id) ?? initialProject) as Project

  // デザイン業者選択のローカルステート（projectより前に宣言が必要）
  // 空文字で初期化してSSRハイドレーションエラーを回避（useEffectで復元）
  const [selectedVendorId, setSelectedVendorId] = useState("")

  const prizeInfo = project.prizeInfo ?? []
  const designVendors = useDesignVendors()
  /** 当選通知書の依頼先デザイン業者（1社。ローカルステートから取得） */
  const selectedDesignVendorForNotification = useMemo(
    () => selectedVendorId ? designVendors.find((dv) => String(dv.id) === selectedVendorId) ?? null : null,
    [designVendors, selectedVendorId]
  )

  /** 景品情報を業者ごとにグループ化（景品マスタの vendorId で紐づく） */
  const vendorOrders = useMemo(() => {
    const map = new Map<string, { vendorId: string; vendorName: string; prizeItems: { name: string; quantity: number }[]; totalQuantity: number }>()
    prizeInfo.forEach((item) => {
      const prize = item.prizeId ? prizes.find((p) => String(p.id) === String(item.prizeId)) : null
      const vendorId = prize?.vendorId ? String(prize.vendorId) : "unknown"
      const vendor = prizeVendors.find((v) => String(v.id) === vendorId)
      const vendorName = vendor?.name ?? vendorId
      const name = item.name?.trim() || "（景品名未設定）"
      const qty = Math.max(0, parseInt(item.quantity, 10) || 0)
      if (!map.has(vendorId)) {
        map.set(vendorId, { vendorId, vendorName, prizeItems: [], totalQuantity: 0 })
      }
      const entry = map.get(vendorId)!
      entry.prizeItems.push({ name, quantity: qty })
      entry.totalQuantity += qty
    })
    return Array.from(map.values())
  }, [prizeInfo, prizes, prizeVendors])

  /** この業者へすでに発注済みか */
  const isVendorOrderSent = useCallback(
    (vendorId: string, vendorName: string) => {
      if (project.prizeOrdersByVendor?.some((o: any) => o.vendorId === vendorId)) return true
      if (project.prizeOrderRequestedAt && project.prizeOrderDocument?.vendorName) {
        if (project.prizeOrderDocument.vendorName === vendorName) return true
        const docVendor = prizeVendors.find((v) => v.name === project.prizeOrderDocument!.vendorName)
        if (docVendor && String(docVendor.id) === vendorId) return true
      }
      return false
    },
    [project.prizeOrdersByVendor, project.prizeOrderRequestedAt, project.prizeOrderDocument, prizeVendors]
  )

  /** 商材情報（景品情報）に基づいてデモ当選者リストを生成。景品の name・quantity と一致させる */
  const demoWinnerData = useMemo(() => {
    const rows: { id: number; name: string; address: string; phone: string; prize: string }[] = []
    let id = 1
    if (prizeInfo.length === 0) {
      DEMO_PEOPLE.slice(0, 3).forEach((p) => {
        rows.push({ id: id++, ...p, prize: "（景品未設定）" })
      })
      return rows
    }
    // 景品ごとに当選者を生成（景品の数量分だけ当選者を作成）
    let personIndex = 0
    prizeInfo.forEach((prize) => {
      const qty = Math.max(0, parseInt(prize.quantity, 10) || 0)
      const prizeName = prize.name?.trim() || "（景品名未設定）"
      for (let i = 0; i < qty; i++) {
        const p = DEMO_PEOPLE[personIndex % DEMO_PEOPLE.length]
        rows.push({ id: id++, name: p.name, address: p.address, phone: p.phone, prize: prizeName })
        personIndex++
      }
    })
    return rows.length > 0 ? rows : [{ id: 1, ...DEMO_PEOPLE[0], prize: "（景品未設定）" }]
  }, [prizeInfo])

  const [fileUploaded, setFileUploaded] = useState(false)
  const [showWinnerListError, setShowWinnerListError] = useState(false)
  const [winnerListValidated, setWinnerListValidated] = useState(false)
  const [notificationOrderGenerated, setNotificationOrderGenerated] = useState(false)
  const [notificationOrderSent, setNotificationOrderSent] = useState(false)
  const [prizeOrderGenerated, setPrizeOrderGenerated] = useState(false)
  const [prizeOrderSent, setPrizeOrderSent] = useState(false)
  const [prizeDeliveryDate, setPrizeDeliveryDate] = useState("")
  const [quoCardLetterChecked, setQuoCardLetterChecked] = useState(false)
  const [showDeliveryData, setShowDeliveryData] = useState(false)

  /** 画面を開き直したときにプロジェクトに保存済みの状態を復元 */
  useEffect(() => {
    const at = (s?: string) => !!s
    setSelectedVendorId(String(project.notificationOrderDesignVendorId ?? ""))
    setFileUploaded(at(project.winnerListUploadedAt))
    setWinnerListValidated(at(project.winnerListValidatedAt))
    setNotificationOrderGenerated(at(project.notificationOrderGeneratedAt))
    setNotificationOrderSent(at(project.notificationOrderSentAt))
    setPrizeOrderGenerated(at(project.prizeOrderGeneratedAt))
    setPrizeOrderSent((project.prizeOrdersByVendor?.length ?? 0) > 0)
    setQuoCardLetterChecked(at(project.quoCardLetterCheckedAt))
  }, [
    project.id,
    project.winnerListUploadedAt,
    project.winnerListValidatedAt,
    project.notificationOrderGeneratedAt,
    project.notificationOrderSentAt,
    project.prizeOrderGeneratedAt,
    project.prizeOrdersByVendor?.length,
    project.quoCardLetterCheckedAt,
  ])

  const [showNotificationOrderModal, setShowNotificationOrderModal] = useState(false)
  const [showNotificationDocPreview, setShowNotificationDocPreview] = useState(false)
  const [selectedDesignVendorForPreview, setSelectedDesignVendorForPreview] = useState<(typeof designVendors)[number] | null>(null)
  const [showSendOrderModal, setShowSendOrderModal] = useState(false)
  const [selectedVendorForOrder, setSelectedVendorForOrder] = useState<(typeof vendorOrders)[number] | null>(null)
  const [showSendNotificationToDesignModal, setShowSendNotificationToDesignModal] = useState(false)
  const [selectedDesignVendorForSend, setSelectedDesignVendorForSend] = useState<(typeof designVendors)[number] | null>(null)
  const [showLetterCheckModal, setShowLetterCheckModal] = useState(false)
  const [showPrizeOrderDocPreview, setShowPrizeOrderDocPreview] = useState(false)
  /** 発注書プレビューで表示する業者（景品業者ごとに発注書を作成） */
  const [selectedVendorForDocPreview, setSelectedVendorForDocPreview] = useState<(typeof vendorOrders)[number] | null>(null)
  /** 当選通知書：コメントやり取りダイアログで表示する依頼ID */
  const [selectedNotificationRequestIdForComment, setSelectedNotificationRequestIdForComment] = useState<string | null>(null)
  const [notificationCommentText, setNotificationCommentText] = useState("")

  /** 当選通知書（winner-list）をこのデザイン業者へ送信済みか */
  const notificationRequestByVendor = useMemo(
    () => getDesignRequestsByProjectAndType(project.id, "winner-list"),
    [project.id, getDesignRequestsByProjectAndType]
  )
  const isNotificationSentToDesignVendor = useCallback(
    (vendorId: string) => notificationRequestByVendor.some((r) => r.vendorId === vendorId),
    [notificationRequestByVendor]
  )

  const handleGenerateNotificationOrder = () => setShowNotificationOrderModal(true)
  const confirmNotificationOrderGeneration = () => {
    setShowNotificationOrderModal(false)
    setNotificationOrderGenerated(true)
    updateProject(project.id, { notificationOrderGeneratedAt: new Date().toISOString() })
    toast({ title: "当選通知書発注書を生成しました", description: "発注書の内容をプレビューで確認できます" })
  }

  const handleSendNotificationToDesignVendor = (vendor: (typeof designVendors)[number]) => {
    setSelectedDesignVendorForSend(vendor)
    setShowSendNotificationToDesignModal(true)
  }
  const confirmSendNotificationToDesignVendor = () => {
    if (!selectedDesignVendorForSend) return
    setShowSendNotificationToDesignModal(false)
    addDesignRequest({
      requestType: "winner-list",
      projectId: Number(project.id),
      projectName: project.projectName,
      companyName: project.companyName ?? "",
      hallNames: Array.isArray(project.hallNames) ? project.hallNames : [],
      eventStartDate: project.eventStartDate,
      eventEndDate: project.eventEndDate,
      requestedAt: new Date().toISOString(),
      requestedBy: "admin",
      requestedByName: "事務管理課",
      status: "requested",
      vendorId: String(selectedDesignVendorForSend.id),
      vendorName: selectedDesignVendorForSend.name,
      comments: [],
    })
    updateProject(project.id, { notificationOrderSentAt: new Date().toISOString() })
    setNotificationOrderSent(true)
    setSelectedDesignVendorForSend(null)
    toast({
      title: "発注メール送信完了",
      description: `${selectedDesignVendorForSend.name} へ送信しました。デザイン業者画面で依頼確認・アップロードが可能です。`,
    })
  }

  const handleSendPrizeOrder = (vendorOrder: (typeof vendorOrders)[number]) => {
    setSelectedVendorForOrder(vendorOrder)
    setShowSendOrderModal(true)
  }
  const confirmSendPrizeOrder = () => {
    if (!selectedVendorForOrder) return
    setShowSendOrderModal(false)
    const requestedAt = new Date().toISOString()
    const doc = {
      projectName: project.projectName || project.companyName + " " + (project.hallNames?.join("／") || ""),
      hallNames: project.hallNames?.join("、") || "ー",
      prizeNames: selectedVendorForOrder.prizeItems.map((p) => `${p.name} x${p.quantity}`).join("、"),
      totalQuantity: selectedVendorForOrder.totalQuantity,
    }
    const existing = project.prizeOrdersByVendor ?? []
    const nextOrders = [...existing, { vendorId: selectedVendorForOrder.vendorId, vendorName: selectedVendorForOrder.vendorName, requestedAt, document: doc }]
    updateProject(project.id, {
      prizeOrderRequestedAt: requestedAt,
      prizeOrderDocument: existing.length === 0 ? { vendorName: selectedVendorForOrder.vendorName, requestedAt, ...doc } : project.prizeOrderDocument,
      prizeOrdersByVendor: nextOrders,
    })
    setSelectedVendorForOrder(null)
    setPrizeOrderSent(true)
    toast({
      title: "発注メール送信完了",
      description: `${selectedVendorForOrder.vendorName} へ送信しました。景品業者画面で発注書・依頼を確認できます。`,
    })
  }

  const handleCheckQuoCardLetter = () => setShowLetterCheckModal(true)
  const confirmLetterCheck = () => {
    setShowLetterCheckModal(false)
    setQuoCardLetterChecked(true)
    updateProject(project.id, { quoCardLetterCheckedAt: new Date().toISOString() })
    toast({ title: "書簡チェック完了", description: "問題は検出されませんでした" })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            当選者リストアップロード
          </CardTitle>
          <CardDescription>Excelファイル（.xlsx）をアップロードしてください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!fileUploaded ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                  <p className="font-medium mb-2">PSP連携</p>
                  <p className="text-sm text-muted-foreground mb-4">ホールがアップロードしたデータを同期</p>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        const now = new Date().toISOString()
                        setFileUploaded(true)
                        setShowWinnerListError(false)
                        setWinnerListValidated(true)
                        const winnerList = demoWinnerData.map((w) => ({
                          id: String(w.id),
                          name: w.name,
                          address: w.address,
                          phone: w.phone,
                          prize: w.prize,
                        }))
                        updateProject(project.id, { winnerListUploadedAt: now, winnerListValidatedAt: now, winnerList })
                        toast({ title: "同期完了", description: "PSPから正常なデータを取得しました" })
                      }}
                      className="bg-primary w-full"
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      正常データを同期
                    </Button>
                    <Button
                      onClick={() => {
                        const now = new Date().toISOString()
                        setFileUploaded(true)
                        setShowWinnerListError(true)
                        setWinnerListValidated(false)
                        updateProject(project.id, { winnerListUploadedAt: now })
                        toast({ title: "同期完了", description: "PSPからデータを取得しましたが、不整合があります", variant: "destructive" })
                      }}
                      variant="destructive"
                      className="w-full"
                      size="sm"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      異常データを同期
                    </Button>
                  </div>
                </div>
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                  <p className="font-medium mb-2">ファイルアップロード</p>
                  <p className="text-sm text-muted-foreground mb-4">手元のExcelファイルをアップロード</p>
                  <div
                    className="flex flex-col items-center justify-center h-[88px] border border-dashed rounded bg-background cursor-pointer hover:bg-accent/50"
                    onClick={() => {
                      const now = new Date().toISOString()
                      setFileUploaded(true)
                      setShowWinnerListError(false)
                      setWinnerListValidated(true)
                      const winnerList = demoWinnerData.map((w) => ({
                        id: String(w.id),
                        name: w.name,
                        address: w.address,
                        phone: w.phone,
                        prize: w.prize,
                      }))
                      updateProject(project.id, { winnerListUploadedAt: now, winnerListValidatedAt: now, winnerList })
                      toast({ title: "アップロード完了", description: "ファイルが正常にアップロードされました" })
                    }}
                  >
                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">クリックしてファイルを選択</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full text-left space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-medium flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-green-600" />
                  winners_list_20241225.xlsx (PSP連携済)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFileUploaded(false)
                    setWinnerListValidated(false)
                    setShowWinnerListError(false)
                    updateProject(project.id, {
                      winnerListUploadedAt: undefined,
                      winnerListValidatedAt: undefined,
                      winnerList: undefined,
                    })
                  }}
                >
                  リセット
                </Button>
              </div>
              <div className="border rounded-md overflow-hidden">
                <div className="h-[440px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>名前</TableHead>
                        <TableHead>住所</TableHead>
                        <TableHead>電話番号</TableHead>
                        <TableHead>景品</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demoWinnerData.map((winner) => (
                        <TableRow key={winner.id}>
                          <TableCell>{winner.name}</TableCell>
                          <TableCell>{winner.address}</TableCell>
                          <TableCell>{winner.phone}</TableCell>
                          <TableCell>{winner.prize}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {showWinnerListError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>エラー: 当選者数と見積もり情報の不一致</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      <p>当選者リスト: {demoWinnerData.length}名</p>
                      <p>見積もり(景品数): {prizeInfo.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0)}名</p>
                      <div className="pt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            toast({ title: "再アップロード依頼送信完了", description: "ホール担当者に再アップロード依頼メールを送信しました" })
                            setShowWinnerListError(false)
                          }}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          ホールに再アップロード依頼
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          {winnerListValidated && (
            <Alert className="border-primary bg-primary/10">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription>
                <strong>✅ 当選者リスト検証完了</strong>
                <br />
                <span className="text-sm">すべての必須項目が揃い、重複・フォーマット不備はありません</span>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            当選通知書発注処理
          </CardTitle>
          <CardDescription>
            1. 依頼するデザイン業者を選択（1社） → 2. 当選通知書発注書の生成・プレビュー → 3. 発注依頼メールを送信 → 4. デザイン業者とのやり取りの確認
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 1. 依頼するデザイン業者の選択（1社） */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">1</span>
              <Mail className="w-4 h-4" />
              依頼するデザイン業者の選択
            </h4>
            <p className="text-sm text-muted-foreground">当選通知書の発注先となるデザイン業者を1社選択してください。選択後に発注書の生成が可能になります。</p>
            {designVendors.length === 0 ? (
              <p className="text-sm text-muted-foreground">取引先マスタにデザイン業者（industry: design）が登録されていません。</p>
            ) : (
              <div className="space-y-2">
                <Label className="text-muted-foreground">デザイン業者（1社）</Label>
                <select
                  className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedVendorId}
                  disabled={notificationRequestByVendor.length > 0}
                  onChange={(e) => {
                    const id = e.target.value
                    const vendor = designVendors.find((dv) => String(dv.id) === id)
                    // ローカルステートを即座に更新
                    setSelectedVendorId(id)
                    // プロジェクトデータも更新
                    updateProject(project.id, {
                      notificationOrderDesignVendorId: id || undefined,
                      notificationOrderDesignVendorName: vendor?.name,
                    })
                  }}
                >
                  <option value="">選択してください</option>
                  {designVendors.map((dv) => (
                    <option key={dv.id} value={String(dv.id)}>{dv.name}</option>
                  ))}
                </select>
                {notificationRequestByVendor.length > 0 && (
                  <p className="text-xs text-muted-foreground">発注依頼送信済みのため、依頼先の変更はできません。</p>
                )}
              </div>
            )}
          </div>
          <div className="h-px w-full bg-border shrink-0" role="separator" />

          {/* 2. 当選通知書発注書の生成・プレビュー */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">2</span>
              <FileText className="w-4 h-4" />
              当選通知書発注書の生成・プレビュー
            </h4>
            <p className="text-sm text-muted-foreground">当選者リストを元に当選通知書発注書（デザイン業者へ送付）を生成し、プレビューで内容を確認できます。</p>
            {!selectedDesignVendorForNotification ? (
              <p className="text-sm text-muted-foreground">Step 1 でデザイン業者を選択すると、発注書の生成が可能になります。</p>
            ) : !notificationOrderGenerated ? (
              <Button
                onClick={handleGenerateNotificationOrder}
                className="gap-2 bg-gradient-to-r from-primary to-blue-600"
                disabled={!winnerListValidated}
              >
                <FileText className="w-4 h-4" />
                当選通知書発注書を生成
              </Button>
            ) : (
              <div className="space-y-3">
                <Alert className="border-primary bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    <strong>当選通知書発注書を生成しました</strong>
                    <br />
                    <span className="text-sm">依頼先: {selectedDesignVendorForNotification.name} ／ 当選者数: {demoWinnerData.length}名 ／ 出力形式: はがき印刷用・DM発送用</span>
                  </AlertDescription>
                </Alert>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setSelectedDesignVendorForPreview(selectedDesignVendorForNotification)
                    setShowNotificationDocPreview(true)
                  }}
                >
                  <Eye className="w-4 h-4" />
                  発注書をプレビュー
                </Button>
              </div>
            )}
          </div>
          <div className="h-px w-full bg-border shrink-0" role="separator" />

          {/* 3. 発注依頼のメールを送信 */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">3</span>
              <Send className="w-4 h-4" />
              発注依頼のメールを送信
            </h4>
            <div className="space-y-4">
              {notificationRequestByVendor.length > 0 && (
                <Alert className="border-primary bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    <strong>✅ 発注メール送信済み</strong>
                    <br />
                    <span className="text-sm">{notificationRequestByVendor.map((r) => r.vendorName ?? r.vendorId).join("、")} へ送信しました</span>
                  </AlertDescription>
                </Alert>
              )}
              {!selectedDesignVendorForNotification ? (
                <p className="text-sm text-muted-foreground">Step 1 でデザイン業者を選択してください。</p>
              ) : isNotificationSentToDesignVendor(String(selectedDesignVendorForNotification.id)) ? (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">送信日時</p>
                  {notificationRequestByVendor.map((r) => (
                    <div key={r.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{r.vendorName ?? r.vendorId}</span>
                      <span className="font-medium">{new Date(r.requestedAt).toLocaleString("ja")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">選択中のデザイン業者（{selectedDesignVendorForNotification.name}）へ当選通知書発注依頼メールを送信します。</p>
                  <Button
                    onClick={() => handleSendNotificationToDesignVendor(selectedDesignVendorForNotification)}
                    size="sm"
                    disabled={!notificationOrderGenerated}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {selectedDesignVendorForNotification.name} へ発注依頼メールを送信
                  </Button>
                  <p className="text-xs text-muted-foreground">※ パスワード保護されたファイルとパスワードメールが自動送信されます</p>
                </>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-border shrink-0" role="separator" />

          {/* 4. デザイン業者とのやり取りの確認 */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">4</span>
              <Eye className="w-4 h-4" />
              デザイン業者とのやり取りの確認
            </h4>
            <p className="text-sm text-muted-foreground">デザイン業者画面で依頼確認・アップロード・コメントのやり取りが行われます。送信済み依頼の状態を確認できます。</p>
            {notificationRequestByVendor.length === 0 ? (
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/20">
                <p className="text-muted-foreground mb-4">デザイン業者へ未送信</p>
                <p className="text-xs text-muted-foreground">Step 3 で発注依頼メールを送信すると、デザイン業者画面に依頼が表示され、アップロード・コメントでやり取りできます。</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notificationRequestByVendor.map((r) => (
                  <div key={r.id} className="border rounded-lg p-4 space-y-4 bg-background">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
                      <div className="min-w-0">
                        <p className="font-medium">{r.vendorName ?? r.vendorId}</p>
                        <p className="text-sm text-muted-foreground">
                          送信日時: {new Date(r.requestedAt).toLocaleString("ja")}
                        </p>
                      </div>
                      <Badge variant={r.status === "uploaded" ? "default" : "secondary"}>
                        {r.status === "uploaded" ? "アップロード済み" : "依頼受付中"}
                      </Badge>
                    </div>

                    {/* アップロードファイルプレビュー */}
                    {r.uploadedFileName && (
                      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">アップロード済み: {r.uploadedFileName}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({ title: "プレビュー", description: `${r.uploadedFileName} を表示します` })
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            プレビュー
                          </Button>
                        </div>
                        {r.uploadedAt && (
                          <p className="text-xs text-muted-foreground">アップロード日時: {new Date(r.uploadedAt).toLocaleString("ja")}</p>
                        )}
                      </div>
                    )}

                    {/* コメント履歴 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">やり取り履歴</Label>
                      <div className="max-h-48 overflow-y-auto rounded border p-3 bg-muted/10 space-y-3">
                        {r.comments.length === 0 ? (
                          <p className="text-sm text-muted-foreground">まだコメントはありません</p>
                        ) : (
                          r.comments.map((c) => (
                            <div key={c.id} className="text-sm pb-2 border-b last:border-0 last:pb-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="font-medium text-muted-foreground">
                                  {c.role === "Sales" ? "事務管理課" : "デザイン業者"}
                                  {c.authorName && `（${c.authorName}）`}
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {new Date(c.createdAt).toLocaleString("ja")}
                                </span>
                              </div>
                              <p className="text-foreground whitespace-pre-wrap">{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* コメント入力 */}
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-sm font-semibold">コメントを送信（事務管理課）</Label>
                      <Textarea
                        placeholder="デザイン業者へ返信や確認メッセージを入力"
                        value={selectedNotificationRequestIdForComment === r.id ? notificationCommentText : ""}
                        onChange={(e) => {
                          setSelectedNotificationRequestIdForComment(r.id)
                          setNotificationCommentText(e.target.value)
                        }}
                        rows={3}
                        className="resize-none"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!notificationCommentText.trim()) return
                          addDesignRequestComment(r.id, {
                            role: "Sales",
                            authorName: "事務管理課",
                            text: notificationCommentText.trim(),
                            createdAt: new Date().toISOString(),
                          })
                          setNotificationCommentText("")
                          setSelectedNotificationRequestIdForComment(null)
                          toast({ title: "コメントを送信しました" })
                        }}
                        disabled={!notificationCommentText.trim() || selectedNotificationRequestIdForComment !== r.id}
                      >
                        <Send className="w-4 h-4 mr-2" /> 送信
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            景品発注処理
          </CardTitle>
          <CardDescription>
            1. 発注書の生成・プレビュー → 2. 発注依頼のメールを作成・送信 → 3. 配送業者が入力した配送情報の参照
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 1. 発注書の生成・プレビュー */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">1</span>
              <FileText className="w-4 h-4" />
              発注書の生成・プレビュー
            </h4>
            <p className="text-sm text-muted-foreground">当選者リストを元に発注書を生成し、プレビューで内容を確認できます。</p>
            {!prizeOrderGenerated ? (
              <Button
                onClick={() => {
                  setPrizeOrderGenerated(true)
                  updateProject(project.id, { prizeOrderGeneratedAt: new Date().toISOString() })
                  toast({ title: "発注書を生成しました", description: "発注書の内容をプレビューで確認できます" })
                }}
                className="gap-2 bg-gradient-to-r from-primary to-blue-600"
                disabled={!winnerListValidated}
              >
                <FileText className="w-4 h-4" />
                発注書を生成
              </Button>
            ) : (
              <div className="space-y-3">
                <Alert className="border-primary bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    <strong>発注書を生成しました</strong>
                    <br />
                    <span className="text-sm">
                      当選者数: {demoWinnerData.length}名
                      {prizeInfo.length > 0 && ` / 景品: ${prizeInfo.map((p) => p.name).join("、")}`}
                    </span>
                  </AlertDescription>
                </Alert>
                {vendorOrders.length > 0 ? (
                  <p className="text-sm text-muted-foreground">景品業者ごとに発注書を作成しました。各業者の発注書をプレビューできます。</p>
                ) : null}
                <div className="space-y-2">
                  {vendorOrders.length > 0 ? (
                    vendorOrders.map((vo) => (
                      <div key={vo.vendorId} className="flex items-center justify-between rounded-lg border p-3 bg-background">
                        <div>
                          <span className="font-medium">{vo.vendorName}</span>
                          <span className="text-sm text-muted-foreground ml-2">（{vo.prizeItems.map((p) => p.name).join("、")}）</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 shrink-0"
                          onClick={() => {
                            setSelectedVendorForDocPreview(vo)
                            setShowPrizeOrderDocPreview(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          {vo.vendorName} の発注書をプレビュー
                        </Button>
                      </div>
                    ))
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedVendorForDocPreview(null)
                        setShowPrizeOrderDocPreview(true)
                      }}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      発注書をプレビュー
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="h-px w-full bg-border shrink-0" role="separator" />

          {/* 2. 発注依頼のメールを作成・送信 */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">2</span>
              <Send className="w-4 h-4" />
              発注依頼のメールを作成・送信
            </h4>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="space-y-2">
                  <Label>納品希望日</Label>
                  <Input type="date" value={prizeDeliveryDate} onChange={(e) => setPrizeDeliveryDate(e.target.value)} />
                </div>
              </div>
              {(project.prizeOrdersByVendor?.length ?? 0) > 0 && (
                <Alert className="border-primary bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    <strong>✅ 発注メール送信済み</strong>
                    <br />
                    <span className="text-sm">以下の業者へ送信済み: {project.prizeOrdersByVendor!.map((o) => o.vendorName).join("、")}</span>
                  </AlertDescription>
                </Alert>
              )}
              {vendorOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">景品情報に景品マスタ（景品ID）が紐づいていないため、業者ごとの送信対象がありません。商材情報で景品マスタから景品を選択した案件で表示されます。</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">景品に紐づく景品業者ごとに発注依頼メールを送信できます。</p>
                  <div className="space-y-3">
                    {vendorOrders.map((vo) => (
                      <div key={vo.vendorId} className="rounded-lg border p-4 bg-background space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{vo.vendorName}</span>
                            {isVendorOrderSent(vo.vendorId, vo.vendorName) && (
                            <span className="text-xs text-primary font-medium">送信済み</span>
                          )}
                        </div>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {vo.prizeItems.map((p, i) => (
                            <li key={i}>{p.name} × {p.quantity}名分</li>
                          ))}
                        </ul>
                        <p className="text-xs text-muted-foreground">合計: {vo.totalQuantity}名分</p>
                        <Button
                          onClick={() => handleSendPrizeOrder(vo)}
                          className="w-full sm:w-auto"
                          size="sm"
                            disabled={isVendorOrderSent(vo.vendorId, vo.vendorName)}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {vo.vendorName} へ発注依頼メールを送信
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">※ パスワード保護されたファイルとパスワードメールが自動送信されます</p>
                </>
              )}
              {(project.prizeOrdersByVendor?.length ?? 0) > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">送信日時</p>
                  {project.prizeOrdersByVendor!.map((o) => (
                    <div key={o.vendorId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{o.vendorName}</span>
                      <span className="font-medium">{new Date(o.requestedAt).toLocaleString("ja")}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">納品予定日:</span>
                    <span className="font-medium">未設定</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">経過日数:</span>
                    <span className="font-medium text-destructive">5営業日（⚠️ アラート）</span>
                  </div>
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>納品日が3営業日以上空欄です。業者に確認してください。</AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-border shrink-0" role="separator" />

          {/* 3. 景品業者が入力した配送情報の参照 */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">3</span>
              <Truck className="w-4 h-4" />
              景品業者が入力した配送情報の参照
            </h4>
            <p className="text-sm text-muted-foreground">景品業者画面で送信された配送情報を確認できます。</p>
            {(project.prizeDeliveryInfoByVendor?.length ?? 0) === 0 ? (
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/20">
                <p className="text-muted-foreground mb-4">景品業者からの配送情報入力待ち</p>
                <p className="text-xs text-muted-foreground">景品業者が案件詳細で「配送情報入力」から送信すると、ここに表示されます。</p>
              </div>
            ) : (
              <div className="space-y-4">
                {project.prizeDeliveryInfoByVendor!.map((d) => (
                  <div key={d.vendorId} className="bg-muted/50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileCheck className="w-8 h-8 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">{d.vendorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {d.deliveries && d.deliveries.length > 0
                            ? `当選者ごと ${d.deliveries.length}件（配送会社・追跡番号・発送日）`
                            : `配送会社: ${d.carrierName || "ー"} / 追跡番号: ${d.trackingNumber || "ー"} / 発送日: ${d.shippedAt ? new Date(d.shippedAt).toLocaleDateString("ja") : "ー"}`
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">入力日時: {new Date(d.deliveredAt).toLocaleString("ja")}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setShowDeliveryData(true)}>
                        <Eye className="w-4 h-4 mr-2" />
                        プレビュー
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "ダウンロード", description: "ファイルをダウンロードしました" })}>
                        ダウンロード
                      </Button>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="secondary" onClick={() => setShowDeliveryData(true)}>
                  配送状況を確認する
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {prizeOrderSent && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              クオカード書簡内容チェック
            </CardTitle>
            <CardDescription>AI自動チェック：誤字・日付相違・定型文との差分検出</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!quoCardLetterChecked ? (
              <Button onClick={handleCheckQuoCardLetter} className="w-full bg-gradient-to-r from-primary to-blue-600">
                <Sparkles className="w-4 h-4 mr-2" />
                AI書簡チェック実行
              </Button>
            ) : (
              <Alert className="border-primary bg-primary/10">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <strong>✅ 書簡内容確認完了</strong>
                  <br />
                  <span className="text-sm">誤字・日付相違・定型文との差分はありません</span>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <Dialog
        open={showPrizeOrderDocPreview}
        onOpenChange={(open) => {
          setShowPrizeOrderDocPreview(open)
          if (!open) setSelectedVendorForDocPreview(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              景品発注書プレビュー
              {selectedVendorForDocPreview ? `（${selectedVendorForDocPreview.vendorName} 宛）` : ""}
            </DialogTitle>
            <DialogDescription>
              {selectedVendorForDocPreview
                ? `${selectedVendorForDocPreview.vendorName} 向けに作成した発注書の内容です`
                : "発注データを元に作成した発注書の内容です"}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-white p-6 text-black space-y-4">
            <div className="text-center border-b-2 border-black pb-2">
              <h2 className="text-xl font-bold">発注書</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">発注日</div>
              <div>{new Date().toLocaleDateString("ja")}</div>
              <div className="text-muted-foreground">発注先</div>
              <div className="font-medium">
                {selectedVendorForDocPreview?.vendorName ?? (prizeInfo.length > 0 ? "景品業者" : "ー")}
              </div>
              <div className="text-muted-foreground">案件名</div>
              <div>{project.projectName || project.hallNames?.join("／") || "ー"}</div>
              <div className="text-muted-foreground">会場</div>
              <div>{project.hallNames?.join("、") || "ー"}</div>
              <div className="text-muted-foreground">品名</div>
              <div>
                {selectedVendorForDocPreview
                  ? selectedVendorForDocPreview.prizeItems.map((p) => p.name).join("、")
                  : prizeInfo.length > 0
                    ? prizeInfo.map((p) => p.name).join("、")
                    : "景品（未設定）"}
              </div>
              <div className="text-muted-foreground">数量</div>
              <div>
                {selectedVendorForDocPreview
                  ? `${selectedVendorForDocPreview.totalQuantity}名分`
                  : prizeInfo.length > 0
                    ? `${prizeInfo.reduce((sum, p) => sum + (parseInt(p.quantity, 10) || 0), 0)}名分`
                    : "ー"}
              </div>
              <div className="text-muted-foreground">納期</div>
              <div>要相談</div>
            </div>
            <p className="text-xs text-muted-foreground pt-2">上記のとおり発注いたします。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowPrizeOrderDocPreview(false); setSelectedVendorForDocPreview(null) }}>閉じる</Button>
            <Button variant="outline" onClick={() => toast({ title: "ダウンロード", description: "発注書をPDFでダウンロードしました" })}>
              PDFでダウンロード
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNotificationOrderModal} onOpenChange={setShowNotificationOrderModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>当選通知書発注書の生成</DialogTitle>
            <DialogDescription>当選者リストから当選通知書発注データ（デザイン業者へ送付する発注書）を自動生成します</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">当選者数:</span>
                <span className="font-medium">{demoWinnerData.length}名</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">出力形式:</span>
                <span className="font-medium">はがき印刷用・DM発送用</span>
              </div>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>当選通知書発注書を生成すると、デザイン業者へ発注依頼メールを送信できるようになります。</AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationOrderModal(false)}>キャンセル</Button>
            <Button onClick={confirmNotificationOrderGeneration} className="bg-gradient-to-r from-primary to-blue-600">
              <Mail className="w-4 h-4 mr-2" />
              生成を実行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showNotificationDocPreview}
        onOpenChange={(open) => {
          setShowNotificationDocPreview(open)
          if (!open) setSelectedDesignVendorForPreview(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              当選通知書発注書プレビュー
              {selectedDesignVendorForPreview ? `（${selectedDesignVendorForPreview.name} 宛）` : ""}
            </DialogTitle>
            <DialogDescription>
              {selectedDesignVendorForPreview
                ? `${selectedDesignVendorForPreview.name} 向けに作成した当選通知書発注書の内容です`
                : "当選者リストを元に作成した当選通知書発注書の内容です"}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-white p-6 text-black space-y-4">
            <div className="text-center border-b-2 border-black pb-2">
              <h2 className="text-xl font-bold">当選通知発注書</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">発注日</div>
              <div>{new Date().toLocaleDateString("ja")}</div>
              <div className="text-muted-foreground">発注先</div>
              <div className="font-medium">{selectedDesignVendorForPreview?.name ?? "デザイン業者"}</div>
              <div className="text-muted-foreground">案件名</div>
              <div>{project.projectName || project.hallNames?.join("／") || "ー"}</div>
              <div className="text-muted-foreground">会場</div>
              <div>{project.hallNames?.join("、") || "ー"}</div>
              <div className="text-muted-foreground">当選者数</div>
              <div>{demoWinnerData.length}名</div>
              <div className="text-muted-foreground">出力形式</div>
              <div>はがき印刷用・DM発送用</div>
              <div className="text-muted-foreground">項目</div>
              <div>氏名、住所、景品名、当選案内文</div>
            </div>
            <p className="text-xs text-muted-foreground pt-2">上記のとおり当選者通知の発注をお願いいたします。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNotificationDocPreview(false); setSelectedDesignVendorForPreview(null) }}>閉じる</Button>
            <Button variant="outline" onClick={() => toast({ title: "ダウンロード", description: "発注書をPDFでダウンロードしました" })}>
              PDFでダウンロード
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showSendNotificationToDesignModal}
        onOpenChange={(open) => {
          setShowSendNotificationToDesignModal(open)
          if (!open) setSelectedDesignVendorForSend(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>当選通知書発注メール送信</DialogTitle>
            <DialogDescription>
              {selectedDesignVendorForSend ? `${selectedDesignVendorForSend.name} へ当選通知書をメール送信します。デザイン業者画面で依頼確認・アップロードが可能になります。` : "デザイン業者へ当選通知書をメール送信します"}
            </DialogDescription>
          </DialogHeader>
          {selectedDesignVendorForSend && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">送信先:</span>
                  <span className="font-medium">{selectedDesignVendorForSend.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">添付ファイル:</span>
                  <span className="font-medium">winner_notification_20241225.xlsx (パスワード保護)</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowSendNotificationToDesignModal(false); setSelectedDesignVendorForSend(null) }}>キャンセル</Button>
            <Button onClick={confirmSendNotificationToDesignVendor} disabled={!selectedDesignVendorForSend}>
              <Send className="w-4 h-4 mr-2" />
              メール送信を実行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 当選通知書：デザイン業者とのコメントやり取り */}
      <Dialog
        open={!!selectedNotificationRequestIdForComment}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNotificationRequestIdForComment(null)
            setNotificationCommentText("")
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              デザイン業者とのコメントやり取り
            </DialogTitle>
            <DialogDescription>
              当選通知書作成依頼について、デザイン業者とコメントでやり取りできます。
            </DialogDescription>
          </DialogHeader>
          {selectedNotificationRequestIdForComment && (() => {
            const pr = getDesignRequestById(selectedNotificationRequestIdForComment)
            if (!pr) return <p className="text-muted-foreground">依頼情報を取得できません</p>
            return (
              <div className="space-y-4 flex-1 min-h-0 flex flex-col">
                <div className="rounded-lg border p-3 bg-muted/30 text-sm shrink-0">
                  <p className="font-medium">{pr.vendorName ?? pr.vendorId}</p>
                  <p className="text-muted-foreground">
                    {pr.companyName} ／ {Array.isArray(pr.hallNames) ? pr.hallNames.join("、") : ""} ・ 送信: {new Date(pr.requestedAt).toLocaleString("ja")}
                    {pr.uploadedFileName && ` ／ アップロード: ${pr.uploadedFileName}`}
                  </p>
                </div>
                <div className="space-y-2 flex-1 min-h-0 flex flex-col">
                  <Label>やり取り履歴</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto rounded border p-3 bg-muted/20 flex-1 min-h-0">
                    {pr.comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">まだコメントはありません</p>
                    ) : (
                      pr.comments.map((c) => (
                        <div key={c.id} className="text-sm">
                          <span className="font-medium text-muted-foreground">
                            {c.role === "Sales" ? "事務管理課" : "デザイン業者"}
                            {c.authorName && `（${c.authorName}）`}:
                          </span>{" "}
                          {c.text}
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {new Date(c.createdAt).toLocaleString("ja")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-2 shrink-0 border-t pt-4">
                  <Label>コメントを送信（事務管理課）</Label>
                  <Textarea
                    placeholder="デザイン業者へ返信や確認メッセージを入力"
                    value={notificationCommentText}
                    onChange={(e) => setNotificationCommentText(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!notificationCommentText.trim()) return
                      addDesignRequestComment(pr.id, {
                        role: "Sales",
                        authorName: "事務管理課",
                        text: notificationCommentText.trim(),
                        createdAt: new Date().toISOString(),
                      })
                      setNotificationCommentText("")
                      toast({ title: "コメントを送信しました" })
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" /> 送信
                  </Button>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showSendOrderModal}
        onOpenChange={(open) => {
          setShowSendOrderModal(open)
          if (!open) setSelectedVendorForOrder(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>景品発注メール送信</DialogTitle>
            <DialogDescription>
              {selectedVendorForOrder ? `${selectedVendorForOrder.vendorName} へ発注書をPDF形式で送信します` : "発注書をPDF形式で業者へ送信します"}
            </DialogDescription>
          </DialogHeader>
          {selectedVendorForOrder && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">送信先業者:</span>
                  <span className="font-medium">{selectedVendorForOrder.vendorName}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">対象景品:</span>
                  <ul className="list-disc list-inside mt-1">
                    {selectedVendorForOrder.prizeItems.map((p, i) => (
                      <li key={i}>{p.name} × {p.quantity}名分</li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">添付ファイル:</span>
                  <span className="font-medium">発注データ (パスワード保護)</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowSendOrderModal(false); setSelectedVendorForOrder(null) }}>キャンセル</Button>
            <Button onClick={confirmSendPrizeOrder} disabled={!selectedVendorForOrder}>
              <Send className="w-4 h-4 mr-2" />
              メール送信を実行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLetterCheckModal} onOpenChange={setShowLetterCheckModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>クオカード書簡内容チェック</DialogTitle>
            <DialogDescription>AI自動チェック: 誤字・日付相違・定型文との差分を検出</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-semibold text-sm">書簡内容（サンプル）</h4>
              <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded">
                <p>この度は、オメガホール大抽選会にご参加いただき、誠にありがとうございます。</p>
                <p className="mt-2">厳正なる抽選の結果、あなた様が当選されました。</p>
                <p className="mt-2">心よりお慶び申し上げます。</p>
                <p className="mt-2 text-right">2024年12月25日</p>
              </div>
            </div>
            <div className="rounded-lg border border-primary p-4 space-y-2 bg-primary/5">
              <h4 className="font-semibold text-sm text-primary">AI検証結果</h4>
              <div className="text-sm space-y-1">
                <p className="text-primary">✓ 誤字脱字: 検出なし</p>
                <p className="text-primary">✓ 日付相違: 問題なし</p>
                <p className="text-primary">✓ 定型文との差分: 許容範囲内</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLetterCheckModal(false)}>修正依頼</Button>
            <Button onClick={confirmLetterCheck}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              承認する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeliveryData} onOpenChange={setShowDeliveryData}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>配送情報プレビュー</DialogTitle>
            <DialogDescription>
              {project.prizeDeliveryInfoByVendor && project.prizeDeliveryInfoByVendor.length > 0
                ? "依頼した当選者リストの順で、景品業者から入力された配送情報を表示します"
                : "景品業者が入力した配送情報を表示します"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-auto">
            {project.prizeDeliveryInfoByVendor && project.prizeDeliveryInfoByVendor.length > 0 ? (
              <div className="space-y-6">
                {project.prizeDeliveryInfoByVendor.map((d) => {
                  const winnerList = project.winnerList ?? []
                  const deliveryByWinnerId = new Map(
                    (d.deliveries ?? []).map((row) => [row.winnerId, row])
                  )
                  const rows =
                    winnerList.length > 0
                      ? winnerList.map((w, idx) => ({
                          key: w.id,
                          no: idx + 1,
                          winnerName: w.name,
                          prize: w.prize ?? "ー",
                          delivery: deliveryByWinnerId.get(w.id),
                        }))
                      : (d.deliveries ?? []).map((row, i) => ({
                          key: row.winnerId ?? `del-${i}`,
                          no: i + 1,
                          winnerName: row.winnerName ?? "ー",
                          prize: "ー",
                          delivery: row,
                        }))
                  return (
                    <div key={d.vendorId} className="rounded-lg border bg-muted/20 p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        {d.vendorName}
                      </h3>
                      {rows.length > 0 ? (
                        <div className="border rounded-md overflow-hidden">
                          <div className="h-[440px] overflow-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-12">No.</TableHead>
                                  <TableHead>当選者名</TableHead>
                                  <TableHead>景品</TableHead>
                                  <TableHead>配送会社名</TableHead>
                                  <TableHead>追跡番号</TableHead>
                                  <TableHead>発送日</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {rows.map((row) => (
                                  <TableRow key={row.key}>
                                    <TableCell className="text-muted-foreground">{row.no}</TableCell>
                                    <TableCell className="font-medium">{row.winnerName}</TableCell>
                                    <TableCell className="text-muted-foreground">{row.prize}</TableCell>
                                    <TableCell>{row.delivery?.carrierName ?? "ー"}</TableCell>
                                    <TableCell className="font-mono text-sm">{row.delivery?.trackingNumber ?? "ー"}</TableCell>
                                    <TableCell>{row.delivery?.shippedAt ? new Date(row.delivery.shippedAt).toLocaleDateString("ja") : "ー"}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">配送会社名</span>
                            <p className="font-medium">{d.carrierName || "ー"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">追跡番号</span>
                            <p className="font-medium font-mono">{d.trackingNumber || "ー"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">発送日</span>
                            <p className="font-medium">{d.shippedAt ? new Date(d.shippedAt).toLocaleDateString("ja") : "ー"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">入力日時</span>
                            <p className="font-medium">{new Date(d.deliveredAt).toLocaleString("ja")}</p>
                          </div>
                        </div>
                      )}
                      {rows.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">入力日時: {new Date(d.deliveredAt).toLocaleString("ja")}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-gray-100 p-4 rounded-md border min-h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">景品業者から配送情報はまだ入力されていません。</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => toast({ title: "印刷", description: "プリンターに送信しました" })}>印刷</Button>
            <Button onClick={() => setShowDeliveryData(false)}>閉じる</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
