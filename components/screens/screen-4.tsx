"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, User, Building2, Car, Hotel, Users, CheckCircle2, Calendar, MapPin, Sparkles } from "lucide-react"
import type { ProjectData } from "@/app/page"

type Screen4Props = {
  projectData: ProjectData
  onNext: () => void
  onBack: () => void
}

type ArrangementType = "talent" | "venue" | "transportation" | "accommodation" | "staff"

type ArrangementItem = {
  id: ArrangementType
  title: string
  description: string
  icon: typeof User
  status: "pending" | "in-progress" | "completed"
}

export function Screen4({ projectData, onNext, onBack }: Screen4Props) {
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

  const handleOpenModal = (type: ArrangementType) => {
    setSelectedArrangement(type)
  }

  const handleCloseModal = () => {
    setSelectedArrangement(null)
  }

  const handleSubmitArrangement = () => {
    if (!selectedArrangement) return

    setArrangements(arrangements.map((arr) => (arr.id === selectedArrangement ? { ...arr, status: "completed" } : arr)))

    handleCloseModal()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">完了</Badge>
      case "in-progress":
        return <Badge className="bg-yellow-600">進行中</Badge>
      default:
        return <Badge variant="secondary">未着手</Badge>
    }
  }

  const renderModalContent = () => {
    if (!selectedArrangement) return null

    switch (selectedArrangement) {
      case "talent":
        return (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-slate-900 mb-2">案件情報</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">案件名:</span>
                  <span className="ml-2 font-medium">{projectData.projectName}</span>
                </div>
                <div>
                  <span className="text-slate-600">コンパニオン:</span>
                  <span className="ml-2 font-medium">{projectData.talent}</span>
                </div>
                <div>
                  <span className="text-slate-600">開催日:</span>
                  <span className="ml-2 font-medium">{projectData.date}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractDate">契約書送付日</Label>
              <Input
                id="contractDate"
                type="date"
                value={formData.talent.contractDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    talent: { ...formData.talent, contractDate: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee">出演料・派遣料（確定）</Label>
              <Input
                id="fee"
                type="number"
                value={formData.talent.fee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    talent: { ...formData.talent, fee: e.target.value },
                  })
                }
                placeholder="500000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="talentNotes">特記事項</Label>
              <Textarea
                id="talentNotes"
                value={formData.talent.notes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    talent: { ...formData.talent, notes: e.target.value },
                  })
                }
                placeholder="衣装、ヘアメイク、休憩時間の要望など"
                rows={3}
              />
            </div>
          </div>
        )

      case "venue":
        return (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-slate-900 mb-2">会場情報</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">会場名:</span>
                  <span className="ml-2 font-medium">{projectData.venue}</span>
                </div>
                <div>
                  <span className="text-slate-600">開催日:</span>
                  <span className="ml-2 font-medium">{projectData.date}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookingDate">予約確定日</Label>
              <Input
                id="bookingDate"
                type="date"
                value={formData.venue.bookingDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    venue: { ...formData.venue, bookingDate: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">収容人数</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.venue.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    venue: { ...formData.venue, capacity: e.target.value },
                  })
                }
                placeholder="500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">必要設備</Label>
              <Textarea
                id="equipment"
                value={formData.venue.equipment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    venue: { ...formData.venue, equipment: e.target.value },
                  })
                }
                placeholder="ステージ、マイク、音響機材、看板など"
                rows={3}
              />
            </div>
          </div>
        )

      case "transportation":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="departure">出発地</Label>
              <Input
                id="departure"
                value={formData.transportation.departure}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transportation: { ...formData.transportation, departure: e.target.value },
                  })
                }
                placeholder="コンパニオン自宅・事務所"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrival">到着地</Label>
              <Input
                id="arrival"
                value={formData.transportation.arrival}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transportation: { ...formData.transportation, arrival: e.target.value },
                  })
                }
                placeholder="パチンコ店舗"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transportType">交通手段</Label>
              <Input
                id="transportType"
                value={formData.transportation.transportType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transportation: { ...formData.transportation, transportType: e.target.value },
                  })
                }
                placeholder="送迎車、タクシー、電車など"
              />
            </div>
          </div>
        )

      case "accommodation":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hotelName">ホテル名</Label>
              <Input
                id="hotelName"
                value={formData.accommodation.hotelName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accommodation: { ...formData.accommodation, hotelName: e.target.value },
                  })
                }
                placeholder="アパホテル渋谷道玄坂上"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">チェックイン</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={formData.accommodation.checkIn}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accommodation: { ...formData.accommodation, checkIn: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOut">チェックアウト</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={formData.accommodation.checkOut}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accommodation: { ...formData.accommodation, checkOut: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )

      case "staff":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staffCount">必要スタッフ数</Label>
              <Input
                id="staffCount"
                type="number"
                value={formData.staff.staffCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    staff: { ...formData.staff, staffCount: e.target.value },
                  })
                }
                placeholder="3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roles">役割・担当業務</Label>
              <Textarea
                id="roles"
                value={formData.staff.roles}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    staff: { ...formData.staff, roles: e.target.value },
                  })
                }
                placeholder="イベントMC、カメラマン、受付スタッフなど"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="staffNotes">特記事項</Label>
              <Textarea
                id="staffNotes"
                value={formData.staff.notes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    staff: { ...formData.staff, notes: e.target.value },
                  })
                }
                placeholder="イベント経験、パチンコ業界知識など"
                rows={3}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getModalTitle = () => {
    const arrangement = arrangements.find((arr) => arr.id === selectedArrangement)
    return arrangement ? arrangement.title : ""
  }

  const getModalDescription = () => {
    const arrangement = arrangements.find((arr) => arr.id === selectedArrangement)
    return arrangement ? arrangement.description : ""
  }

  const completedCount = arrangements.filter((arr) => arr.status === "completed").length
  const totalCount = arrangements.length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">各種手配</h1>
          <p className="text-slate-600">
            案件に必要な手配を進めます（進捗: {completedCount}/{totalCount}）
          </p>
        </div>
      </div>

      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle>案件情報</CardTitle>
          </div>
          <CardDescription>バリデーション完了済みの案件です</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">案件名:</span>
              <span className="font-medium">{projectData.projectName}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">コンパニオン:</span>
              <span className="font-medium">{projectData.talent}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">開催日:</span>
              <span className="font-medium">{projectData.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">会場:</span>
              <span className="font-medium">{projectData.venue}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {arrangements.map((arrangement) => {
          const IconComponent = arrangement.icon
          return (
            <Card
              key={arrangement.id}
              className="hover:shadow-md transition-all cursor-pointer border-2 hover:border-blue-300"
              onClick={() => handleOpenModal(arrangement.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{arrangement.title}</h3>
                      <p className="text-sm text-slate-600">{arrangement.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-sm text-slate-600">ステータス:</span>
                  {getStatusBadge(arrangement.status)}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {completedCount === totalCount && (
        <div className="flex justify-end">
          <Button onClick={onNext} size="lg" className="gap-2">
            <CheckCircle2 className="h-5 w-5" />
            全ての手配が完了しました
          </Button>
        </div>
      )}

      <Dialog open={selectedArrangement !== null} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
            <DialogDescription>{getModalDescription()}</DialogDescription>
          </DialogHeader>

          {renderModalContent()}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              キャンセル
            </Button>
            <Button onClick={handleSubmitArrangement} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              手配完了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
