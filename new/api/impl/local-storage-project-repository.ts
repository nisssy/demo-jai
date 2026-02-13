import type { ProjectRepository } from "../project-repository"
import type { Project, Product, DesignRequest, Company, Hall, Employee } from "../types"

/** シードデータのスキーマバージョン。型定義やシードデータを変更したらインクリメントする */
const SEED_VERSION = 2

const STORAGE_KEYS = {
  version: "new_seed_version",
  projects: "new_projects",
  products: "new_products",
  designRequests: "new_design_requests",
  companies: "new_companies",
  halls: "new_halls",
  employees: "new_employees",
} as const

function getFromStorage<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

/** 初期シードデータ */
const SEED_PROJECTS: Project[] = [
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

const SEED_PRODUCTS: Product[] = [
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

const SEED_DESIGN_REQUESTS: DesignRequest[] = [
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

const SEED_COMPANIES: Company[] = [
  { id: 1, companyId: "CORP-001", name: "キング観光株式会社" },
  { id: 2, companyId: "CORP-002", name: "マルハン株式会社" },
  { id: 3, companyId: "CORP-003", name: "日拓グループ" },
  { id: 4, companyId: "CORP-004", name: "ダイナム株式会社" },
  { id: 5, companyId: "CORP-005", name: "ガイア株式会社" },
]

const SEED_HALLS: Hall[] = [
  { id: 1, hallId: "HALL-001", name: "パチンコキング新宿店", salesPersonName: "山田 太郎", companyId: 1 },
  { id: 2, hallId: "HALL-005", name: "グランドホール渋谷", salesPersonName: "山田 太郎", companyId: 2 },
  { id: 3, hallId: "HALL-010", name: "エスパス日拓高田馬場", salesPersonName: "山田 太郎", companyId: 3 },
  { id: 4, hallId: "HALL-020", name: "パチンコパーラー池袋", salesPersonName: "山田 太郎", companyId: 4 },
  { id: 5, hallId: "HALL-030", name: "メガガイア品川", salesPersonName: "山田 太郎", companyId: 5 },
]

const SEED_EMPLOYEES: Employee[] = [
  { id: 1, name: "山田 太郎", department: "営業部" },
  { id: 2, name: "佐藤 次郎", department: "営業部" },
  { id: 3, name: "田中 三郎", department: "管理部" },
]

/** localStorage を使った ProjectRepository 実装 */
export class LocalStorageProjectRepository implements ProjectRepository {
  constructor() {
    this.ensureSeeded()
  }

  /** シードデータを投入（バージョン不一致時はリセット） */
  private ensureSeeded(): void {
    if (typeof window === "undefined") return

    const storedVersion = localStorage.getItem(STORAGE_KEYS.version)
    if (storedVersion !== String(SEED_VERSION)) {
      for (const key of Object.values(STORAGE_KEYS)) {
        localStorage.removeItem(key)
      }
    }

    localStorage.setItem(STORAGE_KEYS.version, String(SEED_VERSION))
    if (!localStorage.getItem(STORAGE_KEYS.projects)) {
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(SEED_PROJECTS))
    }
    if (!localStorage.getItem(STORAGE_KEYS.products)) {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(SEED_PRODUCTS))
    }
    if (!localStorage.getItem(STORAGE_KEYS.designRequests)) {
      localStorage.setItem(STORAGE_KEYS.designRequests, JSON.stringify(SEED_DESIGN_REQUESTS))
    }
    if (!localStorage.getItem(STORAGE_KEYS.companies)) {
      localStorage.setItem(STORAGE_KEYS.companies, JSON.stringify(SEED_COMPANIES))
    }
    if (!localStorage.getItem(STORAGE_KEYS.halls)) {
      localStorage.setItem(STORAGE_KEYS.halls, JSON.stringify(SEED_HALLS))
    }
    if (!localStorage.getItem(STORAGE_KEYS.employees)) {
      localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(SEED_EMPLOYEES))
    }
  }

  getProjects(): Project[] {
    return getFromStorage<Project>(STORAGE_KEYS.projects, SEED_PROJECTS)
  }

  getProjectByProjectNumber(projectNumber: string): Project | undefined {
    return this.getProjects().find((p) => p.projectNumber === projectNumber)
  }

  getProducts(): Product[] {
    return getFromStorage<Product>(STORAGE_KEYS.products, SEED_PRODUCTS)
  }

  getProductById(id: number): Product | undefined {
    return this.getProducts().find((p) => p.id === id)
  }

  getProductsByProjectNumber(projectNumber: string): Product[] {
    return this.getProducts().filter((p) => p.projectNumber === projectNumber)
  }

  getDesignRequestsByProjectId(projectId: number): DesignRequest[] {
    return getFromStorage<DesignRequest>(STORAGE_KEYS.designRequests, SEED_DESIGN_REQUESTS)
      .filter((dr) => dr.projectId === projectId)
  }

  getCompanies(): Company[] {
    return getFromStorage<Company>(STORAGE_KEYS.companies, SEED_COMPANIES)
  }

  getHalls(): Hall[] {
    return getFromStorage<Hall>(STORAGE_KEYS.halls, SEED_HALLS)
  }

  getEmployees(): Employee[] {
    return getFromStorage<Employee>(STORAGE_KEYS.employees, SEED_EMPLOYEES)
  }
}
