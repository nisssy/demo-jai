"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { ProjectData, Role } from "@/types/project"
import { useProject } from "@/contexts/project-context"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectItem, ValidationResult } from "@/features/project-list/model/types"
import type { DemoProject } from "@/lib/demo-db/types"
import { generateQuotePDF } from "@/features/project-list/lib/quote"

export type ProjectListTab = "projects" | "corrections" | "temporaryHoldFailure"

export type UseProjectListArgs = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onNext: () => void
  onBack: () => void
  addNotification?: (message: string) => void
  role: Role
  setCurrentScreen?: (screen: number) => void
  onCreateNewProject: () => void
  initialTab?: ProjectListTab
}

export function useProjectList({
  projectData,
  setProjectData,
  onNext,
  onBack,
  addNotification,
  role,
  setCurrentScreen,
  onCreateNewProject,
  initialTab = "projects",
}: UseProjectListArgs) {
  const router = useAppRouter()
  const searchParams = useSearchParams()
  const {
    getProjects,
    getProducts,
    updateProduct,
    searchHalls,
    searchCompanies,
    getCompanyByCompanyId,
    searchEmployees,
    getEmployeeById,
  } = useProject()

  const allProjects = getProjects()
  const allProducts = getProducts()

  const [activeTab, setActiveTab] = useState<ProjectListTab>(initialTab)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

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
  const [selectedSalesPersonId, setSelectedSalesPersonId] = useState<number | null>(1) // デフォルト: 山田 太郎
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

  const sortedProjects = useMemo(() => {
    return [...projectsForList].sort((a, b) => {
      const projectNumberA = Number.parseInt(String(a.projectNumber || "0"))
      const projectNumberB = Number.parseInt(String(b.projectNumber || "0"))
      return projectNumberB - projectNumberA
    })
  }, [projectsForList])

  const eligibleProjects = useMemo(() => {
    return sortedProjects.filter((p) => {
      if (selectedHallName) {
        const hallName = String(p.hallName || (p as any).clientName || "")
        if (hallName !== selectedHallName) return false
      }
      if (selectedCompanyId) {
        const companyId = String((p as any).companyId || "")
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
          const sp = String((p as any).salesPersonName || "")
          if (sp !== selectedEmployee.name) return false
        }
      }
      if (searchDateFrom || searchDateTo) {
        if (searchDateMode === "created") {
          const dt = parseDate((p as any).createdAt)
          if (!inRange(dt)) return false
        } else {
          const pn = String(p.projectNumber || "")
          const anyHit = allProducts
            .filter((prod) => String(prod.projectNumber || "") === pn)
            .some((prod) => inRange(parseDate((prod as any).eventDate || (prod as any).date)))
          if (!anyHit) return false
        }
      }
      return true
    })
  }, [
    allProducts,
    getEmployeeById,
    inRange,
    parseDate,
    searchDateFrom,
    searchDateMode,
    searchDateTo,
    searchProjectName,
    searchProjectNumber,
    selectedCompanyId,
    selectedHallName,
    selectedSalesPersonId,
    sortedProjects,
  ])

  const eligibleProjectNumbers = useMemo(() => new Set(eligibleProjects.map((p) => p.projectNumber)), [eligibleProjects])

  const filteredProductsBase = useMemo(() => {
    return allProducts.filter((prod) => {
      const pn = prod.projectNumber || ""
      if (!eligibleProjectNumbers.has(pn)) return false
      if (searchCategory) {
        if (String((prod as any).category || "") !== searchCategory) return false
      }
      if (searchEventType) {
        if (String((prod as any).eventType || "") !== searchEventType) return false
      }
      return true
    })
  }, [allProducts, eligibleProjectNumbers, searchCategory, searchEventType])

  const productsByProjectNumberProjectsTab = useMemo(() => {
    return groupProductsByProjectNumber(filteredProductsBase)
  }, [filteredProductsBase, groupProductsByProjectNumber])

  const productsByProjectNumberCorrectionsTab = useMemo(() => {
    return groupProductsByProjectNumber(filteredProductsBase.filter((p) => (p as any).projectStatus === "営業修正中"))
  }, [filteredProductsBase, groupProductsByProjectNumber])

  const productsByProjectNumberTemporaryHoldFailureTab = useMemo(() => {
    return groupProductsByProjectNumber(
      filteredProductsBase.filter((p) => (p as any).projectStatus === "営業確認中" && !!(p as any).temporaryHoldFailureComment),
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
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [selectedProjectForQuote, setSelectedProjectForQuote] = useState<{ projectNumber: string; products: DemoProject[] } | null>(
    null,
  )

  const [costs, setCosts] = useState([
    { item: "コンパニオン出演料", amount: "" },
    { item: "交通費", amount: "" },
    { item: "宿泊費", amount: "" },
    { item: "PR広告費", amount: "" },
  ])

  const [showDataCollectionModal, setShowDataCollectionModal] = useState(false)
  const [showDataExportModal, setShowDataExportModal] = useState(false)

  const handleStatusToggle = useCallback(
    (project: ProjectItem, checked: boolean) => {
      if (checked) {
        setSelectedProject(project)
        setIsModalOpen(true)
        return
      }
      if (typeof project.id === "number") {
        updateProduct(project.id, { status: "proposed" } as any)
      }
    },
    [updateProduct],
  )

  const handleGenerateCorrection = useCallback(() => {
    if (!validationResult) return
    const message = `お疲れ様です。以下の項目について修正をお願いします。

${validationResult.errors.map((error, idx) => `${idx + 1}. ${error}`).join("\n")}

ご確認のほど、よろしくお願いいたします。

Co・Dir担当`
    setCorrectionMessage(message)
  }, [validationResult])

  const handleSubmitCorrection = useCallback(() => {
    if (!validationProject) return
    setIsValidating(true)
    setValidationResult(null)
    setTimeout(() => {
      setValidationResult({ isValid: true, errors: [] })
      setIsValidating(false)
    }, 1500)
  }, [validationProject])

  const handleNotifyInternal = useCallback(() => {
    if (!validationProject) return
    setIsLoadingNotify(true)
    setTimeout(() => {
      setIsLoadingNotify(false)
      setIsValidationModalOpen(false)
      setValidationProject(null)
      setValidationResult(null)
      onNext()
    }, 500)
  }, [onNext, validationProject])

  const handleProceedToArrangement = useCallback(
    (project: ProjectItem) => {
      setProjectData({
        ...projectData,
        projectName: project.projectName,
        clientName: project.clientName,
        date: project.date,
        venue: project.venue,
        talent: project.talent,
      })
      onNext()
    },
    [onNext, projectData, setProjectData],
  )

  const handleOpenPRModal = useCallback((project: (typeof allProducts)[0]) => {
    setSelectedModalProject(project)
    setIsPRModalOpen(true)
  }, [allProducts])

  const handleOpenCostModal = useCallback((project: (typeof allProducts)[0]) => {
    setSelectedModalProject(project)
    setIsCostModalOpen(true)
  }, [allProducts])

  const handleGeneratePR = useCallback(() => {
    setIsGenerating(true)
    setTimeout(() => {
      const storeName = (selectedModalProject as any)?.venue || "〇〇店"
      const eventDate = (selectedModalProject as any)?.date
        ? new Date((selectedModalProject as any).date).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })
        : "近日"
      setPrText(
        `明日${eventDate}、${storeName}にて${(selectedModalProject as any)?.talent || "人気コンパニオン"}が登場！皆様のご来店をお待ちしております🎉 #パチンコ #新台入替 #コンパニオンイベント`,
      )
      setPrGenerated(true)
      setIsGenerating(false)
    }, 800)
  }, [selectedModalProject])

  const handleAutoFillCosts = useCallback(() => {
    setCosts([
      { item: "コンパニオン出演料", amount: "150000" },
      { item: "交通費", amount: "25000" },
      { item: "宿泊費", amount: "18000" },
      { item: "PR広告費", amount: "50000" },
    ])
    setCostsAutoFilled(true)
  }, [])

  const handleOpenDataCollectionModal = useCallback((proj: ProjectItem) => {
    setSelectedProject(proj)
    setShowDataCollectionModal(true)
  }, [])

  const handleOpenDataExportModal = useCallback((proj: ProjectItem) => {
    setSelectedProject(proj)
    setShowDataExportModal(true)
  }, [])

  const handleOpenQuoteModal = useCallback((projectNumber: string, products: DemoProject[]) => {
    setSelectedProjectForQuote({ projectNumber, products })
    setIsQuoteModalOpen(true)
  }, [])

  const handleDownloadQuotePdf = useCallback((projectNumber: string, products: DemoProject[]) => {
    const quoteData = products.find((p) => (p as any).quoteGenerated)
    const quoteProjectData = (quoteData as any)?.quoteData
    if (!quoteProjectData) return
    const pdfContent = generateQuotePDF(quoteProjectData, projectNumber)
    const blob = new Blob([pdfContent], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quote_${projectNumber}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  // タブ変更時にURLを更新する関数
  const handleActiveTabChange = useCallback((tab: ProjectListTab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("tab", tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  return {
    router,
    updateProduct,

    activeTab,
    setActiveTab: handleActiveTabChange,

    allProducts,
    eligibleProjects,
    productsByProjectNumberProjectsTab,
    productsByProjectNumberCorrectionsTab,
    productsByProjectNumberTemporaryHoldFailureTab,
    correctionRequestsCount,
    temporaryHoldFailureRequestsCount,

    searchProjectNumber,
    setSearchProjectNumber,
    searchProjectName,
    setSearchProjectName,
    selectedSalesPersonId,
    setSelectedSalesPersonId,
    salesPersonSearchOpen,
    setSalesPersonSearchOpen,
    salesPersonSearchQuery,
    setSalesPersonSearchQuery,
    searchEmployees,
    getEmployeeById,

    searchDateMode,
    setSearchDateMode,
    searchDateFrom,
    setSearchDateFrom,
    searchDateTo,
    setSearchDateTo,
    searchCategory,
    setSearchCategory,
    searchEventType,
    setSearchEventType,
    eventTypeSearchOpen,
    setEventTypeSearchOpen,
    eventTypeSearchQuery,
    setEventTypeSearchQuery,

    searchOpen,
    setSearchOpen,
    searchType,
    setSearchType,
    searchQuery,
    setSearchQuery,
    selectedHallName,
    setSelectedHallName,
    selectedCompanyId,
    setSelectedCompanyId,
    searchHalls,
    searchCompanies,
    getCompanyByCompanyId,

    isLoadingNotify,

    isModalOpen,
    setIsModalOpen,
    selectedProject,
    setSelectedProject,

    isValidationModalOpen,
    setIsValidationModalOpen,
    validationProject,
    setValidationProject,
    isValidating,
    validationResult,
    correctionMessage,
    setCorrectionMessage,
    correctionFormData,
    setCorrectionFormData,

    isPRModalOpen,
    setIsPRModalOpen,
    isCostModalOpen,
    setIsCostModalOpen,
    selectedModalProject,
    prGenerated,
    prText,
    setPrText,
    isGenerating,

    costs,
    setCosts,
    costsAutoFilled,

    showDataCollectionModal,
    setShowDataCollectionModal,
    showDataExportModal,
    setShowDataExportModal,

    isQuoteModalOpen,
    setIsQuoteModalOpen,
    selectedProjectForQuote,
    setSelectedProjectForQuote,

    onCreateNewProject,
    addNotification,
    onBack,
    onNext,
    role,
    setCurrentScreen,

    handlers: {
      handleStatusToggle,
      handleGenerateCorrection,
      handleSubmitCorrection,
      handleNotifyInternal,
      handleProceedToArrangement,
      handleOpenPRModal,
      handleOpenCostModal,
      handleGeneratePR,
      handleAutoFillCosts,
      handleOpenDataCollectionModal,
      handleOpenDataExportModal,
      handleOpenQuoteModal,
      handleDownloadQuotePdf,
    },
  }
}

