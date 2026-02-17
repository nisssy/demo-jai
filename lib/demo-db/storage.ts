import {
  CompanyDataSchema,
  CompanionDataSchema,
  DemoDbSnapshotSchema,
  EmployeeDataSchema,
  HallDataSchema,
  ProductionDataSchema,
  ProductEntitySchema,
  ProjectEntitySchema,
  ProjectSchema,
  type DemoDbSnapshot,
} from "@/lib/demo-db/schema"

export const DEMO_DB_STORAGE_KEY = "demo-jai:demo-db"
export const DEMO_DB_STORAGE_VERSION = 5

type ParseMeta = {
  snapshot: DemoDbSnapshot
  shouldResave: boolean
}

type CastBookingStatus = "pending" | "tentative" | "confirmed_request" | "confirmed"

function ensureBookingStatusFromConfirmed(
  names: unknown,
  existing?: Record<string, CastBookingStatus>,
): Record<string, CastBookingStatus> {
  const out: Record<string, CastBookingStatus> = { ...(existing ?? {}) }
  if (!Array.isArray(names)) return out
  for (const n of names) {
    const name = typeof n === "string" ? n.trim() : ""
    if (!name || name === "未定") continue
    // pending状態とconfirmed_request状態は上書きしない（confirmedのみ設定）
    if (out[name] !== "pending" && out[name] !== "confirmed_request") {
      out[name] = "confirmed"
    }
  }
  return out
}

function ensureBookingStatusFromSelectedTentativeWhenNeeded(
  projectStatus: unknown,
  selected: unknown,
  existing?: Record<string, CastBookingStatus>,
): Record<string, CastBookingStatus> {
  const out: Record<string, CastBookingStatus> = { ...(existing ?? {}) }
  const ps = typeof projectStatus === "string" ? projectStatus : ""
  // 互換: 以前は商材単位で「仮押さえ済み」を持っていたため、その場合は選択キャストを仮押さえとして埋める
  if (ps === "仮押さえ済み") {
    if (!Array.isArray(selected)) return out
    for (const n of selected) {
      const name = typeof n === "string" ? n.trim() : ""
      if (!name || name === "未定") continue
      if (!out[name]) out[name] = "tentative"
    }
    return out
  }
  // projectStatus === "仮押さえ依頼"の場合、選択されたキャストをpending状態で初期化
  if (ps === "仮押さえ依頼") {
    if (!Array.isArray(selected)) return out
    for (const n of selected) {
      const name = typeof n === "string" ? n.trim() : ""
      if (!name || name === "未定") continue
      // 既存の状態がなければpendingを設定（confirmedやtentativeは上書きしない）
      if (!out[name]) out[name] = "pending"
    }
    return out
  }
  // projectStatus === "本押さえ依頼"の場合、選択されたキャストをconfirmed_request状態で初期化
  if (ps === "本押さえ依頼") {
    if (!Array.isArray(selected)) return out
    for (const n of selected) {
      const name = typeof n === "string" ? n.trim() : ""
      if (!name || name === "未定") continue
      // 既存の状態がなければconfirmed_requestを設定（confirmedは上書きしない）
      if (!out[name] || out[name] === "pending" || out[name] === "tentative") {
        out[name] = "confirmed_request"
      }
    }
    return out
  }
  return out
}

function ensureFailureCommentFromLegacyWhenNeeded(
  projectStatus: unknown,
  selected: unknown,
  legacyComment: unknown,
  existing?: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = { ...(existing ?? {}) }
  const ps = typeof projectStatus === "string" ? projectStatus : ""
  const comment = typeof legacyComment === "string" ? legacyComment.trim() : ""
  // 互換: 以前は商材単位で「営業確認中 + temporaryHoldFailureComment」があったため、その場合は選択キャスト全員へ展開
  if (ps !== "営業確認中" || !comment) return out
  if (!Array.isArray(selected)) return out
  for (const n of selected) {
    const name = typeof n === "string" ? n.trim() : ""
    if (!name || name === "未定") continue
    if (!out[name]) out[name] = comment
  }
  return out
}

function backfillCastBookingStatus(products: any[]): { products: any[]; changed: boolean } {
  let changed = false
  const next = products.map((p) => {
    if (!p || typeof p !== "object") return p

    const prevComp = (p as any).companionBookingStatus as Record<string, CastBookingStatus> | undefined
    const prevDir = (p as any).directorBookingStatus as Record<string, CastBookingStatus> | undefined
    const prevMc = (p as any).mcBookingStatus as Record<string, CastBookingStatus> | undefined
    const prevCompFail = (p as any).companionTentativeHoldFailureComment as Record<string, string> | undefined
    const prevDirFail = (p as any).directorTentativeHoldFailureComment as Record<string, string> | undefined
    const prevMcFail = (p as any).mcTentativeHoldFailureComment as Record<string, string> | undefined

    // 既存のpending状態を保持（backfillで上書きしない）
    const compFromConfirmed = ensureBookingStatusFromConfirmed((p as any).confirmedCompanions, prevComp)
    const dirFromConfirmed = ensureBookingStatusFromConfirmed((p as any).confirmedDirectors, prevDir)
    const mcFromConfirmed = ensureBookingStatusFromConfirmed((p as any).confirmedMcs, prevMc)

    // pending状態を保持するため、既存のpendingを優先
    const compWithPending = { ...compFromConfirmed }
    if (prevComp) {
      Object.entries(prevComp).forEach(([name, status]) => {
        if (status === "pending" && !compWithPending[name]) {
          compWithPending[name] = "pending"
        }
      })
    }
    const dirWithPending = { ...dirFromConfirmed }
    if (prevDir) {
      Object.entries(prevDir).forEach(([name, status]) => {
        if (status === "pending" && !dirWithPending[name]) {
          dirWithPending[name] = "pending"
        }
      })
    }
    const mcWithPending = { ...mcFromConfirmed }
    if (prevMc) {
      Object.entries(prevMc).forEach(([name, status]) => {
        if (status === "pending" && !mcWithPending[name]) {
          mcWithPending[name] = "pending"
        }
      })
    }

    const compFinal = ensureBookingStatusFromSelectedTentativeWhenNeeded(
      (p as any).projectStatus,
      (p as any).selectedCompanions,
      compWithPending,
    )
    const dirFinal = ensureBookingStatusFromSelectedTentativeWhenNeeded(
      (p as any).projectStatus,
      (p as any).selectedDirectors,
      dirWithPending,
    )
    const mcFinal = ensureBookingStatusFromSelectedTentativeWhenNeeded(
      (p as any).projectStatus,
      (p as any).selectedMcs,
      mcWithPending,
    )

    const compFailFinal = ensureFailureCommentFromLegacyWhenNeeded(
      (p as any).projectStatus,
      (p as any).selectedCompanions,
      (p as any).temporaryHoldFailureComment,
      prevCompFail,
    )
    const dirFailFinal = ensureFailureCommentFromLegacyWhenNeeded(
      (p as any).projectStatus,
      (p as any).selectedDirectors,
      (p as any).temporaryHoldFailureComment,
      prevDirFail,
    )
    const mcFailFinal = ensureFailureCommentFromLegacyWhenNeeded(
      (p as any).projectStatus,
      (p as any).selectedMcs,
      (p as any).temporaryHoldFailureComment,
      prevMcFail,
    )

    const nextObj: any = { ...(p as any) }
    const prevCompKeyCount = prevComp ? Object.keys(prevComp).length : 0
    const prevDirKeyCount = prevDir ? Object.keys(prevDir).length : 0
    const prevMcKeyCount = prevMc ? Object.keys(prevMc).length : 0
    const prevCompFailKeyCount = prevCompFail ? Object.keys(prevCompFail).length : 0
    const prevDirFailKeyCount = prevDirFail ? Object.keys(prevDirFail).length : 0
    const prevMcFailKeyCount = prevMcFail ? Object.keys(prevMcFail).length : 0

    if (Object.keys(compFinal).length > 0 && (prevCompKeyCount === 0 || JSON.stringify(prevComp) !== JSON.stringify(compFinal))) {
      nextObj.companionBookingStatus = compFinal
      changed = true
    }
    if (Object.keys(dirFinal).length > 0 && (prevDirKeyCount === 0 || JSON.stringify(prevDir) !== JSON.stringify(dirFinal))) {
      nextObj.directorBookingStatus = dirFinal
      changed = true
    }
    if (Object.keys(mcFinal).length > 0 && (prevMcKeyCount === 0 || JSON.stringify(prevMc) !== JSON.stringify(mcFinal))) {
      nextObj.mcBookingStatus = mcFinal
      changed = true
    }
    if (Object.keys(compFailFinal).length > 0 && (prevCompFailKeyCount === 0 || JSON.stringify(prevCompFail) !== JSON.stringify(compFailFinal))) {
      nextObj.companionTentativeHoldFailureComment = compFailFinal
      changed = true
    }
    if (Object.keys(dirFailFinal).length > 0 && (prevDirFailKeyCount === 0 || JSON.stringify(prevDirFail) !== JSON.stringify(dirFailFinal))) {
      nextObj.directorTentativeHoldFailureComment = dirFailFinal
      changed = true
    }
    if (Object.keys(mcFailFinal).length > 0 && (prevMcFailKeyCount === 0 || JSON.stringify(prevMcFail) !== JSON.stringify(mcFailFinal))) {
      nextObj.mcTentativeHoldFailureComment = mcFailFinal
      changed = true
    }
    return nextObj
  })
  return { products: next, changed }
}

function pickValidArrayItems<T>(raw: unknown, schema: { safeParse: (x: unknown) => { success: true; data: T } | { success: false } }): T[] {
  if (!Array.isArray(raw)) return []
  const out: T[] = []
  for (const item of raw) {
    const parsed = schema.safeParse(item)
    if (parsed.success) out.push(parsed.data)
  }
  return out
}

function migrateV1ToV2(data: any): any {
  // v2 currently keeps the same logical shape; this migration mainly ensures arrays exist.
  return {
    ...data,
    projects: Array.isArray(data?.projects) ? data.projects : [],
    halls: Array.isArray(data?.halls) ? data.halls : [],
    companies: Array.isArray(data?.companies) ? data.companies : [],
  }
}

function normalizeProjectNumber(raw: any): string {
  if (typeof raw === "string" && raw.trim()) return raw.trim()
  if (typeof raw === "number" && Number.isFinite(raw)) return String(raw)
  return ""
}

function migrateV2ToV3(data: any): any {
  // v2: data.projects is "legacy rows" (ProjectSchema)
  const legacyProjectsRaw = Array.isArray(data?.projects) ? data.projects : []
  const legacyProjects = pickValidArrayItems(legacyProjectsRaw, ProjectSchema)

  const halls = Array.isArray(data?.halls) ? data.halls : []
  const companies = Array.isArray(data?.companies) ? data.companies : []

  // Group legacy rows by projectNumber (案件No). Fallback to a stable key per row.
  const grouped = new Map<string, typeof legacyProjects>()
  for (const row of legacyProjects) {
    const pn = normalizeProjectNumber((row as any).projectNumber) || `legacy:${row.id}`
    const arr = grouped.get(pn) ?? []
    arr.push(row)
    grouped.set(pn, arr)
  }

  // Generate new numeric IDs for v3 entities
  let nextProjectId = 1
  let nextProductId = 1
  const projects: any[] = []
  const products: any[] = []
  const today = new Date().toISOString().split("T")[0]

  for (const [projectNumber, rows] of grouped.entries()) {
    const first = rows[0]
    const projectId = nextProjectId++

    const hallName = (first as any).hallName || (first as any).clientName || ""
    const companyId = (first as any).companyId
    const companyName = (first as any).companyName
    const hallCode = (first as any).hallId
    const salesPersonName = (first as any).salesPersonName
    const requestDate = (first as any).requestDate

    projects.push({
      id: projectId,
      projectNumber,
      projectName: (first as any).projectName,
      hallName,
      hallCode,
      companyId,
      companyName,
      salesPersonName,
      requestDate,
      // hallRefId (HallData.id) は可能なら解決する（無理なら未設定）
      hallRefId: (() => {
        const hallsParsed = pickValidArrayItems(halls, HallDataSchema)
        const found = hallsParsed.find((h) => h.name === hallName)
        return found?.id
      })(),
      createdAt: today,
      updatedAt: today,
    })

    for (const row of rows) {
      const legacy = row as any
      const productId = nextProductId++
      products.push({
        id: productId,
        projectId,
        // それ以外 = 商材属性（レガシー行からプロジェクト基本情報を除いたもの）
        clientName: legacy.clientName,
        date: legacy.date,
        venue: legacy.venue,
        talent: legacy.talent,
        estimateAmount: legacy.estimateAmount,
        status: legacy.status,

        projectStatus: legacy.projectStatus,
        category: legacy.category,
        eventType: legacy.eventType,
        eventProductName: legacy.eventProductName,
        eventDate: legacy.eventDate,
        estimatedBillingAmount: legacy.estimatedBillingAmount,
        startTime: legacy.startTime,
        endTime: legacy.endTime,
        companionCount: legacy.companionCount,
        directorCount: legacy.directorCount,
        mcCount: legacy.mcCount,
        selectedCompanions: legacy.selectedCompanions,
        selectedDirectors: legacy.selectedDirectors,
        selectedMcs: legacy.selectedMcs,
        nominatedCompanions: legacy.nominatedCompanions,
        nominatedDirectors: legacy.nominatedDirectors,
        nominatedMcs: legacy.nominatedMcs,
        correctionRequest: legacy.correctionRequest,
        correctionComment: legacy.correctionComment,
        temporaryHoldFailureComment: legacy.temporaryHoldFailureComment,
        confirmedCompanions: legacy.confirmedCompanions,
        confirmedDirectors: legacy.confirmedDirectors,
        confirmedMcs: legacy.confirmedMcs,
        companionCostumes: legacy.companionCostumes,
        mustSeeFlag: legacy.mustSeeFlag,
        mustSeePublication: legacy.mustSeePublication,
        publicationDate: legacy.publicationDate,
        publicationTime: legacy.publicationTime,
        reportRequired: legacy.reportRequired,
        pachitownLinked: legacy.pachitownLinked,
        pachitownLinkedDate: legacy.pachitownLinkedDate,
        xAccountPostText: legacy.xAccountPostText,
        surveySent: legacy.surveySent,
        surveySentDate: legacy.surveySentDate,
        surveyResult: legacy.surveyResult,
        castingCost: legacy.castingCost,
        transportationFee: legacy.transportationFee,
        accommodationFee: legacy.accommodationFee,
        postPRCost: legacy.postPRCost,
        isTransportationAutoFilled: legacy.isTransportationAutoFilled,
        isAccommodationAutoFilled: legacy.isAccommodationAutoFilled,
        quoteGenerated: legacy.quoteGenerated,
        quoteData: legacy.quoteData,
      })
    }
  }

  return {
    projects,
    products,
    halls: pickValidArrayItems(halls, HallDataSchema),
    companies: pickValidArrayItems(companies, CompanyDataSchema),
  }
}

function migrateV3ToV4(data: any): any {
  // v4: add productions/companions master arrays
  const base = typeof data === "object" && data ? data : {}
  const productions = Array.isArray((base as any).productions)
    ? (base as any).productions
    : [
        { id: 1, name: "プロダクションA", address: "東京都渋谷区1-1-1", phone: "03-1111-1111" },
        { id: 2, name: "プロダクションB", address: "東京都新宿区2-2-2", phone: "03-2222-2222" },
        { id: 3, name: "プロダクションC", address: "東京都豊島区3-3-3", phone: "03-3333-3333" },
      ]

  const companions = Array.isArray((base as any).companions)
    ? (base as any).companions
    : [
        { id: 1, name: "Rio", productionId: 1 },
        { id: 2, name: "Ayaka", productionId: 1 },
        { id: 3, name: "Nanaka", productionId: 2 },
        { id: 4, name: "山田 花子", productionId: 3 },
        { id: 5, name: "佐藤 美咲", productionId: 3 },
        { id: 6, name: "鈴木 さくら", productionId: 3 },
        { id: 7, name: "高橋 みゆき", productionId: 2 },
        { id: 8, name: "伊藤 あかり", productionId: 1 },
      ]

  return { ...base, productions, companions }
}

function migrateV4ToV5(data: any): any {
  // v5: add employees master, add email to companies/halls
  const base = typeof data === "object" && data ? data : {}
  
  // 従業員マスタを追加（デフォルトデータ：50名）
  const employees = Array.isArray((base as any).employees)
    ? (base as any).employees
    : [
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

  // 法人・ホールにメールアドレスを追加（既存データには追加しない、新規データのみ）
  const companies = Array.isArray((base as any).companies)
    ? (base as any).companies.map((c: any) => ({
        ...c,
        email: c.email || undefined,
      }))
    : []

  const halls = Array.isArray((base as any).halls)
    ? (base as any).halls.map((h: any) => ({
        ...h,
        email: h.email || undefined,
      }))
    : []

  return { ...base, employees, companies, halls }
}

function applyMigrations(version: number, data: any): { version: number; data: any; migrated: boolean } | null {
  if (version > DEMO_DB_STORAGE_VERSION) return null
  let v = version
  let d: any = data
  let migrated = false

  if (v < 1) {
    // Treat unknown/older versions as v1-ish if it has a data object.
    v = 1
    migrated = true
  }

  while (v < DEMO_DB_STORAGE_VERSION) {
    if (v === 1) {
      d = migrateV1ToV2(d)
      v = 2
      migrated = true
      continue
    }
    if (v === 2) {
      d = migrateV2ToV3(d)
      v = 3
      migrated = true
      continue
    }
    if (v === 3) {
      d = migrateV3ToV4(d)
      v = 4
      migrated = true
      continue
    }
    if (v === 4) {
      d = migrateV4ToV5(d)
      v = 5
      migrated = true
      continue
    }
    // Unknown gap.
    return null
  }

  return { version: v, data: d, migrated }
}

function safeParseWithMigration(raw: string | null): ParseMeta | null {
  if (!raw) return null
  try {
    const json = JSON.parse(raw) as any

    // Current version fast path (and "shape valid but version mismatched" path).
    const parsed = DemoDbSnapshotSchema.safeParse(json)
    if (parsed.success) {
      if (parsed.data.version > DEMO_DB_STORAGE_VERSION) return null
      const shouldResave = parsed.data.version !== DEMO_DB_STORAGE_VERSION

      const backfilled = backfillCastBookingStatus((parsed.data.data.products as any[]) ?? [])
      const snapshot: DemoDbSnapshot = {
        version: DEMO_DB_STORAGE_VERSION,
        data: {
          ...parsed.data.data,
          products: backfilled.products as any,
        },
      }

      return { snapshot, shouldResave: shouldResave || backfilled.changed }
    }

    const rawVersion = typeof json?.version === "number" ? json.version : 0
    const rawData = typeof json?.data === "object" && json.data ? json.data : null
    if (!rawData) return null

    const hadAnyKey = "projects" in rawData || "products" in rawData || "halls" in rawData || "companies" in rawData
    if (!hadAnyKey) return null

    const migrated = applyMigrations(rawVersion, rawData)
    if (!migrated) return null

    // After migrations we should have v5 logical shape.
    const projects = pickValidArrayItems(migrated.data.projects, ProjectEntitySchema)
    const productsParsed = pickValidArrayItems(migrated.data.products, ProductEntitySchema)
    const backfilled = backfillCastBookingStatus(productsParsed as any[])
    const halls = pickValidArrayItems(migrated.data.halls, HallDataSchema)
    const companies = pickValidArrayItems(migrated.data.companies, CompanyDataSchema)
    const productions = pickValidArrayItems(migrated.data.productions, ProductionDataSchema)
    const companions = pickValidArrayItems(migrated.data.companions, CompanionDataSchema)
    const employees = pickValidArrayItems(migrated.data.employees, EmployeeDataSchema)

    return {
      snapshot: {
        version: DEMO_DB_STORAGE_VERSION,
        data: { projects, products: backfilled.products as any, halls, companies, productions, companions, employees },
      },
      shouldResave: true || backfilled.changed,
    }
  } catch {
    return null
  }
}

export function safeParseDemoDbSnapshot(raw: string | null): DemoDbSnapshot | null {
  return safeParseWithMigration(raw)?.snapshot ?? null
}

export type DemoDbLoadMeta = {
  snapshot: DemoDbSnapshot
  /** true when we corrected/migrated data and re-saved it (or version mismatch was normalized) */
  didResave: boolean
}

export function loadDemoDbFromStorageMeta(): DemoDbLoadMeta | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(DEMO_DB_STORAGE_KEY)
  const meta = safeParseWithMigration(raw)
  if (!meta) return null

  // If we loaded legacy data, persist the migrated snapshot back to storage.
  if (meta.shouldResave) saveDemoDbToStorage(meta.snapshot.data)

  return { snapshot: meta.snapshot, didResave: meta.shouldResave }
}

export function loadDemoDbFromStorage(): DemoDbSnapshot | null {
  return loadDemoDbFromStorageMeta()?.snapshot ?? null
}

export function saveDemoDbToStorage(data: DemoDbSnapshot["data"]) {
  if (typeof window === "undefined") return
  const snapshot: DemoDbSnapshot = {
    version: DEMO_DB_STORAGE_VERSION,
    data,
  }
  try {
    window.localStorage.setItem(DEMO_DB_STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // ignore quota / private mode errors in demo
  }
}

export function clearDemoDbStorage() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(DEMO_DB_STORAGE_KEY)
  } catch {
    // ignore
  }
}

