import { Button } from "@/components/ui/button"
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
import type { PrizeOrderDocument } from "@/new/api/types"

export interface PrizeOrderSectionViewProps {
  prizeOrdersByVendor?: PrizeOrderDocument[]
  prizeOrderGeneratedAt?: string
  prizeOrderRequestedAt?: string
  onGenerate: () => void
  onSend: () => void
}

export const PrizeOrderSectionView = ({
  prizeOrdersByVendor,
  prizeOrderGeneratedAt,
  prizeOrderRequestedAt,
  onGenerate,
  onSend,
}: PrizeOrderSectionViewProps) => {
  const hasOrders = prizeOrdersByVendor && prizeOrdersByVendor.length > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">景品発注</h3>
          <div className="flex items-center gap-2">
            {prizeOrderGeneratedAt && (
              <Badge variant="outline" className="text-xs">
                発注書生成済み
              </Badge>
            )}
            {prizeOrderRequestedAt && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                発注済み
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!hasOrders ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-sm text-muted-foreground">
                景品発注書がまだ生成されていません
              </p>
              <Button onClick={onGenerate} size="sm">
                発注書を生成
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {prizeOrdersByVendor.map((order) => (
                <div key={order.vendorId} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{order.vendorName}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {order.prizeItems.length}品目
                    </Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>等級</TableHead>
                        <TableHead>景品名</TableHead>
                        <TableHead className="text-right">数量</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.prizeItems.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.rank}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}

              {!prizeOrderRequestedAt && (
                <div className="flex justify-end">
                  <Button onClick={onSend} size="sm">
                    全業者に発注送付
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
