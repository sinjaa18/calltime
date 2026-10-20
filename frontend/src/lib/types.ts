export const EVENT_TYPES = [
  "Concert",
  "Wedding",
  "Corporate Event",
  "Conference",
  "Festival",
  "Private Party",
  "Other",
] as const;

export const CATEGORIES = [
  { value: "planner", label: "Event Planner" },
  { value: "performer", label: "Performer" },
  { value: "crew", label: "Crew" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];
export type EventType = (typeof EVENT_TYPES)[number];

export interface EventBasics {
  eventName: string;
  eventType: EventType | "";
  startDate: string;
  endDate: string;
  location: string;
  venue: string;
}

export interface PlannerDetails {
  planningSupport: "" | "full" | "partial" | "day-of" | "consultation";
  planningScope: "" | "full" | "partial" | "coordination-only";
  guestCount: string;
  estimatedBudget: string;
  eventStyle: string;
  eventDays: string;
  planningNotes: string;
}

export interface PerformerDetails {
  performanceType: string;
  performanceDuration: string;
  performerCount: string;
  expectedAudience: string;
  estimatedBudget: string;
  equipmentNeeds: string;
  performanceNotes: string;
}

export interface CrewDetails {
  roles: string[];
  crewCount: string;
  shiftDuration: string;
  experienceLevel: "" | "beginner" | "intermediate" | "experienced";
  estimatedBudget: string;
  equipmentProvided: "" | "yes" | "no" | "partially";
  crewNotes: string;
}

export interface PlannerRequirements {
  servicesExpected: string;
  setupTeardown: "" | "required" | "not-required" | "unsure";
  deliverables: string;
  coordinationNotes: string;
  preferences: string;
}

export interface PerformerRequirements {
  performanceRequirements: string;
  soundcheck: "" | "required" | "not-required" | "unsure";
  technicalRider: string;
  scheduleNotes: string;
  preferences: string;
}

export interface CrewRequirements {
  responsibilities: string;
  setupTeardown: "" | "required" | "not-required" | "unsure";
  requiredSkills: string;
  shiftSchedule: string;
  preferences: string;
}

export interface CategoryDetailsMap {
  planner: PlannerDetails;
  performer: PerformerDetails;
  crew: CrewDetails;
}

export interface AdditionalRequirementsMap {
  planner: PlannerRequirements;
  performer: PerformerRequirements;
  crew: CrewRequirements;
}

export interface RequirementFormData {
  eventBasics: EventBasics;
  category: Category;
  categoryDetails: CategoryDetailsMap;
  additionalRequirements: AdditionalRequirementsMap;
}

export interface CreateRequirementResponse {
  success: true;
  message: string;
  data: {
    id: string;
    requirementCode: string;
    category: Category;
    createdAt: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
}
