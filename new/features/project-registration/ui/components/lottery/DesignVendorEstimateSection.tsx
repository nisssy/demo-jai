"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Upload, Image as ImageIcon, CheckCircle2 } from "lucide-react"
import { useNotifications } from "@/new/notifications/notification-context"
import type { Role } from "@/new/types/role"

type DesignEstimateData = {
  creativeImage?: { name: string; dataUrl: string }
  changeRequest: string
  tempEstimateDeadline: string
  notes: string
  requestedAt?: string
  quoteAmount?: number
  quoteReceivedAt?: string
  quoteApplied?: boolean
}

const storageKey = (pid: number | string) => `design_estimate_${pid}`

const load = (pid: number | string): DesignEstimateData => {
  if (typeof window === "undefined") return def()
  try {
    const raw = localStorage.getItem(storageKey(pid))
    return raw ? { ...def(), ...JSON.parse(raw) } : def()
  } catch {
    return def()
  }
}

const def = (): DesignEstimateData => ({
  changeRequest: "",
  tempEstimateDeadline: "",
  notes: "",
})

const persist = (pid: number | string, d: DesignEstimateData) => {
  if (typeof window === "undefined") return
  localStorage.setItem(storageKey(pid), JSON.stringify(d))
}

type Props = {
  productId?: number
  onApplyQuoteToItem?: (amount: number) => void
}

export const DesignVendorEstimateSection = ({ productId, onApplyQuoteToItem }: Props) => {
  const search = useSearchParams()
  const role = (search?.get("role") as Role | null) ?? "Sales"
  const [state, setState] = useState<DesignEstimateData>(def())
  const fileRef = useRef<HTMLInputElement>(null)
  const notif = useNotifications()

  useEffect(() => {
    if (productId) setState(load(productId))
  }, [productId])

  const update = (patch: Partial<DesignEstimateData>) => {
    setState((prev) => {
      const next = { ...prev, ...patch }
      if (productId) persist(productId, next)
      return next
    })
  }

  const isVendor = role === "DesignVendor"
  const isEditable = !isVendor

  const handleFile = (f: File | undefined) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => update({ creativeImage: { name: f.name, dataUrl: reader.result as string } })
    reader.readAsDataURL(f)
  }

  const uploadSampleImage = () => {
    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="#e0e7ff"/><text x="200" y="100" font-size="24" fill="#4338ca" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif">サンプル クリエイティブ</text><text x="200" y="140" font-size="14" fill="#6366f1" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif">イメージ画像</text></svg>`
    const dataUrl = `data:image/svg+xml;base64,${typeof window === "undefined" ? "" : btoa(unescape(encodeURIComponent(sampleSvg)))}`
    update({ creativeImage: { name: "sample_creative.svg", dataUrl } })
  }

  const handleRequest = () => {
    const now = new Date().toISOString()
    const amt = Math.floor(30000 + Math.random() * 120000)
    update({ requestedAt: now, quoteAmount: amt, quoteReceivedAt: now })
    notif.addNotification({
      title: "デザイン業者へ仮見積依頼を送付しました",
      message: state.changeRequest || "クリエイティブ変更の仮見積依頼",
      targetRoles: ["DesignVendor"],
      fromRole: role,
      category: "estimate",
      link: productId ? { path: `/new/project-registration?mode=product-edit&productId=${productId}&role=DesignVendor` } : undefined,
    })
  }

  const handleVendorReply = () => {
    const amt = Math.floor(30000 + Math.random() * 120000)
    update({ quoteAmount: amt, quoteReceivedAt: new Date().toISOString() })
    notif.addNotification({
      title: "デザイン業者から仮見積が届きました",
      message: `金額: ¥${amt.toLocaleString()}`,
      targetRoles: ["Sales", "Internal"],
      fromRole: "DesignVendor",
      category: "estimate",
      link: productId ? { path: `/new/project-registration?mode=product-edit&productId=${productId}&role=Sales` } : undefined,
    })
  }

  // 仮見積金額が届いたら自動でデザイン修正費に反映
  useEffect(() => {
    if (!isEditable) return
    if (state.quoteAmount == null || state.quoteApplied) return
    onApplyQuoteToItem?.(state.quoteAmount)
    update({ quoteApplied: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.quoteAmount, state.quoteApplied, isEditable])

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">デザイン業者見積もり</h3>
            <p className="text-xs text-slate-500">
              クリエイティブ変更内容を伝えて、デザイン業者に仮見積を依頼します。
            </p>
          </div>
          {state.requestedAt && !state.quoteAmount && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-800">依頼中</span>
          )}
          {state.quoteAmount && !state.quoteApplied && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">回答到着</span>
          )}
          {state.quoteApplied && (
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-medium text-white">反映済み</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">クリエイティブ（イメージ画像）</Label>
            <div
              className="cursor-pointer rounded border-2 border-dashed p-4 text-center hover:bg-white"
              onClick={() => isEditable && fileRef.current?.click()}
            >
              {state.creativeImage ? (
                <img src={state.creativeImage.dataUrl} alt="creative" className="mx-auto max-h-32 object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">イメージ画像をアップロード</span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
            {isEditable && (
              <Button type="button" size="sm" variant="outline" className="text-xs gap-1" onClick={uploadSampleImage}>
                <ImageIcon className="h-3.5 w-3.5" />
                サンプル画像をアップロード
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">変更内容</Label>
              <Textarea
                rows={3}
                className="text-xs"
                placeholder="入力してください"
                value={state.changeRequest}
                onChange={(e) => update({ changeRequest: e.target.value })}
                readOnly={!isEditable}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">仮見積期日</Label>
                <Input
                  type="date"
                  className="h-9 text-xs"
                  value={state.tempEstimateDeadline}
                  onChange={(e) => update({ tempEstimateDeadline: e.target.value })}
                  readOnly={!isEditable}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">備考</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="その他詳細"
                  value={state.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                  readOnly={!isEditable}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          {isEditable && !state.requestedAt && (
            <Button size="sm" onClick={handleRequest} className="gap-1">
              <Send className="h-3.5 w-3.5" />
              デザイン業者へ確認依頼
            </Button>
          )}

          {isVendor && state.requestedAt && !state.quoteAmount && (
            <Button size="sm" onClick={handleVendorReply} className="gap-1">
              仮見積を回答（デモ）
            </Button>
          )}

          {state.quoteAmount != null && (
            <div className="flex items-center gap-3 ml-auto">
              <div className="text-xs">
                <span className="text-slate-500">仮見積金額:</span>{" "}
                <span className="font-bold text-slate-900">¥{state.quoteAmount.toLocaleString()}</span>
              </div>
              {state.quoteApplied && isEditable && (
                <span className="text-xs text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  デザイン修正費に反映済み
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
