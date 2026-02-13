/**
 * シードデータ（テストデータ）
 *
 * ローカル開発・デモ用の初期データを一元管理する。
 * バージョンを変更するとクライアントの localStorage がリセットされる。
 */
import type { Project, Product, DesignRequest, Company, Hall, Employee } from "./types"

/** シードデータのスキーマバージョン。型定義やシードデータを変更したらインクリメントする */
export const SEED_VERSION = 6

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
  },
  {
    id: 2,
    projectId: 1,
    projectNumber: "PJ-001",
    category: "イベント",
    eventType: "スロセレ",
    eventProductName: "スロセレ 春の特別企画",
    eventDate: "2026/04/10",
    estimatedBillingAmount: 480000,
    proposalStatus: "proposing",
    executionStatus: "実施前",
    companionCount: "1",
    directorCount: "0",
    mcCount: "1",
    selectedCompanions: ["高橋 奈々"],
    selectedDirectors: [],
    selectedMcs: ["伊藤 翔太"],
    companionBookingStatus: { "高橋 奈々": "tentative_requesting" },
    directorBookingStatus: {},
    mcBookingStatus: { "伊藤 翔太": "tentative_requesting" },
  },
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
    prizeOrderedAt: undefined,
    winnerListUploadedAt: undefined,
    winnerListValidatedAt: undefined,
  },
  {
    id: 4,
    projectId: 3,
    projectNumber: "PJ-003",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "トリニティガール GW特別イベント",
    eventDate: "2026/05/03",
    estimatedBillingAmount: 720000,
    proposalStatus: "order-received",
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
  },
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
    executionStatus: "実施前",
    companionCount: "3",
    directorCount: "1",
    mcCount: "0",
    selectedCompanions: ["佐藤 花子", "田中 美咲", "高橋 奈々"],
    selectedDirectors: ["鈴木 一郎"],
    selectedMcs: [],
    companionBookingStatus: {},
    directorBookingStatus: {},
    mcBookingStatus: {},
    correctionRequest: "コンパニオンの人数を3名から2名に変更してください。予算の都合上、ディレクターも不要です。",
  },
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
    executionStatus: "実施前",
    companionCount: "1",
    directorCount: "0",
    mcCount: "0",
    selectedCompanions: ["佐藤 花子"],
    selectedDirectors: [],
    selectedMcs: [],
    companionBookingStatus: {},
    directorBookingStatus: {},
    mcBookingStatus: {},
    temporaryHoldFailureComment: "佐藤 花子さんは3/25に別案件の本押さえが入っているため、仮押さえできません。代替のキャストをご検討ください。",
  },
]

// ─── Design Requests ───

export const SEED_DESIGN_REQUESTS: DesignRequest[] = [
  {
    id: "DR-001",
    requestType: "poster",
    projectId: 3,
    projectNumber: "PJ-002",
    status: "uploaded",
    vendorId: "V-001",
    vendorName: "デザインスタジオA",
    requestedAt: "2026-02-10T10:00:00Z",
    uploadedAt: "2026-02-12T15:00:00Z",
    uploadedFileName: "poster_v1.pdf",
  },
  {
    id: "DR-002",
    requestType: "dm",
    projectId: 3,
    projectNumber: "PJ-002",
    status: "requested",
    vendorId: "V-001",
    vendorName: "デザインスタジオA",
    requestedAt: "2026-02-11T09:00:00Z",
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
}

export const SEED_COMPANIONS: SeedCastMember[] = [
  { id: 1, name: "Rio", isExclusive: true, hourlyRate: 5000, productionId: 1 },
  { id: 2, name: "Ayaka", isExclusive: true, hourlyRate: 5500, productionId: 1 },
  { id: 3, name: "Nanaka", isExclusive: true, hourlyRate: 5200, productionId: 2 },
  { id: 4, name: "山田 花子", isExclusive: false, hourlyRate: 6000, productionId: 3 },
  { id: 5, name: "佐藤 美咲", isExclusive: false, hourlyRate: 5800, productionId: 3 },
  { id: 6, name: "鈴木 さくら", isExclusive: false, hourlyRate: 6200, productionId: 3 },
  { id: 7, name: "高橋 みゆき", isExclusive: false, hourlyRate: 5900, productionId: 2 },
  { id: 8, name: "伊藤 あかり", isExclusive: false, hourlyRate: 6100, productionId: 1 },
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
