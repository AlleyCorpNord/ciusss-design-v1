"use client"

/**
 * Collapsible sources pattern aligned with Vercel AI Elements “Sources”
 * (see https://elements.ai-sdk.dev/components/sources).
 */

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { ExternalLink } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

/** Root collapsible for the AI Elements–style sources pattern. */
export function Sources({
  className,
  defaultOpen,
  ...props
}: React.ComponentProps<typeof Collapsible>) {
  return (
    <Collapsible
      data-slot="sources"
      defaultOpen={defaultOpen}
      className={cn("group w-full", className)}
      {...props}
    />
  )
}

export function SourcesTrigger({
  className,
  count,
  label = "Sources",
  ...props
}: React.ComponentProps<typeof CollapsibleTrigger> & {
  count: number
  /** e.g. "Sources" / "Sources :" — keep trigger text short */
  label?: string
}) {
  return (
    <CollapsibleTrigger
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-muted/60 hover:text-foreground",
        className
      )}
      {...props}
    >
      <span className="font-medium text-foreground">
        {label}
        {count > 0 ? (
          <span className="text-muted-foreground"> ({count})</span>
        ) : null}
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
  )
}

export function SourcesContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent
      className={cn(
        "mt-2 flex flex-col gap-1.5 overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

export function Source({
  className,
  title,
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  title: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm transition-colors hover:border-border hover:bg-muted",
        className
      )}
      {...props}
    >
      <span className="min-w-0 flex-1 font-medium text-foreground underline underline-offset-2 group-hover:text-primary-on-background">
        {title}
      </span>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-70 group-hover:opacity-100" />
    </a>
  )
}
