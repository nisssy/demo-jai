import type { CompanyData, DemoProject, HallData } from "@/lib/demo-db/types"

export function generateProjectNumber(existingProjects: DemoProject[]): string {
  let maxNumber = 0
  existingProjects.forEach((p) => {
    if (p.projectNumber) {
      const num = Number.parseInt(p.projectNumber)
      if (!Number.isNaN(num) && num > maxNumber) maxNumber = num
    }
  })
  return String(maxNumber + 1)
}

export function addProject(
  existingProjects: DemoProject[],
  project: Omit<DemoProject, "id">,
): { nextProjects: DemoProject[]; created: DemoProject } {
  const maxId = existingProjects.length > 0 ? Math.max(...existingProjects.map((p) => (typeof p.id === "number" ? p.id : 0))) : 0
  const projectNumber = project.projectNumber || generateProjectNumber(existingProjects)
  const created: DemoProject = {
    ...project,
    id: maxId + 1,
    projectNumber,
  } as DemoProject
  return { nextProjects: [...existingProjects, created], created }
}

export function addProjects(
  existingProjects: DemoProject[],
  newProjects: Omit<DemoProject, "id">[],
): { nextProjects: DemoProject[]; created: DemoProject[] } {
  const maxId = existingProjects.length > 0 ? Math.max(...existingProjects.map((p) => (typeof p.id === "number" ? p.id : 0))) : 0

  let current = [...existingProjects]
  const created: DemoProject[] = newProjects.map((p, idx) => {
    const projectNumber = p.projectNumber || generateProjectNumber(current)
    const next: DemoProject = {
      ...p,
      id: maxId + idx + 1,
      projectNumber,
    } as DemoProject
    current = [...current, next]
    return next
  })

  return { nextProjects: [...existingProjects, ...created], created }
}

export function patchProject(
  projects: DemoProject[],
  id: number,
  updates: Partial<DemoProject>,
): { nextProjects: DemoProject[]; updated: DemoProject | null } {
  let updated: DemoProject | null = null
  const nextProjects = projects.map((p) => {
    if (p.id !== id) return p
    updated = { ...p, ...updates } as DemoProject
    return updated
  })
  return { nextProjects, updated }
}

export function removeProject(projects: DemoProject[], id: number): { nextProjects: DemoProject[]; removed: boolean } {
  let removed = false
  const nextProjects = projects.filter((p) => {
    if (p.id === id) {
      removed = true
      return false
    }
    return true
  })
  return { nextProjects, removed }
}

export function findProjectById(projects: DemoProject[], id: number): DemoProject | null {
  return projects.find((p) => p.id === id) || null
}

export function findHallByName(halls: HallData[], name: string): HallData | null {
  return halls.find((h) => h.name === name) || null
}

export function searchHalls(halls: HallData[], query: string, companyId?: number): HallData[] {
  let filtered = halls
  if (companyId !== undefined) {
    filtered = filtered.filter((h) => h.companyId === companyId)
  }
  if (!query) return filtered
  const q = query.toLowerCase()
  return filtered.filter((h) => h.name.toLowerCase().includes(q))
}

export function findCompanyById(companies: CompanyData[], id: number): CompanyData | null {
  return companies.find((c) => c.id === id) || null
}

export function findCompanyByCompanyId(companies: CompanyData[], companyId: string): CompanyData | null {
  return companies.find((c) => c.companyId === companyId) || null
}

export function searchCompanies(companies: CompanyData[], query: string): CompanyData[] {
  if (!query) return companies
  const q = query.toLowerCase()
  return companies.filter((c) => c.name.toLowerCase().includes(q) || c.companyId.toLowerCase().includes(q))
}

export function getHallsByCompanyId(halls: HallData[], companyId: number): HallData[] {
  return halls.filter((h) => h.companyId === companyId)
}

