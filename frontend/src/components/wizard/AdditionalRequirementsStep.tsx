"use client";

import type { Category, RequirementFormData } from "../../lib/types";
import type { FieldError } from "../../lib/validation";

interface Props {
  category: Category;
  data: RequirementFormData["additionalRequirements"];
  errors: FieldError[];
  onUpdate: (field: string, value: string) => void;
}

function TextAreaField({
  id,
  label,
  value,
  placeholder,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="form-field full-width">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className="field-control"
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
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
        {label}
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

export default function AdditionalRequirementsStep({
  category,
  data,
  errors,
  onUpdate,
}: Props) {
  const getError = (field: string) =>
    errors.find((error) => error.field === field)?.message;

  const setupOptions = [
    { value: "required", label: "Yes, required" },
    { value: "not-required", label: "Not required" },
    { value: "unsure", label: "Not sure yet" },
  ];

  return (
    <div className="wizard-layout">
      <section className="wizard-main">
        <div className="form-card">
          {category === "planner" && (
            <>
              <h2 className="card-title">Additional requirements</h2>

              <div className="form-grid">
                <TextAreaField
                  id="servicesExpected"
                  label="Services and responsibilities expected"
                  value={data.planner.servicesExpected}
                  placeholder="e.g. Venue booking, vendor management, guest coordination"
                  onChange={(value) => onUpdate("servicesExpected", value)}
                  error={getError("servicesExpected")}
                />

                <SelectField
                  id="plannerSetupTeardown"
                  label="Setup and teardown support"
                  value={data.planner.setupTeardown}
                  options={setupOptions}
                  onChange={(value) => onUpdate("setupTeardown", value)}
                  error={getError("setupTeardown")}
                />

                <TextAreaField
                  id="deliverables"
                  label="Required deliverables"
                  value={data.planner.deliverables}
                  placeholder="e.g. Event run sheet, vendor list, onsite coordination"
                  onChange={(value) => onUpdate("deliverables", value)}
                  error={getError("deliverables")}
                />

                <TextAreaField
                  id="coordinationNotes"
                  label="Important schedule or coordination notes"
                  value={data.planner.coordinationNotes}
                  placeholder="Any important timelines or coordination details?"
                  onChange={(value) => onUpdate("coordinationNotes", value)}
                  error={getError("coordinationNotes")}
                />

                <TextAreaField
                  id="plannerPreferences"
                  label="Additional preferences (optional)"
                  value={data.planner.preferences}
                  placeholder="e.g. Preferred vendors, sustainability, accessibility"
                  onChange={(value) => onUpdate("preferences", value)}
                  error={getError("preferences")}
                />
              </div>
            </>
          )}

          {category === "performer" && (
            <>
              <h2 className="card-title">Performance requirements</h2>

              <div className="form-grid">
                <TextAreaField
                  id="performanceRequirements"
                  label="Performance requirements"
                  value={data.performer.performanceRequirements}
                  placeholder="Describe the performance, audience expectations, or special requests."
                  onChange={(value) =>
                    onUpdate("performanceRequirements", value)
                  }
                  error={getError("performanceRequirements")}
                />

                <SelectField
                  id="soundcheck"
                  label="Soundcheck requirements"
                  value={data.performer.soundcheck}
                  options={setupOptions}
                  onChange={(value) => onUpdate("soundcheck", value)}
                  error={getError("soundcheck")}
                />

                <TextAreaField
                  id="technicalRider"
                  label="Technical rider"
                  value={data.performer.technicalRider}
                  placeholder="e.g. Audio channels, microphones, stage monitors, lighting."
                  onChange={(value) => onUpdate("technicalRider", value)}
                  error={getError("technicalRider")}
                />

                <TextAreaField
                  id="scheduleNotes"
                  label="Schedule or coordination notes"
                  value={data.performer.scheduleNotes}
                  placeholder="Arrival time, performance slots, breaks, or rehearsal details."
                  onChange={(value) => onUpdate("scheduleNotes", value)}
                  error={getError("scheduleNotes")}
                />

                <TextAreaField
                  id="performerPreferences"
                  label="Additional preferences (optional)"
                  value={data.performer.preferences}
                  placeholder="Any other preferences or expectations?"
                  onChange={(value) => onUpdate("preferences", value)}
                  error={getError("preferences")}
                />
              </div>
            </>
          )}

          {category === "crew" && (
            <>
              <h2 className="card-title">Crew responsibilities</h2>

              <div className="form-grid">
                <TextAreaField
                  id="responsibilities"
                  label="Responsibilities expected"
                  value={data.crew.responsibilities}
                  placeholder="Describe the responsibilities and tasks for the crew."
                  onChange={(value) => onUpdate("responsibilities", value)}
                  error={getError("responsibilities")}
                />

                <SelectField
                  id="crewSetupTeardown"
                  label="Setup and teardown support"
                  value={data.crew.setupTeardown}
                  options={setupOptions}
                  onChange={(value) => onUpdate("setupTeardown", value)}
                  error={getError("setupTeardown")}
                />

                <TextAreaField
                  id="requiredSkills"
                  label="Required skills or certifications"
                  value={data.crew.requiredSkills}
                  placeholder="e.g. Electrical safety, sound equipment, first aid."
                  onChange={(value) => onUpdate("requiredSkills", value)}
                  error={getError("requiredSkills")}
                />

                <TextAreaField
                  id="shiftSchedule"
                  label="Shift schedule"
                  value={data.crew.shiftSchedule}
                  placeholder="e.g. Arrival at 8 AM, event coverage until 6 PM."
                  onChange={(value) => onUpdate("shiftSchedule", value)}
                  error={getError("shiftSchedule")}
                />

                <TextAreaField
                  id="crewPreferences"
                  label="Additional preferences (optional)"
                  value={data.crew.preferences}
                  placeholder="Any other crew preferences?"
                  onChange={(value) => onUpdate("preferences", value)}
                  error={getError("preferences")}
                />
              </div>
            </>
          )}
        </div>
      </section>

      <aside className="wizard-sidebar">
        <div className="sidebar-card">
          <div className="sidebar-content">
            <h3 className="sidebar-title">♢ &nbsp; A little tip</h3>
            <p className="sidebar-text">
              Clear requirements help professionals understand the scope of
              work, prepare in advance, and avoid last-minute confusion.
            </p>
          </div>
        </div>

        <div className="sidebar-card">
          <div className="sidebar-content">
            <h3 className="sidebar-title">What happens next?</h3>
            <p className="sidebar-text">
              You'll review your event details before submitting the
              requirement.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
