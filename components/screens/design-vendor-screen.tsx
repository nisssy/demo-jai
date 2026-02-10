"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  MapPin,
  Building,
  Upload,
  FileText,
  ImageIcon,
  Mail,
  CheckCircle2,
  Send,
  DollarSign,
  Eye,
  ArrowLeft,
  Users,
  ListOrdered,
  Bell,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useProject } from "@/contexts/project-context"
import type { Project } from "@/types"

type RequestType = "poster" | "dm" | "winner-list"

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  poster: "ポスター作成依頼",
  dm: "DM作成依頼",
  "winner-list": "当選通知書作成依頼",
}


export function DesignVendorScreen() {
  const { toast } = useToast()
  const {
    projects,
    designRequests,
    getDesignRequestById,
    updateDesignRequest,
    addPosterRequestComment,
    refreshFromStorage,
  } = useProject()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // 画面表示時にストレージから再取得（事務管理課で発注した依頼を確実に表示）
  useEffect(() => {
    refreshFromStorage()
  }, [refreshFromStorage])
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | null>(null)
  /** 営業・事務管理課からのデザイン依頼（ポスター/DM/当選通知書）通知を開いたときの依頼ID */
  const [selectedDesignRequestId, setSelectedDesignRequestId] = useState<string | null>(null)
  const [designRequestCommentText, setDesignRequestCommentText] = useState("")
  const posterRequestFileInputRef = useRef<HTMLInputElement>(null)
  const posterFileInputRef = useRef<HTMLInputElement>(null)
  const dmFileInputRef = useRef<HTMLInputElement>(null)
  const winnerListFileInputRef = useRef<HTMLInputElement>(null)
  const [posterUploaded, setPosterUploaded] = useState(false)
  const [dmUploaded, setDmUploaded] = useState(false)
  const [winnerListUploaded, setWinnerListUploaded] = useState(false)

  const handlePosterFileClick = () => posterFileInputRef.current?.click()
  const handleDmFileClick = () => dmFileInputRef.current?.click()
  const handleWinnerListFileClick = () => winnerListFileInputRef.current?.click()

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "poster" | "dm" | "winner-list"
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      if (type === "poster") setPosterUploaded(true)
      else if (type === "dm") setDmUploaded(true)
      else setWinnerListUploaded(true)
      const label = type === "poster" ? "ポスター" : type === "dm" ? "DM" : "当選通知書"
      toast({ title: "ファイル選択", description: `${label}のファイル「${file.name}」を選択しました` })
    }
  }

  const handlePosterSubmit = () => toast({ title: "送信完了", description: "ポスターデザインを送信しました" })
  const handleDmSubmit = () => toast({ title: "送信完了", description: "DMデザインを送信しました" })
  const handleWinnerListSubmit = () =>
    toast({ title: "送信完了", description: "当選通知書を送信しました" })

  const openDetail = (project: Project, type: RequestType) => {
    setSelectedProject(project)
    setSelectedRequestType(type)
  }

  const backToList = () => {
    setSelectedProject(null)
    setSelectedRequestType(null)
  }

  const backToNotificationList = () => {
    setSelectedDesignRequestId(null)
    setDesignRequestCommentText("")
  }

  const DESIGN_REQUEST_TYPE_LABELS: Record<"poster" | "dm" | "winner-list", string> = {
    poster: "ポスター作成依頼",
    dm: "DM作成依頼",
    "winner-list": "当選通知書作成依頼",
  }
  const DESIGN_REQUEST_UPLOAD_LABELS: Record<"poster" | "dm" | "winner-list", string> = {
    poster: "ポスターをアップロード",
    dm: "DMをアップロード",
    "winner-list": "当選通知書をアップロード",
  }

  // 営業からのデザイン依頼通知の詳細（アップロード・コメント）
  if (selectedDesignRequestId) {
    const pr = getDesignRequestById(selectedDesignRequestId)
    if (!pr) {
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-8 max-w-5xl mx-auto">
              <Button variant="ghost" onClick={backToNotificationList} className="gap-2 pl-0">
                <ArrowLeft className="w-4 h-4" /> 通知一覧に戻る
              </Button>
              <p className="text-muted-foreground mt-4">依頼が見つかりません</p>
            </div>
          </ScrollArea>
        </div>
      )
    }
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="h-full">
          <div className="container mx-auto py-6 max-w-4xl px-4">
            <Button variant="ghost" onClick={backToNotificationList} className="gap-2 pl-0 mb-4">
              <ArrowLeft className="w-4 h-4" /> 通知一覧に戻る
            </Button>
            <div className="mb-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary" />
                {DESIGN_REQUEST_TYPE_LABELS[pr.requestType]}
                {pr.requestedByName ? `（${pr.requestedByName}から）` : "（営業・事務管理課から）"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {pr.companyName} / {pr.hallNames.join(", ")} ・ {new Date(pr.requestedAt).toLocaleString("ja")}
              </p>
            </div>
            <Separator className="my-6" />
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">依頼内容</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div><Label className="text-muted-foreground">依頼元</Label><div className="font-medium mt-1">{pr.requestedByName ?? "営業"}</div></div>
                <div><Label className="text-muted-foreground">発注先</Label><div className="font-medium mt-1">{pr.vendorName ?? "-"}</div></div>
                <div><Label className="text-muted-foreground">案件</Label><div className="font-medium mt-1">{pr.companyName}</div></div>
                <div><Label className="text-muted-foreground">会場</Label><div className="font-medium mt-1">{pr.hallNames.join(", ")}</div></div>
                {pr.eventStartDate && <div><Label className="text-muted-foreground">開催日</Label><div className="font-medium mt-1">{pr.eventStartDate} 〜 {pr.eventEndDate}</div></div>}
              </CardContent>
            </Card>
            {pr.status === "requested" && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">{DESIGN_REQUEST_UPLOAD_LABELS[pr.requestType]}</CardTitle>
                  <CardDescription>アップロードすると営業側で確認できます</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => posterRequestFileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={posterRequestFileInputRef}
                      className="hidden"
                      accept={pr.requestType === "winner-list" ? ".csv,.xlsx,.xls" : "image/*,.pdf,.ai"}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          updateDesignRequest(pr.id, {
                            status: "uploaded",
                            uploadedFileName: file.name,
                            uploadedAt: new Date().toISOString(),
                          })
                          toast({ title: "アップロード完了", description: `「${file.name}」をアップロードしました。営業側で確認できます。` })
                        }
                      }}
                    />
                    <Upload className="w-10 h-10 text-primary mb-4" />
                    <p className="font-medium mb-1">クリックしてファイルを選択</p>
                    <p className="text-sm text-muted-foreground">
                      {pr.requestType === "winner-list" ? "CSV・Excel形式（.csv, .xlsx, .xls）" : "画像・PDF・AI形式"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {pr.status === "uploaded" && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    アップロード済み: {pr.uploadedFileName}
                    {pr.uploadedAt && <span className="text-muted-foreground">（{new Date(pr.uploadedAt).toLocaleString("ja")}）</span>}
                  </p>
                </CardContent>
              </Card>
            )}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">コメント</CardTitle>
                <CardDescription>依頼元（営業・事務管理課）とやり取りできます</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-h-48 overflow-y-auto rounded border p-3 bg-muted/30">
                  {pr.comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">まだコメントはありません</p>
                  ) : (
                    pr.comments.map((c) => (
                      <div key={c.id} className="text-sm">
                        <span className="font-medium text-muted-foreground">
                          {c.role === "SalesInsight" ? "営業・事務管理課" : "デザイン業者"}
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
                <div className="space-y-2">
                  <Label>コメントを追加（デザイン業者）</Label>
                  <Textarea
                    placeholder="返信や確認メッセージを入力"
                    value={designRequestCommentText}
                    onChange={(e) => setDesignRequestCommentText(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!designRequestCommentText.trim()) return
                      addPosterRequestComment(pr.id, {
                        role: "DesignVendor",
                        authorName: "デザイン業者",
                        text: designRequestCommentText.trim(),
                      })
                      setDesignRequestCommentText("")
                      toast({ title: "コメントを送信しました" })
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" /> 送信
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    )
  }

  // 一覧表示（タブで3つの依頼種別を切り替え）。各タブには営業・事務管理課から依頼があったものだけ表示
  if (!selectedProject || !selectedRequestType) {
    const posterRequests = designRequests.filter((r) => r.requestType === "poster")
    const dmRequests = designRequests.filter((r) => r.requestType === "dm")
    const winnerListRequests = designRequests.filter((r) => r.requestType === "winner-list")

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">デザイン業者 依頼一覧</h2>
              <p className="text-muted-foreground text-sm">営業・事務管理課から依頼のあったものだけ表示しています。詳細からアップロード・コメントでやり取りできます</p>
            </div>

            <Tabs defaultValue="poster" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 h-auto min-h-9 p-1 gap-1">
                <TabsTrigger value="poster" className="gap-1.5 px-3 py-2 min-w-0 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">ポスター</span>
                  <Badge variant={posterRequests.length > 0 ? "default" : "secondary"} className="h-5 min-w-5 px-1 shrink-0 text-xs">
                    {posterRequests.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="dm" className="gap-1.5 px-3 py-2 min-w-0 flex items-center justify-center">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">DM</span>
                  <Badge variant={dmRequests.length > 0 ? "default" : "secondary"} className="h-5 min-w-5 px-1 shrink-0 text-xs">
                    {dmRequests.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="winner-list" className="gap-1.5 px-3 py-2 min-w-0 flex items-center justify-center">
                  <ListOrdered className="w-4 h-4 shrink-0" />
                  <span className="truncate">当選通知書</span>
                  <Badge variant={winnerListRequests.length > 0 ? "default" : "secondary"} className="h-5 min-w-5 px-1 shrink-0 text-xs">
                    {winnerListRequests.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="poster" className="mt-0 space-y-6">
                {posterRequests.length > 0 ? (
                  <Card className="border-primary/50 bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Bell className="w-5 h-5 text-primary" />
                        ポスター作成依頼の通知（営業・事務管理課から）
                      </CardTitle>
                      <CardDescription>営業から発注されたポスター依頼です。詳細からアップロード・コメントできます</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="divide-y divide-border">
                        {posterRequests.map((r) => (
                          <li key={r.id} className="py-4 first:pt-0 last:pb-0">
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="font-medium">{r.companyName}</div>
                                <div className="text-sm text-muted-foreground mt-0.5">
                                  {r.hallNames.join(" / ")} ・ {new Date(r.requestedAt).toLocaleString("ja")}
                                  {r.requestedByName && <span className="ml-1">（依頼元: {r.requestedByName}）</span>}
                                </div>
                                {r.uploadedFileName && (
                                  <div className="text-xs text-green-600 mt-1">アップロード済み: {r.uploadedFileName}</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge variant={r.status === "uploaded" ? "default" : "secondary"}>
                                  {r.status === "uploaded" ? "アップロード済み" : "依頼受付中"}
                                </Badge>
                                <Button variant="outline" size="sm" onClick={() => setSelectedDesignRequestId(r.id)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  詳細・アップロード
                                </Button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">ポスター作成依頼はまだありません</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="dm" className="mt-0 space-y-6">
                {dmRequests.length > 0 ? (
                  <Card className="border-primary/50 bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Bell className="w-5 h-5 text-primary" />
                        DM作成依頼の通知（営業・事務管理課から）
                      </CardTitle>
                      <CardDescription>営業から発注されたDM依頼です。詳細からアップロード・コメントできます</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="divide-y divide-border">
                        {dmRequests.map((r) => (
                          <li key={r.id} className="py-4 first:pt-0 last:pb-0">
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="font-medium">{r.companyName}</div>
                                <div className="text-sm text-muted-foreground mt-0.5">
                                  {r.hallNames.join(" / ")} ・ {new Date(r.requestedAt).toLocaleString("ja")}
                                  {r.requestedByName && <span className="ml-1">（依頼元: {r.requestedByName}）</span>}
                                </div>
                                {r.uploadedFileName && (
                                  <div className="text-xs text-green-600 mt-1">アップロード済み: {r.uploadedFileName}</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge variant={r.status === "uploaded" ? "default" : "secondary"}>
                                  {r.status === "uploaded" ? "アップロード済み" : "依頼受付中"}
                                </Badge>
                                <Button variant="outline" size="sm" onClick={() => setSelectedDesignRequestId(r.id)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  詳細・アップロード
                                </Button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">DM作成依頼はまだありません</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="winner-list" className="mt-0 space-y-6">
                {winnerListRequests.length > 0 ? (
                  <Card className="border-primary/50 bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Bell className="w-5 h-5 text-primary" />
                        当選通知書作成依頼の通知（営業・事務管理課から）
                      </CardTitle>
                      <CardDescription>営業または事務管理課から発注された当選通知書作成依頼です。詳細から依頼内容の確認・アップロード・コメントのやり取りができます</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="divide-y divide-border">
                        {winnerListRequests.map((r) => (
                          <li key={r.id} className="py-4 first:pt-0 last:pb-0">
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="font-medium">{r.companyName}</div>
                                <div className="text-sm text-muted-foreground mt-0.5">
                                  {r.hallNames.join(" / ")} ・ {new Date(r.requestedAt).toLocaleString("ja")}
                                  {r.requestedByName && <span className="ml-1">（依頼元: {r.requestedByName}）</span>}
                                </div>
                                {r.uploadedFileName && (
                                  <div className="text-xs text-green-600 mt-1">アップロード済み: {r.uploadedFileName}</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge variant={r.status === "uploaded" ? "default" : "secondary"}>
                                  {r.status === "uploaded" ? "アップロード済み" : "依頼受付中"}
                                </Badge>
                                <Button variant="outline" size="sm" onClick={() => setSelectedDesignRequestId(r.id)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  詳細・アップロード
                                </Button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">当選通知書作成依頼はまだありません</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    )
  }

  // 詳細表示（選択した依頼種別のアップロード画面のみ）
  const typeLabel = REQUEST_TYPE_LABELS[selectedRequestType]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScrollArea className="h-full">
        <div className="container mx-auto py-6 max-w-4xl px-4">
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={backToList}
              className="gap-2 pl-0 hover:bg-transparent hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              依頼一覧に戻る
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              {selectedProject.companyName}
              <Badge variant="outline" className="ml-2 font-normal">{selectedProject.id}</Badge>
              <Badge variant="secondary" className="font-normal">{typeLabel}</Badge>
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Building className="w-4 h-4 mr-1" /> {selectedProject.hallNames.join(" / ")}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" /> {selectedProject.area}
              </span>
            </div>
          </div>
          <Separator className="my-6" />
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                案件情報
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">イベント名</Label>
                <div className="font-medium mt-1">{selectedProject.companyName} 抽選会イベント</div>
              </div>
              <div>
                <Label className="text-muted-foreground">開催日</Label>
                <div className="font-medium mt-1">
                  {selectedProject.eventStartDate} 〜 {selectedProject.eventEndDate}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">会場</Label>
                <div className="font-medium mt-1">{selectedProject.hallNames.join(", ")}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">ターゲット</Label>
                <div className="font-medium mt-1">{selectedProject.target || "未定"}</div>
              </div>
            </CardContent>
          </Card>

          {/* ポスター作成依頼のアップロード */}
          {selectedRequestType === "poster" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  ポスター領域
                </CardTitle>
                <CardDescription>ポスターデザインのアップロードとスケジュール管理</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border border-border rounded-lg p-6 bg-card">
                  <h3 className="font-semibold mb-4">デザインイメージ（発注元提供）</h3>
                  <div className="aspect-[3/4] flex items-center justify-center bg-muted rounded-lg">
                    <div className="text-center p-6">
                      <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm font-medium">poster_sample_v1.jpg</p>
                    </div>
                  </div>
                </div>
                <div
                  className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={handlePosterFileClick}
                >
                  <input
                    type="file"
                    ref={posterFileInputRef}
                    className="hidden"
                    accept="image/*,.pdf,.ai"
                    onChange={(e) => handleFileChange(e, "poster")}
                  />
                  {!posterUploaded ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">デザインイメージをアップロード</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        ドラッグ＆ドロップ、またはクリックしてファイルを選択
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePosterFileClick()
                        }}
                      >
                        ファイルを選択
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-1">アップロード完了</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePosterFileClick()
                        }}
                      >
                        ファイルを変更
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="w-full sm:w-auto" onClick={handlePosterSubmit}>
                    <Send className="w-4 h-4 mr-2" />
                    送信する
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* DM作成依頼のアップロード */}
          {selectedRequestType === "dm" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  DM領域
                </CardTitle>
                <CardDescription>DMデザインのアップロードとスケジュール管理</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={handleDmFileClick}
                >
                  <input
                    type="file"
                    ref={dmFileInputRef}
                    className="hidden"
                    accept="image/*,.pdf,.ai"
                    onChange={(e) => handleFileChange(e, "dm")}
                  />
                  {!dmUploaded ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">デザインイメージをアップロード</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDmFileClick()
                        }}
                      >
                        ファイルを選択
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-1">アップロード完了</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDmFileClick()
                        }}
                      >
                        ファイルを変更
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="w-full sm:w-auto" onClick={handleDmSubmit}>
                    <Send className="w-4 h-4 mr-2" />
                    送信する
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 当選通知書作成依頼のアップロード */}
          {selectedRequestType === "winner-list" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListOrdered className="w-5 h-5" />
                  当選通知書領域
                </CardTitle>
                <CardDescription>当選通知書のアップロードとスケジュール管理</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border border-border rounded-lg p-6 bg-card">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    当選通知書仕様
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    氏名・住所・景品名・電話番号を含むCSVまたはExcel形式でご提出ください。
                  </p>
                </div>
                <div
                  className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={handleWinnerListFileClick}
                >
                  <input
                    type="file"
                    ref={winnerListFileInputRef}
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFileChange(e, "winner-list")}
                  />
                  {!winnerListUploaded ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">当選通知書をアップロード</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        ドラッグ＆ドロップ、またはクリックしてファイルを選択（CSV / Excel）
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWinnerListFileClick()
                        }}
                      >
                        ファイルを選択
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-1">アップロード完了</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWinnerListFileClick()
                        }}
                      >
                        ファイルを変更
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="w-full sm:w-auto" onClick={handleWinnerListSubmit}>
                    <Send className="w-4 h-4 mr-2" />
                    送信する
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
