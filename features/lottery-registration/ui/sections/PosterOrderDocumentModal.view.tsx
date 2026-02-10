import { Button } from "@/components/ui/button"
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Download, ArrowLeft } from "lucide-react"

export type PosterOrderDocumentModalViewProps = {
  vendorName: string
  eventName: string
  eventStartDate: string
  eventEndDate: string
  hallNames: string[]
  posterPrintQuantity: string
  salesPersonName: string
  onClose: () => void
}

export function PosterOrderDocumentModalView({
  vendorName,
  eventName,
  eventStartDate,
  eventEndDate,
  hallNames,
  posterPrintQuantity,
  salesPersonName,
  onClose,
}: PosterOrderDocumentModalViewProps) {
  const today = new Date().toLocaleDateString("ja-JP")

  return (
    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-sm">発注書</DialogTitle>
        <DialogDescription className="text-xs">ポスター発注時に自動作成された発注書です</DialogDescription>
      </DialogHeader>
      <div className="border border-slate-200 rounded-lg p-6 space-y-4 text-xs">
        <div className="text-center border-b border-slate-200 pb-3">
          <h3 className="text-base font-bold">発 注 書</h3>
          <p className="text-slate-500 mt-1">{today}</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">{vendorName} 御中</p>
        </div>
        <div className="space-y-1 text-right">
          <p>JASイベント管理チーム</p>
          <p>担当: {salesPersonName || "営業担当"}</p>
        </div>
        <div className="border-t border-slate-200 pt-3 space-y-2">
          <p className="font-semibold">件名: ポスター制作のご発注</p>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-300">
              <th className="text-left py-1.5 font-medium text-slate-600">項目</th>
              <th className="text-right py-1.5 font-medium text-slate-600">内容</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-1.5">イベント名</td>
              <td className="py-1.5 text-right">{eventName || "ー"}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-1.5">開催日</td>
              <td className="py-1.5 text-right">
                {eventStartDate || "ー"}
                {eventEndDate && eventEndDate !== eventStartDate ? ` ～ ${eventEndDate}` : ""}
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-1.5">会場</td>
              <td className="py-1.5 text-right">{hallNames.join("、") || "ー"}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-1.5">印刷枚数</td>
              <td className="py-1.5 text-right">{posterPrintQuantity || "ー"} 枚</td>
            </tr>
          </tbody>
        </table>
        <div className="border-t border-slate-200 pt-3 space-y-1 text-slate-500">
          <p>備考:</p>
          <p>- デザインデータはアップロード機能にてご納品ください</p>
          <p>- ご不明点がございましたらお気軽にお問い合わせください</p>
        </div>
      </div>
      <div className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          閉じる
        </Button>
        <Button size="sm" className="text-xs gap-1" onClick={onClose}>
          <Download className="h-3.5 w-3.5" />
          PDFダウンロード
        </Button>
      </div>
    </DialogContent>
  )
}
