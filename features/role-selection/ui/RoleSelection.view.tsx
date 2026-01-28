import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users } from "lucide-react"
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

        <div className="grid md:grid-cols-2 gap-6">
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
              <CardTitle className="text-2xl">イベントチーム</CardTitle>
              <CardDescription className="text-base">
                案件の確認、イベントの実施準備を行います
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
