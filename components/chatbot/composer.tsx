"use client"

import { ArrowUp, Check, Mic, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { SecondaryPrimaryButton } from "@/components/ui/secondary-primary-button"
import { RecordingTimeline } from "./recording-timeline"

const inputShellClass =
  "flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3 shadow-sm sm:px-4"

function TranscriptionLoadingLabel({ text }: { text: string }) {
  return (
    <div
      className="flex min-h-[1.25rem] min-w-0 flex-1 items-baseline gap-0.5 text-sm text-neutral-400"
      aria-live="polite"
    >
      <span>{text.replace(/\u2026$/, "")}</span>
      <span
        className="inline-block animate-pulse font-normal text-neutral-400"
        aria-hidden
      >
        …
      </span>
    </div>
  )
}

export interface ComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  transcriptionLoadingPlaceholder?: string
  sendAriaLabel?: string
  micAriaLabel?: string
  cancelRecordingAriaLabel?: string
  confirmRecordingAriaLabel?: string
  disabled?: boolean
  className?: string
  isRecording: boolean
  isVoiceTranscribing?: boolean
  onMicClick: () => void
  micDisabled?: boolean
  micStream: MediaStream | null
  timelineVisualizationActive: boolean
  onRecordingCancel: () => void
  onRecordingConfirm: () => void
  voiceError?: string | null
}

export function Composer({
  value,
  onChange,
  onSubmit,
  placeholder = "Posez votre question...",
  transcriptionLoadingPlaceholder = "Transcription en cours…",
  sendAriaLabel = "Envoyer",
  micAriaLabel = "Enregistrer un message vocal",
  cancelRecordingAriaLabel = "Annuler l'enregistrement",
  confirmRecordingAriaLabel = "Confirmer la dictée",
  disabled = false,
  className,
  isRecording,
  isVoiceTranscribing = false,
  onMicClick,
  micDisabled = false,
  micStream,
  timelineVisualizationActive,
  onRecordingCancel,
  onRecordingConfirm,
  voiceError,
}: ComposerProps) {
  const inputLocked = disabled || isVoiceTranscribing
  const canSend = !inputLocked && value.trim().length > 0

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {voiceError ? (
        <p className="text-sm text-destructive" role="alert">
          {voiceError}
        </p>
      ) : null}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {isRecording ? (
          <>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border border-destructive/35 bg-destructive/15 text-destructive hover:bg-destructive/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 transition-colors"
              aria-label={cancelRecordingAriaLabel}
              onClick={onRecordingCancel}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
            <div className={cn(inputShellClass, "min-h-[52px]")} aria-hidden>
              <RecordingTimeline
                mediaStream={micStream}
                visualizationActive={timelineVisualizationActive}
                className="h-9 w-full border-0 bg-transparent"
              />
            </div>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-primary text-primary-foreground shadow-md hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
              aria-label={confirmRecordingAriaLabel}
              onClick={onRecordingConfirm}
            >
              <Check className="h-4 w-4" aria-hidden />
            </button>
          </>
        ) : (
          <>
            <form
              className={cn(inputShellClass)}
              onSubmit={(e) => {
                e.preventDefault()
                if (canSend) onSubmit()
              }}
            >
              {isVoiceTranscribing ? (
                <TranscriptionLoadingLabel text={transcriptionLoadingPlaceholder} />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#11161f] placeholder:text-neutral-400 focus:outline-none"
                  disabled={inputLocked}
                  autoComplete="off"
                />
              )}
              <button
                type="submit"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                aria-label={sendAriaLabel}
                disabled={!canSend}
              >
                <ArrowUp className="h-4 w-4" aria-hidden />
              </button>
            </form>
            <SecondaryPrimaryButton
              type="button"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-[14px]"
              aria-label={micAriaLabel}
              disabled={micDisabled}
              onClick={() => {
                void onMicClick()
              }}
            >
              <Mic className="h-4 w-4" aria-hidden />
            </SecondaryPrimaryButton>
          </>
        )}
      </div>
    </div>
  )
}
