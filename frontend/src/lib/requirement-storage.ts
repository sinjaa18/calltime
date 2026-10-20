const STORAGE_KEY = "calltime:requirement-ids";

export function getStoredRequirementIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const value: unknown = JSON.parse(raw);

    if (!Array.isArray(value) || !value.every((id) => typeof id === "string")) {
      return [];
    }

    return [...new Set(value.filter(Boolean))].slice(0, 50);
  } catch {
    return [];
  }
}

export function rememberRequirementId(id: string): void {
  if (!id) return;

  const ids = getStoredRequirementIds();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      [id, ...ids.filter((existing) => existing !== id)].slice(0, 50),
    ),
  );
}

export function clearStoredRequirementIds(): void {
  localStorage.removeItem(STORAGE_KEY);
}
