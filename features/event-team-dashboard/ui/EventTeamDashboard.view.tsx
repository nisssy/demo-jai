import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from "lucide-react"
import { HoldRequestSectionView } from "@/features/event-team-dashboard/ui/sections/HoldRequestSection.view"
import { InProgressSectionView } from "@/features/event-team-dashboard/ui/sections/InProgressSection.view"
import { ConfirmationSectionView } from "@/features/event-team-dashboard/ui/sections/ConfirmationSection.view"
import { PostEventSectionView } from "@/features/event-team-dashboard/ui/sections/PostEventSection.view"
import type { Project } from "@/features/event-team-dashboard/hooks/useEventTeamDashboard"

type CastGroup = {
  castName: string
  castType: "companion" | "director" | "mc"
  status: "pending" | "confirmed_request"
  projects: Project[]
}

type ProductionGroup = {
  productionKey: string
  productionName: string
  casts: CastGroup[]
}

export type EventTeamDashboardViewProps = {
  // タブ状態
  activeTab: "arrangements" | "confirmation" | "postEvent"
  onActiveTabChange: (value: "arrangements" | "confirmation" | "postEvent") => void
  arrangementsSubTab: "holdRequest" | "inProgress"
  onArrangementsSubTabChange: (value: "holdRequest" | "inProgress") => void

  // プロジェクトリスト
  arrangementProjects: Project[]
  temporaryHoldRequests: Project[]
  confirmationRequests: Project[]
  postEventProjects: Project[]

  // 押さえ依頼用のグルーピング
  holdRequestGroupsByProduction: ProductionGroup[]
  hasHoldRequestCastGroups: boolean

  // ヘルパー関数
  normalizeSelectedNames: (raw?: unknown) => string[]
  computeTentativeProgress: (
    names: string[],
    status: Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">,
    failure: Record<string, string>,
  ) => { done: number; total: number }
  getPachitownPublicationStatus: (project: Project) => string | null

  // ハンドラー
  onViewCastingInfo: (project: Project) => void
  onTemporaryHoldFailure: (project: Project) => void
  onViewStatusHistory: (project: Project) => void
  onNavigateToArrangement: (projectId: number) => void
  onNavigateToAutoArrangement: (projectId: number) => void
  onViewDetails: (project: Project) => void
  onNavigateToCost: (projectId: number) => void
  onViewSurveyResult: (project: Project) => void
  onOpenCostExportModal: () => void
}

export const EventTeamDashboardView = ({
  activeTab,
  onActiveTabChange,
  arrangementsSubTab,
  onArrangementsSubTabChange,
  arrangementProjects,
  temporaryHoldRequests,
  confirmationRequests,
  postEventProjects,
  holdRequestGroupsByProduction,
  hasHoldRequestCastGroups,
  normalizeSelectedNames,
  computeTentativeProgress,
  getPachitownPublicationStatus,
  onViewCastingInfo,
  onTemporaryHoldFailure,
  onViewStatusHistory,
  onNavigateToArrangement,
  onNavigateToAutoArrangement,
  onViewDetails,
  onNavigateToCost,
  onViewSurveyResult,
  onOpenCostExportModal,
}: EventTeamDashboardViewProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">イベントチーム ダッシュボード</h1>
        <Button variant="outline" onClick={onOpenCostExportModal} className="gap-2">
          <Download className="h-4 w-4" />
          コスト出力
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => onActiveTabChange(value as typeof activeTab)} className="w-full">
        <div className="border-b border-slate-100 mb-8">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            <TabsTrigger
              value="arrangements"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
            >
              手配中
              {(temporaryHoldRequests.length > 0 || arrangementProjects.length > 0) && (
                <Badge className="ml-1.5 bg-slate-400 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {temporaryHoldRequests.length + arrangementProjects.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="confirmation"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
            >
              内容確認依頼
              {confirmationRequests.length > 0 && (
                <Badge className="ml-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {confirmationRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="postEvent"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
            >
              イベント終了処理中
              {postEventProjects.length > 0 && (
                <Badge className="ml-1.5 bg-slate-400 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {postEventProjects.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 手配中タブ */}
        <TabsContent value="arrangements" className="mt-0">
          <Tabs value={arrangementsSubTab} onValueChange={(value) => onArrangementsSubTabChange(value as typeof arrangementsSubTab)} className="w-full">
            <div className="border-b border-slate-200 mb-6">
              <TabsList className="bg-transparent h-auto p-0 gap-0">
                <TabsTrigger
                  value="holdRequest"
                  className="relative px-4 py-2 text-sm font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
                >
                  押さえ依頼
                  {temporaryHoldRequests.length > 0 && (
                    <Badge className="ml-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {temporaryHoldRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="inProgress"
                  className="relative px-4 py-2 text-sm font-normal text-slate-500 hover:text-slate-700 transition-all duration-200 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-blue-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
                >
                  進行中
                  {arrangementProjects.length > 0 && (
                    <Badge className="ml-1.5 bg-slate-400 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {arrangementProjects.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="holdRequest" className="mt-0">
              <HoldRequestSectionView
                temporaryHoldRequests={temporaryHoldRequests}
                holdRequestGroupsByProduction={holdRequestGroupsByProduction}
                hasHoldRequestCastGroups={hasHoldRequestCastGroups}
                normalizeSelectedNames={normalizeSelectedNames}
                computeTentativeProgress={computeTentativeProgress}
                onViewCastingInfo={onViewCastingInfo}
                onTemporaryHoldFailure={onTemporaryHoldFailure}
              />
            </TabsContent>

            <TabsContent value="inProgress" className="mt-0">
              <InProgressSectionView
                arrangementProjects={arrangementProjects}
                getPachitownPublicationStatus={getPachitownPublicationStatus}
                onViewStatusHistory={onViewStatusHistory}
                onNavigateToArrangement={onNavigateToArrangement}
                onNavigateToAutoArrangement={onNavigateToAutoArrangement}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* 内容確認依頼タブ */}
        <TabsContent value="confirmation" className="mt-0">
          <ConfirmationSectionView confirmationRequests={confirmationRequests} onViewDetails={onViewDetails} />
        </TabsContent>

        {/* イベント終了処理中タブ */}
        <TabsContent value="postEvent" className="mt-0">
          <PostEventSectionView
            postEventProjects={postEventProjects}
            onNavigateToCost={onNavigateToCost}
            onViewSurveyResult={onViewSurveyResult}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
