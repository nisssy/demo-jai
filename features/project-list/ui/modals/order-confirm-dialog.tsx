"use client"

import { useEffect, useMemo, useState } from "react"
import type React from "react"
import type { ProjectData } from "@/types/project"
import type { ProjectItem } from "@/features/project-list/model/types"
import type { DemoProject } from "@/lib/demo-db/types"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Calendar, MapPin, Send, User } from "lucide-react"

type OrderConfirmFormData = {
  contractAmount: string
  billingAddress: string
  notes: string
}

export type OrderConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectItem | null

  getStatusBadge: (status?: string) => React.ReactNode
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  updateProduct: (id: number, updates: Partial<DemoProject>) => DemoProject | null
  addNotification: (message: string) => void
}

const extractDigits = (value: string) => value.replace(/[^\d]/g, "")

export function OrderConfirmDialog({
  open,
  onOpenChange,
  project,
  getStatusBadge,
  projectData,
  setProjectData,
  updateProduct,
  addNotification,
}: OrderConfirmDialogProps) {
  const initialContractAmount = useMemo(() => extractDigits(project?.estimateAmount ?? ""), [project?.estimateAmount])
  const [formData, setFormData] = useState<OrderConfirmFormData>({
    contractAmount: "",
    billingAddress: "",
    notes: "",
  })
  const [isLoadingConfirmOrder, setIsLoadingConfirmOrder] = useState(false)

  useEffect(() => {
    if (!open) return
    setFormData({
      contractAmount: initialContractAmount,
      billingAddress: "",
      notes: "",
    })
  }, [open, initialContractAmount])

  const handleConfirmOrder = () => {
    if (!project) return

    setIsLoadingConfirmOrder(true)
    setTimeout(() => {
      setProjectData({
        ...projectData,
        projectName: project.projectName,
        clientName: project.clientName,
        talent: project.talent,
        date: project.date,
        contractAmount: formData.contractAmount,
        billingAddress: formData.billingAddress,
        status: "ordered",
      })

      if (typeof project.id === "number") {
        updateProduct(project.id, {
          status: "ordered",
          projectStatus: "イベントチーム確認中",
        })
      }

      addNotification(`案件「${project.projectName}」を受注確定しました`)
      setIsLoadingConfirmOrder(false)
      onOpenChange(false)
    }, 500)
  }

  return (
    <>
      {isLoadingConfirmOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-700">受注確定処理中...</p>
            </div>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>受注確定情報の入力</DialogTitle>
            <DialogDescription>{project?.projectName} の受注確定情報を入力してください</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-slate-900 mb-2">案件サマリー</h4>
              <div className="mb-3 pb-3 border-b border-slate-300">
                <div className="text-2xl font-bold text-slate-900">案件No: {project?.projectNumber || "-"}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="h-4 w-4" />
                  <span>法人名:</span>
                  <span className="ml-2 font-medium text-slate-900">{project?.companyName || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>法人ID:</span>
                  <span className="ml-2 font-medium text-slate-900">{project?.companyId || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>ホール名:</span>
                  <span className="ml-2 font-medium text-slate-900">{project?.hallName || project?.venue || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>ホールID:</span>
                  <span className="ml-2 font-medium text-slate-900">{project?.hallId || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="h-4 w-4" />
                  <span>ホール担当営業:</span>
                  <span className="ml-2 font-medium text-slate-900">{project?.salesPersonName || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>依頼日:</span>
                  <span className="ml-2 font-medium text-slate-900">{project?.requestDate || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>ステータス:</span>
                  {getStatusBadge(project?.projectStatus)}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>商材カテゴリ:</span>
                  <span className="ml-2 font-medium text-slate-900">{project?.category || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>イベント区分:</span>
                  <span className="ml-2 font-medium text-slate-900">{project?.eventType || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>イベント商材名:</span>
                  <span className="ml-2 font-medium text-slate-900">{project?.eventProductName || project?.projectName || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>実施日:</span>
                  <span className="ml-2 font-medium text-slate-900">{project?.eventDate || project?.date || "-"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractAmount">契約金額（確定）</Label>
                <Input
                  id="contractAmount"
                  type="number"
                  value={formData.contractAmount}
                  onChange={(e) => setFormData({ ...formData, contractAmount: e.target.value })}
                  placeholder="600000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingAddress">請求書送付先</Label>
                <Input
                  id="billingAddress"
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  placeholder="東京都渋谷区..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">特記事項</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="契約に関する特記事項があれば入力してください"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoadingConfirmOrder}>
              キャンセル
            </Button>
            <Button onClick={handleConfirmOrder} className="gap-2" disabled={isLoadingConfirmOrder || !project}>
              <Send className="h-4 w-4" />
              受注確定して内勤へ連携
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

