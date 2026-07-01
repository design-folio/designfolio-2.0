// Shared behavior for the project editor's ad-hoc contentEditable fields
// (EditableText, ProjectHero's EditableField, ProjectMetaGrid's EditableCell,
// and the caption editors). The Tiptap editor is separate and unaffected.

/**
 * Keeps the placeholder and caret correct as the user edits. Call from `onInput`.
 *
 * After all text is deleted, browsers don't leave a contentEditable truly
 * empty — they leave a residual `<br>` (or nested `<div><br></div>`). Two
 * things go wrong: the caret is parked *after* that `<br>` (a phantom second
 * line, i.e. "cursor at the end, not the start"), and a CSS `:empty`/`:has(br)`
 * heuristic mis-reads emptiness once a field mixes text with `<br>` line breaks
 * (the placeholder reappears while typing on a second line).
 *
 * So drive both from real text content: collapse to truly empty when there's no
 * text, and flag emptiness with `data-empty` for the placeholder CSS to key off.
 */
export function normalizeEditableEmpty(el) {
  if (!el) return;

  const isEmpty = !el.textContent;

  if (!isEmpty) {
    el.removeAttribute("data-empty");
    return;
  }

  el.setAttribute("data-empty", "true");

  // Collapse any residual <br>/<div> so the caret returns to the start (offset 0).
  if (el.innerHTML === "") return;
  el.innerHTML = "";

  if (document.activeElement !== el) return;

  const range = document.createRange();
  range.setStart(el, 0);
  range.collapse(true);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

/**
 * Pastes as plain text so pasted content doesn't carry the source's colors,
 * backgrounds, or other formatting. Call from `onPaste`.
 *
 * `text/plain` already strips rich formatting; `insertText` keeps the caret
 * position and the undo history intact.
 */
export function handlePlainTextPaste(e) {
  e.preventDefault();
  const text = e.clipboardData?.getData("text/plain") ?? "";
  document.execCommand("insertText", false, text);
}
