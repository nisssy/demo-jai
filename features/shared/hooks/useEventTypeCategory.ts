/**
 * イベント区分とカテゴリの連動ロジックを提供する共通フック
 *
 * 使用箇所:
 * - 案件検索フィルター
 * - 新規案件作成
 */

// イベント区分とカテゴリのマッピング定義
export const EVENT_TYPE_TO_CATEGORY: Record<string, string> = {
  "トリニティガール": "イベント",
  "スロセレ": "イベント",
  "合同抽選会": "ポイント",
}

// カテゴリとイベント区分のマッピング（逆引き用）
export const CATEGORY_TO_EVENT_TYPES: Record<string, string[]> = {
  "イベント": ["トリニティガール", "スロセレ"],
  "ポイント": ["合同抽選会"],
}

/**
 * イベント区分からカテゴリを取得
 */
export function getCategoryByEventType(eventType: string): string | undefined {
  return EVENT_TYPE_TO_CATEGORY[eventType]
}

/**
 * カテゴリから選択可能なイベント区分の配列を取得
 */
export function getEventTypesByCategory(category: string): string[] {
  return CATEGORY_TO_EVENT_TYPES[category] || []
}

/**
 * すべてのイベント区分を取得
 */
export function getAllEventTypes(): string[] {
  return Object.keys(EVENT_TYPE_TO_CATEGORY)
}
