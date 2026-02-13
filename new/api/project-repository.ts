import type { Project, Product, DesignRequest, Company, Hall, Employee } from "./types"

/** 案件リポジトリのインターフェース */
export interface ProjectRepository {
  // 案件
  getProjects(): Project[]
  getProjectByProjectNumber(projectNumber: string): Project | undefined

  // 商材
  getProducts(): Product[]
  getProductById(id: number): Product | undefined
  getProductsByProjectNumber(projectNumber: string): Product[]

  // デザイン依頼
  getDesignRequestsByProjectId(projectId: number): DesignRequest[]
  createDesignRequest(request: Omit<DesignRequest, "id">): DesignRequest
  addDesignRequestComment(requestId: string, comment: string, role: string, authorName?: string): void

  // 書き込み
  createProject(project: Omit<Project, "id">): Project
  createProduct(product: Omit<Product, "id">): Product
  updateProject(projectNumber: string, updates: Partial<Project>): Project | undefined
  updateProduct(id: number, updates: Partial<Product>): Product | undefined
  generateProjectNumber(): string

  // マスタ
  getCompanies(): Company[]
  getHalls(): Hall[]
  getEmployees(): Employee[]
}
