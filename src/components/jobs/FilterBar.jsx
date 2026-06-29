import { Search, SlidersHorizontal, RotateCcw, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, LayoutGroup } from "motion/react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Kbd } from "@/components/ui/kbd";
import { CriteriaEditor } from "./CriteriaEditor";
import { CreditsBalance } from "./CreditsBalance";
import { useIsMobile } from "@/hooks/use-mobile";

const TABS = [
  { href: "/jobs", label: "Jobs", key: "jobs" },
  { href: "/jobs/documents", label: "Documents", key: "documents" },
];

export function TabSwitcher() {
  const router = useRouter();
  const activeKey = router.pathname === "/jobs/documents" ? "documents" : "jobs";

  return (
    <LayoutGroup id="filterbar-tabs">
      <div className="flex shrink-0 items-center rounded-full border border-[#d4d0c4] bg-[#EEECE7] p-0.5 dark:border-[#38312e] dark:bg-[#1C1917]">
        {TABS.map(({ href, label, key }) => (
          <Link key={key} href={href}>
            <span
              className={`relative block cursor-pointer rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors duration-200 select-none ${
                activeKey === key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeKey === key && (
                <motion.span
                  layoutId="tab-pill"
                  className="pointer-events-none absolute inset-0 rounded-full border border-[#d4d0c4] bg-white shadow-sm dark:border-[#38312e] dark:bg-[#2C2620]"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </span>
          </Link>
        ))}
      </div>
    </LayoutGroup>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? "bg-foreground text-background border-foreground"
          : "border-border text-foreground/60 hover:border-foreground/30 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterBar({
  filterBarRef,
  phase,
  centerMargin,
  promptSummary,
  currentAnswers,
  isRescanning,
  onRescan,
  filters,
  onFiltersChange,
  onFiltersReset,
  activeFilterCount,
  filteredPicksCount,
  totalPicksCount,
  rescanExhausted,
  onAddJob,
  creditsRefreshKey,
  onBuyCredits,
}) {
  const isMobile = useIsMobile();

  return (
    <div className="mt-2.5 mb-1.5 flex shrink-0 flex-row items-center gap-2 pr-4 pl-4 md:mt-6 md:mb-2">
      {/* Left group: criteria + filters */}
      <div
        ref={filterBarRef}
        className="flex min-w-0 flex-1 items-center gap-1.5 md:flex-none"
        style={{
          marginLeft: !isMobile && (phase === "list" || phase === "shrinking") ? centerMargin : 0,
        }}
      >
        {/* Criteria / search pill */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              data-testid="button-criteria"
              className="bg-card border-border text-foreground hover:border-foreground/20 flex h-9 min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-full border pr-4 pl-1.5 text-sm transition-colors select-none md:max-w-[360px]"
            >
              <div className="bg-foreground/[0.07] pointer-events-none flex h-6 w-6 shrink-0 items-center justify-center rounded-full dark:bg-white/[0.08]">
                <Search className="text-foreground/55 h-3 w-3" aria-hidden="true" />
              </div>
              <span className="text-foreground/70 pointer-events-none truncate text-[13px]">
                {promptSummary}
              </span>
              {currentAnswers.length > 0 && !isRescanning && (
                <span className="bg-foreground text-background pointer-events-none flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold">
                  {currentAnswers.filter((a) => a.answer).length}
                </span>
              )}
              {isRescanning && (
                <span className="pointer-events-none h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF553E]" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="start"
            sideOffset={8}
            collisionPadding={12}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="border-border bg-card w-[340px] overflow-visible rounded-2xl border p-0 shadow-xl"
          >
            {currentAnswers.length > 0 ? (
              <CriteriaEditor
                answers={currentAnswers}
                onRescan={onRescan}
                isRescanning={isRescanning}
              />
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-muted-foreground/50 text-[12px]">
                  No criteria recorded for this session.
                </p>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Filters — only in split phase */}
        {phase === "split" && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                data-testid="button-filters"
                className="border-border bg-card text-foreground/70 hover:text-foreground flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border text-sm font-medium transition-colors md:w-auto md:px-4"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden md:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-foreground text-background flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={8}
              collisionPadding={12}
              className="border-border bg-card w-[272px] rounded-2xl border p-4 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-foreground text-[13px] font-semibold">Filter roles</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={onFiltersReset}
                    className="text-muted-foreground/60 hover:text-foreground flex cursor-pointer items-center gap-1 text-[11px] transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    Reset
                  </button>
                )}
              </div>

              <div className="mb-4">
                <p className="text-foreground/35 mb-2 text-[11px] font-semibold tracking-widest uppercase">
                  Work mode
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["all", "Remote", "On-site"].map((v) => (
                    <FilterPill
                      key={v}
                      active={filters.workMode === v}
                      onClick={() => onFiltersChange({ ...filters, workMode: v })}
                    >
                      {v === "all" ? "Any" : v}
                    </FilterPill>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-foreground/35 mb-2 text-[11px] font-semibold tracking-widest uppercase">
                  Min match score
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 50, 60, 70, 80, 90].map((v) => (
                    <FilterPill
                      key={v}
                      active={filters.minMatch === v}
                      onClick={() => onFiltersChange({ ...filters, minMatch: v })}
                    >
                      {v === 0 ? "Any" : `${v}+`}
                    </FilterPill>
                  ))}
                </div>
              </div>

              <p className="text-muted-foreground/50 mt-4 text-center text-[11px]">
                {filteredPicksCount} of {totalPicksCount} roles shown
              </p>
            </PopoverContent>
          </Popover>
        )}

        {rescanExhausted && (
          <span className="text-muted-foreground/50 hidden px-2 text-[11px] md:inline">
            No more new roles found
          </span>
        )}
      </div>

      {/* Right group: desktop only */}
      <div className="ml-auto hidden items-center gap-1.5 md:flex">
        <button
          onClick={onAddJob}
          className="border-border bg-card text-foreground/70 hover:text-foreground flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add job manually
          <Kbd>⌘K</Kbd>
        </button>
        <TabSwitcher />
        <CreditsBalance refreshKey={creditsRefreshKey} onBuyClick={onBuyCredits} />
      </div>
    </div>
  );
}
