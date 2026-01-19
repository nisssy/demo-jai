"use client"

import { useState } from "react"
import type { ProjectItem } from "@/features/project-list/model/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowRight, CheckCircle2, Download, Loader2, Search, Sparkles } from "lucide-react"

type DataExportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectItem | null
}

export function DataExportDialog({ open, onOpenChange, project }: DataExportDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>公開確認＆データ出力</DialogTitle>
          <DialogDescription>{project && `${project.projectName} - レポート公開状況の確認と会計システムへのデータ出力`}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Publication Checker */}
          <Card className="p-6 border-2 border-purple-200 bg-purple-50/30">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold">Web公開検証</h2>
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
                  <Button onClick={handlePublicationCheck} disabled={!reportUrl || isScanning} className="bg-purple-600 hover:bg-purple-700">
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
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <span className="font-semibold text-green-800">公開確認完了</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>画像掲載OK (8枚検出)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>本文掲載OK (コンパニオン情報一致)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>公開日時: 2025/12/22 14:30</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Cowboy Data Export */}
          <Card className="p-6 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold">Cowboy形式データ変換</h2>
            </div>

            <p className="text-sm text-slate-600 mb-4">会計システム（Cowboy）へのデータエクスポート</p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Left: DMM Data */}
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
              <div className={`border-2 rounded-lg p-4 transition-all ${dataMapped ? "border-green-300 bg-green-50" : "border-slate-200"}`}>
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
              <Button onClick={handleMapping} disabled={isMappingData || dataMapped} className="bg-blue-600 hover:bg-blue-700">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

