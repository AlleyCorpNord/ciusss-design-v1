"use client"

import { useCallback, useLayoutEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  createEmptyTimelineBuffer,
  RECORDING_TIMELINE_BUFFER_CAPACITY,
  type RecordingTimelineSampleBuffer,
  useRecordingTimelineSamples,
} from "@/hooks/use-recording-timeline-samples"

export interface RecordingTimelineProps {
  mediaStream: MediaStream | null
  /** When false, sampling stops and the strip resets (e.g. user tapped confirm). */
  visualizationActive: boolean
  className?: string
}

function hexToRgbTuple(hex: string): string | null {
  const h = hex.replace("#", "")
  if (h.length !== 3 && h.length !== 6) return null
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return null
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

/** Resolves theme --primary to r,g,b for rgba(); falls back when value is not hex. */
function primaryRgbForCanvas(): string {
  if (typeof window === "undefined") return "89, 105, 222"
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim()
  if (raw.startsWith("#")) {
    const t = hexToRgbTuple(raw)
    if (t) return t
  }
  return document.documentElement.classList.contains("dark")
    ? "250, 250, 250"
    : "89, 105, 222"
}

function mutedRgbForCanvas(): string {
  return document.documentElement.classList.contains("dark")
    ? "120, 120, 128"
    : "148, 150, 165"
}

function paintTimeline(
  ctx: CanvasRenderingContext2D,
  cssW: number,
  cssH: number,
  dpr: number,
  buffer: RecordingTimelineSampleBuffer,
  primaryRgb: string,
  mutedRgb: string
): void {
  const w = cssW
  const h = cssH
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  const paddingX = 6
  const paddingY = 5
  const baselineY = h - paddingY
  const maxBar = Math.max(4, baselineY - paddingY - 6)
  const slot = 2.5
  const gap = 1.25
  const colW = slot + gap
  const maxCols = Math.max(8, Math.floor((w - paddingX * 2) / colW))

  ctx.fillStyle = `rgba(${mutedRgb}, 0.07)`
  ctx.beginPath()
  ctx.roundRect(
    paddingX * 0.35,
    paddingY * 0.35,
    w - paddingX * 0.7,
    h - paddingY * 0.7,
    10
  )
  ctx.fill()

  ctx.strokeStyle = `rgba(${mutedRgb}, 0.4)`
  ctx.lineWidth = 1
  ctx.setLineDash([2, 5])
  ctx.beginPath()
  ctx.moveTo(paddingX, baselineY + 0.5)
  ctx.lineTo(w - paddingX, baselineY + 0.5)
  ctx.stroke()
  ctx.setLineDash([])

  const { data, write, count } = buffer
  const n = Math.min(count, maxCols)

  for (let j = 0; j < n; j++) {
    const idx =
      (write -
        1 -
        j +
        RECORDING_TIMELINE_BUFFER_CAPACITY * 2) %
      RECORDING_TIMELINE_BUFFER_CAPACITY
    const sample = data[idx] ?? 0
    const x = w - paddingX - (j + 1) * colW + gap
    if (x < paddingX - 2) break

    const age = n <= 1 ? 0 : j / (n - 1)
    const heightFactor = 0.22 + sample * 0.78
    const barH = Math.max(
      2,
      heightFactor * maxBar * (0.72 + 0.28 * (1 - age * 0.85))
    )
    const alpha = 0.28 + sample * 0.52 * (1 - age * 0.4)

    ctx.fillStyle = `rgba(${primaryRgb}, ${alpha})`
    ctx.beginPath()
    ctx.roundRect(x, baselineY - barH, slot, barH, 1.25)
    ctx.fill()
  }
}

export function RecordingTimeline({
  mediaStream,
  visualizationActive,
  className,
}: RecordingTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bufferRef = useRef<RecordingTimelineSampleBuffer>(
    createEmptyTimelineBuffer()
  )
  const redrawRef = useRef<(() => void) | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const cssW = container.clientWidth
    const cssH = container.clientHeight
    if (cssW < 2 || cssH < 2) return

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
    const pxW = Math.floor(cssW * dpr)
    const pxH = Math.floor(cssH * dpr)
    if (canvas.width !== pxW || canvas.height !== pxH) {
      canvas.width = pxW
      canvas.height = pxH
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const primaryRgb = primaryRgbForCanvas()
    const mutedRgb = mutedRgbForCanvas()

    paintTimeline(ctx, cssW, cssH, dpr, bufferRef.current, primaryRgb, mutedRgb)
  }, [])

  redrawRef.current = draw

  useLayoutEffect(() => {
    draw()
  }, [draw])

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => {
      redrawRef.current?.()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useRecordingTimelineSamples({
    stream: mediaStream,
    isActive: visualizationActive && mediaStream != null,
    bufferRef,
    redrawRef,
  })

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-9 w-full min-w-0 overflow-hidden rounded-xl",
        className
      )}
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
        aria-hidden
      />
    </div>
  )
}
