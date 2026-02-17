export type ProductManagementDashboardTab = "machineMaster" | "projectMachines"

/** 機種マスタ（スロット機種名とパチタウン用名称の対応） */
export type MachineMaster = {
  id: number
  /** 機種名（表示・検索用） */
  name: string
  /** パチタウン用の機種名 */
  pachitownName: string
}

/** 保存されたバナー内容（案件一覧プレビュー用） */
export type BannerData = {
  /** 日付表示（例: 2/1） */
  date: string
  /** 曜日（例: 日曜日） */
  dayOfWeek: string
  /** 都道府県（例: 長野県） */
  prefecture: string
  /** 店舗名（例: ニュートーキョー若穂店） */
  storeName: string
  /** 取材対象機種（複数・全て機種名のみ） */
  targetMachines: string[]
}

export type BannerEditState = {
  /** 案件・商材の id（商材 = DemoProject.id） */
  productId: number | null
  date: string
  dayOfWeek: string
  prefecture: string
  storeName: string
  targetMachines: string[]
}

function toTargetMachinesArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string")
  if (typeof v === "string" && v.trim()) return v.includes(" / ") ? v.split(" / ").map((s) => s.trim()).filter(Boolean) : [v.trim()]
  return []
}

/** 旧形式（line1/line2）または新形式の保存データを BannerData に正規化する */
export function normalizeBannerData(raw: unknown): BannerData | undefined {
  if (raw == null || typeof raw !== "object") return undefined
  const o = raw as Record<string, unknown>
  const hasNew = typeof o.storeName === "string" && typeof o.date === "string"
  if (hasNew) {
    return {
      date: (o.date as string) || "2/1",
      dayOfWeek: (o.dayOfWeek as string) || "日曜日",
      prefecture: (o.prefecture as string) || "長野県",
      storeName: (o.storeName as string) || "",
      targetMachines: toTargetMachinesArray(o.targetMachines ?? o.targetMachine),
    }
  }
  if (typeof o.line1 === "string" || typeof o.line2 === "string") {
    return {
      date: "2/1",
      dayOfWeek: "日曜日",
      prefecture: "長野県",
      storeName: (o.line1 as string) || "",
      targetMachines: toTargetMachinesArray(o.line2),
    }
  }
  return undefined
}

export const MACHINE_MASTERS_STORAGE_KEY = "product-management-machine-masters"

export const INITIAL_MACHINE_MASTERS: MachineMaster[] = [
  { id: 1, name: "北斗の拳 転生", pachitownName: "北斗の拳 転生" },
  { id: 2, name: "パチスロ 北斗の拳", pachitownName: "北斗の拳 転生" },
  { id: 3, name: "パチスロ シン・エヴァンゲリオン", pachitownName: "シン・エヴァンゲリオン" },
  { id: 4, name: "エヴァンゲリオン 〜魂の軌跡〜", pachitownName: "シン・エヴァンゲリオン" },
  { id: 5, name: "シン・エヴァンゲリオン", pachitownName: "シン・エヴァンゲリオン" },
  { id: 6, name: "パチスロ 機動戦士ガンダム 哀・戦士編", pachitownName: "機動戦士ガンダム 哀・戦士編" },
  { id: 7, name: "スーパー海物語 IN 沖縄2", pachitownName: "海物語 IN 沖縄2" },
  { id: 8, name: "パチスロ 真・三國無双", pachitownName: "真・三國無双" },
]
