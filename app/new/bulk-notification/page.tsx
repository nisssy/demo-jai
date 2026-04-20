"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AppHeader } from "@/new/ui/AppHeader"
import { BulkNotificationItem } from "@/new/features/lottery-admin-dashboard/ui/BulkNotificationItem"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import type { Role } from "@/new/types/role"

function BulkNotificationContent() {
  const search = useSearchParams()
  const role = (search?.get("role") ?? "LotteryAdmin") as Role
  const idsParam = search?.get("ids") ?? ""
  const ids = idsParam
    .split(",")
    .map((s) => Number(s))
    .filter((n) => !Number.isNaN(n) && n > 0)

  return (
    <>
      <AppHeader currentRole={role} />
      <main className="px-8 py-8 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              戻る
            </Button>
          </div>
          <h1 className="text-xl font-bold text-slate-900">当選デザイン一括依頼</h1>
          <p className="text-sm text-slate-500 mt-1">
            選択した {ids.length} 件のレコードをまとめて発注処理します
          </p>
        </div>
        {ids.length === 0 ? (
          <div className="text-center py-12 text-slate-500">対象のレコードがありません</div>
        ) : (
          <BulkNotificationItem productIds={ids} />
        )}
      </main>
    </>
  )
}

export default function BulkNotificationPage() {
  return (
    <Suspense
      fallback={
        <main className="px-8 py-8 max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      }
    >
      <BulkNotificationContent />
    </Suspense>
  )
}
