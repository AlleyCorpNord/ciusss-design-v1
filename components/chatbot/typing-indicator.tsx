"use client"

import { cn } from "@/lib/utils"
import { AssistantAvatar } from "./assistant-avatar"
import { LoadingDots } from "./loading-dots"

interface TypingIndicatorProps {
  showAvatar?: boolean
  tallBubble?: boolean
  ariaLabel?: string
  className?: string
}

export function TypingIndicator({
  showAvatar = false,
  tallBubble = false,
  ariaLabel = "En cours de réflexion",
  className,
}: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-start gap-2 sm:gap-3", className)}>
      {showAvatar ? (
        <AssistantAvatar />
      ) : (
        <div className="w-10 flex-shrink-0" aria-hidden />
      )}
      <div role="status" aria-label={ariaLabel}>
        <LoadingDots variant="assistant" tall={tallBubble} />
      </div>
    </div>
  )
}
