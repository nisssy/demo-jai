import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, Package, Truck, Award, Palette, Gift } from "lucide-react"
import type { Role } from "@/new/types/role"

type RoleCard = {
  role: Role
  label: string
  description: string
  icon: React.ReactNode
  color: string
}

const roleCards: RoleCard[] = [
  {
    role: "Sales",
    label: "BS・CS",
    description: "案件の登録、見積もりの作成・提示を行います",
    icon: <Briefcase className="h-8 w-8 text-blue-600" />,
    color: "bg-blue-100",
  },
  {
    role: "Internal",
    label: "マネジメント部",
    description: "案件の確認、イベントの実施準備を行います",
    icon: <Users className="h-8 w-8 text-green-600" />,
    color: "bg-green-100",
  },
  {
    role: "ProductManagement",
    label: "商材管理課",
    description: "商材マスタの管理、案件別商材の確認を行います",
    icon: <Package className="h-8 w-8 text-amber-600" />,
    color: "bg-amber-100",
  },
  {
    role: "LotteryAdmin",
    label: "事務管理課（抽選）",
    description: "合同抽選会の管理、景品発注、配送確認を行います",
    icon: <Award className="h-8 w-8 text-rose-600" />,
    color: "bg-rose-100",
  },
  {
    role: "OutsourcingVendor",
    label: "スロセレ外注業者",
    description: "スロセレのイベントレポートの登録や報告を行います",
    icon: <Truck className="h-8 w-8 text-violet-600" />,
    color: "bg-violet-100",
  },
  {
    role: "DesignVendor",
    label: "デザイン業者",
    description: "ポスター・DM・当選通知書のデザイン制作を行います",
    icon: <Palette className="h-8 w-8 text-indigo-600" />,
    color: "bg-indigo-100",
  },
  {
    role: "PrizeVendor",
    label: "景品業者",
    description: "景品の手配、配送情報の入力を行います",
    icon: <Gift className="h-8 w-8 text-emerald-600" />,
    color: "bg-emerald-100",
  },
]

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
            部門を選択してください
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roleCards.map((card) => (
            <Card
              key={card.role}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelectRole(card.role)}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto mb-4 w-16 h-16 ${card.color} rounded-full flex items-center justify-center`}>
                  {card.icon}
                </div>
                <CardTitle className="text-2xl">{card.label}</CardTitle>
                <CardDescription className="text-base">
                  {card.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
