import type {
  CompanyData,
  DemoProductEntity,
  DemoProject,
  DemoProjectEntity,
  HallData,
  ProductionData,
  CompanionData,
} from "@/lib/demo-db/types"

export type DemoDbV3Data = {
  projects: DemoProjectEntity[]
  products: DemoProductEntity[]
  halls: HallData[]
  companies: CompanyData[]
  productions: ProductionData[]
  companions: CompanionData[]
}

const PROJECT_KEYS: Array<keyof DemoProject> = [
  "projectNumber",
  "projectName",
  "salesPersonName",
  "requestDate",
  "hallName",
  "hallId",
  "companyId",
  "companyName",
]

function pickProjectFields(project: DemoProjectEntity, halls: HallData[], companies: CompanyData[]) {
  const hallName = project.hallName || ""
  const hall =
    typeof project.hallRefId === "number"
      ? halls.find((h) => h.id === project.hallRefId)
      : hallName
        ? halls.find((h) => h.name === hallName)
        : undefined

  const company =
    hall && typeof hall.companyId === "number"
      ? companies.find((c) => c.id === hall.companyId)
      : project.companyId
        ? companies.find((c) => c.companyId === project.companyId)
        : undefined

  return {
    projectNumber: project.projectNumber,
    projectName: project.projectName,
    salesPersonName: project.salesPersonName || hall?.salesPersonName || "",
    requestDate: project.requestDate,
    hallName: project.hallName || hall?.name,
    hallId: project.hallCode || hall?.hallId,
    companyId: project.companyId || company?.companyId,
    companyName: project.companyName || company?.name,
  } satisfies Partial<DemoProject>
}

/**
 * v3(正規化)データから、v2互換の「1行=商材」形式へデノーマライズする。
 * UIは当面この形式を利用する。
 */
export function denormalizeProjects(data: DemoDbV3Data): DemoProject[] {
  const { projects, products, halls, companies } = data
  const byProjectId = new Map<number, DemoProjectEntity>()
  projects.forEach((p) => byProjectId.set(p.id, p))

  return products
    .map((prod) => {
      const proj = byProjectId.get(prod.projectId)
      if (!proj) return null

      const base = pickProjectFields(proj, halls, companies)

      // product passthrough fields first, then project base fields override shared columns
      const row: DemoProject = {
        ...(prod as any),
        ...(base as any),
        id: prod.id,
        status: prod.status,
        estimateAmount: prod.estimateAmount,
      }

      // Ensure project-level keys exist if missing (best-effort)
      for (const k of PROJECT_KEYS) {
        if ((row as any)[k] === undefined) {
          ;(row as any)[k] = (base as any)[k]
        }
      }

      return row
    })
    .filter((x): x is DemoProject => x !== null)
}

