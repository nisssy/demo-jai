"use client"

import { useParams } from "next/navigation"
import { useAppRouter } from "@/hooks/use-app-router"
import { useProject } from "@/contexts/project-context"
import { useEffect, useState, Suspense, useCallback, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"

function ProjectArrangementPageContent() {
  const router = useAppRouter()
  const params = useParams()
  const projectId = params?.id ? (typeof params.id === 'string' ? Number(params.id) : Array.isArray(params.id) ? Number(params.id[0]) : null) : null
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
  const companionMasterData: { [name: string]: { size: string } } = useMemo(() => ({
    "Rio": { size: "S" },
    "Ayaka": { size: "M" },
    "Nanaka": { size: "M" },
    "山田 花子": { size: "L" },
    "佐藤 美咲": { size: "M" },
    "鈴木 さくら": { size: "S" },
    "高橋 みゆき": { size: "M" },
    "伊藤 あかり": { size: "L" },
  }), [])
  
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

  // サイズに基づいて衣装を自動選択する関数
  const getCostumeBySize = useCallback((size: string): string => {
    // サイズに応じたデフォルト衣装を選択（すべての衣装がS/M/L対応なので、デフォルトでcostume1を選択）
    // 将来的にサイズ別の衣装が必要な場合は、ここでサイズに応じた選択ロジックを実装
    return "costume1"
  }, [])

  // コンパニオン選択のハンドラーをメモ化（useEffectの前に定義）
  const handleCompanionChange = useCallback((index: number, value: string) => {
    setConfirmedCompanions((prev) => {
      // 値が変更されていない場合は更新しない
      if (prev[index] === value) {
        return prev
      }
      const newCompanions = [...prev]
      newCompanions[index] = value
      return newCompanions
    })
    // 新しいコンパニオンの場合は、サイズに基づいて衣装を自動選択
    if (value) {
      setCompanionCostumes((prev) => {
        // 既に衣装が設定されている場合は更新しない
        if (prev[value] !== undefined && prev[value] !== "") {
          return prev
        }
        // サイズ情報を取得して衣装を自動選択
        const companionSize = companionMasterData[value]?.size
        const autoCostume = companionSize ? getCostumeBySize(companionSize) : "costume1"
        return { ...prev, [value]: autoCostume }
      })
    }
  }, [companionMasterData, getCostumeBySize])

  // 衣装選択のハンドラーをメモ化
  const handleCostumeChange = useCallback((companionName: string, value: string) => {
    setCompanionCostumes((prev) => {
      // 値が変更されていない場合は更新しない
      if (prev[companionName] === value) {
        return prev
      }
      return {
        ...prev,
        [companionName]: value,
      }
    })
  }, [])

  // ディレクター選択のハンドラーをメモ化
  const handleDirectorChange = useCallback((index: number, value: string) => {
    setConfirmedDirectors((prev) => {
      // 値が変更されていない場合は更新しない
      if (prev[index] === value) {
        return prev
      }
      const newDirectors = [...prev]
      newDirectors[index] = value
      return newDirectors
    })
  }, [])

  // MC選択のハンドラーをメモ化
  const handleMcChange = useCallback((index: number, value: string) => {
    setConfirmedMcs((prev) => {
      // 値が変更されていない場合は更新しない
      if (prev[index] === value) {
        return prev
      }
      const newMcs = [...prev]
      newMcs[index] = value
      return newMcs
    })
  }, [])

  const hasInitialized = useRef(false)
  
  useEffect(() => {
    if (projectId === null || typeof projectId !== 'number' || isNaN(projectId)) {
      addNotification("無効な案件IDです")
      router.push("/")
      setIsLoading(false)
      hasInitialized.current = false
      return
    }
    
    if (!getProjectById) {
      setIsLoading(false)
      hasInitialized.current = false
      return
    }
    
    if (hasInitialized.current) {
      return
    }
    
    hasInitialized.current = true
    
    try {
      const loadedProject = projectId !== null && typeof projectId === 'number' ? getProjectById(projectId) : null
      if (!loadedProject) {
        addNotification("案件が見つかりませんでした")
        router.push("/")
        setIsLoading(false)
        hasInitialized.current = false
        return
      }
      setProject(loadedProject)
      
      // 既存の確定情報を読み込む
      const existingConfirmedCompanions = (loadedProject as any).confirmedCompanions || []
      const existingConfirmedDirectors = (loadedProject as any).confirmedDirectors || []
      const existingConfirmedMcs = (loadedProject as any).confirmedMcs || []
      const existingCostumes = (loadedProject as any).companionCostumes || {}
      
      // 案件に登録されたキャスト情報を取得
      const selectedCompanions = (loadedProject as any).selectedCompanions || []
      const selectedDirectors = (loadedProject as any).selectedDirectors || []
      const selectedMcs = (loadedProject as any).selectedMcs || []
      
      // 必要人数分の配列を初期化
      const companionCount = Number(loadedProject.companionCount) || 0
      const directorCount = Number(loadedProject.directorCount) || 0
      const mcCount = Number(loadedProject.mcCount) || 0
      
      // 既存の確定情報があれば優先、なければ案件に登録されたキャストを使用
      const initializedCompanions = Array.from({ length: companionCount }, (_, i) => {
        if (existingConfirmedCompanions[i]) {
          return existingConfirmedCompanions[i]
        }
        // 案件に登録されたキャストから選択（「未定」は除外）
        const selectedCompanion = selectedCompanions[i]
        return selectedCompanion && selectedCompanion !== "未定" ? selectedCompanion : ""
      })
      
      const initializedDirectors = Array.from({ length: directorCount }, (_, i) => {
        if (existingConfirmedDirectors[i]) {
          return existingConfirmedDirectors[i]
        }
        const selectedDirector = selectedDirectors[i]
        return selectedDirector && selectedDirector !== "未定" ? selectedDirector : ""
      })
      
      const initializedMcs = Array.from({ length: mcCount }, (_, i) => {
        if (existingConfirmedMcs[i]) {
          return existingConfirmedMcs[i]
        }
        const selectedMc = selectedMcs[i]
        return selectedMc && selectedMc !== "未定" ? selectedMc : ""
      })
      
      // 衣装情報を初期化（既存の衣装があれば使用、なければサイズから自動選択）
      const initializedCostumes: { [companionName: string]: string } = { ...existingCostumes }
      initializedCompanions.forEach((companionName) => {
        if (companionName && companionName !== "未定") {
          // 既に衣装が設定されている場合はスキップ
          if (initializedCostumes[companionName] && initializedCostumes[companionName] !== "") {
            return
          }
          // サイズ情報を取得して衣装を自動選択
          const companionSize = companionMasterData[companionName]?.size
          if (companionSize) {
            initializedCostumes[companionName] = getCostumeBySize(companionSize)
          }
        }
      })
      
      setConfirmedCompanions(initializedCompanions)
      setConfirmedDirectors(initializedDirectors)
      setConfirmedMcs(initializedMcs)
      setCompanionCostumes(initializedCostumes)
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading project:", error)
      addNotification("案件の読み込み中にエラーが発生しました")
      router.push("/")
      setIsLoading(false)
      hasInitialized.current = false
    }
    
    // projectId が変わった場合は初期化フラグをリセット
    return () => {
      if (projectId === null) {
        hasInitialized.current = false
      }
    }
  }, [projectId, getProjectById, router, addNotification, companionMasterData, getCostumeBySize])

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
    if (projectId === null || typeof projectId !== 'number') return
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
    if (projectId === null || typeof projectId !== 'number') return
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
    if (projectId === null || typeof projectId !== 'number') return
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
    if (projectId === null || typeof projectId !== 'number' || !companionName) return
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
    if (projectId === null || typeof projectId !== 'number') return
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
    if (projectId === null || typeof projectId !== 'number') return
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
                      value={confirmedCompanions[index] || undefined}
                      onValueChange={(value) => {
                        if (value !== confirmedCompanions[index]) {
                          handleCompanionChange(index, value)
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
                            <div className="flex-1">
                            <Select
                              value={companionCostumes[confirmedCompanions[index]] || undefined}
                              onValueChange={(value) => {
                                if (value !== companionCostumes[confirmedCompanions[index]]) {
                                  handleCostumeChange(confirmedCompanions[index], value)
                                }
                              }}
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
                            </div>
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
                        value={confirmedDirectors[index] || undefined}
                        onValueChange={(value) => {
                          if (value !== confirmedDirectors[index]) {
                            handleDirectorChange(index, value)
                          }
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
                        value={confirmedMcs[index] || undefined}
                        onValueChange={(value) => {
                          if (value !== confirmedMcs[index]) {
                            handleMcChange(index, value)
                          }
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
