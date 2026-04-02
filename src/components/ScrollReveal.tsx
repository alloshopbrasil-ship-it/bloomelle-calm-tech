import React from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  scale?: boolean;
  threshold?: number;
}

const ScrollReveal = ({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 60,
  duration = 800,
  scale = false,
  threshold = 0.2,
}: ScrollRevealProps) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold });

  const getTransform = () => {
    if (!isVisible) {
      const scaleVal = scale ? "scale(0.95)" : "";
      switch (direction) {
        case "up": return `translateY(${distance}px) ${scaleVal}`;
        case "left": return `translateX(-${distance}px) ${scaleVal}`;
        case "right": return `translateX(${distance}px) ${scaleVal}`;
        case "none": return scaleVal || "none";
      }
    }
    return "translateY(0) translateX(0) scale(1)";
  };

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
