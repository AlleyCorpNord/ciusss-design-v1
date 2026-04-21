"use client"

import { useState } from "react"
import { ChevronDown, ExternalLink, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface Source {
  title: string
  url?: string
}

interface SourcesBlockV2Props {
  sources: Source[]
  triggerLabel: string
  className?: string
}

export function SourcesBlockV2({
  sources,
  triggerLabel,
  className,
}: SourcesBlockV2Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={cn("flex flex-col", className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors w-fit"
      >
        <FileText className="w-4 h-4" />
        <span className="font-medium">{triggerLabel}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && (
        <div className="mt-2 flex flex-col gap-1.5 pl-1">
          {sources.map((source) => (
            <a
              key={source.title}
              href={source.url || "#"}
              className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted border border-border/50 hover:border-border transition-all"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background border border-border">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground underline underline-offset-2 group-hover:text-primary-on-background transition-colors truncate block">
                  {source.title}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
