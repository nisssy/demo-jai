import type { ProjectData } from "@/types/project"

export type CompanyData = {
  id: number
  companyId: string
  name: string
}

export type HallData = {
  id: number
  hallId: string
  name: string
  salesPersonName: string
  companyId: number
  discountAmount: number
}

export type DemoProject = NonNullable<ProjectData["projects"]>[number]

