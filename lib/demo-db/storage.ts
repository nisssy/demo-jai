import {
  CompanyDataSchema,
  DemoDbSnapshotSchema,
  HallDataSchema,
  ProductEntitySchema,
  ProjectEntitySchema,
  ProjectSchema,
  type DemoDbSnapshot,
} from "@/lib/demo-db/schema"

export const DEMO_DB_STORAGE_KEY = "demo-jai:demo-db"
export const DEMO_DB_STORAGE_VERSION = 3

type ParseMeta = {
  snapshot: DemoDbSnapshot
  shouldResave: boolean
}

type CastBookingStatus = "tentative" | "confirmed"

function ensureBookingStatusFromConfirmed(
  names: unknown,
  existing?: Record<string, CastBookingStatus>,
): Record<string, CastBookingStatus> {
  const out: Record<string, CastBookingStatus> = { ...(existing ?? {}) }
  if (!Array.isArray(names)) return out
  for (const n of names) {
    const name = typeof n === "string" ? n.trim() : ""
    if (!name || name === "未定") continue
    out[name] = "confirmed"
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
  if (ps !== "仮押さえ済み") return out
  if (!Array.isArray(selected)) return out
  for (const n of selected) {
    const name = typeof n === "string" ? n.trim() : ""
    if (!name || name === "未定") continue
    if (!out[name]) out[name] = "tentative"
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

    const compFromConfirmed = ensureBookingStatusFromConfirmed((p as any).confirmedCompanions, prevComp)
    const dirFromConfirmed = ensureBookingStatusFromConfirmed((p as any).confirmedDirectors, prevDir)
    const mcFromConfirmed = ensureBookingStatusFromConfirmed((p as any).confirmedMcs, prevMc)

    const compFinal = ensureBookingStatusFromSelectedTentativeWhenNeeded(
      (p as any).projectStatus,
      (p as any).selectedCompanions,
      compFromConfirmed,
    )
    const dirFinal = ensureBookingStatusFromSelectedTentativeWhenNeeded(
      (p as any).projectStatus,
      (p as any).selectedDirectors,
      dirFromConfirmed,
    )
    const mcFinal = ensureBookingStatusFromSelectedTentativeWhenNeeded(
      (p as any).projectStatus,
      (p as any).selectedMcs,
      mcFromConfirmed,
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

    // After migrations we should have v3 logical shape.
    const projects = pickValidArrayItems(migrated.data.projects, ProjectEntitySchema)
    const productsParsed = pickValidArrayItems(migrated.data.products, ProductEntitySchema)
    const backfilled = backfillCastBookingStatus(productsParsed as any[])
    const halls = pickValidArrayItems(migrated.data.halls, HallDataSchema)
    const companies = pickValidArrayItems(migrated.data.companies, CompanyDataSchema)

    return {
      snapshot: {
        version: DEMO_DB_STORAGE_VERSION,
        data: { projects, products: backfilled.products as any, halls, companies },
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

