import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { BannerEditState } from "@/features/product-management-dashboard/model/types"

export type BannerCreateModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  bannerEdit: BannerEditState
  onBannerEditChange: (updates: Partial<BannerEditState>) => void
  onClose: () => void
}

export const BannerCreateModalView = ({
  open,
  onOpenChange,
  bannerEdit,
  onBannerEditChange,
  onClose,
}: BannerCreateModalViewProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(95vw,1400px)] max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>バナー作成</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-1">ヘッダー（案件から自動設定）</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-banner-date">日付（開催日）</Label>
                <Input
                  id="modal-banner-date"
                  value={bannerEdit.date}
                  readOnly
                  className="bg-slate-50"
                  placeholder="2/1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-banner-day">曜日</Label>
                <Input
                  id="modal-banner-day"
                  value={bannerEdit.dayOfWeek}
                  readOnly
                  className="bg-slate-50"
                  placeholder="日曜日"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-banner-pref">都道府県（ホール）</Label>
                <Input
                  id="modal-banner-pref"
                  value={bannerEdit.prefecture}
                  readOnly
                  className="bg-slate-50"
                  placeholder="長野県"
                />
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="modal-banner-store">店舗名（ホール名）</Label>
                <Input
                  id="modal-banner-store"
                  value={bannerEdit.storeName}
                  readOnly
                  className="bg-slate-50"
                  placeholder="ホール名"
                />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>取材対象機種（複数）</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onBannerEditChange({ targetMachines: [...bannerEdit.targetMachines, ""] })}
              >
                機種を追加
              </Button>
            </div>
            <div className="space-y-2">
              {bannerEdit.targetMachines.map((name, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-slate-500 text-sm w-6 flex-shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Input
                    value={name}
                    onChange={(e) => {
                      const next = [...bannerEdit.targetMachines]
                      next[index] = e.target.value
                      onBannerEditChange({ targetMachines: next })
                    }}
                    placeholder="機種名"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const next = bannerEdit.targetMachines.filter((_, i) => i !== index)
                      onBannerEditChange({ targetMachines: next })
                    }}
                    disabled={bannerEdit.targetMachines.length <= 1}
                    className="text-slate-500 flex-shrink-0"
                  >
                    削除
                  </Button>
                </div>
              ))}
            </div>
            {bannerEdit.targetMachines.length === 0 && (
              <p className="text-sm text-slate-500 mt-1">「機種を追加」で追加してください</p>
            )}
          </div>
          <div className="border-t pt-6 mt-2">
            <h3 className="text-sm font-medium text-slate-700 mb-3">プレビュー（縦横比 3:2）</h3>
            <BannerPreviewInModal bannerEdit={bannerEdit} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={onClose}>
            作成して閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** モーダル内プレビュー用（画像と同じ・青/ティール・円形「取材対象 機種」・機種のみリスト） */
type BannerPreviewInModalProps = { bannerEdit: BannerEditState }

function BannerPreviewInModal({ bannerEdit }: BannerPreviewInModalProps) {
  const items = bannerEdit.targetMachines.filter((s) => s.trim())
  return (
    <div
      className="aspect-[3/2] w-full rounded-lg overflow-hidden shrink-0 border-2 border-cyan-400/90 bg-[#0c0f14] shadow-[0_0_14px_rgba(34,211,238,0.35)]"
      style={{
        backgroundImage: `
          linear-gradient(135deg, rgba(34,211,238,0.06) 0%, transparent 50%),
          linear-gradient(225deg, rgba(20,184,166,0.05) 0%, transparent 50%),
          repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(34,211,238,0.04) 18px, rgba(34,211,238,0.04) 19px),
          repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(34,211,238,0.04) 18px, rgba(34,211,238,0.04) 19px)
        `,
      }}
    >
      <div className="h-full w-full flex flex-col p-3 md:p-4 text-white">
        {/* ヘッダー: 白枠日付(左) + ティール都道府県(角切り) + 店舗名(右・太字白) */}
        <div className="flex items-stretch gap-0 flex-shrink-0 mb-3">
          <div className="flex flex-col items-center justify-center rounded border border-cyan-400/80 bg-white/95 px-2 py-1.5 min-w-[3.5rem] text-slate-900">
            <span className="text-base font-bold leading-tight">{bannerEdit.date || "2/1"}</span>
            <span className="text-[10px] opacity-80">[{bannerEdit.dayOfWeek || "日曜日"}]</span>
          </div>
          <div className="flex-1 min-w-0 flex items-center justify-center px-3 py-2 relative">
            <span
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-teal-500 text-white text-[10px] font-medium px-2.5 py-1 rounded-sm z-10"
              style={{ clipPath: "polygon(0 0, 100% 0, 90% 100%, 0 100%)" }}
            >
              {bannerEdit.prefecture || "長野県"}
            </span>
            <span className="text-sm md:text-base font-bold truncate text-center">
              {bannerEdit.storeName || "店舗名"}
            </span>
          </div>
        </div>
        {/* 取材対象機種: 左=白円形ラベル(青枠・縦書き) / 右=01,02,03 オレンジ円+機種名のみ */}
        <div className="flex-1 min-h-0 flex gap-3 overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="rounded-full border-2 border-cyan-400/90 bg-white w-12 h-12 flex flex-col items-center justify-center p-1">
              <span className="text-[8px] font-medium text-slate-800 leading-tight">取材対象</span>
              <span className="text-[8px] font-medium text-slate-800 leading-tight">機種</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-0 overflow-hidden">
            {items.length > 0 ? (
              items.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 flex-shrink-0 py-2 border-b border-cyan-400/30 last:border-0"
                >
                  <span className="flex-shrink-0 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold min-w-[2rem] text-center text-white shadow-inner">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-medium text-white/95 truncate">
                    {name || "機種名"}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-white/50 py-2">機種を追加してください</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
