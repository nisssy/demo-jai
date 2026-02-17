import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Send, FileCheck, Database, FolderOpen, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export type DataCollectionViewProps = {
  expenseData: { submitted: number; total: number }
  surveyData: { submitted: number; total: number }
  reminderSent: boolean
  dataSynced: boolean
  archiveComplete: boolean
  isArchiving: boolean
  expenseProgress: number
  surveyProgress: number
  expenseDashArray: number
  surveyDashArray: number
  onReminder: () => void
  onSync: () => void
  onArchive: () => void
  onNext: () => void
  onBack: () => void
}

export const DataCollectionView = ({
  expenseData,
  surveyData,
  reminderSent,
  dataSynced,
  archiveComplete,
  isArchiving,
  expenseProgress,
  surveyProgress,
  expenseDashArray,
  surveyDashArray,
  onReminder,
  onSync,
  onArchive,
  onNext,
  onBack,
}: DataCollectionViewProps) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        ← 戻る
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">データ回収＆資産格納</h1>
        <p className="text-slate-600">経費精算、アンケート回収、レポート資産の管理を行います</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Step 16-17: スタッフ経費精算</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeDasharray={`${expenseDashArray} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-blue-600">{expenseData.submitted}</div>
                <div className="text-sm text-slate-500">/ {expenseData.total}</div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              回収率: {expenseProgress}%
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Step 19-20: 顧客アンケート</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray={`${surveyDashArray} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-green-600">{surveyData.submitted}</div>
                <div className="text-sm text-slate-500">/ {surveyData.total}</div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              回収率: {surveyProgress}%
            </Badge>
          </div>
        </Card>
      </div>

      <Card className="p-6 border-2 border-purple-200 bg-purple-50/30">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold">AI自動リマインド</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">未回答者を自動抽出してリマインドを送信します</p>
        <Button onClick={onReminder} className="bg-purple-600 hover:bg-purple-700">
          <Send className="w-4 h-4 mr-2" />
          未回答者へリマインド送信
        </Button>
        {reminderSent && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            リマインドを3名の未回答者へ送信しました
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">データ同期</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">Googleフォームからデータを取り込みます</p>
        <Button onClick={onSync} variant="outline" className="border-blue-300 bg-transparent">
          <Database className="w-4 h-4 mr-2" />
          スプレッドシート取込
        </Button>

        {dataSynced && (
          <div className="mt-4 border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-2">氏名</th>
                  <th className="text-left p-2">項目</th>
                  <th className="text-right p-2">金額</th>
                  <th className="text-left p-2">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-2">山田 太郎</td>
                  <td className="p-2">交通費</td>
                  <td className="p-2 text-right">¥3,500</td>
                  <td className="p-2">
                    <Badge className="bg-green-100 text-green-700">承認済</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-2">佐藤 花子</td>
                  <td className="p-2">宿泊費</td>
                  <td className="p-2 text-right">¥12,000</td>
                  <td className="p-2">
                    <Badge className="bg-yellow-100 text-yellow-700">確認中</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-2">田中 次郎</td>
                  <td className="p-2">交通費</td>
                  <td className="p-2 text-right">¥2,800</td>
                  <td className="p-2">
                    <Badge className="bg-green-100 text-green-700">承認済</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-6 border-2 border-purple-200 bg-purple-50/30">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold">Step 21: レポート資産自動格納</h2>
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-3">イベント写真とレポートデータをアーカイブします</p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className={`aspect-square bg-slate-200 rounded-lg flex items-center justify-center transition-all ${
                  isArchiving ? "animate-pulse" : ""
                } ${archiveComplete ? "opacity-50" : ""}`}
              >
                <FileCheck className="w-8 h-8 text-slate-400" />
              </div>
            ))}
          </div>
        </div>

        <Button onClick={onArchive} disabled={isArchiving || archiveComplete} className="bg-purple-600 hover:bg-purple-700">
          <FolderOpen className="w-4 h-4 mr-2" />
          {isArchiving ? "格納中..." : archiveComplete ? "格納完了" : "Boxへ自動格納"}
        </Button>

        {archiveComplete && (
          <div className="mt-4 p-4 bg-green-100 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <div className="font-semibold text-green-800">格納完了</div>
              <div className="text-sm text-green-700">フォルダ: Event_1225 / 8ファイル</div>
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg" className="bg-blue-600 hover:bg-blue-700">
          次のステップへ →
        </Button>
      </div>
    </div>
  )
}
