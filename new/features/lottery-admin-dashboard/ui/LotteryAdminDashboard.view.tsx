import type { ReactNode } from "react"
import type { Product, DesignRequest } from "@/new/api/types"
import type { ProductListItem, DesignVendorOption } from "../hooks/useLotteryAdminDashboard"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProductListPanelView } from "./ProductListPanel.view"
import { WinnerListSectionView } from "./WinnerListSection.view"
import { NotificationOrderSectionView } from "./NotificationOrderSection.view"
import { PrizeOrderSectionView } from "./PrizeOrderSection.view"

export interface LotteryAdminDashboardViewProps {
  // Product list
  productList: ProductListItem[]
  selectedProductId: number | null
  onSelectProduct: (id: number) => void
  // Selected product
  selectedProduct: Product | null
  // Winner list
  onUploadWinnerListPsp: () => void
  onUploadWinnerListPspWithError: () => void
  onUploadWinnerListFile: () => void
  onResetWinnerList: () => void
  onDismissWinnerListError: () => void
  winnerListHasError: boolean
  onValidateWinnerList: () => void
  // Notification order
  onGenerateNotificationOrder: () => void
  onSelectNotificationVendor: (vendorId: string, vendorName: string) => void
  selectedNotificationVendor: { id: string; name: string } | null
  onRequestSendNotification: () => void
  onConfirmSendNotification: () => void
  onCancelSendNotification: () => void
  pendingNotificationVendor: { id: string; name: string } | null
  designVendors: DesignVendorOption[]
  notificationDesignRequests: DesignRequest[]
  notificationCommentText: string
  onNotificationCommentTextChange: (text: string) => void
  onAddNotificationComment: (requestId: string, text: string) => void
  // Prize orders
  onGeneratePrizeOrders: () => void
  desiredDeliveryDate: string
  onDesiredDeliveryDateChange: (date: string) => void
  onRequestSendPrizeOrder: (vendorId: string) => void
  onConfirmSendPrizeOrder: () => void
  onCancelSendPrizeOrder: () => void
  pendingPrizeVendorId: string | null
  // Billing tab
  billingTab: ReactNode
}

export const LotteryAdminDashboardView = ({
  productList,
  selectedProductId,
  onSelectProduct,
  selectedProduct,
  onUploadWinnerListPsp,
  onUploadWinnerListPspWithError,
  onUploadWinnerListFile,
  onResetWinnerList,
  onDismissWinnerListError,
  winnerListHasError,
  onValidateWinnerList,
  onGenerateNotificationOrder,
  onSelectNotificationVendor,
  selectedNotificationVendor,
  onRequestSendNotification,
  onConfirmSendNotification,
  onCancelSendNotification,
  pendingNotificationVendor,
  designVendors,
  notificationDesignRequests,
  notificationCommentText,
  onNotificationCommentTextChange,
  onAddNotificationComment,
  onGeneratePrizeOrders,
  desiredDeliveryDate,
  onDesiredDeliveryDateChange,
  onRequestSendPrizeOrder,
  onConfirmSendPrizeOrder,
  onCancelSendPrizeOrder,
  pendingPrizeVendorId,
  billingTab,
}: LotteryAdminDashboardViewProps) => {
  return (
    <Tabs defaultValue="products" className="h-[calc(100vh-64px)] flex flex-col">
      <div className="border-b px-4 pt-2">
        <TabsList>
          <TabsTrigger value="products">商材管理</TabsTrigger>
          <TabsTrigger value="billing">月次計上</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="products" className="flex-1 overflow-hidden mt-0">
        <div className="flex h-full">
          {/* Left panel: Product list */}
          <ProductListPanelView
            products={productList}
            selectedProductId={selectedProductId}
            onSelectProduct={onSelectProduct}
          />

          {/* Right panel: Detail */}
          <div className="flex-1 overflow-y-auto">
            {!selectedProduct ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                左のリストから商材を選択してください
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-xl font-bold">{selectedProduct.eventProductName}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedProduct.projectNumber} | {selectedProduct.hallNames?.join("、") ?? ""}
                    {selectedProduct.eventStartDate && (
                      <span>
                        {" "}
                        | {selectedProduct.eventStartDate}
                        {selectedProduct.eventEndDate ? ` 〜 ${selectedProduct.eventEndDate}` : ""}
                      </span>
                    )}
                  </p>
                </div>

                {/* 1. Winner List */}
                <WinnerListSectionView
                  winnerList={selectedProduct.winnerList}
                  winnerListUploadedAt={selectedProduct.winnerListUploadedAt}
                  winnerListValidatedAt={selectedProduct.winnerListValidatedAt}
                  winnerListHasError={winnerListHasError}
                  onUploadPsp={onUploadWinnerListPsp}
                  onUploadPspWithError={onUploadWinnerListPspWithError}
                  onUploadFile={onUploadWinnerListFile}
                  onReset={onResetWinnerList}
                  onDismissError={onDismissWinnerListError}
                  onValidate={onValidateWinnerList}
                />

                {/* 2. Notification Order */}
                <NotificationOrderSectionView
                  notificationOrderGeneratedAt={selectedProduct.notificationOrderGeneratedAt}
                  notificationOrderSentAt={selectedProduct.notificationOrderSentAt}
                  notificationOrderDesignVendorName={selectedProduct.notificationOrderDesignVendorName}
                  winnerCount={selectedProduct.winnerList?.length ?? 0}
                  designVendors={designVendors}
                  notificationDesignRequests={notificationDesignRequests}
                  notificationCommentText={notificationCommentText}
                  onNotificationCommentTextChange={onNotificationCommentTextChange}
                  onGenerate={onGenerateNotificationOrder}
                  onSelectVendor={onSelectNotificationVendor}
                  selectedVendor={selectedNotificationVendor}
                  onRequestSend={onRequestSendNotification}
                  onConfirmSend={onConfirmSendNotification}
                  onCancelSend={onCancelSendNotification}
                  pendingVendor={pendingNotificationVendor}
                  onAddComment={onAddNotificationComment}
                  canGenerate={!!selectedProduct.winnerListValidatedAt}
                />

                {/* 3. Prize Orders + Delivery Info */}
                <PrizeOrderSectionView
                  prizeOrdersByVendor={selectedProduct.prizeOrdersByVendor}
                  prizeOrderGeneratedAt={selectedProduct.prizeOrderGeneratedAt}
                  prizeOrderRequestedAt={selectedProduct.prizeOrderRequestedAt}
                  prizeDeliveryInfoByVendor={selectedProduct.prizeDeliveryInfoByVendor}
                  canGenerate={!!selectedProduct.winnerListValidatedAt}
                  desiredDeliveryDate={desiredDeliveryDate}
                  onDesiredDeliveryDateChange={onDesiredDeliveryDateChange}
                  onGenerate={onGeneratePrizeOrders}
                  onRequestSend={onRequestSendPrizeOrder}
                  onConfirmSend={onConfirmSendPrizeOrder}
                  onCancelSend={onCancelSendPrizeOrder}
                  pendingVendorId={pendingPrizeVendorId}
                />
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="billing" className="flex-1 overflow-hidden mt-0">
        {billingTab}
      </TabsContent>
    </Tabs>
  )
}
