import React from "react";
import { cn } from "@/lib/utils";
import bloomelleIcon from "@/assets/bloomelle-icon.png";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const Logo = ({ className, iconOnly = false }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-0", className)}>
      <img 
        src={bloomelleIcon} 
        alt="Bloomelle Logo" 
        className="h-20 w-20 object-contain"
      />
      {!iconOnly && (
        <span className="font-normal text-xl tracking-tight text-foreground font-sans">
          Bloomelle
        </span>
      )}
    </div>
  );
};

export default Logo;
