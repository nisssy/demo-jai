import {
  SEED_COMPANIONS,
  SEED_DIRECTORS,
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
