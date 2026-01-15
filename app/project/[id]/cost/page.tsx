"use client"

import { useParams } from "next/navigation"
import { useAppRouter } from "@/hooks/use-app-router"
import { useProject } from "@/contexts/project-context"
import { useEffect, useState, Suspense, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// キャストのマスタデータ（時給）- 営業画面と同じ値を使用
const companionHourlyRates: { [key: string]: number } = {
  // 専属コンパニオン
  Rio: 5000,
  Ayaka: 5500,
  Nanaka: 5200,
  // 外部コンパニオン
  "山田 花子": 6000,
  "佐藤 美咲": 5800,
  "鈴木 さくら": 6200,
  "高橋 みゆき": 5900,
  "伊藤 あかり": 6100,
}

const directorHourlyRates: { [key: string]: number } = {
  // 専属ディレクター
  Takeshi: 8000,
  Kenji: 8500,
  Hiroshi: 8200,
  // 外部ディレクター
  "田中 ディレクター": 9000,
  "佐藤 ディレクター": 8800,
  "鈴木 ディレクター": 9200,
  "高橋 ディレクター": 8900,
  "伊藤 ディレクター": 9100,
}

const mcHourlyRates: { [key: string]: number } = {
  // 専属MC
  Yuki: 7000,
  Saki: 7200,
  Mai: 7100,
  // 外部MC
  "山田 MC": 7500,
  "中村 MC": 7300,
  "小林 MC": 7600,
  "加藤 MC": 7400,
  "松本 MC": 7500,
}

// 平均時給を計算
function getAverageHourlyRate(rates: { [key: string]: number }): number {
  const values = Object.values(rates)
  if (values.length === 0) return 0
  return values.reduce((sum, rate) => sum + rate, 0) / values.length
}

const averageCompanionRate = getAverageHourlyRate(companionHourlyRates)
const averageDirectorRate = getAverageHourlyRate(directorHourlyRates)
const averageMcRate = getAverageHourlyRate(mcHourlyRates)

// 時間数を計算
function getDurationInHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  return (endMinutes - startMinutes) / 60
}

function ProjectCostPageContent() {
  const router = useAppRouter()
  const params = useParams()
  const projectId = params?.id ? Number(params.id) : null
  const { getProjectById, updateProject, addNotification } = useProject()
  const [isLoading, setIsLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  
  // キャスティングコストの状態
  const [castingCost, setCastingCost] = useState(0)
  const [castingBreakdown, setCastingBreakdown] = useState<{
    companions: { name: string; cost: number }[]
    directors: { name: string; cost: number }[]
    mcs: { name: string; cost: number }[]
    total: number
  }>({
    companions: [],
    directors: [],
    mcs: [],
    total: 0,
  })
  
  // 交通費・宿泊費の状態
  const [transportationFee, setTransportationFee] = useState(0)
  const [accommodationFee, setAccommodationFee] = useState(0)
  const [isTransportationAutoFilled, setIsTransportationAutoFilled] = useState(false)
  const [isAccommodationAutoFilled, setIsAccommodationAutoFilled] = useState(false)
  
  // ポストPRの状態
  const [postPRCost, setPostPRCost] = useState(50000) // 固定額50,000円
  
  // キャスティングコストを計算（確定キャストから）
  const calculateCastingCost = useCallback(() => {
    if (!project) {
      return { cost: 0, breakdown: { companions: [], directors: [], mcs: [], total: 0 } }
    }
    
    // 確定キャストを使用
    const confirmedCompanions = (project as any).confirmedCompanions || []
    const confirmedDirectors = (project as any).confirmedDirectors || []
    const confirmedMcs = (project as any).confirmedMcs || []
    const startTime = project.startTime || "08:00"
    const endTime = project.endTime || "15:00"
    const durationHours = getDurationInHours(startTime, endTime)
    
    // コンパニオンのコストと内訳
    const companionBreakdown = confirmedCompanions.map((name: string) => {
      const hourlyRate = companionHourlyRates[name] || averageCompanionRate
      const cost = Math.round(hourlyRate * durationHours)
      return { name, cost }
    })
    const companionCost = companionBreakdown.reduce((total, item) => total + item.cost, 0)
    
    // ディレクターのコストと内訳
    const directorBreakdown = confirmedDirectors.map((name: string) => {
      const hourlyRate = directorHourlyRates[name] || averageDirectorRate
      const cost = Math.round(hourlyRate * durationHours)
      return { name, cost }
    })
    const directorCost = directorBreakdown.reduce((total, item) => total + item.cost, 0)
    
    // MCのコストと内訳
    const mcBreakdown = confirmedMcs.map((name: string) => {
      const hourlyRate = mcHourlyRates[name] || averageMcRate
      const cost = Math.round(hourlyRate * durationHours)
      return { name, cost }
    })
    const mcCost = mcBreakdown.reduce((total, item) => total + item.cost, 0)
    
    const totalCost = companionCost + directorCost + mcCost
    
    return {
      cost: totalCost,
      breakdown: {
        companions: companionBreakdown,
        directors: directorBreakdown,
        mcs: mcBreakdown,
        total: totalCost,
      }
    }
  }, [project])

  const hasInitialized = useRef(false)
  
  useEffect(() => {
    if (projectId !== null && typeof projectId === 'number' && getProjectById && !hasInitialized.current) {
      hasInitialized.current = true
      const loadedProject = getProjectById(projectId)
      if (!loadedProject) {
        addNotification("案件が見つかりませんでした")
        router.push("/")
        return
      }
      setProject(loadedProject)
      
      // 既存のコスト情報を読み込む
      const existingCastingCost = (loadedProject as any).castingCost || 0
      const existingTransportationFee = (loadedProject as any).transportationFee || 0
      const existingAccommodationFee = (loadedProject as any).accommodationFee || 0
      const existingPostPRCost = (loadedProject as any).postPRCost || 50000
      const isTransportationAuto = (loadedProject as any).isTransportationAutoFilled || false
      const isAccommodationAuto = (loadedProject as any).isAccommodationAutoFilled || false
      
      // キャスティングコストを計算（作成段階で選んでいたキャストから）
      const calculated = calculateCastingCost()
      
      // キャスティングコストが未設定の場合は自動計算値を設定
      const castingCostValue = existingCastingCost > 0 ? existingCastingCost : calculated.cost
      
      setCastingCost(castingCostValue)
      setCastingBreakdown(calculated.breakdown)
      setTransportationFee(existingTransportationFee)
      setAccommodationFee(existingAccommodationFee)
      setPostPRCost(existingPostPRCost)
      setIsTransportationAutoFilled(isTransportationAuto)
      setIsAccommodationAutoFilled(isAccommodationAuto)
      setIsLoading(false)
    } else if (projectId === null) {
      setIsLoading(false)
      hasInitialized.current = false
    }
  }, [projectId, getProjectById, router, addNotification, calculateCastingCost])

  // プロジェクトが変更されたらキャスティングコストを再計算
  useEffect(() => {
    if (project) {
      const calculated = calculateCastingCost()
      // 既存の値がない場合のみ自動計算値を設定
      if (!(project as any).castingCost) {
        setCastingCost(calculated.cost)
        setCastingBreakdown(calculated.breakdown)
      }
    }
  }, [project, calculateCastingCost])

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
      castingCost: castingCost,
      transportationFee: transportationFee,
      accommodationFee: accommodationFee,
      postPRCost: postPRCost,
      isTransportationAutoFilled: isTransportationAutoFilled,
      isAccommodationAutoFilled: isAccommodationAutoFilled,
    } as any)
    addNotification("コスト情報を保存しました")
  }

  const handleBack = () => {
    // ダッシュボードに戻る
    router.push("/")
  }

  const handleSendExpenseForm = () => {
    // 実費回答フォームを送信
    addNotification("実費回答フォームを送信しました。回答が完了次第、自動で反映されます。")
    // 実際の実装では、ここでフォーム送信APIを呼び出す
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
          <h1 className="text-3xl font-bold text-slate-900">コスト入力</h1>
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

        {/* キャスティングコスト */}
        <Card>
          <CardHeader>
            <CardTitle>キャスティング</CardTitle>
            <CardDescription>
              確定キャストと時間数から自動計算されます。必要に応じて修正してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="casting-cost">キャスティングコスト（合計）</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="casting-cost"
                    type="number"
                    value={castingCost}
                    onChange={(e) => setCastingCost(Number(e.target.value))}
                    className="max-w-xs"
                  />
                  <span className="text-sm text-slate-600">円</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  自動計算値: ¥{castingBreakdown.total.toLocaleString()}
                </p>
              </div>
              
              {/* 内訳表示 */}
              {(castingBreakdown.companions.length > 0 || castingBreakdown.directors.length > 0 || castingBreakdown.mcs.length > 0) && (
                <div className="border rounded-lg p-4 space-y-3 bg-slate-50">
                  <Label className="text-sm font-semibold">内訳</Label>
                  
                  {castingBreakdown.companions.length > 0 && (
                    <div>
                      <Label className="text-xs text-slate-600">コンパニオン</Label>
                      <div className="mt-1 space-y-1">
                        {castingBreakdown.companions.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name}</span>
                            <span className="font-medium">¥{item.cost.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-semibold pt-1 border-t border-slate-200">
                          <span>小計</span>
                          <span>¥{castingBreakdown.companions.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {castingBreakdown.directors.length > 0 && (
                    <div>
                      <Label className="text-xs text-slate-600">ディレクター</Label>
                      <div className="mt-1 space-y-1">
                        {castingBreakdown.directors.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name}</span>
                            <span className="font-medium">¥{item.cost.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-semibold pt-1 border-t border-slate-200">
                          <span>小計</span>
                          <span>¥{castingBreakdown.directors.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {castingBreakdown.mcs.length > 0 && (
                    <div>
                      <Label className="text-xs text-slate-600">MC</Label>
                      <div className="mt-1 space-y-1">
                        {castingBreakdown.mcs.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name}</span>
                            <span className="font-medium">¥{item.cost.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-semibold pt-1 border-t border-slate-200">
                          <span>小計</span>
                          <span>¥{castingBreakdown.mcs.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm font-bold pt-2 border-t-2 border-slate-300">
                    <span>合計</span>
                    <span>¥{castingBreakdown.total.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 交通費・宿泊費 */}
        <Card>
          <CardHeader>
            <CardTitle>交通費・宿泊費（実費）</CardTitle>
            <CardDescription>
              実費回答フォームを送信し、各キャストの回答を自動で反映します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="transportation-fee">交通費（合計）</Label>
                  {isTransportationAutoFilled && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      自動反映済み
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="transportation-fee"
                    type="number"
                    value={transportationFee}
                    onChange={(e) => setTransportationFee(Number(e.target.value))}
                    className="max-w-xs"
                    disabled={isTransportationAutoFilled}
                  />
                  <span className="text-sm text-slate-600">円</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="accommodation-fee">宿泊費（合計）</Label>
                  {isAccommodationAutoFilled && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      自動反映済み
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="accommodation-fee"
                    type="number"
                    value={accommodationFee}
                    onChange={(e) => setAccommodationFee(Number(e.target.value))}
                    className="max-w-xs"
                    disabled={isAccommodationAutoFilled}
                  />
                  <span className="text-sm text-slate-600">円</span>
                </div>
              </div>
              <Button
                onClick={handleSendExpenseForm}
                variant="outline"
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                実費回答フォームを送信
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ポストPR */}
        <Card>
          <CardHeader>
            <CardTitle>ポストPR（専用Xでの事前告知）</CardTitle>
            <CardDescription>
              固定額: ¥50,000。必要に応じて修正してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="post-pr-cost">ポストPRコスト</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="post-pr-cost"
                    type="number"
                    value={postPRCost}
                    onChange={(e) => setPostPRCost(Number(e.target.value))}
                    className="max-w-xs"
                  />
                  <span className="text-sm text-slate-600">円</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 保存ボタン */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleBack}>
            戻る
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
    </main>
  )
}

export default function ProjectCostPage() {
  return (
    <Suspense fallback={
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    }>
      <ProjectCostPageContent />
    </Suspense>
  )
}
