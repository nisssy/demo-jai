"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Send,
  Calendar,
  MapPin,
  User,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Truck,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  FileSpreadsheet,
  Upload,
  FileCheck,
  FolderOpen,
  Search,
  Database,
  ArrowRight,
  Download,
} from "lucide-react"
import type { ProjectData } from "@/app/page"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Role } from "@/types/role" // Added import for Role type

type Screen3Props = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onNext: () => void
  onBack: () => void
  addNotification: (message: string) => void
  role: Role
  setCurrentScreen: (screen: number) => void // Added setCurrentScreen prop
}

type ProjectItem = {
  id: string
  projectName: string
  clientName: string
  talent: string
  date: string
  venue: string
  status: "proposed" | "ordered"
  estimateAmount: string
}

const mockProjects: ProjectItem[] = [
  {
    id: "1",
    projectName: "新台入替キャンペーン",
    clientName: "マルハン渋谷店",
    talent: "田中 太郎",
    date: "2025/12/10",
    venue: "パチンコ店舗フロア",
    status: "proposed",
    estimateAmount: "¥600,000",
  },
  {
    id: "2",
    projectName: "グランドオープン記念",
    clientName: "ダイナム新宿店",
    talent: "佐藤 花子",
    date: "2026/01/15",
    venue: "パチンコ店舗エントランス",
    status: "proposed",
    estimateAmount: "¥450,000",
  },
  {
    id: "3",
    projectName: "周年イベント",
    clientName: "ガイア池袋店",
    talent: "鈴木 一郎",
    date: "2026/02/20",
    venue: "パチンコ店舗2F特設会場",
    status: "proposed",
    estimateAmount: "¥380,000",
  },
]

type ValidationResult = {
  isValid: boolean
  errors: string[]
}

export function Screen3({
  projectData,
  setProjectData,
  onNext,
  onBack,
  addNotification,
  role,
  setCurrentScreen,
}: Screen3Props) {
  const projects = projectData.projects || []
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false)
  const [validationProject, setValidationProject] = useState<ProjectItem | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [correctionMessage, setCorrectionMessage] = useState("")
  const [correctionFormData, setCorrectionFormData] = useState({
    contractAmount: "",
    billingAddress: "",
  })
  const [formData, setFormData] = useState({
    contractAmount: "",
    billingAddress: "",
    notes: "",
  })
  const [isLoadingNotify, setIsLoadingNotify] = useState(false)
  const [isLoadingConfirmOrder, setIsLoadingConfirmOrder] = useState(false)

  const [isPRModalOpen, setIsPRModalOpen] = useState(false)
  const [isCostModalOpen, setIsCostModalOpen] = useState(false)
  const [selectedModalProject, setSelectedModalProject] = useState<(typeof projects)[0] | null>(null)

  const [prGenerated, setPrGenerated] = useState(false)
  const [prText, setPrText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const [costsAutoFilled, setCostsAutoFilled] = useState(false)
  const [costs, setCosts] = useState([
    { item: "コンパニオン出演料", amount: "" },
    { item: "交通費", amount: "" },
    { item: "宿泊費", amount: "" },
    { item: "PR広告費", amount: "" },
  ])

  const [showDataCollectionModal, setShowDataCollectionModal] = useState(false)
  const [showDataExportModal, setShowDataExportModal] = useState(false)
  const [expenseData, setExpenseData] = useState({ submitted: 7, total: 10 })
  const [surveyData, setSurveyData] = useState({ submitted: 42, total: 50 })
  const [reminderSent, setReminderSent] = useState(false)
  const [dataSynced, setDataSynced] = useState(false)
  const [archiveComplete, setArchiveComplete] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [reportUrl, setReportUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [publicationChecked, setPublicationChecked] = useState(false)
  const [isMappingData, setIsMappingData] = useState(false)
  const [dataMapped, setDataMapped] = useState(false)

  const handleStatusToggle = (project: ProjectItem, checked: boolean) => {
    if (checked) {
      setSelectedProject(project)
      setFormData({
        contractAmount: project.estimateAmount.replace("¥", "").replace(",", ""),
        billingAddress: "",
        notes: "",
      })
      setIsModalOpen(true)
    } else {
      setProjectData({
        ...projectData,
        projects: projects.map((p) => (p.id === project.id ? { ...p, status: "proposed" as const } : p)),
      })
    }
  }

  const handleConfirmOrder = () => {
    if (!selectedProject) return

    setIsLoadingConfirmOrder(true)

    setTimeout(() => {
      setProjectData({
        ...projectData,
        projectName: selectedProject.projectName,
        clientName: selectedProject.clientName,
        talent: selectedProject.talent,
        date: selectedProject.date,
        contractAmount: formData.contractAmount,
        billingAddress: formData.billingAddress,
        status: "ordered",
        projects: projects.map((p) => (p.id === selectedProject.id ? { ...p, status: "ordered" as const } : p)),
      })

      addNotification(`案件「${selectedProject.projectName}」を受注確定しました`)
      setIsModalOpen(false)
      setIsLoadingConfirmOrder(false)
    }, 500)
  }

  const handleValidateProject = (project: ProjectItem) => {
    setValidationProject(project)
    setIsValidationModalOpen(true)
    setIsValidating(true)
    setValidationResult(null)
    setCorrectionMessage("")

    setTimeout(() => {
      const errors: string[] = []

      if (!project.estimateAmount || project.estimateAmount === "") {
        errors.push("見積金額が未入力です")
      }

      if (project.venue === "東京ドーム") {
        errors.push("開催日が会場の定休日と重複しています")
      }

      errors.push("タレントのスケジュールが重複している可能性があります")

      setValidationResult({
        isValid: errors.length === 0,
        errors: errors,
      })
      setIsValidating(false)
    }, 2000)
  }

  const runValidation = (project: ProjectItem): ValidationResult => {
    const errors: string[] = []

    if (!project.projectName || project.projectName.trim().length < 3) {
      errors.push("案件名が短すぎます（最低3文字必要）")
    }

    if (project.venue === "パチンコ店舗フロア") {
      if (!project.date) {
        errors.push("開催日が未設定です")
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    }
  }

  const handleGenerateCorrection = () => {
    if (!validationResult) return

    const message = `お疲れ様です。以下の項目について修正をお願いします。

${validationResult.errors.map((error, idx) => `${idx + 1}. ${error}`).join("\n")}

ご確認のほど、よろしくお願いいたします。

Co・Dir担当`

    setCorrectionMessage(message)
  }

  const handleSubmitCorrection = () => {
    if (!validationProject) return

    setIsValidating(true)
    setValidationResult(null)

    setTimeout(() => {
      setValidationResult({
        isValid: true,
        errors: [],
      })
      setIsValidating(false)
    }, 1500)
  }

  const handleNotifyInternal = () => {
    if (!validationProject) return

    setIsLoadingNotify(true)
    setTimeout(() => {
      setIsLoadingNotify(false)
      setIsValidationModalOpen(false)
      setValidationProject(null)
      setValidationResult(null)
      onNext()
    }, 500)
  }

  const handleProceedToArrangement = (project: ProjectItem) => {
    setProjectData({
      ...projectData,
      projectName: project.projectName,
      clientName: project.clientName,
      eventDate: project.date,
      venue: project.venue,
      talentName: project.talent,
    })
    onNext()
  }

  const handleOpenPRModal = (project: (typeof projects)[0]) => {
    setSelectedModalProject(project)
    setIsPRModalOpen(true)
  }

  const handleOpenCostModal = (project: (typeof projects)[0]) => {
    setSelectedModalProject(project)
    setIsCostModalOpen(true)
  }

  const handleGeneratePR = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const storeName = selectedModalProject?.venue || "〇〇店"
      const eventDate = selectedModalProject?.date
        ? new Date(selectedModalProject.date).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })
        : "近日"
      setPrText(
        `明日${eventDate}、${storeName}にて${selectedModalProject?.talent || "人気コンパニオン"}が登場！皆様のご来店をお待ちしております🎉 #パチンコ #新台入替 #コンパニオンイベント`,
      )
      setPrGenerated(true)
      setIsGenerating(false)
    }, 800)
  }

  const handleAutoFillCosts = () => {
    setCosts([
      { item: "コンパニオン出演料", amount: "150000" },
      { item: "交通費", amount: "25000" },
      { item: "宿泊費", amount: "18000" },
      { item: "PR広告費", amount: "50000" },
    ])
    setCostsAutoFilled(true)
  }

  const handleOpenValidationModal = (project: ProjectItem) => {
    setValidationProject(project)
    setIsValidationModalOpen(true)
  }

  const handleOpenDataCollectionModal = (proj: ProjectItem) => {
    setSelectedProject(proj)
    setShowDataCollectionModal(true)
  }

  const handleReminder = () => {
    setReminderSent(true)
    setTimeout(() => setReminderSent(false), 3000)
  }

  const handleSync = () => {
    setDataSynced(true)
  }

  const handleArchive = () => {
    setIsArchiving(true)
    setTimeout(() => {
      setIsArchiving(false)
      setArchiveComplete(true)
    }, 2000)
  }

  const handleOpenDataExportModal = (proj: ProjectItem) => {
    setSelectedProject(proj)
    setShowDataExportModal(true)
  }

  const handlePublicationCheck = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setPublicationChecked(true)
    }, 2000)
  }

  const handleMapping = () => {
    setIsMappingData(true)
    setTimeout(() => {
      setIsMappingData(false)
      setDataMapped(true)
    }, 1500)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {isLoadingNotify && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-700">内勤へ通知中...</p>
            </div>
          </div>
        </div>
      )}

      {isLoadingConfirmOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-700">受注確定処理中...</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">進行中の案件リスト</h1>
          <p className="text-slate-600">提案中の案件を受注に切り替えて、確定情報を入力します</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setCurrentScreen(4)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow p-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{project.projectName}</h3>
                    <Badge variant={project.status === "ordered" ? "default" : "secondary"}>
                      {project.status === "ordered" ? "受注（契約手続中）" : "提案中"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="h-4 w-4" />
                      <span>
                        顧客: <span className="font-medium text-slate-900">{project.clientName}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="h-4 w-4" />
                      <span>
                        タレント: <span className="font-medium text-slate-900">{project.talent}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        開催日: <span className="font-medium text-slate-900">{project.date}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        会場: <span className="font-medium text-slate-900">{project.venue}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-sm text-slate-600">見積金額: </span>
                    <span className="text-lg font-semibold text-blue-600">{project.estimateAmount}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  {project.status === "ordered" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleProceedToArrangement(project)}>
                          <Truck className="h-4 w-4 mr-2" />
                          手配へ進む
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenPRModal(project)}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          広報へ進む
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenCostModal(project)}>
                          <DollarSign className="h-4 w-4 mr-2" />
                          コスト管理
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDataCollectionModal(project)}>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          データ回収
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDataExportModal(project)}>
                          <Upload className="h-4 w-4 mr-2" />
                          データ出力
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenValidationModal(project)}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          案件確認
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Label htmlFor={`status-${project.id}`} className="text-sm">
                      {project.status === "ordered" ? "受注済み" : "受注に切替"}
                    </Label>
                    <Switch
                      id={`status-${project.id}`}
                      checked={project.status === "ordered"}
                      onCheckedChange={(checked) => handleStatusToggle(project, checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>受注確定情報の入力</DialogTitle>
            <DialogDescription>{selectedProject?.projectName} の受注確定情報を入力してください</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-slate-900 mb-2">案件サマリー</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">案件名:</span>
                  <span className="ml-2 font-medium">{selectedProject?.projectName}</span>
                </div>
                <div>
                  <span className="text-slate-600">顧客:</span>
                  <span className="ml-2 font-medium">{selectedProject?.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-600">タレント:</span>
                  <span className="ml-2 font-medium">{selectedProject?.talent}</span>
                </div>
                <div>
                  <span className="text-slate-600">開催日:</span>
                  <span className="ml-2 font-medium">{selectedProject?.date}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractAmount">契約金額（確定）</Label>
                <Input
                  id="contractAmount"
                  type="number"
                  value={formData.contractAmount}
                  onChange={(e) => setFormData({ ...formData, contractAmount: e.target.value })}
                  placeholder="600000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingAddress">請求書送付先</Label>
                <Input
                  id="billingAddress"
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  placeholder="東京都渋谷区..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">特記事項</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="契約に関する特記事項があれば入力してください"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleConfirmOrder} className="gap-2">
              <Send className="h-4 w-4" />
              受注確定して内勤へ連携
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isValidationModalOpen} onOpenChange={setIsValidationModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              案件確認・バリデーション
            </DialogTitle>
            <DialogDescription>
              AIが案件内容を自動的にチェックし、不備がある場合は修正依頼を生成します
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                <Sparkles className="h-4 w-4" />
                Step 7: 自動バリデーション
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm text-slate-900 mb-2">案件サマリー</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">案件名:</span>
                    <span className="ml-2 font-medium">{validationProject?.projectName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">顧客:</span>
                    <span className="ml-2 font-medium">{validationProject?.clientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">タレント:</span>
                    <span className="ml-2 font-medium">{validationProject?.talent}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">開催日:</span>
                    <span className="ml-2 font-medium">{validationProject?.date}</span>
                  </div>
                </div>
              </div>

              {isValidating ? (
                <div className="flex items-center justify-center py-8 bg-purple-50 rounded-lg">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <span className="ml-3 text-slate-600">バリデーション実行中...</span>
                </div>
              ) : validationResult ? (
                validationResult.isValid ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <div className="font-semibold mb-1">バリデーション成功</div>
                      <div className="text-sm">不備は見つかりませんでした。内勤へ通知します。</div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-2">不備が{validationResult.errors.length}件見つかりました</div>
                      <ul className="space-y-1 text-sm">
                        {validationResult.errors.map((error, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )
              ) : null}
            </div>

            {validationResult && !validationResult.isValid && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                    <Sparkles className="h-4 w-4" />
                    Step 7-1: 修正依頼作成（AI生成）
                  </div>
                  {!correctionMessage && (
                    <Button
                      onClick={handleGenerateCorrection}
                      variant="outline"
                      size="sm"
                      className="gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                    >
                      <Sparkles className="h-4 w-4" />
                      修正依頼を生成
                    </Button>
                  )}
                </div>

                {correctionMessage && (
                  <div className="space-y-3">
                    <Textarea
                      value={correctionMessage}
                      onChange={(e) => setCorrectionMessage(e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <Alert className="bg-blue-50 border-blue-200">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800 text-sm">
                        修正依頼がSlackで営業担当へ自動送信されました
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            )}

            {correctionMessage && validationResult && !validationResult.isValid && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">Step 7-2: 修正入力</div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="correctionAmount" className="text-red-600">
                      見積金額 *
                    </Label>
                    <Input
                      id="correctionAmount"
                      type="number"
                      value={correctionFormData.contractAmount}
                      onChange={(e) => setCorrectionFormData({ ...correctionFormData, contractAmount: e.target.value })}
                      placeholder="600000"
                      className="border-red-500 border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correctionAddress" className="text-red-600">
                      タレント確認 *
                    </Label>
                    <Input
                      id="correctionAddress"
                      value={correctionFormData.billingAddress}
                      onChange={(e) => setCorrectionFormData({ ...correctionFormData, billingAddress: e.target.value })}
                      placeholder="スケジュール確認済み"
                      className="border-red-500 border-2"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmitCorrection}
                  className="w-full gap-2"
                  disabled={!correctionFormData.contractAmount || !correctionFormData.billingAddress}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  修正完了・再バリデーション
                </Button>
              </div>
            )}

            {validationResult && validationResult.isValid && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                  <Sparkles className="h-4 w-4" />
                  Step 7-3: 内勤へ部門連携
                </div>

                <Alert className="bg-purple-50 border-purple-200">
                  <AlertDescription className="text-purple-900">
                    <div className="font-semibold mb-1">バリデーション完了</div>
                    <div className="text-sm">
                      案件に不備はありません。内勤担当へ自動通知し、DMM上でステータスを更新します。
                    </div>
                  </AlertDescription>
                </Alert>

                <Button onClick={handleNotifyInternal} className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
                  <Send className="h-4 w-4" />
                  内勤へ連絡して手配画面へ
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            {validationResult && validationResult.isValid ? (
              <Button onClick={handleNotifyInternal} className="gap-2">
                <Send className="h-4 w-4" />
                内勤へ連絡して手配画面へ
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsValidationModalOpen(false)}>
                閉じる
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPRModalOpen} onOpenChange={setIsPRModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI広報アシスタント
            </DialogTitle>
            <DialogDescription>AIを使ってSNS投稿文を自動生成します</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-slate-900 mb-2">案件サマリー</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">案件名:</span>
                  <span className="ml-2 font-medium">{selectedModalProject?.projectName}</span>
                </div>
                <div>
                  <span className="text-slate-600">顧客:</span>
                  <span className="ml-2 font-medium">{selectedModalProject?.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-600">コンパニオン:</span>
                  <span className="ml-2 font-medium">{selectedModalProject?.talent}</span>
                </div>
                <div>
                  <span className="text-slate-600">開催日:</span>
                  <span className="ml-2 font-medium">{selectedModalProject?.date}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGeneratePR}
              className="bg-purple-600 hover:bg-purple-700 gap-2"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  PR文面生成
                </>
              )}
            </Button>

            {prGenerated && (
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-purple-300">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    X (Twitter) プレビュー
                  </Badge>
                </div>
                <Textarea value={prText} onChange={(e) => setPrText(e.target.value)} rows={4} className="mb-3" />
                <Button className="bg-blue-500 hover:bg-blue-600">承認して投稿予約</Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPRModalOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCostModalOpen} onOpenChange={setIsCostModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Step 14: コスト管理</DialogTitle>
            <DialogDescription>{selectedModalProject?.projectName} のコスト情報を入力してください</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-slate-900 mb-2">案件サマリー</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">案件名:</span>
                  <span className="ml-2 font-medium">{selectedModalProject?.projectName}</span>
                </div>
                <div>
                  <span className="text-slate-600">顧客:</span>
                  <span className="ml-2 font-medium">{selectedModalProject?.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-600">見積金額:</span>
                  <span className="ml-2 font-medium text-blue-600 text-lg">{selectedModalProject?.estimateAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleAutoFillCosts}
                variant="outline"
                className="border-purple-300 bg-transparent gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                マスタ参照（自動入力）
              </Button>
              {costsAutoFilled && <Badge className="bg-green-100 text-green-700">入力完了</Badge>}
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left p-3 font-semibold">項目</th>
                    <th className="text-right p-3 font-semibold">金額（円）</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {costs.map((cost, idx) => (
                    <tr key={idx}>
                      <td className="p-3">{cost.item}</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={cost.amount}
                          onChange={(e) => {
                            const newCosts = [...costs]
                            newCosts[idx].amount = e.target.value
                            setCosts(newCosts)
                          }}
                          className="text-right"
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td className="p-3 font-bold">合計</td>
                    <td className="p-3 text-right font-bold text-lg">
                      ¥{costs.reduce((sum, c) => sum + (Number.parseInt(c.amount) || 0), 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCostModalOpen(false)}>
              キャンセル
            </Button>
            <Button
              onClick={() => {
                addNotification?.("コスト情報を保存しました")
                setIsCostModalOpen(false)
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDataCollectionModal} onOpenChange={setShowDataCollectionModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>データ回収＆資産格納</DialogTitle>
            <DialogDescription>
              {selectedProject && `${selectedProject.projectName} - 経費精算、アンケート回収、レポート資産の管理`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Recovery Status Monitor */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Expense Claims */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">スタッフ経費精算</h3>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="12"
                        strokeDasharray={`${(expenseData.submitted / expenseData.total) * 440} 440`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-blue-600">{expenseData.submitted}</div>
                      <div className="text-sm text-slate-500">/ {expenseData.total}</div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    回収率: {Math.round((expenseData.submitted / expenseData.total) * 100)}%
                  </Badge>
                </div>
              </Card>

              {/* Client Surveys */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">顧客アンケート</h3>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="12"
                        strokeDasharray={`${(surveyData.submitted / surveyData.total) * 440} 440`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-green-600">{surveyData.submitted}</div>
                      <div className="text-sm text-slate-500">/ {surveyData.total}</div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    回収率: {Math.round((surveyData.submitted / surveyData.total) * 100)}%
                  </Badge>
                </div>
              </Card>
            </div>

            {/* AI Reminder */}
            <Card className="p-6 border-2 border-purple-200 bg-purple-50/30">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold">AI自動リマインド</h2>
              </div>
              <p className="text-sm text-slate-600 mb-4">未回答者を自動抽出してリマインドを送信します</p>
              <Button onClick={handleReminder} className="bg-purple-600 hover:bg-purple-700">
                <Send className="w-4 h-4 mr-2" />
                未回答者へリマインド送信
              </Button>
              {reminderSent && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  リマインドを3名の未回答者へ送信しました
                </div>
              )}
            </Card>

            {/* Data Sync */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">データ同期</h2>
              </div>
              <p className="text-sm text-slate-600 mb-4">Googleフォームからデータを取り込みます</p>
              <Button onClick={handleSync} variant="outline" className="border-blue-300 bg-transparent">
                <Database className="w-4 h-4 mr-2" />
                スプレッドシート取込
              </Button>

              {dataSynced && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left p-2">氏名</th>
                        <th className="text-left p-2">項目</th>
                        <th className="text-right p-2">金額</th>
                        <th className="text-left p-2">ステータス</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-2">山田 太郎</td>
                        <td className="p-2">交通費</td>
                        <td className="p-2 text-right">¥3,500</td>
                        <td className="p-2">
                          <Badge className="bg-green-100 text-green-700">承認済</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">佐藤 花子</td>
                        <td className="p-2">宿泊費</td>
                        <td className="p-2 text-right">¥12,000</td>
                        <td className="p-2">
                          <Badge className="bg-yellow-100 text-yellow-700">確認中</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">田中 次郎</td>
                        <td className="p-2">交通費</td>
                        <td className="p-2 text-right">¥2,800</td>
                        <td className="p-2">
                          <Badge className="bg-green-100 text-green-700">承認済</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Asset Archiving */}
            <Card className="p-6 border-2 border-purple-200 bg-purple-50/30">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold">レポート資産自動格納</h2>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-3">イベント写真とレポートデータをアーカイブします</p>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className={`aspect-square bg-slate-200 rounded-lg flex items-center justify-center transition-all ${
                        isArchiving ? "animate-pulse" : ""
                      } ${archiveComplete ? "opacity-50" : ""}`}
                    >
                      <FileCheck className="w-8 h-8 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleArchive}
                disabled={isArchiving || archiveComplete}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                {isArchiving ? "格納中..." : archiveComplete ? "格納完了" : "Boxへ自動格納"}
              </Button>

              {archiveComplete && (
                <div className="mt-4 p-4 bg-green-100 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-800">格納完了</div>
                    <div className="text-sm text-green-700">フォルダ: Event_1225 / 8ファイル</div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDataExportModal} onOpenChange={setShowDataExportModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>公開確認＆データ出力</DialogTitle>
            <DialogDescription>
              {selectedProject && `${selectedProject.projectName} - レポート公開状況の確認と会計システムへのデータ出力`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Publication Checker */}
            <Card className="p-6 border-2 border-purple-200 bg-purple-50/30">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold">Web公開検証</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">レポートURL</label>
                  <div className="flex gap-2">
                    <Input
                      value={reportUrl}
                      onChange={(e) => setReportUrl(e.target.value)}
                      placeholder="https://example.com/report/..."
                      className="flex-1"
                    />
                    <Button
                      onClick={handlePublicationCheck}
                      disabled={!reportUrl || isScanning}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          検証中...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          公開状況をAI検知
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {isScanning && (
                  <div className="p-6 bg-white rounded-lg border-2 border-purple-300">
                    <div className="flex items-center justify-center mb-3">
                      <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    </div>
                    <p className="text-center text-sm text-slate-600">AIがページをスキャンしています...</p>
                    <div className="mt-4 h-32 bg-slate-100 rounded animate-pulse" />
                  </div>
                )}

                {publicationChecked && !isScanning && (
                  <div className="p-6 bg-green-50 rounded-lg border-2 border-green-300">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <span className="font-semibold text-green-800">公開確認完了</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>画像掲載OK (8枚検出)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>本文掲載OK (コンパニオン情報一致)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>公開日時: 2025/12/22 14:30</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Cowboy Data Export */}
            <Card className="p-6 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Cowboy形式データ変換</h2>
              </div>

              <p className="text-sm text-slate-600 mb-4">会計システム（Cowboy）へのデータエクスポート</p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Left: DMM Data */}
                <div className="border-2 border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">DMM 生データ</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="font-medium">タレント出演料</div>
                      <div className="text-slate-600">¥150,000</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="font-medium">交通費</div>
                      <div className="text-slate-600">¥25,000</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="font-medium">宿泊費</div>
                      <div className="text-slate-600">¥18,000</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="font-medium">PR広告費</div>
                      <div className="text-slate-600">¥50,000</div>
                    </div>
                  </div>
                </div>

                {/* Right: Cowboy Format */}
                <div
                  className={`border-2 rounded-lg p-4 transition-all ${dataMapped ? "border-green-300 bg-green-50" : "border-slate-200"}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className={dataMapped ? "bg-green-100 text-green-700" : ""}>
                      Cowboyフォーマット
                    </Badge>
                  </div>
                  {dataMapped ? (
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-white rounded border">
                        <div className="font-medium">勘定科目: 5201 (外注費)</div>
                        <div className="text-slate-600">¥150,000</div>
                      </div>
                      <div className="p-2 bg-white rounded border">
                        <div className="font-medium">勘定科目: 6101 (旅費交通費)</div>
                        <div className="text-slate-600">¥25,000</div>
                      </div>
                      <div className="p-2 bg-white rounded border">
                        <div className="font-medium">勘定科目: 6102 (宿泊費)</div>
                        <div className="text-slate-600">¥18,000</div>
                      </div>
                      <div className="p-2 bg-white rounded border">
                        <div className="font-medium">勘定科目: 7301 (広告宣伝費)</div>
                        <div className="text-slate-600">¥50,000</div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-slate-400">変換待ち...</div>
                  )}
                </div>
              </div>

              {/* Mapping Visualization */}
              {isMappingData && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-300 flex items-center justify-center gap-4">
                  <span className="text-sm font-medium text-purple-700">AIがデータをマッピング中</span>
                  <ArrowRight className="w-5 h-5 text-purple-600 animate-pulse" />
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleMapping}
                  disabled={isMappingData || dataMapped}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isMappingData ? "変換中..." : dataMapped ? "変換完了" : "AIマッピング変換"}
                </Button>

                {dataMapped && (
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    CSVダウンロード
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
