import { Search, SlidersHorizontal, RotateCcw, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, LayoutGroup } from "framer-motion";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Kbd } from "@/components/ui/kbd";
import { CriteriaEditor } from "./CriteriaEditor";
import { CreditsBalance } from "./CreditsBalance";
import { AvatarDropdown } from "@/components/loggedInHeader/avatar-dropdown";
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
      <div className="flex items-center rounded-full bg-[#EEECE7] dark:bg-[#1C1917] border border-[#d4d0c4] dark:border-[#38312e] p-0.5 flex-shrink-0">
        {TABS.map(({ href, label, key }) => (
          <Link key={key} href={href}>
            <span
              className={`relative block text-[12px] font-semibold px-3 py-1.5 rounded-full transition-colors duration-200 cursor-pointer select-none ${
                activeKey === key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeKey === key && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-white dark:bg-[#2C2620] border border-[#d4d0c4] dark:border-[#38312e] shadow-sm pointer-events-none"
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
      className={`text-[12px] font-medium px-3 py-1.5 rounded-full border transition-colors ${active
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
    <div className="flex flex-row flex-shrink-0 items-center pl-4 md:pl-[108px] pr-4 mt-2.5 md:mt-6 mb-1.5 md:mb-2 gap-2">

      {/* Left group: criteria + filters */}
      <div
        ref={filterBarRef}
        className="flex items-center gap-1.5 flex-1 md:flex-none min-w-0"
        style={{ marginLeft: !isMobile && (phase === "list" || phase === "shrinking") ? centerMargin : 0 }}
      >
        {/* Criteria / search pill */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              data-testid="button-criteria"
              className="flex items-center gap-2.5 bg-card border border-border h-9 text-sm text-foreground min-w-0 flex-1 md:max-w-[360px] select-none rounded-full pl-1.5 pr-4 hover:border-foreground/20 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 flex-shrink-0 rounded-full bg-foreground/[0.07] dark:bg-white/[0.08] flex items-center justify-center pointer-events-none">
                <Search className="w-3 h-3 text-foreground/55" aria-hidden="true" />
              </div>
              <span className="truncate text-[13px] text-foreground/70 pointer-events-none">{promptSummary}</span>
              {currentAnswers.length > 0 && !isRescanning && (
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-foreground text-background text-[10px] font-semibold pointer-events-none">
                  {currentAnswers.filter((a) => a.answer).length}
                </span>
              )}
              {isRescanning && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF553E] animate-pulse pointer-events-none" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="start"
            sideOffset={8}
            collisionPadding={12}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="w-[340px] p-0 rounded-2xl border border-border shadow-xl bg-card overflow-visible"
          >
            {currentAnswers.length > 0 ? (
              <CriteriaEditor
                answers={currentAnswers}
                onRescan={onRescan}
                isRescanning={isRescanning}
              />
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-[12px] text-muted-foreground/50">No criteria recorded for this session.</p>
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
                className="flex-shrink-0 flex items-center justify-center gap-1.5 h-9 w-9 md:w-auto md:px-4 rounded-full border border-border bg-card text-sm font-medium text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden md:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-foreground text-background text-[10px] font-semibold">
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
              className="w-[272px] p-4 rounded-2xl border border-border shadow-xl bg-card"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-semibold text-foreground">Filter roles</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={onFiltersReset}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                    Reset
                  </button>
                )}
              </div>

              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/35 mb-2">Work mode</p>
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
                <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/35 mb-2">Min match score</p>
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

              <p className="mt-4 text-[11px] text-muted-foreground/50 text-center">
                {filteredPicksCount} of {totalPicksCount} roles shown
              </p>
            </PopoverContent>
          </Popover>
        )}

        {rescanExhausted && (
          <span className="hidden md:inline text-[11px] text-muted-foreground/50 px-2">
            No more new roles found
          </span>
        )}
      </div>

      {/* Right group: desktop only */}
      <div className="hidden md:flex items-center gap-1.5 ml-auto">
        <button
          onClick={onAddJob}
          className="flex-shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full border border-border bg-card text-sm font-medium text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          Add job manually
          <Kbd>⌘K</Kbd>
        </button>
        <TabSwitcher />
        <CreditsBalance refreshKey={creditsRefreshKey} onBuyClick={onBuyCredits} />
        <AvatarDropdown />
      </div>
    </div>
  );
}
