"use client"

import { useState, useCallback, useMemo } from "react"
import type { ProjectData } from "@/types/project"

export type UseProjectCorrectionArgs = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onResubmit: () => void
}

export function useProjectCorrection({ projectData, setProjectData, onResubmit }: UseProjectCorrectionArgs) {
  const [localBillingAddress, setLocalBillingAddress] = useState(projectData.billingAddress)
  const [localContractAmount, setLocalContractAmount] = useState(projectData.contractAmount)

  const hasAddressError = useMemo(
    () => projectData.validationErrors.some((e) => e.includes("住所")),
    [projectData.validationErrors],
  )
  const hasAmountError = useMemo(
    () => projectData.validationErrors.some((e) => e.includes("契約金額")),
    [projectData.validationErrors],
  )

  const handleResubmit = useCallback(() => {
    setProjectData({
      ...projectData,
      billingAddress: localBillingAddress,
      contractAmount: localContractAmount,
      validationErrors: [],
    })
    onResubmit()
  }, [localBillingAddress, localContractAmount, projectData, setProjectData, onResubmit])

  const isFormValid = localBillingAddress.trim() !== "" && localContractAmount.trim() !== ""

  return {
    localBillingAddress,
    setLocalBillingAddress,
    localContractAmount,
    setLocalContractAmount,
    hasAddressError,
    hasAmountError,
    isFormValid,
    handleResubmit,
  }
}
