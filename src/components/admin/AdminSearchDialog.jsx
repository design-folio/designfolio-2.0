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
        className="fixed left-[50%] top-[18%] z-50 w-full max-w-xl translate-x-[-50%] translate-y-0 overflow-hidden rounded-2xl border border-[#E5D7C4] dark:border-white/10 bg-white dark:bg-[#2A2520] p-0 shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 [&>button]:hidden"
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
              <CommandEmpty className="py-8 text-sm text-[#7A736C] dark:text-[#B5AFA5] text-center">
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
                    <div className="flex items-center gap-2.5 w-full py-0.5">
                      <div className="w-6 h-6 rounded-md bg-[#F0EDE7] dark:bg-[#231F1A] flex items-center justify-center shrink-0">
                        <Icon
                          size={13}
                          aria-hidden="true"
                          className="text-[#7A736C] dark:text-[#B5AFA5]"
                        />
                      </div>
                      <span className="flex-1 text-sm">{label}</span>
                      <span className="text-[10px] text-[#7A736C] dark:text-[#B5AFA5] font-mono opacity-60">
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
                        <div className="flex items-center gap-2.5 w-full min-w-0 py-0.5">
                          <div className="w-7 h-7 rounded-full bg-[#F0EDE7] dark:bg-[#231F1A] flex items-center justify-center shrink-0 text-[11px] font-semibold text-[#7A736C] dark:text-[#B5AFA5] leading-none">
                            {initials}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                            <span
                              className={`text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE7] truncate leading-tight ${isDeleted ? "line-through opacity-60" : ""}`}
                            >
                              {name}
                            </span>
                            <span className="text-xs text-[#7A736C] dark:text-[#B5AFA5] truncate leading-tight">
                              {user.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isDeleted ? (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 leading-none border border-red-200 dark:border-red-800">
                                Deleted
                              </span>
                            ) : (
                              <>
                                {user.hasLive && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F0EDE7] dark:bg-[#231F1A] text-[#7A736C] dark:text-[#B5AFA5] leading-none border border-[#E5D7C4] dark:border-white/10">
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
          <div className="border-t border-[#E5D7C4] dark:border-white/10 px-3 py-2 flex items-center gap-4">
            {[
              { keys: "↑↓", label: "navigate" },
              { keys: "↵", label: "select" },
              { keys: "esc", label: "close" },
            ].map(({ keys, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-[11px] text-[#7A736C] dark:text-[#B5AFA5]"
              >
                <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F0EDE7] dark:bg-[#231F1A] border border-[#E5D7C4] dark:border-white/10 text-[#7A736C] dark:text-[#B5AFA5] leading-none">
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
