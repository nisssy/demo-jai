import type { QuoteRecipient } from "@/new/features/project-quote/model/types"

type RecipientSelectorProps = {
  projectNumber: string
  recipient: QuoteRecipient
  hallName: string
  companyName: string
  onSelect: (r: QuoteRecipient) => void
}

export const RecipientSelector = ({
  projectNumber,
  recipient,
  hallName,
  companyName,
  onSelect,
}: RecipientSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-500 mb-2">
        案件No: {projectNumber}
      </div>
      <p className="text-sm text-slate-600 mb-6">
        見積書の宛先を選択してください。
      </p>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onSelect("hall")}
          className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
            recipient === "hall"
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              recipient === "hall" ? "border-blue-500" : "border-slate-300"
            }`}>
              {recipient === "hall" && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              )}
            </div>
            <div>
              <div className="font-medium text-slate-900">ホール</div>
              <div className="text-sm text-slate-500">{hallName}</div>
            </div>
          </div>
        </button>

        {companyName && (
          <button
            type="button"
            onClick={() => onSelect("company")}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
              recipient === "company"
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                recipient === "company" ? "border-blue-500" : "border-slate-300"
              }`}>
                {recipient === "company" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                )}
              </div>
              <div>
                <div className="font-medium text-slate-900">法人</div>
                <div className="text-sm text-slate-500">{companyName}</div>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
