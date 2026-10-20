"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CATEGORIES,
  EVENT_TYPES,
  type Category,
  type EventType,
  type RequirementFormData,
  type PlannerDetails,
  type PerformerDetails,
  type CrewDetails,
  type PlannerRequirements,
  type PerformerRequirements,
  type CrewRequirements,
  type CreateRequirementResponse,
} from "../lib/types";
import { getInitialFormData } from "../lib/initial-data";
import {
  validateStep,
  type FieldError,
  type WizardStep,
} from "../lib/validation";
import CategoryDetailsStep from "../components/wizard/CategoryDetailsStep";
import AdditionalRequirementsStep from "../components/wizard/AdditionalRequirementsStep";
import ReviewRequirementStep from "../components/wizard/ReviewRequirementStep";
import { submitRequirement, ApiRequestError } from "../lib/api";
import { rememberRequirementId } from "@/lib/requirement-storage";

const steps = ["Event Basics", "Details", "Additional", "Review"];

const categoryInfo: Record<
  Category,
  { icon: string; description: string; title: string }
> = {
  planner: {
    icon: "▦",
    title: "Event Planner",
    description: "Help bring the entire event together.",
  },
  performer: {
    icon: "♫",
    title: "Performer",
    description: "Find the right talent for the occasion.",
  },
  crew: {
    icon: "♧",
    title: "Crew",
    description: "Build the team behind the event.",
  },
};

export default function Home() {
  const router = useRouter();

  const [data, setData] = useState<RequirementFormData>(() =>
    getInitialFormData(),
  );
  const [activeStep, setActiveStep] = useState<WizardStep>(1);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState<
    CreateRequirementResponse["data"] | null
  >(null);

  const basics = data.eventBasics;
  const selectedCategory = categoryInfo[data.category];

  function updateBasics<K extends keyof RequirementFormData["eventBasics"]>(
    field: K,
    value: RequirementFormData["eventBasics"][K],
  ) {
    setData((current) => ({
      ...current,
      eventBasics: {
        ...current.eventBasics,
        [field]: value,
      },
    }));

    setErrors((current) => current.filter((error) => error.field !== field));
    setNotice("");
  }

  function selectCategory(category: Category) {
    setData((current) => ({ ...current, category }));
    setErrors([]);
    setNotice("");
  }

  function updateCategoryDetail(field: string, value: string) {
    setData((current) => {
      if (current.category === "planner") {
        return {
          ...current,
          categoryDetails: {
            ...current.categoryDetails,
            planner: {
              ...current.categoryDetails.planner,
              [field]: value,
            } as PlannerDetails,
          },
        };
      }

      if (current.category === "performer") {
        return {
          ...current,
          categoryDetails: {
            ...current.categoryDetails,
            performer: {
              ...current.categoryDetails.performer,
              [field]: value,
            } as PerformerDetails,
          },
        };
      }

      return {
        ...current,
        categoryDetails: {
          ...current.categoryDetails,
          crew: {
            ...current.categoryDetails.crew,
            [field]: value,
          } as CrewDetails,
        },
      };
    });

    setErrors((current) => current.filter((error) => error.field !== field));
    setNotice("");
  }

  function toggleCrewRole(role: string, checked: boolean) {
    setData((current) => {
      const roles = current.categoryDetails.crew.roles;

      return {
        ...current,
        categoryDetails: {
          ...current.categoryDetails,
          crew: {
            ...current.categoryDetails.crew,
            roles: checked
              ? [...new Set([...roles, role])]
              : roles.filter((item) => item !== role),
          },
        },
      };
    });

    setErrors((current) => current.filter((error) => error.field !== "roles"));
    setNotice("");
  }

  function updateAdditionalRequirement(field: string, value: string) {
    setData((current) => {
      if (current.category === "planner") {
        return {
          ...current,
          additionalRequirements: {
            ...current.additionalRequirements,
            planner: {
              ...current.additionalRequirements.planner,
              [field]: value,
            } as PlannerRequirements,
          },
        };
      }

      if (current.category === "performer") {
        return {
          ...current,
          additionalRequirements: {
            ...current.additionalRequirements,
            performer: {
              ...current.additionalRequirements.performer,
              [field]: value,
            } as PerformerRequirements,
          },
        };
      }

      return {
        ...current,
        additionalRequirements: {
          ...current.additionalRequirements,
          crew: {
            ...current.additionalRequirements.crew,
            [field]: value,
          } as CrewRequirements,
        },
      };
    });

    setErrors((current) => current.filter((error) => error.field !== field));
    setNotice("");
  }

  function getError(field: string) {
    return errors.find((error) => error.field === field)?.message;
  }

  function continueStep() {
    const currentErrors = validateStep(data, activeStep);
    setErrors(currentErrors);

    if (currentErrors.length > 0) {
      setNotice("Please correct the highlighted fields before continuing.");
      return;
    }

    setNotice("");

    if (activeStep < 4) {
      setActiveStep((activeStep + 1) as WizardStep);
    }
  }

  function previousStep() {
    setErrors([]);
    setNotice("");

    if (activeStep > 1) {
      setActiveStep((activeStep - 1) as WizardStep);
    }
  }

  function resetForm() {
    setData(getInitialFormData());
    setActiveStep(1);
    setErrors([]);
    setNotice("");
    setSubmission(null);
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    const finalErrors = validateStep(data, 4);
    setErrors(finalErrors);

    if (finalErrors.length > 0) {
      setNotice("Please correct the highlighted fields before submitting.");

      const firstField = finalErrors[0].field;
      const basicFields = [
        "eventName",
        "eventType",
        "startDate",
        "endDate",
        "location",
      ];

      setActiveStep(basicFields.includes(firstField) ? 1 : 2);
      return;
    }

    setIsSubmitting(true);
    setNotice("");

    try {
      const result = await submitRequirement(data);

      // The database save succeeded even if local browser storage fails.
      try {
        rememberRequirementId(result.data.id);
      } catch {
        // The confirmation screen can still be shown.
      }

      setSubmission(result.data);
      setErrors([]);
      setNotice("");
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setNotice(error.message);

        if (error.errors?.length) {
          const apiErrors = error.errors.map((item) => ({
            field: item.field.split(".").pop() || item.field,
            message: item.message,
          }));

          setErrors(apiErrors);

          const firstField = error.errors[0].field;

          if (firstField.startsWith("eventBasics.")) {
            setActiveStep(1);
          } else if (firstField.startsWith("categoryDetails.")) {
            setActiveStep(2);
          } else if (firstField.startsWith("additionalRequirements.")) {
            setActiveStep(3);
          }
        }
      } else {
        setNotice("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyRequirementCode() {
    if (!submission) return;

    try {
      await navigator.clipboard.writeText(submission.requirementCode);
      setNotice("Requirement code copied.");
    } catch {
      setNotice("Unable to copy the code. Please copy it manually.");
    }
  }

  if (submission) {
    return (
      <main className="app-shell">
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Calltime home">
            calltime
          </Link>

          <span className="header-section">Submission confirmation</span>

          <span className="draft-status">
            <span className="status-dot" />
            Submitted
          </span>
        </header>

        <section className="success-screen" aria-live="polite">
          <div className="success-icon" aria-hidden="true">
            <span style={{ fontSize: 34 }}>✓</span>
          </div>

          <p className="eyebrow">Requirement confirmed</p>
          <h1 className="success-title">Requirement submitted!</h1>

          <p className="success-description">
            Your requirement has been saved successfully. Keep your reference
            code for future use.
          </p>

          <div className="requirement-code">
            <div>
              <p className="field-hint">Your requirement code</p>
              <strong>{submission.requirementCode}</strong>
            </div>

            <button
              className="button button-secondary"
              type="button"
              onClick={() => void copyRequirementCode()}
            >
              Copy code
            </button>
          </div>

          <p className="field-hint">
            Category: {categoryInfo[submission.category].title}
          </p>

          <p className="field-hint">Record ID: {submission.id}</p>

          {notice && (
            <p className="field-hint" role="status">
              {notice}
            </p>
          )}

          <div className="success-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={resetForm}
            >
              Create another requirement
            </button>

            <button
              className="button button-primary"
              type="button"
              onClick={() => router.push("/requirements")}
            >
              View my requirements
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Calltime home">
          calltime
        </Link>

        <span className="header-section">Event Requirements</span>

        <nav className="header-nav" aria-label="Main navigation">
          <button
            className="header-link"
            type="button"
            onClick={() => router.push("/requirements")}
          >
            My requirements
          </button>

          <span className="draft-status">
            <span className="status-dot" />
            Draft in progress
          </span>
        </nav>
      </header>

      <nav className="progress" aria-label="Requirement progress">
        {steps.map((step, index) => {
          const number = index + 1;
          const complete = number < activeStep;
          const active = number === activeStep;

          return (
            <div
              className={`progress-step${complete ? " is-complete" : ""}${active ? " is-active" : ""}`}
              key={step}
              aria-current={active ? "step" : undefined}
            >
              <span className="progress-number">{complete ? "✓" : number}</span>
              <span className="progress-label">{step}</span>
            </div>
          );
        })}
      </nav>

      {notice && (
        <div
          className={`notice${errors.length ? " notice-error" : ""}`}
          role="status"
        >
          {notice}
        </div>
      )}

      {/* STEP 1: EVENT BASICS */}
      {activeStep === 1 && (
        <div className="wizard-layout">
          <section className="wizard-main">
            <div className="wizard-heading">
              <p className="eyebrow">New requirement</p>
              <h1 className="page-title">
                Tell us what you’re putting together.
              </h1>
              <p className="page-description">
                Help us understand your event so we can connect you with the
                right professionals.
              </p>
            </div>

            <div className="form-card">
              <h2 className="card-title">Event information</h2>

              <div className="form-grid">
                <div className="form-field full-width">
                  <label className="field-label" htmlFor="eventName">
                    Event name <span className="required-mark">*</span>
                  </label>
                  <input
                    className="field-control"
                    id="eventName"
                    value={basics.eventName}
                    onChange={(event) =>
                      updateBasics("eventName", event.target.value)
                    }
                    placeholder="e.g. Indie Music Night"
                    aria-invalid={!!getError("eventName")}
                  />
                  {getError("eventName") && (
                    <span className="field-error">{getError("eventName")}</span>
                  )}
                </div>

                <div className="form-field full-width">
                  <label className="field-label" htmlFor="eventType">
                    Event type <span className="required-mark">*</span>
                  </label>
                  <select
                    className="field-control"
                    id="eventType"
                    value={basics.eventType}
                    onChange={(event) =>
                      updateBasics(
                        "eventType",
                        event.target.value as EventType | "",
                      )
                    }
                    aria-invalid={!!getError("eventType")}
                  >
                    <option value="">Select event type</option>
                    {EVENT_TYPES.map((type) => (
                      <option value={type} key={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {getError("eventType") && (
                    <span className="field-error">{getError("eventType")}</span>
                  )}
                </div>

                <div className="form-field">
                  <label className="field-label" htmlFor="startDate">
                    Start date <span className="required-mark">*</span>
                  </label>
                  <input
                    className="field-control"
                    id="startDate"
                    type="date"
                    value={basics.startDate}
                    onChange={(event) =>
                      updateBasics("startDate", event.target.value)
                    }
                    aria-invalid={!!getError("startDate")}
                  />
                  {getError("startDate") && (
                    <span className="field-error">{getError("startDate")}</span>
                  )}
                </div>

                <div className="form-field">
                  <label className="field-label" htmlFor="endDate">
                    End date (optional)
                  </label>
                  <input
                    className="field-control"
                    id="endDate"
                    type="date"
                    min={basics.startDate || undefined}
                    value={basics.endDate}
                    onChange={(event) =>
                      updateBasics("endDate", event.target.value)
                    }
                    aria-invalid={!!getError("endDate")}
                  />
                  {getError("endDate") && (
                    <span className="field-error">{getError("endDate")}</span>
                  )}
                </div>

                <div className="form-field full-width">
                  <label className="field-label" htmlFor="location">
                    Location <span className="required-mark">*</span>
                  </label>
                  <input
                    className="field-control"
                    id="location"
                    value={basics.location}
                    onChange={(event) =>
                      updateBasics("location", event.target.value)
                    }
                    placeholder="City or event location"
                    aria-invalid={!!getError("location")}
                  />
                  {getError("location") && (
                    <span className="field-error">{getError("location")}</span>
                  )}
                </div>

                <div className="form-field full-width">
                  <label className="field-label" htmlFor="venue">
                    Venue name (optional)
                  </label>
                  <input
                    className="field-control"
                    id="venue"
                    value={basics.venue}
                    onChange={(event) =>
                      updateBasics("venue", event.target.value)
                    }
                    placeholder="e.g. Sarusajai Stadium"
                  />
                </div>

                <div className="form-field full-width">
                  <span className="field-label">
                    What do you need? <span className="required-mark">*</span>
                  </span>

                  <div
                    className="category-grid"
                    role="group"
                    aria-label="Requirement category"
                  >
                    {CATEGORIES.map((category) => {
                      const info = categoryInfo[category.value];
                      const selected = data.category === category.value;

                      return (
                        <button
                          key={category.value}
                          type="button"
                          className={`category-card${selected ? " is-selected" : ""}`}
                          aria-pressed={selected}
                          onClick={() => selectCategory(category.value)}
                        >
                          <span className="category-icon" aria-hidden="true">
                            <span style={{ fontSize: 22 }}>{info.icon}</span>
                          </span>
                          <span className="category-name">{info.title}</span>
                          <span className="category-description">
                            {info.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="wizard-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                className="button button-primary"
                type="button"
                onClick={continueStep}
              >
                Continue →
              </button>
            </div>
          </section>

          <aside className="wizard-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-content">
                <h3 className="sidebar-title">Your event at a glance</h3>
                <p className="sidebar-text">
                  <strong>{basics.eventName || "Your event name"}</strong>
                </p>
                <p className="sidebar-text">
                  {basics.eventType || "Event type not selected"}
                </p>
                <p className="sidebar-text">
                  {basics.startDate || "Date not selected"}
                  {basics.endDate && basics.endDate !== basics.startDate
                    ? ` – ${basics.endDate}`
                    : ""}
                </p>
                <p className="sidebar-text">
                  {basics.location || "Location not entered"}
                </p>
                {basics.venue && <p className="sidebar-text">{basics.venue}</p>}
              </div>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-content">
                <h3 className="sidebar-title">♢ &nbsp; A little tip</h3>
                <p className="sidebar-text">
                  Be as specific as possible so professionals can understand
                  your needs clearly.
                </p>
              </div>
              <div
                aria-hidden="true"
                style={{
                  display: "grid",
                  minHeight: 135,
                  placeItems: "center",
                  background: "linear-gradient(150deg, #e9ddca, #cbd3bd)",
                  fontSize: 66,
                  color: "#596b4e",
                }}
              >
                ♧
              </div>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-content">
                <h3 className="sidebar-title">Selected category</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className="category-icon" aria-hidden="true">
                    <span style={{ fontSize: 22 }}>
                      {selectedCategory.icon}
                    </span>
                  </span>
                  <strong style={{ fontSize: 12 }}>
                    {selectedCategory.title}
                  </strong>
                </div>
                <p className="sidebar-text" style={{ marginTop: 10 }}>
                  {selectedCategory.description}
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* STEP 2: CATEGORY DETAILS */}
      {activeStep === 2 && (
        <section className="wizard-main">
          <div className="wizard-heading">
            <p className="eyebrow">Step 2</p>
            <h1 className="page-title">{selectedCategory.title} details</h1>
            <p className="page-description">
              These fields adapt to your selected category.
            </p>
          </div>

          <CategoryDetailsStep
            category={data.category}
            details={data.categoryDetails}
            errors={errors}
            onUpdate={updateCategoryDetail}
            onToggleCrewRole={toggleCrewRole}
          />

          <div className="wizard-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={previousStep}
            >
              ← Previous
            </button>
            <button
              className="button button-primary"
              type="button"
              onClick={continueStep}
            >
              Continue →
            </button>
          </div>
        </section>
      )}

      {/* STEP 3: ADDITIONAL REQUIREMENTS */}
      {activeStep === 3 && (
        <section>
          <div className="wizard-heading">
            <p className="eyebrow">Step 3</p>
            <h1 className="page-title">Additional requirements</h1>
            <p className="page-description">
              Share more details about your{" "}
              {selectedCategory.title.toLowerCase()} needs.
            </p>
          </div>

          <AdditionalRequirementsStep
            category={data.category}
            data={data.additionalRequirements}
            errors={errors}
            onUpdate={updateAdditionalRequirement}
          />

          <div className="wizard-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={previousStep}
            >
              ← Previous
            </button>
            <button
              className="button button-primary"
              type="button"
              onClick={continueStep}
            >
              Continue →
            </button>
          </div>
        </section>
      )}

      {/* STEP 4: REVIEW AND SUBMISSION */}
      {activeStep === 4 && (
        <section className="wizard-main">
          <div className="wizard-heading">
            <p className="eyebrow">Step 4 · Final check</p>
            <h1 className="page-title">Review your requirement</h1>
            <p className="page-description">
              Review your event details and make any changes before submitting.
            </p>
          </div>

          <ReviewRequirementStep
            data={data}
            onEdit={(step) => {
              setErrors([]);
              setNotice("");
              setActiveStep(step);
            }}
          />

          <div className="wizard-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={previousStep}
              disabled={isSubmitting}
            >
              ← Previous
            </button>

            <button
              className="button button-primary"
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit requirement →"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
