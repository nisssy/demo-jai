import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DesignVendorOption } from "../hooks/useLotteryAdminDashboard"

export interface NotificationOrderSectionViewProps {
  notificationOrderGeneratedAt?: string
  notificationOrderSentAt?: string
  notificationOrderDesignVendorName?: string
  designVendors: DesignVendorOption[]
  onGenerate: () => void
  onSend: (vendorId: string, vendorName: string) => void
}

export const NotificationOrderSectionView = ({
  notificationOrderGeneratedAt,
  notificationOrderSentAt,
  notificationOrderDesignVendorName,
  designVendors,
  onGenerate,
  onSend,
}: NotificationOrderSectionViewProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">当選通知書</h3>
          <div className="flex items-center gap-2">
            {notificationOrderGeneratedAt && (
              <Badge variant="outline" className="text-xs">
                発注書生成済み
              </Badge>
            )}
            {notificationOrderSentAt && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                送付済み
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status display */}
          {notificationOrderSentAt && notificationOrderDesignVendorName && (
            <div className="bg-muted/50 rounded-md p-3 text-sm">
              <p>
                <span className="text-muted-foreground">送付先:</span>{" "}
                <span className="font-medium">{notificationOrderDesignVendorName}</span>
              </p>
              <p>
                <span className="text-muted-foreground">送付日時:</span>{" "}
                {new Date(notificationOrderSentAt).toLocaleString("ja-JP")}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {!notificationOrderGeneratedAt && (
              <Button onClick={onGenerate} size="sm">
                発注書を生成
              </Button>
            )}

            {notificationOrderGeneratedAt && !notificationOrderSentAt && (
              <div className="flex items-center gap-2">
                <Select
                  onValueChange={(value) => {
                    const vendor = designVendors.find((v) => v.id === value)
                    if (vendor) {
                      onSend(vendor.id, vendor.name)
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="デザイン業者を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {designVendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
