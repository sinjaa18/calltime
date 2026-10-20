import type { RequirementFormData } from "./types";

export function getInitialFormData(): RequirementFormData {
  return {
    eventBasics: {
      eventName: "",
      eventType: "",
      startDate: "",
      endDate: "",
      location: "",
      venue: "",
    },

    category: "planner",

    categoryDetails: {
      planner: {
        planningSupport: "",
        planningScope: "",
        guestCount: "",
        estimatedBudget: "",
        eventStyle: "",
        eventDays: "1",
        planningNotes: "",
      },

      performer: {
        performanceType: "",
        performanceDuration: "",
        performerCount: "1",
        expectedAudience: "",
        estimatedBudget: "",
        equipmentNeeds: "",
        performanceNotes: "",
      },

      crew: {
        roles: [],
        crewCount: "1",
        shiftDuration: "",
        experienceLevel: "",
        estimatedBudget: "",
        equipmentProvided: "",
        crewNotes: "",
      },
    },

    additionalRequirements: {
      planner: {
        servicesExpected: "",
        setupTeardown: "",
        deliverables: "",
        coordinationNotes: "",
        preferences: "",
      },

      performer: {
        performanceRequirements: "",
        soundcheck: "",
        technicalRider: "",
        scheduleNotes: "",
        preferences: "",
      },

      crew: {
        responsibilities: "",
        setupTeardown: "",
        requiredSkills: "",
        shiftSchedule: "",
        preferences: "",
      },
    },
  };
}
