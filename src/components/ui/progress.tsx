import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-3 w-full overflow-hidden rounded-full", className)}
    style={{ 
      background: 'linear-gradient(to right, hsl(350 100% 95%), hsl(0 0% 100%))',
      boxShadow: 'inset 0 1px 3px hsl(350 30% 80% / 0.15)'
    }}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 rounded-full transition-all duration-500 ease-out"
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        background: 'linear-gradient(to right, hsl(350 70% 70%), hsl(270 50% 75%))',
        boxShadow: '0 2px 8px hsl(350 60% 70% / 0.3)'
      }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
