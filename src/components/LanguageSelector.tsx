import { Globe, ChevronDown } from "lucide-react";
import { useLanguage, Language, getLanguageName } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages: { code: Language; flag: string }[] = [
  { code: "en", flag: "🇺🇸" },
  { code: "es", flag: "🇪🇸" },
  { code: "fr", flag: "🇫🇷" },
  { code: "de", flag: "🇩🇪" },
  { code: "pt", flag: "🇧🇷" },
];

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const currentLang = languages.find((l) => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100 transition-all duration-300 focus:outline-none">
          <Globe size={16} />
          <span>{currentLang?.flag} {getLanguageName(language)}</span>
          <ChevronDown size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="bg-background border border-border shadow-lg z-50 min-w-[160px]"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              language === lang.code ? "bg-accent" : ""
            }`}
          >
            <span>{lang.flag}</span>
            <span>{getLanguageName(lang.code)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
