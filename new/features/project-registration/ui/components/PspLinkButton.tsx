"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Link2 } from "lucide-react"

type Props = {
  productId?: number
}

export const PspLinkButton = ({ productId }: Props) => {
  const pspKey = productId ? `psp_linked_${productId}` : null
  const [pspLinked, setPspLinked] = useState(false)

  useEffect(() => {
    if (!pspKey || typeof window === "undefined") return
    setPspLinked(localStorage.getItem(pspKey) === "1")
  }, [pspKey])

  const togglePsp = () => {
    if (!pspKey) return
    const next = !pspLinked
    setPspLinked(next)
    if (typeof window !== "undefined") {
      if (next) localStorage.setItem(pspKey, "1")
      else localStorage.removeItem(pspKey)
    }
  }

  if (!productId) return null

  return (
    <Button
      type="button"
      size="sm"
      variant={pspLinked ? "default" : "outline"}
      onClick={togglePsp}
      className={`h-8 text-xs gap-1 ${pspLinked ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
    >
      {pspLinked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      {pspLinked ? "連携済み" : "PSP連携"}
    </Button>
  )
}
