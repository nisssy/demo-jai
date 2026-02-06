"use client"

import { useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useAppRouter } from "@/hooks/use-app-router"
import type { ProjectData } from "@/types/project"

export type UseQuoteCreationArgs = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onNext: () => void
  onBack: () => void
}

export function useQuoteCreation({ projectData, setProjectData, onNext, onBack }: UseQuoteCreationArgs) {
  const router = useAppRouter()
  const searchParams = useSearchParams()

  // URLパラメータからタブの初期値を取得
  const tabFromUrl = searchParams?.get("tab") as "quote" | "email" | null

  const [showPDF, setShowPDF] = useState(false)
  const [quoteGenerated, setQuoteGenerated] = useState(false)
  const [emailGenerated, setEmailGenerated] = useState(false)
  const [activeTab, setActiveTab] = useState<"quote" | "email">(
    tabFromUrl && ["quote", "email"].includes(tabFromUrl) ? tabFromUrl : "quote"
  )
  const [isLoadingSend, setIsLoadingSend] = useState(false)

  const handleGenerateQuote = useCallback(() => {
    if (!projectData.quoteItems || projectData.quoteItems.length === 0) {
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
      setProjectData({ ...projectData, quoteItems: defaultItems })
    }
    setQuoteGenerated(true)
    setActiveTab("quote")
  }, [projectData, setProjectData])

  const handleGenerateEmail = useCallback(() => {
    const email = `${projectData.clientName} 御中

平素より大変お世話になっております。
DMM の営業担当でございます。

このたびは「${projectData.projectName}」の件につきまして、
お見積書をお送りいたします。

ご検討のほど、何卒よろしくお願い申し上げます。

【案件概要】
案件名: ${projectData.projectName}
実施日: ${projectData.date}
会場: ${projectData.venue}
コンパニオン: ${projectData.talent}

ご不明な点がございましたら、お気軽にお問い合わせください。

DMM 営業部`

    setProjectData({ ...projectData, emailDraft: email })
    setEmailGenerated(true)
    setActiveTab("email")
  }, [projectData, setProjectData])

  const handleSendQuote = useCallback(() => {
    setIsLoadingSend(true)
    setTimeout(() => {
      setIsLoadingSend(false)
      onNext()
    }, 500)
  }, [onNext])

  const handleEmailDraftChange = useCallback(
    (value: string) => {
      setProjectData({ ...projectData, emailDraft: value })
    },
    [projectData, setProjectData],
  )

  const totalAmount = projectData.quoteItems?.reduce((sum, item) => sum + item.amount, 0) || 0

  // タブ変更時にURLを更新する関数
  const handleActiveTabChange = useCallback((tab: "quote" | "email") => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("tab", tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  return {
    showPDF,
    quoteGenerated,
    emailGenerated,
    activeTab,
    setActiveTab: handleActiveTabChange,
    isLoadingSend,
    totalAmount,
    handleGenerateQuote,
    handleGenerateEmail,
    handleSendQuote,
    handleEmailDraftChange,
    onBack,
  }
}
