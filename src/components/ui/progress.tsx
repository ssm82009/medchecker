
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, style, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    style={{
      background: style?.['--progress-background'] as string || 'hsl(var(--secondary))',
      ...style
    }}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        backgroundColor: style?.['--progress-foreground'] as string || 'hsl(var(--primary))',
        transition: 'transform 0.3s cubic-bezier(0.65, 0, 0.35, 1)'
      }}
    />
    {/* Loading pulse animation overlay for visual feedback */}
    {value !== 100 && value !== 0 && (
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
        style={{
          animation: 'progressPulse 1.5s ease-in-out infinite',
          backgroundSize: '200% 100%'
        }}
      />
    )}
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
