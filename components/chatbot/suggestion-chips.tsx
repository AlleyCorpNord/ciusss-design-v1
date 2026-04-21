"use client"

import { cn } from "@/lib/utils"
import type { SuggestionDef } from "./chatbot-copy"

interface SuggestionChipsProps {
  suggestions: SuggestionDef[]
  onSelect?: (suggestionId: string) => void
  className?: string
}

export function SuggestionChips({
  suggestions,
  onSelect,
  className,
}: SuggestionChipsProps) {
  return (
    <div className={cn("flex flex-wrap justify-center gap-2", className)}>
      {suggestions.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect?.(s.id)}
          className="px-4 py-2 text-sm font-medium text-primary-on-background bg-card border border-primary-on-background/30 rounded-full hover:bg-primary-on-background/10 hover:border-primary-on-background/45 transition-colors shadow-sm"
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
