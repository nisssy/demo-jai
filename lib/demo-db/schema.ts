import { z } from "zod"

export const CompanyDataSchema = z.object({
  id: z.number(),
  companyId: z.string(),
  name: z.string(),
})

export const HallDataSchema = z.object({
  id: z.number(),
  hallId: z.string(),
  name: z.string(),
  salesPersonName: z.string(),
  companyId: z.number(),
  discountAmount: z.number(),
})

/**
 * v2までの「1行=商材(案件情報も含む)」のレガシー形式。
 * v3では正規化（Project=案件 / Product=商材）へ移行するが、
 * 旧データの読み込み・マイグレーションのため残す。
 */
export const ProjectSchema = z
  .object({
    id: z.number(),
    projectNumber: z.string().optional(),
    projectName: z.string(),
    clientName: z.string(),
    date: z.string(),
    venue: z.string(),
    talent: z.string(),
    estimateAmount: z.string(),
    status: z.enum(["proposed", "ordered"]),

    // Optional demo fields we rely on in UI (keep optional for backwards compatibility)
    salesPersonName: z.string().optional(),
    requestDate: z.string().optional(),
    hallName: z.string().optional(),
    hallId: z.string().optional(),
    companyId: z.string().optional(),
    companyName: z.string().optional(),
    projectStatus: z.string().optional(),
    category: z.string().optional(),
    eventType: z.string().optional(),
    eventProductName: z.string().optional(),
    eventDate: z.string().optional(),
    estimatedBillingAmount: z.number().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    companionCount: z.string().optional(),
    directorCount: z.string().optional(),
    mcCount: z.string().optional(),
    selectedCompanions: z.array(z.string()).optional(),
    selectedDirectors: z.array(z.string()).optional(),
    selectedMcs: z.array(z.string()).optional(),
    correctionRequest: z.string().optional(),
    correctionComment: z.string().optional(),
    temporaryHoldFailureComment: z.string().optional(),
    confirmedCompanions: z.array(z.string()).optional(),
    confirmedDirectors: z.array(z.string()).optional(),
    confirmedMcs: z.array(z.string()).optional(),
    companionCostumes: z.record(z.string()).optional(),
    mustSeeFlag: z.string().optional(),
    mustSeePublication: z.string().optional(),
    publicationDate: z.string().optional(),
    publicationTime: z.string().optional(),
    reportRequired: z.string().optional(),
    pachitownLinked: z.boolean().optional(),
    pachitownLinkedDate: z.string().optional(),
    xAccountPostText: z.string().optional(),
    surveySent: z.boolean().optional(),
    surveySentDate: z.string().optional(),
    surveyResult: z
      .object({
        satisfaction: z.string().optional(),
        comment: z.string().optional(),
        nextEventDesired: z.string().optional(),
      })
      .optional(),
    castingCost: z.number().optional(),
    transportationFee: z.number().optional(),
    accommodationFee: z.number().optional(),
    postPRCost: z.number().optional(),
    isTransportationAutoFilled: z.boolean().optional(),
    isAccommodationAutoFilled: z.boolean().optional(),
  })
  .passthrough()

/**
 * v3の案件(Project)エンティティ
 * - 案件は1つのホールに紐づく（hallId）
 * - 案件は複数の商材(Product)を持つ（Product.projectId が参照）
 */
export const ProjectEntitySchema = z
  .object({
    id: z.number(),
    projectNumber: z.string(),
    projectName: z.string(),
    /**
     * 基本情報（ProjectRegistrationの基本情報セクションで入力/表示されるもの）
     * - 法人名/法人ID
     * - ホール名/ホールID
     * - 案件名
     * - ホール担当営業
     * - 依頼日
     */
    companyId: z.string().optional(),
    companyName: z.string().optional(),
    hallName: z.string().optional(),
    hallCode: z.string().optional(), // ホールID（文字列）
    salesPersonName: z.string().optional(), // ホール担当営業
    requestDate: z.string().optional(), // 依頼日（YYYY/MM/DD 等）

    // 参照用（ホールマスタの内部ID）
    hallRefId: z.number().optional(), // HallData.id（データ救済のため optional）

    // 監査情報
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough()

/**
 * v3の商材(Product)エンティティ
 */
export const ProductEntitySchema = z
  .object({
    id: z.number(),
    projectId: z.number(),
    /**
     * それ以外 = 商材(Product)属性
     * 元々の「案件データ（1行=商材）」が持っていた属性は、ここに保持する（必要に応じて optional）。
     */
    clientName: z.string().optional(),
    date: z.string().optional(),
    venue: z.string().optional(),
    talent: z.string().optional(),
    estimateAmount: z.string(),
    status: z.enum(["proposed", "ordered"]),

    // Optional demo fields we rely on in UI (keep optional for backwards compatibility)
    projectStatus: z.string().optional(),
    category: z.string().optional(),
    eventType: z.string().optional(),
    eventProductName: z.string().optional(),
    eventDate: z.string().optional(),
    estimatedBillingAmount: z.number().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    companionCount: z.string().optional(),
    directorCount: z.string().optional(),
    mcCount: z.string().optional(),
    selectedCompanions: z.array(z.string()).optional(),
    selectedDirectors: z.array(z.string()).optional(),
    selectedMcs: z.array(z.string()).optional(),
    nominatedCompanions: z.record(z.boolean()).optional(),
    nominatedDirectors: z.record(z.boolean()).optional(),
    nominatedMcs: z.record(z.boolean()).optional(),
    correctionRequest: z.string().optional(),
    correctionComment: z.string().optional(),
    temporaryHoldFailureComment: z.string().optional(),
    confirmedCompanions: z.array(z.string()).optional(),
    confirmedDirectors: z.array(z.string()).optional(),
    confirmedMcs: z.array(z.string()).optional(),
    companionCostumes: z.record(z.string()).optional(),
    mustSeeFlag: z.string().optional(),
    mustSeePublication: z.string().optional(),
    publicationDate: z.string().optional(),
    publicationTime: z.string().optional(),
    reportRequired: z.string().optional(),
    pachitownLinked: z.boolean().optional(),
    pachitownLinkedDate: z.string().optional(),
    xAccountPostText: z.string().optional(),
    surveySent: z.boolean().optional(),
    surveySentDate: z.string().optional(),
    surveyResult: z
      .object({
        satisfaction: z.string().optional(),
        comment: z.string().optional(),
        nextEventDesired: z.string().optional(),
      })
      .optional(),
    castingCost: z.number().optional(),
    transportationFee: z.number().optional(),
    accommodationFee: z.number().optional(),
    postPRCost: z.number().optional(),
    isTransportationAutoFilled: z.boolean().optional(),
    isAccommodationAutoFilled: z.boolean().optional(),

    // 見積書関連（デモ）
    quoteGenerated: z.boolean().optional(),
    quoteData: z.any().optional(),
  })
  .passthrough()

export const DemoDbSnapshotSchema = z.object({
  version: z.number(),
  data: z.object({
    projects: z.array(ProjectEntitySchema),
    products: z.array(ProductEntitySchema),
    halls: z.array(HallDataSchema),
    companies: z.array(CompanyDataSchema),
  }),
})

export type DemoDbSnapshot = z.infer<typeof DemoDbSnapshotSchema>

