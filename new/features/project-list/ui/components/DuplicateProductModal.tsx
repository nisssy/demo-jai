"use client"

import { useState, useMemo, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Copy } from "lucide-react"
import type { ProjectRepository } from "@/new/api/project-repository"
import { PROPOSAL_STATUS_LABELS } from "@/new/api/display"
import type { ProposalStatus } from "@/new/api/types"

type DuplicateMode = "same-project" | "new-project"

type DuplicateProductModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectNumber: string | null
  repository: ProjectRepository
  onDuplicated: (newProjectNumber: string) => void
}

export const DuplicateProductModal = ({
  open,
  onOpenChange,
  projectNumber,
  repository,
  onDuplicated,
}: DuplicateProductModalProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [duplicateMode, setDuplicateMode] = useState<DuplicateMode>("same-project")

  const products = useMemo(() => {
    if (!projectNumber) return []
    return repository.getProductsByProjectNumber(projectNumber)
  }, [repository, projectNumber])

  const project = useMemo(() => {
    if (!projectNumber) return null
    return repository.getProjectByProjectNumber(projectNumber) ?? null
  }, [repository, projectNumber])

  // モーダルが開いたときに全選択
  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen && products.length > 0) {
      setSelectedIds(new Set(products.map((p) => p.id)))
    } else {
      setSelectedIds(new Set())
    }
    setIsDuplicating(false)
    setDuplicateMode("same-project")
    onOpenChange(nextOpen)
  }, [onOpenChange, products])

  const allSelected = products.length > 0 && selectedIds.size === products.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < products.length

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)))
    }
  }

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleDuplicate = () => {
    if (!projectNumber || selectedIds.size === 0) return
    setIsDuplicating(true)
    try {
      if (duplicateMode === "new-project") {
        // 新案件として複製
        const result = repository.duplicateProject(projectNumber, Array.from(selectedIds))
        onOpenChange(false)
        onDuplicated(result.project.projectNumber)
      } else {
        // 同案件に追加
        const result = repository.duplicateProductsToSameProject(projectNumber, Array.from(selectedIds))
        onOpenChange(false)
        onDuplicated(result.projectNumber)
      }
    } catch {
      setIsDuplicating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            レコード複製
          </DialogTitle>
        </DialogHeader>

        {project && (
          <div className="text-sm text-slate-600 space-y-1">
            <p>案件 <span className="font-medium text-slate-900">{project.projectNumber}</span> の商材を選択して複製します。</p>
          </div>
        )}

        {/* 複製モード選択 */}
        <div className="border rounded-lg p-4 bg-slate-50">
          <RadioGroup
            value={duplicateMode}
            onValueChange={(v) => setDuplicateMode(v as DuplicateMode)}
            className="gap-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="same-project" id="same-project" />
              <Label htmlFor="same-project" className="cursor-pointer font-medium">
                同案件に追加
              </Label>
              <span className="text-xs text-slate-500">選択したレコードを同じ案件内に複製します</span>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new-project" id="new-project" />
              <Label htmlFor="new-project" className="cursor-pointer font-medium">
                新案件として追加
              </Label>
              <span className="text-xs text-slate-500">新しい案件番号で案件ごと複製します</span>
            </div>
          </RadioGroup>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8 text-slate-500">商材がありません</div>
        ) : (
          <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={allSelected}
                      ref={(el) => {
                        if (el) (el as unknown as HTMLInputElement).indeterminate = someSelected
                      }}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[60px]">ID</TableHead>
                  <TableHead className="font-semibold text-slate-700">商材区分</TableHead>
                  <TableHead className="font-semibold text-slate-700">商材名</TableHead>
                  <TableHead className="font-semibold text-slate-700">実施日</TableHead>
                  <TableHead className="font-semibold text-slate-700">ステータス</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-blue-50/50"
                    onClick={() => toggleOne(product.id)}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(product.id)}
                        onCheckedChange={() => toggleOne(product.id)}
                      />
                    </TableCell>
                    <TableCell className="text-sm font-medium">{product.id}</TableCell>
                    <TableCell>
                      <Badge className="bg-slate-700 text-white text-xs">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-900">
                      {product.eventProductName || product.eventType}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {product.eventDate || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600">
                        {PROPOSAL_STATUS_LABELS[product.proposalStatus as ProposalStatus] ?? product.proposalStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button
            onClick={handleDuplicate}
            disabled={selectedIds.size === 0 || isDuplicating}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            {selectedIds.size > 0 ? `${selectedIds.size}件を複製` : "複製"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
