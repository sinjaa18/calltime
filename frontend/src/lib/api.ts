import type {
  ApiErrorResponse,
  Category,
  CreateRequirementResponse,
  RequirementFormData,
} from "./types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export class ApiRequestError extends Error {
  status: number;
  errors: ApiErrorResponse["errors"];

  constructor(
    message: string,
    status: number,
    errors?: ApiErrorResponse["errors"],
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}

export interface SavedRequirement {
  id: string;
  requirementCode: string;
  status: string;
  category: Category;
  eventBasics: RequirementFormData["eventBasics"];
  categoryDetails: Record<string, unknown>;
  additionalRequirements: Record<string, unknown>;
  createdAt: string;
}

function buildPayload(data: RequirementFormData): Record<string, unknown> {
  const eventBasics = data.eventBasics;

  switch (data.category) {
    case "planner": {
      const details = data.categoryDetails.planner;

      return {
        eventBasics,
        category: "planner" satisfies Category,
        categoryDetails: {
          ...details,
          guestCount: Number(details.guestCount),
          estimatedBudget: Number(details.estimatedBudget),
          eventDays: Number(details.eventDays),
        },
        additionalRequirements: data.additionalRequirements.planner,
      };
    }

    case "performer": {
      const details = data.categoryDetails.performer;

      return {
        eventBasics,
        category: "performer" satisfies Category,
        categoryDetails: {
          ...details,
          performerCount: Number(details.performerCount),
          expectedAudience: details.expectedAudience.trim()
            ? Number(details.expectedAudience)
            : null,
          estimatedBudget: Number(details.estimatedBudget),
        },
        additionalRequirements: data.additionalRequirements.performer,
      };
    }

    case "crew": {
      const details = data.categoryDetails.crew;

      return {
        eventBasics,
        category: "crew" satisfies Category,
        categoryDetails: {
          ...details,
          crewCount: Number(details.crewCount),
          estimatedBudget: Number(details.estimatedBudget),
        },
        additionalRequirements: data.additionalRequirements.crew,
      };
    }
  }
}

export async function submitRequirement(
  data: RequirementFormData,
): Promise<CreateRequirementResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/requirements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(data)),
    });
  } catch {
    throw new ApiRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
    );
  }

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new ApiRequestError(
      "The server returned an invalid response.",
      response.status,
    );
  }

  if (!result || typeof result !== "object") {
    throw new ApiRequestError(
      "The server returned an unexpected response.",
      response.status,
    );
  }

  const body = result as Partial<ApiErrorResponse> &
    Partial<CreateRequirementResponse>;

  if (!response.ok || body.success !== true || !body.data) {
    throw new ApiRequestError(
      body.message || "Unable to submit the requirement.",
      response.status,
      body.errors,
    );
  }

  return body as CreateRequirementResponse;
}

export async function getRequirements(
  ids: string[],
): Promise<SavedRequirement[]> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];

  if (uniqueIds.length === 0) return [];

  let response: Response;

  try {
    const query = encodeURIComponent(uniqueIds.join(","));

    response = await fetch(`${API_BASE_URL}/api/requirements?ids=${query}`, {
      method: "GET",
      cache: "no-store",
    });
  } catch {
    throw new ApiRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
    );
  }

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new ApiRequestError(
      "The server returned an invalid response.",
      response.status,
    );
  }

  if (!result || typeof result !== "object") {
    throw new ApiRequestError(
      "The server returned an unexpected response.",
      response.status,
    );
  }

  const body = result as {
    success?: boolean;
    message?: string;
    data?: SavedRequirement[];
  };

  if (!response.ok || body.success !== true || !Array.isArray(body.data)) {
    throw new ApiRequestError(
      body.message || "Unable to load your requirements.",
      response.status,
    );
  }

  return body.data;
}
