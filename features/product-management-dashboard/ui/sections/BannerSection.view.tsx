import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Link2 } from "lucide-react"
import type { BannerEditState } from "@/features/product-management-dashboard/model/types"

export type ProductOption = {
  id: number
  projectNumber?: string
  projectName: string
  eventProductName?: string
}

export type BannerSectionViewProps = {
  products: ProductOption[]
  selectedProductId: number | null
  onGenerate: (productId: number) => void
  bannerEdit: BannerEditState
  onBannerEditChange: (updates: Partial<BannerEditState>) => void
  /** 選択中案件のパチタウン連携日（連携済みの場合） */
  selectedProductPachitownLinkedDate?: string | null
}

export const BannerSectionView = ({
  products,
  selectedProductId,
  onGenerate,
  bannerEdit,
  onBannerEditChange,
  selectedProductPachitownLinkedDate,
}: BannerSectionViewProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-amber-600" />
            <CardTitle>バナー生成・プレビュー・微修正</CardTitle>
          </div>
          <CardDescription>
            案件の情報・機種情報をもとにバナー画像を自動生成します。バナー作成を行うとパチタウンに自動連携されます。プレビューで確認・手動で微修正できます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-slate-700">案件を選択してバナーを生成</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {products.slice(0, 20).map((p) => (
                <Button
                  key={p.id}
                  variant={selectedProductId === p.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onGenerate(p.id)}
                >
                  {p.projectName || p.eventProductName || `案件 ${p.id}`}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-slate-700">プレビュー</h3>
                {selectedProductPachitownLinkedDate && (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 shrink-0"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    パチタウンに連携済み（{selectedProductPachitownLinkedDate}）
                  </Badge>
                )}
              </div>
              <div
                className="aspect-[2/1] w-full max-w-md rounded-lg border-2 border-slate-200 flex flex-col items-center justify-center gap-2 p-6"
                style={{
                  backgroundColor: bannerEdit.backgroundColor,
                  color: bannerEdit.textColor,
                }}
              >
                <span
                  className="font-bold text-center break-words w-full"
                  style={{ fontSize: bannerEdit.fontSize }}
                >
                  {bannerEdit.line1 || "1行目テキスト"}
                </span>
                <span
                  className="text-center break-words w-full opacity-90"
                  style={{ fontSize: Math.round(bannerEdit.fontSize * 0.75) }}
                >
                  {bannerEdit.line2 || "2行目テキスト（機種名など）"}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-700">微修正</h3>
              <div className="space-y-2">
                <Label htmlFor="banner-line1">1行目（案件名など）</Label>
                <Input
                  id="banner-line1"
                  value={bannerEdit.line1}
                  onChange={(e) => onBannerEditChange({ line1: e.target.value })}
                  placeholder="案件名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-line2">2行目（機種名など）</Label>
                <Input
                  id="banner-line2"
                  value={bannerEdit.line2}
                  onChange={(e) => onBannerEditChange({ line2: e.target.value })}
                  placeholder="機種名"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="banner-bg">背景色</Label>
                  <Input
                    id="banner-bg"
                    type="color"
                    value={bannerEdit.backgroundColor}
                    onChange={(e) => onBannerEditChange({ backgroundColor: e.target.value })}
                    className="h-10 p-1 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banner-text">文字色</Label>
                  <Input
                    id="banner-text"
                    type="color"
                    value={bannerEdit.textColor}
                    onChange={(e) => onBannerEditChange({ textColor: e.target.value })}
                    className="h-10 p-1 cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-font">フォントサイズ（px）</Label>
                <Input
                  id="banner-font"
                  type="number"
                  min={12}
                  max={48}
                  value={bannerEdit.fontSize}
                  onChange={(e) => onBannerEditChange({ fontSize: Number(e.target.value) || 24 })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
