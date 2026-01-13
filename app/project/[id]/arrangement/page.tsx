"use client"

import { useParams } from "next/navigation"
import { useAppRouter } from "@/hooks/use-app-router"
import { useProject } from "@/contexts/project-context"
import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"

function ProjectArrangementPageContent() {
  const router = useAppRouter()
  const params = useParams()
  const projectId = params?.id ? (typeof params.id === 'string' ? Number(params.id) : params.id) : null
  const { getProjectById, updateProject, addNotification } = useProject()
  const [isLoading, setIsLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  
  // キャスト確定情報の状態
  const [confirmedCompanions, setConfirmedCompanions] = useState<string[]>([])
  const [confirmedDirectors, setConfirmedDirectors] = useState<string[]>([])
  const [confirmedMcs, setConfirmedMcs] = useState<string[]>([])
  
  // コンパニオン衣装情報の状態（コンパニオン名をキーとする）
  const [companionCostumes, setCompanionCostumes] = useState<{ [companionName: string]: string }>({})
  
  // コンパニオンのマスタデータ（サイズ情報）
  const companionMasterData: { [name: string]: { size: string } } = {
    "Rio": { size: "S" },
    "Ayaka": { size: "M" },
    "Nanaka": { size: "M" },
    "山田 花子": { size: "L" },
    "佐藤 美咲": { size: "M" },
    "鈴木 さくら": { size: "S" },
    "高橋 みゆき": { size: "M" },
    "伊藤 あかり": { size: "L" },
  }
  
  // 衣装の選択肢
  const costumeOptions = [
    { value: "costume1", label: "衣装A (S/M/L対応)" },
    { value: "costume2", label: "衣装B (S/M/L対応)" },
    { value: "costume3", label: "衣装C (S/M/L対応)" },
    { value: "costume4", label: "衣装D (S/M/L対応)" },
  ]
  
  // 利用可能なコンパニオン一覧（専属 + 外部）
  const availableCompanions = [
    "Rio", "Ayaka", "Nanaka",
    "山田 花子", "佐藤 美咲", "鈴木 さくら", "高橋 みゆき", "伊藤 あかり",
  ]
  
  // 利用可能なディレクター一覧（専属 + 外部）
  const availableDirectors = [
    "Takeshi", "Kenji", "Hiroshi",
    "田中 ディレクター", "佐藤 ディレクター", "鈴木 ディレクター", "高橋 ディレクター", "伊藤 ディレクター",
  ]
  
  // 利用可能なMC一覧（専属 + 外部）
  const availableMcs = [
    "Yuki", "Saki", "Mai",
    "山田 MC", "中村 MC", "小林 MC", "加藤 MC", "松本 MC",
  ]

  useEffect(() => {
    if (!projectId || isNaN(projectId)) {
      addNotification("無効な案件IDです")
      router.push("/")
      setIsLoading(false)
      return
    }
    
    if (!getProjectById) {
      setIsLoading(false)
      return
    }
    
    try {
      const loadedProject = getProjectById(projectId)
      if (!loadedProject) {
        addNotification("案件が見つかりませんでした")
        router.push("/")
        setIsLoading(false)
        return
      }
      setProject(loadedProject)
      
      // 既存の確定情報を読み込む
      const existingConfirmedCompanions = (loadedProject as any).confirmedCompanions || []
      const existingConfirmedDirectors = (loadedProject as any).confirmedDirectors || []
      const existingConfirmedMcs = (loadedProject as any).confirmedMcs || []
      const existingCostumes = (loadedProject as any).companionCostumes || {}
      
      // 必要人数分の配列を初期化（既存データがあれば使用、なければ空文字列）
      const companionCount = Number(loadedProject.companionCount) || 0
      const directorCount = Number(loadedProject.directorCount) || 0
      const mcCount = Number(loadedProject.mcCount) || 0
      
      const initializedCompanions = Array.from({ length: companionCount }, (_, i) => existingConfirmedCompanions[i] || "")
      const initializedDirectors = Array.from({ length: directorCount }, (_, i) => existingConfirmedDirectors[i] || "")
      const initializedMcs = Array.from({ length: mcCount }, (_, i) => existingConfirmedMcs[i] || "")
      
      setConfirmedCompanions(initializedCompanions)
      setConfirmedDirectors(initializedDirectors)
      setConfirmedMcs(initializedMcs)
      setCompanionCostumes(existingCostumes)
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading project:", error)
      addNotification("案件の読み込み中にエラーが発生しました")
      router.push("/")
      setIsLoading(false)
    }
  }, [projectId, getProjectById, router, addNotification])

  if (isLoading) {
    return (
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    )
  }

  if (!project) {
    return null
  }

  const handleSave = () => {
    if (!projectId) return
    updateProject(projectId, {
      confirmedCompanions: confirmedCompanions.filter(c => c.trim() !== ""),
      confirmedDirectors: confirmedDirectors.filter(d => d.trim() !== ""),
      confirmedMcs: confirmedMcs.filter(m => m.trim() !== ""),
      companionCostumes: companionCostumes,
    } as any)
    addNotification("手配情報を保存しました")
    // 各種自動手配実行画面に遷移
    router.push(`/project/${projectId}/auto-arrangement`)
  }

  const handleSaveAndBack = () => {
    if (!projectId) return
    updateProject(projectId, {
      confirmedCompanions: confirmedCompanions.filter(c => c.trim() !== ""),
      confirmedDirectors: confirmedDirectors.filter(d => d.trim() !== ""),
      confirmedMcs: confirmedMcs.filter(m => m.trim() !== ""),
      companionCostumes: companionCostumes,
    } as any)
    addNotification("手配情報を保存しました")
    router.push("/")
  }

  // 個別保存関数
  const handleSaveCompanion = (index: number) => {
    if (!projectId) return
    const companion = confirmedCompanions[index]
    if (!companion || !companion.trim()) return
    
    const currentProject = getProjectById(projectId)
    if (!currentProject) return
    
    const existingCompanions = (currentProject as any).confirmedCompanions || []
    const newCompanions = [...existingCompanions]
    newCompanions[index] = companion
    
    updateProject(projectId, {
      confirmedCompanions: newCompanions.filter(c => c && c.trim() !== ""),
    } as any)
    addNotification(`コンパニオン${index + 1}を保存しました`)
  }

  const handleSaveCompanionCostume = (companionName: string) => {
    if (!projectId || !companionName) return
    const costume = companionCostumes[companionName]
    if (!costume) return
    
    const currentProject = getProjectById(projectId)
    if (!currentProject) return
    
    const existingCostumes = (currentProject as any).companionCostumes || {}
    updateProject(projectId, {
      companionCostumes: { ...existingCostumes, [companionName]: costume },
    } as any)
    addNotification(`${companionName}の衣装を保存しました`)
  }

  const handleSaveDirector = (index: number) => {
    if (!projectId) return
    const director = confirmedDirectors[index]
    if (!director || !director.trim()) return
    
    const currentProject = getProjectById(projectId)
    if (!currentProject) return
    
    const existingDirectors = (currentProject as any).confirmedDirectors || []
    const newDirectors = [...existingDirectors]
    newDirectors[index] = director
    
    updateProject(projectId, {
      confirmedDirectors: newDirectors.filter(d => d && d.trim() !== ""),
    } as any)
    addNotification(`ディレクター${index + 1}を保存しました`)
  }

  const handleSaveMc = (index: number) => {
    if (!projectId) return
    const mc = confirmedMcs[index]
    if (!mc || !mc.trim()) return
    
    const currentProject = getProjectById(projectId)
    if (!currentProject) return
    
    const existingMcs = (currentProject as any).confirmedMcs || []
    const newMcs = [...existingMcs]
    newMcs[index] = mc
    
    updateProject(projectId, {
      confirmedMcs: newMcs.filter(m => m && m.trim() !== ""),
    } as any)
    addNotification(`MC${index + 1}を保存しました`)
  }

  const handleBack = () => {
    router.push("/")
  }

  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">手配詳細</h1>
        </div>

        {/* 案件情報 */}
        <Card>
          <CardHeader>
            <CardTitle>案件情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-600">案件No</Label>
                <p className="font-medium">{project.projectNumber}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">案件名</Label>
                <p className="font-medium">{project.projectName}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">クライアント</Label>
                <p className="font-medium">{project.clientName}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">開催日</Label>
                <p className="font-medium">{project.eventDate || project.date}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* コンパニオン確定情報 */}
        <Card>
          <CardHeader>
            <CardTitle>コンパニオン確定情報</CardTitle>
            <CardDescription>
              必要人数: {project.companionCount || "0"}名
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: Number(project.companionCount) || 0 }).map((_, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <Label className="text-sm font-medium">コンパニオン {index + 1}</Label>
                    <Select
                      value={confirmedCompanions[index] || ""}
                      onValueChange={(value) => {
                        const newCompanions = [...confirmedCompanions]
                        newCompanions[index] = value
                        setConfirmedCompanions(newCompanions)
                        // 新しいコンパニオンの場合は衣装を空にする
                        if (value && !companionCostumes[value]) {
                          setCompanionCostumes({ ...companionCostumes, [value]: "" })
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="コンパニオンを選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCompanions.map((companion) => (
                          <SelectItem key={companion} value={companion}>
                            {companion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {confirmedCompanions[index] && companionMasterData[confirmedCompanions[index]] && (
                      <p className="text-xs text-slate-500 mt-1">
                        サイズ: {companionMasterData[confirmedCompanions[index]].size}
                      </p>
                    )}
                  </div>
                      {confirmedCompanions[index] && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">衣装選択</Label>
                          <div className="flex gap-2">
                            <Select
                              value={companionCostumes[confirmedCompanions[index]] || ""}
                              onValueChange={(value) => {
                                setCompanionCostumes({
                                  ...companionCostumes,
                                  [confirmedCompanions[index]]: value,
                                })
                              }}
                              className="flex-1"
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="衣装を選択してください" />
                              </SelectTrigger>
                              <SelectContent>
                                {costumeOptions.map((costume) => (
                                  <SelectItem key={costume.value} value={costume.value}>
                                    {costume.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveCompanionCostume(confirmedCompanions[index])}
                              disabled={!companionCostumes[confirmedCompanions[index]]}
                            >
                              保存
                            </Button>
                          </div>
                        </div>
                      )}
                      {confirmedCompanions[index] && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveCompanion(index)}
                          className="w-full"
                        >
                          コンパニオン{index + 1}を保存
                        </Button>
                      )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ディレクター確定情報 */}
        <Card>
          <CardHeader>
            <CardTitle>ディレクター確定情報</CardTitle>
            <CardDescription>
              必要人数: {project.directorCount || "0"}名
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: Number(project.directorCount) || 0 }).map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <Label className="text-sm font-medium">ディレクター {index + 1}</Label>
                      <Select
                        value={confirmedDirectors[index] || ""}
                        onValueChange={(value) => {
                          const newDirectors = [...confirmedDirectors]
                          newDirectors[index] = value
                          setConfirmedDirectors(newDirectors)
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="ディレクターを選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDirectors.map((director) => (
                            <SelectItem key={director} value={director}>
                              {director}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {confirmedDirectors[index] && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveDirector(index)}
                          className="w-full"
                        >
                          ディレクター{index + 1}を保存
                        </Button>
                      )}
                    </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* MC確定情報 */}
        <Card>
          <CardHeader>
            <CardTitle>MC確定情報</CardTitle>
            <CardDescription>
              必要人数: {project.mcCount || "0"}名
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: Number(project.mcCount) || 0 }).map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <Label className="text-sm font-medium">MC {index + 1}</Label>
                      <Select
                        value={confirmedMcs[index] || ""}
                        onValueChange={(value) => {
                          const newMcs = [...confirmedMcs]
                          newMcs[index] = value
                          setConfirmedMcs(newMcs)
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="MCを選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMcs.map((mc) => (
                            <SelectItem key={mc} value={mc}>
                              {mc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {confirmedMcs[index] && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveMc(index)}
                          className="w-full"
                        >
                          MC{index + 1}を保存
                        </Button>
                      )}
                    </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 保存ボタン */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleBack}>
            戻る
          </Button>
          <Button variant="outline" onClick={handleSaveAndBack}>
            保存して戻る
          </Button>
          <Button onClick={handleSave}>
            保存して次へ
          </Button>
        </div>
      </div>
    </main>
  )
}

export default function ProjectArrangementPage() {
  return (
    <Suspense fallback={
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    }>
      <ProjectArrangementPageContent />
    </Suspense>
  )
}
