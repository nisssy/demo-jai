import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { RegistrationMode } from "@/new/features/project-registration/model/types"

const SUBMIT_LABELS: Record<RegistrationMode, string> = {
  new: "案件を作成",
  edit: "案件を更新",
  "project-edit": "案件情報を更新",
  "product-add": "商材を追加",
  "product-edit": "商材を更新",
}

type ActionButtonsProps = {
  mode: RegistrationMode
  productCount: number
  onAddProduct: () => void
  onSubmit: () => void
}

export const ActionButtons = ({
  mode,
  productCount,
  onAddProduct,
  onSubmit,
}: ActionButtonsProps) => {
  const isProductMode = mode === "product-add" || mode === "product-edit"
  const canAddProduct = !isProductMode && mode !== "project-edit" && productCount < 5

  return (
    <div className="flex items-center gap-4">
      {canAddProduct && (
        <Button variant="outline" onClick={onAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          商材を追加
        </Button>
      )}
      <Button onClick={onSubmit}>
        {SUBMIT_LABELS[mode]}
      </Button>
    </div>
  )
}
