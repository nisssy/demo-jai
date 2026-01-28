import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type CorrectionModalViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  correctionRequest: string
  onCorrectionRequestChange: (value: string) => void
  onSubmit: () => void
  submitDisabled: boolean
}

export const CorrectionModalView = ({
  open,
  onOpenChange,
  correctionRequest,
  onCorrectionRequestChange,
  onSubmit,
  submitDisabled,
}: CorrectionModalViewProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>修正依頼</DialogTitle>
        <DialogDescription>営業担当に修正依頼を送信します。修正内容を記入してください。</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="correction-request">修正依頼内容</Label>
          <Textarea
            id="correction-request"
            value={correctionRequest}
            onChange={(e) => onCorrectionRequestChange(e.target.value)}
            placeholder="修正が必要な内容を記入してください"
            rows={5}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          キャンセル
        </Button>
        <Button onClick={onSubmit} disabled={submitDisabled}>
          修正依頼を送信
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
