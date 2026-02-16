"use client"

import { Suspense, useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AppHeader } from "@/new/ui/AppHeader"
import { RoleSelection } from "@/new/features/role-selection/ui/role-selection"
import { ProjectList } from "@/new/features/project-list/ui/project-list"
import { InternalDashboard } from "@/new/features/internal-dashboard/ui/internal-dashboard"
import { ProductManagementDashboard } from "@/new/features/product-management-dashboard/ui/product-management-dashboard"
import { OutsourcingVendorDashboard } from "@/new/features/outsourcing-vendor-dashboard/ui/outsourcing-vendor-dashboard"
import { LotteryAdminDashboard } from "@/new/features/lottery-admin-dashboard/ui/lottery-admin-dashboard"
import { DesignVendorDashboard } from "@/new/features/design-vendor-dashboard/ui/design-vendor-dashboard"
import { PrizeVendorDashboard } from "@/new/features/prize-vendor-dashboard/ui/prize-vendor-dashboard"
import { LocalStorageProjectRepository } from "@/new/api/impl/local-storage-project-repository"
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

function NewPageContent() {
  const searchParams = useSearchParams()
  const roleFromQuery = searchParams?.get("role") as Role | null
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ロール未選択 → ロール選択画面
  if (!roleFromQuery || !VALID_ROLES.includes(roleFromQuery)) {
    return (
      <main>
        <RoleSelection />
      </main>
    )
  }

  // localStorage 依存のダッシュボードはクライアントマウント後にのみレンダリング
  if (!mounted) {
    return (
      <>
        <AppHeader currentRole={roleFromQuery} />
        <main className="px-8 py-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </>
    )
  }

  return <DashboardContent role={roleFromQuery} />
}

function DashboardContent({ role }: { role: Role }) {
  const repository = useMemo(() => new LocalStorageProjectRepository(), [])

  const dashboard = (() => {
    switch (role) {
      case "Sales":
        return <ProjectList />
      case "Internal":
        return <InternalDashboard repository={repository} />
      case "ProductManagement":
        return <ProductManagementDashboard repository={repository} />
      case "OutsourcingVendor":
        return <OutsourcingVendorDashboard />
      case "LotteryAdmin":
        return <LotteryAdminDashboard />
      case "DesignVendor":
        return <DesignVendorDashboard repository={repository} />
      case "PrizeVendor":
        return <PrizeVendorDashboard repository={repository} />
      default:
        return null
    }
  })()

  return (
    <>
      <AppHeader currentRole={role} />
      <main className="px-8 py-8 max-w-7xl mx-auto">
        {dashboard}
      </main>
    </>
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
