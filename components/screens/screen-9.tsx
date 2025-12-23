"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, Search, CheckCircle, Download, ArrowRight, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ProjectData } from "@/app/page"

interface Screen9Props {
  projectData: ProjectData
  onNext?: () => void
  onBack: () => void
}

export function Screen9({ projectData, onBack }: Screen9Props) {
  const [reportUrl, setReportUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [publicationChecked, setPublicationChecked] = useState(false)
  const [isMappingData, setIsMappingData] = useState(false)
  const [dataMapped, setDataMapped] = useState(false)

  const handlePublicationCheck = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setPublicationChecked(true)
    }, 2000)
  }

  const handleMapping = () => {
    setIsMappingData(true)
    setTimeout(() => {
      setIsMappingData(false)
      setDataMapped(true)
    }, 1500)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        ← 戻る
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">公開確認＆データ出力</h1>
        <p className="text-slate-600">レポート公開状況の確認と会計システムへのデータ出力を行います</p>
      </div>

      {/* Publication Checker (Step 23) */}
      <Card className="p-6 border-2 border-purple-200 bg-purple-50/30">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold">Step 23: Web公開検証</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">レポートURL</label>
            <div className="flex gap-2">
              <Input
                value={reportUrl}
                onChange={(e) => setReportUrl(e.target.value)}
                placeholder="https://example.com/report/..."
                className="flex-1"
              />
              <Button
                onClick={handlePublicationCheck}
                disabled={!reportUrl || isScanning}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    検証中...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    公開状況をAI検知
                  </>
                )}
              </Button>
            </div>
          </div>

          {isScanning && (
            <div className="p-6 bg-white rounded-lg border-2 border-purple-300">
              <div className="flex items-center justify-center mb-3">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
              <p className="text-center text-sm text-slate-600">AIがページをスキャンしています...</p>
              <div className="mt-4 h-32 bg-slate-100 rounded animate-pulse" />
            </div>
          )}

          {publicationChecked && !isScanning && (
            <div className="p-6 bg-green-50 rounded-lg border-2 border-green-300">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-green-800">公開確認完了</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>✅ 画像掲載OK (8枚検出)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>✅ 本文掲載OK (コンパニオン情報一致)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>✅ 公開日時: 2025/12/22 14:30</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Cowboy Data Export (Step 24) */}
      <Card className="p-6 border-2 border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">Step 24: Cowboy形式データ変換</h2>
        </div>

        <p className="text-sm text-slate-600 mb-4">会計システム（Cowboy）へのデータエクスポート</p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Left: JAS Data */}
          <div className="border-2 border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">DMM 生データ</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-slate-50 rounded">
                <div className="font-medium">タレント出演料</div>
                <div className="text-slate-600">¥150,000</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="font-medium">交通費</div>
                <div className="text-slate-600">¥25,000</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="font-medium">宿泊費</div>
                <div className="text-slate-600">¥18,000</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="font-medium">PR広告費</div>
                <div className="text-slate-600">¥50,000</div>
              </div>
            </div>
          </div>

          {/* Right: Cowboy Format */}
          <div
            className={`border-2 rounded-lg p-4 transition-all ${dataMapped ? "border-green-300 bg-green-50" : "border-slate-200"}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className={dataMapped ? "bg-green-100 text-green-700" : ""}>
                Cowboyフォーマット
              </Badge>
            </div>
            {dataMapped ? (
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-white rounded border">
                  <div className="font-medium">勘定科目: 5201 (外注費)</div>
                  <div className="text-slate-600">¥150,000</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <div className="font-medium">勘定科目: 6101 (旅費交通費)</div>
                  <div className="text-slate-600">¥25,000</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <div className="font-medium">勘定科目: 6102 (宿泊費)</div>
                  <div className="text-slate-600">¥18,000</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <div className="font-medium">勘定科目: 7301 (広告宣伝費)</div>
                  <div className="text-slate-600">¥50,000</div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400">変換待ち...</div>
            )}
          </div>
        </div>

        {/* Mapping Visualization */}
        {isMappingData && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-300 flex items-center justify-center gap-4">
            <span className="text-sm font-medium text-purple-700">AIがデータをマッピング中</span>
            <ArrowRight className="w-5 h-5 text-purple-600 animate-pulse" />
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleMapping}
            disabled={isMappingData || dataMapped}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isMappingData ? "変換中..." : dataMapped ? "変換完了" : "AIマッピング変換"}
          </Button>

          {dataMapped && (
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              CSVダウンロード
            </Button>
          )}
        </div>
      </Card>

      <div className="p-6 bg-green-50 rounded-lg border-2 border-green-300 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-green-800 mb-2">全ての事後処理が完了しました</h3>
        <p className="text-sm text-green-700">案件をクローズできます</p>
      </div>
    </div>
  )
}
