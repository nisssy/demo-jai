import type { Product, DesignRequest } from "@/new/api/types"
import type { ProductListItem, DesignVendorOption } from "../hooks/useLotteryAdminDashboard"
import { ProductListPanelView } from "./ProductListPanel.view"
import { WinnerListSectionView } from "./WinnerListSection.view"
import { NotificationOrderSectionView } from "./NotificationOrderSection.view"
import { PrizeOrderSectionView } from "./PrizeOrderSection.view"
import { DeliveryInfoSectionView } from "./DeliveryInfoSection.view"
import { DesignRequestSectionView } from "./DesignRequestSection.view"
import { QuoCardSectionView } from "./QuoCardSection.view"

export interface LotteryAdminDashboardViewProps {
  // Product list
  productList: ProductListItem[]
  selectedProductId: number | null
  onSelectProduct: (id: number) => void
  // Selected product
  selectedProduct: Product | null
  // Winner list
  onUploadWinnerList: () => void
  onValidateWinnerList: () => void
  // Notification order
  onGenerateNotificationOrder: () => void
  onSendNotificationOrder: (vendorId: string, vendorName: string) => void
  designVendors: DesignVendorOption[]
  // Prize orders
  onGeneratePrizeOrders: () => void
  onSendPrizeOrder: () => void
  // QuoCard
  onCheckQuoCardLetter: () => void
  // Design requests
  designRequests: DesignRequest[]
  commentText: string
  onCommentTextChange: (text: string) => void
  onAddComment: (requestId: string) => void
}

export const LotteryAdminDashboardView = ({
  productList,
  selectedProductId,
  onSelectProduct,
  selectedProduct,
  onUploadWinnerList,
  onValidateWinnerList,
  onGenerateNotificationOrder,
  onSendNotificationOrder,
  designVendors,
  onGeneratePrizeOrders,
  onSendPrizeOrder,
  onCheckQuoCardLetter,
  designRequests,
  commentText,
  onCommentTextChange,
  onAddComment,
}: LotteryAdminDashboardViewProps) => {
  return (
    <div className="flex h-[calc(100vh-64px)]">
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
              onUpload={onUploadWinnerList}
              onValidate={onValidateWinnerList}
            />

            {/* 2. Notification Order */}
            <NotificationOrderSectionView
              notificationOrderGeneratedAt={selectedProduct.notificationOrderGeneratedAt}
              notificationOrderSentAt={selectedProduct.notificationOrderSentAt}
              notificationOrderDesignVendorName={selectedProduct.notificationOrderDesignVendorName}
              designVendors={designVendors}
              onGenerate={onGenerateNotificationOrder}
              onSend={onSendNotificationOrder}
            />

            {/* 3. Prize Orders */}
            <PrizeOrderSectionView
              prizeOrdersByVendor={selectedProduct.prizeOrdersByVendor}
              prizeOrderGeneratedAt={selectedProduct.prizeOrderGeneratedAt}
              prizeOrderRequestedAt={selectedProduct.prizeOrderRequestedAt}
              onGenerate={onGeneratePrizeOrders}
              onSend={onSendPrizeOrder}
            />

            {/* 4. Delivery Info */}
            <DeliveryInfoSectionView
              prizeDeliveryInfoByVendor={selectedProduct.prizeDeliveryInfoByVendor}
            />

            {/* 5. Design Requests */}
            <DesignRequestSectionView
              designRequests={designRequests}
              commentText={commentText}
              onCommentTextChange={onCommentTextChange}
              onAddComment={onAddComment}
            />

            {/* 6. QuoCard Letter Check */}
            <QuoCardSectionView
              quoCardLetterCheckedAt={selectedProduct.quoCardLetterCheckedAt}
              onCheck={onCheckQuoCardLetter}
            />
          </div>
        )}
      </div>
    </div>
  )
}
