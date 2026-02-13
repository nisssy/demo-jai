import type { QuoteDocument } from "@/new/features/project-quote/model/types"

type QuotePreviewProps = {
  document: QuoteDocument
}

export const QuotePreview = ({ document: doc }: QuotePreviewProps) => {
  const taxRate = 0.1
  const taxAmount = Math.round(doc.totalAmount * taxRate)
  const totalWithTax = doc.totalAmount + taxAmount

  return (
    <div className="bg-white border-2 border-slate-300 rounded-lg p-8 shadow-sm max-w-2xl mx-auto">
      {/* ヘッダー */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-wider text-slate-900">見積書</h2>
      </div>

      {/* 発行日 & 案件番号 */}
      <div className="flex justify-between mb-6">
        <div>
          <div className="text-lg font-semibold text-slate-900 border-b-2 border-slate-900 pb-1 inline-block">
            {doc.clientName} 御中
          </div>
        </div>
        <div className="text-right text-sm text-slate-600">
          <div>発行日: {doc.issueDate}</div>
          <div>案件No: {doc.projectNumber}</div>
        </div>
      </div>

      {/* 案件詳細 */}
      <div className="grid grid-cols-2 gap-2 mb-6 text-sm">
        <div className="text-slate-600">案件名</div>
        <div className="text-slate-900">{doc.projectName}</div>
      </div>

      {/* 合計金額（税込） */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
        <div className="text-base font-semibold text-blue-800">
          合計金額（税込）
        </div>
        <div className="text-3xl font-bold text-slate-900 mt-1">
          ¥{totalWithTax.toLocaleString()}
        </div>
      </div>

      {/* 商材別内訳（旧バージョン準拠） */}
      {doc.productBreakdowns && doc.productBreakdowns.length > 0 && (
        <div className="mb-6">
          {doc.productBreakdowns.map((bd, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="font-medium text-sm text-slate-900">{bd.name}</div>
                <div className="text-xs text-slate-500">{bd.eventDate}</div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-1.5 font-medium text-slate-700">項目</th>
                    <th className="text-right py-1.5 font-medium text-slate-700 w-28">金額</th>
                  </tr>
                </thead>
                <tbody>
                  {bd.items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-600">{item.name}</td>
                      <td className="py-1.5 text-right text-slate-900">
                        ¥{item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-300">
                    <td className="py-1.5 font-medium text-slate-700">小計</td>
                    <td className="py-1.5 text-right font-medium text-slate-900">
                      ¥{bd.subtotal.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* 見積項目テーブル */}
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b-2 border-slate-900">
            <th className="text-left py-2 font-semibold text-slate-900">項目</th>
            <th className="text-right py-2 font-semibold text-slate-900 w-32">金額</th>
          </tr>
        </thead>
        <tbody>
          {doc.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-200">
              <td className="py-2 text-slate-700">{item.name}</td>
              <td className="py-2 text-right text-slate-900 font-medium">
                ¥{item.amount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-300">
            <td className="py-2 text-slate-600 font-medium">小計</td>
            <td className="py-2 text-right text-slate-900 font-medium">
              ¥{doc.totalAmount.toLocaleString()}
            </td>
          </tr>
          <tr>
            <td className="py-1 text-slate-600">消費税（10%）</td>
            <td className="py-1 text-right text-slate-700">
              ¥{taxAmount.toLocaleString()}
            </td>
          </tr>
          <tr className="border-t-2 border-slate-900">
            <td className="py-2 text-slate-900 font-bold">合計（税込）</td>
            <td className="py-2 text-right text-lg font-bold text-slate-900">
              ¥{totalWithTax.toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* 備考 */}
      <div className="text-xs text-slate-500 mt-4">
        ※ 上記金額は全商材の小計合計に基づく概算です。
      </div>

      {/* フッター */}
      <div className="text-center text-xs text-slate-400 mt-6 border-t border-slate-200 pt-4">
        ※ 本見積書の有効期限は発行日より30日間です。
      </div>
    </div>
  )
}
