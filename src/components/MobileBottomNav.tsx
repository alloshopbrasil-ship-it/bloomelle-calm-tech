import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, BookOpen, Heart, Users, BarChart3, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import Logo from "./Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Calendar, TrendingUp, Bookmark, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogoutConfirmationDialog } from "@/components/LogoutConfirmationDialog";

const MobileBottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const currentPath = location.pathname;

  // Main navigation items (shown in bottom bar) - max 5 icons
  const mainNavItems = [
    { icon: Home, url: "/dashboard", label: t("sidebar.home") },
    { icon: Sparkles, url: "/dashboard/practices", label: t("sidebar.dailyTasks") },
    { icon: BookOpen, url: "/dashboard/journal", label: t("sidebar.journal") },
    { icon: Users, url: "/dashboard/community", label: t("sidebar.community") },
  ];

  // Additional items (shown in menu sheet)
  const menuItems = [
    { icon: Heart, url: "/dashboard/affirmations", label: t("sidebar.affirmations") },
    { icon: BarChart3, url: "/dashboard/progress", label: t("sidebar.bloomGoals") },
    { icon: TrendingUp, url: "/dashboard/emotional-progress", label: t("sidebar.emotionalProgress") },
    { icon: Calendar, url: "/dashboard/calendar", label: t("sidebar.calendar") },
    { icon: Bookmark, url: "/dashboard/saved", label: t("sidebar.savedPosts") },
    { icon: Settings, url: "/dashboard/settings", label: t("sidebar.settings") },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") return currentPath === "/dashboard";
    return currentPath.startsWith(path);
  };

  const handleLogoutClick = () => {
    setSheetOpen(false);
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/40 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            return (
              <Link
                key={item.url}
                to={item.url}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[56px] py-2 px-3 rounded-xl transition-all",
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("w-5 h-5 mb-1", active && "text-primary")} />
                <span className="text-[10px] font-medium truncate max-w-[56px]">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More menu button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center justify-center min-w-[56px] py-2 px-3 rounded-xl transition-all",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Menu className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{t("sidebar.more") || "Mais"}</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl pb-8">
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-6 px-2">
                  <Logo />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.url);
                    return (
                      <Link
                        key={item.url}
                        to={item.url}
                        onClick={() => setSheetOpen(false)}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-2xl transition-all",
                          active
                            ? "bg-primary/10 text-primary"
                            : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        <Icon className="w-6 h-6 mb-2" />
                        <span className="text-xs font-medium text-center leading-tight">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}

                  {/* Logout button */}
                  <button
                    onClick={handleLogoutClick}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                  >
                    <LogOut className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium text-center leading-tight">
                      {t("sidebar.logout")}
                    </span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <LogoutConfirmationDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default MobileBottomNav;
