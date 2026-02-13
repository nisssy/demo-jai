import type { BookingStatus, ProposalStatus, ExecutionStatus } from "./types"

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
