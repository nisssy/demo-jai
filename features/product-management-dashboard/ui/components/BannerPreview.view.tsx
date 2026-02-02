import type { BannerData } from "@/features/product-management-dashboard/model/types"

export type BannerPreviewViewProps = {
  bannerData: BannerData
  /** プレビュー表示のスケール（案件一覧用は small、モーダル用は default） */
  size?: "small" | "default"
  className?: string
}

export const BannerPreviewView = ({
  bannerData,
  size = "default",
  className = "",
}: BannerPreviewViewProps) => {
  const isSmall = size === "small"
  const scale = isSmall ? 0.4 : 1
  const items = (bannerData.targetMachines ?? []).filter((s) => s.trim())

  return (
    <div
      className={`aspect-[3/2] w-full rounded-lg overflow-hidden border-2 border-cyan-400/90 bg-[#0c0f14] shadow-[0_0_14px_rgba(34,211,238,0.35)] ${className}`}
      style={{
        minHeight: isSmall ? 56 : undefined,
        backgroundImage: `
          linear-gradient(135deg, rgba(34,211,238,0.06) 0%, transparent 50%),
          linear-gradient(225deg, rgba(20,184,166,0.05) 0%, transparent 50%),
          repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(34,211,238,0.04) 18px, rgba(34,211,238,0.04) 19px),
          repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(34,211,238,0.04) 18px, rgba(34,211,238,0.04) 19px)
        `,
      }}
    >
      <div
        className="h-full w-full flex flex-col text-white"
        style={{
          padding: isSmall ? 6 : 16,
          paddingTop: isSmall ? 6 : 16,
          paddingBottom: isSmall ? 6 : 16,
        }}
      >
        {/* ヘッダー: 白枠日付(左) + ティール都道府県 + 店舗名(右) */}
        <div className="flex items-stretch gap-0 flex-shrink-0 mb-1" style={{ marginBottom: isSmall ? 4 : 12 }}>
          <div
            className="flex flex-col items-center justify-center rounded border border-cyan-400/80 bg-white/95 flex-shrink-0 text-slate-900"
            style={{ minWidth: isSmall ? 24 : 48, padding: isSmall ? 4 : 8 }}
          >
            <span className="font-bold leading-tight" style={{ fontSize: Math.round(14 * scale) }}>
              {bannerData.date || "2/1"}
            </span>
            <span className="opacity-80" style={{ fontSize: Math.round(8 * scale) }}>
              [{bannerData.dayOfWeek || "日曜日"}]
            </span>
          </div>
          <div
            className="flex-1 min-w-0 flex items-center justify-center relative flex-shrink-0"
            style={{ padding: isSmall ? 6 : 12, paddingTop: isSmall ? 10 : 20 }}
          >
            <span
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-teal-500 text-white rounded-sm z-10"
              style={{ fontSize: Math.round(8 * scale), padding: isSmall ? 2 : 4 }}
            >
              {bannerData.prefecture || "長野県"}
            </span>
            <span
              className="block font-bold truncate text-center"
              style={{ fontSize: Math.round(12 * scale) }}
            >
              {bannerData.storeName || "店舗名"}
            </span>
          </div>
        </div>
        {/* 取材対象機種: 左=白円形ラベル(青枠) / 右=01,02,03 オレンジ円+機種名のみ */}
        <div className="flex-1 min-h-0 flex gap-2 overflow-hidden" style={{ gap: isSmall ? 6 : 12 }}>
          <div className="flex-shrink-0 flex items-center justify-center">
            <div
              className="rounded-full border-2 border-cyan-400/90 bg-white flex flex-col items-center justify-center text-slate-800"
              style={{
                width: isSmall ? 28 : 48,
                height: isSmall ? 28 : 48,
                padding: isSmall ? 2 : 4,
              }}
            >
              <span className="font-medium leading-tight" style={{ fontSize: Math.round(7 * scale) }}>
                取材対象
              </span>
              <span className="font-medium leading-tight" style={{ fontSize: Math.round(7 * scale) }}>
                機種
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-0 overflow-hidden">
            {items.length > 0 ? (
              items.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 flex-shrink-0 border-b border-cyan-400/30 last:border-0"
                  style={{ paddingBottom: isSmall ? 2 : 6, paddingTop: isSmall ? 2 : 6 }}
                >
                  <span
                    className="flex-shrink-0 rounded-full bg-amber-500 font-bold text-center text-white shadow-inner"
                    style={{
                      fontSize: Math.round(8 * scale),
                      padding: isSmall ? "2px 6px" : "4px 8px",
                      minWidth: isSmall ? 16 : 32,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-white/95 truncate font-medium"
                    style={{ fontSize: Math.round(10 * scale) }}
                  >
                    {name || "機種名"}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-white/50" style={{ fontSize: Math.round(9 * scale) }}>
                取材対象機種
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
