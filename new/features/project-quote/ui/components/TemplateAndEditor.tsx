import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Pencil, Save, X, Plus, Trash2 } from "lucide-react"
import type { QuoteTemplate, QuoteLineItem } from "@/new/features/project-quote/model/types"

type TemplateAndEditorProps = {
  templates: QuoteTemplate[]
  selectedTemplateId: number
  quoteItems: QuoteLineItem[]
  isEditing: boolean
  totalAmount: number
  onApplyTemplate: (id: number) => void
  onStartEditing: () => void
  onCancelEditing: () => void
  onSaveEditing: () => void
  onUpdateItemName: (id: string, name: string) => void
  onUpdateItemAmount: (id: string, amount: number) => void
  onToggleItemVisible: (id: string) => void
  onRemoveItem: (id: string) => void
  onAddItem: () => void
  onUpdateSubitemName: (itemId: string, subitemId: string, name: string) => void
  onUpdateSubitemAmount: (itemId: string, subitemId: string, amount: number) => void
  onToggleSubitemVisible: (itemId: string, subitemId: string) => void
  onRemoveSubitem: (itemId: string, subitemId: string) => void
  onAddSubitem: (itemId: string) => void
}

export const TemplateAndEditor = ({
  templates,
  selectedTemplateId,
  quoteItems,
  isEditing,
  totalAmount,
  onApplyTemplate,
  onStartEditing,
  onCancelEditing,
  onSaveEditing,
  onUpdateItemName,
  onUpdateItemAmount,
  onToggleItemVisible,
  onRemoveItem,
  onAddItem,
  onUpdateSubitemName,
  onUpdateSubitemAmount,
  onToggleSubitemVisible,
  onRemoveSubitem,
  onAddSubitem,
}: TemplateAndEditorProps) => {
  return (
    <div className="space-y-6">
      {/* テンプレート選択グリッド */}
      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-3">テンプレート選択</h3>
        <div className="grid grid-cols-3 gap-3">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onApplyTemplate(tpl.id)}
              className={`text-left p-3 rounded-lg border-2 transition-colors ${
                selectedTemplateId === tpl.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="font-medium text-sm text-slate-900">{tpl.name}</div>
              <div className="text-xs text-slate-500 mt-1">{tpl.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 見積項目一覧 */}
      {quoteItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-700">見積項目</h3>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={onSaveEditing}>
                    <Save className="h-3.5 w-3.5 mr-1" />
                    保存
                  </Button>
                  <Button variant="outline" size="sm" onClick={onCancelEditing}>
                    <X className="h-3.5 w-3.5 mr-1" />
                    キャンセル
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={onStartEditing}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  編集
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {quoteItems.map((item) => (
              <div key={item.id}>
                {/* 項目カード */}
                <div className={`p-3 rounded-lg border transition-opacity ${
                  !item.visible ? "opacity-50 bg-slate-50 border-slate-200" : "bg-white border-slate-200"
                }`}>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={item.visible}
                      onCheckedChange={() => onToggleItemVisible(item.id)}
                    />
                    {isEditing ? (
                      <>
                        <Input
                          value={item.name}
                          onChange={(e) => onUpdateItemName(item.id, e.target.value)}
                          className="h-8 text-sm flex-1"
                          placeholder="項目名"
                        />
                        <Input
                          type="number"
                          value={item.amount}
                          onChange={(e) => onUpdateItemAmount(item.id, parseInt(e.target.value, 10) || 0)}
                          className="h-8 text-sm w-32 text-right"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm text-slate-900">{item.name}</span>
                        <span className="text-sm font-medium text-slate-900">
                          ¥{item.amount.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>

                  {/* サブ項目（内訳） */}
                  {item.subitems && item.subitems.length > 0 && (
                    <div className="pl-10 mt-2 space-y-1.5 border-l-2 border-slate-200 ml-4">
                      {item.subitems.map((si) => (
                        <div
                          key={si.id}
                          className={`flex items-center gap-2 pl-3 transition-opacity ${
                            !si.visible ? "opacity-40" : ""
                          }`}
                        >
                          <Switch
                            checked={si.visible}
                            onCheckedChange={() => onToggleSubitemVisible(item.id, si.id)}
                            className="scale-75"
                          />
                          {isEditing ? (
                            <>
                              <Input
                                value={si.name}
                                onChange={(e) => onUpdateSubitemName(item.id, si.id, e.target.value)}
                                className="h-7 text-xs flex-1"
                                placeholder="内訳名"
                              />
                              <Input
                                type="number"
                                value={si.amount}
                                onChange={(e) => onUpdateSubitemAmount(item.id, si.id, parseInt(e.target.value, 10) || 0)}
                                className="h-7 text-xs w-28 text-right"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveSubitem(item.id, si.id)}
                                className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 text-xs text-slate-600">{si.name}</span>
                              <span className="text-xs text-slate-600">
                                ¥{si.amount.toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => onAddSubitem(item.id)}
                          className="flex items-center gap-1 pl-3 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="h-3 w-3" />
                          内訳を追加
                        </button>
                      )}
                    </div>
                  )}

                  {/* サブ項目がないときの追加ボタン（編集中） */}
                  {isEditing && (!item.subitems || item.subitems.length === 0) && (
                    <div className="pl-10 mt-2 ml-4">
                      <button
                        type="button"
                        onClick={() => onAddSubitem(item.id)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="h-3 w-3" />
                        内訳を追加
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 項目追加ボタン（編集中のみ） */}
          {isEditing && (
            <Button variant="outline" size="sm" onClick={onAddItem} className="mt-2">
              <Plus className="h-3.5 w-3.5 mr-1" />
              項目を追加
            </Button>
          )}

          {/* 合計 */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200">
            <span className="text-sm font-medium text-slate-600">合計金額</span>
            <span className="text-lg font-bold text-slate-900">
              ¥{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
