import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PrizeDeliveryInfoByVendor } from "@/new/api/types"

export interface DeliveryInfoSectionViewProps {
  prizeDeliveryInfoByVendor?: PrizeDeliveryInfoByVendor[]
}

export const DeliveryInfoSectionView = ({
  prizeDeliveryInfoByVendor,
}: DeliveryInfoSectionViewProps) => {
  const hasDeliveryInfo =
    prizeDeliveryInfoByVendor && prizeDeliveryInfoByVendor.length > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-base font-bold">配送情報</h3>
      </CardHeader>
      <CardContent>
        {!hasDeliveryInfo ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            配送情報がありません
          </p>
        ) : (
          <div className="space-y-4">
            {prizeDeliveryInfoByVendor.map((vendor) => (
              <div key={vendor.vendorId} className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">{vendor.vendorName}</h4>
                  <div className="flex items-center gap-2">
                    {vendor.carrierName && (
                      <Badge variant="outline" className="text-xs">
                        {vendor.carrierName}
                      </Badge>
                    )}
                    {vendor.deliveredAt && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        配送完了
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Vendor-level info */}
                <div className="bg-muted/50 rounded-md p-2 mb-3 text-sm space-y-1">
                  {vendor.trackingNumber && (
                    <p>
                      <span className="text-muted-foreground">追跡番号:</span>{" "}
                      <span className="font-mono">{vendor.trackingNumber}</span>
                    </p>
                  )}
                  {vendor.shippedAt && (
                    <p>
                      <span className="text-muted-foreground">発送日:</span>{" "}
                      {new Date(vendor.shippedAt).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                  {vendor.deliveredAt && (
                    <p>
                      <span className="text-muted-foreground">配送完了日:</span>{" "}
                      {new Date(vendor.deliveredAt).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </div>

                {/* Per-winner delivery table */}
                {vendor.deliveries && vendor.deliveries.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>当選者ID</TableHead>
                        <TableHead>当選者名</TableHead>
                        <TableHead>配送業者</TableHead>
                        <TableHead>追跡番号</TableHead>
                        <TableHead>発送日</TableHead>
                        <TableHead>発送完了日</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendor.deliveries.map((delivery) => (
                        <TableRow key={delivery.winnerId}>
                          <TableCell className="font-mono text-xs">
                            {delivery.winnerId}
                          </TableCell>
                          <TableCell>{delivery.winnerName}</TableCell>
                          <TableCell>{delivery.carrierName ?? "-"}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {delivery.trackingNumber ?? "-"}
                          </TableCell>
                          <TableCell>
                            {delivery.shippedAt
                              ? new Date(delivery.shippedAt).toLocaleDateString("ja-JP")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {delivery.deliveredAt
                              ? new Date(delivery.deliveredAt).toLocaleDateString("ja-JP")
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
