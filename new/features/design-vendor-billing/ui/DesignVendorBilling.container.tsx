"use client"

import { useState, useCallback } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import { useDesignVendorBilling } from "../hooks/useDesignVendorBilling"
import { DesignVendorBillingView } from "./DesignVendorBilling.view"

export interface DesignVendorBillingContainerProps {
  repository: ProjectRepository
}

export const DesignVendorBillingContainer = ({ repository }: DesignVendorBillingContainerProps) => {
  const {
    vendors,
    selectedVendorId,
    setSelectedVendorId,
    selectedVendorName,
    billings,
    selectedBillingId,
    setSelectedBillingId,
    selectedBilling,
    requestCorrection,
    confirmBilling,
    submitInvoice,
    acknowledgeAgreement,
    sendChatMessage,
  } = useDesignVendorBilling(repository)

  const [chatText, setChatText] = useState("")

  const handleSendChat = useCallback(() => {
    if (!selectedBillingId || !chatText.trim()) return
    sendChatMessage(selectedBillingId, chatText)
    setChatText("")
  }, [selectedBillingId, chatText, sendChatMessage])

  const handleRequestCorrection = useCallback(() => {
    if (!selectedBillingId) return
    requestCorrection(selectedBillingId)
  }, [selectedBillingId, requestCorrection])

  const handleConfirm = useCallback(() => {
    if (!selectedBillingId) return
    confirmBilling(selectedBillingId)
  }, [selectedBillingId, confirmBilling])

  const handleSubmitInvoice = useCallback(() => {
    if (!selectedBillingId) return
    submitInvoice(selectedBillingId)
  }, [selectedBillingId, submitInvoice])

  const handleAcknowledge = useCallback(() => {
    if (!selectedBillingId) return
    acknowledgeAgreement(selectedBillingId)
  }, [selectedBillingId, acknowledgeAgreement])

  return (
    <DesignVendorBillingView
      vendors={vendors}
      selectedVendorId={selectedVendorId}
      onSelectVendor={setSelectedVendorId}
      selectedVendorName={selectedVendorName}
      billings={billings}
      selectedBillingId={selectedBillingId}
      onSelectBilling={setSelectedBillingId}
      selectedBilling={selectedBilling}
      chatText={chatText}
      onChatTextChange={setChatText}
      onSendChat={handleSendChat}
      onRequestCorrection={handleRequestCorrection}
      onConfirm={handleConfirm}
      onSubmitInvoice={handleSubmitInvoice}
      onAcknowledge={handleAcknowledge}
    />
  )
}
