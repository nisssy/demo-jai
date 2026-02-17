import type { TradingPartnerData } from "@/lib/demo-db/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Send } from "lucide-react"

export type DmCreateModalViewProps = {
  designPartners: TradingPartnerData[]
  dmCreateVendorId: string
  onVendorChange: (vendorId: string) => void
  onSubmit: () => void
  onCancel: () => void
  eventName: string
  eventStartDate: string
  eventEndDate: string
  hallNames: string[]
}

export function DmCreateModalView({
  designPartners,
  dmCreateVendorId,
  onVendorChange,
  onSubmit,
  onCancel,
  eventName,
  eventStartDate,
  eventEndDate,
  hallNames,
}: DmCreateModalViewProps) {
  const selectedVendor = designPartners.find((t) => String(t.id) === dmCreateVendorId) ?? designPartners[0]
  const vendorName = selectedVendor?.name ?? "デザイン会社"

  return (
    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-sm">DM作成依頼</DialogTitle>
        <DialogDescription className="text-xs">デザイン会社を選択し、依頼文を確認して送信してください</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {/* デザイン会社選択 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">デザイン会社（マスタから選択）</Label>
          <Select value={dmCreateVendorId} onValueChange={onVendorChange}>
            <SelectTrigger className="text-xs h-9">
              <SelectValue placeholder="デザイン会社を選択" />
            </SelectTrigger>
            <SelectContent>
              {designPartners.map((tp) => (
                <SelectItem key={tp.id} value={String(tp.id)} className="text-xs">
                  {tp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* DMプレビュー */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">DMプレビュー</Label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 aspect-[3/4] max-w-[200px] flex flex-col">
            <div className="flex-1 p-3 flex flex-col justify-center text-center space-y-1">
              <h3 className="text-xs font-bold">大抽選会のご案内</h3>
              <p className="text-[10px] font-semibold">
                {eventStartDate === eventEndDate
                  ? eventStartDate
                  : `${eventStartDate || "ー"} ～ ${eventEndDate || ""}`}
              </p>
              <p className="text-[10px] text-slate-500">
                {hallNames.join("／") || "ー"}
              </p>
            </div>
          </div>
        </div>

        {/* イメージ画像 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">イメージ画像添付</Label>
          <Input type="file" className="text-xs h-9" />
        </div>

        {/* 件名 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">件名</Label>
          <Input value="【JAS】DM作成のご依頼" readOnly className="text-xs h-9 bg-slate-50" />
        </div>

        {/* 本文 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">本文（AI自動生成）</Label>
          <textarea
            className="w-full min-h-[160px] p-3 border rounded-md text-xs bg-slate-50"
            readOnly
            value={`${vendorName} 御中

いつもお世話になっております。
JASイベント管理チームです。

下記の内容でDMのデザイン作成をお願いいたします。

【案件情報】
- イベント名: ${eventName || "ー"}
- イベント日: ${eventStartDate || "ー"}${eventEndDate && eventEndDate !== eventStartDate ? ` ～ ${eventEndDate}` : ""}
- 会場: ${hallNames.join("、") || "ー"}

【注意事項】
- デザイン確定後、DM投函の手配をお願いいたします
- ご不明点がございましたらお気軽にお問い合わせください

よろしくお願いいたします。`}
          />
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
          キャンセル
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={!dmCreateVendorId}
          className="text-xs gap-1"
        >
          <Send className="h-3.5 w-3.5" />
          送信する
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
