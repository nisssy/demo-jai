import type { ProjectRepository } from "../project-repository"
import type { Project, Product, DesignRequest, Company, Hall, Employee, CastSchedule } from "../types"
import {
  SEED_VERSION,
  SEED_PROJECTS,
  SEED_PRODUCTS,
  SEED_DESIGN_REQUESTS,
  SEED_COMPANIES,
  SEED_HALLS,
  SEED_EMPLOYEES,
  SEED_CAST_SCHEDULES,
} from "../seed-data"

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

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

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

  createDesignRequest(request: Omit<DesignRequest, "id">): DesignRequest {
    const all = getFromStorage<DesignRequest>(STORAGE_KEYS.designRequests, SEED_DESIGN_REQUESTS)
    const maxNum = all.reduce((max, dr) => {
      const match = dr.id.match(/^DR-(\d+)$/)
      return match ? Math.max(max, parseInt(match[1], 10)) : max
    }, 0)
    const newRequest: DesignRequest = { ...request, id: `DR-${String(maxNum + 1).padStart(3, "0")}` }
    saveToStorage(STORAGE_KEYS.designRequests, [...all, newRequest])
    return newRequest
  }

  addDesignRequestComment(requestId: string, comment: string, role: string, authorName?: string): void {
    const all = getFromStorage<DesignRequest>(STORAGE_KEYS.designRequests, SEED_DESIGN_REQUESTS)
    const index = all.findIndex((dr) => dr.id === requestId)
    if (index === -1) return
    const dr = { ...all[index] }
    const comments = [...(dr.comments ?? [])]
    comments.push({
      id: `C-${Date.now()}`,
      text: comment,
      role,
      authorName,
      createdAt: new Date().toISOString(),
    })
    dr.comments = comments
    all[index] = dr
    saveToStorage(STORAGE_KEYS.designRequests, all)
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

  getCastSchedules(): CastSchedule[] {
    return SEED_CAST_SCHEDULES
  }

  // ─── 書き込み ───

  createProject(project: Omit<Project, "id">): Project {
    const projects = this.getProjects()
    const maxId = projects.reduce((max, p) => Math.max(max, p.id), 0)
    const newProject: Project = { ...project, id: maxId + 1 }
    saveToStorage(STORAGE_KEYS.projects, [...projects, newProject])
    return newProject
  }

  createProduct(product: Omit<Product, "id">): Product {
    const products = this.getProducts()
    const maxId = products.reduce((max, p) => Math.max(max, p.id), 0)
    const newProduct: Product = { ...product, id: maxId + 1 }
    saveToStorage(STORAGE_KEYS.products, [...products, newProduct])
    return newProduct
  }

  updateProject(projectNumber: string, updates: Partial<Project>): Project | undefined {
    const projects = this.getProjects()
    const index = projects.findIndex((p) => p.projectNumber === projectNumber)
    if (index === -1) return undefined
    const updated = { ...projects[index], ...updates }
    projects[index] = updated
    saveToStorage(STORAGE_KEYS.projects, projects)
    return updated
  }

  updateProduct(id: number, updates: Partial<Product>): Product | undefined {
    const products = this.getProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index === -1) return undefined
    const updated = { ...products[index], ...updates }
    products[index] = updated
    saveToStorage(STORAGE_KEYS.products, products)
    return updated
  }

  generateProjectNumber(): string {
    const projects = this.getProjects()
    const maxNum = projects.reduce((max, p) => {
      const match = p.projectNumber.match(/^PJ-(\d+)$/)
      return match ? Math.max(max, parseInt(match[1], 10)) : max
    }, 0)
    return `PJ-${String(maxNum + 1).padStart(3, "0")}`
  }
}
