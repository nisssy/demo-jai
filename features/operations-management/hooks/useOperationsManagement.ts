"use client"

import { useState, useCallback, useMemo } from "react"
import type { ProjectData } from "@/types/project"

export type UseOperationsManagementArgs = {
  projectData: ProjectData
  onNext: () => void
  onBack: () => void
}

export function useOperationsManagement({ projectData, onNext, onBack }: UseOperationsManagementArgs) {
  const [prGenerated, setPrGenerated] = useState(false)
  const [prText, setPrText] = useState("")
  const [costsAutoFilled, setCostsAutoFilled] = useState(false)
  const [complianceStep, setComplianceStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)

  const [costs, setCosts] = useState([
    { item: "タレント出演料", amount: "" },
    { item: "交通費", amount: "" },
    { item: "宿泊費", amount: "" },
    { item: "PR広告費", amount: "" },
  ])

  const handleGeneratePR = useCallback(() => {
    setIsGenerating(true)
    setTimeout(() => {
      const storeName = projectData.venue || "〇〇店"
      const eventDate = projectData.date
        ? new Date(projectData.date).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })
        : "近日"
      setPrText(
        `明日${eventDate}、${storeName}にて${projectData.talent || "人気コンパニオン"}が登場！皆様のご来店をお待ちしております🎉 #パチンコ #新台入替 #コンパニオンイベント`,
      )
      setPrGenerated(true)
      setIsGenerating(false)
    }, 800)
  }, [projectData])

  const handleAutoFillCosts = useCallback(() => {
    setCosts([
      { item: "タレント出演料", amount: "150000" },
      { item: "交通費", amount: "25000" },
      { item: "宿泊費", amount: "18000" },
      { item: "PR広告費", amount: "50000" },
    ])
    setCostsAutoFilled(true)
  }, [])

  const handleComplianceCheck = useCallback(() => {
    if (complianceStep === 0) {
      setComplianceStep(1)
    } else if (complianceStep === 1) {
      setComplianceStep(2)
    }
  }, [complianceStep])

  const handleCostChange = useCallback((index: number, value: string) => {
    setCosts((prev) => {
      const newCosts = [...prev]
      newCosts[index].amount = value
      return newCosts
    })
  }, [])

  const totalCost = useMemo(() => costs.reduce((sum, c) => sum + (Number.parseInt(c.amount) || 0), 0), [costs])

  return {
    prGenerated,
    prText,
    setPrText,
    costsAutoFilled,
    complianceStep,
    isGenerating,
    costs,
    totalCost,
    handleGeneratePR,
    handleAutoFillCosts,
    handleComplianceCheck,
    handleCostChange,
    onNext,
    onBack,
  }
}
