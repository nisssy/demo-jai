"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Image as ImageIcon } from "lucide-react"
import { TRADING_PARTNERS } from "@/new/api/lottery-data"

type Props = {
  open: boolean
  onOpenChange: (o: boolean) => void
  vendorId: string
  onVendorIdChange: (id: string) => void
  onSubmit: () => void
  eventName?: string
}

const SAMPLE_IMAGES = [
  { id: "d1", label: "サンプルA", color: "from-indigo-200 to-blue-300" },
  { id: "d2", label: "サンプルB", color: "from-fuchsia-200 to-pink-300" },
  { id: "d3", label: "サンプルC", color: "from-amber-200 to-orange-300" },
]

export const DmOrderModal = ({ open, onOpenChange, vendorId, onVendorIdChange, onSubmit, eventName }: Props) => {
  const designPartners = TRADING_PARTNERS.filter((t) => t.type === "design")
  const [firstDraftDate, setFirstDraftDate] = useState("")
  const [proofDate, setProofDate] = useState("")
  const [mailingDate, setMailingDate] = useState("")
  const [qty, setQty] = useState("500")
  const [sampleId, setSampleId] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [subject, setSubject] = useState(`【DM作成依頼】${eventName ?? "抽選会"}のDM制作について`)
  const [body, setBody] = useState(
    `お世話になっております。\n下記の通りDM作成を依頼いたします。\n\n・数量: 500枚\n・初稿希望日: \n・校了予定日: \n・投函日: \n\nよろしくお願いいたします。`,
  )
  const fileRef = useRef<HTMLInputElement>(null)
  const selectedSample = SAMPLE_IMAGES.find((s) => s.id === sampleId)

  const handleFile = (f: File | undefined) => {
    if (!f) return
    setUploadedImage(URL.createObjectURL(f))
    setSampleId(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[60vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>DM作成依頼</DialogTitle>
          <DialogDescription>内容を入力してデザイン業者へ送付します</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">発注先（デザイン業者）</Label>
              <Select value={vendorId} onValueChange={onVendorIdChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="デザイン会社を選択..." />
                </SelectTrigger>
                <SelectContent>
                  {designPartners.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">初稿希望日</Label>
                <Input type="date" value={firstDraftDate} onChange={(e) => setFirstDraftDate(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">校了予定日</Label>
                <Input type="date" value={proofDate} onChange={(e) => setProofDate(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">投函日</Label>
                <Input type="date" value={mailingDate} onChange={(e) => setMailingDate(e.target.value)} className="h-9 text-xs" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">DM枚数</Label>
              <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="h-9 text-xs" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">イメージ画像</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50"
                onClick={() => fileRef.current?.click()}
              >
                {uploadedImage ? (
                  <img src={uploadedImage} alt="uploaded" className="mx-auto max-h-28 object-contain" />
                ) : selectedSample ? (
                  <div className={`mx-auto h-28 w-full rounded bg-gradient-to-br ${selectedSample.color} flex items-center justify-center text-slate-700 text-xs font-medium`}>
                    {selectedSample.label}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Upload className="h-5 w-5" />
                    <span className="text-xs">クリックまたはドロップでアップロード</span>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              </div>
              <div className="flex gap-2">
                {SAMPLE_IMAGES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSampleId(s.id)
                      setUploadedImage(null)
                    }}
                    className={`flex-1 rounded border text-[11px] py-1.5 px-2 flex items-center justify-center gap-1 ${
                      sampleId === s.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <ImageIcon className="h-3 w-3" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">件名</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">本文</Label>
              <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} className="text-xs" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">発注書プレビュー</Label>
            <div className="border rounded-lg p-5 bg-white text-xs space-y-3 min-h-[480px]">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="font-bold text-sm">発注書</span>
                </div>
                <span className="text-slate-400 text-[11px]">{new Date().toLocaleDateString("ja-JP")}</span>
              </div>
              <div>
                <div className="text-slate-500 text-[11px]">発注先</div>
                <div className="font-medium">{designPartners.find((p) => p.id === vendorId)?.name ?? "-"}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-slate-500 text-[11px]">初稿希望日</div>
                  <div>{firstDraftDate || "-"}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">校了予定日</div>
                  <div>{proofDate || "-"}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">投函日</div>
                  <div>{mailingDate || "-"}</div>
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px]">数量</div>
                <div>{qty} 枚</div>
              </div>
              {(uploadedImage || selectedSample) && (
                <div>
                  <div className="text-slate-500 text-[11px] mb-1">イメージ</div>
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="prev" className="max-h-24 rounded border" />
                  ) : selectedSample ? (
                    <div className={`h-24 rounded bg-gradient-to-br ${selectedSample.color} flex items-center justify-center text-[11px] text-slate-700`}>
                      {selectedSample.label}
                    </div>
                  ) : null}
                </div>
              )}
              <div>
                <div className="text-slate-500 text-[11px]">件名</div>
                <div className="font-medium">{subject}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px]">本文</div>
                <div className="whitespace-pre-line text-slate-700">{body}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button size="sm" onClick={onSubmit}>依頼して送付</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
