import { useRef, useState } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import type { HallQuote } from "@/new/api/types"

type Props = {
  eventName: string
  hallQuotes: HallQuote[]
  dmMailing: "yes" | "no"
}

export const QuotePdfDownload = ({ eventName, hallQuotes, dmMailing }: Props) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)
  const disabled = hallQuotes.length === 0 || generating

  const handleDownload = async () => {
    if (!contentRef.current) return
    setGenerating(true)
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 20
      const usableW = pageW - margin * 2
      const imgH = (canvas.height * usableW) / canvas.width

      if (imgH <= pageH - margin * 2) {
        pdf.addImage(imgData, "PNG", margin, margin, usableW, imgH)
      } else {
        // 複数ページ分割
        let remaining = imgH
        let offsetY = 0
        while (remaining > 0) {
          const sliceH = Math.min(pageH - margin * 2, remaining)
          pdf.addImage(imgData, "PNG", margin, margin - offsetY, usableW, imgH)
          remaining -= sliceH
          offsetY += sliceH
          if (remaining > 0) pdf.addPage()
        }
      }

      const dateStr = new Date().toISOString().slice(0, 10)
      pdf.save(`見積書_${eventName || "event"}_${dateStr}.pdf`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={disabled}
          className="gap-1"
        >
          {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          見積書PDFダウンロード
        </Button>
      </div>

      {/* オフスクリーン描画用（画面外で描画してhtml2canvasで撮影） */}
      <div className="fixed -left-[10000px] top-0" aria-hidden>
        <div
          ref={contentRef}
          style={{ width: "800px", padding: "32px", background: "#ffffff", fontFamily: '"Hiragino Kaku Gothic ProN","Hiragino Sans","Noto Sans JP","Yu Gothic",sans-serif', color: "#0f172a" }}
        >
          <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>見積書</h1>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "24px" }}>
            <div>イベント名: {eventName || "-"}</div>
            <div>発行日: {new Date().toISOString().slice(0, 10)}</div>
          </div>

          {hallQuotes.map((hq) => {
            const items = hq.quoteItems.filter((i) => dmMailing === "yes" || i.id !== 3)
            const subtotal = items.reduce((s, i) => s + i.quantity * (i.salesUnitPrice || i.unitPrice), 0)
            return (
              <div key={hq.hallName} style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px", borderBottom: "2px solid #334155", paddingBottom: "4px" }}>
                  {hq.hallName}
                </div>
                <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      <th style={{ textAlign: "left", padding: "6px", borderBottom: "1px solid #cbd5e1" }}>商品名</th>
                      <th style={{ textAlign: "right", padding: "6px", borderBottom: "1px solid #cbd5e1", width: "60px" }}>数量</th>
                      <th style={{ textAlign: "right", padding: "6px", borderBottom: "1px solid #cbd5e1", width: "100px" }}>販売単価</th>
                      <th style={{ textAlign: "right", padding: "6px", borderBottom: "1px solid #cbd5e1", width: "110px" }}>金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const price = item.salesUnitPrice || item.unitPrice
                      const amount = item.quantity * price
                      return (
                        <tr key={item.id}>
                          <td style={{ padding: "6px", borderBottom: "1px solid #e2e8f0" }}>{item.name}</td>
                          <td style={{ padding: "6px", textAlign: "right", borderBottom: "1px solid #e2e8f0" }}>{item.quantity}</td>
                          <td style={{ padding: "6px", textAlign: "right", borderBottom: "1px solid #e2e8f0" }}>¥{price.toLocaleString()}</td>
                          <td style={{ padding: "6px", textAlign: "right", borderBottom: "1px solid #e2e8f0" }}>¥{amount.toLocaleString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600, borderTop: "2px solid #334155" }}>小計</td>
                      <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600, borderTop: "2px solid #334155" }}>¥{subtotal.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )
          })}

          <div style={{ borderTop: "3px double #0f172a", paddingTop: "12px", marginTop: "16px", display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 700 }}>
            <span>合計金額</span>
            <span>
              ¥
              {hallQuotes
                .reduce((sum, hq) => {
                  const items = hq.quoteItems.filter((i) => dmMailing === "yes" || i.id !== 3)
                  return sum + items.reduce((s, i) => s + i.quantity * (i.salesUnitPrice || i.unitPrice), 0)
                }, 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
