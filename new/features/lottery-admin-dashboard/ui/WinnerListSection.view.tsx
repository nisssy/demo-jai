import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Upload, FileCheck, AlertTriangle, CheckCircle2, Mail } from "lucide-react"
import type { WinnerInfo } from "@/new/api/types"

export interface WinnerListSectionViewProps {
  winnerList?: WinnerInfo[]
  winnerListUploadedAt?: string
  winnerListValidatedAt?: string
  winnerListHasError: boolean
  onUploadPsp: () => void
  onUploadPspWithError: () => void
  onUploadFile: () => void
  onReset: () => void
  onDismissError: () => void
  onValidate: () => void
}

export const WinnerListSectionView = ({
  winnerList,
  winnerListUploadedAt,
  winnerListValidatedAt,
  winnerListHasError,
  onUploadPsp,
  onUploadPspWithError,
  onUploadFile,
  onReset,
  onDismissError,
  onValidate,
}: WinnerListSectionViewProps) => {
  const hasUploaded = !!winnerListUploadedAt
  const isValidated = !!winnerListValidatedAt

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          当選者リストアップロード
        </CardTitle>
        <CardDescription>Excelファイル（.xlsx）をアップロードしてください</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasUploaded ? (
          /* ─── アップロード前: PSP連携 + ファイルアップロード 2カラム ─── */
          <div className="grid grid-cols-2 gap-4">
            {/* 左: PSP連携 */}
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
              <p className="font-medium mb-2">PSP連携</p>
              <p className="text-sm text-muted-foreground mb-4">ホールがアップロードしたデータを同期</p>
              <div className="flex flex-col gap-2">
                <Button onClick={onUploadPsp} className="bg-primary w-full" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  正常データを同期
                </Button>
                <Button onClick={onUploadPspWithError} variant="destructive" className="w-full" size="sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  異常データを同期
                </Button>
              </div>
            </div>

            {/* 右: ファイルアップロード */}
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
              <p className="font-medium mb-2">ファイルアップロード</p>
              <p className="text-sm text-muted-foreground mb-4">手元のExcelファイルをアップロード</p>
              <div
                className="flex flex-col items-center justify-center h-[88px] border border-dashed rounded bg-background cursor-pointer hover:bg-accent/50"
                onClick={onUploadFile}
              >
                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">クリックしてファイルを選択</span>
              </div>
            </div>
          </div>
        ) : (
          /* ─── アップロード後: ファイル情報 + テーブル + アラート ─── */
          <div className="w-full text-left space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-medium flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-green-600" />
                winners_list.xlsx (PSP連携済)
              </p>
              <Button variant="outline" size="sm" onClick={onReset}>
                リセット
              </Button>
            </div>

            {/* 当選者テーブル */}
            {winnerList && winnerList.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <div className="h-[440px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>名前</TableHead>
                        <TableHead>住所</TableHead>
                        <TableHead>電話番号</TableHead>
                        <TableHead>景品</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {winnerList.map((winner) => (
                        <TableRow key={winner.id}>
                          <TableCell>{winner.name}</TableCell>
                          <TableCell>{winner.address ?? "-"}</TableCell>
                          <TableCell>{winner.phone ?? "-"}</TableCell>
                          <TableCell>{winner.prize ?? "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* エラー表示 */}
            {winnerListHasError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="mt-2 space-y-2">
                    <p className="font-semibold">エラー: 当選者数と見積もり情報の不一致</p>
                    <p>当選者リスト: {winnerList?.length ?? 0}名</p>
                    <div className="pt-2">
                      <Button variant="destructive" size="sm" onClick={onDismissError}>
                        <Mail className="w-4 h-4 mr-2" />
                        ホールに再アップロード依頼
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* 検証完了アラート */}
        {isValidated && (
          <Alert className="border-primary bg-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription>
              <strong>当選者リスト検証完了</strong>
              <br />
              <span className="text-sm">すべての必須項目が揃い、重複・フォーマット不備はありません</span>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
