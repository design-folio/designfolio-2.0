import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { BarChart2, Users, Gift, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { _getAdminUsers } from "@/network/admin";

const NAV_ITEMS = [
  { href: "/admin", label: "Stats", icon: BarChart2, hint: "G then S" },
  { href: "/admin/users", label: "Users", icon: Users, hint: "G then U" },
  { href: "/admin/grant-plan", label: "Grant Plan", icon: Gift, hint: "G then P" },
];

export function AdminSearchDialog({ open, onOpenChange }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Clear query after close animation finishes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setQuery(""), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  const { data, isFetching } = useQuery({
    queryKey: ["admin-search-users", debouncedQuery],
    queryFn: () => _getAdminUsers({ search: debouncedQuery, limit: 5 }).then((r) => r.data),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  const close = () => onOpenChange(false);

  const handleNavigate = (href) => {
    close();
    router.push(href);
  };

  const handleOpenPortfolio = (username) => {
    window.open(
      `https://${username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`,
      "_blank",
      "noopener,noreferrer"
    );
    close();
  };

  const handleCopyEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied");
    } catch {
      toast.error("Failed to copy");
    }
    close();
  };

  const users = data?.users ?? [];
  const showUsers = debouncedQuery.length >= 2;
  const filteredNav = query
    ? NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : NAV_ITEMS;
  const hasResults = filteredNav.length > 0 || (showUsers && users.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-admin="true"
        overlayClassName="bg-black/40 backdrop-blur-[2px]"
        className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[18%] left-[50%] z-50 w-full max-w-xl translate-x-[-50%] translate-y-0 overflow-hidden rounded-2xl border border-[#E5D7C4] bg-white p-0 shadow-[0_8px_40px_rgba(0,0,0,0.12)] duration-150 dark:border-white/10 dark:bg-[#2A2520] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] [&>button]:hidden"
        aria-label="Global search"
      >
        <Command shouldFilter={false} className="bg-transparent">
          <CommandInput
            placeholder="Search users, navigate…"
            value={query}
            onValueChange={setQuery}
            aria-label="Search"
          />

          <CommandList className="max-h-[380px]">
            {!hasResults && query.length >= 2 && (
              <CommandEmpty className="py-8 text-center text-sm text-[#7A736C] dark:text-[#B5AFA5]">
                No results for &ldquo;{query}&rdquo;
              </CommandEmpty>
            )}

            {/* Navigation */}
            {filteredNav.length > 0 && (
              <CommandGroup heading="Navigation">
                {filteredNav.map(({ href, label, icon: Icon, hint }) => (
                  <CommandItem
                    key={href}
                    value={`nav-${href}`}
                    onSelect={() => handleNavigate(href)}
                    className="gap-0 dark:data-[selected='true']:bg-[#3A342D]"
                  >
                    <div className="flex w-full items-center gap-2.5 py-0.5">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F0EDE7] dark:bg-[#231F1A]">
                        <Icon
                          size={13}
                          aria-hidden="true"
                          className="text-[#7A736C] dark:text-[#B5AFA5]"
                        />
                      </div>
                      <span className="flex-1 text-sm">{label}</span>
                      <span className="font-mono text-[10px] text-[#7A736C] opacity-60 dark:text-[#B5AFA5]">
                        {hint}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* User results */}
            {showUsers && users.length > 0 && (
              <>
                {filteredNav.length > 0 && <CommandSeparator />}
                <CommandGroup heading={isFetching ? "Users — searching…" : "Users"}>
                  {users.map((user) => {
                    const isDeleted = user.status === 1;
                    const name =
                      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                      user.username ||
                      user.email;
                    const initials = (name || "?")
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <CommandItem
                        key={user.email}
                        value={`user-${user.email}`}
                        onSelect={() =>
                          !isDeleted && user.username
                            ? handleOpenPortfolio(user.username)
                            : handleCopyEmail(user.email)
                        }
                        className="gap-0 dark:data-[selected='true']:bg-[#3A342D]"
                      >
                        <div className="flex w-full min-w-0 items-center gap-2.5 py-0.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0EDE7] text-[11px] leading-none font-semibold text-[#7A736C] dark:bg-[#231F1A] dark:text-[#B5AFA5]">
                            {initials}
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span
                              className={`truncate text-sm leading-tight font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ${isDeleted ? "line-through opacity-60" : ""}`}
                            >
                              {name}
                            </span>
                            <span className="truncate text-xs leading-tight text-[#7A736C] dark:text-[#B5AFA5]">
                              {user.email}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {isDeleted ? (
                              <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] leading-none font-medium text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                Deleted
                              </span>
                            ) : (
                              <>
                                {user.hasLive && (
                                  <span className="rounded border border-[#E5D7C4] bg-[#F0EDE7] px-1.5 py-0.5 text-[10px] leading-none font-medium text-[#7A736C] dark:border-white/10 dark:bg-[#231F1A] dark:text-[#B5AFA5]">
                                    Live
                                  </span>
                                )}
                                {user.username && (
                                  <ExternalLink
                                    size={11}
                                    className="text-[#7A736C] dark:text-[#B5AFA5]"
                                    aria-hidden="true"
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>

          {/* Keyboard hint footer */}
          <div className="flex items-center gap-4 border-t border-[#E5D7C4] px-3 py-2 dark:border-white/10">
            {[
              { keys: "↑↓", label: "navigate" },
              { keys: "↵", label: "select" },
              { keys: "esc", label: "close" },
            ].map(({ keys, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-[11px] text-[#7A736C] dark:text-[#B5AFA5]"
              >
                <kbd className="inline-flex items-center rounded border border-[#E5D7C4] bg-[#F0EDE7] px-1.5 py-0.5 text-[10px] leading-none font-medium text-[#7A736C] dark:border-white/10 dark:bg-[#231F1A] dark:text-[#B5AFA5]">
                  {keys}
                </kbd>
                {label}
              </span>
            ))}
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
