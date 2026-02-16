import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface QuoCardSectionViewProps {
  quoCardLetterCheckedAt?: string
  onCheck: () => void
}

export const QuoCardSectionView = ({
  quoCardLetterCheckedAt,
  onCheck,
}: QuoCardSectionViewProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">QUOカードレター確認</h3>
          {quoCardLetterCheckedAt && (
            <Badge className="bg-green-100 text-green-800 text-xs">
              確認済み
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {quoCardLetterCheckedAt ? (
          <p className="text-sm text-muted-foreground">
            確認日時: {new Date(quoCardLetterCheckedAt).toLocaleString("ja-JP")}
          </p>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-sm text-muted-foreground">
              QUOカードレターの確認がまだ行われていません
            </p>
            <Button onClick={onCheck} size="sm">
              確認完了にする
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
