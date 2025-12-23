"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ProjectData } from "@/app/page"

interface Screen7Props {
  projectData: ProjectData
  onNext: () => void
  onBack: () => void
}

export function Screen7({ projectData, onNext, onBack }: Screen7Props) {
  const [prGenerated, setPrGenerated] = useState(false)
  const [prText, setPrText] = useState("")
  const [costsAutoFilled, setCostsAutoFilled] = useState(false)
  const [complianceStep, setComplianceStep] = useState(0) // 0: not checked, 1: error, 2: success
  const [isGenerating, setIsGenerating] = useState(false)

  const [costs, setCosts] = useState([
    { item: "タレント出演料", amount: "" },
    { item: "交通費", amount: "" },
    { item: "宿泊費", amount: "" },
    { item: "PR広告費", amount: "" },
  ])

  const handleGeneratePR = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const storeName = projectData.venue || "〇〇店"
      const eventDate = projectData.date
        ? new Date(projectData.date).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })
        : "近日"
      setPrText(
        `明日${eventDate}、${storeName}にて${projectData.talent || "人気コンパニオン"}が登場！皆様のご来店をお待ちしております🎉 #パチンコ #新台入替 #コンパニオンイベント`,
      )
      setPrGenerated(true)
      setIsGenerating(false)
    }, 800)
  }

  const handleAutoFillCosts = () => {
    setCosts([
      { item: "タレント出演料", amount: "150000" },
      { item: "交通費", amount: "25000" },
      { item: "宿泊費", amount: "18000" },
      { item: "PR広告費", amount: "50000" },
    ])
    setCostsAutoFilled(true)
  }

  const handleComplianceCheck = () => {
    if (complianceStep === 0) {
      // First click: show error
      setComplianceStep(1)
    } else if (complianceStep === 1) {
      // Second click: show success
      setComplianceStep(2)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        ← 戻る
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">運営管理＆コンプライアンス</h1>
        <p className="text-slate-600">イベントの広報、コスト管理、発注書作成を行います</p>
      </div>

      {/* PR Management Section (Step 13) */}
      <Card className="p-6 border-2 border-purple-200 bg-purple-50/30">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold">Step 13: AI広報アシスタント</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">イベント日:</span>
              <span className="ml-2 font-medium">{projectData.date || "未設定"}</span>
            </div>
            <div>
              <span className="text-slate-600">店舗名:</span>
              <span className="ml-2 font-medium">{projectData.venue || "未設定"}</span>
            </div>
          </div>

          <Button onClick={handleGeneratePR} className="bg-purple-600 hover:bg-purple-700" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                PR文面生成
              </>
            )}
          </Button>

          {prGenerated && (
            <div className="mt-4 p-4 bg-white rounded-lg border-2 border-purple-300">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  X (Twitter) プレビュー
                </Badge>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{prText}</p>
              <Button className="mt-4 bg-blue-500 hover:bg-blue-600">承認（投稿予約）</Button>
            </div>
          )}
        </div>
      </Card>

      {/* Cost Management Section (Step 14) */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold">Step 14: コスト管理</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button onClick={handleAutoFillCosts} variant="outline" className="border-purple-300 bg-transparent">
              <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
              マスタ参照（自動入力）
            </Button>
            {costsAutoFilled && <Badge className="bg-green-100 text-green-700">入力完了</Badge>}
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-3 font-semibold">項目</th>
                  <th className="text-right p-3 font-semibold">金額（円）</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {costs.map((cost, idx) => (
                  <tr key={idx}>
                    <td className="p-3">{cost.item}</td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={cost.amount}
                        onChange={(e) => {
                          const newCosts = [...costs]
                          newCosts[idx].amount = e.target.value
                          setCosts(newCosts)
                        }}
                        className="text-right"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td className="p-3 font-bold">合計</td>
                  <td className="p-3 text-right font-bold">
                    ¥{costs.reduce((sum, c) => sum + (Number.parseInt(c.amount) || 0), 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Card>

      {/* Compliance Check Section (Step 15) */}
      <Card className="p-6 border-2 border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">Step 15: 発注書生成・下請法チェック</h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-600">発注書作成前に下請法のコンプライアンスチェックを行います</p>

          <Button onClick={handleComplianceCheck} className="bg-blue-600 hover:bg-blue-700">
            <Sparkles className="w-4 h-4 mr-2" />
            下請法コンプライアンスチェック・発注書作成
          </Button>

          {complianceStep === 1 && (
            <Alert className="border-red-300 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="font-semibold mb-1">🔴 コンプライアンス違反の可能性</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>支払サイトが下請法（60日以内）に抵触する可能性があります</li>
                  <li>納期が未入力です</li>
                </ul>
                <p className="mt-2 text-sm">修正後、再度チェックしてください。</p>
              </AlertDescription>
            </Alert>
          )}

          {complianceStep === 2 && (
            <Alert className="border-green-300 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="font-semibold mb-1">🟢 コンプライアンスチェック完了</div>
                <p className="text-sm mb-3">適合。発注書PDFを生成しました。</p>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <FileText className="w-4 h-4 mr-2" />
                  発注書PDFダウンロード
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg" className="bg-blue-600 hover:bg-blue-700">
          次のステップへ →
        </Button>
      </div>
    </div>
  )
}
