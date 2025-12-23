"use client"

import { useState } from "react"
import { Bell, FileText, ClipboardList, FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Screen1 } from "@/components/screens/screen-1"
import { Screen2 } from "@/components/screens/screen-2"
import { Screen3 } from "@/components/screens/screen-3"
import { Screen4 } from "@/components/screens/screen-4"
import { Screen5 } from "@/components/screens/screen-5"
import { Screen6 } from "@/components/screens/screen-6"
import { Screen7 } from "@/components/screens/screen-7"
import { Screen8 } from "@/components/screens/screen-8"
import { Screen9 } from "@/components/screens/screen-9"

export type Role = "Sales" | "Internal"
export type ProjectData = {
  projectName: string
  clientName: string
  date: string
  venue: string
  talent: string
  talentStatus: "available" | "busy"
  quoteItems: Array<{ item: string; amount: number }>
  emailDraft: string
  contractAmount: string
  billingAddress: string
  status: "proposed" | "ordered" | "confirmed"
  validationErrors: string[]
  correctionRequest: string
  projects?: Array<{
    id: number
    projectName: string
    clientName: string
    date: string
    venue: string
    talent: string
    estimateAmount: string
    status: "proposed" | "ordered"
  }>
}

export default function DMM() {
  const [currentRole, setCurrentRole] = useState<Role>("Sales")
  const [currentStep, setCurrentStep] = useState(1)
  const [notifications, setNotifications] = useState<string[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const { toast } = useToast()

  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: "",
    clientName: "",
    date: "",
    venue: "",
    talent: "",
    talentStatus: "available",
    quoteItems: [],
    emailDraft: "",
    contractAmount: "",
    billingAddress: "",
    status: "proposed",
    validationErrors: [],
    correctionRequest: "",
    projects: [
      {
        id: 1,
        projectName: "新台入替キャンペーン",
        clientName: "マルハン渋谷店",
        date: "2025/12/10",
        venue: "パチンコ店舗フロア",
        talent: "田中 太郎",
        estimateAmount: "¥600,000",
        status: "proposed",
      },
      {
        id: 2,
        projectName: "グランドオープン記念",
        clientName: "ダイナム新宿店",
        date: "2026/01/15",
        venue: "パチンコ店舗エントランス",
        talent: "佐藤 花子",
        estimateAmount: "¥450,000",
        status: "proposed",
      },
      {
        id: 3,
        projectName: "新機種導入イベント",
        clientName: "ガイア池袋店",
        date: "2026/02/20",
        venue: "パチンコ店舗特設ステージ",
        talent: "鈴木 一郎",
        estimateAmount: "¥380,000",
        status: "proposed",
      },
    ],
  })

  const addNotification = (message: string) => {
    setNotifications((prev) => [message, ...prev])
    toast({
      title: "通知",
      description: message,
    })
  }

  const toggleRole = () => {
    setCurrentRole((prev) => (prev === "Sales" ? "Internal" : "Sales"))
  }

  const getStepGroup = (step: number): number => {
    if (step <= 2) return 1 // 案件登録・リソース確認
    if (step === 3) return 3 // 進行中の案件リスト
    return 2 // 見積作成・送付 (currently not directly used, but for future)
  }

  const currentGroup = getStepGroup(currentStep)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                J
              </div>
              <span className="text-xl font-bold text-slate-900">DMM</span>
              <Badge variant="secondary" className="ml-2">
                Demo
              </Badge>
            </div>

            <div className="flex items-center gap-6">
              {/* Role Toggle */}
              {currentRole === "Internal" && (
                <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                  <Label htmlFor="role-toggle" className="text-sm font-medium">
                    🛡️ Co・Dir（内勤）モード
                  </Label>
                  <Switch id="role-toggle" checked={true} onCheckedChange={toggleRole} />
                </div>
              )}

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-slate-200">
                      <h3 className="font-semibold text-sm">通知センター</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">通知はありません</div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {notifications.map((notif, idx) => (
                          <div key={idx} className="p-3 text-sm hover:bg-slate-50">
                            {notif}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex">
        <aside className="w-72 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)] p-6 sticky top-[73px]">
          <nav className="space-y-2">
            <button
              onClick={() => setCurrentStep(1)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                currentStep === 1 ? "bg-blue-50 text-blue-900 font-medium" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FileText className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap">案件登録・リソース確認</span>
            </button>

            <button
              onClick={() => setCurrentStep(2)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                currentStep === 2 ? "bg-blue-50 text-blue-900 font-medium" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <ClipboardList className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap">見積作成・送付</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                currentStep >= 3 ? "bg-blue-50 text-blue-900 font-medium" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FolderKanban className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap">進行中の案件リスト</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 px-8 py-8 max-w-7xl mx-auto">
          {currentStep === 1 && (
            <Screen1
              projectData={projectData}
              setProjectData={setProjectData}
              onNext={() => setCurrentStep(2)}
              addNotification={addNotification}
            />
          )}
          {currentStep === 2 && (
            <Screen2
              projectData={projectData}
              setProjectData={setProjectData}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <Screen3
              projectData={projectData}
              setProjectData={setProjectData}
              onNext={() => {
                setCurrentStep(4)
                addNotification("案件バリデーション完了。各種手配を開始してください。")
              }}
              onBack={() => setCurrentStep(2)}
              addNotification={addNotification}
              role={currentRole}
              setCurrentScreen={(screen) => {
                setCurrentStep(screen)
                if (screen === 7) {
                  setCurrentRole("Internal")
                  addNotification("広報文面生成画面に移動しました")
                }
              }}
            />
          )}
          {currentStep === 4 && (
            <Screen4
              projectData={projectData}
              onNext={() => {
                setCurrentStep(5)
                addNotification("全ての手配が完了しました")
              }}
              onBack={() => setCurrentStep(3)}
            />
          )}
          {currentStep === 5 && currentRole === "Internal" && (
            <Screen5
              projectData={projectData}
              setProjectData={setProjectData}
              onSendCorrection={() => {
                setCurrentStep(6)
                setCurrentRole("Sales")
                addNotification("営業担当へ修正依頼を送信しました")
              }}
            />
          )}
          {currentStep === 6 && currentRole === "Sales" && (
            <Screen6
              projectData={projectData}
              setProjectData={setProjectData}
              onResubmit={() => {
                setCurrentStep(5)
                setCurrentRole("Internal")
                addNotification("修正完了・再提出されました")
              }}
            />
          )}
          {currentStep === 7 && (
            <Screen7 projectData={projectData} onNext={() => setCurrentStep(8)} onBack={() => setCurrentStep(4)} />
          )}
          {currentStep === 8 && (
            <Screen8 projectData={projectData} onNext={() => setCurrentStep(9)} onBack={() => setCurrentStep(7)} />
          )}
          {currentStep === 9 && <Screen9 projectData={projectData} onBack={() => setCurrentStep(8)} />}
        </main>
      </div>

      <Toaster />
    </div>
  )
}
