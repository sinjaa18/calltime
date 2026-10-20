"use client";

import type { Category, RequirementFormData } from "../../lib/types";
import type { FieldError } from "../../lib/validation";

interface Props {
  category: Category;
  details: RequirementFormData["categoryDetails"];
  errors: FieldError[];
  onUpdate: (field: string, value: string) => void;
  onToggleCrewRole: (role: string, checked: boolean) => void;
}

const crewRoles = [
  "Stage setup",
  "Sound technician",
  "Lighting technician",
  "Security",
  "Logistics",
  "Photography",
  "Hospitality",
  "Other",
];

function Field({
  id,
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
  error,
  min,
  step,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  min?: string;
  step?: string;
}) {
  return (
    <div className="form-field">
      <label className="field-label" htmlFor={id}>
        {label} {required && <span className="required-mark">*</span>}
      </label>
      <input
        className="field-control"
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="form-field">
      <label className="field-label" htmlFor={id}>
        {label} <span className="required-mark">*</span>
      </label>
      <select
        id={id}
        className="field-control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="form-field full-width">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className="field-control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </div>
  );
}

export default function CategoryDetailsStep({
  category,
  details,
  errors,
  onUpdate,
  onToggleCrewRole,
}: Props) {
  const getError = (field: string) =>
    errors.find((error) => error.field === field)?.message;

  return (
    <div className="form-card">
      {category === "planner" && (
        <>
          <h2 className="card-title">Event Planner details</h2>
          <div className="form-grid">
            <SelectField
              id="planningSupport"
              label="Type of planning support"
              value={details.planner.planningSupport}
              options={[
                { value: "full", label: "Full event planning" },
                { value: "partial", label: "Partial planning" },
                { value: "day-of", label: "Day-of coordination" },
                { value: "consultation", label: "Consultation" },
              ]}
              onChange={(value) => onUpdate("planningSupport", value)}
              error={getError("planningSupport")}
            />

            <SelectField
              id="planningScope"
              label="Planning scope"
              value={details.planner.planningScope}
              options={[
                { value: "full", label: "Full planning" },
                { value: "partial", label: "Partial planning" },
                { value: "coordination-only", label: "Coordination only" },
              ]}
              onChange={(value) => onUpdate("planningScope", value)}
              error={getError("planningScope")}
            />

            <Field
              id="guestCount"
              label="Expected guest count"
              type="number"
              min="1"
              value={details.planner.guestCount}
              onChange={(value) => onUpdate("guestCount", value)}
              placeholder="e.g. 300"
              required
              error={getError("guestCount")}
            />

            <Field
              id="plannerBudget"
              label="Estimated event budget (INR)"
              type="number"
              min="0"
              step="1000"
              value={details.planner.estimatedBudget}
              onChange={(value) => onUpdate("estimatedBudget", value)}
              placeholder="e.g. 500000"
              required
              error={getError("estimatedBudget")}
            />

            <Field
              id="eventStyle"
              label="Preferred event style or theme"
              value={details.planner.eventStyle}
              onChange={(value) => onUpdate("eventStyle", value)}
              placeholder="Modern, traditional, rustic..."
            />

            <Field
              id="eventDays"
              label="Number of event days"
              type="number"
              min="1"
              value={details.planner.eventDays}
              onChange={(value) => onUpdate("eventDays", value)}
              required
              error={getError("eventDays")}
            />

            <TextAreaField
              id="planningNotes"
              label="Additional planning information (optional)"
              value={details.planner.planningNotes}
              onChange={(value) => onUpdate("planningNotes", value)}
              placeholder="Any specific planning requirements?"
            />
          </div>
        </>
      )}

      {category === "performer" && (
        <>
          <h2 className="card-title">Performer details</h2>
          <div className="form-grid">
            <SelectField
              id="performanceType"
              label="Type of performance"
              value={details.performer.performanceType}
              options={[
                { value: "singer", label: "Singer / Vocalist" },
                { value: "band", label: "Live band" },
                { value: "dj", label: "DJ" },
                { value: "musician", label: "Instrumentalist" },
                { value: "dancer", label: "Dancer / Dance group" },
                { value: "mc", label: "Host / MC" },
                { value: "other", label: "Other" },
              ]}
              onChange={(value) => onUpdate("performanceType", value)}
              error={getError("performanceType")}
            />

            <SelectField
              id="performanceDuration"
              label="Performance duration"
              value={details.performer.performanceDuration}
              options={[
                { value: "15 minutes", label: "15 minutes" },
                { value: "30 minutes", label: "30 minutes" },
                { value: "60 minutes", label: "1 hour" },
                { value: "2 hours", label: "2 hours" },
                { value: "multiple sets", label: "Multiple sets" },
                { value: "full event", label: "Full event" },
              ]}
              onChange={(value) => onUpdate("performanceDuration", value)}
              error={getError("performanceDuration")}
            />

            <Field
              id="performerCount"
              label="Number of performers"
              type="number"
              min="1"
              value={details.performer.performerCount}
              onChange={(value) => onUpdate("performerCount", value)}
              required
              error={getError("performerCount")}
            />

            <Field
              id="expectedAudience"
              label="Expected audience"
              type="number"
              min="0"
              value={details.performer.expectedAudience}
              onChange={(value) => onUpdate("expectedAudience", value)}
              placeholder="Optional"
              error={getError("expectedAudience")}
            />

            <Field
              id="performerBudget"
              label="Estimated budget (INR)"
              type="number"
              min="0"
              step="1000"
              value={details.performer.estimatedBudget}
              onChange={(value) => onUpdate("estimatedBudget", value)}
              placeholder="e.g. 25000"
              required
              error={getError("estimatedBudget")}
            />

            <TextAreaField
              id="equipmentNeeds"
              label="Equipment and technical needs"
              value={details.performer.equipmentNeeds}
              onChange={(value) => onUpdate("equipmentNeeds", value)}
              placeholder="Microphones, instruments, monitors, sound system..."
            />

            <TextAreaField
              id="performanceNotes"
              label="Additional performance notes"
              value={details.performer.performanceNotes}
              onChange={(value) => onUpdate("performanceNotes", value)}
              placeholder="Any specific requirements?"
            />
          </div>
        </>
      )}

      {category === "crew" && (
        <>
          <h2 className="card-title">Crew requirements</h2>
          <div className="form-grid">
            <div className="form-field full-width">
              <span className="field-label">
                Roles required <span className="required-mark">*</span>
              </span>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 10,
                }}
              >
                {crewRoles.map((role) => (
                  <label
                    key={role}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "10px",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      background: details.crew.roles.includes(role)
                        ? "#fff8f4"
                        : "#fff",
                      fontSize: 12,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={details.crew.roles.includes(role)}
                      onChange={(event) =>
                        onToggleCrewRole(role, event.target.checked)
                      }
                    />
                    {role}
                  </label>
                ))}
              </div>
              {getError("roles") && (
                <span className="field-error">{getError("roles")}</span>
              )}
            </div>

            <Field
              id="crewCount"
              label="Number of crew members"
              type="number"
              min="1"
              value={details.crew.crewCount}
              onChange={(value) => onUpdate("crewCount", value)}
              required
              error={getError("crewCount")}
            />

            <Field
              id="shiftDuration"
              label="Shift duration"
              value={details.crew.shiftDuration}
              onChange={(value) => onUpdate("shiftDuration", value)}
              placeholder="e.g. 8 hours"
              required
              error={getError("shiftDuration")}
            />

            <SelectField
              id="experienceLevel"
              label="Experience level"
              value={details.crew.experienceLevel}
              options={[
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "experienced", label: "Experienced" },
              ]}
              onChange={(value) => onUpdate("experienceLevel", value)}
              error={getError("experienceLevel")}
            />

            <Field
              id="crewBudget"
              label="Estimated budget (INR)"
              type="number"
              min="0"
              step="1000"
              value={details.crew.estimatedBudget}
              onChange={(value) => onUpdate("estimatedBudget", value)}
              placeholder="e.g. 15000"
              required
              error={getError("estimatedBudget")}
            />

            <SelectField
              id="equipmentProvided"
              label="Will equipment be provided?"
              value={details.crew.equipmentProvided}
              options={[
                { value: "yes", label: "Yes, provided" },
                { value: "no", label: "No, bring your own" },
                { value: "partially", label: "Partially provided" },
              ]}
              onChange={(value) => onUpdate("equipmentProvided", value)}
            />

            <TextAreaField
              id="crewNotes"
              label="Additional crew notes"
              value={details.crew.crewNotes}
              onChange={(value) => onUpdate("crewNotes", value)}
              placeholder="Any other crew requirements?"
            />
          </div>
        </>
      )}
    </div>
  );
}
