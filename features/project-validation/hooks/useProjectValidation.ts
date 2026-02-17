"use client"

import { useState, useEffect, useCallback } from "react"
import type { ProjectData } from "@/types/project"

export type UseProjectValidationArgs = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onSendCorrection: () => void
}

export function useProjectValidation({ projectData, setProjectData, onSendCorrection }: UseProjectValidationArgs) {
  const [localBillingAddress, setLocalBillingAddress] = useState(projectData.billingAddress)
  const [localContractAmount, setLocalContractAmount] = useState(projectData.contractAmount)
  const [isValidating, setIsValidating] = useState(true)
  const [correctionMessage, setCorrectionMessage] = useState("")

  useEffect(() => {
    setTimeout(() => {
      const errors: string[] = []

      if (!projectData.billingAddress || projectData.billingAddress.trim() === "") {
        errors.push("請求書送付先住所が未入力です")
      }

      if (!projectData.contractAmount || projectData.contractAmount === "") {
        errors.push("契約金額が未入力です")
      }

      errors.push("終了時間が開始時間より前になっています（論理エラー）")

      setProjectData({ ...projectData, validationErrors: errors })
      setIsValidating(false)
    }, 1500)
  }, [])

  const handleGenerateCorrection = useCallback(() => {
    const message = `お疲れ様です。以下の項目について修正をお願いします。

${projectData.validationErrors.map((error, idx) => `${idx + 1}. ${error}`).join("\n")}

ご確認のほど、よろしくお願いいたします。

Co・Dir担当`

    setCorrectionMessage(message)
    setProjectData({ ...projectData, correctionRequest: message })
  }, [projectData, setProjectData])

  const handleResubmit = useCallback(() => {
    setProjectData({
      ...projectData,
      billingAddress: localBillingAddress,
      contractAmount: localContractAmount,
      validationErrors: [],
    })
    onSendCorrection()
  }, [localBillingAddress, localContractAmount, projectData, setProjectData, onSendCorrection])

  const hasAddressError = projectData.validationErrors.some((e) => e.includes("住所"))
  const hasAmountError = projectData.validationErrors.some((e) => e.includes("契約金額"))
  const isFormValid = localBillingAddress.trim() !== "" && localContractAmount.trim() !== ""

  return {
    localBillingAddress,
    setLocalBillingAddress,
    localContractAmount,
    setLocalContractAmount,
    isValidating,
    correctionMessage,
    hasAddressError,
    hasAmountError,
    isFormValid,
    handleGenerateCorrection,
    handleResubmit,
  }
}
