"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UseLotteryFormReturn } from "@/new/features/project-registration/hooks/useLotteryForm"
import type { Role } from "@/new/types/role"
import { LotteryBasicInfo } from "./LotteryBasicInfo"
import { LotteryPrizeSet } from "./LotteryPrizeSet"
import { LotteryQuoteInputs } from "./LotteryQuoteInputs"
import { LotteryQuoteConfig } from "./LotteryQuoteConfig"
import { DesignVendorEstimateSection } from "./DesignVendorEstimateSection"
import { LotteryProduction } from "./LotteryProduction"
import { ExtractionConditionSection } from "./ExtractionConditionSection"
import { ProductManagementSection } from "./ProductManagementSection"
import { PspLinkButton } from "../PspLinkButton"

type LotteryTabsProps = {
  lotteryForm: UseLotteryFormReturn
}

const SectionCard = ({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base font-bold text-slate-900">{title}</CardTitle>
        {right}
      </div>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
)

export const LotteryTabs = ({ lotteryForm: f }: LotteryTabsProps) => {
  const search = useSearchParams()
  const role = (search?.get("role") as Role | null) ?? "Sales"
  const isSalesOrInternal = role === "Sales" || role === "Internal"
  const isSmartPoint = f.serviceName === "SmartPoint"

  return (
    <div className="space-y-6">
      <SectionCard title="基本情報" right={<PspLinkButton productId={f.productId} />}>
        <LotteryBasicInfo
          halls={f.halls}
          serviceName={f.serviceName}
          posterDesignChange={f.posterDesignChange}
          eventStartDate={f.eventStartDate}
          eventEndDate={f.eventEndDate}
          salesPersonName={f.salesPersonName}
          insightPersonName={f.insightPersonName}
          eventName={f.eventName}
          allHalls={f.allHalls}
          allCompanies={f.allCompanies}
          allEmployees={f.allEmployees}
          onAddHall={f.addHall}
          onRemoveHall={f.removeHall}
          onSelectCompanyForHall={f.selectCompanyForHall}
          onSelectHallForEntry={f.selectHallForEntry}
          onServiceNameChange={f.setServiceName}
          onPosterDesignChangeChange={f.setPosterDesignChange}
          onEventStartDateChange={f.setEventStartDate}
          onEventEndDateChange={f.setEventEndDate}
          onSalesPersonChange={(id, name) => { f.setSalesPersonId(id); f.setSalesPersonName(name) }}
          onInsightPersonChange={(id, name) => { f.setInsightPersonId(id); f.setInsightPersonName(name) }}
          onEventNameChange={f.setEventName}
          getHallsByCompanyId={f.getHallsByCompanyId}
        />
      </SectionCard>

      <SectionCard title="景品セット">
        <LotteryPrizeSet
          selectedPrizeSetId={f.selectedPrizeSetId}
          prizeInfo={f.prizeInfo}
          vendorCount={f.vendorCount}
          onSelectPrizeSet={f.selectPrizeSet}
          onAddPrize={f.addPrize}
          onRemovePrize={f.removePrize}
          onUpdatePrize={f.updatePrize}
        />
      </SectionCard>

      <SectionCard title="告知DM">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">告知DM</Label>
          <Select value={f.dmMailing} onValueChange={(v) => f.setDmMailing(v as "yes" | "no")}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no" className="text-xs">無</SelectItem>
              <SelectItem value="yes" className="text-xs">有</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isSmartPoint && f.dmMailing === "yes" && (isSalesOrInternal || role === "LotteryAdmin") && (
          <ExtractionConditionSection productId={f.productId} />
        )}
      </SectionCard>

      <SectionCard title="見積り">
        {role === "Sales" && f.posterDesignChange === "yes" && (
          <DesignVendorEstimateSection
            productId={f.productId}
            onApplyQuoteToItem={(amount) => {
              f.updateTotalQuoteItem(1, String(amount))
              f.addDesignCorrectionToHallQuotes(amount)
            }}
          />
        )}
        {role === "Sales" && (
          <LotteryQuoteInputs
            totalQuoteItems={f.quoteConfig.totalQuoteItems}
            posterPrintQuantity={f.posterPrintQuantity}
            posterPrintUnitPrice={f.posterPrintUnitPrice}
            dmOrderCount={f.dmOrderCount}
            dmMailing={f.dmMailing}
            onTotalQuoteItemChange={f.updateTotalQuoteItem}
            onPosterPrintQuantityChange={f.setPosterPrintQuantity}
            onPosterPrintUnitPriceChange={f.setPosterPrintUnitPrice}
            onDmOrderCountChange={f.setDmOrderCount}
          />
        )}
        <LotteryQuoteConfig
          quoteGenerated={f.quoteGenerated}
          hallQuotes={f.hallQuotes}
          dmMailing={f.dmMailing}
          onUpdateItem={f.updateHallQuoteItem}
          readOnly={role !== "Sales"}
        />
      </SectionCard>

      {(role !== "Sales" || f.proposalStatus === "order-received") && (
      <SectionCard title="制作進行">
        <LotteryProduction
          productId={f.productId}
          posterStatus={f.posterStatus}
          dmStatus={f.dmStatus}
          dmMailing={f.dmMailing}
          posterDesignChange={f.posterDesignChange}
          latestPosterRequest={f.latestPosterRequest}
          posterRequests={f.posterRequests}
          aiProofing={f.aiProofing}
          proofingComplete={f.proofingComplete}
          showDateError={f.showDateError}
          showFontError={f.showFontError}
          onAIProofing={f.handleAIProofing}
          posterSentToCustomer={f.posterSentToCustomer}
          onSendPosterToCustomer={f.handleSendPosterToCustomer}
          showPosterOrderModal={f.showPosterOrderModal}
          onShowPosterOrderModal={f.setShowPosterOrderModal}
          posterOrderVendorId={f.posterOrderVendorId}
          onPosterOrderVendorIdChange={f.setPosterOrderVendorId}
          onPosterOrder={f.handlePosterOrder}
          dmRequests={f.dmRequests}
          latestDmRequest={f.latestDmRequest}
          showDmCreateModal={f.showDmCreateModal}
          onShowDmCreateModal={f.setShowDmCreateModal}
          dmCreateVendorId={f.dmCreateVendorId}
          onDmCreateVendorIdChange={f.setDmCreateVendorId}
          onDmCreate={f.handleDmCreate}
          eventName={f.eventName}
          eventStartDate={f.eventStartDate}
          eventEndDate={f.eventEndDate}
          halls={f.halls}
        />
      </SectionCard>
      )}

      {f.productId && (role === "LotteryAdmin" || (isSalesOrInternal && !isSmartPoint)) && (role !== "Sales" || f.proposalStatus === "order-received") && (
        <SectionCard title="商材管理">
          <ProductManagementSection productId={f.productId} serviceName={f.serviceName} />
        </SectionCard>
      )}
    </div>
  )
}
