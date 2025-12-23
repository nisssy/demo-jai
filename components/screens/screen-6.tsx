"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import type { ProjectData } from "@/app/page"
import { useState } from "react"

type Screen6Props = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onResubmit: () => void
}

export function Screen6({ projectData, setProjectData, onResubmit }: Screen6Props) {
  const [localBillingAddress, setLocalBillingAddress] = useState(projectData.billingAddress)
  const [localContractAmount, setLocalContractAmount] = useState(projectData.contractAmount)

  const hasAddressError = projectData.validationErrors.some((e) => e.includes("住所"))
  const hasAmountError = projectData.validationErrors.some((e) => e.includes("契約金額"))

  const handleResubmit = () => {
    setProjectData({
      ...projectData,
      billingAddress: localBillingAddress,
      contractAmount: localContractAmount,
      validationErrors: [], // Clear errors after correction
    })
    onResubmit()
  }

  const isFormValid = localBillingAddress.trim() !== "" && localContractAmount.trim() !== ""

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">不備修正</h1>
        <p className="text-slate-600">内勤からの指摘事項を修正してください</p>
      </div>

      {/* Correction Request Message */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-semibold mb-2">Co・Dirからの修正依頼</div>
          <pre className="text-sm whitespace-pre-wrap font-mono bg-slate-50 p-3 rounded mt-2">
            {projectData.correctionRequest}
          </pre>
        </AlertDescription>
      </Alert>

      {/* Correction Form */}
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
    </div>
  )
}
