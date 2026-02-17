import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Calendar, MapPin, CheckCircle2 } from "lucide-react"
import type { ProjectData } from "@/types/project"
import type { ArrangementItem, ArrangementType } from "@/features/project-arrangements/hooks/useProjectArrangements"

export type ProjectArrangementsViewProps = {
  projectData: ProjectData
  arrangements: ArrangementItem[]
  selectedArrangement: ArrangementType | null
  formData: {
    talent: { contractDate: string; fee: string; notes: string }
    venue: { bookingDate: string; capacity: string; equipment: string }
    transportation: { departure: string; arrival: string; transportType: string }
    accommodation: { hotelName: string; checkIn: string; checkOut: string }
    staff: { staffCount: string; roles: string; notes: string }
  }
  completedCount: number
  totalCount: number
  allCompleted: boolean
  onOpenModal: (type: ArrangementType) => void
  onCloseModal: () => void
  onSubmitArrangement: () => void
  onFormDataChange: (type: ArrangementType, field: string, value: string) => void
  onNext: () => void
  onBack: () => void
  renderStatusBadge: (status: string) => React.ReactNode
}

export const ProjectArrangementsView = ({
  projectData,
  arrangements,
  selectedArrangement,
  formData,
  completedCount,
  totalCount,
  allCompleted,
  onOpenModal,
  onCloseModal,
  onSubmitArrangement,
  onFormDataChange,
  onNext,
  onBack,
  renderStatusBadge,
}: ProjectArrangementsViewProps) => {
  const getModalTitle = () => {
    const arrangement = arrangements.find((arr) => arr.id === selectedArrangement)
    return arrangement ? arrangement.title : ""
  }

  const getModalDescription = () => {
    const arrangement = arrangements.find((arr) => arr.id === selectedArrangement)
    return arrangement ? arrangement.description : ""
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
                  <span className="text-slate-600">実施日:</span>
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
                onChange={(e) => onFormDataChange("talent", "contractDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee">出演料・派遣料（確定）</Label>
              <Input
                id="fee"
                type="number"
                value={formData.talent.fee}
                onChange={(e) => onFormDataChange("talent", "fee", e.target.value)}
                placeholder="500000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="talentNotes">特記事項</Label>
              <Textarea
                id="talentNotes"
                value={formData.talent.notes}
                onChange={(e) => onFormDataChange("talent", "notes", e.target.value)}
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
                  <span className="text-slate-600">実施日:</span>
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
                onChange={(e) => onFormDataChange("venue", "bookingDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">収容人数</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.venue.capacity}
                onChange={(e) => onFormDataChange("venue", "capacity", e.target.value)}
                placeholder="500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">必要設備</Label>
              <Textarea
                id="equipment"
                value={formData.venue.equipment}
                onChange={(e) => onFormDataChange("venue", "equipment", e.target.value)}
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
                onChange={(e) => onFormDataChange("transportation", "departure", e.target.value)}
                placeholder="コンパニオン自宅・事務所"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrival">到着地</Label>
              <Input
                id="arrival"
                value={formData.transportation.arrival}
                onChange={(e) => onFormDataChange("transportation", "arrival", e.target.value)}
                placeholder="パチンコ店舗"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transportType">交通手段</Label>
              <Input
                id="transportType"
                value={formData.transportation.transportType}
                onChange={(e) => onFormDataChange("transportation", "transportType", e.target.value)}
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
                onChange={(e) => onFormDataChange("accommodation", "hotelName", e.target.value)}
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
                  onChange={(e) => onFormDataChange("accommodation", "checkIn", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOut">チェックアウト</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={formData.accommodation.checkOut}
                  onChange={(e) => onFormDataChange("accommodation", "checkOut", e.target.value)}
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
                onChange={(e) => onFormDataChange("staff", "staffCount", e.target.value)}
                placeholder="3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roles">役割・担当業務</Label>
              <Textarea
                id="roles"
                value={formData.staff.roles}
                onChange={(e) => onFormDataChange("staff", "roles", e.target.value)}
                placeholder="イベントMC、カメラマン、受付スタッフなど"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="staffNotes">特記事項</Label>
              <Textarea
                id="staffNotes"
                value={formData.staff.notes}
                onChange={(e) => onFormDataChange("staff", "notes", e.target.value)}
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
          <CardTitle>案件情報</CardTitle>
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
              <span className="text-slate-600">コンパニオン:</span>
              <span className="font-medium">{projectData.talent}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">実施日:</span>
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
              onClick={() => onOpenModal(arrangement.id)}
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
                  {renderStatusBadge(arrangement.status)}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {allCompleted && (
        <div className="flex justify-end">
          <Button onClick={onNext} size="lg" className="gap-2">
            <CheckCircle2 className="h-5 w-5" />
            全ての手配が完了しました
          </Button>
        </div>
      )}

      <Dialog open={selectedArrangement !== null} onOpenChange={onCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
            <DialogDescription>{getModalDescription()}</DialogDescription>
          </DialogHeader>

          {renderModalContent()}

          <DialogFooter>
            <Button variant="outline" onClick={onCloseModal}>
              キャンセル
            </Button>
            <Button onClick={onSubmitArrangement} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              手配完了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
