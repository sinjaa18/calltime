"use client";

import type { Category, RequirementFormData } from "../../lib/types";
import type { WizardStep } from "../../lib/validation";

interface Props {
  data: RequirementFormData;
  onEdit: (step: WizardStep) => void;
}

type ReviewEntry = [label: string, value: string | string[]];

const categoryLabels: Record<Category, string> = {
  planner: "Event Planner",
  performer: "Performer",
  crew: "Crew",
};

function formatValue(value: string | string[]): string {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "Not provided";
  }

  if (!value.trim()) return "Not provided";

  const labels: Record<string, string> = {
    "day-of": "Day-of coordination",
    "coordination-only": "Coordination only",
    "not-required": "Not required",
    unsure: "Not sure yet",
    full: "Full planning",
    partial: "Partial planning",
    beginner: "Beginner",
    intermediate: "Intermediate",
    experienced: "Experienced",
    yes: "Yes",
    no: "No",
    partially: "Partially",
    required: "Required",
  };

  return labels[value] ?? value;
}

function ReviewSection({
  title,
  step,
  entries,
  onEdit,
}: {
  title: string;
  step: WizardStep;
  entries: ReviewEntry[];
  onEdit: (step: WizardStep) => void;
}) {
  return (
    <section className="review-section">
      <div className="review-section-header">
        <h2 className="review-section-title">{title}</h2>
        <button
          type="button"
          className="review-edit"
          onClick={() => onEdit(step)}
          aria-label={`Edit ${title}`}
        >
          Edit
        </button>
      </div>

      <div className="review-rows">
        {entries.map(([label, value]) => (
          <div className="review-row" key={label}>
            <span className="review-label">{label}</span>
            <span className="review-value">{formatValue(value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ReviewRequirementStep({ data, onEdit }: Props) {
  const { eventBasics, category, categoryDetails, additionalRequirements } =
    data;

  const eventEntries: ReviewEntry[] = [
    ["Event name", eventBasics.eventName],
    ["Event type", eventBasics.eventType || ""],
    ["Start date", eventBasics.startDate],
    ["End date", eventBasics.endDate],
    ["Location", eventBasics.location],
    ["Venue", eventBasics.venue],
  ];

  let categoryEntries: ReviewEntry[] = [];
  let additionalEntries: ReviewEntry[] = [];

  if (category === "planner") {
    const details = categoryDetails.planner;
    const additional = additionalRequirements.planner;

    categoryEntries = [
      ["Planning support", details.planningSupport],
      ["Planning scope", details.planningScope],
      ["Expected guest count", details.guestCount],
      ["Estimated budget (INR)", details.estimatedBudget],
      ["Event style", details.eventStyle],
      ["Number of event days", details.eventDays],
      ["Planning notes", details.planningNotes],
    ];

    additionalEntries = [
      ["Services expected", additional.servicesExpected],
      ["Setup and teardown", additional.setupTeardown],
      ["Required deliverables", additional.deliverables],
      ["Coordination notes", additional.coordinationNotes],
      ["Additional preferences", additional.preferences],
    ];
  }

  if (category === "performer") {
    const details = categoryDetails.performer;
    const additional = additionalRequirements.performer;

    categoryEntries = [
      ["Performance type", details.performanceType],
      ["Performance duration", details.performanceDuration],
      ["Number of performers", details.performerCount],
      ["Expected audience", details.expectedAudience],
      ["Estimated budget (INR)", details.estimatedBudget],
      ["Equipment and technical needs", details.equipmentNeeds],
      ["Performance notes", details.performanceNotes],
    ];

    additionalEntries = [
      ["Performance requirements", additional.performanceRequirements],
      ["Soundcheck", additional.soundcheck],
      ["Technical rider", additional.technicalRider],
      ["Schedule notes", additional.scheduleNotes],
      ["Additional preferences", additional.preferences],
    ];
  }

  if (category === "crew") {
    const details = categoryDetails.crew;
    const additional = additionalRequirements.crew;

    categoryEntries = [
      ["Roles required", details.roles],
      ["Number of crew members", details.crewCount],
      ["Shift duration", details.shiftDuration],
      ["Experience level", details.experienceLevel],
      ["Estimated budget (INR)", details.estimatedBudget],
      ["Equipment provided", details.equipmentProvided],
      ["Crew notes", details.crewNotes],
    ];

    additionalEntries = [
      ["Responsibilities", additional.responsibilities],
      ["Setup and teardown", additional.setupTeardown],
      ["Required skills", additional.requiredSkills],
      ["Shift schedule", additional.shiftSchedule],
      ["Additional preferences", additional.preferences],
    ];
  }

  return (
    <div className="review-container">
      <div className="review-intro">
        <p className="eyebrow">Almost there</p>
        <h2 className="card-title">Review your requirement</h2>
        <p className="page-description">
          Check the details below. Use Edit to return to any section and make
          changes before submitting.
        </p>
      </div>

      <div className="review-category">
        <span className="category-icon" aria-hidden="true">
          {category === "planner" ? "▦" : category === "performer" ? "♫" : "♧"}
        </span>
        <div>
          <p className="review-category-label">Requirement category</p>
          <h3 className="review-category-title">{categoryLabels[category]}</h3>
        </div>
      </div>

      <ReviewSection
        title="Event basics"
        step={1}
        entries={eventEntries}
        onEdit={onEdit}
      />

      <ReviewSection
        title={`${categoryLabels[category]} details`}
        step={2}
        entries={categoryEntries}
        onEdit={onEdit}
      />

      <ReviewSection
        title="Additional requirements"
        step={3}
        entries={additionalEntries}
        onEdit={onEdit}
      />

      <div className="review-disclaimer">
        <span aria-hidden="true">✓</span>
        <p>
          Your requirement is ready for submission. It will only be saved once
          you confirm submission and the server successfully stores it.
        </p>
      </div>
    </div>
  );
}
