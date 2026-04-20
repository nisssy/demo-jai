"use client"

import { useEffect } from "react"
import { useAppRouter } from "@/hooks/use-app-router"

type RecordDetailContainerProps = {
  productId: number
  role?: import("@/new/types/role").Role
}

export const RecordDetailContainer = ({ productId, role = "Sales" }: RecordDetailContainerProps) => {
  const router = useAppRouter()

  useEffect(() => {
    router.replace(`/new/project-registration?mode=product-edit&productId=${productId}&role=${role}`)
  }, [router, productId, role])

  return (
    <div className="flex h-[60vh] items-center justify-center text-sm text-slate-500">
      レコードを開いています…
    </div>
  )
}
