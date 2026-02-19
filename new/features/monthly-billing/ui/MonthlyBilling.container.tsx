"use client"

import { useState, useCallback } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import { useMonthlyBilling } from "../hooks/useMonthlyBilling"
import { MonthlyBillingView } from "./MonthlyBilling.view"

export interface MonthlyBillingContainerProps {
  repository: ProjectRepository
}

export const MonthlyBillingContainer = ({ repository }: MonthlyBillingContainerProps) => {
  const {
    billingMode,
    setBillingMode,
    selectedMonth,
    setSelectedMonth,
    billings,
    selectedBillingId,
    setSelectedBillingId,
    selectedBilling,
    extractBillings,
    sendToVendor,
    resendToVendor,
    sendAgreement,
    sendChatMessage,
    allAcknowledged,
    closingReported,
    reportClosing,
    downloadCsv,
    customerBillingRows,
    extractCustomerBillings,
    downloadCustomerBillingCsv,
  } = useMonthlyBilling(repository)

  const [chatText, setChatText] = useState("")

  const handleSendChat = useCallback(() => {
    if (!selectedBillingId || !chatText.trim()) return
    sendChatMessage(selectedBillingId, chatText)
    setChatText("")
  }, [selectedBillingId, chatText, sendChatMessage])

  const handleSendToVendor = useCallback(() => {
    if (!selectedBillingId) return
    sendToVendor(selectedBillingId)
  }, [selectedBillingId, sendToVendor])

  const handleResendToVendor = useCallback(() => {
    if (!selectedBillingId) return
    resendToVendor(selectedBillingId)
  }, [selectedBillingId, resendToVendor])

  const handleSendAgreement = useCallback(() => {
    if (!selectedBillingId) return
    sendAgreement(selectedBillingId)
  }, [selectedBillingId, sendAgreement])

  return (
    <MonthlyBillingView
      billingMode={billingMode}
      onChangeBillingMode={setBillingMode}
      selectedMonth={selectedMonth}
      onChangeMonth={setSelectedMonth}
      billings={billings}
      selectedBillingId={selectedBillingId}
      onSelectBilling={setSelectedBillingId}
      selectedBilling={selectedBilling}
      onExtractBillings={extractBillings}
      onSendToVendor={handleSendToVendor}
      onResendToVendor={handleResendToVendor}
      onSendAgreement={handleSendAgreement}
      chatText={chatText}
      onChatTextChange={setChatText}
      onSendChat={handleSendChat}
      allAcknowledged={allAcknowledged}
      closingReported={closingReported}
      onReportClosing={reportClosing}
      onDownloadCsv={downloadCsv}
      customerBillingRows={customerBillingRows}
      onExtractCustomerBillings={extractCustomerBillings}
      onDownloadCustomerBillingCsv={downloadCustomerBillingCsv}
    />
  )
}
