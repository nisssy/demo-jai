import { CompanyDataSchema, DemoDbSnapshotSchema, HallDataSchema, ProjectSchema, type DemoDbSnapshot } from "@/lib/demo-db/schema"

export const DEMO_DB_STORAGE_KEY = "demo-jai:demo-db"
export const DEMO_DB_STORAGE_VERSION = 2

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

    const hadAnyKey = "projects" in rawData || "halls" in rawData || "companies" in rawData
    if (!hadAnyKey) return null

    const migrated = applyMigrations(rawVersion, rawData)
    if (!migrated) return null

    const projects = pickValidArrayItems(migrated.data.projects, ProjectSchema)
    const halls = pickValidArrayItems(migrated.data.halls, HallDataSchema)
    const companies = pickValidArrayItems(migrated.data.companies, CompanyDataSchema)

    return {
      snapshot: {
        version: DEMO_DB_STORAGE_VERSION,
        data: { projects, halls, companies },
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

