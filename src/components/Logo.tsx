import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const Logo = ({ className, iconOnly = false }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-0", className)}>
      <img 
        src="/src/assets/logo-icon.png" 
        alt="Bloomelle Logo" 
        className="h-20 w-20 object-contain"
      />
      {!iconOnly && (
        <span className="font-normal text-xl tracking-tight text-black font-sans">
          Bloomelle
        </span>
      )}
    </div>
  );
};

export default Logo;
