import { useState, useCallback, useRef } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
      className="w-8 h-8 rounded-full bg-[#F0EDE7] dark:bg-[#231F1A] flex items-center justify-center shrink-0"
      aria-hidden="true"
    >
      <span className="text-xs font-medium text-[#7A736C] dark:text-[#B5AFA5]">{initials}</span>
    </div>
  );
}

function getPortfolioUrl(username) {
  return `https://${username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`;
}

function UserCell({ user }) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "—";

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <AvatarInitials name={name} email={user.email} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE7] truncate">{name}</p>
        <div className="flex items-center gap-1 min-w-0">
          <p className="text-xs text-[#7A736C] dark:text-[#B5AFA5] truncate">{user.email}</p>
          <CopyButton
            content={user.email}
            delay={1500}
            iconSize={11}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#7A736C] dark:text-[#B5AFA5] w-4 h-4"
            aria-label={`Copy ${user.email}`}
          />
        </div>
      </div>
    </div>
  );
}

const COLUMNS = [
  {
    id: "user",
    header: "User",
    enableSorting: false,
    cell: ({ row }) => <UserCell user={row.original} />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          className="flex items-center gap-1 text-xs font-medium text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors duration-120"
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
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge
          variant="outline"
          className="text-xs border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
        >
          Verified
        </Badge>
      ) : (
        <span className="text-[#7A736C] dark:text-[#B5AFA5] text-sm" aria-label="Not verified">—</span>
      ),
  },
  {
    accessorKey: "activePlan",
    header: "Plan",
    enableSorting: false,
    cell: ({ getValue }) => {
      const plan = getValue();
      if (!plan || plan === "free") {
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F0EDE7] dark:bg-[#2A2520] text-[#7A736C] dark:text-[#B5AFA5] border border-[#E5D7C4] dark:border-white/10">
            Free
          </span>
        );
      }
      const label = { lifetime: "Lifetime", mthly: "Monthly", qtrly: "Quarterly", yrly: "Yearly" }[plan] ?? plan;
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F0EDE7] dark:bg-[#2A2520] text-[#1A1A1A] dark:text-[#F0EDE7] border border-[#E5D7C4] dark:border-white/10">
          {label}
        </span>
      );
    },
  },
  {
    accessorKey: "hasLive",
    header: "Portfolio",
    cell: ({ row }) => {
      const { hasLive, username } = row.original;
      if (!hasLive) {
        return <span className="text-[#7A736C] dark:text-[#B5AFA5] text-sm" aria-label="Not live">—</span>;
      }
      if (username) {
        return (
          <a
            href={getPortfolioUrl(username)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Live <ExternalLink size={10} aria-hidden="true" />
          </a>
        );
      }
      return <Badge variant="default" className="text-xs">Live</Badge>;
    },
  },
  {
    accessorKey: "lastPublishedAt",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          className="flex items-center gap-1 text-xs font-medium text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors duration-120"
          onClick={() => column.toggleSorting(sorted === "asc")}
          aria-label={`Sort by published date${sorted === "asc" ? ", ascending" : sorted === "desc" ? ", descending" : ""}`}
        >
          Published <ArrowUpDown size={12} aria-hidden="true" />
        </button>
      );
    },
    cell: ({ getValue }) => {
      const val = getValue();
      if (!val) return <span className="text-[#7A736C] dark:text-[#B5AFA5] text-sm">—</span>;
      return <TimestampCell date={val} />;
    },
  },
  {
    accessorKey: "projectCount",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          className="flex items-center gap-1 text-xs font-medium text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors duration-120"
          onClick={() => column.toggleSorting(sorted === "asc")}
          aria-label={`Sort by project count${sorted === "asc" ? ", ascending" : sorted === "desc" ? ", descending" : ""}`}
        >
          Projects <ArrowUpDown size={12} aria-hidden="true" />
        </button>
      );
    },
    cell: ({ getValue }) => (
      <span className="text-sm tabular-nums text-[#7A736C] dark:text-[#B5AFA5]">{getValue()}</span>
    ),
  },
  {
    accessorKey: "customDomain",
    header: "Domain",
    enableSorting: false,
    cell: ({ row }) => {
      const { customDomain, domainVerified } = row.original;
      if (!customDomain) {
        return <span className="text-[#7A736C] dark:text-[#B5AFA5] text-sm" aria-label="No custom domain">—</span>;
      }
      if (domainVerified) {
        return (
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-green-500 shrink-0" aria-label="Domain verified" />
            <span className="text-xs font-mono text-[#1A1A1A] dark:text-[#F0EDE7] truncate max-w-[140px]" title={customDomain}>
              {customDomain}
            </span>
          </div>
        );
      }
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-default">
                <AlertCircle size={13} className="text-amber-500 shrink-0" aria-label="Domain unverified" />
                <span className="text-xs font-mono text-[#1A1A1A] dark:text-[#F0EDE7] truncate max-w-[140px]" title={customDomain}>
                  {customDomain}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="p-0 bg-transparent border-0 shadow-none">
              <div className="bg-[#231F1A] text-[#F0EDE7] rounded-md px-2.5 py-1.5 text-[11px] border border-white/10 shadow-lg">
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
    cell: ({ row }) => <UserRowActions user={row.original} />,
  },
];

export default function UsersTable() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
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
    queryKey: ["admin-users", debouncedSearch, filter, page],
    queryFn: () =>
      _getAdminUsers({
        search: debouncedSearch,
        filter: filter === "all" ? "" : filter,
        page,
        limit: LIMIT,
      }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });

  const table = useReactTable({
    data: data?.users ?? [],
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: data?.pages ?? 1,
  });

  const totalPages = data?.pages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A736C] dark:text-[#B5AFA5] pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id="user-search"
            placeholder="Search by name or email…"
            value={search}
            onChange={handleSearch}
            className="pl-8 h-9 text-sm bg-white dark:bg-[#2A2520] border-[#E5D7C4] dark:border-white/10 text-[#1A1A1A] dark:text-[#F0EDE7] placeholder:text-[#7A736C] dark:placeholder:text-[#B5AFA5] focus-visible:ring-[#E5D7C4] dark:focus-visible:ring-white/20"
            aria-label="Search users"
            type="search"
          />
        </div>
        <Tabs
          value={filter}
          onValueChange={(v) => { setFilter(v); setPage(1); }}
          className="shrink-0"
        >
          <TabsList className="h-9" aria-label="Filter users">
            <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
            <TabsTrigger value="live" className="text-xs px-3">Live</TabsTrigger>
            <TabsTrigger value="verified" className="text-xs px-3">Verified</TabsTrigger>
          </TabsList>
        </Tabs>
        {!isLoading && (
          <p className="text-xs text-[#7A736C] dark:text-[#B5AFA5] ml-auto" aria-live="polite" aria-atomic="true">
            {total.toLocaleString()} user{total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#E5D7C4] dark:border-white/10 overflow-hidden bg-white dark:bg-[#2A2520]">
        <div className="overflow-x-auto">
          <Table aria-label="Users table" aria-busy={isLoading}>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-[#FAF8F5] dark:bg-[#231F1A] hover:bg-[#FAF8F5] dark:hover:bg-[#231F1A] border-b border-[#E5D7C4] dark:border-white/10">
                  {hg.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        className="text-xs h-10 px-4 text-[#7A736C] dark:text-[#B5AFA5]"
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
                    {COLUMNS.map((col) => (
                      <TableCell key={col.id || col.accessorKey} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMNS.length}
                    className="h-32 text-center text-sm text-[#7A736C] dark:text-[#B5AFA5]"
                  >
                    Failed to load users.
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMNS.length}
                    className="h-32 text-center text-sm text-[#7A736C] dark:text-[#B5AFA5]"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group hover:bg-[#F5F2EE] dark:hover:bg-[#302B25] transition-colors duration-150"
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
            className="h-8 text-xs bg-white dark:bg-[#2A2520] border-[#E5D7C4] dark:border-white/10 text-[#7A736C] dark:text-[#B5AFA5] hover:bg-[#F5F2EE] dark:hover:bg-[#302B25] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7]"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} className="mr-1" aria-hidden="true" /> Previous
          </Button>
          <span className="text-xs text-[#7A736C] dark:text-[#B5AFA5] tabular-nums" aria-live="polite">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-8 text-xs bg-white dark:bg-[#2A2520] border-[#E5D7C4] dark:border-white/10 text-[#7A736C] dark:text-[#B5AFA5] hover:bg-[#F5F2EE] dark:hover:bg-[#302B25] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7]"
            aria-label="Next page"
          >
            Next <ChevronRight size={14} className="ml-1" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
