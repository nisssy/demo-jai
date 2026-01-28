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
import type { ProjectData } from "@/types/project"
import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { useProject } from "@/contexts/project-context"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectItem, ProjectListProps, ValidationResult } from "@/features/project-list/model/types"
import type { DemoProject } from "@/lib/demo-db/types"
import { generateQuotePDF } from "@/features/project-list/lib/quote"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ValidationDialog } from "@/features/project-list/ui/modals/validation-dialog"
import { PrDialog } from "@/features/project-list/ui/modals/pr-dialog"
import { CostDialog } from "@/features/project-list/ui/modals/cost-dialog"
import { DataCollectionDialog } from "@/features/project-list/ui/modals/data-collection-dialog"
import { DataExportDialog } from "@/features/project-list/ui/modals/data-export-dialog"
import { QuoteDialog } from "@/features/project-list/ui/modals/quote-dialog"
import { OrderConfirmDialog } from "@/features/project-list/ui/modals/order-confirm-dialog"
import { ProjectProductCard } from "@/features/project-list/ui/components/project-product-card"
import { ProjectAlertCard } from "@/features/project-list/ui/components/project-alert-card"
import { ProjectListFilters } from "@/features/project-list/ui/components/project-list-filters"

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
  const router = useAppRouter()
  const { getProjects, getProducts, updateProduct, getHalls, searchHalls, searchCompanies, getCompanyByCompanyId, searchEmployees, getEmployeeById } = useProject()
  const allProjects = getProjects()
  const allProducts = getProducts()
  const [activeTab, setActiveTab] = useState<"projects" | "corrections" | "temporaryHoldFailure">(initialTab as "projects" | "corrections" | "temporaryHoldFailure")
  
  // initialTabが変更されたときにactiveTabを更新
  useEffect(() => {
    setActiveTab(initialTab as "projects" | "corrections" | "temporaryHoldFailure")
  }, [initialTab])
  
  // ユーティリティ: 商材を案件Noでグループ化
  const groupProductsByProjectNumber = useCallback((products: DemoProject[]) => {
    const grouped: Record<string, DemoProject[]> = {}
    products.forEach((p) => {
      const pn = p.projectNumber || "未分類"
      if (!grouped[pn]) grouped[pn] = []
      grouped[pn].push(p)
    })
    return grouped
  }, [])
  
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchType, setSearchType] = useState<"hall" | "company">("company")
  const [selectedHallName, setSelectedHallName] = useState<string | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [searchProjectNumber, setSearchProjectNumber] = useState("")
  const [searchProjectName, setSearchProjectName] = useState("")
  const [selectedSalesPersonId, setSelectedSalesPersonId] = useState<number | null>(1) // デフォルトでid=1を選択
  const [salesPersonSearchOpen, setSalesPersonSearchOpen] = useState(false)
  const [salesPersonSearchQuery, setSalesPersonSearchQuery] = useState("")
  const [searchDateMode, setSearchDateMode] = useState<"execution" | "created">("execution")
  const [searchDateFrom, setSearchDateFrom] = useState("")
  const [searchDateTo, setSearchDateTo] = useState("")
  const [searchCategory, setSearchCategory] = useState<string | null>(null)
  const [searchEventType, setSearchEventType] = useState<string | null>(null)
  const [eventTypeSearchOpen, setEventTypeSearchOpen] = useState(false)
  const [eventTypeSearchQuery, setEventTypeSearchQuery] = useState("")
  
  const parseDate = useCallback((raw?: string | null): Date | null => {
    if (!raw) return null
    const s = String(raw).trim()
    if (!s) return null
    const normalized = s.replace(/-/g, "/")
    const [y, m, d] = normalized.split("/").map(Number)
    if (!y || !m || !d) return null
    const dt = new Date(y, m - 1, d)
    if (Number.isNaN(dt.getTime())) return null
    dt.setHours(0, 0, 0, 0)
    return dt
  }, [])

  const inRange = useCallback(
    (dt: Date | null) => {
      if (!dt) return false
      const from = parseDate(searchDateFrom)
      const to = parseDate(searchDateTo)
      if (from && dt < from) return false
      if (to && dt > to) return false
      return true
    },
    [parseDate, searchDateFrom, searchDateTo],
  )
  
  // 案件一覧が空になるケース（移行途中/データ不整合）に備え、ProductsからProjectを合成するフォールバック
  const synthesizedProjectsFromProducts = useMemo(() => {
    const byPn = new Map<string, (typeof allProjects)[number]>()
    allProducts.forEach((prod) => {
      const pn = String(prod.projectNumber || "")
      if (!pn) return
      if (byPn.has(pn)) return
      byPn.set(pn, {
        id: -1,
        projectNumber: pn,
        projectName: prod.projectName,
        companyId: prod.companyId,
        companyName: prod.companyName,
        hallName: prod.hallName,
        hallCode: prod.hallId,
        salesPersonName: prod.salesPersonName,
        requestDate: prod.requestDate,
      } as any)
    })
    return Array.from(byPn.values())
  }, [allProducts, allProjects])

  const projectsForList = allProjects.length > 0 ? allProjects : synthesizedProjectsFromProducts

  // 案件(Project)を案件Noの降順でソート
  const sortedProjects = useMemo(() => {
    return [...projectsForList].sort((a, b) => {
      const projectNumberA = parseInt(String(a.projectNumber || "0"))
      const projectNumberB = parseInt(String(b.projectNumber || "0"))
      return projectNumberB - projectNumberA
    })
  }, [projectsForList])

  // 案件側の検索条件（ホール/法人/案件No/案件名/担当営業/作成日・実施日）でフィルタ
  const eligibleProjects = useMemo(() => {
    return sortedProjects.filter((p) => {
      if (selectedHallName) {
        const hallName = String(p.hallName || p.clientName || "")
        if (hallName !== selectedHallName) return false
      }
      if (selectedCompanyId) {
        const companyId = String(p.companyId || "")
        if (companyId !== selectedCompanyId) return false
      }
      if (searchProjectNumber) {
        const pn = String(p.projectNumber || "")
        if (!pn.includes(searchProjectNumber)) return false
      }
      if (searchProjectName) {
        const name = String(p.projectName || "")
        if (!name.toLowerCase().includes(searchProjectName.toLowerCase())) return false
      }
      if (selectedSalesPersonId) {
        const selectedEmployee = getEmployeeById(selectedSalesPersonId)
        if (selectedEmployee) {
          const sp = String(p.salesPersonName || "")
          if (sp !== selectedEmployee.name) return false
        }
      }
      if (searchDateFrom || searchDateTo) {
        if (searchDateMode === "created") {
          const dt = parseDate((p as any).createdAt)
          if (!inRange(dt)) return false
        } else {
          // 実施日: 同一案件Noの商材の実施日(eventDate/date)のいずれかが範囲内
          const pn = String(p.projectNumber || "")
          const anyHit = allProducts
            .filter((prod) => String(prod.projectNumber || "") === pn)
            .some((prod) => inRange(parseDate(prod.eventDate || prod.date)))
          if (!anyHit) return false
        }
      }
      return true
    })
  }, [
    allProducts,
    inRange,
    parseDate,
    searchDateFrom,
    searchDateMode,
    searchDateTo,
    searchProjectName,
    searchProjectNumber,
    selectedSalesPersonId,
    selectedCompanyId,
    getEmployeeById,
    selectedHallName,
    sortedProjects,
  ])

  const eligibleProjectNumbers = useMemo(() => new Set(eligibleProjects.map((p) => p.projectNumber)), [eligibleProjects])

  // タブ共通: 商材側の検索条件（カテゴリ/イベント区分）でフィルタ
  const filteredProductsBase = useMemo(() => {
    return allProducts.filter((prod) => {
      const pn = prod.projectNumber || ""
      if (!eligibleProjectNumbers.has(pn)) return false
      if (searchCategory) {
        if (String(prod.category || "") !== searchCategory) return false
      }
      if (searchEventType) {
        if (String(prod.eventType || "") !== searchEventType) return false
      }
      return true
    })
  }, [allProducts, eligibleProjectNumbers, searchCategory, searchEventType])

  const productsByProjectNumberProjectsTab = useMemo(() => {
    return groupProductsByProjectNumber(filteredProductsBase)
  }, [filteredProductsBase, groupProductsByProjectNumber])

  const productsByProjectNumberCorrectionsTab = useMemo(() => {
    return groupProductsByProjectNumber(filteredProductsBase.filter((p) => p.projectStatus === "営業修正中"))
  }, [filteredProductsBase, groupProductsByProjectNumber])

  const productsByProjectNumberTemporaryHoldFailureTab = useMemo(() => {
    return groupProductsByProjectNumber(
      filteredProductsBase.filter((p) => p.projectStatus === "営業確認中" && !!p.temporaryHoldFailureComment),
    )
  }, [filteredProductsBase, groupProductsByProjectNumber])

  const correctionRequestsCount = useMemo(() => {
    return Object.values(productsByProjectNumberCorrectionsTab).reduce((sum, arr) => sum + arr.length, 0)
  }, [productsByProjectNumberCorrectionsTab])

  const temporaryHoldFailureRequestsCount = useMemo(() => {
    return Object.values(productsByProjectNumberTemporaryHoldFailureTab).reduce((sum, arr) => sum + arr.length, 0)
  }, [productsByProjectNumberTemporaryHoldFailureTab])

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
  const [isLoadingNotify, setIsLoadingNotify] = useState(false)

  const [isPRModalOpen, setIsPRModalOpen] = useState(false)
  const [isCostModalOpen, setIsCostModalOpen] = useState(false)
  const [selectedModalProject, setSelectedModalProject] = useState<(typeof allProducts)[0] | null>(null)

  const [prGenerated, setPrGenerated] = useState(false)
  const [prText, setPrText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const [costsAutoFilled, setCostsAutoFilled] = useState(false)

  // 見積書作成モーダル関連
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [selectedProjectForQuote, setSelectedProjectForQuote] = useState<{ projectNumber: string; products: DemoProject[] } | null>(null)
  // 見積モーダルの内部状態は QuoteDialog 側に寄せる

  // 見積モーダルのclose/resetは QuoteDialog 側の onRequestClose で統一
  const [costs, setCosts] = useState([
    { item: "コンパニオン出演料", amount: "" },
    { item: "交通費", amount: "" },
    { item: "宿泊費", amount: "" },
    { item: "PR広告費", amount: "" },
  ])

  const [showDataCollectionModal, setShowDataCollectionModal] = useState(false)
  const [showDataExportModal, setShowDataExportModal] = useState(false)

  const handleStatusToggle = (project: ProjectItem, checked: boolean) => {
    if (checked) {
      setSelectedProject(project)
      setIsModalOpen(true)
    } else {
      // 仮想DBで案件を更新
      if (typeof project.id === 'number') {
        updateProduct(project.id, { status: "proposed" })
      }
    }
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
        errors.push("実施日が会場の定休日と重複しています")
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
        errors.push("実施日が未設定です")
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

  const handleOpenPRModal = (project: (typeof allProducts)[0]) => {
    setSelectedModalProject(project)
    setIsPRModalOpen(true)
  }

  const handleOpenCostModal = (project: (typeof allProducts)[0]) => {
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

  const handleOpenDataExportModal = (proj: ProjectItem) => {
    setSelectedProject(proj)
    setShowDataExportModal(true)
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
      case "本押さえ依頼":
        return <Badge className="bg-purple-600 text-white">本押さえ依頼</Badge>
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
              {correctionRequestsCount > 0 && (
                <Badge className="ml-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">{correctionRequestsCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="temporaryHoldFailure"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
            >
              仮押さえ不可
              {temporaryHoldFailureRequestsCount > 0 && (
                <Badge className="ml-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">{temporaryHoldFailureRequestsCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <button
            onClick={onCreateNewProject}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            新規案件作成
          </button>
          </div>
        </div>

        <TabsContent value="projects" className="mt-0">
          <ProjectListFilters
            searchProjectNumber={searchProjectNumber}
            onSearchProjectNumberChange={setSearchProjectNumber}
            searchProjectName={searchProjectName}
            onSearchProjectNameChange={setSearchProjectName}
            selectedSalesPersonId={selectedSalesPersonId}
            onSelectedSalesPersonIdChange={setSelectedSalesPersonId}
            salesPersonSearchOpen={salesPersonSearchOpen}
            onSalesPersonSearchOpenChange={setSalesPersonSearchOpen}
            salesPersonSearchQuery={salesPersonSearchQuery}
            onSalesPersonSearchQueryChange={setSalesPersonSearchQuery}
            searchEmployees={searchEmployees}
            getEmployeeById={getEmployeeById}
            searchDateMode={searchDateMode}
            onSearchDateModeChange={setSearchDateMode}
            searchDateFrom={searchDateFrom}
            onSearchDateFromChange={setSearchDateFrom}
            searchDateTo={searchDateTo}
            onSearchDateToChange={setSearchDateTo}
            searchCategory={searchCategory}
            onSearchCategoryChange={setSearchCategory}
            searchEventType={searchEventType}
            onSearchEventTypeChange={setSearchEventType}
            eventTypeSearchOpen={eventTypeSearchOpen}
            onEventTypeSearchOpenChange={setEventTypeSearchOpen}
            eventTypeSearchQuery={eventTypeSearchQuery}
            onEventTypeSearchQueryChange={setEventTypeSearchQuery}
            searchOpen={searchOpen}
            onSearchOpenChange={setSearchOpen}
            searchType={searchType}
            onSearchTypeChange={setSearchType}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            selectedHallName={selectedHallName}
            onSelectedHallNameChange={setSelectedHallName}
            selectedCompanyId={selectedCompanyId}
            onSelectedCompanyIdChange={setSelectedCompanyId}
            searchHalls={searchHalls}
            searchCompanies={searchCompanies}
            getCompanyByCompanyId={getCompanyByCompanyId}
          />

      {Object.keys(productsByProjectNumberProjectsTab).length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {(searchProjectNumber || searchProjectName || searchSalesPersonName || searchDateFrom || searchDateTo || searchCategory || searchEventType || selectedHallName || selectedCompanyId) 
            ? "検索結果が見つかりませんでした" 
            : "案件がありません"}
        </div>
      ) : (
      <div className="space-y-6">
        {eligibleProjects
          .filter((p) => (productsByProjectNumberProjectsTab[p.projectNumber]?.length ?? 0) > 0)
          .map((p) => {
          const projectNumber = p.projectNumber
          const projectProducts = productsByProjectNumberProjectsTab[projectNumber] ?? []
          const firstProduct = projectProducts[0]
          const hallName = p.hallName || p.clientName || firstProduct?.hallName || firstProduct?.clientName || "未分類"
          const salesPersonName = p.salesPersonName || firstProduct?.salesPersonName || "-"
          const requestDate = p.requestDate || firstProduct?.requestDate || "-"
          const companyName = p.companyName || firstProduct?.companyName || "-"
          const companyId = p.companyId || firstProduct?.companyId || "-"
          const hallId = p.hallCode || firstProduct?.hallId || "-"
          const projectName = p.projectName || firstProduct?.projectName || "-"
          
          return (
            <Card key={projectNumber} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* 案件ヘッダー */}
                <div className="mb-4 pb-4 border-b-2 border-slate-300">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex flex-col gap-1">
                        <h2 className="text-3xl font-bold text-slate-900 whitespace-nowrap">{projectName}</h2>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-600 whitespace-nowrap">案件No: {projectNumber}</span>
                          <Badge variant="outline" className="whitespace-nowrap">
                        {projectProducts.length}件の商材
                      </Badge>
                        </div>
                      </div>
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
                        <span>ホール名: <span className="font-medium text-slate-900">{String(hallName ?? "-")}</span></span>
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
                        onClick={() => router.push(`/project-number/${projectNumber}/edit`)}
                        variant="outline"
                        className="gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        案件を編集
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedProjectForQuote({ projectNumber, products: projectProducts })
                          setIsQuoteModalOpen(true)
                        }}
                        variant="outline"
                        className="gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        見積書作成
                      </Button>
                      {/* 見積書が生成されている場合はダウンロードボタンを表示 */}
                      {projectProducts.some((p) => p.quoteGenerated) && (
                        <Button
                          onClick={() => {
                            // 見積書PDFをダウンロード
                            const quoteData = projectProducts.find((p) => p.quoteGenerated)
                            const quoteProjectData = quoteData?.quoteData
                            if (quoteProjectData) {
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
                        onClick={() => router.push(`/project/${firstProduct.id}?addProduct=true`)}
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
                  {projectProducts.map((project) => {
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
                      hallName: project.hallName,
                      hallId: project.hallId,
                      companyId: project.companyId,
                      companyName: project.companyName,
                      projectStatus: project.projectStatus,
                      category: project.category,
                      eventType: project.eventType,
                      eventProductName: project.eventProductName,
                      eventDate: project.eventDate,
                    }
                    
                    return (
                      <ProjectProductCard
                        key={project.id}
                        project={project}
                        projectItem={projectItem}
                        statusBadge={getStatusBadge(projectItem.projectStatus)}
                        onClick={() => {
                          // 営業修正中の場合は修正画面に遷移、それ以外は通常の編集画面に遷移
                          if (projectItem.projectStatus === "営業修正中") {
                            router.push(`/project/${project.id}/correction`)
                          } else {
                            router.push(`/project/${project.id}`)
                          }
                        }}
                        onToggleStatus={(checked) => handleStatusToggle(projectItem, checked)}
                      />
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      )}

      <OrderConfirmDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        project={selectedProject}
        getStatusBadge={getStatusBadge}
        projectData={projectData}
        setProjectData={setProjectData}
        updateProduct={updateProduct}
        addNotification={addNotification}
      />
      <ValidationDialog
        open={isValidationModalOpen}
        onOpenChange={setIsValidationModalOpen}
        validationProject={validationProject}
        isValidating={isValidating}
        validationResult={validationResult}
        correctionMessage={correctionMessage}
        onCorrectionMessageChange={setCorrectionMessage}
        onGenerateCorrection={handleGenerateCorrection}
        correctionFormData={correctionFormData}
        onCorrectionFormDataChange={setCorrectionFormData}
        onSubmitCorrection={handleSubmitCorrection}
        onNotifyInternal={handleNotifyInternal}
      />

      <PrDialog
        open={isPRModalOpen}
        onOpenChange={setIsPRModalOpen}
        project={selectedModalProject}
        onGenerate={handleGeneratePR}
        isGenerating={isGenerating}
        generated={prGenerated}
        text={prText}
        onTextChange={setPrText}
      />

      <CostDialog
        open={isCostModalOpen}
        onOpenChange={setIsCostModalOpen}
        project={selectedModalProject}
        costs={costs}
        onCostsChange={setCosts}
        onAutoFill={handleAutoFillCosts}
        autoFilled={costsAutoFilled}
        onSave={() => addNotification?.("コスト情報を保存しました")}
      />

      <DataCollectionDialog
        open={showDataCollectionModal}
        onOpenChange={setShowDataCollectionModal}
        project={selectedProject}
      />

      <DataExportDialog open={showDataExportModal} onOpenChange={setShowDataExportModal} project={selectedProject} />
        </TabsContent>

        <TabsContent value="corrections" className="mt-0">
          {/* 修正依頼一覧 */}
          {correctionRequestsCount === 0 ? (
            <div className="text-center py-12 text-slate-500">
              修正依頼はありません
            </div>
          ) : (
            <div className="space-y-6">
              {eligibleProjects
                .filter((p) => (productsByProjectNumberCorrectionsTab[p.projectNumber]?.length ?? 0) > 0)
                .map((p) => {
                  const projectNumber = p.projectNumber
                  const projectProducts = productsByProjectNumberCorrectionsTab[projectNumber] ?? []
                  const firstProduct = projectProducts[0]

                  const hallName = p.hallName || p.clientName || firstProduct?.hallName || firstProduct?.clientName || "未分類"
                  const salesPersonName = p.salesPersonName || firstProduct?.salesPersonName || "-"
                  const requestDate = p.requestDate || firstProduct?.requestDate || "-"
                  const companyName = p.companyName || firstProduct?.companyName || "-"
                  const companyId = p.companyId || firstProduct?.companyId || "-"
                  const hallId = p.hallCode || firstProduct?.hallId || "-"
                  const projectName = p.projectName || firstProduct?.projectName || "-"

                  return (
                    <Card key={projectNumber} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="mb-4 pb-4 border-b-2 border-slate-300">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="flex flex-col gap-1">
                                <h2 className="text-3xl font-bold text-slate-900 whitespace-nowrap">{projectName}</h2>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-slate-600 whitespace-nowrap">案件No: {projectNumber}</span>
                                  <Badge variant="outline" className="whitespace-nowrap">
                                    {projectProducts.length}件の修正対象商材
                                  </Badge>
                                </div>
                              </div>
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
                                <span>ホール名: <span className="font-medium text-slate-900">{String(hallName ?? "-")}</span></span>
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
                                onClick={() => router.push(`/project-number/${projectNumber}/edit`)}
                                variant="outline"
                                className="gap-2"
                              >
                                <Edit2 className="h-4 w-4" />
                                案件を編集
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {projectProducts.map((project) => {
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
                  hallName: project.hallName,
                  hallId: project.hallId,
                  companyId: project.companyId,
                  companyName: project.companyName,
                  projectStatus: project.projectStatus,
                  category: project.category,
                  eventType: project.eventType,
                  eventProductName: project.eventProductName,
                  eventDate: project.eventDate,
                }
                const correctionRequest = project.correctionRequest || ""
                return (
                  <ProjectAlertCard
                    key={project.id}
                    project={project}
                    projectItem={projectItem}
                    statusBadge={getStatusBadge(projectItem.projectStatus)}
                    alertTitle="修正依頼内容"
                    alertText={correctionRequest}
                    actionLabel="修正"
                    onAction={() => router.push(`/project/${project.id}/correction?tab=corrections`)}
                  />
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="temporaryHoldFailure" className="mt-0">
          {/* 仮押さえ不可一覧 */}
          {temporaryHoldFailureRequestsCount === 0 ? (
            <div className="text-center py-12 text-slate-500">
              仮押さえ不可の通知はありません
            </div>
          ) : (
            <div className="space-y-6">
              {eligibleProjects
                .filter((p) => (productsByProjectNumberTemporaryHoldFailureTab[p.projectNumber]?.length ?? 0) > 0)
                .map((p) => {
                  const projectNumber = p.projectNumber
                  const projectProducts = productsByProjectNumberTemporaryHoldFailureTab[projectNumber] ?? []
                  const firstProduct = projectProducts[0]

                  const hallName = p.hallName || p.clientName || firstProduct?.hallName || firstProduct?.clientName || "未分類"
                  const salesPersonName = p.salesPersonName || firstProduct?.salesPersonName || "-"
                  const requestDate = p.requestDate || firstProduct?.requestDate || "-"
                  const companyName = p.companyName || firstProduct?.companyName || "-"
                  const companyId = p.companyId || firstProduct?.companyId || "-"
                  const hallId = p.hallCode || firstProduct?.hallId || "-"
                  const projectName = p.projectName || firstProduct?.projectName || "-"

                  return (
                    <Card key={projectNumber} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="mb-4 pb-4 border-b-2 border-slate-300">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="flex flex-col gap-1">
                                <h2 className="text-3xl font-bold text-slate-900 whitespace-nowrap">{projectName}</h2>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-slate-600 whitespace-nowrap">案件No: {projectNumber}</span>
                                  <Badge variant="outline" className="whitespace-nowrap">
                                    {projectProducts.length}件の仮押さえ不可商材
                                  </Badge>
                                </div>
                              </div>
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
                                <span>ホール名: <span className="font-medium text-slate-900">{String(hallName ?? "-")}</span></span>
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
                                onClick={() => router.push(`/project-number/${projectNumber}/edit`)}
                                variant="outline"
                                className="gap-2"
                              >
                                <Edit2 className="h-4 w-4" />
                                案件を編集
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {projectProducts.map((project) => {
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
                  hallName: project.hallName,
                  hallId: project.hallId,
                  companyId: project.companyId,
                  companyName: project.companyName,
                  projectStatus: project.projectStatus,
                  category: project.category,
                  eventType: project.eventType,
                  eventProductName: project.eventProductName,
                  eventDate: project.eventDate,
                }
                const temporaryHoldFailureComment = project.temporaryHoldFailureComment || ""
                return (
                  <ProjectAlertCard
                    key={project.id}
                    project={project}
                    projectItem={projectItem}
                    statusBadge={getStatusBadge(projectItem.projectStatus)}
                    alertTitle="仮押さえ不可の理由"
                    alertText={temporaryHoldFailureComment}
                    actionLabel="編集"
                    actionIcon={<Edit2 className="h-4 w-4" />}
                    onAction={() => router.push(`/project/${project.id}`)}
                  />
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 見積書作成モーダル */}
      <QuoteDialog
        open={isQuoteModalOpen}
        onOpenChange={(open) => {
          setIsQuoteModalOpen(open)
          if (!open) setSelectedProjectForQuote(null)
        }}
        project={selectedProjectForQuote}
        onRequestClose={() => {
          setIsQuoteModalOpen(false)
            setSelectedProjectForQuote(null)
        }}
        updateProduct={updateProduct}
        addNotification={addNotification}
      />
                            </div>
                          )
}

