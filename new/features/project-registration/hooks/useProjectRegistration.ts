"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Company, Hall, Product, ProductComment, ChatMessage, ManagementConfirmationStatus } from "@/new/api/types"
import { getCategoryByEventType, getEventTypesByCategory } from "@/new/api/display"
import type { RegistrationMode, ProjectFormState, ProductFormState, FormErrors } from "@/new/features/project-registration/model/types"
import type { LotteryFormState } from "@/new/features/project-registration/model/lottery-types"
import { EMPTY_PRODUCT } from "@/new/features/project-registration/model/types"
import { computeEstimatedBilling } from "@/new/api/cast-data"

export type UseProjectRegistrationArgs = {
  repository: ProjectRepository
  mode: RegistrationMode
  productId?: number
  comments?: ProductComment[]
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

export function useProjectRegistration({ repository, mode, productId, comments, getLotteryData }: UseProjectRegistrationArgs) {
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

  // ─── リフレッシュ（repository更新後にuseMemo再計算を強制する） ───
  const [refreshKey, setRefreshKey] = useState(0)

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

    if (mode === "project-edit") {
      // 案件情報のみロード（商材は不要）
      if (project) {
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
      return
    }

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
        companionHoldTypes: Object.fromEntries(
          Object.entries(product.companionBookingStatus ?? {}).map(([name, status]) => [name, status.startsWith("confirmed") ? "confirmed" as const : "tentative" as const])
        ),
        directorHoldTypes: Object.fromEntries(
          Object.entries(product.directorBookingStatus ?? {}).map(([name, status]) => [name, status.startsWith("confirmed") ? "confirmed" as const : "tentative" as const])
        ),
        // 請求予定金額
        performanceFeeDiscount: (product as Record<string, unknown>).performanceFeeDiscount as string ?? "",
        accommodationFeePerPerson: (product as Record<string, unknown>).accommodationFeePerPerson as string ?? "",
        eventBaseFeeDiscount: (product as Record<string, unknown>).eventBaseFeeDiscount as string ?? "",
        // ステータス
        proposalStatus: product.proposalStatus ?? "before-proposal",
        readingCertainty: product.readingCertainty ?? "",
        executionStatus: product.executionStatus ?? null,
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

  // ─── キャスティング: キャスト選択トグル（FIFO方式: 上限に達したら最古の選択を入れ替え） ───
  const handleToggleCast = useCallback((index: number, role: "companion" | "director", name: string) => {
    setForm((prev) => {
      const products = [...prev.products]
      const p = { ...products[index] }

      const maxCount = parseInt(role === "companion" ? p.companionCount : p.directorCount, 10) || 0
      const currentSelected = role === "companion" ? [...p.selectedCompanions] : [...p.selectedDirectors]
      const currentNominations = role === "companion" ? { ...p.nominatedCompanions } : { ...p.nominatedDirectors }

      if (name === "未定") {
        if (role === "companion") {
          p.selectedCompanions = ["未定"]
          p.nominatedCompanions = {}
        } else {
          p.selectedDirectors = ["未定"]
          p.nominatedDirectors = {}
        }
      } else {
        const without未定 = currentSelected.filter((n) => n !== "未定")
        const idx = without未定.indexOf(name)
        if (idx >= 0) {
          // 既に選択済み → 解除
          without未定.splice(idx, 1)
          delete currentNominations[name]
        } else {
          // 新規選択: 上限に達している場合は最古（先頭）を除去して入れ替え
          if (maxCount > 0 && without未定.length >= maxCount) {
            const removed = without未定.shift()!
            delete currentNominations[removed]
          }
          without未定.push(name)
        }

        if (role === "companion") {
          p.selectedCompanions = without未定.length > 0 ? without未定 : ["未定"]
          p.nominatedCompanions = currentNominations
        } else {
          p.selectedDirectors = without未定.length > 0 ? without未定 : ["未定"]
          p.nominatedDirectors = currentNominations
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

  // ─── キャスティング: 押さえ種別変更 ───
  const handleCastHoldTypeChange = useCallback((index: number, role: "companion" | "director", name: string, holdType: "tentative" | "confirmed") => {
    setForm((prev) => {
      const products = [...prev.products]
      const p = { ...products[index] }

      if (role === "companion") {
        p.companionHoldTypes = { ...p.companionHoldTypes, [name]: holdType }
      } else {
        p.directorHoldTypes = { ...p.directorHoldTypes, [name]: holdType }
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
    const isProjectEditMode = mode === "project-edit"

    if (!isProductMode) {
      if (!form.projectName.trim()) newErrors.projectName = "案件名を入力してください"
      if (!form.companyName.trim()) newErrors.companyName = "法人名を選択してください"
      if (!form.hallName.trim()) newErrors.hallName = "ホール名を選択してください"
      if (!form.salesPersonName.trim()) newErrors.salesPersonName = "ホール担当営業を入力してください"
      if (!form.requestDate.trim()) newErrors.requestDate = "依頼日を入力してください"
    }

    if (isProjectEditMode) {
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
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
        quoteConfig: lotteryData.quoteConfig,
      }
    }

    /** キャスト選択時のマネジメント部への依頼メッセージを生成 */
    const buildCastRequestMessages = (
      eventType: string,
      companions: string[],
      directors: string[],
      companionHoldTypes: Record<string, string>,
      directorHoldTypes: Record<string, string>,
      undecidedCompanionCount: number,
      undecidedDirectorCount: number,
      existingProduct?: Product | null,
    ): ChatMessage[] => {
      const messages: ChatMessage[] = []
      // スロセレはコンパニオン不要のためスキップ
      if (eventType !== "スロセレ") {
        for (const name of companions) {
          // 編集時: 既に押さえ済みのキャストはスキップ
          if (existingProduct?.companionBookingStatus[name]) continue
          const holdLabel = companionHoldTypes[name] === "confirmed" ? "本押さえ" : "仮押さえ"
          messages.push({
            channel: "マネジメント部",
            author: "営業",
            content: `${name}さん（コンパニオン）の${holdLabel}をお願いします`,
            timestamp: now,
          })
        }
      }
      for (const name of directors) {
        if (existingProduct?.directorBookingStatus[name]) continue
        const holdLabel = directorHoldTypes[name] === "confirmed" ? "本押さえ" : "仮押さえ"
        messages.push({
          channel: "マネジメント部",
          author: "営業",
          content: `${name}さん（ディレクター）の${holdLabel}をお願いします`,
          timestamp: now,
        })
      }
      // 未定キャストの手配依頼
      const existingUndecidedCompanions = existingProduct
        ? parseInt(existingProduct.companionCount || "0") - existingProduct.selectedCompanions.length
        : 0
      const existingUndecidedDirectors = existingProduct
        ? parseInt(existingProduct.directorCount || "0") - existingProduct.selectedDirectors.length
        : 0
      const newUndecidedCompanions = undecidedCompanionCount - existingUndecidedCompanions
      const newUndecidedDirectors = undecidedDirectorCount - existingUndecidedDirectors
      // スロセレはコンパニオン不要のためスキップ
      if (eventType !== "スロセレ" && newUndecidedCompanions > 0) {
        messages.push({
          channel: "マネジメント部",
          author: "営業",
          content: `コンパニオン${newUndecidedCompanions}名の手配をお願いします`,
          timestamp: now,
        })
      }
      if (newUndecidedDirectors > 0) {
        messages.push({
          channel: "マネジメント部",
          author: "営業",
          content: `ディレクター${newUndecidedDirectors}名の手配をお願いします`,
          timestamp: now,
        })
      }
      return messages
    }

    const hallAddress = allHalls.find((h) => h.hallId === form.hallId)?.address ?? ""

    /** イベント系商材の請求予定金額を計算（合同抽選会は対象外） */
    const calcBilling = (p: ProductFormState): number => {
      if (p.category === "ポイント") return 0
      return computeEstimatedBilling({
        startTime: p.startTime,
        endTime: p.endTime,
        companionCount: p.companionCount,
        directorCount: p.directorCount,
        selectedCompanions: p.selectedCompanions,
        selectedDirectors: p.selectedDirectors,
        performanceFeeDiscount: p.performanceFeeDiscount,
        accommodationFeePerPerson: p.accommodationFeePerPerson,
        eventBaseFeeDiscount: p.eventBaseFeeDiscount,
        eventType: p.eventType,
        hallAddress,
      })
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
        const undecidedCompanions = Math.max(0, parseInt(p.companionCount || "0") - castingSelected.length)
        const undecidedDirectors = Math.max(0, parseInt(p.directorCount || "0") - directorSelected.length)
        const castMessages = buildCastRequestMessages(p.eventType, castingSelected, directorSelected, p.companionHoldTypes, p.directorHoldTypes, undecidedCompanions, undecidedDirectors)
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
          estimatedBillingAmount: calcBilling(p),
          proposalStatus: p.proposalStatus,
          readingCertainty: p.readingCertainty || undefined,
          executionStatus: p.executionStatus ?? undefined,
          companionCount: p.companionCount || "0",
          directorCount: p.directorCount || "0",
          mcCount: "0",
          selectedCompanions: castingSelected,
          selectedDirectors: directorSelected,
          selectedMcs: [],
          companionBookingStatus: Object.fromEntries(
            castingSelected.map(name => [name, p.companionHoldTypes[name] === "confirmed" ? "confirmed_requesting" as const : "tentative_requesting" as const])
          ),
          directorBookingStatus: Object.fromEntries(
            directorSelected.map(name => [name, p.directorHoldTypes[name] === "confirmed" ? "confirmed_requesting" as const : "tentative_requesting" as const])
          ),
          mcBookingStatus: {},
          chatMessages: castMessages.length > 0 ? castMessages : undefined,
          ...buildLotteryFields(p),
        })
      }
    }

    if (mode === "project-edit") {
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
          const undecidedCompanions = Math.max(0, parseInt(p.companionCount || "0") - castingSelected.length)
          const undecidedDirectors = Math.max(0, parseInt(p.directorCount || "0") - directorSelected.length)
          const existing = repository.getProducts().find(ep => ep.id === p.id)
          const castMessages = buildCastRequestMessages(p.eventType, castingSelected, directorSelected, p.companionHoldTypes, p.directorHoldTypes, undecidedCompanions, undecidedDirectors, existing)
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
            estimatedBillingAmount: calcBilling(p),
            proposalStatus: p.proposalStatus,
            readingCertainty: p.readingCertainty || undefined,
            executionStatus: p.executionStatus ?? undefined,
            companionCount: p.companionCount || "0",
            directorCount: p.directorCount || "0",
            selectedCompanions: castingSelected,
            selectedDirectors: directorSelected,
            companionBookingStatus: Object.fromEntries(
              castingSelected.map(name => {
                const fallback = p.companionHoldTypes[name] === "confirmed" ? "confirmed_requesting" as const : "tentative_requesting" as const
                return [name, existing?.companionBookingStatus[name] ?? fallback]
              })
            ),
            directorBookingStatus: Object.fromEntries(
              directorSelected.map(name => {
                const fallback = p.directorHoldTypes[name] === "confirmed" ? "confirmed_requesting" as const : "tentative_requesting" as const
                return [name, existing?.directorBookingStatus[name] ?? fallback]
              })
            ),
            ...(castMessages.length > 0 ? { chatMessages: [...(existing?.chatMessages ?? []), ...castMessages] } : {}),
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
          const undecidedCompanions = Math.max(0, parseInt(p.companionCount || "0") - castingSelected.length)
          const undecidedDirectors = Math.max(0, parseInt(p.directorCount || "0") - directorSelected.length)
          const castMessages = buildCastRequestMessages(p.eventType, castingSelected, directorSelected, p.companionHoldTypes, p.directorHoldTypes, undecidedCompanions, undecidedDirectors)
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
            estimatedBillingAmount: calcBilling(p),
            proposalStatus: p.proposalStatus,
            readingCertainty: p.readingCertainty || undefined,
            executionStatus: p.executionStatus ?? undefined,
            companionCount: p.companionCount || "0",
            directorCount: p.directorCount || "0",
            mcCount: "0",
            selectedCompanions: castingSelected,
            selectedDirectors: directorSelected,
            selectedMcs: [],
            companionBookingStatus: Object.fromEntries(
              castingSelected.map(name => [name, p.companionHoldTypes[name] === "confirmed" ? "confirmed_requesting" as const : "tentative_requesting" as const])
            ),
            directorBookingStatus: Object.fromEntries(
              directorSelected.map(name => [name, p.directorHoldTypes[name] === "confirmed" ? "confirmed_requesting" as const : "tentative_requesting" as const])
            ),
            mcBookingStatus: {},
            chatMessages: castMessages.length > 0 ? castMessages : undefined,
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
        const undecidedCompanions = Math.max(0, parseInt(p.companionCount || "0") - castingSelected.length)
        const undecidedDirectors = Math.max(0, parseInt(p.directorCount || "0") - directorSelected.length)
        const existing = repository.getProducts().find(ep => ep.id === p.id)
        const castMessages = buildCastRequestMessages(p.eventType, castingSelected, directorSelected, p.companionHoldTypes, p.directorHoldTypes, undecidedCompanions, undecidedDirectors, existing)
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
          estimatedBillingAmount: calcBilling(p),
          proposalStatus: p.proposalStatus,
          readingCertainty: p.readingCertainty || undefined,
          executionStatus: p.executionStatus ?? undefined,
          comments: [],
          companionCount: p.companionCount || "0",
          directorCount: p.directorCount || "0",
          selectedCompanions: castingSelected,
          selectedDirectors: directorSelected,
          companionBookingStatus: Object.fromEntries(
            castingSelected.map(name => {
              const fallback = p.companionHoldTypes[name] === "confirmed" ? "confirmed_requesting" as const : "tentative_requesting" as const
              return [name, existing?.companionBookingStatus[name] ?? fallback]
            })
          ),
          directorBookingStatus: Object.fromEntries(
            directorSelected.map(name => {
              const fallback = p.directorHoldTypes[name] === "confirmed" ? "confirmed_requesting" as const : "tentative_requesting" as const
              return [name, existing?.directorBookingStatus[name] ?? fallback]
            })
          ),
          ...(castMessages.length > 0 ? { chatMessages: [...(existing?.chatMessages ?? []), ...castMessages] } : {}),
          ...buildLotteryFields(p),
        })
      }
    }

    if (mode === "new") {
      router.push(`/new/project-number/${savedProjectNumber}?role=Sales`)
    } else {
      router.push(`/new/project-number/${savedProjectNumber}?role=Sales`)
    }
  }, [form, mode, repository, router, validate, getLotteryData, allHalls])

  // ─── マネジメント部確認ステータス ───
  const managementConfirmationStatus = useMemo<ManagementConfirmationStatus>(() => {
    if (mode !== "product-edit" || !productId) return "unconfirmed"
    const product = repository.getProductById(productId)
    return product?.managementConfirmationStatus ?? "unconfirmed"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, productId, repository, refreshKey])

  // ─── 確認依頼 ───
  const handleRequestConfirmation = useCallback(() => {
    if (mode !== "product-edit") return
    const p = form.products[0]
    if (!p?.id) return
    const existing = repository.getProducts().find(ep => ep.id === p.id)
    const now = new Date().toISOString()
    const message: ChatMessage = {
      channel: "マネジメント部",
      author: "営業",
      content: `商材情報の確認をお願いします（商材名: ${p.eventProductName || p.eventType}）`,
      timestamp: now,
    }
    repository.updateProduct(p.id, {
      managementConfirmationStatus: "under-review",
      chatMessages: [...(existing?.chatMessages ?? []), message],
    })
    setRefreshKey(k => k + 1)
    window.dispatchEvent(new CustomEvent("chat-updated", { detail: { productId: p.id } }))
  }, [mode, form, repository])

  // ─── 戻る ───
  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  return {
    mode,
    form,
    errors,
    comments,
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
    // 請求予定金額
    hallAddress: allHalls.find((h) => h.hallId === form.hallId)?.address ?? "",
    // キャスティング
    handleCastCountChange,
    handleToggleCast,
    handleToggleNomination,
    handleCastHoldTypeChange,
    // ステータス
    updateProduct,
    // マネジメント部確認
    managementConfirmationStatus,
    handleRequestConfirmation,
    // アクション
    handleSubmit,
    handleBack,
  }
}
