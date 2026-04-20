"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronLeft, ChevronsUpDown, Check } from "lucide-react"
import type { Project, Company, Hall } from "@/new/api/types"
import type { ProjectRepository } from "@/new/api/project-repository"

/** 商材名の選択肢 */
const PRODUCT_NAME_OPTIONS = [
  "トリニティガール",
  "合同抽選会",
  "LINE広告",
  "お知らせバナー",
  "メインバナー",
  "スロセレ",
]

type AddProductModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  repository: ProjectRepository
  onProductCreated: (productId: number) => void
}

type ModalStep = "select-project" | "configure-product"

type ModalFilters = {
  companyId: string
  hallName: string
  category: string
  eventType: string
  salesPersonId: string
  dateMode: "execution" | "created"
  dateFrom: string
  dateTo: string
  projectNumber: string
  projectName: string
}

const INITIAL_MODAL_FILTERS: ModalFilters = {
  companyId: "",
  hallName: "",
  category: "",
  eventType: "",
  salesPersonId: "",
  dateMode: "execution",
  dateFrom: "",
  dateTo: "",
  projectNumber: "",
  projectName: "",
}

export const AddProductModal = ({ open, onOpenChange, repository, onProductCreated }: AddProductModalProps) => {
  const [step, setStep] = useState<ModalStep>("select-project")
  const [selectedProjectNumber, setSelectedProjectNumber] = useState<string | null>(null)
  const [modalFilters, setModalFilters] = useState<ModalFilters>(INITIAL_MODAL_FILTERS)
  const [newCategory, setNewCategory] = useState("")
  const [newProductName, setNewProductName] = useState("")

  // 法人検索
  const [companyOpen, setCompanyOpen] = useState(false)
  const [companyQuery, setCompanyQuery] = useState("")
  // ホール検索
  const [hallOpen, setHallOpen] = useState(false)
  const [hallQuery, setHallQuery] = useState("")

  const allCompanies = useMemo(() => repository.getCompanies(), [repository])
  const allHalls = useMemo(() => repository.getHalls(), [repository])

  const filteredCompaniesModal = useMemo(() => {
    if (!companyQuery) return allCompanies
    const q = companyQuery.toLowerCase()
    return allCompanies.filter((c) => c.name.toLowerCase().includes(q))
  }, [allCompanies, companyQuery])

  const filteredHallsModal = useMemo(() => {
    if (!hallQuery) return allHalls
    const q = hallQuery.toLowerCase()
    return allHalls.filter((h) => h.name.toLowerCase().includes(q))
  }, [allHalls, hallQuery])

  // フィルタ済み案件リスト
  const filteredProjects = useMemo(() => {
    const projects = repository.getProjects()
    return projects.filter((p) => {
      if (modalFilters.projectNumber && !p.projectNumber.includes(modalFilters.projectNumber)) return false
      if (modalFilters.projectName && !p.projectName.includes(modalFilters.projectName)) return false
      if (modalFilters.hallName && p.hallName !== modalFilters.hallName) return false
      if (modalFilters.companyId && p.companyId !== modalFilters.companyId) return false
      if (modalFilters.salesPersonId && !p.salesPersonName.includes(modalFilters.salesPersonId)) return false
      return true
    })
  }, [repository, modalFilters])

  const updateModalFilter = <K extends keyof ModalFilters>(key: K, value: ModalFilters[K]) => {
    setModalFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setStep("select-project")
    setSelectedProjectNumber(null)
    setModalFilters(INITIAL_MODAL_FILTERS)
    setNewCategory("")
    setNewProductName("")
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(handleReset, 300)
  }

  const handleSelectProject = (projectNumber: string) => {
    setSelectedProjectNumber(projectNumber)
  }

  const handleNext = () => {
    if (selectedProjectNumber) {
      setStep("configure-product")
    }
  }

  const handleBackToSelect = () => {
    setStep("select-project")
  }

  const handleAddProduct = () => {
    if (!selectedProjectNumber || !newCategory) return

    const project = repository.getProjectByProjectNumber(selectedProjectNumber)
    if (!project) return

    const newProduct = repository.createProduct({
      projectId: project.id,
      projectNumber: project.projectNumber,
      category: newCategory,
      eventType: newProductName || newCategory,
      eventProductName: newProductName,
      eventDate: "",
      estimatedBillingAmount: 0,
      proposalStatus: "before-proposal",
      companionCount: "",
      directorCount: "",
      mcCount: "",
      selectedCompanions: [],
      selectedDirectors: [],
      selectedMcs: [],
      companionBookingStatus: {},
      directorBookingStatus: {},
      mcBookingStatus: {},
    })

    handleClose()
    onProductCreated(newProduct.id)
  }

  const getCompanyName = (companyId: string) => {
    return allCompanies.find((c) => c.companyId === companyId)?.name || companyId
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        {step === "select-project" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">追加先案件を選択</DialogTitle>
            </DialogHeader>

            {/* モーダル内検索フィルタ */}
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-4 gap-3">
                {/* 法人 */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">法人</Label>
                  <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8">
                        {modalFilters.companyId ? getCompanyName(modalFilters.companyId) : "法人名を検索..."}
                        <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="法人名..." value={companyQuery} onValueChange={setCompanyQuery} />
                        <CommandList>
                          <CommandEmpty>見つかりません</CommandEmpty>
                          <CommandGroup>
                            <CommandItem value="すべて" onSelect={() => {
                              updateModalFilter("companyId", "")
                              setCompanyOpen(false)
                              setCompanyQuery("")
                            }}>
                              <Check className={`mr-2 h-3 w-3 ${!modalFilters.companyId ? "opacity-100" : "opacity-0"}`} />
                              すべて
                            </CommandItem>
                            {filteredCompaniesModal.map((c) => (
                              <CommandItem key={c.id} value={c.name} onSelect={() => {
                                updateModalFilter("companyId", c.companyId)
                                setCompanyOpen(false)
                                setCompanyQuery("")
                              }}>
                                <Check className={`mr-2 h-3 w-3 ${modalFilters.companyId === c.companyId ? "opacity-100" : "opacity-0"}`} />
                                {c.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* ホール */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">ホール</Label>
                  <Popover open={hallOpen} onOpenChange={setHallOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8">
                        {modalFilters.hallName || "ホール名を検索..."}
                        <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="ホール名..." value={hallQuery} onValueChange={setHallQuery} />
                        <CommandList>
                          <CommandEmpty>見つかりません</CommandEmpty>
                          <CommandGroup>
                            <CommandItem value="すべて" onSelect={() => {
                              updateModalFilter("hallName", "")
                              setHallOpen(false)
                              setHallQuery("")
                            }}>
                              <Check className={`mr-2 h-3 w-3 ${!modalFilters.hallName ? "opacity-100" : "opacity-0"}`} />
                              すべて
                            </CommandItem>
                            {filteredHallsModal.map((h) => (
                              <CommandItem key={h.id} value={h.name} onSelect={() => {
                                updateModalFilter("hallName", h.name)
                                setHallOpen(false)
                                setHallQuery("")
                              }}>
                                <Check className={`mr-2 h-3 w-3 ${modalFilters.hallName === h.name ? "opacity-100" : "opacity-0"}`} />
                                {h.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* 商品カテゴリ */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">商品カテゴリ</Label>
                  <Select value={modalFilters.category || "all"} onValueChange={(v) => updateModalFilter("category", v === "all" ? "" : v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="イベント">イベント</SelectItem>
                      <SelectItem value="ポイント">ポイント</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* イベント区分 */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">イベント区分</Label>
                  <Select value={modalFilters.eventType || "all"} onValueChange={(v) => updateModalFilter("eventType", v === "all" ? "" : v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="トリニティガール">トリニティガール</SelectItem>
                      <SelectItem value="スロセレ">スロセレ</SelectItem>
                      <SelectItem value="合同抽選会">合同抽選会</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* 期間 */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">期間</Label>
                  <Select value={modalFilters.dateMode} onValueChange={(v) => updateModalFilter("dateMode", v as "execution" | "created")}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="execution">実施日</SelectItem>
                      <SelectItem value="created">作成日</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1.5">
                    <Input type="date" value={modalFilters.dateFrom} onChange={(e) => updateModalFilter("dateFrom", e.target.value)} className="h-8 text-xs flex-1" />
                    <span className="text-xs text-slate-500">〜</span>
                    <Input type="date" value={modalFilters.dateTo} onChange={(e) => updateModalFilter("dateTo", e.target.value)} className="h-8 text-xs flex-1" />
                  </div>
                </div>

                {/* ホール担当 */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">ホール担当</Label>
                  <Input placeholder="ホール担当を検索..." value={modalFilters.salesPersonId} onChange={(e) => updateModalFilter("salesPersonId", e.target.value)} className="h-8 text-xs" />
                </div>

                {/* 案件No */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">案件No</Label>
                  <Input placeholder="案件Noを入力..." value={modalFilters.projectNumber} onChange={(e) => updateModalFilter("projectNumber", e.target.value)} className="h-8 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* 案件名 */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">案件名</Label>
                  <Input placeholder="案件名を入力..." value={modalFilters.projectName} onChange={(e) => updateModalFilter("projectName", e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
            </div>

            {/* 案件テーブル */}
            <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700 text-xs w-8"></TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">案件番号</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">案件名</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">法人</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">ホール</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">担当営業</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-slate-500 py-8">
                        案件が見つかりません
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => (
                      <TableRow
                        key={project.projectNumber}
                        className={`cursor-pointer transition-colors ${
                          selectedProjectNumber === project.projectNumber
                            ? "bg-blue-50 border-l-2 border-l-blue-600"
                            : "hover:bg-slate-50"
                        }`}
                        onClick={() => handleSelectProject(project.projectNumber)}
                      >
                        <TableCell className="w-8">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedProjectNumber === project.projectNumber
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300"
                          }`}>
                            {selectedProjectNumber === project.projectNumber && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-blue-600">{project.projectNumber}</TableCell>
                        <TableCell className="text-xs text-slate-900">{project.projectName}</TableCell>
                        <TableCell className="text-xs text-slate-600">{project.companyName}</TableCell>
                        <TableCell className="text-xs text-slate-600">{project.hallName}</TableCell>
                        <TableCell className="text-xs text-slate-600">{project.salesPersonName}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>キャンセル</Button>
              <Button onClick={handleNext} disabled={!selectedProjectNumber}>次へ</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBackToSelect}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="text-xl">商材の設定</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* 商材区分 */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">商材区分</Label>
                <div className="flex flex-wrap gap-3">
                  {["イベント", "ポイント", "オプション"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        newCategory === cat
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                      onClick={() => setNewCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 商材名 */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">商材名</Label>
                <div className="flex flex-wrap gap-3">
                  {PRODUCT_NAME_OPTIONS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        newProductName === name
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                      onClick={() => setNewProductName(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <div className="mt-2">
                  <Input
                    placeholder="または商材名を直接入力..."
                    value={PRODUCT_NAME_OPTIONS.includes(newProductName) ? "" : newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>

              {/* 選択中の案件情報 */}
              {selectedProjectNumber && (
                <div className="bg-slate-50 rounded-lg p-3 border">
                  <div className="text-xs text-slate-500 mb-1">追加先案件</div>
                  <div className="text-sm font-medium text-slate-900">{selectedProjectNumber}</div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>キャンセル</Button>
              <Button onClick={handleAddProduct} disabled={!newCategory}>追加</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
