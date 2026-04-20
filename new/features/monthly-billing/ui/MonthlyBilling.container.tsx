"use client"

import { useState, useCallback, useMemo } from "react"
import type { ProjectRepository } from "@/new/api/project-repository"
import { useMonthlyBilling } from "../hooks/useMonthlyBilling"
import { MonthlyBillingView } from "./MonthlyBilling.view"

export interface MonthlyBillingContainerProps {
  repository: ProjectRepository
}

export const MonthlyBillingContainer = ({ repository }: MonthlyBillingContainerProps) => {
  const billing = useMonthlyBilling(repository)

  const [chatText, setChatText] = useState("")

  const handleSendChat = useCallback(() => {
    if (!billing.selectedBillingId || !chatText.trim()) return
    billing.sendChatMessage(billing.selectedBillingId, chatText)
    setChatText("")
  }, [billing, chatText])

  const handleSendToVendor = useCallback(() => {
    if (!billing.selectedBillingId) return
    billing.sendToVendor(billing.selectedBillingId)
  }, [billing])

  const handleResendToVendor = useCallback(() => {
    if (!billing.selectedBillingId) return
    billing.resendToVendor(billing.selectedBillingId)
  }, [billing])

  const handleSendAgreement = useCallback(() => {
    if (!billing.selectedBillingId) return
    billing.sendAgreement(billing.selectedBillingId)
  }, [billing])

  // Get hall quote for selected invoice row
  const invoiceHallQuote = useMemo(() => {
    if (!billing.selectedInvoiceRow) return null
    return billing.getInvoiceHallQuote(billing.selectedInvoiceRow.productId, billing.selectedInvoiceRow.hallIndex)
  }, [billing.selectedInvoiceRow, billing.getInvoiceHallQuote])

  // Master data
  const companies = useMemo(() => repository.getCompanies(), [repository])
  const halls = useMemo(() => repository.getHalls(), [repository])

  return (
    <MonthlyBillingView
      billingMode={billing.billingMode}
      onChangeBillingMode={billing.setBillingMode}
      selectedMonth={billing.selectedMonth}
      onChangeMonth={billing.setSelectedMonth}
      billings={billing.billings}
      selectedBillingId={billing.selectedBillingId}
      onSelectBilling={billing.setSelectedBillingId}
      selectedBilling={billing.selectedBilling}
      onExtractBillings={billing.extractBillings}
      onSendToVendor={handleSendToVendor}
      onResendToVendor={handleResendToVendor}
      onSendAgreement={handleSendAgreement}
      chatText={chatText}
      onChatTextChange={setChatText}
      onSendChat={handleSendChat}
      allAcknowledged={billing.allAcknowledged}
      closingReported={billing.closingReported}
      onReportClosing={billing.reportClosing}
      onDownloadCsv={billing.downloadCsv}
      pendingCarryOver={billing.pendingCarryOver}
      onConfirmCarryOver={billing.confirmCarryOverAndExtract}
      onCancelCarryOver={billing.cancelCarryOver}
      carriedOverItems={billing.carriedOverItems}
      // 請求タブ
      invoiceFilters={billing.invoiceFilters}
      onInvoiceFiltersChange={billing.setInvoiceFilters}
      invoiceRows={billing.filteredInvoiceRows}
      selectedInvoiceRow={billing.selectedInvoiceRow}
      onSelectInvoiceRow={billing.setSelectedInvoiceRow}
      invoiceHallQuote={invoiceHallQuote}
      // 支払いタブ
      paymentFilters={billing.paymentFilters}
      onPaymentFiltersChange={billing.setPaymentFilters}
      paymentRows={billing.filteredPaymentRows}
      selectedPaymentRow={billing.selectedPaymentRow}
      onSelectPaymentRow={billing.setSelectedPaymentRow}
      onPaymentRowClick={billing.handlePaymentRowClick}
      // master data
      companies={companies}
      halls={halls}
    />
  )
}
