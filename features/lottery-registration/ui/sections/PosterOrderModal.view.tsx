import type { TradingPartnerData } from "@/lib/demo-db/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Send } from "lucide-react"

export type PosterOrderModalViewProps = {
  printingPartners: TradingPartnerData[]
  posterOrderVendorId: string
  onVendorChange: (vendorId: string) => void
  onSubmit: () => void
  onCancel: () => void
  eventName: string
  eventStartDate: string
  eventEndDate: string
  hallNames: string[]
  posterPrintQuantity: string
}

export function PosterOrderModalView({
  printingPartners,
  posterOrderVendorId,
  onVendorChange,
  onSubmit,
  onCancel,
  eventName,
  eventStartDate,
  eventEndDate,
  hallNames,
  posterPrintQuantity,
}: PosterOrderModalViewProps) {
  const selectedVendor = printingPartners.find((t) => String(t.id) === posterOrderVendorId) ?? printingPartners[0]
  const vendorName = selectedVendor?.name ?? "印刷会社"

  return (
    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-sm">ポスター発注依頼</DialogTitle>
        <DialogDescription className="text-xs">AI生成された依頼文を確認して送信してください</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {/* 発注先選択 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">発注先（印刷会社から選択）</Label>
          <Select
            value={posterOrderVendorId || (printingPartners[0] ? String(printingPartners[0].id) : "")}
            onValueChange={onVendorChange}
          >
            <SelectTrigger className="text-xs h-9">
              <SelectValue placeholder="印刷会社を選択" />
            </SelectTrigger>
            <SelectContent>
              {printingPartners.map((tp) => (
                <SelectItem key={tp.id} value={String(tp.id)} className="text-xs">
                  {tp.name}（印刷会社）
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-slate-400">取引先マスタの「印刷会社」から選択しています</p>
        </div>

        {/* イメージ画像 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">イメージ画像添付</Label>
          <Input type="file" className="text-xs h-9" />
        </div>

        {/* 件名 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">件名</Label>
          <Input value="【JAS】ポスター制作のご依頼" readOnly className="text-xs h-9 bg-slate-50" />
        </div>

        {/* 本文 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">本文（AI自動生成）</Label>
          <textarea
            className="w-full min-h-[180px] p-3 border rounded-md text-xs bg-slate-50"
            readOnly
            value={`${vendorName} 御中

いつもお世話になっております。
JASイベント管理チームです。

下記の内容でポスター制作をお願いいたします。

【案件情報】
- イベント名: ${eventName || "ー"}
- 開催日: ${eventStartDate || "ー"} ～ ${eventEndDate || "ー"}
- 会場: ${hallNames.join("、") || "ー"}
- ポスター枚数: ${posterPrintQuantity || "50"}枚

【納期】
初稿完成後はシステムにアップロードをお願いいたします。
店舗への送付→校了返信後にデザイン業者へ校了連絡を行います。

ご不明点がございましたらお気軽にお問い合わせください。
よろしくお願いいたします。`}
          />
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
          キャンセル
        </Button>
        <Button size="sm" onClick={onSubmit} className="text-xs gap-1">
          <Send className="h-3.5 w-3.5" />
          送信する
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
