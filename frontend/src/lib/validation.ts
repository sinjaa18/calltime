import type { Category, RequirementFormData } from "./types";

export interface FieldError {
  field: string;
  message: string;
}

export type WizardStep = 1 | 2 | 3 | 4;

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function validPositiveNumber(value: string): boolean {
  return (
    value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) > 0
  );
}

function validNonNegativeNumber(value: string): boolean {
  return (
    value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0
  );
}

function required(value: string, field: string, label: string): FieldError[] {
  return value.trim() ? [] : [{ field, message: `${label} is required.` }];
}

export function validateEventBasics(
  data: RequirementFormData["eventBasics"],
): FieldError[] {
  const errors: FieldError[] = [];

  errors.push(...required(data.eventName, "eventName", "Event name"));
  errors.push(...required(data.eventType, "eventType", "Event type"));
  errors.push(...required(data.startDate, "startDate", "Start date"));
  errors.push(...required(data.location, "location", "Location"));

  if (
    data.eventType &&
    ![
      "Concert",
      "Wedding",
      "Corporate Event",
      "Conference",
      "Festival",
      "Private Party",
      "Other",
    ].includes(data.eventType)
  ) {
    errors.push({ field: "eventType", message: "Select a valid event type." });
  }

  if (data.startDate && !isValidDate(data.startDate)) {
    errors.push({ field: "startDate", message: "Enter a valid start date." });
  }

  if (data.endDate && !isValidDate(data.endDate)) {
    errors.push({ field: "endDate", message: "Enter a valid end date." });
  }

  if (
    isValidDate(data.startDate) &&
    isValidDate(data.endDate) &&
    data.endDate < data.startDate
  ) {
    errors.push({
      field: "endDate",
      message: "End date cannot be before the start date.",
    });
  }

  return errors;
}

export function validateCategoryDetails(
  data: RequirementFormData["categoryDetails"],
  category: Category,
): FieldError[] {
  const errors: FieldError[] = [];

  if (category === "planner") {
    const details = data.planner;

    errors.push(
      ...required(
        details.planningSupport,
        "planningSupport",
        "Planning support",
      ),
      ...required(details.planningScope, "planningScope", "Planning scope"),
    );

    if (!validPositiveNumber(details.guestCount)) {
      errors.push({
        field: "guestCount",
        message: "Guest count must be a positive number.",
      });
    }

    if (!validNonNegativeNumber(details.estimatedBudget)) {
      errors.push({
        field: "estimatedBudget",
        message: "Enter a valid budget of zero or more.",
      });
    }

    if (!validPositiveNumber(details.eventDays)) {
      errors.push({
        field: "eventDays",
        message: "Number of event days must be at least 1.",
      });
    }
  }

  if (category === "performer") {
    const details = data.performer;

    errors.push(
      ...required(
        details.performanceType,
        "performanceType",
        "Performance type",
      ),
      ...required(
        details.performanceDuration,
        "performanceDuration",
        "Performance duration",
      ),
    );

    if (!validPositiveNumber(details.performerCount)) {
      errors.push({
        field: "performerCount",
        message: "Number of performers must be at least 1.",
      });
    }

    if (
      details.expectedAudience &&
      !validNonNegativeNumber(details.expectedAudience)
    ) {
      errors.push({
        field: "expectedAudience",
        message: "Expected audience must be zero or more.",
      });
    }

    if (!validNonNegativeNumber(details.estimatedBudget)) {
      errors.push({
        field: "estimatedBudget",
        message: "Enter a valid budget of zero or more.",
      });
    }
  }

  if (category === "crew") {
    const details = data.crew;

    if (details.roles.length === 0) {
      errors.push({
        field: "roles",
        message: "Select at least one crew role.",
      });
    }

    if (!validPositiveNumber(details.crewCount)) {
      errors.push({
        field: "crewCount",
        message: "Crew count must be at least 1.",
      });
    }

    errors.push(
      ...required(details.shiftDuration, "shiftDuration", "Shift duration"),
      ...required(
        details.experienceLevel,
        "experienceLevel",
        "Experience level",
      ),
    );

    if (!validNonNegativeNumber(details.estimatedBudget)) {
      errors.push({
        field: "estimatedBudget",
        message: "Enter a valid budget of zero or more.",
      });
    }
  }

  return errors;
}

export function validateAdditionalRequirements(
  _data: RequirementFormData["additionalRequirements"],
  _category: Category,
): FieldError[] {
  // These fields are optional in the initial assignment scope.
  // Add required rules here if the product requirements change.
  return [];
}

export function validateStep(
  data: RequirementFormData,
  step: WizardStep,
): FieldError[] {
  switch (step) {
    case 1:
      return validateEventBasics(data.eventBasics);
    case 2:
      return validateCategoryDetails(data.categoryDetails, data.category);
    case 3:
      return validateAdditionalRequirements(
        data.additionalRequirements,
        data.category,
      );
    case 4:
      return [
        ...validateEventBasics(data.eventBasics),
        ...validateCategoryDetails(data.categoryDetails, data.category),
        ...validateAdditionalRequirements(
          data.additionalRequirements,
          data.category,
        ),
      ];
  }
}
