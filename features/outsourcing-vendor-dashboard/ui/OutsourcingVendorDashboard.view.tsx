import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, ClipboardList } from "lucide-react"
import type { OutsourcingVendorDashboardTab } from "@/features/outsourcing-vendor-dashboard/hooks/useOutsourcingVendorDashboard"

export type OutsourcingVendorDashboardViewProps = {
  activeTab: OutsourcingVendorDashboardTab
  onActiveTabChange: (tab: OutsourcingVendorDashboardTab) => void
  requestsCount: number
}

export const OutsourcingVendorDashboardView = ({
  activeTab,
  onActiveTabChange,
  requestsCount,
}: OutsourcingVendorDashboardViewProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">外注業者 ダッシュボード</h1>
        <p className="text-slate-600 mt-1">自社に依頼された案件・手配の一覧と対応状況を確認します</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => onActiveTabChange(v as OutsourcingVendorDashboardTab)} className="w-full">
        <div className="border-b border-slate-100 mb-6">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            <TabsTrigger
              value="requests"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-violet-600 after:scale-x-0 data-[state=active]:after:scale-x-100"
            >
              依頼一覧
              {requestsCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                  {requestsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="status"
              className="relative px-4 py-2.5 text-base font-normal text-slate-500 hover:text-slate-700 data-[state=active]:text-slate-900 data-[state=active]:font-medium border-0 rounded-none bg-transparent data-[state=active]:bg-transparent after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1.5px] after:bg-violet-600 after:scale-x-0 data-[state=active]:after:scale-x-100"
            >
              対応状況
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="requests" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-violet-600" />
                <CardTitle>依頼一覧</CardTitle>
              </div>
              <CardDescription>発注元から自社に依頼された手配・キャスト手配の一覧です。現在 {requestsCount} 件の商材が登録されています（デモ用に全案件を表示）。</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm">外注業者向けの依頼詳細・受諾・進捗入力は今後実装予定です。</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-violet-600" />
                <CardTitle>対応状況</CardTitle>
              </div>
              <CardDescription>受諾した依頼の進捗・完了報告を行います</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm">対応状況の更新・完了報告は今後実装予定です。</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
