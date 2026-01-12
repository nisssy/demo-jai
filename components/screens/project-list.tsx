"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Building2,
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
  Plus,
  FileText,
  Mail,
  Eye,
  Trash2,
  Edit2,
  EyeOff,
  X,
} from "lucide-react"
import type { ProjectData, Role } from "@/types/project"
import { useState, useMemo, useEffect, useRef } from "react"
import { useProject } from "@/contexts/project-context"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ProjectListProps = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onNext: () => void
  onBack: () => void
  addNotification: (message: string) => void
  role: Role
  setCurrentScreen: (screen: number) => void
  onCreateNewProject: () => void
  initialTab?: "projects" | "corrections"
}

type ProjectItem = {
  id: number | string
  projectNumber?: string
  projectName: string
  clientName: string
  talent: string
  date: string
  venue: string
  status: "proposed" | "ordered"
  estimateAmount: string
  salesPersonName?: string
  requestDate?: string
  hallName?: string
  projectStatus?: string
  category?: string
  eventType?: string
  eventProductName?: string
  eventDate?: string
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
    salesPersonName: "山田 太郎",
    requestDate: "2025/11/01",
    hallName: "マルハン渋谷店",
    projectStatus: "営業確認待ち",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新台入替キャンペーン",
    eventDate: "2025/12/10",
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
    salesPersonName: "佐藤 次郎",
    requestDate: "2025/12/01",
    hallName: "ダイナム新宿店",
    projectStatus: "営業依頼中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "グランドオープン記念",
    eventDate: "2026/01/15",
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
    salesPersonName: "鈴木 三郎",
    requestDate: "2026/01/05",
    hallName: "ガイア池袋店",
    projectStatus: "手配中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "周年イベント",
    eventDate: "2026/02/20",
  },
]

type ValidationResult = {
  isValid: boolean
  errors: string[]
}

export function ProjectList({
  projectData,
  setProjectData,
  onNext,
  onBack,
  addNotification,
  role,
  setCurrentScreen,
  onCreateNewProject,
  initialTab = "projects",
}: ProjectListProps) {
  const router = useRouter()
  const { getProjects, updateProject, getHalls, searchHalls, searchCompanies, getCompanyByCompanyId } = useProject()
  const allProjects = getProjects()
  const [activeTab, setActiveTab] = useState<"projects" | "corrections" | "temporaryHoldFailure">(initialTab as "projects" | "corrections" | "temporaryHoldFailure")
  
  // initialTabが変更されたときにactiveTabを更新
  useEffect(() => {
    setActiveTab(initialTab as "projects" | "corrections" | "temporaryHoldFailure")
  }, [initialTab])
  
  // 修正依頼がきている案件（projectStatus === "営業修正中"）
  const correctionRequests = useMemo(() => {
    return allProjects.filter((p) => p.projectStatus === "営業修正中")
  }, [allProjects])

  // 仮押さえ不可の通知がきている案件（projectStatus === "営業確認中" かつ temporaryHoldFailureComment が存在）
  const temporaryHoldFailureRequests = useMemo(() => {
    return allProjects.filter((p) => 
      p.projectStatus === "営業確認中" && (p as any).temporaryHoldFailureComment
    )
  }, [allProjects])
  
  // 見積書PDFを生成する関数（簡易版）
  const generateQuotePDF = (quoteData: ProjectData, projectNumber: string): string => {
    // 実際のPDF生成ライブラリを使用する場合は、ここで実装
    // 今回は簡易版として、PDFの構造をテキストで返す
    const pdfText = `
見積書
案件No: ${projectNumber}
発行日: ${new Date().toLocaleDateString("ja-JP")}

${quoteData.clientName} 御中

下記の通りお見積もりいたします。

案件名: ${quoteData.projectName}
開催日: ${quoteData.date}
会場: ${quoteData.venue}
担当営業: ${quoteData.talent}

見積明細:
${quoteData.quoteItems.map(item => `${item.item}: ¥${item.amount.toLocaleString()}`).join('\n')}

合計金額（税込）: ¥${quoteData.quoteItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
`
    return pdfText
  }
  
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchType, setSearchType] = useState<"hall" | "company">("company")
  const [selectedHallName, setSelectedHallName] = useState<string | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [searchProjectNumber, setSearchProjectNumber] = useState("")
  const [searchCategory, setSearchCategory] = useState<string | null>(null)
  const [searchEventType, setSearchEventType] = useState<string | null>(null)
  
  // 案件Noの降順でソート
  const sortedProjects = useMemo(() => {
    return [...allProjects].sort((a, b) => {
      const projectNumberA = parseInt((a as any).projectNumber || "0")
      const projectNumberB = parseInt((b as any).projectNumber || "0")
      
      // 降順（大きい案件Noが先）
      return projectNumberB - projectNumberA
    })
  }, [allProjects])

  // 検索条件でフィルタリング
  const filteredProjects = useMemo(() => {
    return sortedProjects.filter((project) => {
      // ホール名でフィルタリング
      if (selectedHallName) {
        const hallName = (project as any).hallName || project.clientName || ""
        if (hallName !== selectedHallName) return false
      }
      
      // 法人IDでフィルタリング
      if (selectedCompanyId) {
        const companyId = (project as any).companyId || ""
        if (companyId !== selectedCompanyId) return false
      }
      
      // 案件Noでフィルタリング
      if (searchProjectNumber) {
        const projectNumber = String((project as any).projectNumber || "")
        if (!projectNumber.includes(searchProjectNumber)) return false
      }
      
      // 商材カテゴリでフィルタリング
      if (searchCategory) {
        const category = String((project as any).category || "")
        if (category !== searchCategory) return false
      }
      
      // イベント区分でフィルタリング
      if (searchEventType) {
        const eventType = String((project as any).eventType || "")
        if (eventType !== searchEventType) return false
      }
      
      return true
    })
  }, [sortedProjects, selectedHallName, selectedCompanyId, searchProjectNumber, searchCategory, searchEventType])

  // 案件Noごとにグループ化
  const projectsByProjectNumber = useMemo(() => {
    const grouped: { [projectNumber: string]: typeof sortedProjects } = {}
    
    filteredProjects.forEach((project) => {
      const projectNumber = (project as any).projectNumber || "未分類"
      if (!grouped[projectNumber]) {
        grouped[projectNumber] = []
      }
      grouped[projectNumber].push(project)
    })
    
    return grouped
  }, [filteredProjects])

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
  const [selectedModalProject, setSelectedModalProject] = useState<(typeof sortedProjects)[0] | null>(null)

  const [prGenerated, setPrGenerated] = useState(false)
  const [prText, setPrText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const [costsAutoFilled, setCostsAutoFilled] = useState(false)

  // 見積書作成モーダル関連
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [selectedProjectForQuote, setSelectedProjectForQuote] = useState<{ projectNumber: string; products: typeof sortedProjects } | null>(null)
  const [selectedProductsForQuote, setSelectedProductsForQuote] = useState<Set<number>>(new Set())
  const [quoteStep, setQuoteStep] = useState<"select" | "recipient" | "template" | "quote" | "email">("select")
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [quoteRecipient, setQuoteRecipient] = useState<"company" | "hall">("hall")
  // 見積書項目編集用の状態
  const [editableQuoteItems, setEditableQuoteItems] = useState<Array<{
    id: string
    item: string
    amount: number
    visible: boolean
    subitems?: Array<{ id: string; item: string; amount: number; visible: boolean }>
  }>>([])
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingSubitemId, setEditingSubitemId] = useState<{ itemId: string; subitemId: string } | null>(null)
  // スクロール用のref
  const quoteItemsScrollRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  
  // 見積書テンプレート定義
  const quoteTemplates = [
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
  ]
  const [showPDF, setShowPDF] = useState(false)
  const [quoteGenerated, setQuoteGenerated] = useState(false)
  const [emailGenerated, setEmailGenerated] = useState(false)
  const [quoteModalTab, setQuoteModalTab] = useState<"quote" | "email">("quote")
  const [isLoadingSend, setIsLoadingSend] = useState(false)
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

  // テンプレート画面に遷移した時、既存の見積書データから項目を初期化
  useEffect(() => {
    if (quoteStep === "template" && editableQuoteItems.length === 0 && quoteProjectData.quoteItems && quoteProjectData.quoteItems.length > 0) {
      const items = quoteProjectData.quoteItems.map((item, idx) => ({
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
    }
  }, [quoteStep, quoteProjectData.quoteItems])

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
      // 仮想DBで案件を更新
      if (typeof project.id === 'number') {
        updateProject(project.id, { status: "proposed" })
      }
    }
  }

  const handleConfirmOrder = () => {
    if (!selectedProject) return

    setIsLoadingConfirmOrder(true)

    setTimeout(() => {
      // projectDataを更新
      setProjectData({
        ...projectData,
        projectName: selectedProject.projectName,
        clientName: selectedProject.clientName,
        talent: selectedProject.talent,
        date: selectedProject.date,
        contractAmount: formData.contractAmount,
        billingAddress: formData.billingAddress,
        status: "ordered",
      })

      // 仮想DBで案件を更新（statusとprojectStatusの両方を更新）
      if (typeof selectedProject.id === 'number') {
        updateProject(selectedProject.id, { 
          status: "ordered",
          projectStatus: "イベントチーム確認中"
        } as any)
      }

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
      date: project.date,
      venue: project.venue,
      talent: project.talent,
    })
    onNext()
  }

  const handleOpenPRModal = (project: (typeof sortedProjects)[0]) => {
    setSelectedModalProject(project)
    setIsPRModalOpen(true)
  }

  const handleOpenCostModal = (project: (typeof sortedProjects)[0]) => {
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

  // ステータスバッジを取得する関数（イベント側と統一）
  const getStatusBadge = (status: string | undefined) => {
    if (!status) {
      return <Badge variant="secondary" className="bg-slate-100 text-slate-700">-</Badge>
    }
    switch (status) {
      case "見積送付完了":
        return <Badge className="bg-green-600 text-white">見積送付完了</Badge>
      case "見込み入力完了":
        return <Badge className="bg-slate-500 text-white">見込み入力完了</Badge>
      case "仮押さえ依頼":
        return <Badge className="bg-yellow-600 text-white">仮押さえ依頼</Badge>
      case "仮押さえ済み":
        return <Badge className="bg-green-600 text-white">仮押さえ済み</Badge>
      case "イベントチーム確認中":
        return <Badge className="bg-blue-600 text-white">イベントチーム確認中</Badge>
      case "営業修正中":
        return <Badge className="bg-orange-600 text-white">営業修正中</Badge>
      case "営業確認中":
        return <Badge className="bg-orange-600 text-white">営業確認中</Badge>
      case "手配進行中":
        return <Badge className="bg-blue-600 text-white">手配進行中</Badge>
      case "イベント終了処理中":
        return <Badge className="bg-blue-600 text-white">イベント終了処理中</Badge>
      case "手配完了":
        return <Badge className="bg-green-600 text-white">手配完了</Badge>
      case "キャンセル":
        return <Badge className="bg-red-600 text-white">キャンセル</Badge>
      default:
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700">{status}</Badge>
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
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

      {/* モダンなタブデザイン */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "projects" | "corrections" | "temporaryHoldFailure")} className="w-full">
        <div className="border-b border-slate-100 mb-8">
          <div className="flex items-center justify-between">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger 
              value="projects" 
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
            >
              案件一覧
            </TabsTrigger>
            <TabsTrigger 
              value="corrections"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
            >
              修正確認依頼
              {correctionRequests.length > 0 && (
                <Badge className="ml-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">{correctionRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="temporaryHoldFailure"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
            >
              仮押さえ不可
              {temporaryHoldFailureRequests.length > 0 && (
                <Badge className="ml-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">{temporaryHoldFailureRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <button
            onClick={onCreateNewProject}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            新規案件作成
          </button>
          </div>
        </div>

        <TabsContent value="projects" className="mt-0">
          {/* 検索UI */}
          <Card className="mb-6 border-slate-200 bg-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900">
                <Search className="h-5 w-5 text-slate-600" />
                案件検索
              </CardTitle>
              <CardDescription>
                複数の条件で案件を絞り込むことができます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 案件No検索 */}
                <div className="space-y-2">
                  <Label htmlFor="search-project-number" className="text-sm font-semibold">
                    案件No
                  </Label>
                  <Input
                    id="search-project-number"
                    placeholder="案件Noを入力..."
                    value={searchProjectNumber}
                    onChange={(e) => setSearchProjectNumber(e.target.value)}
                    className="bg-white"
                  />
                </div>

                {/* 商材カテゴリ検索 */}
                <div className="space-y-2">
                  <Label htmlFor="search-category" className="text-sm font-semibold">
                    商材カテゴリ
                  </Label>
                  <Select
                    value={searchCategory || undefined}
                    onValueChange={(value: string) => setSearchCategory(value === "all" ? null : value)}
                  >
                    <SelectTrigger id="search-category" className="bg-white">
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="イベント">イベント</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* イベント区分検索 */}
                <div className="space-y-2">
                  <Label htmlFor="search-event-type" className="text-sm font-semibold">
                    イベント区分
                  </Label>
                  <Select
                    value={searchEventType || undefined}
                    onValueChange={(value: string) => setSearchEventType(value === "all" ? null : value)}
                  >
                    <SelectTrigger id="search-event-type" className="bg-white">
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="トリニティガール">トリニティガール</SelectItem>
                      <SelectItem value="スロセレ">スロセレ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 法人/ホール検索 */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">法人/ホール</Label>
                  <div className="flex gap-2">
                    <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={searchOpen}
                          className="flex-1 justify-between bg-white"
                        >
                          {searchType === "company" 
                            ? (selectedCompanyId ? (getCompanyByCompanyId(selectedCompanyId)?.name || "法人名を検索...") : "法人名を検索...")
                            : (selectedHallName || "ホール名を検索...")
                          }
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput 
                            placeholder={searchType === "hall" ? "ホール名を検索..." : "法人名を検索..."}
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                          />
                          <CommandList>
                            {searchType === "hall" ? (
                              <>
                                <CommandEmpty>ホールが見つかりませんでした</CommandEmpty>
                                <CommandGroup>
                                  {searchHalls(searchQuery).map((hall) => (
                                    <CommandItem
                                      key={hall.id}
                                      value={hall.name}
                                      onSelect={() => {
                                        setSelectedHallName(hall.name)
                                        setSelectedCompanyId(null)
                                        setSearchOpen(false)
                                        setSearchQuery("")
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${selectedHallName === hall.name ? "opacity-100" : "opacity-0"}`}
                                      />
                                      <div className="flex flex-col">
                                        <span>{hall.name}</span>
                                        <span className="text-xs text-slate-500">担当: {hall.salesPersonName}</span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </>
                            ) : (
                              <>
                                <CommandEmpty>法人が見つかりませんでした</CommandEmpty>
                                <CommandGroup>
                                  {searchCompanies(searchQuery).map((company) => (
                                    <CommandItem
                                      key={company.id}
                                      value={company.name}
                                      onSelect={() => {
                                        setSelectedCompanyId(company.companyId)
                                        setSelectedHallName(null)
                                        setSearchOpen(false)
                                        setSearchQuery("")
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${selectedCompanyId === company.companyId ? "opacity-100" : "opacity-0"}`}
                                      />
                                      <div className="flex flex-col">
                                        <span>{company.name}</span>
                                        <span className="text-xs text-slate-500">法人ID: {company.companyId}</span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Tabs value={searchType} onValueChange={(value) => {
                      setSearchType(value as "hall" | "company")
                      setSelectedHallName(null)
                      setSelectedCompanyId(null)
                      setSearchQuery("")
                    }}>
                      <TabsList className="h-10 bg-white">
                        <TabsTrigger value="company" className="px-3">法人</TabsTrigger>
                        <TabsTrigger value="hall" className="px-3">ホール</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* 検索条件の表示とクリアボタン */}
              {(searchProjectNumber || searchCategory || searchEventType || selectedHallName || selectedCompanyId) && (
                <div className="mt-4 pt-4 border-t border-blue-200 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">検索条件:</span>
                    {searchProjectNumber && (
                      <Badge variant="secondary" className="gap-1">
                        案件No: {searchProjectNumber}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSearchProjectNumber("")
                          }}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {searchCategory && (
                      <Badge variant="secondary" className="gap-1">
                        カテゴリ: {searchCategory}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSearchCategory(null)
                          }}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {searchEventType && (
                      <Badge variant="secondary" className="gap-1">
                        イベント区分: {searchEventType}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSearchEventType(null)
                          }}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {selectedHallName && (
                      <Badge variant="secondary" className="gap-1">
                        ホール: {selectedHallName}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedHallName(null)
                          }}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {selectedCompanyId && (
                      <Badge variant="secondary" className="gap-1">
                        法人: {getCompanyByCompanyId(selectedCompanyId)?.name || selectedCompanyId}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCompanyId(null)
                          }}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchProjectNumber("")
                      setSearchCategory(null)
                      setSearchEventType(null)
                      setSelectedHallName(null)
                      setSelectedCompanyId(null)
                      setSearchQuery("")
                    }}
                    className="gap-2"
                  >
                    すべてクリア
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

      {Object.keys(projectsByProjectNumber).length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {(searchProjectNumber || searchCategory || searchEventType || selectedHallName || selectedCompanyId) 
            ? "検索結果が見つかりませんでした" 
            : "案件がありません"}
        </div>
      ) : (
      <div className="space-y-6">
        {Object.entries(projectsByProjectNumber)
          .sort(([a], [b]) => {
            // 案件Noの降順でソート
            const numA = parseInt(a) || 0
            const numB = parseInt(b) || 0
            return numB - numA
          })
          .map(([projectNumber, projectProducts]) => {
          const firstProduct = projectProducts[0]
          const hallName = (firstProduct as any).hallName || firstProduct.clientName || "未分類"
          const salesPersonName = (firstProduct as any).salesPersonName || "-"
          const requestDate = (firstProduct as any).requestDate || "-"
          const companyName = (firstProduct as any).companyName || "-"
          const companyId = (firstProduct as any).companyId || "-"
          const hallId = (firstProduct as any).hallId || "-"
          
          return (
            <Card key={projectNumber} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* 案件ヘッダー */}
                <div className="mb-4 pb-4 border-b-2 border-slate-300">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <h2 className="text-3xl font-bold text-slate-900 whitespace-nowrap">案件No: {projectNumber}</h2>
                      <Badge variant="outline" className="ml-2 whitespace-nowrap">
                        {projectProducts.length}件の商材
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>法人名: <span className="font-medium text-slate-900">{companyName}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>法人ID: <span className="font-medium text-slate-900">{companyId}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>ホール名: <span className="font-medium text-slate-900">{hallName}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>ホールID: <span className="font-medium text-slate-900">{hallId}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>担当営業: <span className="font-medium text-slate-900">{salesPersonName}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>依頼日: <span className="font-medium text-slate-900">{requestDate}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setSelectedProjectForQuote({ projectNumber, products: projectProducts })
                          setSelectedProductsForQuote(new Set(projectProducts.map(p => p.id as number)))
                          setQuoteStep("select")
                          setIsQuoteModalOpen(true)
                        }}
                        variant="outline"
                        className="gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        見積書作成
                      </Button>
                      {/* 見積書が生成されている場合はダウンロードボタンを表示 */}
                      {projectProducts.some(p => (p as any).quoteGenerated) && (
                        <Button
                          onClick={() => {
                            // 見積書PDFをダウンロード
                            const quoteData = projectProducts.find(p => (p as any).quoteGenerated)
                            if (quoteData) {
                              const quoteProjectData = (quoteData as any).quoteData
                              // PDF生成のロジック（簡易版）
                              const pdfContent = generateQuotePDF(quoteProjectData, projectNumber)
                              const blob = new Blob([pdfContent], { type: 'application/pdf' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `quote_${projectNumber}.pdf`
                              document.body.appendChild(a)
                              a.click()
                              document.body.removeChild(a)
                              URL.revokeObjectURL(url)
                            }
                          }}
                          variant="outline"
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          見積書ダウンロード
                        </Button>
                      )}
                      <Button
                        onClick={() => router.push(`/project/${firstProduct.id}/product/new`)}
                        variant="outline"
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        商材を追加
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 商材一覧 */}
                <div className="space-y-3">
                  {projectProducts.map((project, index) => {
                    const projectItem: ProjectItem = {
                      id: project.id,
                      projectNumber: (project as any).projectNumber,
                      projectName: project.projectName,
                      clientName: project.clientName,
                      talent: project.talent,
                      date: project.date,
                      venue: project.venue,
                      status: project.status,
                      estimateAmount: project.estimateAmount,
                      salesPersonName: (project as any).salesPersonName,
                      requestDate: (project as any).requestDate,
                      hallName: (project as any).hallName,
                      projectStatus: (project as any).projectStatus,
                      category: (project as any).category,
                      eventType: (project as any).eventType,
                      eventProductName: (project as any).eventProductName,
                      eventDate: (project as any).eventDate,
                    }
                    
                    return (
                      <div
                        key={project.id}
                        className="bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => {
                          // 営業修正中の場合は修正画面に遷移、それ以外は通常の編集画面に遷移
                          if (projectItem.projectStatus === "営業修正中") {
                            router.push(`/project/${project.id}/correction`)
                          } else {
                            router.push(`/project/${project.id}`)
                          }
                        }}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">案件No: {project.projectNumber}</span>
                                    {getStatusBadge(projectItem.projectStatus)}
                                  </div>
                                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                                    {projectItem.eventProductName || project.projectName}
                                  </h3>
                                  <p className="text-sm text-slate-600">{project.clientName}</p>
                                </div>
                                <div 
                                  className="flex flex-col items-end"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`status-${project.id}`} className="text-xs text-slate-600">
                                      {project.status === "ordered" ? "受注済み" : "見積中"}
                                    </Label>
                                    <Switch
                                      id={`status-${project.id}`}
                                      checked={project.status === "ordered"}
                                      onCheckedChange={(checked) => handleStatusToggle(projectItem, checked)}
                                      className="scale-75"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">開催日</div>
                                  <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {projectItem.eventDate || project.date || "-"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">商材カテゴリ</div>
                                  <div className="text-sm font-medium text-slate-900">{projectItem.category || "-"}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">イベント区分</div>
                                  <div className="text-sm font-medium text-slate-900">{projectItem.eventType || "-"}</div>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">見積金額</div>
                                    <div className="text-lg font-semibold text-slate-900">
                                      {(project as any).estimatedBillingAmount !== undefined
                                        ? `¥${(project as any).estimatedBillingAmount.toLocaleString()}`
                                        : project.estimateAmount}
                                    </div>
                                  </div>
                                  {projectItem.salesPersonName && (
                                    <div className="text-right">
                                      <div className="text-xs text-slate-500 mb-1">担当営業</div>
                                      <div className="text-sm font-medium text-slate-700">{projectItem.salesPersonName}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>受注確定情報の入力</DialogTitle>
            <DialogDescription>{selectedProject?.projectName} の受注確定情報を入力してください</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-slate-900 mb-2">案件サマリー</h4>
              <div className="mb-3 pb-3 border-b border-slate-300">
                <div className="text-2xl font-bold text-slate-900">
                  案件No: {selectedProject?.projectNumber || "-"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="h-4 w-4" />
                  <span>法人名:</span>
                  <span className="ml-2 font-medium text-slate-900">{(selectedProject as any)?.companyName || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>法人ID:</span>
                  <span className="ml-2 font-medium text-slate-900">{(selectedProject as any)?.companyId || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>ホール名:</span>
                  <span className="ml-2 font-medium text-slate-900">{selectedProject?.hallName || selectedProject?.venue || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>ホールID:</span>
                  <span className="ml-2 font-medium text-slate-900">{(selectedProject as any)?.hallId || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="h-4 w-4" />
                  <span>ホール担当営業:</span>
                  <span className="ml-2 font-medium text-slate-900">{selectedProject?.salesPersonName || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>依頼日:</span>
                  <span className="ml-2 font-medium text-slate-900">{selectedProject?.requestDate || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>ステータス:</span>
                  {getStatusBadge(selectedProject?.projectStatus)}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>商材カテゴリ:</span>
                  <span className="ml-2 font-medium text-slate-900">{selectedProject?.category || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>イベント区分:</span>
                  <span className="ml-2 font-medium text-slate-900">{selectedProject?.eventType || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>イベント商材名:</span>
                  <span className="ml-2 font-medium text-slate-900">{selectedProject?.eventProductName || selectedProject?.projectName || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>開催日:</span>
                  <span className="ml-2 font-medium text-slate-900">{selectedProject?.eventDate || selectedProject?.date || "-"}</span>
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
                <Button>承認して投稿予約</Button>
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
        </TabsContent>

        <TabsContent value="corrections" className="mt-0">
          {/* 修正依頼一覧 */}
          {correctionRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              修正依頼はありません
            </div>
          ) : (
            <div className="space-y-6">
              {correctionRequests.map((project) => {
                const projectItem: ProjectItem = {
                  id: project.id,
                  projectNumber: project.projectNumber,
                  projectName: project.projectName,
                  clientName: project.clientName,
                  talent: project.talent,
                  date: project.date,
                  venue: project.venue,
                  status: project.status,
                  estimateAmount: project.estimateAmount,
                  salesPersonName: project.salesPersonName,
                  requestDate: project.requestDate,
                  hallName: (project as any).hallName,
                  projectStatus: project.projectStatus,
                  category: (project as any).category,
                  eventType: (project as any).eventType,
                  eventProductName: (project as any).eventProductName,
                  eventDate: (project as any).eventDate,
                }
                const correctionRequest = (project as any).correctionRequest || ""
                return (
                  <div
                    key={project.id}
                    className="bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="p-5">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">案件No: {project.projectNumber}</span>
                              {getStatusBadge(projectItem.projectStatus)}
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 mb-1">
                              {projectItem.eventProductName || project.projectName}
                            </h3>
                            <p className="text-sm text-slate-600">{project.clientName}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                          <div>
                            <div className="text-xs text-slate-500 mb-1">開催日</div>
                            <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {projectItem.eventDate || project.date || "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">見積金額</div>
                            <div className="text-sm font-medium text-slate-900">
                              {(project as any).estimatedBillingAmount !== undefined
                                ? `¥${(project as any).estimatedBillingAmount.toLocaleString()}`
                                : project.estimateAmount}
                            </div>
                          </div>
                          {projectItem.salesPersonName && (
                            <div>
                              <div className="text-xs text-slate-500 mb-1">担当営業</div>
                              <div className="text-sm font-medium text-slate-700">{projectItem.salesPersonName}</div>
                            </div>
                          )}
                        </div>

                        {correctionRequest && (
                          <div className="pt-3 border-t border-slate-100">
                            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <span className="text-xs font-semibold text-orange-900">修正依頼内容</span>
                              </div>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{correctionRequest}</p>
                            </div>
                          </div>
                        )}

                        <div className="pt-3 border-t border-slate-100 flex justify-end">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/project/${project.id}/correction?tab=corrections`)
                            }}
                            size="sm"
                            className="gap-2"
                          >
                            修正
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="temporaryHoldFailure" className="mt-0">
          {/* 仮押さえ不可一覧 */}
          {temporaryHoldFailureRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              仮押さえ不可の通知はありません
            </div>
          ) : (
            <div className="space-y-6">
              {temporaryHoldFailureRequests.map((project) => {
                const projectItem: ProjectItem = {
                  id: project.id,
                  projectNumber: project.projectNumber,
                  projectName: project.projectName,
                  clientName: project.clientName,
                  talent: project.talent,
                  date: project.date,
                  venue: project.venue,
                  status: project.status,
                  estimateAmount: project.estimateAmount,
                  salesPersonName: project.salesPersonName,
                  requestDate: project.requestDate,
                  hallName: (project as any).hallName,
                  projectStatus: project.projectStatus,
                  category: (project as any).category,
                  eventType: (project as any).eventType,
                  eventProductName: (project as any).eventProductName,
                  eventDate: (project as any).eventDate,
                }
                const temporaryHoldFailureComment = (project as any).temporaryHoldFailureComment || ""
                return (
                  <div
                    key={project.id}
                    className="bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="p-5">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">案件No: {project.projectNumber}</span>
                              {getStatusBadge(projectItem.projectStatus)}
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 mb-1">
                              {projectItem.eventProductName || project.projectName}
                            </h3>
                            <p className="text-sm text-slate-600">{project.clientName}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                          <div>
                            <div className="text-xs text-slate-500 mb-1">開催日</div>
                            <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {projectItem.eventDate || project.date || "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">見積金額</div>
                            <div className="text-sm font-medium text-slate-900">
                              {(project as any).estimatedBillingAmount !== undefined
                                ? `¥${(project as any).estimatedBillingAmount.toLocaleString()}`
                                : project.estimateAmount}
                            </div>
                          </div>
                          {projectItem.salesPersonName && (
                            <div>
                              <div className="text-xs text-slate-500 mb-1">担当営業</div>
                              <div className="text-sm font-medium text-slate-700">{projectItem.salesPersonName}</div>
                            </div>
                          )}
                        </div>

                        {temporaryHoldFailureComment && (
                          <div className="pt-3 border-t border-slate-100">
                            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <span className="text-xs font-semibold text-orange-900">仮押さえ不可の理由</span>
                              </div>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{temporaryHoldFailureComment}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 見積書作成モーダル */}
      <Dialog
        open={isQuoteModalOpen}
        onOpenChange={(open) => {
          setIsQuoteModalOpen(open)
          if (!open) {
            // モーダルを閉じる時に状態をリセット
            setQuoteStep("select")
            setQuoteGenerated(false)
            setEmailGenerated(false)
            setSelectedProductsForQuote(new Set())
            setSelectedProjectForQuote(null)
            setShowPDF(false)
            setIsLoadingSend(false)
            setSelectedTemplate(null)
            setQuoteRecipient("hall")
          }
        }}
      >
        <DialogContent className="!max-w-[1000px] sm:!max-w-[1000px] !w-[75vw] max-h-[85vh] overflow-hidden flex flex-col">
          <div className="relative flex-1 overflow-hidden flex flex-col min-h-0">
            {/* スライドコンテナ */}
            <div
              className="flex transition-transform duration-500 ease-in-out h-full items-stretch"
              style={{ 
                transform: `translateX(-${
                  quoteStep === "recipient" ? 100 : 
                  quoteStep === "template" ? 200 : 
                  quoteStep === "quote" ? 300 : 
                  quoteStep === "email" ? 400 : 0
                }%)` 
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
                          const productName = (product as any).eventProductName || product.projectName
                          const eventDate = (product as any).eventDate || product.date
                          const estimatedAmount = (product as any).estimatedBillingAmount
                            ? `¥${(product as any).estimatedBillingAmount.toLocaleString()}`
                            : product.estimateAmount
                          
                          return (
                            <div
                              key={product.id}
                              className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200 hover:bg-slate-50"
                            >
                              <Checkbox
                                checked={selectedProductsForQuote.has(product.id as number)}
                                onCheckedChange={(checked) => {
                                  const newSet = new Set(selectedProductsForQuote)
                                  if (checked) {
                                    newSet.add(product.id as number)
                                  } else {
                                    newSet.delete(product.id as number)
                                  }
                                  setSelectedProductsForQuote(newSet)
                                }}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-slate-900">{productName}</div>
                                <div className="text-sm text-slate-600">
                                  開催日: {eventDate} | 見積金額: {estimatedAmount}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsQuoteModalOpen(false)}>
                          キャンセル
                        </Button>
                        <Button
                          onClick={() => {
                            if (selectedProductsForQuote.size > 0) {
                              // 選択された商材の情報を集約
                              const selectedProducts = selectedProjectForQuote.products.filter(p =>
                                selectedProductsForQuote.has(p.id as number)
                              )
                              const firstProduct = selectedProducts[0]
                              const hallName = (firstProduct as any).hallName || firstProduct.clientName
                              const totalAmount = selectedProducts.reduce((sum, p) => {
                                return sum + ((p as any).estimatedBillingAmount || 0)
                              }, 0)
                              
                              // 見積項目を自動生成
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
                              
                              const quoteData = {
                                projectName: selectedProducts.map(p => (p as any).eventProductName || p.projectName).join("、"),
                                clientName: hallName,
                                date: selectedProducts.map(p => (p as any).eventDate || p.date).join("、"),
                                venue: hallName,
                                talent: (firstProduct as any).salesPersonName || firstProduct.talent,
                                talentStatus: "available" as const,
                                quoteItems: defaultItems,
                                emailDraft: "",
                                contractAmount: "",
                                billingAddress: "",
                                status: "proposed" as const,
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
                  {selectedProjectForQuote && (() => {
                    const selectedProducts = selectedProjectForQuote.products.filter(p =>
                      selectedProductsForQuote.has(p.id as number)
                    )
                    const firstProduct = selectedProducts[0]
                    const hallName = (firstProduct as any).hallName || firstProduct.clientName
                    const companyName = (firstProduct as any).companyName || ""
                    
                    return (
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <h4 className="font-medium text-sm text-slate-900 mb-4">見積書の宛先を選択してください</h4>
                          <div className="space-y-3">
                            <div
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                quoteRecipient === "hall"
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                              onClick={() => setQuoteRecipient("hall")}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  quoteRecipient === "hall"
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-slate-300"
                                }`}>
                                  {quoteRecipient === "hall" && (
                                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                  )}
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
                                  <div className={`w-4 h-4 rounded-full border-2 ${
                                    quoteRecipient === "company"
                                      ? "border-blue-500 bg-blue-500"
                                      : "border-slate-300"
                                  }`}>
                                    {quoteRecipient === "company" && (
                                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                    )}
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
                      // 選択された宛先を反映
                      if (selectedProjectForQuote) {
                        const selectedProducts = selectedProjectForQuote.products.filter(p =>
                          selectedProductsForQuote.has(p.id as number)
                        )
                        const firstProduct = selectedProducts[0]
                        const hallName = (firstProduct as any).hallName || firstProduct.clientName
                        const companyName = (firstProduct as any).companyName || ""
                        const recipientName = quoteRecipient === "company" ? companyName : hallName
                        
                        setQuoteProjectData(prev => ({
                          ...prev,
                          clientName: recipientName || prev.clientName
                        }))
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

                <div ref={quoteItemsScrollRef} className="flex-1 overflow-y-auto py-4 space-y-6 min-h-0" style={{ maxHeight: 'calc(85vh - 250px)' }}>
                  {/* テンプレート選択セクション */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-700">テンプレートから選択</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {quoteTemplates.map((template) => (
                        <Button
                          key={template.id}
                          variant={selectedTemplate === template.id ? "default" : "outline"}
                          className={`h-auto p-4 flex flex-col items-start justify-start ${
                            selectedTemplate === template.id
                              ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                              : "bg-white hover:bg-slate-50 border-slate-300"
                          }`}
                          onClick={() => {
                            setSelectedTemplate(template.id)
                            // テンプレートを適用
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
                            <span className={`font-semibold text-sm ${
                              selectedTemplate === template.id ? "text-white" : "text-slate-900"
                            }`}>{template.name}</span>
                            {selectedTemplate === template.id && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <span className={`text-xs text-left ${
                            selectedTemplate === template.id ? "text-blue-100" : "text-slate-600"
                          }`}>{template.description}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 項目編集セクション */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-700">見積書項目</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newItem = {
                            id: `item-${Date.now()}`,
                            item: "新しい項目",
                            amount: 0,
                            visible: true,
                          }
                          setEditableQuoteItems([...editableQuoteItems, newItem])
                          setEditingItemId(newItem.id)
                          // 項目追加後にその項目までスクロール
                          setTimeout(() => {
                            const itemElement = itemRefs.current[newItem.id]
                            if (itemElement && quoteItemsScrollRef.current) {
                              itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }
                          }, 100)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        項目を追加
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {editableQuoteItems.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">
                          項目がありません。テンプレートを選択するか、項目を追加してください。
                        </div>
                      ) : (
                        editableQuoteItems.map((item) => (
                          <div 
                            key={item.id} 
                            ref={(el) => { itemRefs.current[item.id] = el }}
                          >
                            <Card className="border-slate-200">
                              <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Switch
                                  checked={item.visible}
                                  onCheckedChange={(checked) => {
                                    setEditableQuoteItems(editableQuoteItems.map(i =>
                                      i.id === item.id ? { ...i, visible: checked } : i
                                    ))
                                  }}
                                />
                                <div className="flex-1 space-y-2">
                                  {editingItemId === item.id ? (
                                    <div className="space-y-2">
                                      <div className="flex gap-2">
                                        <Input
                                          value={item.item}
                                          onChange={(e) => {
                                            setEditableQuoteItems(editableQuoteItems.map(i =>
                                              i.id === item.id ? { ...i, item: e.target.value } : i
                                            ))
                                          }}
                                          className="flex-1"
                                          placeholder="項目名"
                                        />
                                        <Input
                                          type="number"
                                          value={item.amount}
                                          onChange={(e) => {
                                            setEditableQuoteItems(editableQuoteItems.map(i =>
                                              i.id === item.id ? { ...i, amount: Number(e.target.value) } : i
                                            ))
                                          }}
                                          className="w-32"
                                          placeholder="金額"
                                        />
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setEditingItemId(null)}
                                        >
                                          <Check className="h-4 w-4" />
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
                                                  setEditableQuoteItems(editableQuoteItems.map(i =>
                                                    i.id === item.id
                                                      ? {
                                                          ...i,
                                                          subitems: i.subitems?.map(s =>
                                                            s.id === subitem.id ? { ...s, visible: checked } : s
                                                          ),
                                                        }
                                                      : i
                                                  ))
                                                }}
                                              />
                                              {editingSubitemId?.itemId === item.id && editingSubitemId?.subitemId === subitem.id ? (
                                                <div className="flex gap-2 flex-1">
                                                  <Input
                                                    value={subitem.item}
                                                    onChange={(e) => {
                                                      setEditableQuoteItems(editableQuoteItems.map(i =>
                                                        i.id === item.id
                                                          ? {
                                                              ...i,
                                                              subitems: i.subitems?.map(s =>
                                                                s.id === subitem.id ? { ...s, item: e.target.value } : s
                                                              ),
                                                            }
                                                          : i
                                                      ))
                                                    }}
                                                    className="flex-1"
                                                    placeholder="サブ項目名"
                                                  />
                                                  <Input
                                                    type="number"
                                                    value={subitem.amount}
                                                    onChange={(e) => {
                                                      setEditableQuoteItems(editableQuoteItems.map(i =>
                                                        i.id === item.id
                                                          ? {
                                                              ...i,
                                                              subitems: i.subitems?.map(s =>
                                                                s.id === subitem.id ? { ...s, amount: Number(e.target.value) } : s
                                                              ),
                                                            }
                                                          : i
                                                      ))
                                                    }}
                                                    className="w-24"
                                                    placeholder="金額"
                                                  />
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setEditingSubitemId(null)}
                                                  >
                                                    <Check className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              ) : (
                                                <>
                                                  <span className={`flex-1 text-sm ${!subitem.visible ? "text-slate-400 line-through" : ""}`}>
                                                    {subitem.item}
                                                  </span>
                                                  <span className={`text-sm font-medium ${!subitem.visible ? "text-slate-400 line-through" : ""}`}>
                                                    ¥{subitem.amount.toLocaleString()}
                                                  </span>
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setEditingSubitemId({ itemId: item.id, subitemId: subitem.id })}
                                                  >
                                                    <Edit2 className="h-3 w-3" />
                                                  </Button>
                                                </>
                                              )}
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                  setEditableQuoteItems(editableQuoteItems.map(i =>
                                                    i.id === item.id
                                                      ? {
                                                          ...i,
                                                          subitems: i.subitems?.filter(s => s.id !== subitem.id),
                                                        }
                                                      : i
                                                  ))
                                                }}
                                              >
                                                <Trash2 className="h-3 w-3 text-red-500" />
                                              </Button>
                                            </div>
                                          ))}
                                          </>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="w-full mt-2"
                                          onClick={() => {
                                            const newSubitem = {
                                              id: `subitem-${Date.now()}`,
                                              item: "新しいサブ項目",
                                              amount: 0,
                                              visible: true,
                                            }
                                            setEditableQuoteItems(editableQuoteItems.map(i =>
                                              i.id === item.id
                                                ? {
                                                    ...i,
                                                    subitems: [...(i.subitems || []), newSubitem],
                                                  }
                                                : i
                                            ))
                                            setEditingSubitemId({ itemId: item.id, subitemId: newSubitem.id })
                                          }}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          サブ項目を追加
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <span className={`font-medium ${!item.visible ? "text-slate-400 line-through" : ""}`}>
                                          {item.item}
                                        </span>
                                        {item.subitems && item.subitems.length > 0 && (
                                          <div className="pl-4 mt-1 space-y-1">
                                            {item.subitems.map((subitem) => (
                                              <div key={subitem.id} className="flex items-center gap-2 text-sm">
                                                <Switch
                                                  checked={subitem.visible}
                                                  onCheckedChange={(checked) => {
                                                    setEditableQuoteItems(editableQuoteItems.map(i =>
                                                      i.id === item.id
                                                        ? {
                                                            ...i,
                                                            subitems: i.subitems?.map(s =>
                                                              s.id === subitem.id ? { ...s, visible: checked } : s
                                                            ),
                                                          }
                                                        : i
                                                    ))
                                                  }}
                                                />
                                                <span className={!subitem.visible ? "text-slate-400 line-through" : "text-slate-600"}>
                                                  {subitem.item}
                                                </span>
                                                <span className={!subitem.visible ? "text-slate-400 line-through" : "font-medium"}>
                                                  ¥{subitem.amount.toLocaleString()}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-lg font-bold ${!item.visible ? "text-slate-400 line-through" : "text-blue-600"}`}>
                                          ¥{item.amount.toLocaleString()}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setEditingItemId(item.id)}
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setEditableQuoteItems(editableQuoteItems.filter(i => i.id !== item.id))
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </div>
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

                    {/* 合計金額表示 */}
                    {editableQuoteItems.length > 0 && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">合計金額（税込）</span>
                          <span className="text-2xl font-bold text-blue-600">
                            ¥{editableQuoteItems
                              .filter(item => item.visible)
                              .reduce((sum, item) => {
                                const hasVisibleSubitems = item.subitems && item.subitems.some(sub => sub.visible)
                                if (hasVisibleSubitems) {
                                  // サブ項目がある場合は、サブ項目の合計のみを使用
                                  const subitemSum = item.subitems!
                                    .filter(sub => sub.visible)
                                    .reduce((s, sub) => s + sub.amount, 0)
                                  return sum + subitemSum
                                } else {
                                  // サブ項目がない場合は、親項目の金額を使用
                                  return sum + item.amount
                                }
                              }, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t pt-4 flex-shrink-0">
                  <Button variant="outline" onClick={() => setQuoteStep("recipient")}>
                    戻る
                  </Button>
                  <Button
                    onClick={() => {
                      // 編集された項目をquoteProjectDataに反映
                      const visibleItems = editableQuoteItems
                        .filter(item => item.visible)
                        .map(item => ({
                          item: item.item,
                          amount: item.amount,
                          subitems: item.subitems?.filter(sub => sub.visible).map(sub => ({
                            item: sub.item,
                            amount: sub.amount,
                          })),
                        }))
                      
                      const updatedQuoteData = {
                        ...quoteProjectData,
                        quoteItems: visibleItems,
                      }
                      setQuoteProjectData(updatedQuoteData)
                      
                      // 選択された商材に見積書生成フラグを設定
                      if (selectedProjectForQuote) {
                        const selectedProducts = selectedProjectForQuote.products.filter(p =>
                          selectedProductsForQuote.has(p.id as number)
                        )
                        selectedProducts.forEach(product => {
                          updateProject(product.id as number, {
                            ...product,
                            quoteGenerated: true,
                            quoteData: updatedQuoteData
                          } as any)
                        })
                      }
                      
                      setQuoteGenerated(true)
                      setQuoteStep("quote")
                    }}
                    disabled={editableQuoteItems.length === 0 || editableQuoteItems.filter(i => i.visible).length === 0}
                  >
                    次へ
                  </Button>
                </div>
              </div>

              {/* 見積プレビュー画面（3枚目） */}
              <div className="min-w-full flex-shrink-0 px-1 w-full h-full flex flex-col">
                <DialogHeader className="pb-4 pt-2 flex-shrink-0">
                  <DialogTitle>見積書プレビュー</DialogTitle>
                  <DialogDescription>
                    {selectedProjectForQuote && `案件No: ${selectedProjectForQuote.projectNumber} の見積書`}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4" style={{ maxHeight: 'calc(85vh - 250px)', minHeight: 0 }}>
                  {quoteGenerated && (
                    <>
                      {/* PDF Preview */}
                      <div className="bg-white border-2 border-slate-300 rounded-lg shadow-lg">
                        <div className="bg-slate-100 p-2 text-center text-xs text-slate-600 border-b border-slate-300 flex-shrink-0">
                          PDFプレビュー - quote_{selectedProjectForQuote?.projectNumber || "000"}.pdf
                        </div>
                        <div className="p-8 space-y-6">
                          <div className="text-center space-y-2 pb-6 border-b-2 border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-900">御見積書</h2>
                            <p className="text-sm text-slate-600">Quote No. {selectedProjectForQuote?.projectNumber || "000"}</p>
                            <p className="text-sm text-slate-600">発行日: {new Date().toLocaleDateString("ja-JP")}</p>
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <p className="text-lg font-bold text-slate-900">{quoteProjectData.clientName} 御中</p>
                              <p className="text-sm text-slate-600">下記の通りお見積もりいたします。</p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600">案件名:</span>
                                <span className="font-medium">{quoteProjectData.projectName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">開催日:</span>
                                <span className="font-medium">{quoteProjectData.date}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">会場:</span>
                                <span className="font-medium">{quoteProjectData.venue}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">担当営業:</span>
                                <span className="font-medium">{quoteProjectData.talent}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h3 className="font-bold text-slate-900">見積明細</h3>
                            <table className="w-full border border-slate-300">
                              <thead className="bg-slate-100">
                                <tr>
                                  <th className="text-left p-3 text-sm font-medium text-slate-700 border-b border-slate-300">
                                    項目
                                  </th>
                                  <th className="text-right p-3 text-sm font-medium text-slate-700 border-b border-slate-300">
                                    金額
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {quoteProjectData.quoteItems.map((item, idx) => (
                                  <>
                                    <tr key={idx} className="border-b border-slate-200">
                                      <td className="p-3 text-sm font-medium">{item.item}</td>
                                      <td className="p-3 text-sm text-right font-medium">¥{item.amount.toLocaleString()}</td>
                                    </tr>
                                    {item.subitems?.map((subitem: { item: string; amount: number }, subIdx: number) => (
                                      <tr key={`${idx}-${subIdx}`} className="border-b border-slate-100 bg-slate-50/50">
                                        <td className="p-2 pl-6 text-sm text-slate-600">{subitem.item}</td>
                                        <td className="p-2 text-sm text-right text-slate-600">
                                          ¥{subitem.amount.toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </>
                                ))}
                              </tbody>
                              <tfoot className="bg-slate-100 border-t-2 border-slate-400">
                                <tr>
                                  <td className="p-3 text-sm font-bold">合計金額（税込）</td>
                                  <td className="p-3 text-sm text-right font-bold text-blue-600 text-lg">
                                    ¥{(quoteProjectData.quoteItems?.reduce((sum, item) => sum + item.amount, 0) || 0).toLocaleString()}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>

                          <div className="pt-6 border-t border-slate-200 space-y-3 text-sm text-slate-600">
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">お支払い条件</p>
                              <p>- 請求書発行後30日以内にお支払いください</p>
                              <p>- 振込手数料は貴社ご負担でお願いいたします</p>
                            </div>
                            <div className="space-y-1 pt-4">
                              <p className="font-medium text-slate-900">発行元</p>
                              <p>DMM 株式会社</p>
                              <p>〒150-0001 東京都渋谷区神宮前1-1-1</p>
                              <p>TEL: 03-1234-5678 / Email: sales@dmm.co.jp</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
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

【案件概要】
案件名: ${quoteProjectData.projectName}
開催日: ${quoteProjectData.date}
会場: ${quoteProjectData.venue}
担当営業: ${quoteProjectData.talent}

ご不明な点がございましたら、お気軽にお問い合わせください。

DMM 営業部`
                      setQuoteProjectData({ ...quoteProjectData, emailDraft: email })
                      setEmailGenerated(true)
                      setQuoteStep("email")
                    }}
                  >
                    次へ
                  </Button>
                </div>
              </div>

              {/* メールプレビュー画面（3枚目） */}
              <div className="min-w-full flex-shrink-0 px-1 w-full h-full flex flex-col">
                <DialogHeader className="pb-4 pt-2">
                  <DialogTitle>メール送付</DialogTitle>
                  <DialogDescription>
                    {selectedProjectForQuote && `案件No: ${selectedProjectForQuote.projectNumber} の見積書を送付します`}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                  {isLoadingSend && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-6 shadow-xl">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm font-medium text-slate-700">見積書を送付中...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {emailGenerated && (
                    <>
                      <div className="bg-white border-2 border-slate-300 rounded-lg shadow-lg p-4">
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">送付メール文面</Label>
                        <Textarea
                          value={quoteProjectData.emailDraft}
                          onChange={(e) => setQuoteProjectData({ ...quoteProjectData, emailDraft: e.target.value })}
                          rows={16}
                          className="font-mono text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline" onClick={() => setQuoteStep("quote")}>
                    戻る
                  </Button>
                  <Button
                    onClick={() => {
                      setIsLoadingSend(true)
                      setTimeout(() => {
                        // 選択された商材のステータスを「見積送付完了」に更新
                        if (selectedProjectForQuote && selectedProductsForQuote.size > 0) {
                          selectedProjectForQuote.products
                            .filter(p => selectedProductsForQuote.has(p.id as number))
                            .forEach(product => {
                              updateProject(product.id as number, {
                                ...product,
                                projectStatus: "見積送付完了"
                              } as any)
                            })
                        }
                        
                        setIsLoadingSend(false)
                        setIsQuoteModalOpen(false)
                        setQuoteStep("select")
                        setQuoteGenerated(false)
                        setEmailGenerated(false)
                        addNotification("見積書を送付しました")
                      }, 500)
                    }}
                    className="gap-2"
                    disabled={!emailGenerated}
                  >
                    <Send className="h-4 w-4" />
                    見積書送付
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

