import type { ProjectRepository } from "../project-repository"
import type { Project, Product, DesignRequest, MonthlyBilling, Company, Hall, Employee, CastSchedule, MachineMaster } from "../types"
import {
  SEED_VERSION,
  SEED_PROJECTS,
  SEED_PRODUCTS,
  SEED_DESIGN_REQUESTS,
  SEED_MONTHLY_BILLINGS,
  SEED_COMPANIES,
  SEED_HALLS,
  SEED_EMPLOYEES,
  SEED_CAST_SCHEDULES,
  SEED_MACHINE_MASTERS,
} from "../seed-data"

const STORAGE_KEYS = {
  version: "new_seed_version",
  projects: "new_projects",
  products: "new_products",
  designRequests: "new_design_requests",
  companies: "new_companies",
  halls: "new_halls",
  employees: "new_employees",
  machineMasters: "new_machine_masters",
  monthlyBillings: "new_monthly_billings",
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

  private ensureSeeded(): void {
    if (typeof window === "undefined") return

    const storedVersion = localStorage.getItem(STORAGE_KEYS.version)
    if (storedVersion !== String(SEED_VERSION)) {
      for (const key of Object.values(STORAGE_KEYS)) {
        localStorage.removeItem(key)
      }
      // コンポーネントローカルのlocalStorageキーもクリア
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith("extraction_") || key.startsWith("design_estimate_") || key.startsWith("psp_linked_"))) {
          keysToRemove.push(key)
        }
      }
      for (const key of keysToRemove) {
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
    if (!localStorage.getItem(STORAGE_KEYS.machineMasters)) {
      localStorage.setItem(STORAGE_KEYS.machineMasters, JSON.stringify(SEED_MACHINE_MASTERS))
    }
    if (!localStorage.getItem(STORAGE_KEYS.monthlyBillings)) {
      localStorage.setItem(STORAGE_KEYS.monthlyBillings, JSON.stringify(SEED_MONTHLY_BILLINGS))
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

  getAllDesignRequests(): DesignRequest[] {
    return getFromStorage<DesignRequest>(STORAGE_KEYS.designRequests, SEED_DESIGN_REQUESTS)
  }

  getDesignRequestsByProjectId(projectId: number): DesignRequest[] {
    return this.getAllDesignRequests().filter((dr) => dr.projectId === projectId)
  }

  createDesignRequest(request: Omit<DesignRequest, "id">): DesignRequest {
    const all = this.getAllDesignRequests()
    const maxNum = all.reduce((max, dr) => {
      const match = dr.id.match(/^DR-(\d+)$/)
      return match ? Math.max(max, parseInt(match[1], 10)) : max
    }, 0)
    const newRequest: DesignRequest = { ...request, id: `DR-${String(maxNum + 1).padStart(3, "0")}` }
    saveToStorage(STORAGE_KEYS.designRequests, [...all, newRequest])
    return newRequest
  }

  updateDesignRequest(id: string, updates: Partial<DesignRequest>): DesignRequest | undefined {
    const all = this.getAllDesignRequests()
    const index = all.findIndex((dr) => dr.id === id)
    if (index === -1) return undefined
    const updated = { ...all[index], ...updates }
    all[index] = updated
    saveToStorage(STORAGE_KEYS.designRequests, all)
    return updated
  }

  addDesignRequestComment(requestId: string, comment: string, role: string, authorName?: string): void {
    const all = this.getAllDesignRequests()
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

  getMachineMasters(): MachineMaster[] {
    return getFromStorage<MachineMaster>(STORAGE_KEYS.machineMasters, SEED_MACHINE_MASTERS)
  }

  saveMachineMasters(masters: MachineMaster[]): void {
    saveToStorage(STORAGE_KEYS.machineMasters, masters)
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

  // ─── 複製 ───

  duplicateProject(projectNumber: string, productIds: number[]): { project: Project; products: Product[] } {
    const sourceProject = this.getProjectByProjectNumber(projectNumber)
    if (!sourceProject) throw new Error(`Project ${projectNumber} not found`)

    const now = new Date().toISOString()
    const newProjectNumber = this.generateProjectNumber()

    // 案件を複製
    const newProject = this.createProject({
      projectNumber: newProjectNumber,
      projectName: sourceProject.projectName,
      companyName: sourceProject.companyName,
      companyId: sourceProject.companyId,
      hallName: sourceProject.hallName,
      hallId: sourceProject.hallId,
      salesPersonName: sourceProject.salesPersonName,
      requestDate: sourceProject.requestDate,
      createdAt: now,
      updatedAt: now,
    })

    // 選択された商材を複製
    const newProducts: Product[] = []
    for (const productId of productIds) {
      const sourceProduct = this.getProductById(productId)
      if (!sourceProduct) continue

      const { id: _id, projectId: _projectId, ...rest } = sourceProduct
      const newProduct = this.createProduct({
        ...rest,
        projectId: newProject.id,
        projectNumber: newProjectNumber,
        // ステータス系はリセット
        proposalStatus: "before-proposal",
        executionStatus: "実施前",
        readingCertainty: undefined,
        managementConfirmationStatus: undefined,
        chatMessages: [],
        comments: [],
        statusHistory: [],
        correctionRequest: undefined,
      })
      newProducts.push(newProduct)
    }

    return { project: newProject, products: newProducts }
  }

  duplicateProductsToSameProject(projectNumber: string, productIds: number[]): { projectNumber: string; products: Product[] } {
    const sourceProject = this.getProjectByProjectNumber(projectNumber)
    if (!sourceProject) throw new Error(`Project ${projectNumber} not found`)

    const newProducts: Product[] = []
    for (const productId of productIds) {
      const sourceProduct = this.getProductById(productId)
      if (!sourceProduct) continue

      const { id: _id, projectId: _projectId, ...rest } = sourceProduct
      const newProduct = this.createProduct({
        ...rest,
        projectId: sourceProject.id,
        projectNumber: projectNumber,
        proposalStatus: "before-proposal",
        executionStatus: "実施前",
        readingCertainty: undefined,
        managementConfirmationStatus: undefined,
        chatMessages: [],
        comments: [],
        statusHistory: [],
        correctionRequest: undefined,
      })
      newProducts.push(newProduct)
    }

    return { projectNumber, products: newProducts }
  }

  // ─── 月次計上 ───

  getMonthlyBillings(): MonthlyBilling[] {
    return getFromStorage<MonthlyBilling>(STORAGE_KEYS.monthlyBillings, SEED_MONTHLY_BILLINGS)
  }

  getMonthlyBillingById(id: string): MonthlyBilling | undefined {
    return this.getMonthlyBillings().find((b) => b.id === id)
  }

  getMonthlyBillingsByVendor(vendorId: string): MonthlyBilling[] {
    return this.getMonthlyBillings().filter((b) => b.vendorId === vendorId)
  }

  getMonthlyBillingsByMonth(billingMonth: string): MonthlyBilling[] {
    return this.getMonthlyBillings().filter((b) => b.billingMonth === billingMonth)
  }

  createMonthlyBilling(billing: Omit<MonthlyBilling, "id">): MonthlyBilling {
    const all = this.getMonthlyBillings()
    const maxNum = all.reduce((max, b) => {
      const match = b.id.match(/^MB-(\d+)$/)
      return match ? Math.max(max, parseInt(match[1], 10)) : max
    }, 0)
    const newBilling: MonthlyBilling = { ...billing, id: `MB-${String(maxNum + 1).padStart(3, "0")}` }
    saveToStorage(STORAGE_KEYS.monthlyBillings, [...all, newBilling])
    return newBilling
  }

  updateMonthlyBilling(id: string, updates: Partial<MonthlyBilling>): MonthlyBilling | undefined {
    const all = this.getMonthlyBillings()
    const index = all.findIndex((b) => b.id === id)
    if (index === -1) return undefined
    const updated = { ...all[index], ...updates }
    all[index] = updated
    saveToStorage(STORAGE_KEYS.monthlyBillings, all)
    return updated
  }
}
