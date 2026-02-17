import type { HallQuote } from "@/types/lottery"
import { HallQuoteCardView } from "./HallQuoteCard.view"

export type QuoteDisplaySectionViewProps = {
  quoteGenerated: boolean
  hallQuotes: HallQuote[]
  dmMailing: "yes" | "no"
  onPdfExport: (hallName: string) => void
  onNotifyCustomer: (hallName: string) => void
}

export function QuoteDisplaySectionView({
  quoteGenerated,
  hallQuotes,
  dmMailing,
  onPdfExport,
  onNotifyCustomer,
}: QuoteDisplaySectionViewProps) {
  if (!quoteGenerated || hallQuotes.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-500">
        「見積設定」タブで見積もりを生成してください。
      </div>
    )
  }

  const totalAllHalls = hallQuotes.reduce((sum, hq) => sum + (hq.calculatedAmount || 0), 0)

  return (
    <div className="space-y-4">
      {hallQuotes.map((hq) => (
        <HallQuoteCardView
          key={hq.hallName}
          hallQuote={hq}
          dmMailing={dmMailing}
          onPdfExport={() => onPdfExport(hq.hallName)}
          onNotifyCustomer={() => onNotifyCustomer(hq.hallName)}
        />
      ))}

      {hallQuotes.length > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <span className="text-sm font-semibold text-slate-700">全ホール合計金額（割合ベース）</span>
          <span className="text-lg font-bold text-slate-900">¥{totalAllHalls.toLocaleString()}</span>
        </div>
      )}
    </div>
  )
}
