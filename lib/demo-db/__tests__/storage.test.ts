import { afterEach, describe, expect, test } from "bun:test"
import {
  DEMO_DB_STORAGE_KEY,
  DEMO_DB_STORAGE_VERSION,
  clearDemoDbStorage,
  loadDemoDbFromStorage,
  safeParseDemoDbSnapshot,
  saveDemoDbToStorage,
} from "../storage"

type LocalStorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

function makeLocalStorage(): { storage: LocalStorageLike; state: Map<string, string> } {
  const state = new Map<string, string>()
  const storage: LocalStorageLike = {
    getItem: (key) => state.get(key) ?? null,
    setItem: (key, value) => void state.set(key, value),
    removeItem: (key) => void state.delete(key),
  }
  return { storage, state }
}

const originalWindow = (globalThis as any).window

afterEach(() => {
  ;(globalThis as any).window = originalWindow
})

describe("lib/demo-db/storage", () => {
  test("safeParseDemoDbSnapshot: returns null for null/invalid json", () => {
    expect(safeParseDemoDbSnapshot(null)).toBeNull()
    expect(safeParseDemoDbSnapshot("not-json")).toBeNull()
  })

  test("safeParseDemoDbSnapshot: migrates version mismatch when shape is valid", () => {
    const raw = JSON.stringify({ version: DEMO_DB_STORAGE_VERSION - 1, data: { projects: [], halls: [], companies: [] } })
    const parsed = safeParseDemoDbSnapshot(raw)
    expect(parsed?.version).toBe(DEMO_DB_STORAGE_VERSION)
    expect(parsed?.data.projects).toEqual([])
  })

  test("safeParseDemoDbSnapshot: accepts valid shape + version", () => {
    const raw = JSON.stringify({ version: DEMO_DB_STORAGE_VERSION, data: { projects: [], halls: [], companies: [] } })
    const parsed = safeParseDemoDbSnapshot(raw)
    expect(parsed?.version).toBe(DEMO_DB_STORAGE_VERSION)
    expect(parsed?.data.projects).toEqual([])
  })

  test("safeParseDemoDbSnapshot: accepts projects with optional demo fields", () => {
    const raw = JSON.stringify({
      version: DEMO_DB_STORAGE_VERSION,
      data: {
        projects: [
          {
            id: 1,
            projectNumber: "1",
            projectName: "案件",
            clientName: "顧客",
            date: "2026/01/01",
            venue: "会場",
            talent: "担当",
            estimateAmount: "¥1",
            status: "proposed",
            hallName: "A渋谷店",
            companyId: "CORP-001",
            pachitownLinked: true,
            xAccountPostText: "投稿文",
            confirmedCompanions: ["Rio"],
            companionCostumes: { Rio: "S" },
            castingCost: 123,
            surveyResult: { satisfaction: "5", comment: "OK", nextEventDesired: "はい" },
          },
        ],
        halls: [],
        companies: [],
      },
    })
    const parsed = safeParseDemoDbSnapshot(raw)
    expect(parsed).not.toBeNull()
    expect(parsed?.data.projects[0].pachitownLinked).toBe(true)
    expect(parsed?.data.projects[0].castingCost).toBe(123)
  })

  test("safeParseDemoDbSnapshot: tolerates legacy snapshots with missing arrays (salvage what it can)", () => {
    const raw = JSON.stringify({
      version: 0,
      data: {
        projects: [
          {
            id: 1,
            projectName: "案件",
            clientName: "顧客",
            date: "2026/01/01",
            venue: "会場",
            talent: "担当",
            estimateAmount: "¥1",
            status: "proposed",
          },
          { id: "bad" },
        ],
      },
    })
    const parsed = safeParseDemoDbSnapshot(raw)
    expect(parsed?.version).toBe(DEMO_DB_STORAGE_VERSION)
    expect(parsed?.data.projects.length).toBe(1)
    expect(parsed?.data.halls).toEqual([])
    expect(parsed?.data.companies).toEqual([])
  })

  test("safeParseDemoDbSnapshot: rejects future versions", () => {
    const raw = JSON.stringify({ version: DEMO_DB_STORAGE_VERSION + 1, data: { projects: [], halls: [], companies: [] } })
    expect(safeParseDemoDbSnapshot(raw)).toBeNull()
  })

  test("loadDemoDbFromStorage: SSR (no window) returns null", () => {
    ;(globalThis as any).window = undefined
    expect(loadDemoDbFromStorage()).toBeNull()
  })

  test("save/load/clear roundtrip with injected window.localStorage", () => {
    const { storage, state } = makeLocalStorage()
    ;(globalThis as any).window = { localStorage: storage }

    expect(loadDemoDbFromStorage()).toBeNull()

    saveDemoDbToStorage({ projects: [], halls: [], companies: [] })
    expect(state.has(DEMO_DB_STORAGE_KEY)).toBe(true)

    const loaded = loadDemoDbFromStorage()
    expect(loaded?.version).toBe(DEMO_DB_STORAGE_VERSION)
    expect(loaded?.data.projects).toEqual([])

    clearDemoDbStorage()
    expect(state.has(DEMO_DB_STORAGE_KEY)).toBe(false)
  })

  test("loadDemoDbFromStorage: when version mismatches, it migrates and re-saves", () => {
    const { storage } = makeLocalStorage()
    ;(globalThis as any).window = { localStorage: storage }

    const legacyRaw = JSON.stringify({
      version: DEMO_DB_STORAGE_VERSION - 1,
      data: { projects: [], halls: [], companies: [] },
    })
    storage.setItem(DEMO_DB_STORAGE_KEY, legacyRaw)

    const loaded = loadDemoDbFromStorage()
    expect(loaded?.version).toBe(DEMO_DB_STORAGE_VERSION)

    const storedRaw = storage.getItem(DEMO_DB_STORAGE_KEY)
    const storedParsed = safeParseDemoDbSnapshot(storedRaw)
    expect(storedParsed?.version).toBe(DEMO_DB_STORAGE_VERSION)
  })
})

