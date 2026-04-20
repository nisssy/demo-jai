"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, FileSpreadsheet, Send, Users } from "lucide-react"
import { useNotifications } from "@/new/notifications/notification-context"
import type { Role } from "@/new/types/role"

type ExtractionData = {
  extractionContent: string
  requestedDate: string
  weekday: string
  conditionFlag: "あり" | "なし" | ""
  notes: string
  requestedAt?: string
  file?: { name: string; size: number; dataUrl: string; uploadedAt: string }
  targetCount?: number
  dataConfirmed?: boolean
}

const WEEKDAY_OPTIONS = ["月", "火", "水", "木", "金", "土", "日"]

const storageKey = (productId: number | string) => `extraction_${productId}`

const load = (productId: number | string): ExtractionData => {
  if (typeof window === "undefined") return defaultState()
  try {
    const raw = localStorage.getItem(storageKey(productId))
    return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState()
  } catch {
    return defaultState()
  }
}

const defaultState = (): ExtractionData => ({
  extractionContent: "",
  requestedDate: "",
  weekday: "",
  conditionFlag: "",
  notes: "",
})

const save = (productId: number | string, data: ExtractionData) => {
  if (typeof window === "undefined") return
  localStorage.setItem(storageKey(productId), JSON.stringify(data))
}

type Props = {
  productId?: number
}

export const ExtractionConditionSection = ({ productId }: Props) => {
  const search = useSearchParams()
  const role = (search?.get("role") as Role | null) ?? "Sales"
  const [state, setState] = useState<ExtractionData>(defaultState())
  const fileRef = useRef<HTMLInputElement>(null)
  const notif = useNotifications()

  useEffect(() => {
    if (productId) setState(load(productId))
  }, [productId])

  const update = (patch: Partial<ExtractionData>) => {
    setState((prev) => {
      const next = { ...prev, ...patch }
      if (productId) save(productId, next)
      return next
    })
  }

  const isSales = role === "Sales" || role === "Internal"
  const isAdmin = role === "LotteryAdmin"

  const handleRequest = () => {
    update({ requestedAt: new Date().toISOString() })
    notif.addNotification({
      title: "BS/CSから抽出依頼が届きました",
      message: `${state.extractionContent || "抽出条件"}（希望日: ${state.requestedDate || "未設定"}）`,
      targetRoles: ["LotteryAdmin"],
      fromRole: role,
      category: "extraction",
      link: productId ? { path: `/new/project-registration?mode=product-edit&productId=${productId}&role=LotteryAdmin` } : undefined,
    })
  }

  const uploadSample = () => {
    const sampleCsv = "会員ID,氏名,住所,電話番号,ポイント\nM001,山田太郎,東京都渋谷区1-1-1,090-1234-5678,35\nM002,佐藤花子,神奈川県横浜市2-2-2,080-2345-6789,48\nM003,鈴木一郎,大阪府大阪市3-3-3,070-3456-7890,22\n"
    const dataUrl = `data:text/csv;charset=utf-8;base64,${typeof window === "undefined" ? "" : btoa(unescape(encodeURIComponent(sampleCsv)))}`
    update({
      file: {
        name: "sample_extraction_list.csv",
        size: sampleCsv.length,
        dataUrl,
        uploadedAt: new Date().toISOString(),
      },
      targetCount: 1247,
    })
    notif.addNotification({
      title: "抽出リストがアップロードされました",
      message: "sample_extraction_list.csv が事務管理課からアップロードされました。",
      targetRoles: ["Sales", "Internal"],
      fromRole: "LotteryAdmin",
      category: "extraction",
      link: productId ? { path: `/new/project-registration?mode=product-edit&productId=${productId}&role=Sales` } : undefined,
    })
  }

  const handleFile = (f: File | undefined) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      update({
        file: {
          name: f.name,
          size: f.size,
          dataUrl: reader.result as string,
          uploadedAt: new Date().toISOString(),
        },
        targetCount: Math.floor(500 + Math.random() * 2500),
      })
      notif.addNotification({
        title: "抽出リストがアップロードされました",
        message: `${f.name} が事務管理課からアップロードされました。`,
        targetRoles: ["Sales", "Internal"],
        fromRole: "LotteryAdmin",
        category: "extraction",
        link: productId ? { path: `/new/project-registration?mode=product-edit&productId=${productId}&role=Sales` } : undefined,
      })
    }
    reader.readAsDataURL(f)
  }

  const requested = !!state.requestedAt

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">抽出条件</h3>
            <p className="text-xs text-slate-500">
              {isSales && "BS/CSが抽出条件を入力して事務管理課に依頼します。"}
              {isAdmin && "BS/CSから受信した抽出条件です。対象ファイルをアップロードしてください。"}
            </p>
          </div>
          {requested && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
              依頼済み
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">抽出内容</Label>
            <Select
              value={state.extractionContent || "_empty"}
              onValueChange={(v) => update({ extractionContent: v === "_empty" ? "" : v })}
              disabled={isAdmin}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_empty" className="text-xs">選択してください</SelectItem>
                <SelectItem value="DM送付対象者" className="text-xs">DM送付対象者</SelectItem>
                <SelectItem value="会員データ" className="text-xs">会員データ</SelectItem>
                <SelectItem value="アンケートDM" className="text-xs">アンケートDM</SelectItem>
                <SelectItem value="その他" className="text-xs">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">抽出希望日</Label>
            <Input
              type="date"
              className="h-9 text-xs"
              value={state.requestedDate}
              onChange={(e) => {
                const value = e.target.value
                const weekday = value ? WEEKDAY_OPTIONS[new Date(value).getDay() === 0 ? 6 : new Date(value).getDay() - 1] : ""
                update({ requestedDate: value, weekday })
              }}
              readOnly={isAdmin}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">曜日</Label>
            <Input
              className="h-9 text-xs bg-slate-50"
              value={state.weekday}
              readOnly
              placeholder="日付から自動入力"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">DM抽出条件有無</Label>
            <Select
              value={state.conditionFlag}
              onValueChange={(v) => update({ conditionFlag: v as ExtractionData["conditionFlag"] })}
              disabled={isAdmin}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="あり" className="text-xs">抽出条件あり(備考欄に詳細参照)</SelectItem>
                <SelectItem value="なし" className="text-xs">DM希望者全員</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">備考</Label>
          <Textarea
            rows={2}
            className="text-xs"
            value={state.notes}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="入力してください"
            readOnly={isAdmin}
          />
        </div>

        {isSales && !requested && (
          <div className="flex justify-end">
            <Button size="sm" className="gap-1" onClick={handleRequest}>
              <Send className="h-3.5 w-3.5" />
              事務管理課へ依頼
            </Button>
          </div>
        )}

        {/* 事務管理: アップロード領域 */}
        {isAdmin && requested && (
          <div className="rounded-lg border border-dashed border-amber-300 bg-white p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-700">抽出リストアップロード</div>
            <div
              className="cursor-pointer rounded border-2 border-dashed p-4 text-center hover:bg-slate-50"
              onClick={() => fileRef.current?.click()}
            >
              {state.file ? (
                <div className="flex items-center justify-center gap-2 text-xs text-slate-700">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">{state.file.name}</span>
                  <span className="text-slate-400">({Math.round(state.file.size / 1024)}KB)</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">CSV/Excelファイルをアップロード</span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={uploadSample} className="gap-1 text-xs">
                サンプルをアップロード
              </Button>
            </div>
          </div>
        )}

        {/* BS/CS: ファイル確認 */}
        {isSales && state.file && (
          <div className="rounded-lg border bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-700">事務管理課からのアップロード</div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span className="font-medium">{state.file.name}</span>
              <a
                href={state.file.dataUrl}
                download={state.file.name}
                className="text-blue-600 hover:underline"
              >
                ダウンロード
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">対象人数（自動入力）</Label>
                <div className="flex items-center gap-2 rounded border bg-slate-50 px-3 py-2 text-xs">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-medium">{state.targetCount?.toLocaleString() ?? "-"} 名</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">データ確認</Label>
                <label className="flex items-center gap-2 rounded border bg-white px-3 py-2 text-xs cursor-pointer">
                  <Checkbox
                    checked={!!state.dataConfirmed}
                    onCheckedChange={(v) => update({ dataConfirmed: !!v })}
                  />
                  <span>データを確認しました</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
