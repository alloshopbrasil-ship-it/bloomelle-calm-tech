import { useAuth } from "@/contexts/AuthContext";
import { Youtube } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();
  
  // Pages where language selector should NOT appear (dashboard pages)
  const dashboardPaths = ['/dashboard', '/journal', '/goals', '/calendar', '/affirmations', '/community', '/settings', '/daily-tasks', '/emotional-progress'];
  const isDashboardPage = dashboardPaths.some(path => location.pathname.startsWith(path));

  const handleBloomSpacesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/signup';
    } else {
      window.location.href = '/community';
    }
    window.scrollTo(0, 0);
  };

  return (
    <footer className="relative py-16 px-6 border-t border-border/50 overflow-hidden bg-primary text-primary-foreground" style={{
      boxShadow: 'var(--shadow-depth)'
    }}>
      {/* Decorative floral accent */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
        <div className="w-full h-full rounded-full" style={{
          background: 'radial-gradient(circle, hsl(350 70% 70%) 0%, transparent 70%)'
        }} />
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-normal tracking-tight text-black font-sans">
              Bloomelle
            </h3>
            <p className="text-sm opacity-90 leading-relaxed">
              {t("landing.footer.tagline")}
            </p>
          </div>

          {/* Links - Product */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium uppercase tracking-wider opacity-80">
              {t("landing.footer.product")}
            </h4>
            <nav className="flex flex-col space-y-3">
              <a href="/features" onClick={(e) => { e.preventDefault(); window.location.href = '/features'; window.scrollTo(0, 0); }} className="text-sm opacity-90 hover:opacity-100 transition-all duration-300">
                {t("landing.footer.features")}
              </a>
              <a href="/plans" onClick={(e) => { e.preventDefault(); window.location.href = '/plans'; window.scrollTo(0, 0); }} className="text-sm opacity-90 hover:opacity-100 transition-all duration-300">
                {t("landing.footer.plans")}
              </a>
              <a href="#" onClick={handleBloomSpacesClick} className="text-sm opacity-90 hover:opacity-100 transition-all duration-300">
                {t("landing.footer.bloomspaces")}
              </a>
            </nav>
          </div>

          {/* Links - Company */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium uppercase tracking-wider opacity-80">
              {t("landing.footer.company")}
            </h4>
            <nav className="flex flex-col space-y-3">
              <a href="/about" onClick={(e) => { e.preventDefault(); window.location.href = '/about'; window.scrollTo(0, 0); }} className="text-sm opacity-90 hover:opacity-100 transition-all duration-300">
                {t("landing.footer.about")}
              </a>
              <a href="/help" onClick={(e) => { e.preventDefault(); window.location.href = '/help'; window.scrollTo(0, 0); }} className="text-sm opacity-90 hover:opacity-100 transition-all duration-300">
                {t("landing.footer.help")}
              </a>
              <a href="/terms" onClick={(e) => { e.preventDefault(); window.location.href = '/terms'; window.scrollTo(0, 0); }} className="text-sm opacity-90 hover:opacity-100 transition-all duration-300">
                {t("landing.footer.terms")}
              </a>
              <a href="/privacy" onClick={(e) => { e.preventDefault(); window.location.href = '/privacy'; window.scrollTo(0, 0); }} className="text-sm opacity-90 hover:opacity-100 transition-all duration-300">
                {t("landing.footer.privacy")}
              </a>
              <a href="/contact" onClick={(e) => { e.preventDefault(); window.location.href = '/contact'; window.scrollTo(0, 0); }} className="text-sm opacity-90 hover:opacity-100 transition-all duration-300">
                {t("landing.footer.contact")}
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <p className="text-sm opacity-80">
              © {currentYear} Bloomelle. {t("landing.footer.copyright")}
            </p>
            {!isDashboardPage && <LanguageSelector />}
          </div>
          <div className="flex items-center gap-6">
            <a 
              href="https://instagram.com/bloomelle_eu" 
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-110"
              aria-label="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a 
              href="https://youtube.com/@Bloomelle07" 
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-110"
              aria-label="YouTube"
            >
              <Youtube size={20} />
            </a>
            <a 
              href="https://www.tiktok.com/@bloomelle07?is_from_webapp=1&sender_device=pc" 
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-110"
              aria-label="TikTok"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
