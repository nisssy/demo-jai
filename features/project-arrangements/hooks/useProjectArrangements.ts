"use client"

import { useState, useCallback, useMemo } from "react"
import { User, Building2, Car, Hotel, Users } from "lucide-react"
import type { ProjectData } from "@/types/project"

export type ArrangementType = "talent" | "venue" | "transportation" | "accommodation" | "staff"

export type ArrangementItem = {
  id: ArrangementType
  title: string
  description: string
  icon: typeof User
  status: "pending" | "in-progress" | "completed"
}

export type UseProjectArrangementsArgs = {
  projectData: ProjectData
  onNext: () => void
  onBack: () => void
}

export function useProjectArrangements({ projectData, onNext, onBack }: UseProjectArrangementsArgs) {
  const [selectedArrangement, setSelectedArrangement] = useState<ArrangementType | null>(null)
  const [arrangements, setArrangements] = useState<ArrangementItem[]>([
    {
      id: "talent",
      title: "コンパニオン手配",
      description: "コンパニオンへの正式依頼・契約書送付",
      icon: User,
      status: "pending",
    },
    {
      id: "venue",
      title: "会場手配",
      description: "店舗内スペースの確保・設備確認",
      icon: Building2,
      status: "pending",
    },
    {
      id: "transportation",
      title: "交通手配",
      description: "コンパニオンの送迎・交通手段の手配",
      icon: Car,
      status: "pending",
    },
    {
      id: "accommodation",
      title: "宿泊手配",
      description: "遠方コンパニオンのホテル予約",
      icon: Hotel,
      status: "pending",
    },
    {
      id: "staff",
      title: "スタッフ手配",
      description: "イベント運営スタッフ・アシスタントの手配",
      icon: Users,
      status: "pending",
    },
  ])

  const [formData, setFormData] = useState({
    talent: {
      contractDate: "",
      fee: "",
      notes: "",
    },
    venue: {
      bookingDate: "",
      capacity: "",
      equipment: "",
    },
    transportation: {
      departure: "",
      arrival: "",
      transportType: "",
    },
    accommodation: {
      hotelName: "",
      checkIn: "",
      checkOut: "",
    },
    staff: {
      staffCount: "",
      roles: "",
      notes: "",
    },
  })

  const handleOpenModal = useCallback((type: ArrangementType) => {
    setSelectedArrangement(type)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedArrangement(null)
  }, [])

  const handleSubmitArrangement = useCallback(() => {
    if (!selectedArrangement) return
    setArrangements((prev) => prev.map((arr) => (arr.id === selectedArrangement ? { ...arr, status: "completed" } : arr)))
    handleCloseModal()
  }, [selectedArrangement, handleCloseModal])

  const handleFormDataChange = useCallback(
    (type: ArrangementType, field: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [field]: value,
        },
      }))
    },
    [],
  )

  const completedCount = useMemo(() => arrangements.filter((arr) => arr.status === "completed").length, [arrangements])
  const totalCount = arrangements.length
  const allCompleted = completedCount === totalCount

  return {
    arrangements,
    selectedArrangement,
    formData,
    completedCount,
    totalCount,
    allCompleted,
    handleOpenModal,
    handleCloseModal,
    handleSubmitArrangement,
    handleFormDataChange,
    onNext,
    onBack,
  }
}
