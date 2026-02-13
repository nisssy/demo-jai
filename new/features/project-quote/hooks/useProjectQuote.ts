"use client"

import { useState, useMemo, useCallback, useRef } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import type { Product, Employee } from "@/new/api/types"
import { computeProductSummaries, generateQuoteLineItems } from "@/new/api/quote-helpers"
import type {
  QuoteStep,
  QuoteRecipient,
  EmailTemplate,
  QuoteTemplate,
  QuoteLineItem,
  QuoteDocument,
  EmailSettings,
  ProductQuoteSummary,
} from "@/new/features/project-quote/model/types"

export type UseProjectQuoteArgs = {
  repository: ProjectRepository
  projectNumber: string
}

// ─── 見積テンプレート定義（旧バージョン準拠） ───

function buildTemplates(totalAmount: number): QuoteTemplate[] {
  const base = Math.round(totalAmount * 0.5)
  const transport = Math.round(totalAmount * 0.2)
  const accommodation = Math.round(totalAmount * 0.15)
  const admin = Math.round(totalAmount * 0.15)
  return [
    {
      id: 1,
      name: "標準テンプレート",
      description: "出演料、交通費、宿泊費、管理費の4項目",
      items: [
        { item: "出演料", amount: base, subitems: [{ item: "タレント", amount: Math.round(base * 0.7) }, { item: "ディレクター", amount: Math.round(base * 0.3) }] },
        { item: "交通費", amount: transport },
        { item: "宿泊費", amount: accommodation },
        { item: "管理費", amount: admin },
      ],
    },
    {
      id: 2,
      name: "テンプレートB",
      description: "人件費、移動費、滞在費、運営費の4項目",
      items: [
        { item: "人件費", amount: base, subitems: [{ item: "メインキャスト", amount: Math.round(base * 0.6) }, { item: "サポートスタッフ", amount: Math.round(base * 0.4) }] },
        { item: "移動費", amount: transport },
        { item: "滞在費", amount: accommodation },
        { item: "運営費", amount: admin },
      ],
    },
    {
      id: 3,
      name: "テンプレートC",
      description: "スタッフ費用、旅費、宿泊代、事務費の4項目",
      items: [
        { item: "スタッフ費用", amount: base },
        { item: "旅費", amount: transport },
        { item: "宿泊代", amount: accommodation },
        { item: "事務費", amount: admin },
      ],
    },
  ]
}

// ─── メールテンプレート生成 ───

function generateEmailBody(
  template: EmailTemplate,
  clientName: string,
  projectName: string,
  salesPersonName: string,
): string {
  switch (template) {
    case "standard":
      return `${clientName} 御中

平素より大変お世話になっております。
${salesPersonName}でございます。

このたびは「${projectName}」の件につきまして、
お見積書をお送りいたします。

内容をご確認いただき、ご不明な点がございましたら
お気軽にお問い合わせください。

ご検討のほど、何卒よろしくお願い申し上げます。`

    case "polite":
      return `${clientName} 御中

いつも格別のお引き立てを賜り、誠にありがとうございます。
${salesPersonName}でございます。

「${projectName}」につきまして、
ご依頼いただきましたお見積書を添付にてお送りいたします。

ご多忙のところ恐縮ではございますが、
ご査収のほどよろしくお願い申し上げます。

何かご不明な点がございましたら、何なりとお申し付けください。
今後とも何卒よろしくお願い申し上げます。`

    case "concise":
      return `${clientName} 御中

お世話になっております。${salesPersonName}です。

「${projectName}」のお見積書を送付いたします。
ご確認をお願いいたします。

よろしくお願いいたします。`
  }
}

// ─── Hook ───

export function useProjectQuote({ repository, projectNumber }: UseProjectQuoteArgs) {
  // ─── 基本データ ───
  const project = useMemo(
    () => repository.getProjectByProjectNumber(projectNumber),
    [repository, projectNumber],
  )

  const allProducts = useMemo<Product[]>(
    () => repository.getProductsByProjectNumber(projectNumber),
    [repository, projectNumber],
  )

  const halls = useMemo(() => repository.getHalls(), [repository])
  const companies = useMemo(() => repository.getCompanies(), [repository])
  const employees = useMemo(() => repository.getEmployees(), [repository])

  const hallAddress = useMemo(() => {
    if (!project) return ""
    return halls.find((h) => h.hallId === project.hallId)?.address ?? ""
  }, [project, halls])

  // ─── ステップ管理 ───
  const [step, setStep] = useState<QuoteStep>("select")

  // ─── Step 1: 商材選択 ───
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(
    () => new Set(allProducts.map((p) => p.id)),
  )

  const toggleProduct = useCallback((productId: number) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }, [])

  const selectedProducts = useMemo(
    () => allProducts.filter((p) => selectedProductIds.has(p.id)),
    [allProducts, selectedProductIds],
  )

  const productSummaries = useMemo<ProductQuoteSummary[]>(
    () => computeProductSummaries(selectedProducts, hallAddress),
    [selectedProducts, hallAddress],
  )

  // ─── Step 2: 宛先選択 ───
  const [recipient, setRecipient] = useState<QuoteRecipient>("hall")

  // ─── Step 3: テンプレート選択 + 見積項目編集 ───
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(1)
  const [quoteItems, setQuoteItems] = useState<QuoteLineItem[]>([])
  const [isEditingItems, setIsEditingItems] = useState(false)
  const editableItemsBackupRef = useRef<QuoteLineItem[] | null>(null)

  const totalAmountFromSummaries = useMemo(
    () => productSummaries.reduce((s, x) => s + x.subtotal, 0),
    [productSummaries],
  )

  const templates = useMemo(
    () => buildTemplates(totalAmountFromSummaries),
    [totalAmountFromSummaries],
  )

  let nextIdCounter = useRef(1)
  const uid = useCallback(() => {
    return `qi-${nextIdCounter.current++}`
  }, [])

  const applyTemplate = useCallback((templateId: number) => {
    setSelectedTemplateId(templateId)
    const tpl = templates.find((t) => t.id === templateId)
    if (!tpl) return
    nextIdCounter.current = 1
    const items: QuoteLineItem[] = tpl.items.map((item) => ({
      id: `item-${Date.now()}-${nextIdCounter.current++}`,
      name: item.item,
      amount: item.amount,
      visible: true,
      subitems: item.subitems?.map((si) => ({
        id: `sub-${Date.now()}-${nextIdCounter.current++}`,
        name: si.item,
        amount: si.amount,
        visible: true,
      })),
    }))

    // 合同抽選会項目を追加
    for (const s of productSummaries) {
      if (s.category === "ポイント" && s.lotteryItems && s.lotteryItems.length > 0) {
        items.push({
          id: `item-${Date.now()}-${nextIdCounter.current++}`,
          name: "合同抽選会",
          amount: s.subtotal,
          visible: true,
          subitems: s.lotteryItems.map((li) => ({
            id: `sub-${Date.now()}-${nextIdCounter.current++}`,
            name: li.name,
            amount: li.amount,
            visible: true,
          })),
        })
      }
    }

    setQuoteItems(items)
  }, [templates, productSummaries])

  const startEditing = useCallback(() => {
    editableItemsBackupRef.current = JSON.parse(JSON.stringify(quoteItems))
    setIsEditingItems(true)
  }, [quoteItems])

  const cancelEditing = useCallback(() => {
    if (editableItemsBackupRef.current) {
      setQuoteItems(editableItemsBackupRef.current)
    }
    setIsEditingItems(false)
  }, [])

  const saveEditing = useCallback(() => {
    editableItemsBackupRef.current = null
    setIsEditingItems(false)
  }, [])

  const updateItemName = useCallback((itemId: string, name: string) => {
    setQuoteItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, name } : item)),
    )
  }, [])

  const updateItemAmount = useCallback((itemId: string, amount: number) => {
    setQuoteItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, amount } : item)),
    )
  }, [])

  const toggleItemVisible = useCallback((itemId: string) => {
    setQuoteItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, visible: !item.visible } : item)),
    )
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.id !== itemId))
  }, [])

  const addItem = useCallback(() => {
    setQuoteItems((prev) => [
      ...prev,
      { id: `item-${Date.now()}-custom`, name: "新規項目", amount: 0, visible: true },
    ])
  }, [])

  // サブ項目操作
  const updateSubitemName = useCallback((itemId: string, subitemId: string, name: string) => {
    setQuoteItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, subitems: item.subitems?.map((si) => (si.id === subitemId ? { ...si, name } : si)) }
          : item,
      ),
    )
  }, [])

  const updateSubitemAmount = useCallback((itemId: string, subitemId: string, amount: number) => {
    setQuoteItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, subitems: item.subitems?.map((si) => (si.id === subitemId ? { ...si, amount } : si)) }
          : item,
      ),
    )
  }, [])

  const toggleSubitemVisible = useCallback((itemId: string, subitemId: string) => {
    setQuoteItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, subitems: item.subitems?.map((si) => (si.id === subitemId ? { ...si, visible: !si.visible } : si)) }
          : item,
      ),
    )
  }, [])

  const removeSubitem = useCallback((itemId: string, subitemId: string) => {
    setQuoteItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, subitems: item.subitems?.filter((si) => si.id !== subitemId) }
          : item,
      ),
    )
  }, [])

  const addSubitem = useCallback((itemId: string) => {
    setQuoteItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              subitems: [
                ...(item.subitems ?? []),
                { id: `sub-${Date.now()}-new`, name: "新規内訳", amount: 0, visible: true },
              ],
            }
          : item,
      ),
    )
  }, [])

  // ─── 見積合計 ───
  const totalAmount = useMemo(
    () => quoteItems.filter((i) => i.visible).reduce((sum, i) => sum + i.amount, 0),
    [quoteItems],
  )

  // ─── 見積書データ ───
  const quoteDocument = useMemo<QuoteDocument | null>(() => {
    if (!project) return null

    const productBreakdowns = productSummaries.map((s) => {
      const items: { name: string; amount: number }[] = []
      if (s.category === "ポイント" && s.lotteryItems) {
        for (const li of s.lotteryItems) items.push({ name: li.name, amount: li.amount })
      } else {
        if (s.performanceFee > 0) items.push({ name: "出演料", amount: s.performanceFee })
        if (s.transportFee > 0) items.push({ name: "交通費", amount: s.transportFee })
        if (s.accommodationFee > 0) items.push({ name: "宿泊費", amount: s.accommodationFee })
        if (s.eventBaseFee > 0) items.push({ name: "イベント基本料金", amount: s.eventBaseFee })
      }
      return {
        name: s.eventProductName || s.eventType,
        eventDate: s.eventDate,
        items,
        subtotal: s.subtotal,
      }
    })

    return {
      projectNumber: project.projectNumber,
      projectName: project.projectName,
      clientName: recipient === "hall" ? project.hallName : project.companyName,
      hallName: project.hallName,
      salesPersonName: project.salesPersonName,
      issueDate: new Date().toLocaleDateString("ja-JP"),
      items: quoteItems.filter((i) => i.visible),
      totalAmount,
      productBreakdowns,
    }
  }, [project, quoteItems, totalAmount, recipient, productSummaries])

  // ─── Step 5: メール送信先設定 ───
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    toEmails: [],
    fromEmployeeId: 1, // デフォルト: 山田太郎
    fromEmail: "",
    ccEmployeeIds: [],
    bccEmployeeIds: [],
    subject: "",
    body: "",
  })

  const addToEmail = useCallback((email: string) => {
    setEmailSettings((prev) => ({
      ...prev,
      toEmails: prev.toEmails.includes(email) ? prev.toEmails : [...prev.toEmails, email],
    }))
  }, [])

  const removeToEmail = useCallback((email: string) => {
    setEmailSettings((prev) => ({
      ...prev,
      toEmails: prev.toEmails.filter((e) => e !== email),
    }))
  }, [])

  const updateToEmail = useCallback((index: number, value: string) => {
    setEmailSettings((prev) => ({
      ...prev,
      toEmails: prev.toEmails.map((e, i) => (i === index ? value : e)),
    }))
  }, [])

  const setFromEmployee = useCallback((employeeId: number | null) => {
    setEmailSettings((prev) => ({ ...prev, fromEmployeeId: employeeId }))
  }, [])

  const setFromEmail = useCallback((email: string) => {
    setEmailSettings((prev) => ({ ...prev, fromEmail: email }))
  }, [])

  const addCcEmployee = useCallback((empId: number) => {
    setEmailSettings((prev) => ({
      ...prev,
      ccEmployeeIds: prev.ccEmployeeIds.includes(empId) ? prev.ccEmployeeIds : [...prev.ccEmployeeIds, empId],
    }))
  }, [])

  const removeCcEmployee = useCallback((empId: number) => {
    setEmailSettings((prev) => ({
      ...prev,
      ccEmployeeIds: prev.ccEmployeeIds.filter((id) => id !== empId),
    }))
  }, [])

  const addBccEmployee = useCallback((empId: number) => {
    setEmailSettings((prev) => ({
      ...prev,
      bccEmployeeIds: prev.bccEmployeeIds.includes(empId) ? prev.bccEmployeeIds : [...prev.bccEmployeeIds, empId],
    }))
  }, [])

  const removeBccEmployee = useCallback((empId: number) => {
    setEmailSettings((prev) => ({
      ...prev,
      bccEmployeeIds: prev.bccEmployeeIds.filter((id) => id !== empId),
    }))
  }, [])

  // ─── Step 6: メール送信 ───
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>("standard")
  const [emailSent, setEmailSent] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const generateEmail = useCallback(() => {
    if (!project) return
    const clientName = recipient === "hall" ? project.hallName : project.companyName
    const body = generateEmailBody(emailTemplate, clientName, project.projectName, project.salesPersonName)
    setEmailSettings((prev) => ({
      ...prev,
      subject: `【お見積書】${project.projectName}`,
      body,
    }))
  }, [project, recipient, emailTemplate])

  const updateEmailBody = useCallback((body: string) => {
    setEmailSettings((prev) => ({ ...prev, body }))
  }, [])

  const sendEmail = useCallback(() => {
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      setEmailSent(true)
    }, 1500)
  }, [])

  // ─── ステップナビゲーション ───
  const goToRecipient = useCallback(() => setStep("recipient"), [])

  const goToTemplate = useCallback(() => {
    if (quoteItems.length === 0) {
      applyTemplate(1)
    }
    setStep("template")
  }, [quoteItems.length, applyTemplate])

  const goToQuote = useCallback(() => setStep("quote"), [])

  const goToEmailSettings = useCallback(() => {
    // 宛先自動設定
    if (emailSettings.toEmails.length === 0) {
      const defaultEmail = recipient === "hall"
        ? `${project?.hallName ?? "hall"}@example.com`
        : `${project?.companyName ?? "company"}@example.com`
      setEmailSettings((prev) => ({ ...prev, toEmails: [defaultEmail] }))
    }
    setStep("email-settings")
  }, [emailSettings.toEmails.length, recipient, project])

  const goToEmailSend = useCallback(() => {
    generateEmail()
    setStep("email")
  }, [generateEmail])

  const goBack = useCallback(() => {
    setStep((prev) => {
      switch (prev) {
        case "recipient": return "select"
        case "template": return "recipient"
        case "quote": return "template"
        case "email-settings": return "quote"
        case "email": return "email-settings"
        default: return prev
      }
    })
  }, [])

  return {
    // 基本データ
    project,
    allProducts,
    halls,
    companies,
    employees,
    step,
    // Step 1: 商材選択
    selectedProductIds,
    toggleProduct,
    productSummaries,
    totalAmountFromSummaries,
    // Step 2: 宛先選択
    recipient,
    setRecipient,
    // Step 3: テンプレート + 見積項目編集
    templates,
    selectedTemplateId,
    applyTemplate,
    quoteItems,
    isEditingItems,
    startEditing,
    cancelEditing,
    saveEditing,
    updateItemName,
    updateItemAmount,
    toggleItemVisible,
    removeItem,
    addItem,
    updateSubitemName,
    updateSubitemAmount,
    toggleSubitemVisible,
    removeSubitem,
    addSubitem,
    totalAmount,
    // Step 4: プレビュー
    quoteDocument,
    // Step 5: メール送信先設定
    emailSettings,
    addToEmail,
    removeToEmail,
    updateToEmail,
    setFromEmployee,
    setFromEmail,
    addCcEmployee,
    removeCcEmployee,
    addBccEmployee,
    removeBccEmployee,
    // Step 6: メール送信
    emailTemplate,
    setEmailTemplate,
    generateEmail,
    updateEmailBody,
    sendEmail,
    emailSent,
    isSending,
    // ナビゲーション
    goToRecipient,
    goToTemplate,
    goToQuote,
    goToEmailSettings,
    goToEmailSend,
    goBack,
  }
}

export type UseProjectQuoteReturn = ReturnType<typeof useProjectQuote>
