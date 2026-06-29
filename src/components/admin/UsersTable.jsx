import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  SlidersHorizontal,
  Columns3,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CopyButton } from "@/components/ui/copy-button";
import UserRowActions from "./UserRowActions";
import TimestampCell from "./TimestampCell";
import { _getAdminUsers } from "@/network/admin";

function AvatarInitials({ name, email }) {
  const initials = (name || email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F0EDE7] dark:bg-[#231F1A]"
      aria-hidden="true"
    >
      <span className="text-xs font-medium text-[#7A736C] dark:text-[#B5AFA5]">{initials}</span>
    </div>
  );
}

function getPortfolioUrl(username) {
  return `https://${username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`;
}

const AGGREGATOR_LABEL = { 0: "Admin Grant", 1: "Razorpay", 2: "Dodo" };

function getOrderId(order) {
  if (order.aggregator === 1) return order.razorpayOrderID || order.receipt || null;
  if (order.aggregator === 2) return order.dodoSubscriptionId || order.dodoPaymentId || null;
  return null;
}

function PlanBadge({ plan }) {
  if (!plan || plan === "free") {
    return (
      <span className="inline-flex items-center rounded border border-[#E5D7C4] bg-[#F0EDE7] px-1.5 py-0.5 text-[10px] font-medium text-[#7A736C] dark:border-white/10 dark:bg-[#2A2520] dark:text-[#B5AFA5]">
        Free
      </span>
    );
  }
  const label =
    { lifetime: "Lifetime", mthly: "Monthly", qtrly: "Quarterly", yrly: "Yearly" }[plan] ?? plan;
  return (
    <span className="inline-flex items-center rounded border border-[#E5D7C4] bg-[#F0EDE7] px-1.5 py-0.5 text-[10px] font-medium text-[#1A1A1A] dark:border-white/10 dark:bg-[#2A2520] dark:text-[#F0EDE7]">
      {label}
    </span>
  );
}

function UserCell({ user }) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "—";

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <AvatarInitials name={name} email={user.email} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">{name}</p>
        <div className="flex min-w-0 items-center gap-1">
          <p className="truncate text-xs text-[#7A736C] dark:text-[#B5AFA5]">{user.email}</p>
          <CopyButton
            content={user.email}
            delay={1500}
            iconSize={11}
            className="size-4 shrink-0 text-[#7A736C] opacity-0 transition-opacity group-hover:opacity-100 dark:text-[#B5AFA5]"
            aria-label={`Copy ${user.email}`}
          />
        </div>
      </div>
    </div>
  );
}

const COLUMN_LABELS = {
  createdAt: "Joined",
  emailVerification: "Verified",
  activePlan: "Plan",
  hasLive: "Portfolio",
  lastPublishedAt: "Published",
  projectCount: "Projects",
  customDomain: "Domain",
  lastPlanType: "Was On",
  lastExpiredAt: "Expired On",
  deletionReason: "Reason",
  deletionAt: "Deleted On",
};

const DELETION_REASON_LABELS = {
  "not-useful": "Didn't find it useful",
  "missing-features": "Missing features I need",
  switching: "Switching to another tool",
  expensive: "Too expensive",
  exploring: "Just exploring",
};

const COLUMNS = [
  {
    id: "user",
    header: "User",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <UserCell user={row.original} />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-[#7A736C] transition-colors duration-120 hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:hover:text-[#F0EDE7]"
          onClick={() => column.toggleSorting(sorted === "asc")}
          aria-label={`Sort by joined date${sorted === "asc" ? ", ascending" : sorted === "desc" ? ", descending" : ""}`}
        >
          Joined <ArrowUpDown size={12} aria-hidden="true" />
        </button>
      );
    },
    cell: ({ getValue }) => <TimestampCell date={getValue()} />,
  },
  {
    accessorKey: "emailVerification",
    header: "Verified",
    cell: ({ getValue, row }) => {
      if (row.original.status === 1) {
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
          >
            Deleted
          </Badge>
        );
      }
      return getValue() ? (
        <Badge
          variant="outline"
          className="border-green-200 bg-green-50 text-xs text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
        >
          Verified
        </Badge>
      ) : (
        <span className="text-sm text-[#7A736C] dark:text-[#B5AFA5]" aria-label="Not verified">
          —
        </span>
      );
    },
  },
  {
    accessorKey: "activePlan",
    header: "Plan",
    enableSorting: false,
    cell: ({ row }) => {
      const { activePlan: plan, activeOrder } = row.original;
      const badge = <PlanBadge plan={plan} />;

      if (!activeOrder) return badge;

      const orderId = getOrderId(activeOrder);
      const aggregatorLabel = AGGREGATOR_LABEL[activeOrder.aggregator] ?? "Unknown";
      const rows = [
        { label: "Via", value: aggregatorLabel },
        orderId ? { label: "Order ID", value: orderId } : null,
        activeOrder.amountMajor != null
          ? {
              label: "Amount",
              value: `${activeOrder.currency} ${activeOrder.amountMajor.toLocaleString()}`,
            }
          : null,
        activeOrder.createdAt
          ? {
              label: "Date",
              value: new Date(activeOrder.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            }
          : null,
        activeOrder.proExpiresAt
          ? {
              label: "Expires",
              value: new Date(activeOrder.proExpiresAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            }
          : null,
      ].filter(Boolean);

      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default">{badge}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="border-0 bg-transparent p-0 shadow-none">
              <div className="min-w-[220px] space-y-1.5 rounded-md border border-white/10 bg-[#231F1A] p-3 text-[#F0EDE7] shadow-lg">
                {rows.map(({ label, value }) => (
                  <div key={label} className="flex items-baseline justify-between gap-4">
                    <span className="shrink-0 font-mono text-[10px] text-[#B5AFA5]">{label}:</span>
                    <span className="text-right font-mono text-[11px] break-all">{value}</span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "hasLive",
    header: "Portfolio",
    cell: ({ row }) => {
      const { hasLive, username, status } = row.original;
      if (status === 1 || !hasLive) {
        return (
          <span className="text-sm text-[#7A736C] dark:text-[#B5AFA5]" aria-label="Not live">
            —
          </span>
        );
      }
      if (username) {
        return (
          <a
            href={getPortfolioUrl(username)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Live <ExternalLink size={10} aria-hidden="true" />
          </a>
        );
      }
      return (
        <Badge variant="default" className="text-xs">
          Live
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastPublishedAt",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-[#7A736C] transition-colors duration-120 hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:hover:text-[#F0EDE7]"
          onClick={() => column.toggleSorting(sorted === "asc")}
          aria-label={`Sort by published date${sorted === "asc" ? ", ascending" : sorted === "desc" ? ", descending" : ""}`}
        >
          Published <ArrowUpDown size={12} aria-hidden="true" />
        </button>
      );
    },
    cell: ({ getValue }) => {
      const val = getValue();
      if (!val) return <span className="text-sm text-[#7A736C] dark:text-[#B5AFA5]">—</span>;
      return <TimestampCell date={val} />;
    },
  },
  {
    accessorKey: "projectCount",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-[#7A736C] transition-colors duration-120 hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:hover:text-[#F0EDE7]"
          onClick={() => column.toggleSorting(sorted === "asc")}
          aria-label={`Sort by project count${sorted === "asc" ? ", ascending" : sorted === "desc" ? ", descending" : ""}`}
        >
          Projects <ArrowUpDown size={12} aria-hidden="true" />
        </button>
      );
    },
    cell: ({ getValue }) => (
      <span className="text-sm text-[#7A736C] tabular-nums dark:text-[#B5AFA5]">{getValue()}</span>
    ),
  },
  {
    accessorKey: "customDomain",
    header: "Domain",
    enableSorting: false,
    cell: ({ row }) => {
      const { customDomain, domainVerified } = row.original;
      if (!customDomain) {
        return (
          <span
            className="text-sm text-[#7A736C] dark:text-[#B5AFA5]"
            aria-label="No custom domain"
          >
            —
          </span>
        );
      }
      if (domainVerified) {
        return (
          <div className="flex items-center gap-1.5">
            <ShieldCheck
              size={13}
              className="shrink-0 text-green-500"
              aria-label="Domain verified"
            />
            <span
              className="max-w-[140px] truncate font-mono text-xs text-[#1A1A1A] dark:text-[#F0EDE7]"
              title={customDomain}
            >
              {customDomain}
            </span>
          </div>
        );
      }
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex cursor-default items-center gap-1.5">
                <AlertCircle
                  size={13}
                  className="shrink-0 text-amber-500"
                  aria-label="Domain unverified"
                />
                <span
                  className="max-w-[140px] truncate font-mono text-xs text-[#1A1A1A] dark:text-[#F0EDE7]"
                  title={customDomain}
                >
                  {customDomain}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="border-0 bg-transparent p-0 shadow-none">
              <div className="rounded-md border border-white/10 bg-[#231F1A] px-2.5 py-1.5 text-[11px] text-[#F0EDE7] shadow-lg">
                Not verified yet
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <UserRowActions user={row.original} />,
  },
];

function normalisePlan(raw) {
  if (raw === "1m") return "mthly";
  if (raw === "3m") return "qtrly";
  return raw;
}

const CHURNED_EXTRA_COLUMNS = [
  {
    accessorKey: "lastPlanType",
    header: "Was On",
    enableSorting: false,
    cell: ({ getValue }) => {
      const val = getValue();
      if (!val) return <span className="text-sm text-[#7A736C] dark:text-[#B5AFA5]">—</span>;
      return <PlanBadge plan={normalisePlan(val)} />;
    },
  },
  {
    accessorKey: "lastExpiredAt",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-[#7A736C] transition-colors duration-120 hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:hover:text-[#F0EDE7]"
          onClick={() => column.toggleSorting(sorted === "asc")}
          aria-label={`Sort by expired date${sorted === "asc" ? ", ascending" : sorted === "desc" ? ", descending" : ""}`}
        >
          Expired On <ArrowUpDown size={12} aria-hidden="true" />
        </button>
      );
    },
    cell: ({ getValue }) => {
      const val = getValue();
      if (!val) return <span className="text-sm text-[#7A736C] dark:text-[#B5AFA5]">—</span>;
      return <TimestampCell date={val} />;
    },
  },
];

const DELETED_EXTRA_COLUMNS = [
  {
    id: "deletionReason",
    accessorFn: (row) => row.deletion?.reason,
    header: "Reason",
    enableSorting: false,
    cell: ({ getValue }) => {
      const val = getValue();
      if (!val) return <span className="text-sm text-[#7A736C] dark:text-[#B5AFA5]">—</span>;
      const label = DELETION_REASON_LABELS[val];
      if (label) {
        return (
          <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-400">
            {label}
          </span>
        );
      }
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block max-w-[160px] cursor-default truncate text-xs text-[#7A736C] italic dark:text-[#B5AFA5]">
                {val}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="border-0 bg-transparent p-0 shadow-none">
              <div className="max-w-[280px] rounded-md border border-white/10 bg-[#231F1A] px-2.5 py-1.5 text-[11px] break-words text-[#F0EDE7] shadow-lg">
                {val}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "deletionAt",
    accessorFn: (row) => row.deletion?.at,
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-[#7A736C] transition-colors duration-120 hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:hover:text-[#F0EDE7]"
          onClick={() => column.toggleSorting(sorted === "asc")}
          aria-label={`Sort by deletion date${sorted === "asc" ? ", ascending" : sorted === "desc" ? ", descending" : ""}`}
        >
          Deleted On <ArrowUpDown size={12} aria-hidden="true" />
        </button>
      );
    },
    cell: ({ getValue }) => {
      const val = getValue();
      if (!val) return <span className="text-sm text-[#7A736C] dark:text-[#B5AFA5]">—</span>;
      return <TimestampCell date={val} />;
    },
  },
];

const GENERIC_FILTERS = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "verified", label: "Verified" },
  { value: "no-portfolio", label: "No Portfolio" },
  { value: "deleted", label: "Deleted" },
];

const REVENUE_FILTERS = [
  { value: "paid", label: "Paid" },
  { value: "churned", label: "Churned" },
  { value: "pending-cancellation", label: "Pending Cancel" },
];

const ALL_FILTERS = [...GENERIC_FILTERS, ...REVENUE_FILTERS];

function FilterPopover({
  open,
  onOpenChange,
  filter,
  pendingFilter,
  setPendingFilter,
  setFilter,
  setPage,
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 shrink-0 gap-2 text-xs transition-colors duration-150",
            filter !== "all" && "border-foreground/40 bg-muted"
          )}
          aria-label="Filter users"
        >
          <SlidersHorizontal data-icon="inline-start" />
          Filters
          {filter !== "all" && (
            <Badge
              variant="secondary"
              className="h-4 px-1.5 py-0 text-[10px] leading-none font-semibold"
            >
              {ALL_FILTERS.find((o) => o.value === filter)?.label}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-48 overflow-hidden rounded-xl p-0 shadow-lg"
      >
        <div className="px-3 pt-3 pb-2">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
            Filter by
          </p>
        </div>
        <Separator />
        <div className="p-1.5">
          <p className="text-muted-foreground mb-0.5 px-2 py-1 text-[10px] font-medium tracking-wider uppercase">
            General
          </p>
          <RadioGroup
            value={pendingFilter}
            onValueChange={setPendingFilter}
            className="flex flex-col gap-0"
          >
            {GENERIC_FILTERS.map((opt) => (
              <label
                key={opt.value}
                htmlFor={`filter-${opt.value}`}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors duration-150 select-none",
                  pendingFilter === opt.value
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <RadioGroupItem
                  value={opt.value}
                  id={`filter-${opt.value}`}
                  className="size-3.5 shrink-0"
                />
                {opt.label}
              </label>
            ))}
          </RadioGroup>
        </div>
        <Separator />
        <div className="p-1.5">
          <p className="text-muted-foreground mb-0.5 px-2 py-1 text-[10px] font-medium tracking-wider uppercase">
            Revenue
          </p>
          <RadioGroup
            value={pendingFilter}
            onValueChange={setPendingFilter}
            className="flex flex-col gap-0"
          >
            {REVENUE_FILTERS.map((opt) => (
              <label
                key={opt.value}
                htmlFor={`filter-${opt.value}`}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors duration-150 select-none",
                  pendingFilter === opt.value
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <RadioGroupItem
                  value={opt.value}
                  id={`filter-${opt.value}`}
                  className="size-3.5 shrink-0"
                />
                {opt.label}
              </label>
            ))}
          </RadioGroup>
        </div>
        <Separator />
        <div className="flex gap-1.5 p-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 flex-1 text-xs"
            onClick={() => {
              setPendingFilter("all");
              setFilter("all");
              setPage(1);
              onOpenChange(false);
            }}
          >
            Clear
          </Button>
          <Button
            size="sm"
            className="h-7 flex-1 text-xs"
            onClick={() => {
              setFilter(pendingFilter);
              setPage(1);
              onOpenChange(false);
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ColumnPopover({ open, onOpenChange, table }) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 shrink-0 gap-2 text-xs transition-colors duration-150"
          aria-label="Toggle columns"
        >
          <Columns3 data-icon="inline-start" />
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-44 overflow-hidden rounded-xl p-0 shadow-lg"
      >
        <div className="px-3 pt-3 pb-2">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
            Show / Hide
          </p>
        </div>
        <Separator />
        <div className="flex flex-col gap-0.5 p-1.5">
          {table.getAllColumns().flatMap((col) =>
            col.getCanHide()
              ? [
                  <label
                    key={col.id}
                    className={cn(
                      "hover:bg-muted flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors duration-150 select-none",
                      col.getIsVisible() ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    <Checkbox
                      checked={col.getIsVisible()}
                      onCheckedChange={(val) => col.toggleVisibility(!!val)}
                      className="size-3.5 shrink-0"
                      aria-label={`Toggle ${COLUMN_LABELS[col.id] ?? col.id} column`}
                    />
                    {COLUMN_LABELS[col.id] ?? col.id}
                  </label>,
                ]
              : []
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function UsersTable() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [pendingFilter, setPendingFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState([]);
  const LIMIT = 20;

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef(null);
  const handleSearch = useCallback((e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 300);
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", debouncedSearch, filter, page, LIMIT],
    queryFn: () =>
      _getAdminUsers({
        search: debouncedSearch,
        filter: filter === "all" ? "" : filter,
        page,
        limit: LIMIT,
      }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });

  const activeColumns = useMemo(() => {
    if (filter === "churned") {
      const cols = [...COLUMNS];
      cols.splice(4, 0, ...CHURNED_EXTRA_COLUMNS);
      return cols;
    }
    if (filter === "deleted") {
      const cols = [...COLUMNS];
      cols.splice(4, 0, ...DELETED_EXTRA_COLUMNS);
      return cols;
    }
    return COLUMNS;
  }, [filter]);

  const table = useReactTable({
    data: data?.users ?? [],
    columns: activeColumns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: data?.pages ?? 1,
  });

  const totalPages = data?.pages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#7A736C] dark:text-[#B5AFA5]"
            aria-hidden="true"
          />
          <Input
            id="user-search"
            placeholder="Search by name or email…"
            value={search}
            onChange={handleSearch}
            className="h-9 border-[#E5D7C4] bg-white pl-8 text-sm text-[#1A1A1A] placeholder:text-[#7A736C] focus-visible:ring-[#E5D7C4] dark:border-white/10 dark:bg-[#2A2520] dark:text-[#F0EDE7] dark:placeholder:text-[#B5AFA5] dark:focus-visible:ring-white/20"
            aria-label="Search users"
            type="search"
          />
        </div>

        <FilterPopover
          open={filterOpen}
          onOpenChange={(open) => {
            if (open) setPendingFilter(filter);
            setFilterOpen(open);
          }}
          filter={filter}
          pendingFilter={pendingFilter}
          setPendingFilter={setPendingFilter}
          setFilter={setFilter}
          setPage={setPage}
        />

        <ColumnPopover open={colMenuOpen} onOpenChange={setColMenuOpen} table={table} />

        {!isLoading && (
          <p
            className="ml-auto text-xs text-[#7A736C] dark:text-[#B5AFA5]"
            aria-live="polite"
            aria-atomic="true"
          >
            {total.toLocaleString()} user{total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5D7C4] bg-white dark:border-white/10 dark:bg-[#2A2520]">
        <div className="overflow-x-auto">
          <Table aria-label="Users table" aria-busy={isLoading}>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="border-b border-[#E5D7C4] bg-[#FAF8F5] hover:bg-[#FAF8F5] dark:border-white/10 dark:bg-[#231F1A] dark:hover:bg-[#231F1A]"
                >
                  {hg.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        className="h-10 px-4 text-xs text-[#7A736C] dark:text-[#B5AFA5]"
                        aria-sort={
                          sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : header.column.getCanSort()
                                ? "none"
                                : undefined
                        }
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {activeColumns.map((col) => (
                      <TableCell key={col.id || col.accessorKey} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={activeColumns.length}
                    className="h-32 text-center text-sm text-[#7A736C] dark:text-[#B5AFA5]"
                  >
                    Failed to load users.
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={activeColumns.length}
                    className="h-32 text-center text-sm text-[#7A736C] dark:text-[#B5AFA5]"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group transition-colors duration-150 hover:bg-[#F5F2EE] dark:hover:bg-[#302B25]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-8 border-[#E5D7C4] bg-white text-xs text-[#7A736C] hover:bg-[#F5F2EE] hover:text-[#1A1A1A] dark:border-white/10 dark:bg-[#2A2520] dark:text-[#B5AFA5] dark:hover:bg-[#302B25] dark:hover:text-[#F0EDE7]"
            aria-label="Previous page"
          >
            <ChevronLeft data-icon="inline-start" aria-hidden="true" /> Previous
          </Button>
          <span
            className="text-xs text-[#7A736C] tabular-nums dark:text-[#B5AFA5]"
            aria-live="polite"
          >
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-8 border-[#E5D7C4] bg-white text-xs text-[#7A736C] hover:bg-[#F5F2EE] hover:text-[#1A1A1A] dark:border-white/10 dark:bg-[#2A2520] dark:text-[#B5AFA5] dark:hover:bg-[#302B25] dark:hover:text-[#F0EDE7]"
            aria-label="Next page"
          >
            Next <ChevronRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
