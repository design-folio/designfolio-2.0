import Link from "next/link";
import { useRouter } from "next/router";
import { BarChart2, Users, Gift, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
          <Badge className="mb-4 shrink-0 border-0 bg-[#E37941]/12 text-[10px] leading-none font-semibold tracking-wide text-[#E37941] uppercase">
            Admin
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Nav links */}
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarMenu>
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/admin" ? router.pathname === "/admin" : router.pathname.startsWith(href);
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
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
