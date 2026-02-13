import {
  SEED_COMPANIONS,
  SEED_DIRECTORS,
  SEED_PRODUCTIONS,
  SEED_EVENT_BASE_FEES,
} from "./seed-data"
import type { SeedCastMember } from "./seed-data"

/** キャストメンバー（View 向け型） */
export type CastMember = SeedCastMember

// ─── 名前→時給ルックアップ（BillingSection 用） ───

export const COMPANION_HOURLY_RATES: Record<string, number> = Object.fromEntries(
  SEED_COMPANIONS.map((m) => [m.name, m.hourlyRate])
)

export const DIRECTOR_HOURLY_RATES: Record<string, number> = Object.fromEntries(
  SEED_DIRECTORS.map((m) => [m.name, m.hourlyRate])
)

// ─── リスト取得 ───

export function getCompanionList(): CastMember[] {
  return SEED_COMPANIONS.map((m) => ({ ...m }))
}

export function getDirectorList(): CastMember[] {
  return SEED_DIRECTORS.map((m) => ({ ...m }))
}

// ─── 時間計算 ───

export function getDurationInHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0
  const [sh, sm] = startTime.split(":").map(Number)
  const [eh, em] = endTime.split(":").map(Number)
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  if (endMin <= startMin) return 0
  return (endMin - startMin) / 60
}

// ─── 請求予定金額用ヘルパー ───

function getAverageRate(members: readonly SeedCastMember[]): number {
  if (members.length === 0) return 0
  return members.reduce((sum, m) => sum + m.hourlyRate, 0) / members.length
}

export function getAverageCompanionRate(): number {
  return getAverageRate(SEED_COMPANIONS)
}

export function getAverageDirectorRate(): number {
  return getAverageRate(SEED_DIRECTORS)
}

export function getEventBaseFee(eventType: string): number {
  return SEED_EVENT_BASE_FEES[eventType] ?? 0
}

// ─── 交通費自動計算 ───

const ZONES = [
  "千代田区", "渋谷区", "新宿区", "豊島区", "台東区", "墨田区", "港区",
  "横浜", "川崎", "大宮", "千葉", "船橋", "柏",
  "立川", "八王子", "町田", "相模原", "厚木", "藤沢", "鎌倉",
]

const TOKYO_ZONES = [
  "千代田区", "渋谷区", "新宿区", "豊島区", "台東区", "墨田区", "港区",
  "立川", "八王子", "町田",
]

function pickZone(addr: string): string {
  return ZONES.find((z) => addr.includes(z)) ?? "その他"
}

function isTokyo(zone: string): boolean {
  return TOKYO_ZONES.some((t) => zone.includes(t))
}

/** 所属住所→ホール住所のゾーン距離に基づく交通費（1人分） */
export function estimateTravelFee(fromAddr: string, toAddr: string): number {
  const a = pickZone(fromAddr)
  const b = pickZone(toAddr)
  if (a === b) return 2000
  if (isTokyo(a) && isTokyo(b)) return 4000
  if (!isTokyo(a) && !isTokyo(b)) return 6000
  return 8000
}

const productionById = new Map(SEED_PRODUCTIONS.map((p) => [p.id, p]))
const companionByName = new Map(SEED_COMPANIONS.map((c) => [c.name, c]))

/** 選択済みコンパニオンの交通費合計を算出 */
export function computeTransportFee(selectedCompanions: string[], hallAddress: string): number {
  let total = 0
  for (const name of selectedCompanions) {
    if (!name || name === "未定") continue
    const companion = companionByName.get(name)
    if (!companion?.productionId) continue
    const production = productionById.get(companion.productionId)
    const fromAddr = production?.address || "東京都"
    total += estimateTravelFee(fromAddr, hallAddress)
  }
  return Math.round(total)
}
