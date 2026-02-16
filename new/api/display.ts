import type { BookingStatus, ProposalStatus, ExecutionStatus, ProductProgressStatus, ManagementConfirmationStatus } from "./types"
import type { Role } from "@/new/types/role"

// ─── ロールラベル ───

export const ROLE_LABELS: Record<Role, string> = {
  Sales: "BS・CS",
  Internal: "マネジメント部",
  ProductManagement: "商材管理課",
  LotteryAdmin: "事務管理課（抽選）",
  OutsourcingVendor: "スロセレ外注業者",
  DesignVendor: "デザイン業者",
  PrizeVendor: "景品業者",
}

// ─── 提案ステータス ───

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  "before-proposal": "提案前",
  "proposing": "提案中",
  "order-received": "受注済み",
}

// ─── キャスティングステータス ───

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  "tentative_requesting": "仮押さえ依頼中",
  "tentative_failed": "仮押さえ不可",
  "tentative_completed": "仮押さえ完了",
  "confirmed_requesting": "本押さえ依頼中",
  "confirmed_failed": "本押さえ不可",
  "confirmed_completed": "本押さえ完了",
}

// ─── 実施ステータス（全商材共通） ───

export const EXECUTION_STATUS_LABELS: Record<ExecutionStatus, string> = {
  "実施前": "実施前",
  "実施中": "実施中",
  "終了": "終了",
}

// ─── ヨミ（読み確度） ───

export const READING_CERTAINTY_LABELS: Record<string, string> = {
  "A": "A（確度高）",
  "B": "B（確度中）",
  "C": "C（確度低）",
}

// ─── DM発送 ───

export const DM_MAILING_LABELS: Record<string, string> = {
  "yes": "あり",
  "no": "なし",
}

// ─── デザイン依頼種別 ───

export const DESIGN_REQUEST_TYPE_LABELS: Record<string, string> = {
  "poster": "ポスター",
  "dm": "DM",
  "winner-list": "当選者リスト",
}

// ─── デザイン依頼ステータス ───

export const DESIGN_REQUEST_STATUS_LABELS: Record<string, string> = {
  "requested": "初稿待ち",
  "uploaded": "アップロード済み",
}

// ─── 外注業者進捗ステータス ───

export const PRODUCT_PROGRESS_STATUS_LABELS: Record<ProductProgressStatus, string> = {
  "not_started": "未対応",
  "report_uploaded": "レポートアップロード済",
  "pachitown_linked": "パチタウン連携済",
  "post_event_done": "事後データ入力済",
}

// ─── 衣装 ───

export const COSTUME_OPTIONS: { value: string; label: string }[] = [
  { value: "costume1", label: "衣装A (S/M/L対応)" },
  { value: "costume2", label: "衣装B (S/M/L対応)" },
  { value: "costume3", label: "衣装C (S/M/L対応)" },
  { value: "costume4", label: "衣装D (S/M/L対応)" },
]

export const COSTUME_LABELS: Record<string, string> = {
  costume1: "衣装A",
  costume2: "衣装B",
  costume3: "衣装C",
  costume4: "衣装D",
}

// ─── カテゴリ・イベント区分マッピング ───

export const EVENT_TYPE_TO_CATEGORY: Record<string, string> = {
  "トリニティガール": "イベント",
  "スロセレ": "イベント",
  "合同抽選会": "ポイント",
}

export const CATEGORY_TO_EVENT_TYPES: Record<string, string[]> = {
  "イベント": ["トリニティガール", "スロセレ"],
  "ポイント": ["合同抽選会"],
}

export function getCategoryByEventType(eventType: string): string | undefined {
  return EVENT_TYPE_TO_CATEGORY[eventType]
}

export function getEventTypesByCategory(category: string): string[] {
  return CATEGORY_TO_EVENT_TYPES[category] || []
}

// ─── マネジメント部確認ステータス ───

export const MANAGEMENT_CONFIRMATION_STATUS_LABELS: Record<ManagementConfirmationStatus, string> = {
  "unconfirmed": "確認前",
  "under-review": "確認中",
  "revision-requested": "修正依頼",
  "approved": "承認",
}
