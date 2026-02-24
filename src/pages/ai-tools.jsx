import AiToolsWorkspace from "@/components/AiToolsWorkspace";

/**
 * AI Tools page. Logged-in users are redirected to /builder?view=ai-tools so AI tools
 * live inside the builder (no full navigation). Guests use this page as-is.
 */
export default function Index() {
  return <AiToolsWorkspace />;
}

Index.theme = "light";
