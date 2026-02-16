import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type SummaryCardsViewProps = {
  castArrangement: number
  arrangement: number
  postEvent: number
}

export function SummaryCardsView({ castArrangement, arrangement, postEvent }: SummaryCardsViewProps) {
  const cards = [
    { label: "キャスト手配", count: castArrangement },
    { label: "各種手配", count: arrangement },
    { label: "イベント終了処理", count: postEvent },
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map(c => (
        <Card key={c.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{c.count}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
