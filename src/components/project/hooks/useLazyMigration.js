import { startTransition, useEffect, useRef, useState } from "react";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// All projects in prod are contentVersion 2 (Tiptap) — no EditorJS drafts remain.
// This hook only needs to handle: tiptapContent → freeform section.
// EditorJS content (contentVersion 1) may still exist in live.projects (unpublished),
// but those are handled read-only in ProjectDetail via BlockRenderer, not here.
export function useLazyMigration({ project, mode, onMigrated }) {
  const hasMigrated = useRef(false);

  const existingSections =
    Array.isArray(project?.sections) && project.sections.length > 0 ? project.sections : null;

  const [sections, setSections] = useState(existingSections || []);

  useEffect(() => {
    if (mode !== "editor") return;
    if (hasMigrated.current) return;

    const alreadyHasSections = Array.isArray(project?.sections) && project.sections.length > 0;
    if (alreadyHasSections) {
      hasMigrated.current = true;
      startTransition(() => setSections(project.sections));
      return;
    }

    // Migrate Tiptap content (contentVersion 2) → single freeform section
    // Only migrate if the doc actually has content nodes — an empty { type: "doc", content: [] }
    // from a newly created project should show the empty state, not a blank freeform section.
    if (project?.tiptapContent && project.tiptapContent.content?.length > 0) {
      const migratedSections = [
        {
          _id: uid(),
          type: "freeform",
          content: { tiptapContent: project.tiptapContent },
        },
      ];
      hasMigrated.current = true;
      startTransition(() => setSections(migratedSections));
      onMigrated?.(migratedSections);
    }
  }, [project, mode, onMigrated]);

  return { sections, setSections };
}
