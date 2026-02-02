import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, FileText } from "lucide-react"
import type { ProductManagementDashboardTab } from "@/features/product-management-dashboard/hooks/useProductManagementDashboard"
import { MachineMasterSectionView } from "@/features/product-management-dashboard/ui/sections/MachineMasterSection.view"
import { ProjectMachinesSectionView } from "@/features/product-management-dashboard/ui/sections/ProjectMachinesSection.view"
import type { ProjectWithMachines } from "@/features/product-management-dashboard/ui/sections/ProjectMachinesSection.view"
import { BannerCreateModalView } from "@/features/product-management-dashboard/ui/sections/BannerCreateModal.view"
import type { BannerEditState, MachineMaster } from "@/features/product-management-dashboard/model/types"

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
  // スロセレの案件
  projectMachinesList: ProjectWithMachines[]
  onOpenBanner: (productId: number) => void
  onPachitownLink: (productId: number) => void
  // バナー作成モーダル
  bannerModalOpen: boolean
  onBannerModalOpenChange: (open: boolean) => void
  bannerEdit: BannerEditState
  onBannerEditChange: (updates: Partial<BannerEditState>) => void
  onCloseBannerModal: () => void
  onBannerModalOpenChange: (open: boolean) => void
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
  projectMachinesList,
  onOpenBanner,
  onPachitownLink,
  bannerModalOpen,
  onBannerModalOpenChange,
  bannerEdit,
  onBannerEditChange,
  onCloseBannerModal,
}: ProductManagementDashboardViewProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">商材管理課 ダッシュボード</h1>
        <p className="text-slate-600 mt-1">
          機種マスタの管理、スロセレの案件確認（機種の自動変換・バナー作成・パチタウン連携）を行います
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => onActiveTabChange(v as ProductManagementDashboardTab)} className="w-full">
        <div className="border-b border-slate-100 mb-6">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            <TabsTrigger
              value="machineMaster"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-amber-600 after:scale-x-0 data-[state=active]:after:scale-x-100"
            >
              <Package className="h-4 w-4 mr-1.5 inline" />
              機種マスタ
            </TabsTrigger>
            <TabsTrigger
              value="projectMachines"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-amber-600 after:scale-x-0 data-[state=active]:after:scale-x-100"
            >
              <FileText className="h-4 w-4 mr-1.5 inline" />
              スロセレの案件
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
          <ProjectMachinesSectionView
            projects={projectMachinesList}
            onOpenBanner={onOpenBanner}
            onPachitownLink={onPachitownLink}
          />
        </TabsContent>
      </Tabs>

      <BannerCreateModalView
        open={bannerModalOpen}
        onOpenChange={onBannerModalOpenChange}
        bannerEdit={bannerEdit}
        onBannerEditChange={onBannerEditChange}
        onClose={onCloseBannerModal}
      />
    </div>
  )
}
