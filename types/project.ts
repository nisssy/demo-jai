export type Role = "Sales" | "Internal" | "ProductManagement" | "OutsourcingVendor"

export type ProjectData = {
  projectName: string
  clientName: string
  date: string
  venue: string
  talent: string
  talentStatus: "available" | "tentative" | "busy"
  quoteItems: Array<{ item: string; amount: number; subitems?: Array<{ item: string; amount: number }> }>
  emailDraft: string
  contractAmount: string
  billingAddress: string
  status: "proposed" | "ordered" | "confirmed"
  validationErrors: string[]
  correctionRequest: string
  projects?: Array<{
    id: number
    projectNumber?: string
    projectName: string
    clientName: string
    date: string
    venue: string
    talent: string
    estimateAmount: string
    status: "proposed" | "ordered"
    salesPersonName?: string
    requestDate?: string
    hallName?: string
    hallId?: string
    companyId?: string
    companyName?: string
    projectStatus?: string
    category?: string
    eventType?: string
    eventProductName?: string
    eventDate?: string
    estimatedBillingAmount?: number
    startTime?: string
    endTime?: string
    companionCount?: string
    directorCount?: string
    mcCount?: string
    selectedCompanions?: string[]
    selectedDirectors?: string[]
    selectedMcs?: string[]
    /** キャストごとのブッキング状態（商材の実施期間に対する 仮押さえ依頼/仮押さえ/本押さえ依頼/本押さえ） */
    companionBookingStatus?: Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
    directorBookingStatus?: Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
    mcBookingStatus?: Record<string, "pending" | "tentative" | "confirmed_request" | "confirmed">
    /** キャストごとの「仮押さえ不可」理由（入っているキャストは仮押さえ不可扱い） */
    companionTentativeHoldFailureComment?: Record<string, string>
    directorTentativeHoldFailureComment?: Record<string, string>
    mcTentativeHoldFailureComment?: Record<string, string>
    correctionComment?: string
    temporaryHoldFailureComment?: string
    confirmedCompanions?: string[]
    confirmedDirectors?: string[]
    confirmedMcs?: string[]
    companionCostumes?: { [companionName: string]: string }
    mustSeeFlag?: string
    mustSeePublication?: string // 必見掲載 (要か不要)
    publicationDate?: string // 掲載日
    publicationTime?: string // 掲載時刻
    reportRequired?: string // レポート要否 (要か不要)
    pachitownLinked?: boolean
    pachitownLinkedDate?: string
    xAccountPostText?: string
    surveySent?: boolean
    surveySentDate?: string
    surveyResult?: {
      satisfaction?: string
      comment?: string
      nextEventDesired?: string
    }
    castingCost?: number
    transportationFee?: number
    accommodationFee?: number
    postPRCost?: number
    isTransportationAutoFilled?: boolean
    isAccommodationAutoFilled?: boolean
    correctionRequest?: string
    // 見積書作成モーダルで保存するデモ用フィールド
    quoteGenerated?: boolean
    quoteData?: ProjectData
    /** バナー画像を作成済み（パチタウン連携はこの後に実行） */
    bannerGenerated?: boolean
    /** 作成したバナーの内容（プレビュー表示用） */
    bannerData?: {
      date: string
      dayOfWeek: string
      prefecture: string
      storeName: string
      targetMachines: string[]
    }
    /** 顧客が専用フォームで入力した対象機種（スロット機種名・複数可） */
    targetMachineNames?: string[]
    /** 機種マスタで変換したパチタウン用機種名 */
    pachitownMachineNames?: string[]
    /** イベント終了後の写真（URLやID、外注業者が参照） */
    eventPhotos?: string[]
    /** レポートアップロード済み（外注業者が作成・アップロード） */
    reportUploaded?: boolean
    reportUploadedAt?: string
    /** レポートメモ（デモ用） */
    reportNote?: string
    /** 事後データ：取引結果（外注業者が入力、商材に反映） */
    postEventTransactionResult?: string
    /** 事後データ：機種別データ（外注業者が入力、商材に反映） */
    postEventMachineData?: string
    /** ステータス変更履歴 */
    statusHistory?: Array<{
      status: string
      timestamp: string
      changedBy?: string
      note?: string
    }>
  }>
}

