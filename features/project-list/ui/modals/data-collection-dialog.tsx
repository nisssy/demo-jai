"use client"

import { useState } from "react"
import type { ProjectItem } from "@/features/project-list/model/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, Database, FileCheck, FolderOpen, Send, Sparkles } from "lucide-react"

type DataCollectionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectItem | null
}

export function DataCollectionDialog({ open, onOpenChange, project }: DataCollectionDialogProps) {
  const [expenseData] = useState({ submitted: 7, total: 10 })
  const [surveyData] = useState({ submitted: 42, total: 50 })
  const [reminderSent, setReminderSent] = useState(false)
  const [dataSynced, setDataSynced] = useState(false)
  const [archiveComplete, setArchiveComplete] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  const handleReminder = () => {
    setReminderSent(true)
    setTimeout(() => setReminderSent(false), 3000)
  }

  const handleSync = () => {
    setDataSynced(true)
  }

  const handleArchive = () => {
    setIsArchiving(true)
    setTimeout(() => {
      setIsArchiving(false)
      setArchiveComplete(true)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>データ回収＆資産格納</DialogTitle>
          <DialogDescription>{project && `${project.projectName} - 経費精算、アンケート回収、レポート資産の管理`}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recovery Status Monitor */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Expense Claims */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">スタッフ経費精算</h3>
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
                      strokeDasharray={`${(expenseData.submitted / expenseData.total) * 440} 440`}
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
                  回収率: {Math.round((expenseData.submitted / expenseData.total) * 100)}%
                </Badge>
              </div>
            </Card>

            {/* Client Surveys */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">顧客アンケート</h3>
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
                      strokeDasharray={`${(surveyData.submitted / surveyData.total) * 440} 440`}
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
                  回収率: {Math.round((surveyData.submitted / surveyData.total) * 100)}%
                </Badge>
              </div>
            </Card>
          </div>

          {/* AI Reminder */}
          <Card className="p-6 border-2 border-purple-200 bg-purple-50/30">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold">AI自動リマインド</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">未回答者を自動抽出してリマインドを送信します</p>
            <Button onClick={handleReminder} className="bg-purple-600 hover:bg-purple-700">
              <Send className="w-4 h-4 mr-2" />
              未回答者へリマインド送信
            </Button>
            {reminderSent && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                リマインドを3名の未回答者へ送信しました
              </div>
            )}
          </Card>

          {/* Data Sync */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold">データ同期</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">Googleフォームからデータを取り込みます</p>
            <Button onClick={handleSync} variant="outline" className="border-blue-300 bg-transparent">
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

          {/* Asset Archiving */}
          <Card className="p-6 border-2 border-purple-200 bg-purple-50/30">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold">レポート資産自動格納</h2>
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

            <Button onClick={handleArchive} disabled={isArchiving || archiveComplete} className="bg-purple-600 hover:bg-purple-700">
              <FolderOpen className="w-4 h-4 mr-2" />
              {isArchiving ? "格納中..." : archiveComplete ? "格納完了" : "Boxへ自動格納"}
            </Button>

            {archiveComplete && (
              <div className="mt-4 p-4 bg-green-100 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-800">格納完了</div>
                  <div className="text-sm text-green-700">フォルダ: Event_1225 / 8ファイル</div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

