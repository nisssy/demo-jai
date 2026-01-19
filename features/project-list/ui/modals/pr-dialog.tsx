"use client"

import type { ProjectData } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles } from "lucide-react"

type ProjectLike = NonNullable<ProjectData["projects"]>[number]

type PrDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectLike | null
  onGenerate: () => void
  isGenerating: boolean
  generated: boolean
  text: string
  onTextChange: (text: string) => void
}

export function PrDialog({ open, onOpenChange, project, onGenerate, isGenerating, generated, text, onTextChange }: PrDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI広報アシスタント
          </DialogTitle>
          <DialogDescription>AIを使ってSNS投稿文を自動生成します</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm text-slate-900 mb-2">案件サマリー</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-600">案件名:</span>
                <span className="ml-2 font-medium">{project?.projectName}</span>
              </div>
              <div>
                <span className="text-slate-600">顧客:</span>
                <span className="ml-2 font-medium">{project?.clientName}</span>
              </div>
              <div>
                <span className="text-slate-600">コンパニオン:</span>
                <span className="ml-2 font-medium">{project?.talent}</span>
              </div>
              <div>
                <span className="text-slate-600">実施日:</span>
                <span className="ml-2 font-medium">{project?.date}</span>
              </div>
            </div>
          </div>

          <Button onClick={onGenerate} className="bg-purple-600 hover:bg-purple-700 gap-2" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                PR文面生成
              </>
            )}
          </Button>

          {generated && (
            <div className="mt-4 p-4 bg-white rounded-lg border-2 border-purple-300">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  X (Twitter) プレビュー
                </Badge>
              </div>
              <Textarea value={text} onChange={(e) => onTextChange(e.target.value)} rows={4} className="mb-3" />
              <Button>承認して投稿予約</Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

