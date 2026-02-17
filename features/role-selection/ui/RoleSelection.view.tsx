import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, Package, Truck, Award, Palette, Gift } from "lucide-react"
import type { Role } from "@/types/project"

export type RoleSelectionViewProps = {
  onSelectRole: (role: Role) => void
}

export const RoleSelectionView = ({ onSelectRole }: RoleSelectionViewProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            DMM アミューズメント事業部 業務アプリ
          </h1>
          <p className="text-lg text-slate-600">
            ロールを選択してください
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectRole("Sales")}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">営業</CardTitle>
              <CardDescription className="text-base">
                案件の登録、見積もりの作成・提示を行います
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectRole("Internal")}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">マネジメント部</CardTitle>
              <CardDescription className="text-base">
                案件の確認、イベントの実施準備を行います
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectRole("ProductManagement")}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl">商材管理課</CardTitle>
              <CardDescription className="text-base">
                商材マスタの管理、案件別商材の確認を行います
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectRole("OutsourcingVendor")}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center">
                <Truck className="h-8 w-8 text-violet-600" />
              </div>
              <CardTitle className="text-2xl">外注業者</CardTitle>
              <CardDescription className="text-base">
                依頼された手配の一覧確認、対応状況の報告を行います
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectRole("LotteryAdmin")}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                <Award className="h-8 w-8 text-rose-600" />
              </div>
              <CardTitle className="text-2xl">事務管理課（抽選）</CardTitle>
              <CardDescription className="text-base">
                合同抽選会の管理、景品発注、配送確認を行います
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectRole("DesignVendor")}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <Palette className="h-8 w-8 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl">デザイン業者</CardTitle>
              <CardDescription className="text-base">
                ポスター・DM・当選通知書のデザイン制作を行います
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectRole("PrizeVendor")}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <Gift className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">景品業者</CardTitle>
              <CardDescription className="text-base">
                景品の手配、配送情報の入力を行います
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
