"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Sparkles, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react"
import type { ProjectData } from "@/app/page"
import { useState, useMemo, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Screen1Props = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  onNext: () => void
  addNotification: (message: string) => void
}

export function Screen1({ projectData, setProjectData, onNext, addNotification }: Screen1Props) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
    return new Date(today.setDate(diff))
  })

  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)
  const [isLoadingBooking, setIsLoadingBooking] = useState(false)
  const [selectedDirector, setSelectedDirector] = useState("")
  const [directorWorkingHours, setDirectorWorkingHours] = useState("")

  useEffect(() => {
    if (projectData.date) {
      const selectedDate = new Date(projectData.date)
      const day = selectedDate.getDay()
      const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1) // Monday of the week
      const weekStart = new Date(selectedDate)
      weekStart.setDate(diff)
      setCurrentWeekStart(weekStart)
    }
  }, [projectData.date])

  const weekData = useMemo(() => {
    const weekDays = []
    const timeSlots = []

    // Generate time slots from 9:00 to 18:00
    for (let hour = 9; hour <= 18; hour++) {
      timeSlots.push(`${hour}:00`)
    }

    // Generate 7 days starting from Monday
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(date.getDate() + i)
      weekDays.push({
        date: date,
        dayOfWeek: ["月", "火", "水", "木", "金", "土", "日"][i],
        dayNum: date.getDate(),
        month: date.getMonth() + 1,
      })
    }

    return { weekDays, timeSlots }
  }, [currentWeekStart])

  const getBusySlots = (dayIndex: number, hour: number) => {
    if (projectData.talentStatus === "available") {
      //田中太郎 and 佐藤花子 have fewer busy slots
      return dayIndex === 2 && hour >= 14 && hour <= 16 // Wednesday 14:00-17:00
    } else {
      // 鈴木一郎 is busier
      return (
        (dayIndex === 1 && hour >= 10 && hour <= 12) || // Tuesday 10:00-13:00
        (dayIndex === 3 && hour >= 13 && hour <= 17) || // Thursday 13:00-18:00
        (dayIndex === 4 && hour >= 9 && hour <= 11) // Friday 9:00-12:00
      )
    }
  }

  const handleTalentSelect = (talent: string, status: "available" | "busy") => {
    setProjectData({ ...projectData, talent, talentStatus: status })
    setSelectedSlots(new Set())
  }

  const getSlotId = (dayIdx: number, timeIdx: number) => {
    return `${dayIdx}-${timeIdx}`
  }

  const handleSlotClick = (dayIdx: number, timeIdx: number, isBusy: boolean) => {
    if (isBusy) return // Don't allow selecting busy slots

    const slotId = getSlotId(dayIdx, timeIdx)
    const newSelectedSlots = new Set(selectedSlots)

    if (newSelectedSlots.has(slotId)) {
      newSelectedSlots.delete(slotId)
    } else {
      newSelectedSlots.add(slotId)
    }

    setSelectedSlots(newSelectedSlots)
  }

  const handleProvisionalBooking = () => {
    if (selectedSlots.size === 0) {
      addNotification(`エラー: 仮押さえする時間帯を選択してください`)
      return
    }

    const slotDetails = Array.from(selectedSlots)
      .map((slotId) => {
        const [dayIdx, timeIdx] = slotId.split("-").map(Number)
        const day = weekData.weekDays[dayIdx]
        const time = weekData.timeSlots[timeIdx]
        return `${day.month}/${day.dayNum} ${time}`
      })
      .join(", ")

    setIsLoadingBooking(true)
    addNotification(`Slack通知: ${projectData.talent}の仮押さえ完了（${slotDetails}）`)
    setTimeout(() => {
      setIsLoadingBooking(false)
      onNext()
    }, 500)
  }

  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() - 7)
    setCurrentWeekStart(newWeekStart)
    setSelectedSlots(new Set())
  }

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() + 7)
    setCurrentWeekStart(newWeekStart)
    setSelectedSlots(new Set())
  }

  const weekRangeText = useMemo(() => {
    const endDate = new Date(currentWeekStart)
    endDate.setDate(endDate.getDate() + 6)
    return `${currentWeekStart.getMonth() + 1}/${currentWeekStart.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}, ${currentWeekStart.getFullYear()}`
  }, [currentWeekStart])

  const talents = [
    { name: "田中 太郎", status: "available" as const },
    { name: "佐藤 花子", status: "available" as const },
    { name: "鈴木 一郎", status: "busy" as const },
  ]

  const directors = [
    { name: "山田 ディレクター", status: "available" as const },
    { name: "中村 ディレクター", status: "available" as const },
    { name: "小林 ディレクター", status: "busy" as const },
  ]

  const venueOptions = [
    "パチンコ店舗フロア",
    "パチンコ店舗エントランス",
    "パチンコ店舗特設ステージ",
    "パチンコ店舗駐車場",
  ]

  const clientOptions = ["マルハン渋谷店", "ダイナム新宿店", "ガイア池袋店", "マルハン新宿東宝ビル店", "ダイナム横浜店"]

  const workingHoursOptions = [
    { label: "2時間", value: "2" },
    { label: "4時間", value: "4" },
    { label: "6時間", value: "6" },
    { label: "8時間", value: "8" },
    { label: "全日", value: "full" },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {isLoadingBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-700">仮押さえ依頼を送信中...</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">案件登録・リソース確認</h1>
        <p className="text-slate-600">新規案件の基本情報を入力し、タレントのリソースを確認します</p>
      </div>

      {/* Step 1: Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: 案件基本情報</CardTitle>
          <CardDescription>案件の詳細を入力してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">案件名</Label>
              <Input
                id="projectName"
                value={projectData.projectName}
                onChange={(e) => setProjectData({ ...projectData, projectName: e.target.value })}
                placeholder="例: 新台入替イベント"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName">顧客名</Label>
              <Select
                value={projectData.clientName}
                onValueChange={(value) => setProjectData({ ...projectData, clientName: value })}
              >
                <SelectTrigger id="clientName">
                  <SelectValue placeholder="顧客を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {clientOptions.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">開催日</Label>
              <Input
                id="date"
                type="date"
                value={projectData.date}
                onChange={(e) => setProjectData({ ...projectData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue">会場</Label>
              <Select
                value={projectData.venue}
                onValueChange={(value) => setProjectData({ ...projectData, venue: value })}
              >
                <SelectTrigger id="venue">
                  <SelectValue placeholder="会場を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {venueOptions.map((venue) => (
                    <SelectItem key={venue} value={venue}>
                      {venue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Resource Check */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle>Step 2: リソース・タレント手配（AI連携）</CardTitle>
          </div>
          <CardDescription>AIがタレントのスケジュールをリアルタイムで確認します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>タレント選択</Label>
            <div className="grid grid-cols-3 gap-3">
              {talents.map((talent) => (
                <button
                  key={talent.name}
                  onClick={() => handleTalentSelect(talent.name, talent.status)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    projectData.talent === talent.name
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-medium text-slate-900">{talent.name}</div>
                  <Badge variant={talent.status === "available" ? "default" : "destructive"} className="mt-2">
                    {talent.status === "available" ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        空き（手配可）
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        埋まり（NG）
                      </>
                    )}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {projectData.talent && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-sm">Googleカレンダー連携 - {projectData.talent}のスケジュール</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[160px] text-center">{weekRangeText}</span>
                  <Button variant="outline" size="sm" onClick={goToNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                時間帯をクリックして仮押さえする時間を選択してください（複数選択可）
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Header row with days */}
                  <div className="grid grid-cols-8 border-b border-slate-200">
                    <div className="p-2 text-xs font-medium text-slate-500"></div>
                    {weekData.weekDays.map((day, idx) => (
                      <div key={idx} className="p-2 text-center border-l border-slate-200">
                        <div className="text-xs font-medium text-slate-600">{day.dayOfWeek}</div>
                        <div className="text-sm font-semibold text-slate-900">
                          {day.month}/{day.dayNum}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Time slots */}
                  {weekData.timeSlots.map((time, timeIdx) => (
                    <div key={time} className="grid grid-cols-8 border-b border-slate-200">
                      <div className="p-2 text-xs font-medium text-slate-500 flex items-start justify-end pr-3">
                        {time}
                      </div>
                      {weekData.weekDays.map((day, dayIdx) => {
                        const isBusy = getBusySlots(dayIdx, 9 + timeIdx)
                        const isEventDay =
                          projectData.date && new Date(projectData.date).toDateString() === day.date.toDateString()
                        const slotId = getSlotId(dayIdx, timeIdx)
                        const isSelected = selectedSlots.has(slotId)

                        return (
                          <button
                            key={dayIdx}
                            onClick={() => handleSlotClick(dayIdx, timeIdx, isBusy)}
                            disabled={isBusy}
                            className={`p-2 border-l border-slate-200 min-h-[40px] transition-colors ${
                              isBusy
                                ? "bg-red-100 border-red-200 cursor-not-allowed"
                                : isSelected
                                  ? "bg-blue-500 border-blue-600 hover:bg-blue-600"
                                  : isEventDay
                                    ? "bg-green-50 hover:bg-blue-100"
                                    : "bg-white hover:bg-blue-50 cursor-pointer"
                            }`}
                          >
                            {isBusy && <div className="text-xs text-red-700 font-medium">予定あり</div>}
                            {isSelected && <div className="text-xs text-white font-medium">選択中</div>}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={projectData.talentStatus === "available" ? "default" : "destructive"}>
                    リアルタイムステータス: {projectData.talentStatus === "available" ? "空き" : "埋まり"}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                      <span>予定あり</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 border border-blue-600 rounded"></div>
                      <span>選択中</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-white border border-slate-200 rounded"></div>
                      <span>空き</span>
                    </div>
                  </div>
                  {selectedSlots.size > 0 && (
                    <Badge variant="outline" className="bg-blue-50">
                      {selectedSlots.size}時間選択中
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {projectData.talent && (
            <div className="mt-6 space-y-4">
              <Label>ディレクター選択</Label>
              <div className="grid grid-cols-3 gap-3">
                {directors.map((director) => (
                  <button
                    key={director.name}
                    onClick={() => setSelectedDirector(director.status === "available" ? director.name : "")}
                    disabled={director.status === "busy"}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedDirector === director.name
                        ? "border-blue-500 bg-blue-50"
                        : director.status === "busy"
                          ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-50"
                          : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-medium text-slate-900">{director.name}</div>
                    <Badge variant={director.status === "available" ? "default" : "destructive"} className="mt-2">
                      {director.status === "available" ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          空き（手配可）
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          埋まり（NG）
                        </>
                      )}
                    </Badge>
                  </button>
                ))}
              </div>

              {selectedDirector && (
                <div className="mt-4 space-y-3">
                  <Label>稼働時間</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {workingHoursOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDirectorWorkingHours(option.value)}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          directorWorkingHours === option.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-medium text-slate-900 text-sm">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedDirector && directorWorkingHours && (
                <Badge variant="outline" className="bg-green-50">
                  選択: {selectedDirector} - {directorWorkingHours === "full" ? "全日" : `${directorWorkingHours}時間`}
                </Badge>
              )}
            </div>
          )}

          {projectData.talent && projectData.talentStatus === "available" && (
            <div className="mt-6 pt-4 border-t border-purple-200">
              <Button onClick={handleProvisionalBooking} className="w-full gap-2" size="lg">
                <Sparkles className="h-4 w-4" />
                仮押さえ依頼を送信
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
