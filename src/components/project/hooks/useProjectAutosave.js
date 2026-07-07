import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { _updateProject } from "@/network/post-request";

export function useProjectAutosave({ projectId, projectState, mode, onSaveSuccess }) {
  const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "unsaved" | "saving" | "error"
  const timerRef = useRef(null);
  const isFirstRun = useRef(true);
  const latestStateRef = useRef(projectState);

  // Keep a ref to the latest state so retry() always sends the current data.
  useEffect(() => {
    latestStateRef.current = projectState;
  }, [projectState]);

  // Reset when the project being edited changes.
  useEffect(() => {
    isFirstRun.current = true;
    startTransition(() => setSaveStatus("saved"));
  }, [projectId]);

  const onSaveSuccessRef = useRef(onSaveSuccess);
  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
  }, [onSaveSuccess]);

  const doSave = useCallback(async () => {
    if (!projectId || !latestStateRef.current) return;
    setSaveStatus("saving");
    try {
      const payload = { ...latestStateRef.current };
      // Placeholder thumbnails from the backend only carry a `url` (no `key`).
      // Sending them causes a 400 "Key is required" from the API, so we strip
      // the thumbnail until the user uploads their own image.
      if (payload.thumbnail && !payload.thumbnail.key) {
        delete payload.thumbnail;
      }
      await _updateProject(projectId, payload);
      setSaveStatus("saved");
      onSaveSuccessRef.current?.(latestStateRef.current);
    } catch {
      setSaveStatus("error");
    }
  }, [projectId]);

  useEffect(() => {
    if (mode !== "editor") return;
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setSaveStatus("unsaved");

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doSave, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [projectState, projectId, mode, doSave]);

  return { saveStatus, retry: doSave };
}
