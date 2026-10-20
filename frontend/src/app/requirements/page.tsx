"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import RequirementsList from "@/components/requirements/RequirementsList";

export default function RequirementsPage() {
  const router = useRouter();

  function handleCreateNew() {
    router.push("/");
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Calltime home">
          calltime
        </Link>

        <span className="header-section">My Requirements</span>

        <button className="header-link" type="button" onClick={handleCreateNew}>
          New requirement +
        </button>
      </header>

      <RequirementsList onCreateNew={handleCreateNew} />
    </main>
  );
}
