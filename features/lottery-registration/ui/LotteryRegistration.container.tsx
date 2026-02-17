"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { useLotteryRegistration } from "../hooks/useLotteryRegistration"
import { LotteryRegistrationView } from "./LotteryRegistration.view"
import type { LotteryRegistrationProps } from "../types"

export function LotteryRegistrationContainer({
  productId,
  addNotification,
}: LotteryRegistrationProps) {
  const router = useRouter()
  const state = useLotteryRegistration({ productId, addNotification })

  const handleSave = useCallback(() => {
    const result = state.save()
    if (result.success) {
      addNotification(productId ? "商材を更新しました" : "商材を登録しました")
      router.push("/")
    }
  }, [state, productId, addNotification, router])

  return <LotteryRegistrationView state={state} onSave={handleSave} />
}
