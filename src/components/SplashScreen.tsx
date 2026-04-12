import React, { useEffect, useState } from "react";
import bloomelleIcon from "@/assets/bloomelle-icon.png";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("visible"), 50);
    const t2 = setTimeout(() => setPhase("exit"), 1400);
    const t3 = setTimeout(() => onFinish(), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "linear-gradient(135deg, hsl(350 100% 95%) 0%, hsl(340 60% 92%) 50%, hsl(30 50% 95%) 100%)" }}
    >
      <img
        src={bloomelleIcon}
        alt="Bloomelle"
        className={`h-24 w-24 object-contain transition-all duration-700 ${
          phase === "enter" ? "scale-75 opacity-0" : "scale-100 opacity-100"
        }`}
      />
      <span
        className={`mt-3 text-2xl font-light tracking-wider text-foreground transition-all duration-700 delay-200 ${
          phase === "enter" ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        Bloomelle
      </span>
    </div>
  );
};

export default SplashScreen;
