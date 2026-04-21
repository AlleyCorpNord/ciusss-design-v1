"use client"

import { Pause, Play, Volume2, X } from "lucide-react"
import { SecondaryPrimaryButton } from "@/components/ui/secondary-primary-button"
import { cn } from "@/lib/utils"

export interface MessageReadAloudLabels {
  start: string
  pause: string
  resume: string
  stop: string
}

export interface MessageReadAloudControlProps {
  mode: "idle" | "playing" | "paused"
  labels: MessageReadAloudLabels
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  /** When true, render nothing (no speech text available). */
  hidden?: boolean
}

function AnimatedAudioIcon({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center text-neutral-900",
        active && "motion-safe:animate-pulse"
      )}
      aria-hidden
    >
      <Volume2 className="h-[18px] w-[18px]" strokeWidth={2} />
    </span>
  )
}

export function MessageReadAloudControl({
  mode,
  labels,
  onStart,
  onPause,
  onResume,
  onStop,
  hidden = false,
}: MessageReadAloudControlProps) {
  if (hidden) return null

  if (mode === "idle") {
    return (
      <SecondaryPrimaryButton
        type="button"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-xl"
        aria-label={labels.start}
        onClick={onStart}
      >
        <Volume2 className="h-4 w-4" aria-hidden />
      </SecondaryPrimaryButton>
    )
  }

  const isPlaying = mode === "playing"

  return (
    <div
      className="flex shrink-0 items-center gap-2.5 rounded-full border border-neutral-200/90 bg-white px-3 py-2 shadow-[0_4px_20px_rgba(15,23,42,0.08)]"
      role="group"
      aria-label={isPlaying ? labels.pause : labels.resume}
    >
      <AnimatedAudioIcon active={isPlaying} />
      {isPlaying ? (
        <button
          type="button"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#b8c4e8] bg-[#e8ecf8]",
            "text-[#1a2f5c] transition-opacity hover:opacity-90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8c4e8]/80 focus-visible:ring-offset-2"
          )}
          aria-label={labels.pause}
          onClick={onPause}
        >
          <Pause className="h-[18px] w-[14px]" strokeWidth={2.25} aria-hidden />
        </button>
      ) : (
        <button
          type="button"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#b8c4e8] bg-[#e8ecf8]",
            "text-[#1a2f5c] transition-opacity hover:opacity-90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8c4e8]/80 focus-visible:ring-offset-2"
          )}
          aria-label={labels.resume}
          onClick={onResume}
        >
          <Play className="h-[18px] w-[18px] pl-0.5" strokeWidth={2.25} aria-hidden />
        </button>
      )}
      <button
        type="button"
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#f0b8c4] bg-[#fce8ec]",
          "text-[#e11d48] transition-opacity hover:opacity-90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/80 focus-visible:ring-offset-2"
        )}
        aria-label={labels.stop}
        onClick={onStop}
      >
        <X className="h-[18px] w-[18px]" strokeWidth={2.75} aria-hidden />
      </button>
    </div>
  )
}
