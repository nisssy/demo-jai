"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Company, Hall } from "@/new/api/types"
import { getCategoryByEventType, getEventTypesByCategory } from "@/new/api/display"
import type { RegistrationMode, ProjectFormState, ProductFormState, FormErrors } from "@/new/features/project-registration/model/types"
import type { LotteryFormState } from "@/new/features/project-registration/model/lottery-types"
import { EMPTY_PRODUCT } from "@/new/features/project-registration/model/types"

export type UseProjectRegistrationArgs = {
  repository: ProjectRepository
  mode: RegistrationMode
  productId?: number
  correctionRequest?: string
  getLotteryData?: () => LotteryFormState
}

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`
}

function createInitialForm(): ProjectFormState {
  return {
    projectNumber: "",
    companyId: "",
    companyName: "",
    hallId: "",
    hallName: "",
    projectName: "",
    salesPersonName: "",
    requestDate: todayString(),
    products: [{ ...EMPTY_PRODUCT }],
  }
}

export function useProjectRegistration({ repository, mode, productId, correctionRequest, getLotteryData }: UseProjectRegistrationArgs) {
  const router = useAppRouter()

  // ─── フォーム状態 ───
  const [form, setForm] = useState<ProjectFormState>(createInitialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [projectNameTouched, setProjectNameTouched] = useState(false)

  // ─── 法人/ホール検索UI ───
  const [companySearchOpen, setCompanySearchOpen] = useState(false)
  const [companySearchQuery, setCompanySearchQuery] = useState("")
  const [hallSearchOpen, setHallSearchOpen] = useState(false)
  const [hallSearchQuery, setHallSearchQuery] = useState("")

  // ─── イベント区分検索UI (per product) ───
  const [eventTypeSearchOpen, setEventTypeSearchOpen] = useState<Record<number, boolean>>({})

  // ─── マスタデータ ───
  const allCompanies = useMemo(() => repository.getCompanies(), [repository])
  const allHalls = useMemo(() => repository.getHalls(), [repository])

  const filteredCompanies = useMemo(() => {
    if (!companySearchQuery) return allCompanies
    const q = companySearchQuery.toLowerCase()
    return allCompanies.filter((c) => c.name.toLowerCase().includes(q) || c.companyId.toLowerCase().includes(q))
  }, [allCompanies, companySearchQuery])

  const filteredHalls = useMemo(() => {
    const base = form.companyId
      ? allHalls.filter((h) => {
          const company = allCompanies.find((c) => c.companyId === form.companyId)
          return company ? h.companyId === company.id : true
        })
      : allHalls
    if (!hallSearchQuery) return base
    const q = hallSearchQuery.toLowerCase()
    return base.filter((h) => h.name.toLowerCase().includes(q) || h.hallId.toLowerCase().includes(q))
  }, [allHalls, allCompanies, form.companyId, hallSearchQuery])

  // ─── 編集モード: データロード ───
  useEffect(() => {
    if (mode === "new") return
    if (!productId) return

    const product = repository.getProductById(productId)
    if (!product) return

    const project = repository.getProjectByProjectNumber(product.projectNumber)

    if (mode === "edit" || mode === "product-edit") {
      const productForm: ProductFormState = {
        id: product.id,
        category: product.category,
        eventType: product.eventType,
        eventProductName: product.eventProductName,
        eventDate: product.eventDate,
        startTime: product.startTime ?? "08:00",
        endTime: product.endTime ?? "15:00",
        mustSeeFlag: product.mustSeeFlag ?? "0",
        mustSeePublication: product.mustSeePublication ?? "不要",
        publicationDate: product.publicationDate ?? "",
        publicationTime: product.publicationTime ?? "",
        reportRequired: product.reportRequired ?? "不要",
        isOpen: true,
        // キャスティング
        companionCount: product.companionCount ?? "",
        directorCount: product.directorCount ?? "",
        selectedCompanions: product.selectedCompanions?.length ? product.selectedCompanions : ["未定"],
        selectedDirectors: product.selectedDirectors?.length ? product.selectedDirectors : ["未定"],
        nominatedCompanions: {},
        nominatedDirectors: {},
        // 請求予定金額
        performanceFeeDiscount: (product as Record<string, unknown>).performanceFeeDiscount as string ?? "",
        accommodationFeePerPerson: (product as Record<string, unknown>).accommodationFeePerPerson as string ?? "",
        eventBaseFeeDiscount: (product as Record<string, unknown>).eventBaseFeeDiscount as string ?? "",
      }

      if (mode === "edit" && project) {
        setForm({
          projectNumber: project.projectNumber,
          companyId: project.companyId,
          companyName: project.companyName,
          hallId: project.hallId,
          hallName: project.hallName,
          projectName: project.projectName,
          salesPersonName: project.salesPersonName,
          requestDate: project.requestDate,
          products: [productForm],
        })
        setProjectNameTouched(true)
      } else if (mode === "product-edit") {
        setForm((prev) => ({
          ...prev,
          projectNumber: product.projectNumber,
          ...(project ? {
            companyId: project.companyId,
            companyName: project.companyName,
            hallId: project.hallId,
            hallName: project.hallName,
            projectName: project.projectName,
            salesPersonName: project.salesPersonName,
            requestDate: project.requestDate,
          } : {}),
          products: [productForm],
        }))
      }
    }

    if (mode === "product-add" && project) {
      setForm((prev) => ({
        ...prev,
        projectNumber: project.projectNumber,
        companyId: project.companyId,
        companyName: project.companyName,
        hallId: project.hallId,
        hallName: project.hallName,
        projectName: project.projectName,
        salesPersonName: project.salesPersonName,
        requestDate: project.requestDate,
      }))
      setProjectNameTouched(true)
    }
  }, [mode, productId, repository])

  // ─── フォーム更新ヘルパー ───
  const updateForm = useCallback(<K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const updateProduct = useCallback((index: number, field: keyof ProductFormState, value: string | boolean) => {
    setForm((prev) => {
      const products = [...prev.products]
      products[index] = { ...products[index], [field]: value }
      return { ...prev, products }
    })
    setErrors((prev) => {
      const next = { ...prev }
      delete next[`product_${index}_${String(field)}`]
      return next
    })
  }, [])

  // ─── 法人選択 ───
  const handleSelectCompany = useCallback((company: Company) => {
    const autoName = !projectNameTouched
    setForm((prev) => ({
      ...prev,
      companyId: company.companyId,
      companyName: company.name,
      hallId: "",
      hallName: "",
      salesPersonName: "",
      projectName: autoName ? "" : prev.projectName,
    }))
    setCompanySearchOpen(false)
    setCompanySearchQuery("")
    setErrors((prev) => {
      const next = { ...prev }
      delete next.companyName
      return next
    })
  }, [projectNameTouched])

  // ─── ホール選択 ───
  const handleSelectHall = useCallback((hall: Hall) => {
    const company = allCompanies.find((c) => c.id === hall.companyId)
    setForm((prev) => {
      const newName = !projectNameTouched ? `${hall.name} - ${hall.salesPersonName}` : prev.projectName
      return {
        ...prev,
        hallId: hall.hallId,
        hallName: hall.name,
        salesPersonName: hall.salesPersonName,
        projectName: newName,
        ...(company ? { companyId: company.companyId, companyName: company.name } : {}),
      }
    })
    if (!projectNameTouched) setProjectNameTouched(true)
    setHallSearchOpen(false)
    setHallSearchQuery("")
    setErrors((prev) => {
      const next = { ...prev }
      delete next.hallName
      delete next.salesPersonName
      delete next.companyName
      return next
    })
  }, [projectNameTouched, allCompanies])

  // ─── イベント区分選択 ───
  const handleSelectEventType = useCallback((index: number, eventType: string) => {
    const category = getCategoryByEventType(eventType) ?? ""
    setForm((prev) => {
      const products = [...prev.products]
      products[index] = { ...products[index], eventType, category }
      return { ...prev, products }
    })
    setEventTypeSearchOpen((prev) => ({ ...prev, [index]: false }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[`product_${index}_eventType`]
      return next
    })
  }, [])

  // ─── カテゴリ変更 ───
  const handleCategoryChange = useCallback((index: number, category: string) => {
    setForm((prev) => {
      const products = [...prev.products]
      products[index] = { ...products[index], category, eventType: "" }
      return { ...prev, products }
    })
  }, [])

  // ─── イベント区分UI ───
  const handleEventTypeSearchOpenChange = useCallback((index: number, open: boolean) => {
    setEventTypeSearchOpen((prev) => ({ ...prev, [index]: open }))
  }, [])

  const getEventTypesForProduct = useCallback((category: string) => {
    return category ? getEventTypesByCategory(category) : []
  }, [])

  // ─── 商材追加/削除 ───
  const handleAddProduct = useCallback(() => {
    setForm((prev) => {
      if (prev.products.length >= 5) return prev
      return { ...prev, products: [...prev.products, { ...EMPTY_PRODUCT }] }
    })
  }, [])

  const handleRemoveProduct = useCallback((index: number) => {
    setForm((prev) => {
      if (prev.products.length <= 1) return prev
      const products = prev.products.filter((_, i) => i !== index)
      return { ...prev, products }
    })
  }, [])

  const handleToggleProductOpen = useCallback((index: number) => {
    setForm((prev) => {
      const products = [...prev.products]
      products[index] = { ...products[index], isOpen: !products[index].isOpen }
      return { ...prev, products }
    })
  }, [])

  // ─── キャスティング: 人数変更 ───
  const handleCastCountChange = useCallback((index: number, role: "companion" | "director", count: string) => {
    setForm((prev) => {
      const products = [...prev.products]
      const p = { ...products[index] }
      const numCount = parseInt(count, 10) || 0

      if (role === "companion") {
        p.companionCount = count
        if (numCount === 0) {
          p.selectedCompanions = ["未定"]
          p.nominatedCompanions = {}
        }
      } else {
        p.directorCount = count
        if (numCount === 0) {
          p.selectedDirectors = ["未定"]
          p.nominatedDirectors = {}
        }
      }

      products[index] = p
      return { ...prev, products }
    })
  }, [])

  // ─── キャスティング: キャスト選択トグル ───
  const handleToggleCast = useCallback((index: number, role: "companion" | "director", name: string) => {
    setForm((prev) => {
      const products = [...prev.products]
      const p = { ...products[index] }

      if (role === "companion") {
        const current = [...p.selectedCompanions]
        if (name === "未定") {
          p.selectedCompanions = ["未定"]
          p.nominatedCompanions = {}
        } else {
          const without未定 = current.filter((n) => n !== "未定")
          const idx = without未定.indexOf(name)
          if (idx >= 0) {
            without未定.splice(idx, 1)
            const newNominations = { ...p.nominatedCompanions }
            delete newNominations[name]
            p.nominatedCompanions = newNominations
          } else {
            without未定.push(name)
          }
          p.selectedCompanions = without未定.length > 0 ? without未定 : ["未定"]
        }
      } else {
        const current = [...p.selectedDirectors]
        if (name === "未定") {
          p.selectedDirectors = ["未定"]
          p.nominatedDirectors = {}
        } else {
          const without未定 = current.filter((n) => n !== "未定")
          const idx = without未定.indexOf(name)
          if (idx >= 0) {
            without未定.splice(idx, 1)
            const newNominations = { ...p.nominatedDirectors }
            delete newNominations[name]
            p.nominatedDirectors = newNominations
          } else {
            without未定.push(name)
          }
          p.selectedDirectors = without未定.length > 0 ? without未定 : ["未定"]
        }
      }

      products[index] = p
      return { ...prev, products }
    })
  }, [])

  // ─── キャスティング: 指名トグル ───
  const handleToggleNomination = useCallback((index: number, role: "companion" | "director", name: string) => {
    setForm((prev) => {
      const products = [...prev.products]
      const p = { ...products[index] }

      if (role === "companion") {
        p.nominatedCompanions = { ...p.nominatedCompanions, [name]: !p.nominatedCompanions[name] }
      } else {
        p.nominatedDirectors = { ...p.nominatedDirectors, [name]: !p.nominatedDirectors[name] }
      }

      products[index] = p
      return { ...prev, products }
    })
  }, [])

  // ─── 案件名手動入力 ───
  const handleProjectNameChange = useCallback((value: string) => {
    setProjectNameTouched(true)
    updateForm("projectName", value)
  }, [updateForm])

  // ─── 開催時間数の計算 ───
  const calculateDuration = useCallback((startTime: string, endTime: string): string => {
    if (!startTime || !endTime) return ""
    const [sh, sm] = startTime.split(":").map(Number)
    const [eh, em] = endTime.split(":").map(Number)
    const startMin = sh * 60 + sm
    const endMin = eh * 60 + em
    if (endMin <= startMin) return ""
    const diff = endMin - startMin
    const hours = Math.floor(diff / 60)
    const mins = diff % 60
    return mins > 0 ? `${hours}時間${String(mins).padStart(2, "0")}分` : `${hours}時間`
  }, [])

  // ─── バリデーション ───
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {}
    const isProductMode = mode === "product-add" || mode === "product-edit"

    if (!isProductMode) {
      if (!form.projectName.trim()) newErrors.projectName = "案件名を入力してください"
      if (!form.companyName.trim()) newErrors.companyName = "法人名を選択してください"
      if (!form.hallName.trim()) newErrors.hallName = "ホール名を選択してください"
      if (!form.salesPersonName.trim()) newErrors.salesPersonName = "ホール担当営業を入力してください"
      if (!form.requestDate.trim()) newErrors.requestDate = "依頼日を入力してください"
    }

    for (let i = 0; i < form.products.length; i++) {
      const p = form.products[i]
      if (!p.eventType.trim()) {
        newErrors[`product_${i}_eventType`] = "イベント区分を選択してください"
      }
      if (p.eventType && p.category !== "ポイント") {
        if (!p.eventProductName.trim()) {
          newErrors[`product_${i}_eventProductName`] = "イベント商材名を入力してください"
        }
        if (!p.eventDate.trim()) {
          newErrors[`product_${i}_eventDate`] = "実施日を入力してください"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form, mode])

  // ─── 送信 ───
  const handleSubmit = useCallback(() => {
    if (!validate()) return

    const now = new Date().toISOString()
    const lotteryData = getLotteryData ? getLotteryData() : undefined

    const buildLotteryFields = (p: ProductFormState) => {
      if (p.category !== "ポイント" || !lotteryData) return {}
      return {
        dmMailing: lotteryData.dmMailing,
        hallNames: lotteryData.halls.filter((h) => h.hallName.trim()).map((h) => h.hallName),
        eventStartDate: lotteryData.eventStartDate,
        eventEndDate: lotteryData.eventEndDate,
        eventProductName: lotteryData.eventName,
        salesPersonId: Number(lotteryData.salesPersonId) || undefined,
        insightPersonId: Number(lotteryData.insightPersonId) || undefined,
        readingCertainty: lotteryData.readingCertainty || undefined,
        proposalStatus: lotteryData.proposalStatus as "before-proposal" | "proposing" | "order-received",
        executionStatus: lotteryData.executionStatus ?? undefined,
        prizeInfo: lotteryData.prizeInfo,
        hallQuotes: lotteryData.hallQuotes,
      }
    }

    let savedProjectNumber = form.projectNumber

    if (mode === "new") {
      const projectNumber = repository.generateProjectNumber()
      savedProjectNumber = projectNumber
      const project = repository.createProject({
        projectNumber,
        projectName: form.projectName,
        companyId: form.companyId,
        companyName: form.companyName,
        hallId: form.hallId,
        hallName: form.hallName,
        salesPersonName: form.salesPersonName,
        requestDate: form.requestDate,
        createdAt: now,
        updatedAt: now,
      })

      for (const p of form.products) {
        const castingSelected = p.selectedCompanions.filter((n) => n !== "未定")
        const directorSelected = p.selectedDirectors.filter((n) => n !== "未定")
        repository.createProduct({
          projectId: project.id,
          projectNumber,
          category: p.category,
          eventType: p.eventType,
          eventProductName: p.eventProductName,
          eventDate: p.eventDate,
          startTime: p.startTime,
          endTime: p.endTime,
          mustSeeFlag: p.mustSeeFlag,
          mustSeePublication: p.mustSeePublication,
          publicationDate: p.publicationDate,
          publicationTime: p.publicationTime,
          reportRequired: p.reportRequired,
          estimatedBillingAmount: 0,
          proposalStatus: "before-proposal",
          companionCount: p.companionCount || "0",
          directorCount: p.directorCount || "0",
          mcCount: "0",
          selectedCompanions: castingSelected,
          selectedDirectors: directorSelected,
          selectedMcs: [],
          companionBookingStatus: {},
          directorBookingStatus: {},
          mcBookingStatus: {},
          ...buildLotteryFields(p),
        })
      }
    }

    if (mode === "edit") {
      repository.updateProject(form.projectNumber, {
        projectName: form.projectName,
        companyId: form.companyId,
        companyName: form.companyName,
        hallId: form.hallId,
        hallName: form.hallName,
        salesPersonName: form.salesPersonName,
        requestDate: form.requestDate,
        updatedAt: now,
      })
      for (const p of form.products) {
        if (p.id) {
          const castingSelected = p.selectedCompanions.filter((n) => n !== "未定")
          const directorSelected = p.selectedDirectors.filter((n) => n !== "未定")
          repository.updateProduct(p.id, {
            category: p.category,
            eventType: p.eventType,
            eventProductName: p.eventProductName,
            eventDate: p.eventDate,
            startTime: p.startTime,
            endTime: p.endTime,
            mustSeeFlag: p.mustSeeFlag,
            mustSeePublication: p.mustSeePublication,
            publicationDate: p.publicationDate,
            publicationTime: p.publicationTime,
            reportRequired: p.reportRequired,
            companionCount: p.companionCount || "0",
            directorCount: p.directorCount || "0",
            selectedCompanions: castingSelected,
            selectedDirectors: directorSelected,
            ...buildLotteryFields(p),
          })
        }
      }
    }

    if (mode === "product-add") {
      const project = repository.getProjectByProjectNumber(form.projectNumber)
      if (project) {
        for (const p of form.products) {
          const castingSelected = p.selectedCompanions.filter((n) => n !== "未定")
          const directorSelected = p.selectedDirectors.filter((n) => n !== "未定")
          repository.createProduct({
            projectId: project.id,
            projectNumber: form.projectNumber,
            category: p.category,
            eventType: p.eventType,
            eventProductName: p.eventProductName,
            eventDate: p.eventDate,
            startTime: p.startTime,
            endTime: p.endTime,
            mustSeeFlag: p.mustSeeFlag,
            mustSeePublication: p.mustSeePublication,
            publicationDate: p.publicationDate,
            publicationTime: p.publicationTime,
            reportRequired: p.reportRequired,
            estimatedBillingAmount: 0,
            proposalStatus: "before-proposal",
            companionCount: p.companionCount || "0",
            directorCount: p.directorCount || "0",
            mcCount: "0",
            selectedCompanions: castingSelected,
            selectedDirectors: directorSelected,
            selectedMcs: [],
            companionBookingStatus: {},
            directorBookingStatus: {},
            mcBookingStatus: {},
            ...buildLotteryFields(p),
          })
        }
      }
    }

    if (mode === "product-edit") {
      const p = form.products[0]
      if (p?.id) {
        const castingSelected = p.selectedCompanions.filter((n) => n !== "未定")
        const directorSelected = p.selectedDirectors.filter((n) => n !== "未定")
        repository.updateProduct(p.id, {
          category: p.category,
          eventType: p.eventType,
          eventProductName: p.eventProductName,
          eventDate: p.eventDate,
          startTime: p.startTime,
          endTime: p.endTime,
          mustSeeFlag: p.mustSeeFlag,
          mustSeePublication: p.mustSeePublication,
          publicationDate: p.publicationDate,
          publicationTime: p.publicationTime,
          reportRequired: p.reportRequired,
          correctionRequest: undefined,
          companionCount: p.companionCount || "0",
          directorCount: p.directorCount || "0",
          selectedCompanions: castingSelected,
          selectedDirectors: directorSelected,
          ...buildLotteryFields(p),
        })
      }
    }

    if (mode === "new") {
      router.push("/new?role=Sales")
    } else {
      router.push(`/new/project-number/${savedProjectNumber}?role=Sales`)
    }
  }, [form, mode, repository, router, validate, getLotteryData])

  // ─── 戻る ───
  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  return {
    mode,
    form,
    errors,
    correctionRequest,
    // 法人検索
    companySearchOpen,
    setCompanySearchOpen,
    companySearchQuery,
    setCompanySearchQuery,
    filteredCompanies,
    handleSelectCompany,
    // ホール検索
    hallSearchOpen,
    setHallSearchOpen,
    hallSearchQuery,
    setHallSearchQuery,
    filteredHalls,
    handleSelectHall,
    // イベント区分
    eventTypeSearchOpen,
    handleEventTypeSearchOpenChange,
    handleSelectEventType,
    handleCategoryChange,
    getEventTypesForProduct,
    // フォーム操作
    updateForm,
    updateProduct,
    handleProjectNameChange,
    handleAddProduct,
    handleRemoveProduct,
    handleToggleProductOpen,
    calculateDuration,
    // キャスティング
    handleCastCountChange,
    handleToggleCast,
    handleToggleNomination,
    // アクション
    handleSubmit,
    handleBack,
  }
}
