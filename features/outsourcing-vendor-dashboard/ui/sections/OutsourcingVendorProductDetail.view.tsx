import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Image, FileUp, Database, X, Link2 } from "lucide-react"
import type { DemoProject } from "@/lib/demo-db/types"

export type OutsourcingVendorProductDetailViewProps = {
  product: DemoProject
  onClose: () => void
  onReportUpload: (productId: number, note: string) => void
  onPachitownLink: (productId: number) => void
  onPostEventDataSave: (productId: number, data: { transactionResult?: string; machineData?: string }) => void
  /** 親で管理する事後データの編集値（非制御の場合は product から初期表示） */
  postEventTransactionResult: string
  postEventMachineData: string
  onPostEventTransactionResultChange: (value: string) => void
  onPostEventMachineDataChange: (value: string) => void
}

export const OutsourcingVendorProductDetailView = ({
  product,
  onClose,
  onReportUpload,
  onPachitownLink,
  onPostEventDataSave,
  postEventTransactionResult,
  postEventMachineData,
  onPostEventTransactionResultChange,
  onPostEventMachineDataChange,
}: OutsourcingVendorProductDetailViewProps) => {
  const surveyResult = (product as any).surveyResult
  const eventPhotos = (product as any).eventPhotos as string[] | undefined
  const reportUploaded = (product as any).reportUploaded
  const pachitownLinked = (product as any).pachitownLinked
  const eventName = (product as any).eventProductName ?? (product as any).projectName ?? "イベント"

  const handleSavePostEvent = () => {
    onPostEventDataSave(product.id, {
      transactionResult: postEventTransactionResult || undefined,
      machineData: postEventMachineData || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{eventName} の詳細</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4 mr-1" />
          閉じる
        </Button>
      </div>

      {/* 1. アンケート結果参照 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-violet-600" />
            <CardTitle>アンケート結果</CardTitle>
          </div>
          <CardDescription>イベント終了後のアンケート結果を参照します</CardDescription>
        </CardHeader>
        <CardContent>
          {surveyResult ? (
            <div className="space-y-3 text-sm">
              {surveyResult.satisfaction != null && surveyResult.satisfaction !== "" && (
                <div>
                  <span className="font-medium text-slate-600">満足度: </span>
                  <span className="text-slate-900">{surveyResult.satisfaction}</span>
                </div>
              )}
              {surveyResult.comment != null && surveyResult.comment !== "" && (
                <div>
                  <span className="font-medium text-slate-600">コメント: </span>
                  <p className="text-slate-900 mt-1 whitespace-pre-wrap">{surveyResult.comment}</p>
                </div>
              )}
              {surveyResult.nextEventDesired != null && surveyResult.nextEventDesired !== "" && (
                <div>
                  <span className="font-medium text-slate-600">次回希望: </span>
                  <span className="text-slate-900">{surveyResult.nextEventDesired}</span>
                </div>
              )}
              {!surveyResult.satisfaction && !surveyResult.comment && !surveyResult.nextEventDesired && (
                <p className="text-slate-500">アンケート結果はまだありません。</p>
              )}
            </div>
          ) : (
            <p className="text-slate-500">アンケート結果はまだありません。</p>
          )}
        </CardContent>
      </Card>

      {/* 2. イベント写真参照 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-violet-600" />
            <CardTitle>イベント写真</CardTitle>
          </div>
          <CardDescription>イベント終了後の写真を参照します</CardDescription>
        </CardHeader>
        <CardContent>
          {eventPhotos && eventPhotos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {eventPhotos.map((url, i) => (
                <div
                  key={i}
                  className="aspect-video rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center"
                >
                  {url.startsWith("http") ? (
                    <img src={url} alt={`写真 ${i + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-sm">写真 {i + 1}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-video rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center"
                >
                  <span className="text-slate-400 text-sm">写真なし</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. レポート作成・アップロード・パチタウン連携 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-violet-600" />
            <CardTitle>レポート</CardTitle>
          </div>
          <CardDescription>アンケート・写真をもとにレポートを作成しアップロード、パチタウンへ連携します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reportUploaded ? (
            <p className="text-sm text-green-600 font-medium">レポートをアップロード済みです。</p>
          ) : (
            <Button
              onClick={() => onReportUpload(product.id, "レポート（デモ）")}
              className="w-full sm:w-auto"
            >
              <FileUp className="h-4 w-4 mr-2" />
              レポートをアップロード
            </Button>
          )}
          {reportUploaded && (
            <Button
              variant="outline"
              onClick={() => onPachitownLink(product.id)}
              disabled={pachitownLinked}
              className="w-full sm:w-auto"
            >
              <Link2 className="h-4 w-4 mr-2" />
              {pachitownLinked ? "パチタウン連携済み" : "パチタウンに連携"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 4. 事後データ入力（商材に反映） */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-violet-600" />
            <CardTitle>事後データ入力</CardTitle>
          </div>
          <CardDescription>取引結果・機種別データ等を入力すると、案件データ（商材データ）に反映されます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post-event-transaction">取引結果</Label>
            <Textarea
              id="post-event-transaction"
              value={postEventTransactionResult}
              onChange={(e) => onPostEventTransactionResultChange(e.target.value)}
              placeholder="取引結果を入力"
              rows={3}
              className="resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-event-machine">機種別データ</Label>
            <Textarea
              id="post-event-machine"
              value={postEventMachineData}
              onChange={(e) => onPostEventMachineDataChange(e.target.value)}
              placeholder="機種別のデータを入力（例: 機種名, 結果...）"
              rows={4}
              className="resize-y"
            />
          </div>
          <Button onClick={handleSavePostEvent} className="w-full sm:w-auto">
            事後データを保存（商材に反映）
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
