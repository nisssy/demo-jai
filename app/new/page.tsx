"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { RoleSelection } from "@/new/features/role-selection/ui/role-selection"
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
  Sales: "営業",
  Internal: "マネジメント部",
  ProductManagement: "商材管理課",
  OutsourcingVendor: "外注業者",
  LotteryAdmin: "事務管理課（抽選）",
  DesignVendor: "デザイン業者",
  PrizeVendor: "景品業者",
}

function NewPageContent() {
  const searchParams = useSearchParams()
  const roleFromQuery = searchParams?.get("role") as Role | null

  if (roleFromQuery && VALID_ROLES.includes(roleFromQuery)) {
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

  return (
    <main>
      <RoleSelection />
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
