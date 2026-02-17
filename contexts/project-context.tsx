"use client"

import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import type { ProjectData, Role } from "@/types/project"
import type { GoudouRole, Project as VendorProject } from "@/types"
import { clearDemoDbStorage, loadDemoDbFromStorageMeta, saveDemoDbToStorage } from "@/lib/demo-db/storage"
import type {
  CompanyData,
  HallData,
  ProductionData,
  CompanionData,
  EmployeeData,
  DemoProductEntity,
  DemoProject,
  DemoProjectEntity,
  PrizeVendorData,
  PrizeData,
  TradingPartnerData,
} from "@/lib/demo-db/types"
import type { DesignRequest, DesignRequestComment } from "@/types/lottery"
import { denormalizeProjects, type DemoDbV3Data } from "@/lib/demo-db/denormalize"
import {
  findCompanyByCompanyId as findCompanyByCompanyIdRepo,
  findCompanyById as findCompanyByIdRepo,
  findHallByName as findHallByNameRepo,
  getHallsByCompanyId as getHallsByCompanyIdRepo,
  searchCompanies as searchCompaniesRepo,
  searchHalls as searchHallsRepo,
} from "@/lib/demo-db/repository"
import { comprehensiveTestProjects } from "@/lib/demo-db/test-data"
import { comprehensiveDesignRequests } from "@/lib/demo-db/test-design-requests"

type Product = DemoProject

export type { CompanyData, HallData, EmployeeData }

type ProjectContextType = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  currentRole: Role | null
  setCurrentRole: (role: Role | null) => void
  currentGoudouRole: GoudouRole | null
  setCurrentGoudouRole: (role: GoudouRole | null) => void
  notifications: string[]
  addNotification: (message: string) => void
  // デモ用擬似DBの操作
  resetDemoData: () => void
  refreshFromStorage: () => void
  // ベンダー画面用（合同抽選会プロジェクト一覧）
  projects: VendorProject[]
  getProjectById: (id: number | string) => VendorProject | null
  // 案件(Project)操作関数（正規化）
  getProjects: () => DemoProjectEntity[]
  getProjectByProjectNumber: (projectNumber: string) => DemoProjectEntity | null
  // 商材(Product)操作関数（UIが主に扱う）
  getProducts: () => Product[]
  createProduct: (product: Omit<Product, "id">) => Product
  createProducts: (products: Omit<Product, "id">[]) => Product[]
  updateProduct: (id: number, updates: Partial<Product>) => Product | null
  updateProject: (id: number, updates: Partial<Product>) => Product | null
  deleteProduct: (id: number) => boolean
  getProductById: (id: number) => Product | null
  generateProjectNumber: (existingProjects: Array<{ projectNumber?: string }>) => string
  // ホールデータ操作関数
  getHalls: () => HallData[]
  getHallByName: (name: string) => HallData | null
  searchHalls: (query: string, companyId?: number) => HallData[]
  // 法人データ操作関数
  getCompanies: () => CompanyData[]
  getCompanyById: (id: number) => CompanyData | null
  getCompanyByCompanyId: (companyId: string) => CompanyData | null
  searchCompanies: (query: string) => CompanyData[]
  getHallsByCompanyId: (companyId: number) => HallData[]
  // プロダクション/コンパニオン（マスタ）
  getProductions: () => ProductionData[]
  getCompanions: () => CompanionData[]
  // 従業員（マスタ）
  getEmployees: () => EmployeeData[]
  getEmployeeById: (id: number) => EmployeeData | null
  getEmployeeByName: (name: string) => EmployeeData | null
  searchEmployees: (query: string) => EmployeeData[]
  // 合同抽選会：デザイン依頼
  designRequests: DesignRequest[]
  getDesignRequests: () => DesignRequest[]
  getDesignRequestById: (id: string) => DesignRequest | null
  getDesignRequestsByVendorId: (vendorId: string) => DesignRequest[]
  getDesignRequestsByProjectId: (projectId: number) => DesignRequest[]
  getDesignRequestsByProjectAndType: (projectId: number, type: string) => DesignRequest[]
  createDesignRequest: (request: Omit<DesignRequest, "id">) => DesignRequest
  updateDesignRequest: (id: string, updates: Partial<DesignRequest>) => DesignRequest | null
  addDesignRequestComment: (requestId: string, comment: Omit<DesignRequestComment, "id">) => DesignRequest | null
  // 合同抽選会：マスタデータ
  getPrizeVendors: () => PrizeVendorData[]
  getPrizes: () => PrizeData[]
  getTradingPartners: () => TradingPartnerData[]
  getTradingPartnersByIndustry: (industry: "printing" | "design" | "prize") => TradingPartnerData[]
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

// 初期法人データ（10個の法人）
const initialCompanies: CompanyData[] = [
  { id: 1, companyId: "CORP-001", name: "株式会社マルハン", email: "maruhan@example.com" },
  { id: 2, companyId: "CORP-002", name: "株式会社ダイナム", email: "dynam@example.com" },
  { id: 3, companyId: "CORP-003", name: "株式会社ガイア", email: "gaia@example.com" },
  { id: 4, companyId: "CORP-004", name: "株式会社エース", email: "ace@example.com" },
  { id: 5, companyId: "CORP-005", name: "株式会社サンライズ", email: "sunrise@example.com" },
  { id: 6, companyId: "CORP-006", name: "株式会社ビッグエース", email: "bigace@example.com" },
  { id: 7, companyId: "CORP-007", name: "株式会社パチンコランド", email: "pachinkoland@example.com" },
  { id: 8, companyId: "CORP-008", name: "株式会社エースパチンコ", email: "acepachinko@example.com" },
  { id: 9, companyId: "CORP-009", name: "株式会社パチンコワールド", email: "pachinkoworld@example.com" },
  { id: 10, companyId: "CORP-010", name: "株式会社ビッグパチンコ", email: "bigpachinko@example.com" },
]

// 営業担当者のリスト（20人）
const salesPersonNames = [
  "山田 太郎", "佐藤 次郎", "鈴木 三郎", "高橋 四郎", "伊藤 五郎",
  "渡辺 六郎", "中村 七郎", "小林 八郎", "加藤 九郎", "松本 十郎",
  "井上 十一", "木村 十二", "林 十三", "斎藤 十四", "清水 十五",
  "山本 十六", "森 十七", "池田 十八", "橋本 十九", "石川 二十",
]

// 5000円から5万円までのランダムな割引金額を生成する関数
const generateRandomDiscount = (): number => {
  // 5000円刻みでランダムに生成（5000, 10000, 15000, ..., 50000）
  const min = 1 // 5000円 / 5000
  const max = 10 // 50000円 / 5000
  return (Math.floor(Math.random() * (max - min + 1)) + min) * 5000
}

// 初期従業員データ（営業担当者・管理部門など50人）
// ホールマスタ生成時に使用するため、先に定義
const initialEmployees: EmployeeData[] = [
  // 営業部（20人）
  { id: 1, name: "山田 太郎", email: "yamada@example.com", department: "営業部" },
  { id: 2, name: "佐藤 次郎", email: "sato@example.com", department: "営業部" },
  { id: 3, name: "鈴木 三郎", email: "suzuki@example.com", department: "営業部" },
  { id: 4, name: "高橋 四郎", email: "takahashi@example.com", department: "営業部" },
  { id: 5, name: "伊藤 五郎", email: "ito@example.com", department: "営業部" },
  { id: 6, name: "渡辺 六郎", email: "watanabe@example.com", department: "営業部" },
  { id: 7, name: "中村 七郎", email: "nakamura@example.com", department: "営業部" },
  { id: 8, name: "小林 八郎", email: "kobayashi@example.com", department: "営業部" },
  { id: 9, name: "加藤 九郎", email: "kato@example.com", department: "営業部" },
  { id: 10, name: "松本 十郎", email: "matsumoto@example.com", department: "営業部" },
  { id: 11, name: "井上 十一", email: "inoue@example.com", department: "営業部" },
  { id: 12, name: "木村 十二", email: "kimura@example.com", department: "営業部" },
  { id: 13, name: "林 十三", email: "hayashi@example.com", department: "営業部" },
  { id: 14, name: "斎藤 十四", email: "saito@example.com", department: "営業部" },
  { id: 15, name: "清水 十五", email: "shimizu@example.com", department: "営業部" },
  { id: 16, name: "山本 十六", email: "yamamoto@example.com", department: "営業部" },
  { id: 17, name: "森 十七", email: "mori@example.com", department: "営業部" },
  { id: 18, name: "池田 十八", email: "ikeda@example.com", department: "営業部" },
  { id: 19, name: "橋本 十九", email: "hashimoto@example.com", department: "営業部" },
  { id: 20, name: "石川 二十", email: "ishikawa@example.com", department: "営業部" },
  // 営業部（追加10人）
  { id: 21, name: "田中 一郎", email: "tanaka@example.com", department: "営業部" },
  { id: 22, name: "佐々木 二郎", email: "sasaki@example.com", department: "営業部" },
  { id: 23, name: "山口 三郎", email: "yamaguchi@example.com", department: "営業部" },
  { id: 24, name: "松井 四郎", email: "matsui@example.com", department: "営業部" },
  { id: 25, name: "村上 五郎", email: "murakami@example.com", department: "営業部" },
  { id: 26, name: "前田 六郎", email: "maeda@example.com", department: "営業部" },
  { id: 27, name: "長谷川 七郎", email: "hasegawa@example.com", department: "営業部" },
  { id: 28, name: "藤田 八郎", email: "fujita@example.com", department: "営業部" },
  { id: 29, name: "近藤 九郎", email: "kondo@example.com", department: "営業部" },
  { id: 30, name: "遠藤 十郎", email: "endo@example.com", department: "営業部" },
  // 管理部（10人）
  { id: 31, name: "青木 花子", email: "aoki@example.com", department: "管理部" },
  { id: 32, name: "新井 美咲", email: "arai@example.com", department: "管理部" },
  { id: 33, name: "荒井 さくら", email: "arai2@example.com", department: "管理部" },
  { id: 34, name: "石井 みゆき", email: "ishii@example.com", department: "管理部" },
  { id: 35, name: "上田 あかり", email: "ueda@example.com", department: "管理部" },
  { id: 36, name: "内田 ゆい", email: "uchida@example.com", department: "管理部" },
  { id: 37, name: "江藤 まい", email: "eto@example.com", department: "管理部" },
  { id: 38, name: "大野 りん", email: "ono@example.com", department: "管理部" },
  { id: 39, name: "小野 なな", email: "ono2@example.com", department: "管理部" },
  { id: 40, name: "尾崎 はるか", email: "ozaki@example.com", department: "管理部" },
  // 経理部（10人）
  { id: 41, name: "岡田 健", email: "okada@example.com", department: "経理部" },
  { id: 42, name: "奥田 誠", email: "okuda@example.com", department: "経理部" },
  { id: 43, name: "片山 智", email: "katayama@example.com", department: "経理部" },
  { id: 44, name: "金田 勇", email: "kaneda@example.com", department: "経理部" },
  { id: 45, name: "川上 剛", email: "kawakami@example.com", department: "経理部" },
  { id: 46, name: "河野 進", email: "kono@example.com", department: "経理部" },
  { id: 47, name: "菊地 優", email: "kikuchi@example.com", department: "経理部" },
  { id: 48, name: "工藤 大", email: "kudo@example.com", department: "経理部" },
  { id: 49, name: "久保 翔", email: "kubo@example.com", department: "経理部" },
  { id: 50, name: "黒田 亮", email: "kuroda@example.com", department: "経理部" },
]

// 初期ホールデータ（10法人 × 20ホール = 200ホール）
// 従業員マスタの名前を使用
const generateInitialHalls = (): HallData[] => {
  const halls: HallData[] = []
  let hallCounter = 1
  const employeeNames = initialEmployees.map((e) => e.name)
  initialCompanies.forEach((company, companyIndex) => {
    for (let i = 1; i <= 20; i++) {
      const salesPersonIndex = (companyIndex * 20 + i - 1) % employeeNames.length
      const hallNumber = String(i).padStart(2, "0")
      const location = ["本店", "渋谷店", "新宿店", "池袋店", "上野店", "錦糸町店", "新橋店", "横浜店", "川崎店", "大宮店", "千葉店", "船橋店", "柏店", "立川店", "八王子店", "町田店", "相模原店", "厚木店", "藤沢店", "鎌倉店"][i - 1]
      const wardMap: Record<string, string> = {
        "本店": "千代田区",
        "渋谷店": "渋谷区",
        "新宿店": "新宿区",
        "池袋店": "豊島区",
        "上野店": "台東区",
        "錦糸町店": "墨田区",
        "新橋店": "港区",
        "横浜店": "神奈川県横浜市西区",
        "川崎店": "神奈川県川崎市川崎区",
        "大宮店": "埼玉県さいたま市大宮区",
        "千葉店": "千葉県千葉市中央区",
        "船橋店": "千葉県船橋市",
        "柏店": "千葉県柏市",
        "立川店": "東京都立川市",
        "八王子店": "東京都八王子市",
        "町田店": "東京都町田市",
        "相模原店": "神奈川県相模原市中央区",
        "厚木店": "神奈川県厚木市",
        "藤沢店": "神奈川県藤沢市",
        "鎌倉店": "神奈川県鎌倉市",
      }
      const prefectureMap: Record<string, string> = {
        "本店": "東京都",
        "渋谷店": "東京都",
        "新宿店": "東京都",
        "池袋店": "東京都",
        "上野店": "東京都",
        "錦糸町店": "東京都",
        "新橋店": "東京都",
        "横浜店": "神奈川県",
        "川崎店": "神奈川県",
        "大宮店": "埼玉県",
        "千葉店": "千葉県",
        "船橋店": "千葉県",
        "柏店": "千葉県",
        "立川店": "東京都",
        "八王子店": "東京都",
        "町田店": "東京都",
        "相模原店": "神奈川県",
        "厚木店": "神奈川県",
        "藤沢店": "神奈川県",
        "鎌倉店": "神奈川県",
      }
      const addressBase = wardMap[location] || "東京都"
      const prefecture = prefectureMap[location] ?? "東京都"

      halls.push({
        id: hallCounter,
        hallId: `${company.companyId}-HALL-${hallNumber}`, // ホールIDを生成
        name: `${company.name.replace("株式会社", "")}${location}`,
        address: `${addressBase}${String(i).padStart(2, "0")}-1-1`,
        email: `${company.companyId.toLowerCase()}-hall-${hallNumber}@example.com`, // デモ用メールアドレス
        salesPersonName: employeeNames[salesPersonIndex],
        companyId: company.id,
        discountAmount: generateRandomDiscount(), // 5000円〜50000円のランダムな割引金額
        prefecture,
      })
      hallCounter++
    }
  })
  return halls
}
const initialHalls = generateInitialHalls()

// プロダクション（企業）マスタ（デモ）
const initialProductions: ProductionData[] = [
  { id: 1, name: "プロダクションA", address: "東京都渋谷区1-1-1", phone: "03-1111-1111" },
  { id: 2, name: "プロダクションB", address: "東京都新宿区2-2-2", phone: "03-2222-2222" },
  { id: 3, name: "プロダクションC", address: "東京都豊島区3-3-3", phone: "03-3333-3333" },
]

// コンパニオン（所属必須）
// NOTE: 既存のテストデータに登場するコンパニオン名を適当にプロダクションへ紐づけている
const initialCompanions: CompanionData[] = [
  { id: 1, name: "Rio", productionId: 1 },
  { id: 2, name: "Ayaka", productionId: 1 },
  { id: 3, name: "Nanaka", productionId: 2 },
  { id: 4, name: "山田 花子", productionId: 3 },
  { id: 5, name: "佐藤 美咲", productionId: 3 },
  { id: 6, name: "鈴木 さくら", productionId: 3 },
  { id: 7, name: "高橋 みゆき", productionId: 2 },
  { id: 8, name: "伊藤 あかり", productionId: 1 },
]

// ホール名から法人情報とホールIDを取得するヘルパー関数
const getCompanyAndHallInfo = (hallName: string): { companyName: string; companyId: string; hallId: string } => {
  const hall = initialHalls.find(h => h.name === hallName)
  if (hall) {
    const company = initialCompanies.find(c => c.id === hall.companyId)
    if (company) {
      return {
        companyName: company.name,
        companyId: company.companyId,
        hallId: hall.hallId,
      }
    }
  }
  // フォールバック（見つからない場合）
  return {
    companyName: "-",
    companyId: "-",
    hallId: "-",
  }
}

// 初期データ: 画面間データ整合性を保った包括的テストデータ
// トリニティガール (id: 1-6), スロセレ (id: 7-12), 合同抽選会 (id: 21-28)
const initialProjects: Product[] = [
  // ======================================
  // トリニティガール商材 (id: 1-6)
  // ======================================

  // 包括的テストデータを読み込んで、各項目にcompanyName, companyId, hallIdを追加
  ...comprehensiveTestProjects.map(project => ({
    ...project,
    ...getCompanyAndHallInfo(project.hallName || (project as any).hallNames?.[0] || ""),
  })),
]

// 合同抽選会：景品業者の初期データ
const initialPrizeVendors: PrizeVendorData[] = [
  { id: 1, name: "景品卸売センター", email: "keihin-center@example.com" },
  { id: 2, name: "プライズワールド", email: "prize-world@example.com" },
  { id: 3, name: "ギフトサプライ", email: "gift-supply@example.com" },
]

// 合同抽選会：景品マスタの初期データ
const initialPrizes: PrizeData[] = [
  { id: 1, name: "液晶テレビ 50インチ", vendorId: 1 },
  { id: 2, name: "ノートパソコン", vendorId: 1 },
  { id: 3, name: "掃除機ロボット", vendorId: 2 },
  { id: 4, name: "電動自転車", vendorId: 2 },
  { id: 5, name: "高級炊飯器", vendorId: 3 },
  { id: 6, name: "コーヒーメーカー", vendorId: 3 },
  { id: 7, name: "クオカード 5000円分", vendorId: 1 },
  { id: 8, name: "クオカード 10000円分", vendorId: 1 },
]

// 合同抽選会：取引先の初期データ
const initialTradingPartners: TradingPartnerData[] = [
  { id: 1, name: "デザインスタジオABC", email: "abc-design@example.com", industry: "design" },
  { id: 2, name: "クリエイティブワークス", email: "creative-works@example.com", industry: "design" },
  { id: 3, name: "プリントエキスパート", email: "print-expert@example.com", industry: "printing" },
  { id: 4, name: "景品卸売センター", email: "keihin-center@example.com", industry: "prize" },
  { id: 5, name: "プライズワールド", email: "prize-world@example.com", industry: "prize" },
]

// 合同抽選会：デザイン依頼の初期データ（デモ用）
// 包括的DesignRequestsテストデータ
const initialDesignRequests: DesignRequest[] = comprehensiveDesignRequests

function getDemoDbSeed() {
  return {
    // seedは旧形式（商材行）で保持しているので、Provider側で正規化して使う
    projects: initialProjects,
    halls: initialHalls,
    companies: initialCompanies,
    productions: initialProductions,
    companions: initialCompanions,
    employees: initialEmployees,
    // 合同抽選会用データ
    prizeVendors: initialPrizeVendors,
    prizes: initialPrizes,
    tradingPartners: initialTradingPartners,
    designRequests: initialDesignRequests,
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
  const [currentGoudouRole, setCurrentGoudouRole] = useState<GoudouRole | null>(null)
  const [notifications, setNotifications] = useState<string[]>([])
  const { toast } = useToast()

  const initialSeed = useMemo(() => getDemoDbSeed(), [])
  const initialLoadMeta = useMemo(() => loadDemoDbFromStorageMeta(), [])
  const initialDb = initialLoadMeta?.snapshot.data ?? initialSeed
  const didResaveOnLoad = initialLoadMeta?.didResave ?? false
  const didNotifyMigrationRef = useRef(false)

  const initialV3 = useMemo((): DemoDbV3Data => {
    const companies = (initialDb.companies as CompanyData[] | undefined) ?? initialSeed.companies
    const halls = (initialDb.halls as HallData[] | undefined) ?? initialSeed.halls
    const productions = ((initialDb as any).productions as ProductionData[] | undefined) ?? initialSeed.productions
    const companions = ((initialDb as any).companions as CompanionData[] | undefined) ?? initialSeed.companions
    const employees = ((initialDb as any).employees as EmployeeData[] | undefined) ?? initialSeed.employees

    const maybeProducts = (initialDb as any).products
    const isV3 = Array.isArray(maybeProducts)
    if (isV3) {
      const today = new Date().toISOString().split("T")[0]
      const rawProjects = ((initialDb as any).projects as DemoProjectEntity[] | undefined) ?? []
      const projects = rawProjects.map((p) => ({
        ...p,
        createdAt: p.createdAt || today,
        updatedAt: p.updatedAt || p.createdAt || today,
      }))
      return {
        projects,
        products: ((initialDb as any).products as DemoProductEntity[] | undefined) ?? [],
        halls,
        companies,
        productions,
        companions,
        employees,
        // 合同抽選会用データ
        prizeVendors: ((initialDb as any).prizeVendors as PrizeVendorData[] | undefined) ?? initialSeed.prizeVendors ?? [],
        prizes: ((initialDb as any).prizes as PrizeData[] | undefined) ?? initialSeed.prizes ?? [],
        tradingPartners: ((initialDb as any).tradingPartners as TradingPartnerData[] | undefined) ?? initialSeed.tradingPartners ?? [],
        designRequests: ((initialDb as any).designRequests as DesignRequest[] | undefined) ?? initialSeed.designRequests ?? [],
      }
    }

    const legacyRows = ((initialDb as any).projects as DemoProject[] | undefined) ?? initialSeed.projects
    const grouped = new Map<string, DemoProject[]>()
    for (const row of legacyRows) {
      const pn = row.projectNumber || `legacy:${row.id}`
      grouped.set(pn, [...(grouped.get(pn) ?? []), row])
    }

    let nextProjectId = 1
    const projects: DemoProjectEntity[] = []
    const products: DemoProductEntity[] = []
    let nextProductId = 1
    const today = new Date().toISOString().split("T")[0]

    for (const [projectNumber, rows] of grouped.entries()) {
      const first = rows[0]
      const projectId = nextProjectId++
      const hallName = first.hallName || first.clientName
      const hall = hallName ? halls.find((h) => h.name === hallName) : undefined
      const company = hall ? companies.find((c) => c.id === hall.companyId) : undefined

      projects.push({
        id: projectId,
        projectNumber,
        projectName: first.projectName,
        hallName,
        hallCode: first.hallId || hall?.hallId,
        companyId: first.companyId || company?.companyId,
        companyName: first.companyName || company?.name,
        salesPersonName: first.salesPersonName || hall?.salesPersonName,
        requestDate: first.requestDate,
        hallRefId: hall?.id,
        createdAt: today,
        updatedAt: today,
      })

      for (const row of rows) {
        // 元のIDを保持（テストデータのID整合性を維持）
        const productId = row.id || nextProductId++
        if (row.id) {
          // 元のIDがある場合は nextProductId を更新して衝突を避ける
          nextProductId = Math.max(nextProductId, row.id + 1)
        }
        products.push({
          id: productId,
          projectId,
          // それ以外 = 商材属性
          clientName: row.clientName,
          date: row.date,
          venue: row.venue,
          talent: row.talent,
          estimateAmount: row.estimateAmount,
          status: row.status,
          projectStatus: row.projectStatus,
          category: row.category,
          eventType: row.eventType,
          eventProductName: row.eventProductName,
          eventDate: row.eventDate,
          estimatedBillingAmount: row.estimatedBillingAmount,
          startTime: row.startTime,
          endTime: row.endTime,
          companionCount: row.companionCount,
          directorCount: row.directorCount,
          mcCount: row.mcCount,
          selectedCompanions: row.selectedCompanions,
          selectedDirectors: row.selectedDirectors,
          selectedMcs: row.selectedMcs,
          nominatedCompanions: (row as any).nominatedCompanions,
          nominatedDirectors: (row as any).nominatedDirectors,
          nominatedMcs: (row as any).nominatedMcs,
          companionBookingStatus: (row as any).companionBookingStatus,
          directorBookingStatus: (row as any).directorBookingStatus,
          mcBookingStatus: (row as any).mcBookingStatus,
          companionTentativeHoldFailureComment: (row as any).companionTentativeHoldFailureComment,
          directorTentativeHoldFailureComment: (row as any).directorTentativeHoldFailureComment,
          mcTentativeHoldFailureComment: (row as any).mcTentativeHoldFailureComment,
          correctionRequest: row.correctionRequest,
          correctionComment: row.correctionComment,
          temporaryHoldFailureComment: row.temporaryHoldFailureComment,
          confirmedCompanions: row.confirmedCompanions,
          confirmedDirectors: row.confirmedDirectors,
          confirmedMcs: row.confirmedMcs,
          companionCostumes: row.companionCostumes,
          mustSeeFlag: row.mustSeeFlag,
          mustSeePublication: row.mustSeePublication,
          publicationDate: row.publicationDate,
          publicationTime: row.publicationTime,
          reportRequired: row.reportRequired,
          pachitownLinked: (row as any).pachitownLinked,
          pachitownLinkedDate: (row as any).pachitownLinkedDate,
          xAccountPostText: (row as any).xAccountPostText,
          surveySent: (row as any).surveySent,
          surveySentDate: (row as any).surveySentDate,
          surveyResult: (row as any).surveyResult,
          castingCost: (row as any).castingCost,
          transportationFee: (row as any).transportationFee,
          accommodationFee: (row as any).accommodationFee,
          postPRCost: (row as any).postPRCost,
          isTransportationAutoFilled: (row as any).isTransportationAutoFilled,
          isAccommodationAutoFilled: (row as any).isAccommodationAutoFilled,
          quoteGenerated: (row as any).quoteGenerated,
          quoteData: (row as any).quoteData,
          targetMachineNames: (row as any).targetMachineNames,
          pachitownMachineNames: (row as any).pachitownMachineNames,
          bannerGenerated: (row as any).bannerGenerated,
          bannerData: (row as any).bannerData,
          statusHistory: (row as any).statusHistory,
          // 合同抽選会専用フィールド
          hallNames: (row as any).hallNames,
          eventStartDate: (row as any).eventStartDate,
          eventEndDate: (row as any).eventEndDate,
          dmMailing: (row as any).dmMailing,
          prizeInfo: (row as any).prizeInfo,
          hallQuotes: (row as any).hallQuotes,
          salesPersonId: (row as any).salesPersonId,
          insightPersonId: (row as any).insightPersonId,
          proposalStatus: (row as any).proposalStatus,
          readingCertainty: (row as any).readingCertainty,
          executionStatus: (row as any).executionStatus,
          posterCount: (row as any).posterCount,
          target: (row as any).target,
          deliveryVendor: (row as any).deliveryVendor,
          orderFileName: (row as any).orderFileName,
          prizeOrderedAt: (row as any).prizeOrderedAt,
          deliveryInfos: (row as any).deliveryInfos,
          winnerList: (row as any).winnerList,
          winnerListUploadedAt: (row as any).winnerListUploadedAt,
          winnerListValidatedAt: (row as any).winnerListValidatedAt,
          prizeOrders: (row as any).prizeOrders,
          prizeOrdersByVendor: (row as any).prizeOrdersByVendor,
          prizeDeliveryInfoByVendor: (row as any).prizeDeliveryInfoByVendor,
        } as any)
      }
    }

    return {
      projects,
      products,
      halls,
      companies,
      productions,
      companions,
      employees,
      // 合同抽選会用データ
      prizeVendors: initialSeed.prizeVendors ?? [],
      prizes: initialSeed.prizes ?? [],
      tradingPartners: initialSeed.tradingPartners ?? [],
      designRequests: initialSeed.designRequests ?? [],
    }
  }, [
    initialDb,
    initialSeed.companies,
    initialSeed.halls,
    initialSeed.projects,
    initialSeed.productions,
    initialSeed.companions,
    initialSeed.employees,
    initialSeed.prizeVendors,
    initialSeed.prizes,
    initialSeed.tradingPartners,
  ])

  // v3: 正規化DB（projects=案件, products=商材）
  const [projectEntities, setProjectEntities] = useState<DemoProjectEntity[]>(() => {
    return initialV3.projects
  })
  const [productEntities, setProductEntities] = useState<DemoProductEntity[]>(() => {
    return initialV3.products
  })
  
  // ホールデータを独立したstateとして管理（仮想DB）
  const [halls, setHalls] = useState<HallData[]>(() => {
    return initialV3.halls
  })
  
  // 法人データを独立したstateとして管理（仮想DB）
  const [companies, setCompanies] = useState<CompanyData[]>(() => {
    return initialV3.companies
  })

  // プロダクション/コンパニオン（マスタ）
  const [productions, setProductions] = useState<ProductionData[]>(() => {
    return (initialV3 as any).productions ?? initialSeed.productions
  })
  const [companions, setCompanions] = useState<CompanionData[]>(() => {
    return (initialV3 as any).companions ?? initialSeed.companions
  })
  
  // 従業員（マスタ）
  const [employees, setEmployees] = useState<EmployeeData[]>(() => {
    return (initialV3 as any).employees ?? initialSeed.employees
  })

  // 合同抽選会：マスタデータ
  const [prizeVendors, setPrizeVendors] = useState<PrizeVendorData[]>(() => {
    return (initialV3 as any).prizeVendors ?? initialSeed.prizeVendors ?? []
  })
  const [prizes, setPrizes] = useState<PrizeData[]>(() => {
    return (initialV3 as any).prizes ?? initialSeed.prizes ?? []
  })
  const [tradingPartners, setTradingPartners] = useState<TradingPartnerData[]>(() => {
    return (initialV3 as any).tradingPartners ?? initialSeed.tradingPartners ?? []
  })

  // 合同抽選会：デザイン依頼
  const [designRequests, setDesignRequests] = useState<DesignRequest[]>(() => {
    return (initialV3 as any).designRequests ?? []
  })

  const denormalizedProducts = useMemo(() => {
    const data: DemoDbV3Data = {
      projects: projectEntities,
      products: productEntities,
      halls,
      companies,
      productions,
      companions,
      employees,
    }
    return denormalizeProjects(data)
  }, [companies, halls, productEntities, projectEntities, productions, companions, employees])

  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: "",
    clientName: "",
    date: "",
    venue: "",
    talent: "",
    talentStatus: "available",
    quoteItems: [],
    emailDraft: "",
    contractAmount: "",
    billingAddress: "",
    status: "proposed",
    validationErrors: [],
    correctionRequest: "",
    projects: denormalizedProducts, // 参照として設定（従来互換: 1行=商材）
  })

  // DBが更新されたらprojectDataも更新
  useEffect(() => {
    setProjectData((prev) => ({
      ...prev,
      projects: denormalizedProducts,
    }))
  }, [denormalizedProducts])

  // デモ用擬似DBをlocalStorageに永続化（projects/halls/companies 全保存）
  useEffect(() => {
    saveDemoDbToStorage({
      projects: projectEntities,
      products: productEntities,
      halls,
      companies,
      productions,
      companions,
      employees,
      prizeVendors,
      prizes,
      tradingPartners,
      designRequests,
    } as any)
  }, [
    projectEntities,
    productEntities,
    halls,
    companies,
    productions,
    companions,
    employees,
    prizeVendors,
    prizes,
    tradingPartners,
    designRequests,
  ])

  const addNotification = useCallback((message: string) => {
    setNotifications((prev) => [message, ...prev])
    toast({
      title: "通知",
      description: message,
    })
  }, [toast])

  const getProductions = useCallback(() => productions, [productions])
  const getCompanions = useCallback(() => companions, [companions])
  
  // 従業員マスタ操作関数
  const getEmployees = useCallback(() => employees, [employees])
  const getEmployeeById = useCallback(
    (id: number) => employees.find((e) => e.id === id) ?? null,
    [employees]
  )
  const getEmployeeByName = useCallback(
    (name: string) => employees.find((e) => e.name === name) ?? null,
    [employees]
  )
  const searchEmployees = useCallback(
    (query: string) => {
      const q = query.toLowerCase().trim()
      if (!q) return employees
      return employees.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.department && e.department.toLowerCase().includes(q))
      )
    },
    [employees]
  )

  // localStorage のデモデータを自動マイグレーション/補正した場合は、最初の一回だけ通知する
  useEffect(() => {
    if (!didResaveOnLoad) return
    if (didNotifyMigrationRef.current) return
    didNotifyMigrationRef.current = true
    addNotification("保存済みのデモデータを最新形式に更新しました")
  }, [addNotification, didResaveOnLoad])

  const resetDemoData = useCallback(() => {
    const seed = getDemoDbSeed()
    clearDemoDbStorage()
    setCompanies(seed.companies)
    setHalls(seed.halls)
    setProductions(seed.productions)
    setCompanions(seed.companions)
    setEmployees(seed.employees)
    // seed(旧形式)をv3へ変換してセット
    const legacyRows = seed.projects
    const grouped = new Map<string, DemoProject[]>()
    for (const row of legacyRows) {
      const pn = row.projectNumber || `legacy:${row.id}`
      grouped.set(pn, [...(grouped.get(pn) ?? []), row])
    }

    let nextProjectId = 1
    const projectsV3: DemoProjectEntity[] = []
    const productsV3: DemoProductEntity[] = []
    let nextProductId = 1
    const today = new Date().toISOString().split("T")[0]

    for (const [projectNumber, rows] of grouped.entries()) {
      const first = rows[0]
      const projectId = nextProjectId++
      const hallName = first.hallName || first.clientName
      const hall = hallName ? seed.halls.find((h) => h.name === hallName) : undefined
      const company = hall ? seed.companies.find((c) => c.id === hall.companyId) : undefined

      projectsV3.push({
        id: projectId,
        projectNumber,
        projectName: first.projectName,
        hallName,
        hallCode: first.hallId || hall?.hallId,
        companyId: first.companyId || company?.companyId,
        companyName: first.companyName || company?.name,
        salesPersonName: first.salesPersonName || hall?.salesPersonName,
        requestDate: first.requestDate,
        hallRefId: hall?.id,
        createdAt: today,
        updatedAt: today,
      })

      for (const row of rows) {
        // 元のIDを保持（テストデータのID整合性を維持）
        const productId = row.id || nextProductId++
        if (row.id) {
          // 元のIDがある場合は nextProductId を更新して衝突を避ける
          nextProductId = Math.max(nextProductId, row.id + 1)
        }
        productsV3.push({
          id: productId,
          projectId,
          clientName: row.clientName,
          date: row.date,
          venue: row.venue,
          talent: row.talent,
          estimateAmount: row.estimateAmount,
          status: row.status,
          projectStatus: row.projectStatus,
          category: row.category,
          eventType: row.eventType,
          eventProductName: row.eventProductName,
          eventDate: row.eventDate,
          estimatedBillingAmount: row.estimatedBillingAmount,
          startTime: row.startTime,
          endTime: row.endTime,
          companionCount: row.companionCount,
          directorCount: row.directorCount,
          mcCount: row.mcCount,
          selectedCompanions: row.selectedCompanions,
          selectedDirectors: row.selectedDirectors,
          selectedMcs: row.selectedMcs,
          nominatedCompanions: (row as any).nominatedCompanions,
          nominatedDirectors: (row as any).nominatedDirectors,
          nominatedMcs: (row as any).nominatedMcs,
          correctionRequest: row.correctionRequest,
          correctionComment: row.correctionComment,
          temporaryHoldFailureComment: row.temporaryHoldFailureComment,
          confirmedCompanions: row.confirmedCompanions,
          confirmedDirectors: row.confirmedDirectors,
          confirmedMcs: row.confirmedMcs,
          companionCostumes: row.companionCostumes,
          mustSeeFlag: row.mustSeeFlag,
          mustSeePublication: row.mustSeePublication,
          publicationDate: row.publicationDate,
          publicationTime: row.publicationTime,
          reportRequired: row.reportRequired,
          pachitownLinked: (row as any).pachitownLinked,
          pachitownLinkedDate: (row as any).pachitownLinkedDate,
          xAccountPostText: (row as any).xAccountPostText,
          surveySent: (row as any).surveySent,
          surveySentDate: (row as any).surveySentDate,
          surveyResult: (row as any).surveyResult,
          castingCost: (row as any).castingCost,
          transportationFee: (row as any).transportationFee,
          accommodationFee: (row as any).accommodationFee,
          postPRCost: (row as any).postPRCost,
          isTransportationAutoFilled: (row as any).isTransportationAutoFilled,
          isAccommodationAutoFilled: (row as any).isAccommodationAutoFilled,
          quoteGenerated: (row as any).quoteGenerated,
          quoteData: (row as any).quoteData,
          targetMachineNames: (row as any).targetMachineNames,
          pachitownMachineNames: (row as any).pachitownMachineNames,
          bannerGenerated: (row as any).bannerGenerated,
          bannerData: (row as any).bannerData,
        } as any)
      }
    }

    setProjectEntities(projectsV3)
    setProductEntities(productsV3)
    addNotification("デモデータを初期化しました")
  }, [addNotification])

  // 仮想DB操作関数
  const getProjects = useCallback(() => {
    return projectEntities
  }, [projectEntities])

  const getProjectByProjectNumber = useCallback(
    (projectNumber: string): DemoProjectEntity | null => {
      return projectEntities.find((p) => p.projectNumber === projectNumber) ?? null
    },
    [projectEntities],
  )

  const getProducts = useCallback(() => {
    return denormalizedProducts
  }, [denormalizedProducts])

  // ベンダー画面用: 合同抽選会プロジェクトをProject型に変換
  const projects = useMemo((): VendorProject[] => {
    return denormalizedProducts
      .filter((p) => p.category === "ポイント") // 合同抽選会のみ
      .map((p) => ({
        id: p.id,
        projectNumber: p.projectNumber,
        projectName: p.projectName,
        companyName: p.companyName || "",
        hallNames: (p as any).hallNames || [p.hallName].filter(Boolean),
        eventStartDate: (p as any).eventStartDate || p.date || "",
        eventEndDate: (p as any).eventEndDate || p.date || "",
        area: (p as any).area,
        status: ((p as any).proposalStatus || (p.projectStatus === "受注" ? "order-received" : p.projectStatus === "提案中" ? "proposing" : "before-proposal")) as "before-proposal" | "proposing" | "order-received",
        readingCertainty: (p as any).readingCertainty,
        dmMailing: (p as any).dmMailing,
        budget: (p as any).budget || p.estimateAmount || "",
        createdAt: (p as any).createdAt,
        salesPersonId: (p as any).salesPersonId,
        insightPersonId: (p as any).insightPersonId,
        posterCount: (p as any).posterCount,
        target: (p as any).target,
        hallQuotes: (p as any).hallQuotes,
        prizeInfo: (p as any).prizeInfo,
        deliveryVendor: (p as any).deliveryVendor,
        orderFileName: (p as any).orderFileName,
        prizeOrderedAt: (p as any).prizeOrderedAt,
        deliveryInfos: (p as any).deliveryInfos,
        // 景品業者画面用フィールド
        prizeOrdersByVendor: (p as any).prizeOrdersByVendor,
        prizeOrderDocument: (p as any).prizeOrderDocument,
        prizeOrderRequestedAt: (p as any).prizeOrderRequestedAt,
        prizeDeliveryInfoByVendor: (p as any).prizeDeliveryInfoByVendor,
        winnerList: (p as any).winnerList,
        winnerListUploadedAt: (p as any).winnerListUploadedAt,
        winnerListValidatedAt: (p as any).winnerListValidatedAt,
        // 事務管理課画面用フィールド
        executionStatus: (p as any).executionStatus,
        proposalStatus: (p as any).proposalStatus,
        notificationOrderDesignVendorId: (p as any).notificationOrderDesignVendorId,
        notificationOrderGeneratedAt: (p as any).notificationOrderGeneratedAt,
        notificationOrderSentAt: (p as any).notificationOrderSentAt,
        prizeOrderGeneratedAt: (p as any).prizeOrderGeneratedAt,
        quoCardLetterCheckedAt: (p as any).quoCardLetterCheckedAt,
      }))
  }, [denormalizedProducts])

  const getProjectById = useCallback(
    (id: number | string): VendorProject | null => {
      return projects.find((p) => String(p.id) === String(id)) ?? null
    },
    [projects]
  )

  const refreshFromStorage = useCallback(() => {
    // ストレージから再読み込み（デモ用：既にreactiveなので実質不要だが、明示的に再レンダリングをトリガー）
    const loaded = loadDemoDbFromStorageMeta()
    if (loaded?.snapshot) {
      // 必要に応じて state を更新
    }
  }, [])

  const generateProjectNumber = useCallback((existingProjects: Array<{ projectNumber?: string }>) => {
    let maxNumber = 0
    existingProjects.forEach((p) => {
      if (p.projectNumber) {
        const num = Number.parseInt(p.projectNumber)
        if (!Number.isNaN(num) && num > maxNumber) maxNumber = num
      }
    })
    return String(maxNumber + 1)
  }, [])

  const createProduct = useCallback((productInput: Omit<Product, "id">): Product => {
    const today = new Date().toISOString().split("T")[0]
    // legacy 1行=商材 を分解して v3(Project/Product) に格納
    const pn = productInput.projectNumber || generateProjectNumber(projectEntities)
    const existing = projectEntities.find((p) => p.projectNumber === pn)

    const projectId = existing?.id ?? (projectEntities.reduce((m, p) => Math.max(m, p.id), 0) + 1)
    const hallName = productInput.hallName || productInput.clientName
    const hall = hallName ? halls.find((h) => h.name === hallName) : undefined

    const nextProjectEntities = existing
      ? projectEntities.map((p) => (p.id === existing.id ? ({ ...p, updatedAt: today } as any) : p))
      : [
          ...projectEntities,
          {
            id: projectId,
            projectNumber: pn,
            // 基本情報 = Project属性
            projectName: productInput.projectName,
            companyId: productInput.companyId,
            companyName: productInput.companyName,
            hallName: hallName,
            hallCode: productInput.hallId,
            salesPersonName: productInput.salesPersonName,
            requestDate: productInput.requestDate,
            hallRefId: hall?.id,
            createdAt: today,
            updatedAt: today,
          } as DemoProjectEntity,
        ]

    const nextProductId = productEntities.reduce((m, p) => Math.max(m, p.id), 0) + 1
    const product: DemoProductEntity = {
      id: nextProductId,
      projectId,
      // それ以外 = Product属性
      clientName: productInput.clientName,
      date: productInput.date,
      venue: productInput.venue,
      talent: productInput.talent,
      estimateAmount: productInput.estimateAmount,
      status: productInput.status,
      projectStatus: productInput.projectStatus,
      category: productInput.category,
      eventType: productInput.eventType,
      eventProductName: productInput.eventProductName,
      eventDate: productInput.eventDate,
      estimatedBillingAmount: (productInput as any).estimatedBillingAmount,
      startTime: (productInput as any).startTime,
      endTime: (productInput as any).endTime,
      companionCount: (productInput as any).companionCount,
      directorCount: (productInput as any).directorCount,
      mcCount: (productInput as any).mcCount,
      selectedCompanions: (productInput as any).selectedCompanions,
      selectedDirectors: (productInput as any).selectedDirectors,
      selectedMcs: (productInput as any).selectedMcs,
      nominatedCompanions: (productInput as any).nominatedCompanions,
      nominatedDirectors: (productInput as any).nominatedDirectors,
      nominatedMcs: (productInput as any).nominatedMcs,
      correctionRequest: (productInput as any).correctionRequest,
      correctionComment: (productInput as any).correctionComment,
      temporaryHoldFailureComment: (productInput as any).temporaryHoldFailureComment,
      confirmedCompanions: (productInput as any).confirmedCompanions,
      confirmedDirectors: (productInput as any).confirmedDirectors,
      confirmedMcs: (productInput as any).confirmedMcs,
      companionCostumes: (productInput as any).companionCostumes,
      mustSeeFlag: (productInput as any).mustSeeFlag,
      mustSeePublication: (productInput as any).mustSeePublication,
      publicationDate: (productInput as any).publicationDate,
      publicationTime: (productInput as any).publicationTime,
      reportRequired: (productInput as any).reportRequired,
      pachitownLinked: (productInput as any).pachitownLinked,
      pachitownLinkedDate: (productInput as any).pachitownLinkedDate,
      xAccountPostText: (productInput as any).xAccountPostText,
      surveySent: (productInput as any).surveySent,
      surveySentDate: (productInput as any).surveySentDate,
      surveyResult: (productInput as any).surveyResult,
      castingCost: (productInput as any).castingCost,
      transportationFee: (productInput as any).transportationFee,
      accommodationFee: (productInput as any).accommodationFee,
      postPRCost: (productInput as any).postPRCost,
      isTransportationAutoFilled: (productInput as any).isTransportationAutoFilled,
      isAccommodationAutoFilled: (productInput as any).isAccommodationAutoFilled,
      quoteGenerated: (productInput as any).quoteGenerated,
      quoteData: (productInput as any).quoteData,
      // 合同抽選会フィールド
      hallNames: (productInput as any).hallNames,
      hallQuotes: (productInput as any).hallQuotes,
      prizeInfo: (productInput as any).prizeInfo,
      dmMailing: (productInput as any).dmMailing,
      area: (productInput as any).area,
      readingCertainty: (productInput as any).readingCertainty,
      budget: (productInput as any).budget,
      eventStartDate: (productInput as any).eventStartDate,
      eventEndDate: (productInput as any).eventEndDate,
      executionStatus: (productInput as any).executionStatus,
      castAssignments: (productInput as any).castAssignments,
      posterStatus: (productInput as any).posterStatus,
      dmStatus: (productInput as any).dmStatus,
    }

    setProjectEntities(nextProjectEntities)
    setProductEntities([...productEntities, product])

    const created = denormalizeProjects({ projects: nextProjectEntities, products: [...productEntities, product], halls, companies, productions, companions, employees }).find(
      (p) => p.id === nextProductId,
    )
    if (!created) throw new Error("Failed to create project(product)")
    return created
  }, [companies, generateProjectNumber, halls, productEntities, projectEntities])

  const createProducts = useCallback((newProducts: Omit<Product, "id">[]): Product[] => {
    const created: Product[] = []
    newProducts.forEach((p) => {
      created.push(createProduct(p))
    })
    return created
  }, [createProduct])

  const updateProduct = useCallback((id: number, updates: Partial<Product>): Product | null => {
    const product = productEntities.find((p) => p.id === id)
    if (!product) return null

    const project = projectEntities.find((p) => p.id === product.projectId)
    const today = new Date().toISOString().split("T")[0]
    const projectLevelKeys = new Set([
      "projectNumber",
      "projectName",
      "salesPersonName",
      "requestDate",
      "hallName",
      "hallId",
      "companyId",
      "companyName",
    ])

    const projectUpdates: any = {}
    const productUpdates: any = {}
    Object.entries(updates as any).forEach(([k, v]) => {
      if (projectLevelKeys.has(k as any)) projectUpdates[k] = v
      else productUpdates[k] = v
    })

    const mappedProjectUpdates: any = {}
    Object.entries(projectUpdates).forEach(([k, v]) => {
      if (k === "hallId") mappedProjectUpdates.hallCode = v
      else mappedProjectUpdates[k] = v
    })

    // hallRefId は hallName/hallCode 変更時に更新を試みる（見つからなければそのまま）
    if (mappedProjectUpdates.hallName && typeof mappedProjectUpdates.hallName === "string") {
      const hall = halls.find((h) => h.name === mappedProjectUpdates.hallName)
      if (hall) mappedProjectUpdates.hallRefId = hall.id
    }

    const nextProjects = project
      ? projectEntities.map((p) =>
          p.id === project.id ? ({ ...p, ...mappedProjectUpdates, updatedAt: today } as any) : p,
        )
      : projectEntities

    const nextProducts = productEntities.map((p) => (p.id === id ? ({ ...p, ...productUpdates } as any) : p))

    setProjectEntities(nextProjects)
    setProductEntities(nextProducts)

    const updated = denormalizeProjects({ projects: nextProjects, products: nextProducts, halls, companies, productions, companions, employees }).find((p) => p.id === id) ?? null
    return updated
  }, [companies, halls, productEntities, projectEntities])

  // Alias for updateProduct (for backward compatibility and semantic clarity in lottery admin context)
  const updateProject = updateProduct

  const deleteProduct = useCallback((id: number): boolean => {
    const product = productEntities.find((p) => p.id === id)
    if (!product) return false
    const nextProducts = productEntities.filter((p) => p.id !== id)
    const stillHasProducts = nextProducts.some((p) => p.projectId === product.projectId)
    const nextProjects = stillHasProducts ? projectEntities : projectEntities.filter((p) => p.id !== product.projectId)
    setProductEntities(nextProducts)
    setProjectEntities(nextProjects)
    return true
  }, [productEntities, projectEntities])

  const getProductById = useCallback((id: number): Product | null => {
    return denormalizedProducts.find((p) => p.id === id) ?? null
  }, [denormalizedProducts])

  // ホールデータ操作関数
  const getHalls = useCallback(() => {
    return halls
  }, [halls])

  const getHallByName = useCallback((name: string): HallData | null => {
    return findHallByNameRepo(halls, name)
  }, [halls])

  const searchHalls = useCallback((query: string, companyId?: number): HallData[] => {
    return searchHallsRepo(halls, query, companyId)
  }, [halls])

  // 法人データ操作関数
  const getCompanies = useCallback(() => {
    return companies
  }, [companies])

  const getCompanyById = useCallback((id: number): CompanyData | null => {
    return findCompanyByIdRepo(companies, id)
  }, [companies])

  const getCompanyByCompanyId = useCallback((companyId: string): CompanyData | null => {
    return findCompanyByCompanyIdRepo(companies, companyId)
  }, [companies])

  const searchCompanies = useCallback((query: string): CompanyData[] => {
    return searchCompaniesRepo(companies, query)
  }, [companies])

  const getHallsByCompanyId = useCallback((companyId: number): HallData[] => {
    return getHallsByCompanyIdRepo(halls, companyId)
  }, [halls])

  // 合同抽選会：デザイン依頼関連
  const getDesignRequests = useCallback((): DesignRequest[] => {
    return designRequests
  }, [designRequests])

  const getDesignRequestById = useCallback((id: string): DesignRequest | null => {
    return designRequests.find((r) => r.id === id) || null
  }, [designRequests])

  const getDesignRequestsByVendorId = useCallback((vendorId: string): DesignRequest[] => {
    return designRequests.filter((r) => r.vendorId === vendorId)
  }, [designRequests])

  const getDesignRequestsByProjectId = useCallback((projectId: number): DesignRequest[] => {
    return designRequests.filter((r) => r.projectId === projectId)
  }, [designRequests])

  const getDesignRequestsByProjectAndType = useCallback((projectId: number, type: string): DesignRequest[] => {
    return designRequests.filter((r) => r.projectId === projectId && r.requestType === type)
  }, [designRequests])

  const createDesignRequest = useCallback((request: Omit<DesignRequest, "id">): DesignRequest => {
    const newRequest: DesignRequest = {
      ...request,
      id: `dr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    }
    setDesignRequests((prev) => [...prev, newRequest])
    return newRequest
  }, [])

  const updateDesignRequest = useCallback((id: string, updates: Partial<DesignRequest>): DesignRequest | null => {
    let updated: DesignRequest | null = null
    setDesignRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          updated = { ...r, ...updates }
          return updated
        }
        return r
      })
    )
    return updated
  }, [])

  const addDesignRequestComment = useCallback(
    (requestId: string, comment: Omit<DesignRequestComment, "id">): DesignRequest | null => {
      const newComment: DesignRequestComment = {
        ...comment,
        id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      }
      let updated: DesignRequest | null = null
      setDesignRequests((prev) =>
        prev.map((r) => {
          if (r.id === requestId) {
            updated = {
              ...r,
              comments: [...r.comments, newComment],
            }
            return updated
          }
          return r
        })
      )
      return updated
    },
    []
  )

  // 合同抽選会：マスタデータ関連
  const getPrizeVendors = useCallback((): PrizeVendorData[] => {
    return prizeVendors
  }, [prizeVendors])

  const getPrizes = useCallback((): PrizeData[] => {
    return prizes
  }, [prizes])

  const getTradingPartners = useCallback((): TradingPartnerData[] => {
    return tradingPartners
  }, [tradingPartners])

  const getTradingPartnersByIndustry = useCallback(
    (industry: "printing" | "design" | "prize"): TradingPartnerData[] => {
      return tradingPartners.filter((p) => p.industry === industry)
    },
    [tradingPartners]
  )

  return (
    <ProjectContext.Provider
      value={{
        projectData,
        setProjectData,
        currentRole,
        setCurrentRole,
        currentGoudouRole,
        setCurrentGoudouRole,
        notifications,
        addNotification,
        resetDemoData,
        refreshFromStorage,
        projects,
        getProjectById,
        getProjects,
        getProjectByProjectNumber,
        getProducts,
        createProduct,
        createProducts,
        updateProduct,
        updateProject,
        deleteProduct,
        getProductById,
        generateProjectNumber,
        getHalls,
        getHallByName,
        searchHalls,
        getCompanies,
        getCompanyById,
        getCompanyByCompanyId,
        searchCompanies,
        getHallsByCompanyId,
        getProductions,
        getCompanions,
        getEmployees,
        getEmployeeById,
        getEmployeeByName,
        searchEmployees,
        // 合同抽選会：デザイン依頼
        designRequests,
        getDesignRequests,
        getDesignRequestById,
        getDesignRequestsByVendorId,
        getDesignRequestsByProjectId,
        getDesignRequestsByProjectAndType,
        createDesignRequest,
        updateDesignRequest,
        addDesignRequestComment,
        // 合同抽選会：マスタデータ
        getPrizeVendors,
        getPrizes,
        getTradingPartners,
        getTradingPartnersByIndustry,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}
