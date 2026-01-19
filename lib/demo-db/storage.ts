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
      const snapshot: DemoDbSnapshot = shouldResave
        ? { version: DEMO_DB_STORAGE_VERSION, data: parsed.data.data }
        : parsed.data
      return { snapshot, shouldResave }
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
    const products = pickValidArrayItems(migrated.data.products, ProductEntitySchema)
    const halls = pickValidArrayItems(migrated.data.halls, HallDataSchema)
    const companies = pickValidArrayItems(migrated.data.companies, CompanyDataSchema)

    return {
      snapshot: {
        version: DEMO_DB_STORAGE_VERSION,
        data: { projects, products, halls, companies },
      },
      shouldResave: true,
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

