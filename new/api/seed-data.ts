/**
 * シードデータ（テストデータ）
 *
 * ローカル開発・デモ用の初期データを一元管理する。
 * バージョンを変更するとクライアントの localStorage がリセットされる。
 */
import type { Project, Product, DesignRequest, Company, Hall, Employee, CastSchedule, MachineMaster } from "./types"

/** シードデータのスキーマバージョン。型定義やシードデータを変更したらインクリメントする */
export const SEED_VERSION = 16

// ─── Projects ───

export const SEED_PROJECTS: Project[] = [
  {
    id: 1,
    projectNumber: "PJ-001",
    projectName: "パチンコキング新宿店 - 山田 太郎",
    companyName: "キング観光株式会社",
    companyId: "CORP-001",
    hallName: "パチンコキング新宿店",
    hallId: "HALL-001",
    salesPersonName: "山田 太郎",
    requestDate: "2026/02/01",
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-02-01T09:00:00Z",
  },
  {
    id: 2,
    projectNumber: "PJ-002",
    projectName: "グランドホール渋谷 - 山田 太郎",
    companyName: "マルハン株式会社",
    companyId: "CORP-002",
    hallName: "グランドホール渋谷",
    hallId: "HALL-005",
    salesPersonName: "山田 太郎",
    requestDate: "2026/02/05",
    createdAt: "2026-02-05T10:00:00Z",
    updatedAt: "2026-02-05T10:00:00Z",
  },
  {
    id: 3,
    projectNumber: "PJ-003",
    projectName: "エスパス日拓高田馬場 - 山田 太郎",
    companyName: "日拓グループ",
    companyId: "CORP-003",
    hallName: "エスパス日拓高田馬場",
    hallId: "HALL-010",
    salesPersonName: "山田 太郎",
    requestDate: "2026/02/08",
    createdAt: "2026-02-08T11:00:00Z",
    updatedAt: "2026-02-08T11:00:00Z",
  },
  {
    id: 4,
    projectNumber: "PJ-004",
    projectName: "パチンコパーラー池袋 - 山田 太郎",
    companyName: "ダイナム株式会社",
    companyId: "CORP-004",
    hallName: "パチンコパーラー池袋",
    hallId: "HALL-020",
    salesPersonName: "山田 太郎",
    requestDate: "2026/01/25",
    createdAt: "2026-01-25T09:00:00Z",
    updatedAt: "2026-01-25T09:00:00Z",
  },
  {
    id: 5,
    projectNumber: "PJ-005",
    projectName: "メガガイア品川 - 山田 太郎",
    companyName: "ガイア株式会社",
    companyId: "CORP-005",
    hallName: "メガガイア品川",
    hallId: "HALL-030",
    salesPersonName: "山田 太郎",
    requestDate: "2026/02/10",
    createdAt: "2026-02-10T08:00:00Z",
    updatedAt: "2026-02-10T08:00:00Z",
  },
]

// ─── Products ───

export const SEED_PRODUCTS: Product[] = [
  // Product 1: トリニティガール（手配進行中 - マネジメント部用）
  {
    id: 1,
    projectId: 1,
    projectNumber: "PJ-001",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "トリニティガール 3月開催",
    eventDate: "2026/03/15",
    estimatedBillingAmount: 650000,
    proposalStatus: "proposing",
    managementConfirmationStatus: "unconfirmed",
    executionStatus: "実施前",
    companionCount: "2",
    directorCount: "1",
    mcCount: "0",
    selectedCompanions: ["佐藤 花子", "田中 美咲"],
    selectedDirectors: ["鈴木 一郎"],
    selectedMcs: [],
    companionBookingStatus: { "佐藤 花子": "tentative_completed", "田中 美咲": "tentative_completed" },
    directorBookingStatus: { "鈴木 一郎": "confirmed_completed" },
    mcBookingStatus: {},
    startTime: "10:00",
    endTime: "18:00",
    mustSeeFlag: "要",
    mustSeePublication: "要",
    publicationDate: "2026/03/10",
    reportRequired: "要",
    statusHistory: [
      { status: "提案中", timestamp: "2026-02-01T09:00:00Z", changedBy: "山田 太郎" },
      { status: "マネジメント部確認中", timestamp: "2026-02-03T10:00:00Z", changedBy: "山田 太郎" },
      { status: "仮押さえ依頼", timestamp: "2026-02-05T14:00:00Z", changedBy: "佐藤 マネージャー" },
      { status: "手配進行中", timestamp: "2026-02-07T11:00:00Z", changedBy: "佐藤 マネージャー" },
    ],
    castingCost: 180000,
    transportationFee: 25000,
    accommodationFee: 0,
    postPRCost: 15000,
    targetMachineNames: ["パチスロ北斗の拳", "バジリスク絆2"],
    pachitownMachineNames: ["P北斗の拳10", "Pバジリスク絆2天膳"],
    pachitownLinked: false,
    bannerGenerated: false,
    chatMessages: [
      { channel: "マネジメント部", author: "営業", content: "3月15日のトリニティガールの件、佐藤花子さんと田中美咲さんの仮押さえをお願いします。", timestamp: "2026-02-05T10:00:00Z" },
      { channel: "マネジメント部", author: "マネジメント部", content: "承知しました。佐藤花子さん・田中美咲さんともに仮押さえ完了しました。ディレクター鈴木一郎さんも本押さえ済みです。", timestamp: "2026-02-07T11:30:00Z" },
      { channel: "マネジメント部", author: "営業", content: "ありがとうございます！衣装はAでお願いします。", timestamp: "2026-02-07T14:00:00Z" },
    ],
  },
  // Product 2: スロセレ（イベント終了 - 外注業者用）
  {
    id: 2,
    projectId: 1,
    projectNumber: "PJ-001",
    category: "イベント",
    eventType: "スロセレ",
    eventProductName: "スロセレ 春の特別企画",
    eventDate: "2026/02/01",
    estimatedBillingAmount: 480000,
    proposalStatus: "order-received",
    managementConfirmationStatus: "approved",
    executionStatus: "終了",
    companionCount: "1",
    directorCount: "0",
    mcCount: "1",
    selectedCompanions: ["高橋 奈々"],
    selectedDirectors: [],
    selectedMcs: ["伊藤 翔太"],
    companionBookingStatus: { "高橋 奈々": "confirmed_completed" },
    directorBookingStatus: {},
    mcBookingStatus: { "伊藤 翔太": "confirmed_completed" },
    startTime: "11:00",
    endTime: "17:00",
    reportRequired: "要",
    targetMachineNames: ["スマスロ北斗の拳", "からくりサーカス"],
    pachitownMachineNames: ["Sスマスロ北斗の拳", "Sからくりサーカス"],
    pachitownLinked: true,
    pachitownLinkedDate: "2026-02-05",
    bannerGenerated: true,
    bannerData: {
      date: "2/1",
      dayOfWeek: "日曜日",
      prefecture: "東京都",
      storeName: "パチンコキング新宿店",
      targetMachines: ["Sスマスロ北斗の拳", "Sからくりサーカス"],
    },
    surveyResult: {
      satisfaction: "5",
      comment: "大変楽しいイベントでした。キャストの対応も素晴らしかったです。",
      nextEventDesired: "はい",
      improvementRequest: "もう少し長い時間開催して欲しい",
    },
    eventPhotos: ["/images/event1-photo1.jpg", "/images/event1-photo2.jpg", "/images/event1-photo3.jpg"],
    reportUploaded: true,
    reportUploadedAt: "2026-02-03T10:00:00Z",
    postEventTransactionResult: "稼働率120%達成。来場者数約500名。",
    postEventMachineData: "北斗の拳: 稼働率135%、からくりサーカス: 稼働率110%",
    statusHistory: [
      { status: "受注", timestamp: "2026-01-15T09:00:00Z", changedBy: "山田 太郎" },
      { status: "手配進行中", timestamp: "2026-01-20T10:00:00Z", changedBy: "佐藤 マネージャー" },
      { status: "イベント終了処理中", timestamp: "2026-02-02T09:00:00Z", changedBy: "システム" },
    ],
    castingCost: 120000,
    transportationFee: 15000,
    accommodationFee: 0,
    postPRCost: 10000,
    surveySent: true,
    surveySentDate: "2026-02-02",
    chatMessages: [
      { channel: "マネジメント部", author: "営業", content: "2月1日のスロセレ、MC山田太郎さんの本押さえ状況を確認したいです。", timestamp: "2026-01-20T09:00:00Z" },
      { channel: "マネジメント部", author: "マネジメント部", content: "MC山田太郎さん、本押さえ完了しています。コンパニオン高橋優子さんも確定済みです。", timestamp: "2026-01-20T11:30:00Z" },
      { channel: "外注業者", author: "営業", content: "2月1日のスロセレ、レポートのアップロードをお願いします。", timestamp: "2026-02-02T09:00:00Z" },
      { channel: "外注業者", author: "外注業者", content: "レポートをアップロードしました。稼働率データも添付しています。", timestamp: "2026-02-03T10:15:00Z" },
      { channel: "外注業者", author: "営業", content: "確認しました。事後データの入力もお願いできますか？", timestamp: "2026-02-03T14:00:00Z" },
      { channel: "外注業者", author: "外注業者", content: "入力完了しました。ご確認ください。", timestamp: "2026-02-04T11:00:00Z" },
    ],
  },
  // Product 3: 合同抽選会（受注済み - 事務管理課用）
  {
    id: 3,
    projectId: 2,
    projectNumber: "PJ-002",
    category: "ポイント",
    eventType: "合同抽選会",
    eventProductName: "春の大抽選会2026",
    eventDate: "2026/03/20",
    estimatedBillingAmount: 1200000,
    proposalStatus: "order-received",
    managementConfirmationStatus: "approved",
    companionCount: "0",
    directorCount: "0",
    mcCount: "0",
    selectedCompanions: [],
    selectedDirectors: [],
    selectedMcs: [],
    companionBookingStatus: {},
    directorBookingStatus: {},
    mcBookingStatus: {},
    executionStatus: "実施前",
    dmMailing: "yes",
    hallNames: ["グランドホール渋谷", "パチンコキング新宿店"],
    eventStartDate: "2026/03/15",
    eventEndDate: "2026/03/25",
    salesPersonId: 1,
    insightPersonId: 2,
    readingCertainty: "A" as const,
    area: "東京都",
    budget: "1200000",
    prizeInfo: [
      { rank: "特賞", name: "液晶テレビ 50インチ", quantity: "2", prizeId: "1", vendorId: "1", vendorName: "景品卸売センター" },
      { rank: "1等", name: "ダイソン掃除機", quantity: "5", prizeId: "2", vendorId: "1", vendorName: "景品卸売センター" },
      { rank: "2等", name: "任天堂Switch", quantity: "10", prizeId: "3", vendorId: "2", vendorName: "プレミアム景品" },
      { rank: "3等", name: "商品券 5000円分", quantity: "50", prizeId: "4", vendorId: "3", vendorName: "ギフトプラザ" },
      { rank: "参加賞", name: "ティッシュBOX", quantity: "500", prizeId: "5", vendorId: "1", vendorName: "景品卸売センター" },
    ],
    quoteConfig: {
      totalQuoteItems: { 1: "50000", 3: "80000", 4: "65000" },
      posterPrintQuantity: "50",
      posterPrintUnitPrice: "2000",
      dmOrderCount: "1000",
      proportionMode: "hall" as const,
      hallPercentages: { "グランドホール渋谷": 60, "パチンコキング新宿店": 40 },
      companyPercentages: {},
    },
    hallQuotes: [
      {
        hallName: "グランドホール渋谷",
        quoteItems: [
          { id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: 25000, included: true },
          { id: 2, name: "ポスター印刷", quantity: 30, unitPrice: 2000, included: true },
          { id: 3, name: "DM発送代行", quantity: 1, unitPrice: 50000, included: true },
          { id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: 40000, included: true },
        ],
        percentage: 60,
        calculatedAmount: 175000,
      },
      {
        hallName: "パチンコキング新宿店",
        quoteItems: [
          { id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: 16667, included: true },
          { id: 2, name: "ポスター印刷", quantity: 20, unitPrice: 2000, included: true },
          { id: 3, name: "DM発送代行", quantity: 1, unitPrice: 33333, included: true },
          { id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: 26667, included: true },
        ],
        percentage: 40,
        calculatedAmount: 116667,
      },
    ],
    winnerList: [
      { id: "W-001", name: "鈴木 太郎", address: "東京都渋谷区1-1-1", phone: "090-1111-1111", prize: "特賞" },
      { id: "W-002", name: "田中 花子", address: "東京都新宿区2-2-2", phone: "090-2222-2222", prize: "1等" },
      { id: "W-003", name: "佐藤 次郎", address: "東京都豊島区3-3-3", phone: "090-3333-3333", prize: "1等" },
      { id: "W-004", name: "高橋 美咲", address: "東京都港区4-4-4", phone: "090-4444-4444", prize: "2等" },
      { id: "W-005", name: "渡辺 健一", address: "東京都品川区5-5-5", phone: "090-5555-5555", prize: "2等" },
    ],
    winnerListUploadedAt: "2026-02-20T10:00:00Z",
    winnerListValidatedAt: "2026-02-20T10:05:00Z",
    notificationOrderGeneratedAt: "2026-02-21T09:00:00Z",
    notificationOrderSentAt: "2026-02-21T10:00:00Z",
    notificationOrderDesignVendorId: "V-001",
    notificationOrderDesignVendorName: "デザインスタジオA",
    prizeOrderGeneratedAt: "2026-02-22T09:00:00Z",
    prizeOrderRequestedAt: "2026-02-22T10:00:00Z",
    prizeOrdersByVendor: [
      {
        vendorId: "1",
        vendorName: "景品卸売センター",
        requestedAt: "2026-02-22T10:00:00Z",
        prizeItems: [
          { rank: "特賞", name: "液晶テレビ 50インチ", quantity: "2", prizeId: "1", vendorId: "1", vendorName: "景品卸売センター" },
          { rank: "1等", name: "ダイソン掃除機", quantity: "5", prizeId: "2", vendorId: "1", vendorName: "景品卸売センター" },
          { rank: "参加賞", name: "ティッシュBOX", quantity: "500", prizeId: "5", vendorId: "1", vendorName: "景品卸売センター" },
        ],
      },
      {
        vendorId: "2",
        vendorName: "プレミアム景品",
        requestedAt: "2026-02-22T10:00:00Z",
        prizeItems: [
          { rank: "2等", name: "任天堂Switch", quantity: "10", prizeId: "3", vendorId: "2", vendorName: "プレミアム景品" },
        ],
      },
      {
        vendorId: "3",
        vendorName: "ギフトプラザ",
        requestedAt: "2026-02-22T10:00:00Z",
        prizeItems: [
          { rank: "3等", name: "商品券 5000円分", quantity: "50", prizeId: "4", vendorId: "3", vendorName: "ギフトプラザ" },
        ],
      },
    ],
    quoCardLetterCheckedAt: undefined,
    prizeDeliveryInfoByVendor: [
      {
        vendorId: "1",
        vendorName: "景品卸売センター",
        deliveredAt: "2026-03-01T14:00:00Z",
        carrierName: "ヤマト運輸",
        trackingNumber: "1234-5678-9012",
        shippedAt: "2026-02-28T10:00:00Z",
        deliveries: [
          { winnerId: "W-001", winnerName: "鈴木 太郎", carrierName: "ヤマト運輸", trackingNumber: "T-001", shippedAt: "2026-02-28T10:00:00Z" },
          { winnerId: "W-002", winnerName: "田中 花子", carrierName: "ヤマト運輸", trackingNumber: "T-002", shippedAt: "2026-02-28T10:00:00Z" },
        ],
      },
    ],
  },
  // Product 4: トリニティガール（イベント終了済み - マネジメント部用）
  {
    id: 4,
    projectId: 3,
    projectNumber: "PJ-003",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "トリニティガール GW特別イベント",
    eventDate: "2026/01/20",
    estimatedBillingAmount: 720000,
    proposalStatus: "order-received",
    managementConfirmationStatus: "approved",
    executionStatus: "終了",
    companionCount: "2",
    directorCount: "1",
    mcCount: "0",
    selectedCompanions: ["佐藤 花子", "小林 愛"],
    selectedDirectors: ["鈴木 一郎"],
    selectedMcs: [],
    companionBookingStatus: { "佐藤 花子": "confirmed_completed", "小林 愛": "confirmed_completed" },
    directorBookingStatus: { "鈴木 一郎": "confirmed_completed" },
    mcBookingStatus: {},
    startTime: "10:00",
    endTime: "18:00",
    reportRequired: "要",
    mustSeePublication: "不要",
    statusHistory: [
      { status: "受注", timestamp: "2026-01-05T09:00:00Z", changedBy: "山田 太郎" },
      { status: "手配進行中", timestamp: "2026-01-10T10:00:00Z", changedBy: "佐藤 マネージャー" },
      { status: "イベント終了処理中", timestamp: "2026-01-21T09:00:00Z", changedBy: "システム" },
    ],
    castingCost: 220000,
    transportationFee: 30000,
    accommodationFee: 15000,
    postPRCost: 20000,
    surveySent: true,
    surveySentDate: "2026-01-21",
    surveyResult: {
      satisfaction: "4",
      comment: "良いイベントでした。次回も開催希望です。",
      nextEventDesired: "はい",
    },
  },
  // Product 5: トリニティガール（マネジメント部確認中 - 確認フロー用）
  // キャスト名は SEED_COMPANIONS / SEED_DIRECTORS の名前を使用（プロダクション紐付け）
  {
    id: 5,
    projectId: 4,
    projectNumber: "PJ-004",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "トリニティガール 2月開催",
    eventDate: "2026/02/20",
    estimatedBillingAmount: 550000,
    proposalStatus: "before-proposal",
    managementConfirmationStatus: "revision-requested",
    executionStatus: "実施前",
    companionCount: "3",
    directorCount: "1",
    mcCount: "0",
    selectedCompanions: ["Rio", "Ayaka", "Nanaka"],
    selectedDirectors: ["Takeshi"],
    selectedMcs: [],
    companionBookingStatus: { "Rio": "tentative_requesting", "Ayaka": "tentative_requesting", "Nanaka": "confirmed_requesting" },
    directorBookingStatus: { "Takeshi": "tentative_requesting" },
    mcBookingStatus: {},
    startTime: "10:00",
    endTime: "17:00",
    mustSeeFlag: "要",
    reportRequired: "要",
    comments: [
      { author: "マネジメント部", content: "コンパニオンの人数を3名から2名に変更してください。予算の都合上、ディレクターも不要です。", timestamp: "2026-02-06T14:00:00Z" },
    ],
    statusHistory: [
      { status: "提案中", timestamp: "2026-02-01T09:00:00Z", changedBy: "山田 太郎" },
      { status: "マネジメント部確認中", timestamp: "2026-02-05T10:00:00Z", changedBy: "山田 太郎" },
    ],
    targetMachineNames: ["エヴァンゲリオン", "リゼロ"],
  },
  // Product 6: スロセレ（仮押さえ依頼中 - マネジメント部・外注業者用）
  {
    id: 6,
    projectId: 5,
    projectNumber: "PJ-005",
    category: "イベント",
    eventType: "スロセレ",
    eventProductName: "スロセレ 3月イベント",
    eventDate: "2026/03/25",
    estimatedBillingAmount: 420000,
    proposalStatus: "before-proposal",
    managementConfirmationStatus: "unconfirmed",
    executionStatus: "実施前",
    companionCount: "1",
    directorCount: "0",
    mcCount: "0",
    selectedCompanions: ["高橋 みゆき"],
    selectedDirectors: [],
    selectedMcs: [],
    companionBookingStatus: { "高橋 みゆき": "tentative_requesting" },
    directorBookingStatus: {},
    mcBookingStatus: {},
    startTime: "11:00",
    endTime: "17:00",
    reportRequired: "要",
    temporaryHoldFailureComment: "高橋 みゆきさんは3/25に別案件の本押さえが入っているため、仮押さえできません。代替のキャストをご検討ください。",
    statusHistory: [
      { status: "仮押さえ依頼", timestamp: "2026-02-10T09:00:00Z", changedBy: "山田 太郎" },
    ],
    targetMachineNames: ["ジャグラー", "マイジャグラーV"],
  },
  // Product 7: トリニティガール（受注・実施前 - 各種手配タブ用）
  {
    id: 7,
    projectId: 1,
    projectNumber: "PJ-001",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "トリニティガール 4月開催",
    eventDate: "2026/04/10",
    estimatedBillingAmount: 700000,
    proposalStatus: "order-received",
    managementConfirmationStatus: "under-review",
    executionStatus: "実施前",
    companionCount: "2",
    directorCount: "1",
    mcCount: "0",
    selectedCompanions: ["山田 花子", "佐藤 美咲"],
    selectedDirectors: ["Kenji"],
    selectedMcs: [],
    companionBookingStatus: { "山田 花子": "confirmed_completed", "佐藤 美咲": "confirmed_completed" },
    directorBookingStatus: { "Kenji": "confirmed_completed" },
    mcBookingStatus: {},
    startTime: "10:00",
    endTime: "18:00",
    mustSeePublication: "要",
    reportRequired: "要",
    statusHistory: [
      { status: "受注", timestamp: "2026-02-15T09:00:00Z", changedBy: "山田 太郎" },
      { status: "キャスト手配完了", timestamp: "2026-02-20T10:00:00Z", changedBy: "マネジメント部" },
    ],
    targetMachineNames: ["パチスロ北斗の拳", "バジリスク絆2"],
    pachitownMachineNames: ["P北斗の拳10", "Pバジリスク絆2天膳"],
    pachitownLinked: false,
    bannerGenerated: false,
  },
  // Product 8: スロセレ（受注・実施前 - 各種手配タブ用）
  {
    id: 8,
    projectId: 5,
    projectNumber: "PJ-005",
    category: "イベント",
    eventType: "スロセレ",
    eventProductName: "スロセレ 4月特別開催",
    eventDate: "2026/04/20",
    estimatedBillingAmount: 380000,
    proposalStatus: "order-received",
    managementConfirmationStatus: "approved",
    executionStatus: "実施前",
    companionCount: "0",
    directorCount: "1",
    mcCount: "1",
    selectedCompanions: [],
    selectedDirectors: ["Kenji"],
    selectedMcs: ["山田太郎MC"],
    companionBookingStatus: {},
    directorBookingStatus: { "Kenji": "confirmed_completed" },
    mcBookingStatus: { "山田太郎MC": "confirmed_completed" },
    startTime: "12:00",
    endTime: "18:00",
    reportRequired: "要",
    targetMachineFormSent: false,
    statusHistory: [
      { status: "受注", timestamp: "2026-03-01T09:00:00Z", changedBy: "佐藤 次郎" },
      { status: "キャスト手配完了", timestamp: "2026-03-10T10:00:00Z", changedBy: "マネジメント部" },
    ],
    targetMachineNames: ["ジャグラー", "マイジャグラーV", "ハナハナ"],
  },
]

// ─── Design Requests ───

export const SEED_DESIGN_REQUESTS: DesignRequest[] = [
  {
    id: "DR-001",
    requestType: "poster",
    projectId: 3,
    projectNumber: "PJ-002",
    projectName: "春の大抽選会2026",
    companyName: "マルハン株式会社",
    hallNames: ["グランドホール渋谷", "パチンコキング新宿店"],
    eventStartDate: "2026/03/15",
    eventEndDate: "2026/03/25",
    status: "uploaded",
    vendorId: "V-001",
    vendorName: "デザインスタジオA",
    requestedAt: "2026-02-10T10:00:00Z",
    requestedBy: "EMP-001",
    requestedByName: "山田 太郎",
    uploadedAt: "2026-02-12T15:00:00Z",
    uploadedFileName: "poster_v1.pdf",
    comments: [
      { id: "C-001", text: "ポスターデザインをお願いします。赤を基調としたデザインでお願いします。", role: "Sales", authorName: "山田 太郎", createdAt: "2026-02-10T10:05:00Z" },
      { id: "C-002", text: "承知しました。2日以内に初稿をアップロードします。", role: "DesignVendor", authorName: "デザインスタジオA", createdAt: "2026-02-10T11:00:00Z" },
      { id: "C-003", text: "初稿をアップロードしました。ご確認ください。", role: "DesignVendor", authorName: "デザインスタジオA", createdAt: "2026-02-12T15:00:00Z" },
    ],
  },
  {
    id: "DR-002",
    requestType: "dm",
    projectId: 3,
    projectNumber: "PJ-002",
    projectName: "春の大抽選会2026",
    companyName: "マルハン株式会社",
    hallNames: ["グランドホール渋谷", "パチンコキング新宿店"],
    eventStartDate: "2026/03/15",
    eventEndDate: "2026/03/25",
    status: "requested",
    vendorId: "V-001",
    vendorName: "デザインスタジオA",
    requestedAt: "2026-02-11T09:00:00Z",
    requestedBy: "EMP-001",
    requestedByName: "山田 太郎",
    comments: [
      { id: "C-004", text: "DM用デザインをお願いします。ポスターと統一感のあるデザインで。", role: "Sales", authorName: "山田 太郎", createdAt: "2026-02-11T09:05:00Z" },
    ],
  },
  {
    id: "DR-003",
    requestType: "winner-list",
    projectId: 3,
    projectNumber: "PJ-002",
    projectName: "春の大抽選会2026",
    companyName: "マルハン株式会社",
    hallNames: ["グランドホール渋谷", "パチンコキング新宿店"],
    eventStartDate: "2026/03/15",
    eventEndDate: "2026/03/25",
    status: "requested",
    vendorId: "V-002",
    vendorName: "デザインスタジオB",
    requestedAt: "2026-02-21T10:00:00Z",
    requestedBy: "EMP-003",
    requestedByName: "田中 三郎",
  },
]

// ─── Companies ───

export const SEED_COMPANIES: Company[] = [
  { id: 1, companyId: "CORP-001", name: "キング観光株式会社" },
  { id: 2, companyId: "CORP-002", name: "マルハン株式会社" },
  { id: 3, companyId: "CORP-003", name: "日拓グループ" },
  { id: 4, companyId: "CORP-004", name: "ダイナム株式会社" },
  { id: 5, companyId: "CORP-005", name: "ガイア株式会社" },
]

// ─── Halls ───

export const SEED_HALLS: Hall[] = [
  { id: 1, hallId: "HALL-001", name: "パチンコキング新宿店", salesPersonName: "山田 太郎", companyId: 1, address: "東京都新宿区01-1-1" },
  { id: 2, hallId: "HALL-005", name: "グランドホール渋谷", salesPersonName: "山田 太郎", companyId: 2, address: "東京都渋谷区05-1-1" },
  { id: 3, hallId: "HALL-010", name: "エスパス日拓高田馬場", salesPersonName: "山田 太郎", companyId: 3, address: "東京都豊島区10-1-1" },
  { id: 4, hallId: "HALL-020", name: "パチンコパーラー池袋", salesPersonName: "山田 太郎", companyId: 4, address: "東京都豊島区20-1-1" },
  { id: 5, hallId: "HALL-030", name: "メガガイア品川", salesPersonName: "山田 太郎", companyId: 5, address: "東京都港区30-1-1" },
]

// ─── Employees ───

export const SEED_EMPLOYEES: Employee[] = [
  { id: 1, name: "山田 太郎", department: "営業部" },
  { id: 2, name: "佐藤 次郎", department: "営業部" },
  { id: 3, name: "田中 三郎", department: "管理部" },
]

// ─── Productions (プロダクション/所属事務所) ───

export type SeedProduction = {
  id: number
  name: string
  address: string
}

export const SEED_PRODUCTIONS: SeedProduction[] = [
  { id: 1, name: "プロダクションA", address: "東京都渋谷区1-1-1" },
  { id: 2, name: "プロダクションB", address: "東京都新宿区2-2-2" },
  { id: 3, name: "プロダクションC", address: "東京都豊島区3-3-3" },
]

// ─── Cast Members (Companions) ───

export type SeedCastMember = {
  id: number
  name: string
  isExclusive: boolean
  hourlyRate: number
  productionId?: number
  size?: string
}

export const SEED_COMPANIONS: SeedCastMember[] = [
  { id: 1, name: "Rio", isExclusive: true, hourlyRate: 5000, productionId: 1, size: "S" },
  { id: 2, name: "Ayaka", isExclusive: true, hourlyRate: 5500, productionId: 1, size: "M" },
  { id: 3, name: "Nanaka", isExclusive: true, hourlyRate: 5200, productionId: 2, size: "M" },
  { id: 4, name: "山田 花子", isExclusive: false, hourlyRate: 6000, productionId: 3, size: "L" },
  { id: 5, name: "佐藤 美咲", isExclusive: false, hourlyRate: 5800, productionId: 3, size: "M" },
  { id: 6, name: "鈴木 さくら", isExclusive: false, hourlyRate: 6200, productionId: 3, size: "S" },
  { id: 7, name: "高橋 みゆき", isExclusive: false, hourlyRate: 5900, productionId: 2, size: "M" },
  { id: 8, name: "伊藤 あかり", isExclusive: false, hourlyRate: 6100, productionId: 1, size: "L" },
]

// ─── Cast Members (Directors) ───

export const SEED_DIRECTORS: SeedCastMember[] = [
  { id: 1, name: "Takeshi", isExclusive: true, hourlyRate: 8000 },
  { id: 2, name: "Kenji", isExclusive: true, hourlyRate: 8500 },
  { id: 3, name: "Hiroshi", isExclusive: true, hourlyRate: 8200 },
  { id: 4, name: "田中 ディレクター", isExclusive: false, hourlyRate: 9000 },
  { id: 5, name: "佐藤 ディレクター", isExclusive: false, hourlyRate: 8800 },
  { id: 6, name: "鈴木 ディレクター", isExclusive: false, hourlyRate: 9200 },
  { id: 7, name: "高橋 ディレクター", isExclusive: false, hourlyRate: 8900 },
  { id: 8, name: "伊藤 ディレクター", isExclusive: false, hourlyRate: 9100 },
]

// ─── Event Base Fees ───

export const SEED_EVENT_BASE_FEES: Record<string, number> = {
  "トリニティガール": 100000,
  "スロセレ": 70000,
}

// ─── Machine Masters (機種マスタ) ───

export const SEED_MACHINE_MASTERS: MachineMaster[] = [
  { id: 1, name: "パチスロ北斗の拳", pachitownName: "P北斗の拳10" },
  { id: 2, name: "バジリスク絆2", pachitownName: "Pバジリスク絆2天膳" },
  { id: 3, name: "スマスロ北斗の拳", pachitownName: "Sスマスロ北斗の拳" },
  { id: 4, name: "からくりサーカス", pachitownName: "Sからくりサーカス" },
  { id: 5, name: "エヴァンゲリオン", pachitownName: "Pエヴァンゲリオン15" },
  { id: 6, name: "リゼロ", pachitownName: "Sリゼロ鬼がかり" },
  { id: 7, name: "ジャグラー", pachitownName: "Sマイジャグラー5" },
  { id: 8, name: "マイジャグラーV", pachitownName: "SマイジャグラーV" },
]

// ─── Design Vendors (デザイン業者マスタ) ───

export const SEED_DESIGN_VENDORS = [
  { id: "V-001", name: "デザインスタジオA" },
  { id: "V-002", name: "デザインスタジオB" },
]

// ─── Prize Vendors (景品業者マスタ) ───

export const SEED_PRIZE_VENDORS = [
  { id: "1", name: "景品卸売センター" },
  { id: "2", name: "プレミアム景品" },
  { id: "3", name: "ギフトプラザ" },
]

// ─── Cast Schedules（キャスト予定データ） ───

export const SEED_CAST_SCHEDULES: CastSchedule[] = [
  {
    castName: "Rio",
    role: "companion",
    items: [
      { dayOfWeek: 1, startTime: "10:00", endTime: "13:00", holdType: "tentative", nominated: true },
      { dayOfWeek: 3, startTime: "14:00", endTime: "17:00", holdType: "confirmed", nominated: false },
      { dayOfWeek: 5, startTime: "15:00", endTime: "18:00", holdType: "confirmed", nominated: true },
    ],
  },
  {
    castName: "Ayaka",
    role: "companion",
    items: [
      { dayOfWeek: 2, startTime: "11:00", endTime: "14:00", holdType: "tentative", nominated: false },
      { dayOfWeek: 4, startTime: "13:00", endTime: "16:00", holdType: "confirmed", nominated: true },
      { dayOfWeek: 6, startTime: "10:00", endTime: "13:00", holdType: "confirmed", nominated: false },
    ],
  },
  {
    castName: "Nanaka",
    role: "companion",
    items: [
      { dayOfWeek: 1, startTime: "9:00", endTime: "12:00", holdType: "confirmed", nominated: false },
      { dayOfWeek: 3, startTime: "13:00", endTime: "17:00", holdType: "tentative", nominated: true },
      { dayOfWeek: 5, startTime: "14:00", endTime: "18:00", holdType: "confirmed", nominated: true },
    ],
  },
  {
    castName: "Takeshi",
    role: "director",
    items: [
      { dayOfWeek: 1, startTime: "9:00", endTime: "12:00", holdType: "confirmed", nominated: false },
      { dayOfWeek: 2, startTime: "14:00", endTime: "17:00", holdType: "confirmed", nominated: true },
      { dayOfWeek: 3, startTime: "10:00", endTime: "13:00", holdType: "tentative", nominated: false },
    ],
  },
  {
    castName: "Kenji",
    role: "director",
    items: [
      { dayOfWeek: 4, startTime: "13:00", endTime: "16:00", holdType: "tentative", nominated: true },
      { dayOfWeek: 6, startTime: "11:00", endTime: "14:00", holdType: "confirmed", nominated: true },
    ],
  },
  {
    castName: "Hiroshi",
    role: "director",
    items: [
      { dayOfWeek: 2, startTime: "13:00", endTime: "16:00", holdType: "confirmed", nominated: false },
      { dayOfWeek: 5, startTime: "14:00", endTime: "17:00", holdType: "tentative", nominated: false },
    ],
  },
]
