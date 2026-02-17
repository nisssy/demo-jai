import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

export type ProportionInputViewProps = {
  label: string
  percentage: number
  calculatedAmount: number
  onPercentageChange: (value: number) => void
}

export function ProportionInputView({
  label,
  percentage,
  calculatedAmount,
  onPercentageChange,
}: ProportionInputViewProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-xs font-medium text-slate-700 truncate">{label}</div>
      <div className="flex-1">
        <Slider
          value={[percentage]}
          onValueChange={([val]) => onPercentageChange(val)}
          max={100}
          min={0}
          step={1}
          className="flex-1"
        />
      </div>
      <div className="w-16">
        <Input
          type="number"
          min={0}
          max={100}
          value={percentage}
          onChange={(e) => onPercentageChange(Number(e.target.value) || 0)}
          className="text-xs h-7 text-center"
        />
      </div>
      <div className="w-6 text-xs text-slate-500">%</div>
      <div className="w-24 text-xs text-right text-slate-600">
        ¥{calculatedAmount.toLocaleString()}
      </div>
    </div>
  )
}
