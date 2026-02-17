"use client"

import { useCallback } from "react"
import { useAppRouter } from "@/hooks/use-app-router"
import { LogOut, Briefcase, Users, RotateCcw, Ticket, Package, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import type { Role } from "@/new/types/role"

const ROLE_BADGE_CONFIG: Record<Role, { label: string; color: string; icon: React.ReactNode }> = {
  Sales: { label: "営業", color: "bg-blue-600", icon: <Briefcase className="h-4 w-4" /> },
  Internal: { label: "マネジメント部", color: "bg-green-600", icon: <Users className="h-4 w-4" /> },
  ProductManagement: { label: "商材管理課", color: "bg-violet-600", icon: <Briefcase className="h-4 w-4" /> },
  OutsourcingVendor: { label: "外注業者", color: "bg-amber-600", icon: <Users className="h-4 w-4" /> },
  LotteryAdmin: { label: "事務管理課", color: "bg-purple-600", icon: <Ticket className="h-4 w-4" /> },
  DesignVendor: { label: "デザイン業者", color: "bg-pink-600", icon: <Palette className="h-4 w-4" /> },
  PrizeVendor: { label: "景品業者", color: "bg-orange-600", icon: <Package className="h-4 w-4" /> },
}

type AppHeaderProps = {
  currentRole: Role
}

export const AppHeader = ({ currentRole }: AppHeaderProps) => {
  const router = useAppRouter()

  const handleBackToRoleSelection = useCallback(() => {
    router.push("/")
  }, [router])

  const handleResetDemoData = useCallback(() => {
    if (typeof window !== "undefined") {
      const keysToRemove = [
        "new_seed_version", "new_projects", "new_products",
        "new_design_requests", "new_companies", "new_halls",
        "new_employees", "new_machine_masters",
      ]
      for (const key of keysToRemove) {
        localStorage.removeItem(key)
      }
    }
    router.push("/")
    window.location.reload()
  }, [router])

  const badge = ROLE_BADGE_CONFIG[currentRole]

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
                  <AlertDialogAction onClick={handleResetDemoData}>
                    初期化する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Badge variant="default" className={`${badge.color} text-white px-3 py-1.5 gap-2`}>
              {badge.icon}
              <span className="font-semibold">{badge.label}</span>
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToRoleSelection}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              ロールを変更
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
