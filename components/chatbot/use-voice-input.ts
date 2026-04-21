"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { ChatLocale } from "./chatbot-copy"
import {
  getSpeechRecognitionConstructor,
  speechRecognitionLang,
} from "./speech-recognition-support"

interface UseVoiceInputOptions {
  locale: ChatLocale
  onTranscript: (text: string) => void
}

export interface UseVoiceInputResult {
  isRecording: boolean
  errorMessage: string | null
  /** Mic stream for visualization; cleared when session tears down. */
  micStream: MediaStream | null
  /** When false, timeline should idle/reset while recognition may still be winding down. */
  timelineVisualizationActive: boolean
  canUseVoice: boolean
  startRecording: () => Promise<void>
  cancelRecording: () => void
  confirmRecording: () => void
  clearError: () => void
}

function formatUserMediaError(err: unknown): string {
  if (err && typeof err === "object" && "name" in err) {
    const n = (err as { name: string }).name
    if (n === "NotAllowedError" || n === "PermissionDeniedError") {
      return "Microphone access was denied."
    }
    if (n === "NotFoundError") {
      return "No microphone was found."
    }
  }
  return "Could not access the microphone."
}

export function useVoiceInput({
  locale,
  onTranscript,
}: UseVoiceInputOptions): UseVoiceInputResult {
  const [isRecording, setIsRecording] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [micStream, setMicStream] = useState<MediaStream | null>(null)
  const [timelineVisualizationActive, setTimelineVisualizationActive] =
    useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const liveTranscriptRef = useRef("")
  const finalTranscriptAccRef = useRef("")
  /** After stop(), onend delivers the final transcript when user confirmed */
  const pendingConfirmRef = useRef(false)
  const onTranscriptRef = useRef(onTranscript)
  onTranscriptRef.current = onTranscript

  const canUseVoice =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    getSpeechRecognitionConstructor() != null

  const tearDownAudio = useCallback(() => {
    setTimelineVisualizationActive(false)
    setMicStream((prev) => {
      prev?.getTracks().forEach((t) => t.stop())
      return null
    })
  }, [])

  const detachRecognition = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec) return
    rec.onresult = null
    rec.onerror = null
    rec.onend = null
    recognitionRef.current = null
  }, [])

  const beginSession = useCallback(async () => {
    setErrorMessage(null)
    liveTranscriptRef.current = ""
    finalTranscriptAccRef.current = ""
    pendingConfirmRef.current = false

    const Ctor = getSpeechRecognitionConstructor()
    if (!Ctor) {
      setErrorMessage("Speech recognition is not supported in this browser.")
      return
    }

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (e) {
      setErrorMessage(formatUserMediaError(e))
      return
    }

    setMicStream(stream)

    const rec = new Ctor()
    rec.lang = speechRecognitionLang(locale)
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interimPart = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]!
        const piece = r[0]?.transcript ?? ""
        if (r.isFinal) finalTranscriptAccRef.current += piece
        else interimPart += piece
      }
      const f = finalTranscriptAccRef.current
      const gap = f && interimPart ? " " : ""
      liveTranscriptRef.current = (f + gap + interimPart).trimEnd()
    }

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted") return
      setErrorMessage(
        event.error === "not-allowed"
          ? "Microphone or speech recognition permission was denied."
          : `Speech recognition error: ${event.error}.`
      )
      detachRecognition()
      tearDownAudio()
      setIsRecording(false)
    }

    rec.onend = () => {
      detachRecognition()
      tearDownAudio()
      setIsRecording(false)

      if (pendingConfirmRef.current) {
        pendingConfirmRef.current = false
        const text = liveTranscriptRef.current.trim()
        if (text) onTranscriptRef.current(text)
        else setErrorMessage("No speech was recognized. Please try again.")
      }
    }

    recognitionRef.current = rec

    try {
      rec.start()
    } catch {
      setErrorMessage("Could not start speech recognition.")
      detachRecognition()
      tearDownAudio()
      return
    }

    setIsRecording(true)
    setTimelineVisualizationActive(true)
  }, [detachRecognition, locale, tearDownAudio])

  const hardStopWithoutConfirm = useCallback(() => {
    pendingConfirmRef.current = false
    const rec = recognitionRef.current
    if (rec) {
      try {
        rec.abort()
      } catch {
        /* noop */
      }
    }
    detachRecognition()
    tearDownAudio()
    setIsRecording(false)
  }, [detachRecognition, tearDownAudio])

  const startRecording = useCallback(async () => {
    if (!canUseVoice) {
      setErrorMessage("Voice input is not available in this environment.")
      return
    }
    hardStopWithoutConfirm()
    await beginSession()
  }, [beginSession, canUseVoice, hardStopWithoutConfirm])

  const cancelRecording = useCallback(() => {
    hardStopWithoutConfirm()
  }, [hardStopWithoutConfirm])

  const confirmRecording = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec) return
    pendingConfirmRef.current = true
    setTimelineVisualizationActive(false)
    try {
      rec.stop()
    } catch {
      pendingConfirmRef.current = false
      setErrorMessage("Could not finalize recording.")
      hardStopWithoutConfirm()
    }
  }, [hardStopWithoutConfirm])

  const clearError = useCallback(() => setErrorMessage(null), [])

  useEffect(
    () => () => {
      hardStopWithoutConfirm()
    },
    [hardStopWithoutConfirm]
  )

  return {
    isRecording,
    errorMessage,
    micStream,
    timelineVisualizationActive,
    canUseVoice,
    startRecording,
    cancelRecording,
    confirmRecording,
    clearError,
  }
}
