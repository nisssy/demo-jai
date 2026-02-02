"use client"

import { LogOut, Briefcase, Users, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProject } from "@/contexts/project-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function Header() {
  const { currentRole, setCurrentRole, resetDemoData } = useProject()

  const handleBackToRoleSelection = () => {
    setCurrentRole(null)
  }

  return (
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
            {/* Demo Reset */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  デモ初期化
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>デモデータを初期化しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    projects / halls / companies を含む全データが初期状態に戻ります（localStorageもリセットされます）。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      resetDemoData()
                    }}
                  >
                    初期化する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Current Role Display（画面に応じて表記を切り替え） */}
            {currentRole !== null && (
              <div className="flex items-center gap-2">
                {currentRole === "Sales" && (
                  <Badge variant="default" className="bg-blue-600 text-white px-3 py-1.5 gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-semibold">営業</span>
                  </Badge>
                )}
                {currentRole === "Internal" && (
                  <Badge variant="default" className="bg-green-600 text-white px-3 py-1.5 gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">イベントチーム</span>
                  </Badge>
                )}
                {currentRole === "ProductManagement" && (
                  <Badge variant="default" className="bg-violet-600 text-white px-3 py-1.5 gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-semibold">商材管理課</span>
                  </Badge>
                )}
                {currentRole === "OutsourcingVendor" && (
                  <Badge variant="default" className="bg-amber-600 text-white px-3 py-1.5 gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">外注業者</span>
                  </Badge>
                )}
              </div>
            )}

            {/* Back to Role Selection */}
            {currentRole !== null && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToRoleSelection}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                ロールを変更
              </Button>
            )}

          </div>
        </div>
      </div>
    </header>
  )
}

