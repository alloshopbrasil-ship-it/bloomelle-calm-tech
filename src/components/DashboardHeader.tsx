import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardHeaderProfile } from "./DashboardHeaderProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  title: string;
  userPlan?: "free" | "premium";
}

export function DashboardHeader({ title, userPlan = "free" }: DashboardHeaderProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Hide SidebarTrigger on mobile/tablet since bottom nav is used */}
        <div className="hidden lg:block">
          <SidebarTrigger />
        </div>
        <div className="flex items-center flex-1 justify-between">
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => navigate("/dashboard/notifications")}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
            </Button>
            <div className="text-right hidden md:block">
              <div className="text-xs text-muted-foreground">{t("header.yourPlan")}</div>
              <div className="text-sm font-medium">
                {userPlan === "premium" ? t("header.planPremium") : t("header.planFree")}
              </div>
            </div>
            {/* Profile visible on all screen sizes */}
            <DashboardHeaderProfile />
          </div>
        </div>
      </div>
    </header>
  );
}
