import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { BloomiaChat } from "@/components/BloomiaChat";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userPlan?: "free" | "premium";
  showFooter?: boolean;
  className?: string;
  maxWidth?: string;
}

const DashboardLayout = ({
  children,
  title,
  userPlan = "free",
  showFooter = true,
  className = "",
  maxWidth = "max-w-7xl",
}: DashboardLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-background to-muted/20">
        {/* Desktop sidebar - hidden on mobile and tablet */}
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        <div className="flex-1 flex flex-col">
          <DashboardHeader title={title} userPlan={userPlan} />

          <main className={`flex-1 p-4 md:p-6 ${maxWidth} mx-auto w-full pb-24 lg:pb-6 ${className}`}>
            {children}
          </main>

          {showFooter && (
            <div className="hidden lg:block">
              <Footer />
            </div>
          )}
        </div>

        {/* Mobile bottom navigation */}
        <MobileBottomNav />

        {/* Bloomia AI Chat */}
        <BloomiaChat />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
