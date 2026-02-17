import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, FileText } from "lucide-react"
import type { ProductManagementDashboardTab } from "@/features/product-management-dashboard/model/types"
import { MachineMasterSectionView } from "@/features/product-management-dashboard/ui/sections/MachineMasterSection.view"
import { ProjectMachinesSectionView } from "@/features/product-management-dashboard/ui/sections/ProjectMachinesSection.view"
import type { ProjectWithMachines } from "@/features/product-management-dashboard/ui/sections/ProjectMachinesSection.view"
import { DuringEventSectionView } from "@/features/product-management-dashboard/ui/sections/DuringEventSection.view"
import type { DuringEventProduct } from "@/features/product-management-dashboard/ui/sections/DuringEventSection.view"
import { PostEventSectionView } from "@/features/product-management-dashboard/ui/sections/PostEventSection.view"
import type { PostEventProduct } from "@/features/product-management-dashboard/ui/sections/PostEventSection.view"
import { BannerCreateModalView } from "@/features/product-management-dashboard/ui/sections/BannerCreateModal.view"
import { ChatDrawerView } from "@/new/features/product-management-dashboard/ui/modals/ChatDrawer.view"
import type { BannerEditState, MachineMaster } from "@/features/product-management-dashboard/model/types"
import type { ProjectMachinesSubTab } from "@/new/features/product-management-dashboard/hooks/useProductManagementDashboard"

const subTabTriggerClass = "relative px-3 py-2 text-sm font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-amber-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"

export type ProductManagementDashboardViewProps = {
  activeTab: ProductManagementDashboardTab
  onActiveTabChange: (tab: ProductManagementDashboardTab) => void
  // 機種マスタ
  machineMasters: MachineMaster[]
  newMachineName: string
  newPachitownName: string
  onNewMachineNameChange: (v: string) => void
  onNewPachitownNameChange: (v: string) => void
  onAddMachineMaster: () => void
  onRemoveMachineMaster: (id: number) => void
  addMachineMasterDisabled: boolean
  // スロセレの案件（サブタブ）
  projectMachinesSubTab: ProjectMachinesSubTab
  onProjectMachinesSubTabChange: (tab: ProjectMachinesSubTab) => void
  // 実施前
  preEventProjects: ProjectWithMachines[]
  onOpenBanner: (productId: number) => void
  onPachitownLink: (productId: number) => void
  onSendTargetMachineForm: (productId: number) => void
  // 実施中
  duringEventProducts: DuringEventProduct[]
  onLinkInterimPachitown: (productId: number) => void
  // 実施後
  postEventProducts: PostEventProduct[]
  onLinkPostEventPachitown: (productId: number) => void
  // 機種名編集
  editingProductId: number | null
  editingMachineIndex: number | null
  editingMachineName: string
  onStartEditMachine: (productId: number, index: number, currentName: string) => void
  onEditMachineNameChange: (value: string) => void
  onSaveEditMachine: (productId: number, index: number) => void
  onCancelEditMachine: () => void
  // バナー作成モーダル
  bannerModalOpen: boolean
  onBannerModalOpenChange: (open: boolean) => void
  bannerEdit: BannerEditState
  onBannerEditChange: (updates: Partial<BannerEditState>) => void
  onCloseBannerModal: () => void
  // チャット
  onOpenChat: (productId: number) => void
  showChatDrawer: boolean
  onChatDrawerOpenChange: (open: boolean) => void
  chatProductId: number | null
  chatProductName: string
  // トースト
  toastMessage: string | null
}


export const ProductManagementDashboardView = ({
  activeTab,
  onActiveTabChange,
  machineMasters,
  newMachineName,
  newPachitownName,
  onNewMachineNameChange,
  onNewPachitownNameChange,
  onAddMachineMaster,
  onRemoveMachineMaster,
  addMachineMasterDisabled,
  projectMachinesSubTab,
  onProjectMachinesSubTabChange,
  preEventProjects,
  onOpenBanner,
  onPachitownLink,
  onSendTargetMachineForm,
  duringEventProducts,
  onLinkInterimPachitown,
  postEventProducts,
  onLinkPostEventPachitown,
  editingProductId,
  editingMachineIndex,
  editingMachineName,
  onStartEditMachine,
  onEditMachineNameChange,
  onSaveEditMachine,
  onCancelEditMachine,
  bannerModalOpen,
  onBannerModalOpenChange,
  bannerEdit,
  onBannerEditChange,
  onCloseBannerModal,
  onOpenChat,
  showChatDrawer,
  onChatDrawerOpenChange,
  chatProductId,
  chatProductName,
  toastMessage,
}: ProductManagementDashboardViewProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">商材管理課 ダッシュボード</h1>
        <p className="text-slate-600 mt-1">
          機種マスタの管理、スロセレの案件管理（実施前・実施中・実施後）を行います
        </p>
      </div>

      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-md shadow-lg">
          {toastMessage}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => onActiveTabChange(v as ProductManagementDashboardTab)} className="w-full">
        <div className="border-b border-slate-100 mb-6">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            <TabsTrigger
              value="projectMachines"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-amber-600 after:scale-x-0 data-[state=active]:after:scale-x-100"
            >
              <FileText className="h-4 w-4 mr-1.5 inline" />
              案件管理
            </TabsTrigger>
            <TabsTrigger
              value="machineMaster"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-amber-600 after:scale-x-0 data-[state=active]:after:scale-x-100"
            >
              <Package className="h-4 w-4 mr-1.5 inline" />
              機種マスタ
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="machineMaster" className="mt-0 space-y-6">
          <MachineMasterSectionView
            machineMasters={machineMasters}
            newName={newMachineName}
            newPachitownName={newPachitownName}
            onNewNameChange={onNewMachineNameChange}
            onNewPachitownNameChange={onNewPachitownNameChange}
            onAdd={onAddMachineMaster}
            onRemove={onRemoveMachineMaster}
            addDisabled={addMachineMasterDisabled}
          />
        </TabsContent>

        <TabsContent value="projectMachines" className="mt-0 space-y-6">
          <Tabs value={projectMachinesSubTab} onValueChange={(v) => onProjectMachinesSubTabChange(v as ProjectMachinesSubTab)}>
            <div className="border-b border-slate-100 mb-6">
              <TabsList className="bg-transparent h-auto p-0 gap-0">
                <TabsTrigger value="pre-event" className={subTabTriggerClass}>
                  実施前
                  {preEventProjects.length > 0 && (
                    <Badge className="ml-1.5 bg-amber-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {preEventProjects.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="during-event" className={subTabTriggerClass}>
                  実施中
                  {duringEventProducts.length > 0 && (
                    <Badge className="ml-1.5 bg-blue-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {duringEventProducts.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="post-event" className={subTabTriggerClass}>
                  実施後
                  {postEventProducts.length > 0 && (
                    <Badge className="ml-1.5 bg-emerald-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {postEventProducts.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="pre-event" className="mt-0">
              <ProjectMachinesSectionView
                projects={preEventProjects}
                onOpenBanner={onOpenBanner}
                onPachitownLink={onPachitownLink}
                onOpenChat={onOpenChat}
                onSendTargetMachineForm={onSendTargetMachineForm}
                editingProductId={editingProductId}
                editingMachineIndex={editingMachineIndex}
                editingMachineName={editingMachineName}
                onStartEditMachine={onStartEditMachine}
                onEditMachineNameChange={onEditMachineNameChange}
                onSaveEditMachine={onSaveEditMachine}
                onCancelEditMachine={onCancelEditMachine}
              />
            </TabsContent>

            <TabsContent value="during-event" className="mt-0">
              <DuringEventSectionView
                products={duringEventProducts}
                onLinkInterimPachitown={onLinkInterimPachitown}
                onOpenChat={onOpenChat}
              />
            </TabsContent>

            <TabsContent value="post-event" className="mt-0">
              <PostEventSectionView
                products={postEventProducts}
                onLinkPostEventPachitown={onLinkPostEventPachitown}
                onOpenChat={onOpenChat}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <BannerCreateModalView
        open={bannerModalOpen}
        onOpenChange={onBannerModalOpenChange}
        bannerEdit={bannerEdit}
        onBannerEditChange={onBannerEditChange}
        onClose={onCloseBannerModal}
      />

      <ChatDrawerView
        open={showChatDrawer}
        onOpenChange={onChatDrawerOpenChange}
        productId={chatProductId}
        productName={chatProductName}
      />
    </div>
  )
}
