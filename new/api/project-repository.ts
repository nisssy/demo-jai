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

  // マスタ
  getCompanies(): Company[]
  getHalls(): Hall[]
  getEmployees(): Employee[]
}
