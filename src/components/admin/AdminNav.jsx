import Link from "next/link";
import { useRouter } from "next/router";
import { BarChart2, Users, Gift, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import DesignfolioLogoV2 from "@/components/icons/DesignfolioLogoV2";
import { clearDfToken } from "@/network/admin";

const NAV_ITEMS = [
  { href: "/admin", label: "Stats", icon: BarChart2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/grant-plan", label: "Grant Plan", icon: Gift },
];

export default function AdminNav() {
  const router = useRouter();

  const handleLogout = () => {
    clearDfToken();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="offcanvas">
      {/* Brand header */}
      <SidebarHeader className="px-4 pt-4 pb-3">
        <div className="flex items-center">
          <DesignfolioLogoV2
            className="h-7 w-auto shrink-0 text-[#1A1A1A] dark:text-[#F0EDE7]"
            aria-label="Designfolio"
          />
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-[#E37941]/12 text-[#E37941] leading-none shrink-0 mb-4">
            Admin
          </span>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Nav links */}
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarMenu>
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/admin"
                  ? router.pathname === "/admin"
                  : router.pathname.startsWith(href);
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={label}
                  >
                    <Link href={href}>
                      <Icon aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Sign out */}
      <SidebarFooter className="pb-4">
        <SidebarSeparator className="mb-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              aria-label="Sign out of admin"
              tooltip="Sign out"
            >
              <LogOut aria-hidden="true" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
