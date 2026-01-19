"use client"

import type { ValidationResult, ProjectItem } from "@/features/project-list/model/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertTriangle, Loader2, Send, Sparkles } from "lucide-react"

type CorrectionFormData = {
  contractAmount: string
  billingAddress: string
}

type ValidationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  validationProject: ProjectItem | null
  isValidating: boolean
  validationResult: ValidationResult | null
  correctionMessage: string
  onCorrectionMessageChange: (message: string) => void
  onGenerateCorrection: () => void
  correctionFormData: CorrectionFormData
  onCorrectionFormDataChange: (data: CorrectionFormData) => void
  onSubmitCorrection: () => void
  onNotifyInternal: () => void
}

export function ValidationDialog({
  open,
  onOpenChange,
  validationProject,
  isValidating,
  validationResult,
  correctionMessage,
  onCorrectionMessageChange,
  onGenerateCorrection,
  correctionFormData,
  onCorrectionFormDataChange,
  onSubmitCorrection,
  onNotifyInternal,
}: ValidationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            案件確認・バリデーション
          </DialogTitle>
          <DialogDescription>AIが案件内容を自動的にチェックし、不備がある場合は修正依頼を生成します</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
              <Sparkles className="h-4 w-4" />
              Step 7: 自動バリデーション
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-slate-900 mb-2">案件サマリー</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">案件名:</span>
                  <span className="ml-2 font-medium">{validationProject?.projectName}</span>
                </div>
                <div>
                  <span className="text-slate-600">顧客:</span>
                  <span className="ml-2 font-medium">{validationProject?.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-600">タレント:</span>
                  <span className="ml-2 font-medium">{validationProject?.talent}</span>
                </div>
                <div>
                  <span className="text-slate-600">開催日:</span>
                  <span className="ml-2 font-medium">{validationProject?.date}</span>
                </div>
              </div>
            </div>

            {isValidating ? (
              <div className="flex items-center justify-center py-8 bg-purple-50 rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="ml-3 text-slate-600">バリデーション実行中...</span>
              </div>
            ) : validationResult ? (
              validationResult.isValid ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="font-semibold mb-1">バリデーション成功</div>
                    <div className="text-sm">不備は見つかりませんでした。内勤へ通知します。</div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">不備が{validationResult.errors.length}件見つかりました</div>
                    <ul className="space-y-1 text-sm">
                      {validationResult.errors.map((error, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )
            ) : null}
          </div>

          {validationResult && !validationResult.isValid && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                  <Sparkles className="h-4 w-4" />
                  Step 7-1: 修正依頼作成（AI生成）
                </div>
                {!correctionMessage && (
                  <Button
                    onClick={onGenerateCorrection}
                    variant="outline"
                    size="sm"
                    className="gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                  >
                    <Sparkles className="h-4 w-4" />
                    修正依頼を生成
                  </Button>
                )}
              </div>

              {correctionMessage && (
                <div className="space-y-3">
                  <Textarea
                    value={correctionMessage}
                    onChange={(e) => onCorrectionMessageChange(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <Alert className="bg-blue-50 border-blue-200">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      修正依頼がSlackで営業担当へ自動送信されました
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          )}

          {correctionMessage && validationResult && !validationResult.isValid && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">Step 7-2: 修正入力</div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correctionAmount" className="text-red-600">
                    見積金額 *
                  </Label>
                  <Input
                    id="correctionAmount"
                    type="number"
                    value={correctionFormData.contractAmount}
                    onChange={(e) => onCorrectionFormDataChange({ ...correctionFormData, contractAmount: e.target.value })}
                    placeholder="600000"
                    className="border-red-500 border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correctionAddress" className="text-red-600">
                    タレント確認 *
                  </Label>
                  <Input
                    id="correctionAddress"
                    value={correctionFormData.billingAddress}
                    onChange={(e) => onCorrectionFormDataChange({ ...correctionFormData, billingAddress: e.target.value })}
                    placeholder="スケジュール確認済み"
                    className="border-red-500 border-2"
                  />
                </div>
              </div>

              <Button
                onClick={onSubmitCorrection}
                className="w-full gap-2"
                disabled={!correctionFormData.contractAmount || !correctionFormData.billingAddress}
              >
                <CheckCircle2 className="h-4 w-4" />
                修正完了・再バリデーション
              </Button>
            </div>
          )}

          {validationResult && validationResult.isValid && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                <Sparkles className="h-4 w-4" />
                Step 7-3: 内勤へ部門連携
              </div>

              <Alert className="bg-purple-50 border-purple-200">
                <AlertDescription className="text-purple-900">
                  <div className="font-semibold mb-1">バリデーション完了</div>
                  <div className="text-sm">案件に不備はありません。内勤担当へ自動通知し、DMM上でステータスを更新します。</div>
                </AlertDescription>
              </Alert>

              <Button onClick={onNotifyInternal} className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
                <Send className="h-4 w-4" />
                内勤へ連絡して手配画面へ
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          {validationResult && validationResult.isValid ? (
            <Button onClick={onNotifyInternal} className="gap-2">
              <Send className="h-4 w-4" />
              内勤へ連絡して手配画面へ
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              閉じる
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

