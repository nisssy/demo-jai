"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { RoleSelection } from "@/new/features/role-selection/ui/role-selection"
import { ProjectList } from "@/new/features/project-list/ui/project-list"
import type { Role } from "@/new/types/role"

const VALID_ROLES: Role[] = [
  "Sales",
  "Internal",
  "ProductManagement",
  "OutsourcingVendor",
  "LotteryAdmin",
  "DesignVendor",
  "PrizeVendor",
]

const ROLE_LABELS: Record<Role, string> = {
  Sales: "BS・CS",
  Internal: "マネジメント部",
  ProductManagement: "商材管理課",
  OutsourcingVendor: "スロセレ外注業者",
  LotteryAdmin: "事務管理課（抽選）",
  DesignVendor: "デザイン業者",
  PrizeVendor: "景品業者",
}

function NewPageContent() {
  const searchParams = useSearchParams()
  const roleFromQuery = searchParams?.get("role") as Role | null

  // ロール未選択 → ロール選択画面
  if (!roleFromQuery || !VALID_ROLES.includes(roleFromQuery)) {
    return (
      <main>
        <RoleSelection />
      </main>
    )
  }

  // BS・CS → 案件一覧画面
  if (roleFromQuery === "Sales") {
    return (
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <ProjectList />
      </main>
    )
  }

  // その他のロール → 準備中
  return (
    <main className="px-8 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {ROLE_LABELS[roleFromQuery]}
          </h2>
          <p className="text-slate-500">この画面は準備中です</p>
        </div>
      </div>
    </main>
  )
}

export default function NewPage() {
  return (
    <Suspense
      fallback={
        <main className="px-8 py-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      }
    >
      <NewPageContent />
    </Suspense>
  )
}
