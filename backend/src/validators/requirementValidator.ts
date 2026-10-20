import { z } from "zod";

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

const eventBasicsSchema = z.object({
  eventName: z.string().trim().min(1, "Event name is required.").max(120),
  eventType: z.enum([
    "Concert",
    "Wedding",
    "Corporate Event",
    "Conference",
    "Festival",
    "Private Party",
    "Other",
  ]),
  startDate: z.string().refine(isValidDate, "Enter a valid start date."),
  endDate: z
    .string()
    .refine(
      (value) => value === "" || isValidDate(value),
      "Enter a valid end date.",
    )
    .default(""),
  location: z.string().trim().min(1, "Location is required.").max(200),
  venue: z.string().trim().max(200).default(""),
});

const plannerDetailsSchema = z.object({
  planningSupport: z.enum(["full", "partial", "day-of", "consultation"]),
  planningScope: z.enum(["full", "partial", "coordination-only"]),
  guestCount: z.number().int().positive(),
  estimatedBudget: z.number().finite().nonnegative(),
  eventStyle: z.string().trim().max(200).default(""),
  eventDays: z.number().int().positive(),
  planningNotes: z.string().trim().max(2000).default(""),
});

const performerDetailsSchema = z.object({
  performanceType: z.enum([
    "singer",
    "band",
    "dj",
    "musician",
    "dancer",
    "mc",
    "other",
  ]),
  performanceDuration: z.enum([
    "15 minutes",
    "30 minutes",
    "60 minutes",
    "2 hours",
    "multiple sets",
    "full event",
  ]),
  performerCount: z.number().int().positive(),
  expectedAudience: z.number().int().nonnegative().nullable().default(null),
  estimatedBudget: z.number().finite().nonnegative(),
  equipmentNeeds: z.string().trim().max(2000).default(""),
  performanceNotes: z.string().trim().max(2000).default(""),
});

const crewRoles = [
  "Stage setup",
  "Sound technician",
  "Lighting technician",
  "Security",
  "Logistics",
  "Photography",
  "Hospitality",
  "Other",
] as const;

const crewDetailsSchema = z.object({
  roles: z.array(z.enum(crewRoles)).min(1, "Select at least one crew role."),
  crewCount: z.number().int().positive(),
  shiftDuration: z.string().trim().min(1).max(100),
  experienceLevel: z.enum(["beginner", "intermediate", "experienced"]),
  estimatedBudget: z.number().finite().nonnegative(),
  equipmentProvided: z.enum(["", "yes", "no", "partially"]).default(""),
  crewNotes: z.string().trim().max(2000).default(""),
});

const plannerRequirementsSchema = z.object({
  servicesExpected: z.string().trim().max(3000).default(""),
  setupTeardown: z.enum(["", "required", "not-required", "unsure"]).default(""),
  deliverables: z.string().trim().max(3000).default(""),
  coordinationNotes: z.string().trim().max(3000).default(""),
  preferences: z.string().trim().max(3000).default(""),
});

const performerRequirementsSchema = z.object({
  performanceRequirements: z.string().trim().max(3000).default(""),
  soundcheck: z.enum(["", "required", "not-required", "unsure"]).default(""),
  technicalRider: z.string().trim().max(3000).default(""),
  scheduleNotes: z.string().trim().max(3000).default(""),
  preferences: z.string().trim().max(3000).default(""),
});

const crewRequirementsSchema = z.object({
  responsibilities: z.string().trim().max(3000).default(""),
  setupTeardown: z.enum(["", "required", "not-required", "unsure"]).default(""),
  requiredSkills: z.string().trim().max(3000).default(""),
  shiftSchedule: z.string().trim().max(3000).default(""),
  preferences: z.string().trim().max(3000).default(""),
});

const baseFields = {
  eventBasics: eventBasicsSchema,
};

export const createRequirementSchema = z
  .discriminatedUnion("category", [
    z.object({
      ...baseFields,
      category: z.literal("planner"),
      categoryDetails: plannerDetailsSchema,
      additionalRequirements: plannerRequirementsSchema.default({
        servicesExpected: "",
        setupTeardown: "",
        deliverables: "",
        coordinationNotes: "",
        preferences: "",
      }),
    }),

    z.object({
      ...baseFields,
      category: z.literal("performer"),
      categoryDetails: performerDetailsSchema,
      additionalRequirements: performerRequirementsSchema.default({
        performanceRequirements: "",
        soundcheck: "",
        technicalRider: "",
        scheduleNotes: "",
        preferences: "",
      }),
    }),

    z.object({
      ...baseFields,
      category: z.literal("crew"),
      categoryDetails: crewDetailsSchema,
      additionalRequirements: crewRequirementsSchema.default({
        responsibilities: "",
        setupTeardown: "",
        requiredSkills: "",
        shiftSchedule: "",
        preferences: "",
      }),
    }),
  ])
  .superRefine((data, context) => {
    const { startDate, endDate } = data.eventBasics;

    if (
      endDate &&
      isValidDate(startDate) &&
      isValidDate(endDate) &&
      endDate < startDate
    ) {
      context.addIssue({
        code: "custom",
        path: ["eventBasics", "endDate"],
        message: "End date cannot be before the start date.",
      });
    }
  });

export type CreateRequirementInput = z.infer<typeof createRequirementSchema>;
