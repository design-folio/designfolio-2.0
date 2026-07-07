import { useState, useEffect, useRef, useCallback } from "react";
import { Copy, Check, Code2, PlayCircle, Frame } from "lucide-react";
import dynamic from "next/dynamic";

// Load SyntaxHighlighter client-only (uses browser APIs)
const SyntaxHighlighter = dynamic(() => import("react-syntax-highlighter").then((m) => m.Prism), {
  ssr: false,
  loading: () => null,
});
// Theme — oneDark feels right for a dark code block
const codeTheme = {
  'code[class*="language-"]': {
    color: "#abb2bf",
    background: "none",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "0.875rem",
    lineHeight: "1.7",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
  },
  'pre[class*="language-"]': {
    color: "#abb2bf",
    background: "#0D0D0D",
    padding: "1.25rem 1.5rem",
    overflow: "auto",
    borderRadius: "0",
  },
  comment: { color: "#5c6370", fontStyle: "italic" },
  prolog: { color: "#5c6370" },
  doctype: { color: "#5c6370" },
  cdata: { color: "#5c6370" },
  punctuation: { color: "#abb2bf" },
  ".namespace": { opacity: "0.7" },
  property: { color: "#e06c75" },
  tag: { color: "#e06c75" },
  boolean: { color: "#d19a66" },
  number: { color: "#d19a66" },
  constant: { color: "#d19a66" },
  symbol: { color: "#d19a66" },
  deleted: { color: "#e06c75" },
  selector: { color: "#98c379" },
  "attr-name": { color: "#e06c75" },
  string: { color: "#98c379" },
  char: { color: "#98c379" },
  builtin: { color: "#98c379" },
  inserted: { color: "#98c379" },
  operator: { color: "#56b6c2" },
  entity: { color: "#56b6c2", cursor: "help" },
  url: { color: "#56b6c2" },
  ".language-css .token.string": { color: "#56b6c2" },
  ".style .token.string": { color: "#56b6c2" },
  variable: { color: "#e06c75" },
  atrule: { color: "#c678dd" },
  "attr-value": { color: "#98c379" },
  function: { color: "#61afef" },
  "class-name": { color: "#e5c07b" },
  keyword: { color: "#c678dd" },
  regex: { color: "#56b6c2" },
  important: { color: "#e06c75", fontWeight: "bold" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FIGMA_HOSTS = new Set(["www.figma.com", "figma.com", "embed.figma.com"]);

function extractFigmaSrc(input) {
  if (!input) return null;
  let candidate = null;
  if (input.includes("<iframe")) {
    const match = input.match(/src=["']([^"']+)["']/);
    candidate = match?.[1] ?? null;
  } else {
    candidate = input.trim();
  }
  if (!candidate) return null;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "https:") return null;
    if (!FIGMA_HOSTS.has(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url?.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMBED_TYPES = ["youtube", "figma", "code"];
const TYPE_ICONS = { youtube: PlayCircle, figma: Frame, code: Code2 };
const TYPE_LABELS = { youtube: "YouTube", figma: "Figma", code: "Code" };

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "css",
  "html",
  "json",
  "bash",
  "swift",
  "kotlin",
  "rust",
  "go",
  "sql",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function IframeSkeleton() {
  return (
    <div className="aspect-video w-full animate-pulse rounded-xl bg-black/[0.04] dark:bg-white/[0.04]" />
  );
}

function EmptyPreview({ type }) {
  const Icon = TYPE_ICONS[type];
  const hints = {
    youtube: "Paste a YouTube URL above to see the video here.",
    figma: "Paste a Figma share URL or embed code above to preview.",
    code: "Your formatted code block will appear here.",
  };
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-black/10 text-[#7A736C] dark:border-white/10 dark:text-[#9E9893]">
      <Icon size={28} className="opacity-30" />
      <p className="max-w-[260px] text-center text-sm leading-relaxed opacity-60">{hints[type]}</p>
    </div>
  );
}

function InvalidPreview({ type }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-black/8 bg-black/[0.03] text-[#7A736C] dark:border-white/8 dark:bg-white/[0.03] dark:text-[#9E9893]">
      <span className="text-sm font-medium text-red-500 dark:text-red-400">
        Invalid {TYPE_LABELS[type]} link
      </span>
      <span className="text-xs opacity-60">Check the URL and try again.</span>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-[#9E9893] transition-colors hover:text-[#F0EDE7]"
    >
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodeBlock({ code, language }) {
  if (!code) return null;
  const lang = language || "javascript";
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06]">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-[#161616] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          <span className="ml-3 font-mono text-xs text-[#5c6370]">{lang}</span>
        </div>
        <CopyButton text={code} />
      </div>
      {/* Highlighted code */}
      <SyntaxHighlighter
        language={lang}
        style={codeTheme}
        showLineNumbers
        lineNumberStyle={{
          color: "#3d4148",
          minWidth: "2.5em",
          paddingRight: "1em",
          userSelect: "none",
        }}
        customStyle={{ margin: 0, borderRadius: 0 }}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ─── Live iframe with loading skeleton ────────────────────────────────────────

function LiveIframe({ src, allow, allowFullScreen, title, sandbox, referrerPolicy }) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);
  // Reset loaded when src changes (adjust state during render — avoids setState-in-effect)
  if (prevSrc !== src) {
    setPrevSrc(src);
    setLoaded(false);
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
      {!loaded && (
        <div className="absolute inset-0">
          <IframeSkeleton />
        </div>
      )}
      <iframe
        src={src}
        className={`h-full w-full border-0 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        allow={allow}
        allowFullScreen={allowFullScreen}
        sandbox={sandbox}
        referrerPolicy={referrerPolicy}
        title={title}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EmbedSection({ section, onChange, mode }) {
  const editable = mode === "editor";
  const content = section.content || {
    embedType: "youtube",
    url: "",
    code: "",
    language: "javascript",
  };
  const { embedType, url, code, language } = content;

  // Debounced preview URL — avoids iframe remounts on every keystroke
  const [previewUrl, setPreviewUrl] = useState(url);
  const debounceRef = useRef(null);
  // Track previous embedType to reset previewUrl immediately on type change (adjust during render)
  const [prevEmbedType, setPrevEmbedType] = useState(embedType);

  if (prevEmbedType !== embedType) {
    setPrevEmbedType(embedType);
    setPreviewUrl(url);
  }

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPreviewUrl(url), 500);
    return () => clearTimeout(debounceRef.current);
  }, [url]);

  // Compute preview state for youtube/figma
  const youtubeId = embedType === "youtube" ? extractYouTubeId(previewUrl) : null;
  const figmaSrc = embedType === "figma" ? extractFigmaSrc(previewUrl) : null;

  const hasInput = embedType === "code" ? !!code?.trim() : !!previewUrl?.trim();
  const isValid = embedType === "youtube" ? !!youtubeId : embedType === "figma" ? !!figmaSrc : true;

  // ── Preview renderer (shared between editor preview panel and public render)
  function renderPreview() {
    if (embedType === "youtube") {
      if (!hasInput) return editable ? <EmptyPreview type="youtube" /> : null;
      if (!isValid) return editable ? <InvalidPreview type="youtube" /> : null;
      return (
        <LiveIframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube embed"
        />
      );
    }
    if (embedType === "figma") {
      if (!hasInput) return editable ? <EmptyPreview type="figma" /> : null;
      if (!isValid) return editable ? <InvalidPreview type="figma" /> : null;
      return (
        <LiveIframe
          src={figmaSrc}
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups"
          referrerPolicy="no-referrer"
          title="Figma embed"
        />
      );
    }
    if (embedType === "code") {
      if (!code?.trim()) return editable ? <EmptyPreview type="code" /> : null;
      return <CodeBlock code={code} language={language} />;
    }
    return null;
  }

  // ── Public / preview mode — just render the embed
  if (!editable) {
    const preview = renderPreview();
    if (!preview) return null;
    return <div className="mx-auto max-w-[880px] px-6 py-8 md:px-10">{preview}</div>;
  }

  // ── Editor mode — form + live preview
  return (
    <div className="mx-auto flex max-w-[880px] flex-col gap-6 px-6 py-8 md:px-10">
      {/* ── Type tabs ── */}
      <div className="flex items-center gap-1.5">
        {EMBED_TYPES.map((t) => {
          const Icon = TYPE_ICONS[t];
          const active = embedType === t;
          return (
            <button
              key={t}
              onClick={() => onChange({ ...content, embedType: t })}
              className={[
                "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[#1A1A1A] text-white dark:bg-[#F0EDE7] dark:text-[#1A1A1A]"
                  : "bg-black/5 text-[#7A736C] hover:bg-black/10 dark:bg-white/5 dark:text-[#9E9893] dark:hover:bg-white/10",
              ].join(" ")}
            >
              <Icon size={13} />
              {TYPE_LABELS[t]}
            </button>
          );
        })}
      </div>

      {/* ── Input fields ── */}
      <div className="flex flex-col gap-2">
        {embedType === "figma" && (
          <>
            <label className="text-sm font-medium text-[#7A736C] dark:text-[#9E9893]">
              Figma embed code or share URL
            </label>
            <textarea
              value={url}
              onChange={(e) => onChange({ ...content, url: e.target.value })}
              placeholder={`Paste <iframe> embed code or share URL…\ne.g. https://www.figma.com/embed?embed_host=share&url=…`}
              rows={3}
              className="w-full resize-none rounded-xl border border-black/10 bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-[#1A1A1A] placeholder-[#7A736C] outline-none focus:ring-1 focus:ring-black/20 dark:border-white/10 dark:text-[#F0EDE7] dark:placeholder-[#9E9893] dark:focus:ring-white/20"
            />
          </>
        )}

        {embedType === "youtube" && (
          <>
            <label className="text-sm font-medium text-[#7A736C] dark:text-[#9E9893]">
              YouTube URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => onChange({ ...content, url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=…"
              className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#7A736C] outline-none focus:ring-1 focus:ring-black/20 dark:border-white/10 dark:text-[#F0EDE7] dark:placeholder-[#9E9893] dark:focus:ring-white/20"
            />
          </>
        )}

        {embedType === "code" && (
          <>
            <div className="flex items-center gap-3">
              <label className="shrink-0 text-sm font-medium text-[#7A736C] dark:text-[#9E9893]">
                Language
              </label>
              <select
                value={language || "javascript"}
                onChange={(e) => onChange({ ...content, language: e.target.value })}
                className="cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-[#1A1A1A] outline-none focus:ring-1 focus:ring-black/20 dark:border-white/10 dark:bg-[#1A1A1A] dark:text-[#F0EDE7] dark:focus:ring-white/20"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={code}
              onChange={(e) => onChange({ ...content, code: e.target.value })}
              placeholder="Paste your code here…"
              rows={8}
              className="w-full resize-none rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 font-mono text-sm leading-relaxed text-[#1A1A1A] placeholder-[#7A736C] outline-none focus:ring-1 focus:ring-black/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-[#F0EDE7] dark:placeholder-[#9E9893] dark:focus:ring-white/20"
            />
          </>
        )}
      </div>

      {/* ── Live preview ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium tracking-wider text-[#7A736C] uppercase dark:text-[#9E9893]">
            Preview
          </span>
          <div className="h-px flex-1 bg-black/8 dark:bg-white/8" />
        </div>
        {renderPreview()}
      </div>
    </div>
  );
}
