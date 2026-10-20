"use client";

import { useEffect, useState } from "react";
import { getRequirements, type SavedRequirement } from "../../lib/api";
import { getStoredRequirementIds } from "../../lib/requirement-storage";

interface Props {
  onCreateNew: () => void;
}

const categoryLabels = {
  planner: "Event Planner",
  performer: "Performer",
  crew: "Crew",
} as const;

function formatDate(value: string): string {
  if (!value) return "Not specified";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function readableLabel(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function readableValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  if (Array.isArray(value)) {
    return value.length ? value.map(String).join(", ") : "Not provided";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  const labels: Record<string, string> = {
    "day-of": "Day-of coordination",
    "coordination-only": "Coordination only",
    "not-required": "Not required",
    unsure: "Not sure yet",
    full: "Full planning",
    partial: "Partial planning",
    required: "Required",
    beginner: "Beginner",
    intermediate: "Intermediate",
    experienced: "Experienced",
    yes: "Yes",
    no: "No",
    partially: "Partially",
  };

  const text = String(value);
  return labels[text] ?? text;
}


function DetailGroup({ title, values }: { title: string; values: object }) {
  const entries = Object.entries(values);

  if (!entries.length) return null;

  return (
    <section className="requirement-detail-group">
      <h4>{title}</h4>

      <div className="requirement-detail-grid">
        {entries.map(([key, value]) => (
          <div className="requirement-detail-row" key={key}>
            <span className="review-label">{readableLabel(key)}</span>
            <span className="review-value">{readableValue(value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function RequirementsList({ onCreateNew }: Props) {
  const [requirements, setRequirements] = useState<SavedRequirement[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadRequirements() {
      setStatus("loading");
      setError("");

      try {
        const ids = getStoredRequirementIds();
        const results = await getRequirements(ids);

        if (cancelled) return;

        setRequirements(results);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your requirements.",
        );
        setStatus("error");
      }
    }

    void loadRequirements();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <section className="requirements-page">
      <div className="requirements-heading">
        <div>
          <p className="eyebrow">Your workspace</p>
          <h1 className="page-title">My requirements</h1>
          <p className="page-description">
            Keep track of your submitted event requirements and their details.
          </p>
        </div>

        <button
          className="button button-primary"
          type="button"
          onClick={onCreateNew}
        >
          + New requirement
        </button>
      </div>

      {status === "loading" && (
        <div className="form-card requirements-message" role="status">
          <p className="page-description">Loading your requirements...</p>
        </div>
      )}

      {status === "error" && (
        <div className="notice notice-error" role="alert">
          <p>{error}</p>

          <button
            className="button button-secondary"
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {status === "ready" && requirements.length === 0 && (
        <div className="empty-state">
          <div className="success-icon" aria-hidden="true">
            <span style={{ fontSize: 30 }}>＋</span>
          </div>

          <h2 className="card-title">No requirements yet</h2>

          <p>Once you submit an event requirement, it will appear here.</p>

          <button
            className="button button-primary"
            type="button"
            onClick={onCreateNew}
          >
            Create your first requirement
          </button>
        </div>
      )}

      {status === "ready" && requirements.length > 0 && (
        <>
          <div className="requirements-count">
            {requirements.length} saved{" "}
            {requirements.length === 1 ? "requirement" : "requirements"}
          </div>

          <div className="requirements-list">
            {requirements.map((requirement) => {
              const expanded = expandedId === requirement.id;

              return (
                <article className="requirement-card" key={requirement.id}>
                  <div className="requirement-card-main">
                    <div className="requirement-card-content">
                      <div className="requirement-card-meta">
                        <span className="requirement-category">
                          {categoryLabels[requirement.category]}
                        </span>

                        <span className="requirement-status">
                          {readableLabel(requirement.status)}
                        </span>
                      </div>

                      <h2 className="requirement-card-title">
                        {requirement.eventBasics.eventName}
                      </h2>

                      <p className="requirement-card-description">
                        {requirement.eventBasics.eventType}
                        {" · "}
                        {requirement.eventBasics.location}
                      </p>

                      <div className="requirement-card-meta">
                        <span>
                          Event date:{" "}
                          {formatDate(requirement.eventBasics.startDate)}
                        </span>
                        <span>
                          Submitted: {formatDateTime(requirement.createdAt)}
                        </span>
                      </div>

                      <p className="requirement-code-small">
                        Reference: {requirement.requirementCode}
                      </p>
                    </div>

                    <button
                      className="button button-secondary"
                      type="button"
                      aria-expanded={expanded}
                      onClick={() =>
                        setExpandedId(expanded ? null : requirement.id)
                      }
                    >
                      {expanded ? "Hide details" : "View details"}
                    </button>
                  </div>

                  {expanded && (
                    <div className="requirement-expanded">
                      <DetailGroup
                        title="Event basics"
                        values={requirement.eventBasics}
                      />

                      <DetailGroup
                        title={`${categoryLabels[requirement.category]} details`}
                        values={requirement.categoryDetails}
                      />

                      <DetailGroup
                        title="Additional requirements"
                        values={requirement.additionalRequirements}
                      />

                      <p className="field-hint">Record ID: {requirement.id}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <button
            className="button button-secondary requirements-refresh"
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Refresh requirements
          </button>
        </>
      )}
    </section>
  );
}
