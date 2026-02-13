import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { UseLotteryFormReturn } from "@/new/features/project-registration/hooks/useLotteryForm"
import { LotteryBasicInfo } from "./LotteryBasicInfo"
import { LotteryPrizeSet } from "./LotteryPrizeSet"
import { LotteryQuoteConfig } from "./LotteryQuoteConfig"
import { LotteryStatus } from "./LotteryStatus"
import { LotteryProduction } from "./LotteryProduction"

type LotteryTabsProps = {
  lotteryForm: UseLotteryFormReturn
}

export const LotteryTabs = ({ lotteryForm: f }: LotteryTabsProps) => {
  return (
    <Tabs value={f.activeTab} onValueChange={f.setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-5">
        <TabsTrigger value="basic-info" className="text-xs">① 基本情報</TabsTrigger>
        <TabsTrigger value="prize-set" className="text-xs">② 景品セット</TabsTrigger>
        <TabsTrigger value="status" className="text-xs">③ ステータス</TabsTrigger>
        <TabsTrigger value="quote" className="text-xs">④ 見積り</TabsTrigger>
        <TabsTrigger value="production" className="text-xs">⑤ 制作進行</TabsTrigger>
      </TabsList>

      <TabsContent value="basic-info" className="mt-4">
        <LotteryBasicInfo
          halls={f.halls}
          dmMailing={f.dmMailing}
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
          onDmMailingChange={f.setDmMailing}
          onEventStartDateChange={f.setEventStartDate}
          onEventEndDateChange={f.setEventEndDate}
          onSalesPersonChange={(id, name) => { f.setSalesPersonId(id); f.setSalesPersonName(name) }}
          onInsightPersonChange={(id, name) => { f.setInsightPersonId(id); f.setInsightPersonName(name) }}
          onEventNameChange={f.setEventName}
          getHallsByCompanyId={f.getHallsByCompanyId}
        />
      </TabsContent>

      <TabsContent value="prize-set" className="mt-4">
        <LotteryPrizeSet
          selectedPrizeSetId={f.selectedPrizeSetId}
          prizeInfo={f.prizeInfo}
          vendorCount={f.vendorCount}
          onSelectPrizeSet={f.selectPrizeSet}
          onAddPrize={f.addPrize}
          onRemovePrize={f.removePrize}
          onUpdatePrize={f.updatePrize}
        />
      </TabsContent>

      <TabsContent value="status" className="mt-4">
        <LotteryStatus
          proposalStatus={f.proposalStatus}
          readingCertainty={f.readingCertainty}
          executionStatus={f.executionStatus}
          onStatusChange={f.handleStatusChange}
          onReadingCertaintyChange={f.setReadingCertainty}
          onExecutionStatusChange={f.setExecutionStatus}
          onConfirmOrder={f.handleConfirmOrder}
        />
      </TabsContent>

      <TabsContent value="quote" className="mt-4">
        <LotteryQuoteConfig
          totalQuoteItems={f.quoteConfig.totalQuoteItems}
          posterPrintQuantity={f.posterPrintQuantity}
          posterPrintUnitPrice={f.posterPrintUnitPrice}
          dmOrderCount={f.dmOrderCount}
          dmMailing={f.dmMailing}
          onTotalQuoteItemChange={f.updateTotalQuoteItem}
          onPosterPrintQuantityChange={f.setPosterPrintQuantity}
          onPosterPrintUnitPriceChange={f.setPosterPrintUnitPrice}
          onDmOrderCountChange={f.setDmOrderCount}
          proportionMode={f.proportionMode}
          halls={f.halls}
          hallPercentages={f.hallPercentages}
          companyPercentages={f.companyPercentages}
          onProportionModeChange={f.setProportionMode}
          onHallPercentageChange={f.updateHallPercentage}
          onCompanyPercentageChange={f.updateCompanyPercentage}
          onDistributeEvenly={f.handleDistributeEvenly}
          totalAmount={f.quoteCalc.totalAmount}
          percentageSum={f.quoteCalc.percentageSum}
          isPercentageValid={f.quoteCalc.isPercentageValid}
          quoteGenerated={f.quoteGenerated}
          hallQuotes={f.hallQuotes}
        />
      </TabsContent>

      <TabsContent value="production" className="mt-4">
        <LotteryProduction
          productId={f.productId}
          posterStatus={f.posterStatus}
          dmStatus={f.dmStatus}
          dmMailing={f.dmMailing}
          latestPosterRequest={f.latestPosterRequest}
          posterRequests={f.posterRequests}
          aiProofing={f.aiProofing}
          proofingComplete={f.proofingComplete}
          showDateError={f.showDateError}
          showFontError={f.showFontError}
          onAIProofing={f.handleAIProofing}
          posterCommentText={f.posterCommentText}
          onPosterCommentTextChange={f.setPosterCommentText}
          onSendPosterComment={f.handlePosterComment}
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
      </TabsContent>
    </Tabs>
  )
}
