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
        <header className="h-14 shrink-0 flex items-center gap-3 px-4 md:px-6 border-b border-[#E5D7C4] dark:border-white/10 bg-[#F0EDE7] dark:bg-[#1A1A1A] sticky top-0 z-10">
          <SidebarTrigger className="text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors duration-150" />
          <div className="w-px h-4 bg-[#E5D7C4] dark:bg-white/10" aria-hidden="true" />
          <h1 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] truncate">
            {title || "Admin"}
          </h1>

          {/* Global search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="ml-auto flex items-center gap-2 h-8 px-3 w-56 rounded-lg text-sm text-[#7A736C] dark:text-[#B5AFA5] bg-white dark:bg-[#2A2520] border border-[#E5D7C4] dark:border-white/10 hover:bg-[#F5F2EE] dark:hover:bg-[#302B25] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5D7C4] dark:focus-visible:ring-white/20"
            aria-label="Open search"
            aria-keyshortcuts="Meta+k Control+k"
          >
            <Search size={13} aria-hidden="true" />
            <span className="text-xs flex-1 text-left">Search…</span>
            <kbd
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F5F2EE] dark:bg-[#231F1A] border border-[#E5D7C4] dark:border-white/10 text-[#7A736C] dark:text-[#B5AFA5] leading-none pointer-events-none"
              aria-hidden="true"
            >
              ⌘K
            </kbd>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </SidebarInset>

      <AdminSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </SidebarProvider>
  );
}
