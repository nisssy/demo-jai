"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Send, Loader2, Sparkles, AlertTriangle } from "lucide-react"
import type { ProjectData } from "@/app/page"

type Screen5Props = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onSendCorrection: () => void
}

export function Screen5({ projectData, setProjectData, onSendCorrection }: Screen5Props) {
  const [localBillingAddress, setLocalBillingAddress] = useState(projectData.billingAddress)
  const [localContractAmount, setLocalContractAmount] = useState(projectData.contractAmount)
  const [isValidating, setIsValidating] = useState(true)
  const [correctionMessage, setCorrectionMessage] = useState("")

  useEffect(() => {
    // Simulate AI validation
    setTimeout(() => {
      const errors: string[] = []

      if (!projectData.billingAddress || projectData.billingAddress.trim() === "") {
        errors.push("請求書送付先住所が未入力です")
      }

      if (!projectData.contractAmount || projectData.contractAmount === "") {
        errors.push("契約金額が未入力です")
      }

      // Simulate a time logic error
      errors.push("終了時間が開始時間より前になっています（論理エラー）")

      setProjectData({ ...projectData, validationErrors: errors })
      setIsValidating(false)
    }, 1500)
  }, [])

  const handleGenerateCorrection = () => {
    const message = `お疲れ様です。以下の項目について修正をお願いします。

${projectData.validationErrors.map((error, idx) => `${idx + 1}. ${error}`).join("\n")}

ご確認のほど、よろしくお願いいたします。

Co・Dir担当`

    setCorrectionMessage(message)
    setProjectData({ ...projectData, correctionRequest: message })
  }

  const handleResubmit = () => {
    setProjectData({
      ...projectData,
      billingAddress: localBillingAddress,
      contractAmount: localContractAmount,
      validationErrors: [], // Clear errors after correction
    })
    onSendCorrection()
  }

  const hasAddressError = projectData.validationErrors.some((e) => e.includes("住所"))
  const hasAmountError = projectData.validationErrors.some((e) => e.includes("契約金額"))
  const isFormValid = localBillingAddress.trim() !== "" && localContractAmount.trim() !== ""

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">案件確認・不備チェック</h1>
        <p className="text-slate-600">AIが自動的に案件内容をバリデーションします</p>
      </div>

      {/* Validation Report */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle>Step 7: 自動バリデーション</CardTitle>
          </div>
          <CardDescription>AIが案件データを自動的にチェックしています</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isValidating ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-3 text-slate-600">バリデーション実行中...</span>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-900">案件概要</h4>
                  <Badge variant="secondary">{projectData.projectName}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">顧客:</span>
                    <span className="ml-2">{projectData.clientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">タレント:</span>
                    <span className="ml-2">{projectData.talent}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">契約金額:</span>
                    <span className="ml-2">{projectData.contractAmount || "未入力"}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">請求先:</span>
                    <span className="ml-2">{projectData.billingAddress || "未入力"}</span>
                  </div>
                </div>
              </div>

              {projectData.validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">
                      不備が{projectData.validationErrors.length}件見つかりました
                    </div>
                    <ul className="space-y-1 text-sm">
                      {projectData.validationErrors.map((error, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Correction Request */}
      {!isValidating && projectData.validationErrors.length > 0 && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <CardTitle>Step 7-1: 修正依頼作成（AI生成）</CardTitle>
              </div>
              {!correctionMessage && (
                <Button onClick={handleGenerateCorrection} variant="outline" className="gap-2 bg-transparent">
                  <Sparkles className="h-4 w-4" />
                  修正依頼を生成
                </Button>
              )}
            </div>
            <CardDescription>AIが修正依頼メッセージを自動生成します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {correctionMessage && (
              <>
                <Textarea
                  value={correctionMessage}
                  onChange={(e) => setCorrectionMessage(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <Button onClick={onSendCorrection} className="w-full gap-2" size="lg">
                  <Send className="h-4 w-4" />
                  修正依頼を営業へ送信
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Correction Form */}
      {!isValidating && (
        <Card>
          <CardHeader>
            <CardTitle>Step 7-2: 修正入力</CardTitle>
            <CardDescription>赤枠で表示されている項目を修正してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractAmount" className={hasAmountError ? "text-red-600" : ""}>
                  契約金額（確定）
                  {hasAmountError && " *"}
                </Label>
                <Input
                  id="contractAmount"
                  type="number"
                  value={localContractAmount}
                  onChange={(e) => setLocalContractAmount(e.target.value)}
                  placeholder="600000"
                  className={hasAmountError && localContractAmount.trim() === "" ? "border-red-500 border-2" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingAddress" className={hasAddressError ? "text-red-600" : ""}>
                  請求書送付先
                  {hasAddressError && " *"}
                </Label>
                <Input
                  id="billingAddress"
                  value={localBillingAddress}
                  onChange={(e) => setLocalBillingAddress(e.target.value)}
                  placeholder="東京都渋谷区..."
                  className={hasAddressError && localBillingAddress.trim() === "" ? "border-red-500 border-2" : ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 opacity-50">
              <div className="space-y-2">
                <Label>案件名</Label>
                <Input value={projectData.projectName} disabled />
              </div>
              <div className="space-y-2">
                <Label>顧客名</Label>
                <Input value={projectData.clientName} disabled />
              </div>
            </div>

            {isFormValid && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">すべての必須項目が入力されました</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleResubmit} disabled={!isFormValid} className="w-full gap-2" size="lg">
              <CheckCircle2 className="h-4 w-4" />
              修正完了・再提出
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
