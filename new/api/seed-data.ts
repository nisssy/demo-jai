/**
 * シードデータ（テストデータ）
 *
 * ローカル開発・デモ用の初期データを一元管理する。
 * バージョンを変更するとクライアントの localStorage がリセットされる。
 */
import type { Project, Product, DesignRequest, MonthlyBilling, Company, Hall, Employee, CastSchedule, MachineMaster } from "./types"

/** シードデータのスキーマバージョン。型定義やシードデータを変更したらインクリメントする */
export const SEED_VERSION = 31

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
  {
    id: 6,
    projectNumber: "PJ-006",
    projectName: "パチンコパーラー池袋 - 田中 三郎",
    companyName: "ダイナム株式会社",
    companyId: "CORP-004",
    hallName: "パチンコパーラー池袋",
    hallId: "HALL-020",
    salesPersonName: "田中 三郎",
    requestDate: "2026/02/15",
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-02-15T09:00:00Z",
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
      { channel: "BS・CS", author: "営業", content: "3月15日のトリニティガールの件、佐藤花子さんと田中美咲さんの仮押さえをお願いします。", timestamp: "2026-02-05T10:00:00Z" },
      { channel: "BS・CS", author: "BS・CS", content: "承知しました。佐藤花子さん・田中美咲さんともに仮押さえ完了しました。ディレクター鈴木一郎さんも本押さえ済みです。", timestamp: "2026-02-07T11:30:00Z" },
      { channel: "BS・CS", author: "営業", content: "ありがとうございます！衣装はAでお願いします。", timestamp: "2026-02-07T14:00:00Z" },
    ],
  },
  // Product 2: スロセレ（イベント終了）
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
    postEventReport: {
      slot20Count: "120",
      slot20TotalDiff: "+45000",
      slot20AvgGames: "8500",
      slot20AvgDiff: "+375",
      machineReports: [
        { machineName: "スマスロ北斗の拳", count: "8", avgGames: "9200", avgDiff: "+520" },
        { machineName: "からくりサーカス", count: "6", avgGames: "7800", avgDiff: "+210" },
      ],
      uploadedAt: "2026-02-03",
    },
    postEventPachitownLinked: true,
    postEventPachitownLinkedDate: "2026-02-05",
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
      { channel: "BS・CS", author: "営業", content: "2月1日のスロセレ、MC山田太郎さんの本押さえ状況を確認したいです。", timestamp: "2026-01-20T09:00:00Z" },
      { channel: "BS・CS", author: "BS・CS", content: "MC山田太郎さん、本押さえ完了しています。コンパニオン高橋優子さんも確定済みです。", timestamp: "2026-01-20T11:30:00Z" },
      { channel: "商材管理課", author: "商材管理課", content: "スロセレ春の特別企画のレポート提出をお願いします。期限は2/10です。", timestamp: "2026-02-03T09:00:00Z" },
      { channel: "商材管理課", author: "外注業者", content: "承知しました。2/8までにアップロードいたします。", timestamp: "2026-02-03T10:30:00Z" },
      { channel: "商材管理課", author: "商材管理課", content: "ありがとうございます。事後データの入力もよろしくお願いします。", timestamp: "2026-02-03T11:00:00Z" },
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
      { rank: "特賞", name: "液晶テレビ 50インチ", quantity: "1", unitPrice: 80000, prizeId: "1", vendorId: "1", vendorName: "景品卸売センター" },
      { rank: "1等", name: "ダイソン掃除機", quantity: "2", unitPrice: 45000, prizeId: "2", vendorId: "1", vendorName: "景品卸売センター" },
      { rank: "2等", name: "任天堂Switch", quantity: "3", unitPrice: 35000, prizeId: "3", vendorId: "2", vendorName: "プレミアム景品" },
      { rank: "3等", name: "商品券 5000円分", quantity: "5", unitPrice: 5000, prizeId: "4", vendorId: "3", vendorName: "ギフトプラザ" },
      { rank: "参加賞", name: "ティッシュBOX", quantity: "10", unitPrice: 100, prizeId: "5", vendorId: "1", vendorName: "景品卸売センター" },
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
      // 特賞: 液晶テレビ 50インチ × 1 (vendor 1)
      { id: "1", name: "鈴木 太郎", address: "東京都渋谷区神南1-1-1", phone: "090-1111-1111", prize: "液晶テレビ 50インチ" },
      // 1等: ダイソン掃除機 × 2 (vendor 1)
      { id: "2", name: "田中 花子", address: "東京都新宿区西新宿2-2-2", phone: "090-2222-2222", prize: "ダイソン掃除機" },
      { id: "3", name: "佐藤 次郎", address: "東京都豊島区東池袋3-3-3", phone: "090-3333-3333", prize: "ダイソン掃除機" },
      // 2等: 任天堂Switch × 3 (vendor 2)
      { id: "4", name: "高橋 美咲", address: "東京都港区六本木4-4-4", phone: "090-4444-4444", prize: "任天堂Switch" },
      { id: "5", name: "渡辺 健一", address: "東京都品川区大崎5-5-5", phone: "090-5555-5555", prize: "任天堂Switch" },
      { id: "6", name: "伊藤 さくら", address: "神奈川県横浜市中区本町6-6-6", phone: "090-6666-6666", prize: "任天堂Switch" },
      // 3等: 商品券 5000円分 × 5 (vendor 3)
      { id: "7", name: "山本 大輔", address: "千葉県千葉市中央区7-7-7", phone: "090-7777-7777", prize: "商品券 5000円分" },
      { id: "8", name: "中村 優子", address: "埼玉県さいたま市浦和区8-8-8", phone: "090-8888-8888", prize: "商品券 5000円分" },
      { id: "9", name: "小林 誠", address: "東京都中央区銀座9-9-9", phone: "090-9999-9999", prize: "商品券 5000円分" },
      { id: "10", name: "加藤 麻衣", address: "東京都目黒区自由が丘10-10", phone: "090-1010-1010", prize: "商品券 5000円分" },
      { id: "11", name: "吉田 翔太", address: "東京都世田谷区三軒茶屋11-11", phone: "090-1100-1100", prize: "商品券 5000円分" },
      // 参加賞: ティッシュBOX × 10 (vendor 1)
      { id: "12", name: "松本 由美", address: "東京都文京区本郷12-12", phone: "080-1212-1212", prize: "ティッシュBOX" },
      { id: "13", name: "井上 拓也", address: "東京都台東区上野13-13", phone: "080-1313-1313", prize: "ティッシュBOX" },
      { id: "14", name: "木村 恵子", address: "東京都北区赤羽14-14", phone: "080-1414-1414", prize: "ティッシュBOX" },
      { id: "15", name: "林 浩二", address: "東京都板橋区板橋15-15", phone: "080-1515-1515", prize: "ティッシュBOX" },
      { id: "16", name: "斎藤 美穂", address: "東京都練馬区練馬16-16", phone: "080-1616-1616", prize: "ティッシュBOX" },
      { id: "17", name: "清水 圭介", address: "東京都江東区豊洲17-17", phone: "080-1717-1717", prize: "ティッシュBOX" },
      { id: "18", name: "山田 香織", address: "東京都大田区蒲田18-18", phone: "080-1818-1818", prize: "ティッシュBOX" },
      { id: "19", name: "阿部 雄大", address: "東京都杉並区高円寺19-19", phone: "080-1919-1919", prize: "ティッシュBOX" },
      { id: "20", name: "森 真理子", address: "東京都墨田区錦糸町20-20", phone: "080-2020-2020", prize: "ティッシュBOX" },
      { id: "21", name: "池田 修平", address: "東京都荒川区西日暮里21-21", phone: "080-2121-2121", prize: "ティッシュBOX" },
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
        desiredDeliveryDate: "2026-03-10",
        prizeItems: [
          { rank: "特賞", name: "液晶テレビ 50インチ", quantity: "1", unitPrice: 80000, prizeId: "1", vendorId: "1", vendorName: "景品卸売センター" },
          { rank: "1等", name: "ダイソン掃除機", quantity: "2", unitPrice: 45000, prizeId: "2", vendorId: "1", vendorName: "景品卸売センター" },
          { rank: "参加賞", name: "ティッシュBOX", quantity: "10", unitPrice: 100, prizeId: "5", vendorId: "1", vendorName: "景品卸売センター" },
        ],
      },
      {
        vendorId: "2",
        vendorName: "プレミアム景品",
        requestedAt: "2026-02-22T10:00:00Z",
        desiredDeliveryDate: "2026-03-10",
        prizeItems: [
          { rank: "2等", name: "任天堂Switch", quantity: "3", unitPrice: 35000, prizeId: "3", vendorId: "2", vendorName: "プレミアム景品" },
        ],
      },
      {
        vendorId: "3",
        vendorName: "ギフトプラザ",
        requestedAt: "2026-02-22T10:00:00Z",
        desiredDeliveryDate: "2026-03-10",
        prizeItems: [
          { rank: "3等", name: "商品券 5000円分", quantity: "5", unitPrice: 5000, prizeId: "4", vendorId: "3", vendorName: "ギフトプラザ" },
        ],
      },
    ],
    quoCardLetterCheckedAt: undefined,
    prizeDeliveryInfoByVendor: [
      {
        vendorId: "1",
        vendorName: "景品卸売センター",
        deliveries: [
          // 特賞 × 1
          { winnerId: "1", winnerName: "鈴木 太郎", carrierName: "ヤマト運輸", trackingNumber: "T-0001", shippedAt: "2026-02-28", deliveredAt: "2026-03-01" },
          // 1等 × 2
          { winnerId: "2", winnerName: "田中 花子", carrierName: "ヤマト運輸", trackingNumber: "T-0002", shippedAt: "2026-02-28", deliveredAt: "2026-03-01" },
          { winnerId: "3", winnerName: "佐藤 次郎", carrierName: "ヤマト運輸", trackingNumber: "T-0003", shippedAt: "2026-02-28" },
          // 参加賞 × 10（一部のみ入力済み）
          { winnerId: "12", winnerName: "松本 由美", carrierName: "佐川急便", trackingNumber: "S-0001", shippedAt: "2026-03-02", deliveredAt: "2026-03-03" },
          { winnerId: "13", winnerName: "井上 拓也", carrierName: "佐川急便", trackingNumber: "S-0002", shippedAt: "2026-03-02" },
        ],
      },
    ],
    chatMessages: [
      { channel: "poster", author: "営業", content: "ポスターデザインをお願いします。赤を基調としたデザインでお願いします。", timestamp: "2026-02-10T10:05:00Z" },
      { channel: "poster", author: "デザインスタジオA", content: "承知しました。2日以内に初稿をアップロードします。", timestamp: "2026-02-10T11:00:00Z" },
      { channel: "poster", author: "デザインスタジオA", content: "初稿をアップロードしました。ご確認ください。", timestamp: "2026-02-12T15:00:00Z" },
      { channel: "dm", author: "営業", content: "DM用デザインをお願いします。ポスターと統一感のあるデザインで。", timestamp: "2026-02-11T09:05:00Z" },
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
  // Product 6: スロセレ（仮押さえ依頼中 - マネジメント部用）
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
    targetMachineFormSent: true,
    targetMachineNames: ["ジャグラー", "マイジャグラーV"],
    pachitownMachineNames: ["Sマイジャグラー5", "SマイジャグラーV"],
    threeSetPlan: true,
  },
  // Product 10: スロセレ 3点セット 3月第1週（PJ-005）
  {
    id: 10,
    projectId: 5,
    projectNumber: "PJ-005",
    category: "イベント",
    eventType: "スロセレ",
    eventProductName: "スロセレ 3月第1週",
    eventDate: "2026/03/04",
    estimatedBillingAmount: 380000,
    proposalStatus: "order-received",
    managementConfirmationStatus: "approved",
    executionStatus: "実施前",
    companionCount: "1",
    directorCount: "0",
    mcCount: "0",
    selectedCompanions: ["鈴木 さくら"],
    selectedDirectors: [],
    selectedMcs: [],
    companionBookingStatus: { "鈴木 さくら": "confirmed_completed" },
    directorBookingStatus: {},
    mcBookingStatus: {},
    startTime: "11:00",
    endTime: "17:00",
    reportRequired: "要",
    targetMachineFormSent: true,
    targetMachineNames: ["スマスロ北斗の拳", "エヴァンゲリオン"],
    threeSetPlan: true,
  },
  // Product 11: スロセレ 3点セット 3月第2週（PJ-005）
  {
    id: 11,
    projectId: 5,
    projectNumber: "PJ-005",
    category: "イベント",
    eventType: "スロセレ",
    eventProductName: "スロセレ 3月第2週",
    eventDate: "2026/03/11",
    estimatedBillingAmount: 380000,
    proposalStatus: "order-received",
    managementConfirmationStatus: "approved",
    executionStatus: "実施前",
    companionCount: "1",
    directorCount: "0",
    mcCount: "0",
    selectedCompanions: ["伊藤 あかり"],
    selectedDirectors: [],
    selectedMcs: [],
    companionBookingStatus: { "伊藤 あかり": "confirmed_completed" },
    directorBookingStatus: {},
    mcBookingStatus: {},
    startTime: "11:00",
    endTime: "17:00",
    reportRequired: "要",
    targetMachineFormSent: true,
    targetMachineNames: ["リゼロ", "ハナハナ"],
    threeSetPlan: true,
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
  },
  // Product 9: スロセレ（実施中 - 商材管理課 実施中タブ + 外注業者 中間レポート用）
  {
    id: 9,
    projectId: 4,
    projectNumber: "PJ-004",
    category: "イベント",
    eventType: "スロセレ",
    eventProductName: "スロセレ 2月中旬イベント",
    eventDate: "2026/02/15",
    estimatedBillingAmount: 350000,
    proposalStatus: "order-received",
    managementConfirmationStatus: "approved",
    executionStatus: "実施中",
    companionCount: "1",
    directorCount: "0",
    mcCount: "0",
    selectedCompanions: ["鈴木 さくら"],
    selectedDirectors: [],
    selectedMcs: [],
    companionBookingStatus: { "鈴木 さくら": "confirmed_completed" },
    directorBookingStatus: {},
    mcBookingStatus: {},
    startTime: "11:00",
    endTime: "17:00",
    reportRequired: "要",
    targetMachineFormSent: true,
    targetMachineNames: ["ハナハナ", "ジャグラー"],
    pachitownMachineNames: ["Sハナハナホウオウ天翔", "Sマイジャグラー5"],
    pachitownLinked: true,
    pachitownLinkedDate: "2026-02-12",
    bannerGenerated: true,
    bannerData: {
      date: "2/15",
      dayOfWeek: "日曜日",
      prefecture: "東京都",
      storeName: "パチンコパーラー池袋",
      targetMachines: ["Sハナハナホウオウ天翔", "Sマイジャグラー5"],
    },
    interimReport: {
      slot20Count: "85",
      slot20TotalDiff: "+22000",
      slot20AvgGames: "6800",
      slot20AvgDiff: "+259",
      machineReports: [
        { machineName: "ハナハナ", count: "5", avgGames: "7200", avgDiff: "+310" },
        { machineName: "ジャグラー", count: "4", avgGames: "6300", avgDiff: "+195" },
      ],
      uploadedAt: "2026-02-16",
    },
    statusHistory: [
      { status: "受注", timestamp: "2026-01-25T09:00:00Z", changedBy: "山田 太郎" },
      { status: "キャスト手配完了", timestamp: "2026-02-01T10:00:00Z", changedBy: "マネジメント部" },
      { status: "対象機種フォーム送信", timestamp: "2026-02-05T14:00:00Z", changedBy: "商材管理課" },
      { status: "実施中", timestamp: "2026-02-15T10:00:00Z", changedBy: "システム" },
    ],
    chatMessages: [
      { channel: "商材管理課", author: "商材管理課", content: "2月中旬イベント、中間レポートの入力をお願いします。", timestamp: "2026-02-16T09:00:00Z" },
      { channel: "商材管理課", author: "外注業者", content: "中間レポートを入力しました。ご確認ください。", timestamp: "2026-02-16T14:00:00Z" },
    ],
  },
  // Product 12: 合同抽選会（受注済み - 事務管理課 未入力状態）
  {
    id: 12,
    projectId: 6,
    projectNumber: "PJ-006",
    category: "ポイント",
    eventType: "合同抽選会",
    eventProductName: "GW大感謝抽選会2026",
    eventDate: "2026/05/03",
    estimatedBillingAmount: 900000,
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
    hallNames: ["パチンコパーラー池袋"],
    eventStartDate: "2026/04/28",
    eventEndDate: "2026/05/06",
    salesPersonId: 3,
    insightPersonId: 1,
    readingCertainty: "B" as const,
    area: "東京都",
    budget: "900000",
    prizeInfo: [
      { rank: "特賞", name: "PlayStation 5", quantity: "1", unitPrice: 66980, prizeId: "6", vendorId: "2", vendorName: "プレミアム景品" },
      { rank: "1等", name: "ルンバ i7+", quantity: "2", unitPrice: 55000, prizeId: "7", vendorId: "1", vendorName: "景品卸売センター" },
      { rank: "2等", name: "JTB旅行券 3万円分", quantity: "3", unitPrice: 30000, prizeId: "8", vendorId: "3", vendorName: "ギフトプラザ" },
      { rank: "3等", name: "QUOカード 3000円分", quantity: "5", unitPrice: 3000, prizeId: "9", vendorId: "3", vendorName: "ギフトプラザ" },
      { rank: "参加賞", name: "ポケットティッシュ", quantity: "10", unitPrice: 50, prizeId: "10", vendorId: "1", vendorName: "景品卸売センター" },
    ],
    hallQuotes: [
      {
        hallName: "パチンコパーラー池袋",
        quoteItems: [
          { id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: 25000, included: true },
          { id: 2, name: "ポスター印刷", quantity: 20, unitPrice: 2000, included: true },
          { id: 3, name: "DM発送代行", quantity: 1, unitPrice: 40000, included: true },
          { id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: 35000, included: true },
        ],
        percentage: 100,
        calculatedAmount: 140000,
      },
    ],
    // 事務管理課ワークフロー: 全て未入力
    // winnerList: undefined
    // winnerListUploadedAt: undefined
    // winnerListValidatedAt: undefined
    // notificationOrderGeneratedAt: undefined
    // notificationOrderSentAt: undefined
    // prizeOrderGeneratedAt: undefined
    // prizeOrderRequestedAt: undefined
    // prizeOrdersByVendor: undefined
    // prizeDeliveryInfoByVendor: undefined
    // quoCardLetterCheckedAt: undefined
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
    vendorId: "V-001",
    vendorName: "デザインスタジオA",
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
  { id: 9, name: "ハナハナ", pachitownName: "Sハナハナホウオウ天翔" },
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

// ─── Monthly Billings（月次計上シードデータ） ───

export const SEED_MONTHLY_BILLINGS: MonthlyBilling[] = [
  {
    id: "MB-001",
    vendorType: "prize",
    vendorId: "1",
    vendorName: "景品卸売センター",
    billingMonth: "2026-02",
    status: "sent",
    lineItems: [
      { productId: 3, productName: "春の大抽選会2026", projectNumber: "PJ-002", itemName: "液晶テレビ 50インチ", quantity: 2, unitPrice: 80000, subtotal: 160000 },
      { productId: 3, productName: "春の大抽選会2026", projectNumber: "PJ-002", itemName: "ダイソン掃除機", quantity: 5, unitPrice: 45000, subtotal: 225000 },
      { productId: 3, productName: "春の大抽選会2026", projectNumber: "PJ-002", itemName: "ティッシュBOX", quantity: 500, unitPrice: 100, subtotal: 50000 },
    ],
    totalAmount: 435000,
    createdAt: "2026-02-28T09:00:00Z",
    updatedAt: "2026-02-28T10:00:00Z",
    chatMessages: [
      { author: "事務管理課", content: "2月分の計上データをお送りします。内容をご確認ください。", timestamp: "2026-02-28T10:00:00Z" },
    ],
  },
  {
    id: "MB-002",
    vendorType: "design",
    vendorId: "V-001",
    vendorName: "デザインスタジオA",
    billingMonth: "2026-02",
    status: "draft",
    lineItems: [
      { productId: 3, productName: "春の大抽選会2026", projectNumber: "PJ-002", itemName: "当選通知書制作費", quantity: 1, unitPrice: 50000, subtotal: 50000 },
    ],
    totalAmount: 50000,
    createdAt: "2026-02-28T09:00:00Z",
    updatedAt: "2026-02-28T09:00:00Z",
    chatMessages: [],
  },
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
