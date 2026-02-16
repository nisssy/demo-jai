import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Palette, Gift, MessageSquare } from "lucide-react"
import type { DepartmentActivitySummary } from "@/new/features/project-detail/model/types"

type DepartmentActivityCardProps = {
  activity: DepartmentActivitySummary
}

const ActivityRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-slate-500">{label}</span>
    <div className="flex items-center gap-1">{children}</div>
  </div>
)

export const DepartmentActivityCard = ({ activity }: DepartmentActivityCardProps) => {
  const { cast, design, prize, corrections } = activity

  const hasDesignActivity = design.poster.total > 0 || design.dm.total > 0 || design.winnerList.total > 0
  const hasPrizeActivity = prize.total > 0
  const hasCastActivity = cast.total > 0
  const hasCorrectionActivity = corrections.productCount > 0

  // 何も連携がなければ表示しない
  if (!hasCastActivity && !hasDesignActivity && !hasPrizeActivity && !hasCorrectionActivity) {
    return null
  }

  return (
    <Card className="border-slate-200">
      <CardContent className="p-5 space-y-3">
        <div className="text-xs font-medium text-slate-700 tracking-wide">部門連携</div>

        {/* キャスト手配 */}
        {hasCastActivity && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Users className="h-3.5 w-3.5" />
              キャスト手配
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto">{cast.total}人</Badge>
            </div>
            <div className="pl-5 space-y-0.5">
              {cast.requesting > 0 && (
                <ActivityRow label="依頼中">
                  <Badge className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0">{cast.requesting}</Badge>
                </ActivityRow>
              )}
              {cast.completed > 0 && (
                <ActivityRow label="確定">
                  <Badge className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0">{cast.completed}</Badge>
                </ActivityRow>
              )}
              {cast.failed > 0 && (
                <ActivityRow label="不可">
                  <Badge className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0">{cast.failed}</Badge>
                </ActivityRow>
              )}
            </div>
          </div>
        )}

        {hasCastActivity && (hasDesignActivity || hasPrizeActivity || hasCorrectionActivity) && <Separator />}

        {/* デザイン依頼 */}
        {hasDesignActivity && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Palette className="h-3.5 w-3.5" />
              デザイン依頼
            </div>
            <div className="pl-5 space-y-0.5">
              {design.poster.total > 0 && (
                <ActivityRow label="ポスター">
                  <Badge className={`text-[10px] px-1.5 py-0 ${design.poster.uploaded > 0 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {design.poster.uploaded > 0 ? "入稿済" : "依頼中"}
                  </Badge>
                </ActivityRow>
              )}
              {design.dm.total > 0 && (
                <ActivityRow label="DM">
                  <Badge className={`text-[10px] px-1.5 py-0 ${design.dm.uploaded > 0 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {design.dm.uploaded > 0 ? "入稿済" : "依頼中"}
                  </Badge>
                </ActivityRow>
              )}
              {design.winnerList.total > 0 && (
                <ActivityRow label="通知書">
                  <Badge className={`text-[10px] px-1.5 py-0 ${design.winnerList.uploaded > 0 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {design.winnerList.uploaded > 0 ? "入稿済" : "依頼中"}
                  </Badge>
                </ActivityRow>
              )}
            </div>
          </div>
        )}

        {hasDesignActivity && (hasPrizeActivity || hasCorrectionActivity) && <Separator />}

        {/* 景品発注 */}
        {hasPrizeActivity && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Gift className="h-3.5 w-3.5" />
              景品発注
            </div>
            <div className="pl-5">
              <ActivityRow label="発注">
                <Badge className={`text-[10px] px-1.5 py-0 ${prize.ordered > 0 ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                  {prize.ordered > 0 ? `${prize.ordered}/${prize.total}件 発注済` : "未発注"}
                </Badge>
              </ActivityRow>
            </div>
          </div>
        )}

        {hasPrizeActivity && hasCorrectionActivity && <Separator />}

        {/* 修正依頼 */}
        {hasCorrectionActivity && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <MessageSquare className="h-3.5 w-3.5" />
              修正依頼
              <Badge className="bg-orange-100 text-orange-800 text-[10px] px-1.5 py-0 ml-auto">
                {corrections.commentCount}件
              </Badge>
            </div>
            <div className="pl-5">
              <ActivityRow label="対象商材">
                <span className="text-slate-700 font-medium">{corrections.productCount}商材</span>
              </ActivityRow>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
