
import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

/**
 * A convenience wrapper for creating a hover card with a trigger and content
 */
const HoverCardSimple = ({
  content,
  children,
  side = "top",
  align = "center",
  openDelay = 300,
  closeDelay = 100,
  contentProps = {},
  className,
}: {
  content: React.ReactNode
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  openDelay?: number
  closeDelay?: number
  contentProps?: React.ComponentPropsWithoutRef<typeof HoverCardContent>
  className?: string
}) => (
  <HoverCard openDelay={openDelay} closeDelay={closeDelay}>
    <HoverCardTrigger asChild className={className}>
      {children}
    </HoverCardTrigger>
    <HoverCardContent side={side} align={align} {...contentProps}>
      {content}
    </HoverCardContent>
  </HoverCard>
)

export { HoverCard, HoverCardTrigger, HoverCardContent, HoverCardSimple }
