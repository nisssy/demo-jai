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

export const DemoDbSnapshotSchema = z.object({
  version: z.number(),
  data: z.object({
    projects: z.array(ProjectSchema),
    halls: z.array(HallDataSchema),
    companies: z.array(CompanyDataSchema),
  }),
})

export type DemoDbSnapshot = z.infer<typeof DemoDbSnapshotSchema>

