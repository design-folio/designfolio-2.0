import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Search } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminNav from "./AdminNav";
import { AdminSearchDialog } from "./AdminSearchDialog";

export default function AdminLayout({ children, title }) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchOpenRef = useRef(searchOpen);
  useEffect(() => {
    searchOpenRef.current = searchOpen;
  }, [searchOpen]);

  useEffect(() => {
    document.body.setAttribute("data-admin", "true");
    return () => document.body.removeAttribute("data-admin");
  }, []);

  useEffect(() => {
    let gMode = false;
    let gTimer = null;

    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
        return;
      }

      // g-prefix nav shortcuts — only when dialog is closed and no text input is focused
      if (searchOpenRef.current) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable)
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (gMode) {
        clearTimeout(gTimer);
        gMode = false;
        if (e.key === "s") {
          e.preventDefault();
          router.push("/admin");
        } else if (e.key === "u") {
          e.preventDefault();
          router.push("/admin/users");
        } else if (e.key === "p") {
          e.preventDefault();
          router.push("/admin/grant-plan");
        }
        return;
      }

      if (e.key === "g") {
        gMode = true;
        gTimer = setTimeout(() => {
          gMode = false;
        }, 1000);
      }
    };

    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      clearTimeout(gTimer);
    };
  }, [router]);

  return (
    <SidebarProvider data-admin="true">
      <AdminNav />
      <SidebarInset className="bg-[#F0EDE7] dark:bg-[#1A1A1A]">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-[#E5D7C4] bg-[#F0EDE7] px-4 md:px-6 dark:border-white/10 dark:bg-[#1A1A1A]">
          <SidebarTrigger className="text-[#7A736C] transition-colors duration-150 hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:hover:text-[#F0EDE7]" />
          <div className="h-4 w-px bg-[#E5D7C4] dark:bg-white/10" aria-hidden="true" />
          <h1 className="truncate text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
            {title || "Admin"}
          </h1>

          {/* Global search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="ml-auto flex h-8 w-56 items-center gap-2 rounded-lg border border-[#E5D7C4] bg-white px-3 text-sm text-[#7A736C] transition-colors duration-150 hover:bg-[#F5F2EE] hover:text-[#1A1A1A] focus-visible:ring-2 focus-visible:ring-[#E5D7C4] focus-visible:outline-none dark:border-white/10 dark:bg-[#2A2520] dark:text-[#B5AFA5] dark:hover:bg-[#302B25] dark:hover:text-[#F0EDE7] dark:focus-visible:ring-white/20"
            aria-label="Open search"
            aria-keyshortcuts="Meta+k Control+k"
          >
            <Search size={13} aria-hidden="true" />
            <span className="flex-1 text-left text-xs">Search…</span>
            <kbd
              className="pointer-events-none inline-flex items-center gap-0.5 rounded border border-[#E5D7C4] bg-[#F5F2EE] px-1.5 py-0.5 text-[10px] leading-none font-medium text-[#7A736C] dark:border-white/10 dark:bg-[#231F1A] dark:text-[#B5AFA5]"
              aria-hidden="true"
            >
              ⌘K
            </kbd>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </SidebarInset>

      <AdminSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </SidebarProvider>
  );
}
