"use client"

import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import type { ProjectData, Role } from "@/types/project"
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
} from "@/lib/demo-db/types"
import { denormalizeProjects, type DemoDbV3Data } from "@/lib/demo-db/denormalize"
import {
  findCompanyByCompanyId as findCompanyByCompanyIdRepo,
  findCompanyById as findCompanyByIdRepo,
  findHallByName as findHallByNameRepo,
  getHallsByCompanyId as getHallsByCompanyIdRepo,
  searchCompanies as searchCompaniesRepo,
  searchHalls as searchHallsRepo,
} from "@/lib/demo-db/repository"

type Product = DemoProject

export type { CompanyData, HallData, EmployeeData }

type ProjectContextType = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  currentRole: Role | null
  setCurrentRole: (role: Role | null) => void
  notifications: string[]
  addNotification: (message: string) => void
  // デモ用擬似DBの操作
  resetDemoData: () => void
  // 案件(Project)操作関数（正規化）
  getProjects: () => DemoProjectEntity[]
  getProjectByProjectNumber: (projectNumber: string) => DemoProjectEntity | null
  // 商材(Product)操作関数（UIが主に扱う）
  getProducts: () => Product[]
  createProduct: (product: Omit<Product, "id">) => Product
  createProducts: (products: Omit<Product, "id">[]) => Product[]
  updateProduct: (id: number, updates: Partial<Product>) => Product | null
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
      const addressBase = wardMap[location] || "東京都"

      halls.push({
        id: hallCounter,
        hallId: `${company.companyId}-HALL-${hallNumber}`, // ホールIDを生成
        name: `${company.name.replace("株式会社", "")}${location}`,
        address: `${addressBase}${String(i).padStart(2, "0")}-1-1`,
        email: `${company.companyId.toLowerCase()}-hall-${hallNumber}@example.com`, // デモ用メールアドレス
        salesPersonName: employeeNames[salesPersonIndex],
        companyId: company.id,
        discountAmount: generateRandomDiscount(), // 5000円〜50000円のランダムな割引金額
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

// 初期データ（10ホール × 2案件 × 3商材 = 60商材）: 旧形式（1行=商材）
const initialProjects: Product[] = [
  // マルハン渋谷店 - 山田 太郎
  // 案件No 1
  {
    id: 1,
    projectNumber: "1",
    projectName: "新台入替キャンペーン①",
    clientName: "マルハン渋谷店",
    date: "2025/12/10",
    venue: "パチンコ店舗フロア",
    talent: "山田 太郎",
    estimateAmount: "¥650,000",
    status: "proposed",
    salesPersonName: "山田 太郎",
    requestDate: "2025/11/01",
    hallName: "マルハン渋谷店",
    projectStatus: "仮押さえ済み",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新台入替キャンペーン①",
    eventDate: "2025/12/10",
    estimatedBillingAmount: 650000,
    ...getCompanyAndHallInfo("マルハン渋谷店"),
  },
  {
    id: 2,
    projectNumber: "1",
    projectName: "新台入替キャンペーン②",
    clientName: "マルハン渋谷店",
    date: "2025/12/15",
    venue: "パチンコ店舗フロア",
    talent: "山田 太郎",
    estimateAmount: "¥580,000",
    status: "ordered",
    salesPersonName: "山田 太郎",
    requestDate: "2025/11/01",
    hallName: "マルハン渋谷店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新台入替キャンペーン②",
    eventDate: "2025/12/15",
    estimatedBillingAmount: 580000,
    ...getCompanyAndHallInfo("マルハン渋谷店"),
  },
  {
    id: 3,
    projectNumber: "1",
    projectName: "新台入替キャンペーン③",
    clientName: "マルハン渋谷店",
    date: "2025/12/20",
    venue: "パチンコ店舗フロア",
    talent: "山田 太郎",
    estimateAmount: "¥720,000",
    status: "proposed",
    salesPersonName: "山田 太郎",
    requestDate: "2025/11/01",
    hallName: "マルハン渋谷店",
    projectStatus: "見込み入力完了",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新台入替キャンペーン③",
    eventDate: "2025/12/20",
    estimatedBillingAmount: 720000,
    ...getCompanyAndHallInfo("マルハン渋谷店"),
  },
  // 案件No 2
  {
    id: 4,
    projectNumber: "4",
    projectName: "年末年始イベント①",
    clientName: "マルハン渋谷店",
    date: "2025/12/28",
    venue: "パチンコ店舗フロア",
    talent: "山田 太郎",
    estimateAmount: "¥550,000",
    status: "ordered",
    salesPersonName: "山田 太郎",
    requestDate: "2025/11/15",
    hallName: "マルハン渋谷店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "年末年始イベント①",
    eventDate: "2025/12/28",
    estimatedBillingAmount: 550000,
    ...getCompanyAndHallInfo("マルハン渋谷店"),
  },
  {
    id: 5,
    projectNumber: "4",
    projectName: "年末年始イベント②",
    clientName: "マルハン渋谷店",
    date: "2026/01/03",
    venue: "パチンコ店舗フロア",
    talent: "山田 太郎",
    estimateAmount: "¥480,000",
    status: "ordered",
    salesPersonName: "山田 太郎",
    requestDate: "2025/11/15",
    hallName: "マルハン渋谷店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "年末年始イベント②",
    eventDate: "2026/01/03",
    estimatedBillingAmount: 480000,
    ...getCompanyAndHallInfo("マルハン渋谷店"),
  },
  {
    id: 6,
    projectNumber: "4",
    projectName: "年末年始イベント③",
    clientName: "マルハン渋谷店",
    date: "2026/01/05",
    venue: "パチンコ店舗フロア",
    talent: "山田 太郎",
    estimateAmount: "¥620,000",
    status: "ordered",
    salesPersonName: "山田 太郎",
    requestDate: "2025/11/15",
    hallName: "マルハン渋谷店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "年末年始イベント③",
    eventDate: "2026/01/05",
    estimatedBillingAmount: 620000,
    ...getCompanyAndHallInfo("マルハン渋谷店"),
  },
  // ダイナム新宿店 - 佐藤 次郎
  // 案件No 3
  {
    id: 7,
    projectNumber: "8",
    projectName: "グランドオープン記念①",
    clientName: "ダイナム新宿店",
    date: "2026/01/15",
    venue: "パチンコ店舗エントランス",
    talent: "佐藤 次郎",
    estimateAmount: "¥680,000",
    status: "proposed",
    salesPersonName: "佐藤 次郎",
    requestDate: "2025/12/01",
    hallName: "ダイナム新宿店",
    projectStatus: "仮押さえ済み",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "グランドオープン記念①",
    eventDate: "2026/01/15",
    estimatedBillingAmount: 680000,
    ...getCompanyAndHallInfo("ダイナム新宿店"),
  },
  {
    id: 8,
    projectNumber: "8",
    projectName: "グランドオープン記念②",
    clientName: "ダイナム新宿店",
    date: "2026/01/20",
    venue: "パチンコ店舗エントランス",
    talent: "佐藤 次郎",
    estimateAmount: "¥590,000",
    status: "ordered",
    salesPersonName: "佐藤 次郎",
    requestDate: "2025/12/01",
    hallName: "ダイナム新宿店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "グランドオープン記念②",
    eventDate: "2026/01/20",
    estimatedBillingAmount: 590000,
    ...getCompanyAndHallInfo("ダイナム新宿店"),
  },
  {
    id: 9,
    projectNumber: "8",
    projectName: "グランドオープン記念③",
    clientName: "ダイナム新宿店",
    date: "2026/01/25",
    venue: "パチンコ店舗エントランス",
    talent: "佐藤 次郎",
    estimateAmount: "¥750,000",
    status: "proposed",
    salesPersonName: "佐藤 次郎",
    requestDate: "2025/12/01",
    hallName: "ダイナム新宿店",
    projectStatus: "見込み入力完了",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "グランドオープン記念③",
    eventDate: "2026/01/25",
    estimatedBillingAmount: 750000,
    ...getCompanyAndHallInfo("ダイナム新宿店"),
  },
  // 案件No 4
  {
    id: 10,
    projectNumber: "10",
    projectName: "新春セールイベント①",
    clientName: "ダイナム新宿店",
    date: "2026/01/05",
    venue: "パチンコ店舗フロア",
    talent: "佐藤 次郎",
    estimateAmount: "¥520,000",
    status: "ordered",
    salesPersonName: "佐藤 次郎",
    requestDate: "2025/12/10",
    hallName: "ダイナム新宿店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新春セールイベント①",
    eventDate: "2026/01/05",
    estimatedBillingAmount: 520000,
    ...getCompanyAndHallInfo("ダイナム新宿店"),
  },
  {
    id: 11,
    projectNumber: "10",
    projectName: "新春セールイベント②",
    clientName: "ダイナム新宿店",
    date: "2026/01/10",
    venue: "パチンコ店舗フロア",
    talent: "佐藤 次郎",
    estimateAmount: "¥450,000",
    status: "ordered",
    salesPersonName: "佐藤 次郎",
    requestDate: "2025/12/10",
    hallName: "ダイナム新宿店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新春セールイベント②",
    eventDate: "2026/01/10",
    estimatedBillingAmount: 450000,
    ...getCompanyAndHallInfo("ダイナム新宿店"),
  },
  {
    id: 12,
    projectNumber: "10",
    projectName: "新春セールイベント③",
    clientName: "ダイナム新宿店",
    date: "2026/01/12",
    venue: "パチンコ店舗フロア",
    talent: "佐藤 次郎",
    estimateAmount: "¥640,000",
    status: "ordered",
    salesPersonName: "佐藤 次郎",
    requestDate: "2025/12/10",
    hallName: "ダイナム新宿店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新春セールイベント③",
    eventDate: "2026/01/12",
    estimatedBillingAmount: 640000,
    ...getCompanyAndHallInfo("ダイナム新宿店"),
  },
  // ガイア池袋店 - 鈴木 三郎
  // 案件No 5
  {
    id: 13,
    projectNumber: "2",
    projectName: "新機種導入イベント①",
    clientName: "ガイア池袋店",
    date: "2026/02/20",
    venue: "パチンコ店舗特設ステージ",
    talent: "鈴木 三郎",
    estimateAmount: "¥600,000",
    status: "proposed",
    salesPersonName: "鈴木 三郎",
    requestDate: "2025/11/05",
    hallName: "ガイア池袋店",
    projectStatus: "仮押さえ済み",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新機種導入イベント①",
    eventDate: "2026/02/20",
    estimatedBillingAmount: 600000,
    ...getCompanyAndHallInfo("ガイア池袋店"),
  },
  {
    id: 14,
    projectNumber: "2",
    projectName: "新機種導入イベント②",
    clientName: "ガイア池袋店",
    date: "2026/02/25",
    venue: "パチンコ店舗特設ステージ",
    talent: "鈴木 三郎",
    estimateAmount: "¥510,000",
    status: "ordered",
    salesPersonName: "鈴木 三郎",
    requestDate: "2025/11/05",
    hallName: "ガイア池袋店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新機種導入イベント②",
    eventDate: "2026/02/25",
    estimatedBillingAmount: 510000,
    ...getCompanyAndHallInfo("ガイア池袋店"),
  },
  {
    id: 15,
    projectNumber: "2",
    projectName: "新機種導入イベント③",
    clientName: "ガイア池袋店",
    date: "2026/03/01",
    venue: "パチンコ店舗特設ステージ",
    talent: "鈴木 三郎",
    estimateAmount: "¥670,000",
    status: "proposed",
    salesPersonName: "鈴木 三郎",
    requestDate: "2025/11/05",
    hallName: "ガイア池袋店",
    projectStatus: "見込み入力完了",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新機種導入イベント③",
    eventDate: "2026/03/01",
    estimatedBillingAmount: 670000,
    ...getCompanyAndHallInfo("ガイア池袋店"),
  },
  // 案件No 6
  {
    id: 16,
    projectNumber: "3",
    projectName: "桜まつりイベント①",
    clientName: "ガイア池袋店",
    date: "2026/03/25",
    venue: "パチンコ店舗フロア",
    talent: "鈴木 三郎",
    estimateAmount: "¥630,000",
    status: "ordered",
    salesPersonName: "鈴木 三郎",
    requestDate: "2025/11/10",
    hallName: "ガイア池袋店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "桜まつりイベント①",
    eventDate: "2026/03/25",
    estimatedBillingAmount: 630000,
    ...getCompanyAndHallInfo("ガイア池袋店"),
  },
  {
    id: 17,
    projectNumber: "3",
    projectName: "桜まつりイベント②",
    clientName: "ガイア池袋店",
    date: "2026/03/30",
    venue: "パチンコ店舗フロア",
    talent: "鈴木 三郎",
    estimateAmount: "¥560,000",
    status: "ordered",
    salesPersonName: "鈴木 三郎",
    requestDate: "2025/11/10",
    hallName: "ガイア池袋店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "桜まつりイベント②",
    eventDate: "2026/03/30",
    estimatedBillingAmount: 560000,
    ...getCompanyAndHallInfo("ガイア池袋店"),
  },
  {
    id: 18,
    projectNumber: "3",
    projectName: "桜まつりイベント③",
    clientName: "ガイア池袋店",
    date: "2026/04/05",
    venue: "パチンコ店舗フロア",
    talent: "鈴木 三郎",
    estimateAmount: "¥610,000",
    status: "ordered",
    salesPersonName: "鈴木 三郎",
    requestDate: "2025/11/10",
    hallName: "ガイア池袋店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "桜まつりイベント③",
    eventDate: "2026/04/05",
    estimatedBillingAmount: 610000,
    ...getCompanyAndHallInfo("ガイア池袋店"),
  },
  // パチンコエース上野店 - 高橋 四郎
  // 案件No 7
  {
    id: 19,
    projectNumber: "9",
    projectName: "リニューアルオープン記念①",
    clientName: "パチンコエース上野店",
    date: "2026/01/20",
    venue: "パチンコ店舗エントランス",
    talent: "高橋 四郎",
    estimateAmount: "¥640,000",
    status: "proposed",
    salesPersonName: "高橋 四郎",
    requestDate: "2025/12/05",
    hallName: "パチンコエース上野店",
    projectStatus: "仮押さえ済み",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "リニューアルオープン記念①",
    eventDate: "2026/01/20",
    estimatedBillingAmount: 640000,
    ...getCompanyAndHallInfo("パチンコエース上野店"),
  },
  {
    id: 20,
    projectNumber: "9",
    projectName: "リニューアルオープン記念②",
    clientName: "パチンコエース上野店",
    date: "2026/01/25",
    venue: "パチンコ店舗エントランス",
    talent: "高橋 四郎",
    estimateAmount: "¥570,000",
    status: "ordered",
    salesPersonName: "高橋 四郎",
    requestDate: "2025/12/05",
    hallName: "パチンコエース上野店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "リニューアルオープン記念②",
    eventDate: "2026/01/25",
    estimatedBillingAmount: 570000,
    ...getCompanyAndHallInfo("パチンコエース上野店"),
  },
  {
    id: 21,
    projectNumber: "9",
    projectName: "リニューアルオープン記念③",
    clientName: "パチンコエース上野店",
    date: "2026/01/30",
    venue: "パチンコ店舗エントランス",
    talent: "高橋 四郎",
    estimateAmount: "¥600,000",
    status: "proposed",
    salesPersonName: "高橋 四郎",
    requestDate: "2025/12/05",
    hallName: "パチンコエース上野店",
    projectStatus: "見積送付完了",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "リニューアルオープン記念③",
    eventDate: "2026/01/30",
    estimatedBillingAmount: 600000,
    ...getCompanyAndHallInfo("パチンコエース上野店"),
  },
  // 案件No 8
  {
    id: 22,
    projectNumber: "4",
    projectName: "節分イベント①",
    clientName: "パチンコエース上野店",
    date: "2026/02/03",
    venue: "パチンコ店舗フロア",
    talent: "高橋 四郎",
    estimateAmount: "¥550,000",
    status: "ordered",
    salesPersonName: "高橋 四郎",
    requestDate: "2025/11/15",
    hallName: "パチンコエース上野店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "節分イベント①",
    eventDate: "2026/02/03",
    estimatedBillingAmount: 550000,
    ...getCompanyAndHallInfo("パチンコエース上野店"),
  },
  {
    id: 23,
    projectNumber: "4",
    projectName: "節分イベント②",
    clientName: "パチンコエース上野店",
    date: "2026/02/05",
    venue: "パチンコ店舗フロア",
    talent: "高橋 四郎",
    estimateAmount: "¥720,000",
    status: "ordered",
    salesPersonName: "高橋 四郎",
    requestDate: "2025/11/15",
    hallName: "パチンコエース上野店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "節分イベント②",
    eventDate: "2026/02/05",
    estimatedBillingAmount: 720000,
    ...getCompanyAndHallInfo("パチンコエース上野店"),
  },
  {
    id: 24,
    projectNumber: "4",
    projectName: "節分イベント③",
    clientName: "パチンコエース上野店",
    date: "2026/02/08",
    venue: "パチンコ店舗フロア",
    talent: "高橋 四郎",
    estimateAmount: "¥660,000",
    status: "ordered",
    salesPersonName: "高橋 四郎",
    requestDate: "2025/11/15",
    hallName: "パチンコエース上野店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "節分イベント③",
    eventDate: "2026/02/08",
    estimatedBillingAmount: 660000,
    ...getCompanyAndHallInfo("パチンコエース上野店"),
  },
  // サンライズ錦糸町店 - 伊藤 五郎
  // 案件No 9
  {
    id: 25,
    projectNumber: "5",
    projectName: "開店記念イベント①",
    clientName: "サンライズ錦糸町店",
    date: "2026/02/10",
    venue: "パチンコ店舗エントランス",
    talent: "伊藤 五郎",
    estimateAmount: "¥680,000",
    status: "proposed",
    salesPersonName: "伊藤 五郎",
    requestDate: "2025/11/20",
    hallName: "サンライズ錦糸町店",
    projectStatus: "仮押さえ済み",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "開店記念イベント①",
    eventDate: "2026/02/10",
    estimatedBillingAmount: 680000,
    ...getCompanyAndHallInfo("サンライズ錦糸町店"),
  },
  {
    id: 26,
    projectNumber: "5",
    projectName: "開店記念イベント②",
    clientName: "サンライズ錦糸町店",
    date: "2026/02/15",
    venue: "パチンコ店舗エントランス",
    talent: "伊藤 五郎",
    estimateAmount: "¥590,000",
    status: "ordered",
    salesPersonName: "伊藤 五郎",
    requestDate: "2025/11/20",
    hallName: "サンライズ錦糸町店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "開店記念イベント②",
    eventDate: "2026/02/15",
    estimatedBillingAmount: 590000,
    ...getCompanyAndHallInfo("サンライズ錦糸町店"),
  },
  {
    id: 27,
    projectNumber: "5",
    projectName: "開店記念イベント③",
    clientName: "サンライズ錦糸町店",
    date: "2026/02/20",
    venue: "パチンコ店舗エントランス",
    talent: "伊藤 五郎",
    estimateAmount: "¥750,000",
    status: "proposed",
    salesPersonName: "伊藤 五郎",
    requestDate: "2025/11/20",
    hallName: "サンライズ錦糸町店",
    projectStatus: "見積送付完了",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "開店記念イベント③",
    eventDate: "2026/02/20",
    estimatedBillingAmount: 750000,
    ...getCompanyAndHallInfo("サンライズ錦糸町店"),
  },
  // 案件No 10
  {
    id: 28,
    projectNumber: "6",
    projectName: "ひなまつりイベント①",
    clientName: "サンライズ錦糸町店",
    date: "2026/03/03",
    venue: "パチンコ店舗フロア",
    talent: "伊藤 五郎",
    estimateAmount: "¥520,000",
    status: "ordered",
    salesPersonName: "伊藤 五郎",
    requestDate: "2025/11/25",
    hallName: "サンライズ錦糸町店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "ひなまつりイベント①",
    eventDate: "2026/03/03",
    estimatedBillingAmount: 520000,
    ...getCompanyAndHallInfo("サンライズ錦糸町店"),
  },
  {
    id: 29,
    projectNumber: "6",
    projectName: "ひなまつりイベント②",
    clientName: "サンライズ錦糸町店",
    date: "2026/03/05",
    venue: "パチンコ店舗フロア",
    talent: "伊藤 五郎",
    estimateAmount: "¥450,000",
    status: "ordered",
    salesPersonName: "伊藤 五郎",
    requestDate: "2025/11/25",
    hallName: "サンライズ錦糸町店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "ひなまつりイベント②",
    eventDate: "2026/03/05",
    estimatedBillingAmount: 450000,
    ...getCompanyAndHallInfo("サンライズ錦糸町店"),
  },
  {
    id: 30,
    projectNumber: "6",
    projectName: "ひなまつりイベント③",
    clientName: "サンライズ錦糸町店",
    date: "2026/03/08",
    venue: "パチンコ店舗フロア",
    talent: "伊藤 五郎",
    estimateAmount: "¥640,000",
    status: "ordered",
    salesPersonName: "伊藤 五郎",
    requestDate: "2025/11/25",
    hallName: "サンライズ錦糸町店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "ひなまつりイベント③",
    eventDate: "2026/03/08",
    estimatedBillingAmount: 640000,
    ...getCompanyAndHallInfo("サンライズ錦糸町店"),
  },
  // ビッグエース新橋店 - 渡辺 六郎
  // 案件No 11
  {
    id: 31,
    projectNumber: "2",
    projectName: "開店記念イベント①",
    clientName: "ビッグエース新橋店",
    date: "2026/02/15",
    venue: "パチンコ店舗エントランス",
    talent: "渡辺 六郎",
    estimateAmount: "¥600,000",
    status: "proposed",
    salesPersonName: "渡辺 六郎",
    requestDate: "2025/11/05",
    hallName: "ビッグエース新橋店",
    projectStatus: "仮押さえ済み",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "開店記念イベント①",
    eventDate: "2026/02/15",
    estimatedBillingAmount: 600000,
    ...getCompanyAndHallInfo("ビッグエース新橋店"),
  },
  {
    id: 32,
    projectNumber: "2",
    projectName: "開店記念イベント②",
    clientName: "ビッグエース新橋店",
    date: "2026/02/20",
    venue: "パチンコ店舗エントランス",
    talent: "渡辺 六郎",
    estimateAmount: "¥510,000",
    status: "ordered",
    salesPersonName: "渡辺 六郎",
    requestDate: "2025/11/05",
    hallName: "ビッグエース新橋店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "開店記念イベント②",
    eventDate: "2026/02/20",
    estimatedBillingAmount: 510000,
    ...getCompanyAndHallInfo("ビッグエース新橋店"),
  },
  {
    id: 33,
    projectNumber: "2",
    projectName: "開店記念イベント③",
    clientName: "ビッグエース新橋店",
    date: "2026/02/25",
    venue: "パチンコ店舗エントランス",
    talent: "渡辺 六郎",
    estimateAmount: "¥670,000",
    status: "proposed",
    salesPersonName: "渡辺 六郎",
    requestDate: "2025/11/05",
    hallName: "ビッグエース新橋店",
    projectStatus: "見積送付完了",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "開店記念イベント③",
    eventDate: "2026/02/25",
    estimatedBillingAmount: 670000,
    ...getCompanyAndHallInfo("ビッグエース新橋店"),
  },
  // 案件No 12
  {
    id: 34,
    projectNumber: "7",
    projectName: "春のキャンペーン①",
    clientName: "ビッグエース新橋店",
    date: "2026/04/10",
    venue: "パチンコ店舗フロア",
    talent: "渡辺 六郎",
    estimateAmount: "¥630,000",
    status: "ordered",
    salesPersonName: "渡辺 六郎",
    requestDate: "2025/11/30",
    hallName: "ビッグエース新橋店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "春のキャンペーン①",
    eventDate: "2026/04/10",
    estimatedBillingAmount: 630000,
    ...getCompanyAndHallInfo("ビッグエース新橋店"),
  },
  {
    id: 35,
    projectNumber: "7",
    projectName: "春のキャンペーン②",
    clientName: "ビッグエース新橋店",
    date: "2026/04/15",
    venue: "パチンコ店舗フロア",
    talent: "渡辺 六郎",
    estimateAmount: "¥560,000",
    status: "ordered",
    salesPersonName: "渡辺 六郎",
    requestDate: "2025/11/30",
    hallName: "ビッグエース新橋店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "春のキャンペーン②",
    eventDate: "2026/04/15",
    estimatedBillingAmount: 560000,
    ...getCompanyAndHallInfo("ビッグエース新橋店"),
  },
  {
    id: 36,
    projectNumber: "7",
    projectName: "春のキャンペーン③",
    clientName: "ビッグエース新橋店",
    date: "2026/04/20",
    venue: "パチンコ店舗フロア",
    talent: "渡辺 六郎",
    estimateAmount: "¥610,000",
    status: "ordered",
    salesPersonName: "渡辺 六郎",
    requestDate: "2025/11/30",
    hallName: "ビッグエース新橋店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "春のキャンペーン③",
    eventDate: "2026/04/20",
    estimatedBillingAmount: 610000,
    ...getCompanyAndHallInfo("ビッグエース新橋店"),
  },
  // パチンコランド横浜店 - 中村 七郎
  // 案件No 13
  {
    id: 37,
    projectNumber: "9",
    projectName: "新台入替キャンペーン①",
    clientName: "パチンコランド横浜店",
    date: "2026/03/05",
    venue: "パチンコ店舗フロア",
    talent: "中村 七郎",
    estimateAmount: "¥640,000",
    status: "proposed",
    salesPersonName: "中村 七郎",
    requestDate: "2025/12/05",
    hallName: "パチンコランド横浜店",
    projectStatus: "仮押さえ済み",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新台入替キャンペーン①",
    eventDate: "2026/03/05",
    estimatedBillingAmount: 640000,
    ...getCompanyAndHallInfo("パチンコランド横浜店"),
  },
  {
    id: 38,
    projectNumber: "9",
    projectName: "新台入替キャンペーン②",
    clientName: "パチンコランド横浜店",
    date: "2026/03/10",
    venue: "パチンコ店舗フロア",
    talent: "中村 七郎",
    estimateAmount: "¥570,000",
    status: "ordered",
    salesPersonName: "中村 七郎",
    requestDate: "2025/12/05",
    hallName: "パチンコランド横浜店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新台入替キャンペーン②",
    eventDate: "2026/03/10",
    estimatedBillingAmount: 570000,
    ...getCompanyAndHallInfo("パチンコランド横浜店"),
  },
  {
    id: 39,
    projectNumber: "9",
    projectName: "新台入替キャンペーン③",
    clientName: "パチンコランド横浜店",
    date: "2026/03/15",
    venue: "パチンコ店舗フロア",
    talent: "中村 七郎",
    estimateAmount: "¥600,000",
    status: "proposed",
    salesPersonName: "中村 七郎",
    requestDate: "2025/12/05",
    hallName: "パチンコランド横浜店",
    projectStatus: "見積送付完了",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新台入替キャンペーン③",
    eventDate: "2026/03/15",
    estimatedBillingAmount: 600000,
    ...getCompanyAndHallInfo("パチンコランド横浜店"),
  },
  // 案件No 14
  {
    id: 40,
    projectNumber: "10",
    projectName: "夏祭りイベント①",
    clientName: "パチンコランド横浜店",
    date: "2026/07/20",
    venue: "パチンコ店舗フロア",
    talent: "中村 七郎",
    estimateAmount: "¥550,000",
    status: "ordered",
    salesPersonName: "中村 七郎",
    requestDate: "2025/12/10",
    hallName: "パチンコランド横浜店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "夏祭りイベント①",
    eventDate: "2026/07/20",
    estimatedBillingAmount: 550000,
    ...getCompanyAndHallInfo("パチンコランド横浜店"),
  },
  {
    id: 41,
    projectNumber: "10",
    projectName: "夏祭りイベント②",
    clientName: "パチンコランド横浜店",
    date: "2026/07/25",
    venue: "パチンコ店舗フロア",
    talent: "中村 七郎",
    estimateAmount: "¥720,000",
    status: "ordered",
    salesPersonName: "中村 七郎",
    requestDate: "2025/12/10",
    hallName: "パチンコランド横浜店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "夏祭りイベント②",
    eventDate: "2026/07/25",
    estimatedBillingAmount: 720000,
    ...getCompanyAndHallInfo("パチンコランド横浜店"),
  },
  {
    id: 42,
    projectNumber: "10",
    projectName: "夏祭りイベント③",
    clientName: "パチンコランド横浜店",
    date: "2026/07/30",
    venue: "パチンコ店舗フロア",
    talent: "中村 七郎",
    estimateAmount: "¥660,000",
    status: "ordered",
    salesPersonName: "中村 七郎",
    requestDate: "2025/12/10",
    hallName: "パチンコランド横浜店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "夏祭りイベント③",
    eventDate: "2026/07/30",
    estimatedBillingAmount: 660000,
    ...getCompanyAndHallInfo("パチンコランド横浜店"),
  },
  // エースパチンコ川崎店 - 小林 八郎
  // 案件No 15
  {
    id: 43,
    projectNumber: "11",
    projectName: "グランドオープン記念①",
    clientName: "エースパチンコ川崎店",
    date: "2026/04/20",
    venue: "パチンコ店舗エントランス",
    talent: "小林 八郎",
    estimateAmount: "¥680,000",
    status: "proposed",
    salesPersonName: "小林 八郎",
    requestDate: "2025/12/15",
    hallName: "エースパチンコ川崎店",
    projectStatus: "仮押さえ済み",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "グランドオープン記念①",
    eventDate: "2026/04/20",
    estimatedBillingAmount: 680000,
    ...getCompanyAndHallInfo("エースパチンコ川崎店"),
  },
  {
    id: 44,
    projectNumber: "11",
    projectName: "グランドオープン記念②",
    clientName: "エースパチンコ川崎店",
    date: "2026/04/25",
    venue: "パチンコ店舗エントランス",
    talent: "小林 八郎",
    estimateAmount: "¥590,000",
    status: "ordered",
    salesPersonName: "小林 八郎",
    requestDate: "2025/12/15",
    hallName: "エースパチンコ川崎店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "グランドオープン記念②",
    eventDate: "2026/04/25",
    estimatedBillingAmount: 590000,
    ...getCompanyAndHallInfo("エースパチンコ川崎店"),
  },
  {
    id: 45,
    projectNumber: "11",
    projectName: "グランドオープン記念③",
    clientName: "エースパチンコ川崎店",
    date: "2026/04/30",
    venue: "パチンコ店舗エントランス",
    talent: "小林 八郎",
    estimateAmount: "¥750,000",
    status: "proposed",
    salesPersonName: "小林 八郎",
    requestDate: "2025/12/15",
    hallName: "エースパチンコ川崎店",
    projectStatus: "見積送付完了",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "グランドオープン記念③",
    eventDate: "2026/04/30",
    estimatedBillingAmount: 750000,
    ...getCompanyAndHallInfo("エースパチンコ川崎店"),
  },
  // 案件No 16
  {
    id: 46,
    projectNumber: "12",
    projectName: "秋のキャンペーン①",
    clientName: "エースパチンコ川崎店",
    date: "2026/10/10",
    venue: "パチンコ店舗フロア",
    talent: "小林 八郎",
    estimateAmount: "¥520,000",
    status: "ordered",
    salesPersonName: "小林 八郎",
    requestDate: "2025/12/20",
    hallName: "エースパチンコ川崎店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "秋のキャンペーン①",
    eventDate: "2026/10/10",
    estimatedBillingAmount: 520000,
    ...getCompanyAndHallInfo("エースパチンコ川崎店"),
  },
  {
    id: 47,
    projectNumber: "12",
    projectName: "秋のキャンペーン②",
    clientName: "エースパチンコ川崎店",
    date: "2026/10/15",
    venue: "パチンコ店舗フロア",
    talent: "小林 八郎",
    estimateAmount: "¥450,000",
    status: "ordered",
    salesPersonName: "小林 八郎",
    requestDate: "2025/12/20",
    hallName: "エースパチンコ川崎店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "秋のキャンペーン②",
    eventDate: "2026/10/15",
    estimatedBillingAmount: 450000,
    ...getCompanyAndHallInfo("エースパチンコ川崎店"),
  },
  {
    id: 48,
    projectNumber: "12",
    projectName: "秋のキャンペーン③",
    clientName: "エースパチンコ川崎店",
    date: "2026/10/20",
    venue: "パチンコ店舗フロア",
    talent: "小林 八郎",
    estimateAmount: "¥640,000",
    status: "ordered",
    salesPersonName: "小林 八郎",
    requestDate: "2025/12/20",
    hallName: "エースパチンコ川崎店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "秋のキャンペーン③",
    eventDate: "2026/10/20",
    estimatedBillingAmount: 640000,
    ...getCompanyAndHallInfo("エースパチンコ川崎店"),
  },
  // パチンコワールド大宮店 - 加藤 九郎
  // 案件No 17
  {
    id: 49,
    projectNumber: "13",
    projectName: "リニューアルオープン記念①",
    clientName: "パチンコワールド大宮店",
    date: "2026/05/15",
    venue: "パチンコ店舗エントランス",
    talent: "加藤 九郎",
    estimateAmount: "¥600,000",
    status: "proposed",
    salesPersonName: "加藤 九郎",
    requestDate: "2025/12/25",
    hallName: "パチンコワールド大宮店",
    projectStatus: "仮押さえ済み",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "リニューアルオープン記念①",
    eventDate: "2026/05/15",
    estimatedBillingAmount: 600000,
    ...getCompanyAndHallInfo("パチンコワールド大宮店"),
  },
  {
    id: 50,
    projectNumber: "13",
    projectName: "リニューアルオープン記念②",
    clientName: "パチンコワールド大宮店",
    date: "2026/05/20",
    venue: "パチンコ店舗エントランス",
    talent: "加藤 九郎",
    estimateAmount: "¥510,000",
    status: "ordered",
    salesPersonName: "加藤 九郎",
    requestDate: "2025/12/25",
    hallName: "パチンコワールド大宮店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "リニューアルオープン記念②",
    eventDate: "2026/05/20",
    estimatedBillingAmount: 510000,
    ...getCompanyAndHallInfo("パチンコワールド大宮店"),
  },
  {
    id: 51,
    projectNumber: "13",
    projectName: "リニューアルオープン記念③",
    clientName: "パチンコワールド大宮店",
    date: "2026/05/25",
    venue: "パチンコ店舗エントランス",
    talent: "加藤 九郎",
    estimateAmount: "¥670,000",
    status: "proposed",
    salesPersonName: "加藤 九郎",
    requestDate: "2025/12/25",
    hallName: "パチンコワールド大宮店",
    projectStatus: "見積送付完了",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "リニューアルオープン記念③",
    eventDate: "2026/05/25",
    estimatedBillingAmount: 670000,
    ...getCompanyAndHallInfo("パチンコワールド大宮店"),
  },
  // 案件No 18
  {
    id: 52,
    projectNumber: "14",
    projectName: "クリスマスキャンペーン①",
    clientName: "パチンコワールド大宮店",
    date: "2026/12/24",
    venue: "パチンコ店舗フロア",
    talent: "加藤 九郎",
    estimateAmount: "¥630,000",
    status: "ordered",
    salesPersonName: "加藤 九郎",
    requestDate: "2025/12/28",
    hallName: "パチンコワールド大宮店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "クリスマスキャンペーン①",
    eventDate: "2026/12/24",
    estimatedBillingAmount: 630000,
    ...getCompanyAndHallInfo("パチンコワールド大宮店"),
  },
  {
    id: 53,
    projectNumber: "14",
    projectName: "クリスマスキャンペーン②",
    clientName: "パチンコワールド大宮店",
    date: "2026/12/26",
    venue: "パチンコ店舗フロア",
    talent: "加藤 九郎",
    estimateAmount: "¥560,000",
    status: "ordered",
    salesPersonName: "加藤 九郎",
    requestDate: "2025/12/28",
    hallName: "パチンコワールド大宮店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "クリスマスキャンペーン②",
    eventDate: "2026/12/26",
    estimatedBillingAmount: 560000,
    ...getCompanyAndHallInfo("パチンコワールド大宮店"),
  },
  {
    id: 54,
    projectNumber: "14",
    projectName: "クリスマスキャンペーン③",
    clientName: "パチンコワールド大宮店",
    date: "2026/12/28",
    venue: "パチンコ店舗フロア",
    talent: "加藤 九郎",
    estimateAmount: "¥610,000",
    status: "ordered",
    salesPersonName: "加藤 九郎",
    requestDate: "2025/12/28",
    hallName: "パチンコワールド大宮店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "クリスマスキャンペーン③",
    eventDate: "2026/12/28",
    estimatedBillingAmount: 610000,
    ...getCompanyAndHallInfo("パチンコワールド大宮店"),
  },
  // ビッグパチンコ千葉店 - 松本 十郎
  // 案件No 19
  {
    id: 55,
    projectNumber: "15",
    projectName: "開店記念イベント①",
    clientName: "ビッグパチンコ千葉店",
    date: "2026/06/10",
    venue: "パチンコ店舗エントランス",
    talent: "松本 十郎",
    estimateAmount: "¥640,000",
    status: "proposed",
    salesPersonName: "松本 十郎",
    requestDate: "2025/12/30",
    hallName: "ビッグパチンコ千葉店",
    projectStatus: "仮押さえ済み",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "開店記念イベント①",
    eventDate: "2026/06/10",
    estimatedBillingAmount: 640000,
    ...getCompanyAndHallInfo("ビッグパチンコ千葉店"),
  },
  {
    id: 56,
    projectNumber: "15",
    projectName: "開店記念イベント②",
    clientName: "ビッグパチンコ千葉店",
    date: "2026/06/15",
    venue: "パチンコ店舗エントランス",
    talent: "松本 十郎",
    estimateAmount: "¥570,000",
    status: "ordered",
    salesPersonName: "松本 十郎",
    requestDate: "2025/12/30",
    hallName: "ビッグパチンコ千葉店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "開店記念イベント②",
    eventDate: "2026/06/15",
    estimatedBillingAmount: 570000,
    ...getCompanyAndHallInfo("ビッグパチンコ千葉店"),
  },
  {
    id: 57,
    projectNumber: "15",
    projectName: "開店記念イベント③",
    clientName: "ビッグパチンコ千葉店",
    date: "2026/06/20",
    venue: "パチンコ店舗エントランス",
    talent: "松本 十郎",
    estimateAmount: "¥600,000",
    status: "proposed",
    salesPersonName: "松本 十郎",
    requestDate: "2025/12/30",
    hallName: "ビッグパチンコ千葉店",
    projectStatus: "見積送付完了",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "開店記念イベント③",
    eventDate: "2026/06/20",
    estimatedBillingAmount: 600000,
    ...getCompanyAndHallInfo("ビッグパチンコ千葉店"),
  },
  // 案件No 20
  {
    id: 58,
    projectNumber: "16",
    projectName: "年末年始イベント①",
    clientName: "ビッグパチンコ千葉店",
    date: "2026/12/30",
    venue: "パチンコ店舗フロア",
    talent: "松本 十郎",
    estimateAmount: "¥550,000",
    status: "ordered",
    salesPersonName: "松本 十郎",
    requestDate: "2025/12/31",
    hallName: "ビッグパチンコ千葉店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "年末年始イベント①",
    eventDate: "2026/12/30",
    estimatedBillingAmount: 550000,
    ...getCompanyAndHallInfo("ビッグパチンコ千葉店"),
  },
  {
    id: 59,
    projectNumber: "16",
    projectName: "年末年始イベント②",
    clientName: "ビッグパチンコ千葉店",
    date: "2027/01/03",
    venue: "パチンコ店舗フロア",
    talent: "松本 十郎",
    estimateAmount: "¥720,000",
    status: "ordered",
    salesPersonName: "松本 十郎",
    requestDate: "2025/12/31",
    hallName: "ビッグパチンコ千葉店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "年末年始イベント②",
    eventDate: "2027/01/03",
    estimatedBillingAmount: 720000,
    ...getCompanyAndHallInfo("ビッグパチンコ千葉店"),
  },
  {
    id: 60,
    projectNumber: "16",
    projectName: "年末年始イベント③",
    clientName: "ビッグパチンコ千葉店",
    date: "2027/01/05",
    venue: "パチンコ店舗フロア",
    talent: "松本 十郎",
    estimateAmount: "¥660,000",
    status: "ordered",
    salesPersonName: "松本 十郎",
    requestDate: "2025/12/31",
    hallName: "ビッグパチンコ千葉店",
    projectStatus: "イベントチーム確認中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "年末年始イベント③",
    eventDate: "2027/01/05",
    estimatedBillingAmount: 660000,
    ...getCompanyAndHallInfo("ビッグパチンコ千葉店"),
  },
  // 仮押さえ依頼のテストデータ
  {
    id: 61,
    projectNumber: "17",
    projectName: "春のキャンペーン①",
    clientName: "マルハン渋谷店",
    date: "2026/04/10",
    venue: "パチンコ店舗フロア",
    talent: "山田 太郎",
    estimateAmount: "¥680,000",
    status: "proposed",
    salesPersonName: "山田 太郎",
    requestDate: "2025/12/15",
    hallName: "マルハン渋谷店",
    projectStatus: "仮押さえ依頼",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "春のキャンペーン①",
    eventDate: "2026/04/10",
    estimatedBillingAmount: 680000,
    companionCount: "3",
    directorCount: "1",
    mcCount: "1",
    selectedCompanions: ["Rio", "Ayaka"], // 3人必要だが2人しか選択していない
    selectedDirectors: ["Takeshi"],
    selectedMcs: ["Yuki"],
    startTime: "10:00",
    endTime: "18:00",
    ...getCompanyAndHallInfo("マルハン渋谷店"),
  },
  {
    id: 62,
    projectNumber: "17",
    projectName: "春のキャンペーン②",
    clientName: "ダイナム新宿店",
    date: "2026/04/15",
    venue: "パチンコ店舗フロア",
    talent: "佐藤 次郎",
    estimateAmount: "¥720,000",
    status: "proposed",
    salesPersonName: "佐藤 次郎",
    requestDate: "2025/12/20",
    hallName: "ダイナム新宿店",
    projectStatus: "仮押さえ依頼",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "春のキャンペーン②",
    eventDate: "2026/04/15",
    estimatedBillingAmount: 720000,
    companionCount: "2",
    directorCount: "1",
    mcCount: "1",
    selectedCompanions: ["Rio", "未定"], // 「未定」が選択されている
    selectedDirectors: ["Takeshi"],
    selectedMcs: ["Yuki"],
    startTime: "11:00",
    endTime: "19:00",
    ...getCompanyAndHallInfo("ダイナム新宿店"),
  },
  {
    id: 63,
    projectNumber: "17",
    projectName: "春のキャンペーン③",
    clientName: "ガイア池袋店",
    date: "2026/04/20",
    venue: "パチンコ店舗フロア",
    talent: "鈴木 三郎",
    estimateAmount: "¥750,000",
    status: "proposed",
    salesPersonName: "鈴木 三郎",
    requestDate: "2025/12/25",
    hallName: "ガイア池袋店",
    projectStatus: "仮押さえ依頼",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "春のキャンペーン③",
    eventDate: "2026/04/20",
    estimatedBillingAmount: 750000,
    companionCount: "2",
    directorCount: "1",
    mcCount: "1",
    selectedCompanions: ["Rio", "山田 花子"], // 外部コンパニオンが選択されている
    selectedDirectors: ["Takeshi"],
    selectedMcs: ["Yuki"],
    startTime: "12:00",
    endTime: "20:00",
    ...getCompanyAndHallInfo("ガイア池袋店"),
  },
  // 手配進行中のテストデータ
  {
    id: 64,
    projectNumber: "18",
    projectName: "夏のキャンペーン①",
    clientName: "マルハン渋谷店",
    date: "2026/07/10",
    venue: "パチンコ店舗フロア",
    talent: "山田 太郎",
    estimateAmount: "¥680,000",
    status: "ordered",
    salesPersonName: "山田 太郎",
    requestDate: "2025/12/20",
    hallName: "マルハン渋谷店",
    projectStatus: "手配進行中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "夏のキャンペーン①",
    eventDate: "2026/07/10",
    estimatedBillingAmount: 680000,
    companionCount: "2",
    directorCount: "1",
    mcCount: "1",
    selectedCompanions: ["Rio", "Ayaka"],
    selectedDirectors: ["Takeshi"],
    selectedMcs: ["Yuki"],
    startTime: "10:00",
    endTime: "18:00",
    mustSeePublication: "要",
    reportRequired: "不要",
    ...getCompanyAndHallInfo("マルハン渋谷店"),
  },
  {
    id: 65,
    projectNumber: "18",
    projectName: "夏のキャンペーン②",
    clientName: "ダイナム新宿店",
    date: "2026/07/15",
    venue: "パチンコ店舗フロア",
    talent: "佐藤 次郎",
    estimateAmount: "¥720,000",
    status: "ordered",
    salesPersonName: "佐藤 次郎",
    requestDate: "2025/12/25",
    hallName: "ダイナム新宿店",
    projectStatus: "手配進行中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "夏のキャンペーン②",
    eventDate: "2026/07/15",
    estimatedBillingAmount: 720000,
    companionCount: "3",
    directorCount: "1",
    mcCount: "1",
    selectedCompanions: ["Rio", "Ayaka", "Nanaka"],
    selectedDirectors: ["Takeshi"],
    selectedMcs: ["Yuki"],
    startTime: "11:00",
    endTime: "19:00",
    mustSeePublication: "不要",
    reportRequired: "要",
    ...getCompanyAndHallInfo("ダイナム新宿店"),
  },
  {
    id: 66,
    projectNumber: "18",
    projectName: "夏のキャンペーン③",
    clientName: "ガイア池袋店",
    date: "2026/07/20",
    venue: "パチンコ店舗フロア",
    talent: "鈴木 三郎",
    estimateAmount: "¥750,000",
    status: "ordered",
    salesPersonName: "鈴木 三郎",
    requestDate: "2025/12/30",
    hallName: "ガイア池袋店",
    projectStatus: "手配進行中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "夏のキャンペーン③",
    eventDate: "2026/07/20",
    estimatedBillingAmount: 750000,
    companionCount: "2",
    directorCount: "1",
    mcCount: "1",
    selectedCompanions: ["Rio", "Ayaka"],
    selectedDirectors: ["Kenji"],
    selectedMcs: ["Saki"],
    startTime: "12:00",
    endTime: "20:00",
    mustSeePublication: "要",
    reportRequired: "要",
    ...getCompanyAndHallInfo("ガイア池袋店"),
  },
// イベント終了処理中のテストデータ（実施日が過去の日付）
  {
    id: 67,
    projectNumber: "19",
    projectName: "秋のキャンペーン①",
    clientName: "マルハン渋谷店",
    date: "2025/11/15",
    venue: "パチンコ店舗フロア",
    talent: "山田 太郎",
    estimateAmount: "¥680,000",
    status: "ordered",
    salesPersonName: "山田 太郎",
    requestDate: "2025/10/01",
    hallName: "マルハン渋谷店",
    projectStatus: "イベント終了処理中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "秋のキャンペーン①",
    eventDate: "2025/11/15",
    estimatedBillingAmount: 680000,
    companionCount: "2",
    directorCount: "1",
    mcCount: "1",
    selectedCompanions: ["Rio", "Ayaka"],
    selectedDirectors: ["Takeshi"],
    selectedMcs: ["Yuki"],
    confirmedCompanions: ["Rio", "Ayaka"],
    confirmedDirectors: ["Takeshi"],
    confirmedMcs: ["Yuki"],
    companionCostumes: {
      "Rio": "コスチュームA",
      "Ayaka": "コスチュームB",
    },
    startTime: "10:00",
    endTime: "18:00",
    mustSeePublication: "要",
    reportRequired: "不要",
    ...getCompanyAndHallInfo("マルハン渋谷店"),
  },
  {
    id: 68,
    projectNumber: "19",
    projectName: "秋のキャンペーン②",
    clientName: "ダイナム新宿店",
    date: "2025/11/20",
    venue: "パチンコ店舗フロア",
    talent: "佐藤 次郎",
    estimateAmount: "¥720,000",
    status: "ordered",
    salesPersonName: "佐藤 次郎",
    requestDate: "2025/10/05",
    hallName: "ダイナム新宿店",
    projectStatus: "イベント終了処理中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "秋のキャンペーン②",
    eventDate: "2025/11/20",
    estimatedBillingAmount: 720000,
    companionCount: "3",
    directorCount: "1",
    mcCount: "1",
    selectedCompanions: ["Rio", "Ayaka", "Nanaka"],
    selectedDirectors: ["Takeshi"],
    selectedMcs: ["Yuki"],
    confirmedCompanions: ["Rio", "Ayaka", "Nanaka"],
    confirmedDirectors: ["Takeshi"],
    confirmedMcs: ["Yuki"],
    companionCostumes: {
      "Rio": "コスチュームA",
      "Ayaka": "コスチュームB",
      "Nanaka": "コスチュームC",
    },
    startTime: "11:00",
    endTime: "19:00",
    mustSeePublication: "不要",
    reportRequired: "要",
    ...getCompanyAndHallInfo("ダイナム新宿店"),
  },
  {
    id: 69,
    projectNumber: "19",
    projectName: "秋のキャンペーン③",
    clientName: "ガイア池袋店",
    date: "2025/11/25",
    venue: "パチンコ店舗フロア",
    talent: "鈴木 三郎",
    estimateAmount: "¥750,000",
    status: "ordered",
    salesPersonName: "鈴木 三郎",
    requestDate: "2025/10/10",
    hallName: "ガイア池袋店",
    projectStatus: "イベント終了処理中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "秋のキャンペーン③",
    eventDate: "2025/11/25",
    estimatedBillingAmount: 750000,
    companionCount: "2",
    directorCount: "1",
    mcCount: "1",
    selectedCompanions: ["Rio", "Ayaka"],
    selectedDirectors: ["Kenji"],
    selectedMcs: ["Saki"],
    confirmedCompanions: ["Rio", "Ayaka"],
    confirmedDirectors: ["Kenji"],
    confirmedMcs: ["Saki"],
    companionCostumes: {
      "Rio": "コスチュームA",
      "Ayaka": "コスチュームB",
    },
    startTime: "12:00",
    endTime: "20:00",
    mustSeePublication: "要",
    reportRequired: "要",
    ...getCompanyAndHallInfo("ガイア池袋店"),
  },
]

function getDemoDbSeed() {
  return {
    // seedは旧形式（商材行）で保持しているので、Provider側で正規化して使う
    projects: initialProjects,
    halls: initialHalls,
    companies: initialCompanies,
    productions: initialProductions,
    companions: initialCompanions,
    employees: initialEmployees,
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
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
        const newId = nextProductId++
        products.push({
          id: newId,
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
        } as any)
      }
    }

    return { projects, products, halls, companies, productions, companions, employees }
  }, [initialDb, initialSeed.companies, initialSeed.halls, initialSeed.projects, initialSeed.productions, initialSeed.companions, initialSeed.employees])

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
    saveDemoDbToStorage({ projects: projectEntities, products: productEntities, halls, companies, productions, companions, employees } as any)
  }, [projectEntities, productEntities, halls, companies, productions, companions, employees])

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
        const newId = nextProductId++
        productsV3.push({
          id: newId,
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

  return (
    <ProjectContext.Provider
      value={{
        projectData,
        setProjectData,
        currentRole,
        setCurrentRole,
        notifications,
        addNotification,
        resetDemoData,
        getProjects,
        getProjectByProjectNumber,
        getProducts,
        createProduct,
        createProducts,
        updateProduct,
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
