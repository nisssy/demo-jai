import { Badge } from "@/components/ui/badge"

type ProjectStatusBadgeProps = {
  status: string
}

export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  if (!status) {
    return <Badge variant="secondary" className="bg-slate-100 text-slate-700">-</Badge>
  }
  switch (status) {
    case "見積送付完了":
      return <Badge className="bg-green-600 text-white">見積送付完了</Badge>
    case "見込み入力完了":
      return <Badge className="bg-slate-500 text-white">見込み入力完了</Badge>
    case "仮押さえ依頼":
      return <Badge className="bg-yellow-600 text-white">仮押さえ依頼</Badge>
    case "仮押さえ済み":
      return <Badge className="bg-green-600 text-white">仮押さえ済み</Badge>
    case "営業確認中":
      return <Badge className="bg-orange-600 text-white">営業確認中</Badge>
    case "マネジメント部確認中":
      return <Badge className="bg-blue-600 text-white">マネジメント部確認中</Badge>
    case "営業修正中":
      return <Badge className="bg-orange-600 text-white">営業修正中</Badge>
    case "本押さえ依頼":
      return <Badge className="bg-purple-600 text-white">本押さえ依頼</Badge>
    case "手配進行中":
      return <Badge className="bg-blue-600 text-white">手配進行中</Badge>
    case "イベント終了処理中":
      return <Badge className="bg-blue-600 text-white">イベント終了処理中</Badge>
    default:
      return <Badge variant="secondary" className="bg-slate-100 text-slate-700">{status}</Badge>
  }
}
