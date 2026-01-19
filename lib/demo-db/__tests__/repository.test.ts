import { describe, expect, test } from "bun:test"
import {
  addProject,
  addProjects,
  findCompanyByCompanyId,
  findCompanyById,
  findHallByName,
  findProjectById,
  generateProjectNumber,
  getHallsByCompanyId,
  patchProject,
  removeProject,
  searchCompanies,
  searchHalls,
} from "../repository"
import type { CompanyData, DemoProject, HallData } from "../types"

function makeProject(overrides: Partial<DemoProject> = {}): DemoProject {
  return {
    id: 1,
    projectNumber: "1",
    projectName: "案件",
    clientName: "顧客",
    date: "2026-01-01",
    venue: "会場",
    talent: "担当",
    estimateAmount: "¥100,000",
    status: "proposed",
    ...overrides,
  }
}

describe("lib/demo-db/repository", () => {
  test("generateProjectNumber: increments max numeric projectNumber", () => {
    const projects = [
      makeProject({ id: 1, projectNumber: "10" }),
      makeProject({ id: 2, projectNumber: "2" }),
      makeProject({ id: 3, projectNumber: "foo" }), // ignored
    ]
    expect(generateProjectNumber(projects)).toBe("11")
  })

  test("addProject: assigns id and projectNumber when missing", () => {
    const existing = [makeProject({ id: 5, projectNumber: "5" })]
    const { nextProjects, created } = addProject(existing, {
      projectName: "新規",
      clientName: "顧客",
      date: "2026-01-01",
      venue: "会場",
      talent: "担当",
      estimateAmount: "¥1",
      status: "proposed",
    })
    expect(created.id).toBe(6)
    expect(created.projectNumber).toBe("6")
    expect(nextProjects).toHaveLength(2)
  })

  test("addProjects: assigns sequential ids and projectNumbers", () => {
    const existing = [makeProject({ id: 3, projectNumber: "3" })]
    const { created, nextProjects } = addProjects(existing, [
      {
        projectName: "A",
        clientName: "顧客",
        date: "2026-01-01",
        venue: "会場",
        talent: "担当",
        estimateAmount: "¥1",
        status: "proposed",
      },
      {
        projectName: "B",
        clientName: "顧客",
        date: "2026-01-01",
        venue: "会場",
        talent: "担当",
        estimateAmount: "¥1",
        status: "proposed",
      },
    ])
    expect(created.map((p) => p.id)).toEqual([4, 5])
    expect(created.map((p) => p.projectNumber)).toEqual(["4", "5"])
    expect(nextProjects).toHaveLength(3)
  })

  test("patchProject: updates matching project and returns null when not found", () => {
    const projects = [makeProject({ id: 1, projectName: "A" }), makeProject({ id: 2, projectName: "B" })]
    const { nextProjects, updated } = patchProject(projects, 2, { projectStatus: "見積送付完了" } as Partial<DemoProject>)
    expect(updated?.id).toBe(2)
    expect(updated?.projectStatus).toBe("見積送付完了")
    expect(nextProjects.find((p) => p.id === 2)?.projectStatus).toBe("見積送付完了")

    const miss = patchProject(projects, 999, { projectName: "X" })
    expect(miss.updated).toBeNull()
  })

  test("removeProject: removes and reports removed flag", () => {
    const projects = [makeProject({ id: 1 }), makeProject({ id: 2 })]
    const { nextProjects, removed } = removeProject(projects, 2)
    expect(removed).toBe(true)
    expect(nextProjects.map((p) => p.id)).toEqual([1])

    const miss = removeProject(projects, 999)
    expect(miss.removed).toBe(false)
    expect(miss.nextProjects).toHaveLength(2)
  })

  test("findProjectById", () => {
    const projects = [makeProject({ id: 1 }), makeProject({ id: 2 })]
    expect(findProjectById(projects, 2)?.id).toBe(2)
    expect(findProjectById(projects, 999)).toBeNull()
  })

  test("hall/company lookup + search", () => {
    const companies: CompanyData[] = [
      { id: 1, companyId: "CORP-001", name: "株式会社A" },
      { id: 2, companyId: "CORP-XYZ", name: "B Inc" },
    ]
    const halls: HallData[] = [
      { id: 10, hallId: "CORP-001-HALL-01", name: "A渋谷店", salesPersonName: "山田", companyId: 1, discountAmount: 0 },
      { id: 11, hallId: "CORP-XYZ-HALL-01", name: "B新宿店", salesPersonName: "佐藤", companyId: 2, discountAmount: 0 },
    ]

    expect(findCompanyById(companies, 2)?.companyId).toBe("CORP-XYZ")
    expect(findCompanyByCompanyId(companies, "CORP-001")?.name).toBe("株式会社A")
    expect(findCompanyByCompanyId(companies, "NOPE")).toBeNull()

    expect(findHallByName(halls, "A渋谷店")?.id).toBe(10)
    expect(findHallByName(halls, "NOPE")).toBeNull()

    expect(searchCompanies(companies, "corp")).toHaveLength(2)
    expect(searchCompanies(companies, "xyz")).toEqual([{ id: 2, companyId: "CORP-XYZ", name: "B Inc" }])

    expect(searchHalls(halls, "店")).toHaveLength(2)
    expect(searchHalls(halls, "渋谷")).toEqual([halls[0]])
    expect(searchHalls(halls, "", 2)).toEqual([halls[1]])

    expect(getHallsByCompanyId(halls, 1)).toEqual([halls[0]])
  })
})

