import { useState } from "react";
import { Home, Sparkles, Heart, Users, BarChart3, Settings, LogOut, Calendar, BookOpen, TrendingUp, Bookmark } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogoutConfirmationDialog } from "@/components/LogoutConfirmationDialog";

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const currentPath = location.pathname;
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const menuItems = [
    { title: t("sidebar.home"), url: "/dashboard", icon: Home },
    { title: t("sidebar.dailyTasks"), url: "/dashboard/practices", icon: Sparkles },
    { title: t("sidebar.journal"), url: "/dashboard/journal", icon: BookOpen },
    { title: t("sidebar.affirmations"), url: "/dashboard/affirmations", icon: Heart },
    { title: t("sidebar.bloomGoals"), url: "/dashboard/progress", icon: BarChart3 },
    { title: t("sidebar.emotionalProgress"), url: "/dashboard/emotional-progress", icon: TrendingUp },
    { title: t("sidebar.calendar"), url: "/dashboard/calendar", icon: Calendar },
    { title: t("sidebar.community"), url: "/dashboard/community", icon: Users },
    { title: t("sidebar.savedPosts"), url: "/dashboard/saved", icon: Bookmark },
    { title: t("sidebar.settings"), url: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (path: string) => currentPath === path;

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <>
      <Sidebar className="border-r border-border/40">
        <SidebarHeader className="p-6">
          <Link
            to="/"
            className="text-2xl font-light tracking-wide hover:text-primary transition-colors text-foreground"
          >
            Bloomelle
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("sidebar.mainMenu")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleLogoutClick}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{t("sidebar.logout")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <LogoutConfirmationDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}