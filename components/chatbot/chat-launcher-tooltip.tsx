"use client"

import { Fragment } from "react"
import { X } from "lucide-react"

export interface ChatLauncherTooltipProps {
  message: string
  dismissAriaLabel: string
  onDismiss: () => void
}

export function ChatLauncherTooltip({
  message,
  dismissAriaLabel,
  onDismiss,
}: ChatLauncherTooltipProps) {
  const lines = message.split("\n")

  return (
    <div
      role="status"
      className="relative mb-3 max-w-[min(18rem,calc(100vw-3rem))] rounded-xl border border-border bg-white px-3 py-2.5 pr-9 text-sm leading-snug text-foreground shadow-md"
    >
      <p className="text-pretty">
        {lines[0]}
        {lines.slice(1).map((line, i) => (
          <Fragment key={i}>
            <br />
            <span className="font-bold">{line}</span>
          </Fragment>
        ))}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={dismissAriaLabel}
        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      <div
        aria-hidden
        className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-border bg-white"
      />
    </div>
  )
}
