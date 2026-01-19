import type { ProjectData } from "@/types/project"

// 見積書PDFを生成する関数（簡易版）
export function generateQuotePDF(quoteData: ProjectData, projectNumber: string): string {
  // 実際のPDF生成ライブラリを使用する場合は、ここで実装
  // 今回は簡易版として、PDFの構造をテキストで返す
  return `
見積書
案件No: ${projectNumber}
発行日: ${new Date().toLocaleDateString("ja-JP")}

${quoteData.clientName} 御中

下記の通りお見積もりいたします。

案件名: ${quoteData.projectName}
開催日: ${quoteData.date}
会場: ${quoteData.venue}
担当営業: ${quoteData.talent}

見積明細:
${quoteData.quoteItems.map((item) => `${item.item}: ¥${item.amount.toLocaleString()}`).join("\n")}

合計金額（税込）: ¥${quoteData.quoteItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
`
}

