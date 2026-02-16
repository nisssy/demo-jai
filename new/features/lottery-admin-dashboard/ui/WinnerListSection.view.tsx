import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { WinnerInfo } from "@/new/api/types"

export interface WinnerListSectionViewProps {
  winnerList?: WinnerInfo[]
  winnerListUploadedAt?: string
  winnerListValidatedAt?: string
  onUpload: () => void
  onValidate: () => void
}

export const WinnerListSectionView = ({
  winnerList,
  winnerListUploadedAt,
  winnerListValidatedAt,
  onUpload,
  onValidate,
}: WinnerListSectionViewProps) => {
  const hasWinners = winnerList && winnerList.length > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">当選者リスト</h3>
          <div className="flex items-center gap-2">
            {winnerListUploadedAt && (
              <Badge variant="outline" className="text-xs">
                アップロード済み
              </Badge>
            )}
            {winnerListValidatedAt && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                検証済み
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasWinners ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-sm text-muted-foreground">
              当選者リストがアップロードされていません
            </p>
            <Button onClick={onUpload} size="sm">
              当選者リストをアップロード
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>名前</TableHead>
                  <TableHead>住所</TableHead>
                  <TableHead>電話番号</TableHead>
                  <TableHead>景品</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {winnerList.map((winner) => (
                  <TableRow key={winner.id}>
                    <TableCell className="font-mono text-xs">{winner.id}</TableCell>
                    <TableCell>{winner.name}</TableCell>
                    <TableCell className="text-sm">{winner.address ?? "-"}</TableCell>
                    <TableCell className="text-sm">{winner.phone ?? "-"}</TableCell>
                    <TableCell>{winner.prize ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex gap-2">
              {!winnerListUploadedAt && (
                <Button onClick={onUpload} size="sm" variant="outline">
                  再アップロード
                </Button>
              )}
              {!winnerListValidatedAt && (
                <Button onClick={onValidate} size="sm">
                  当選者リストを検証
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
