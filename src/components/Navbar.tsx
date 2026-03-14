import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-light tracking-wide hover:text-primary transition-colors text-foreground"
          >
            Bloomelle
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-sm font-light text-muted-foreground hover:text-primary transition-colors"
            >
              {t("nav.home")}
            </button>
            <Link
              to="/features"
              className="text-sm font-light text-muted-foreground hover:text-primary transition-colors"
            >
              {t("landing.nav.features")}
            </Link>
            <Link
              to="/community"
              className="text-sm font-light text-muted-foreground hover:text-primary transition-colors"
            >
              {t("landing.nav.bloomspaces")}
            </Link>
            <Link
              to="/plans"
              className="text-sm font-light text-muted-foreground hover:text-primary transition-colors"
            >
              {t("landing.nav.plans")}
            </Link>
            <Link
              to="/about"
              className="text-sm font-light text-muted-foreground hover:text-primary transition-colors"
            >
              {t("landing.nav.about")}
            </Link>
            <Link
              to="/contact"
              className="text-sm font-light text-muted-foreground hover:text-primary transition-colors"
            >
              {t("landing.nav.contact")}
            </Link>
            <Link
              to="/login"
              className="text-sm font-light text-muted-foreground hover:text-primary transition-colors"
            >
              {t("landing.nav.login")}
            </Link>
            <Button
              onClick={() => navigate("/signup")}
              variant="default"
              size="sm"
              className="rounded-full"
            >
              {t("landing.nav.getStarted")}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden transition-colors text-foreground hover:text-primary"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4 animate-fade-in bg-background backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border/20">
            <button
              onClick={() => scrollToSection("home")}
              className="text-sm font-light text-muted-foreground hover:text-primary transition-colors text-left"
            >
              {t("nav.home")}
            </button>
            <Link
              to="/features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-light text-muted-foreground hover:text-primary transition-colors text-left"
            >
              {t("landing.nav.features")}
            </Link>
            <Link
              to="/community"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-light text-muted-foreground hover:text-primary transition-colors text-left"
            >
              {t("landing.nav.bloomspaces")}
            </Link>
            <Link
              to="/plans"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-light text-muted-foreground hover:text-primary transition-colors text-left"
            >
              {t("landing.nav.plans")}
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-light text-muted-foreground hover:text-primary transition-colors text-left"
            >
              {t("landing.nav.about")}
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-light text-muted-foreground hover:text-primary transition-colors text-left"
            >
              {t("landing.nav.contact")}
            </Link>
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-light text-muted-foreground hover:text-primary transition-colors text-left"
            >
              {t("landing.nav.login")}
            </Link>
            <Button
              onClick={() => {
                navigate("/signup");
                setIsMobileMenuOpen(false);
              }}
              variant="default"
              size="sm"
              className="rounded-full w-fit"
            >
              {t("landing.nav.getStarted")}
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
