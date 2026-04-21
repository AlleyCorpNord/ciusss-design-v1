"use client"

import { useEffect, useRef } from "react"

/** Ring buffer capacity (~minutes at 60 samples/sec before oldest wraps). */
export const RECORDING_TIMELINE_BUFFER_CAPACITY = 8192

export interface RecordingTimelineSampleBuffer {
  data: Float32Array
  write: number
  count: number
}

export function createEmptyTimelineBuffer(): RecordingTimelineSampleBuffer {
  return {
    data: new Float32Array(RECORDING_TIMELINE_BUFFER_CAPACITY),
    write: 0,
    count: 0,
  }
}

export function resetTimelineBuffer(b: RecordingTimelineSampleBuffer): void {
  b.write = 0
  b.count = 0
}

export function pushTimelineSample(
  b: RecordingTimelineSampleBuffer,
  v: number
): void {
  b.data[b.write] = v
  b.write = (b.write + 1) % RECORDING_TIMELINE_BUFFER_CAPACITY
  b.count = Math.min(
    RECORDING_TIMELINE_BUFFER_CAPACITY,
    b.count + 1
  )
}

/** Append one timeline column every N RAF ticks (4 = ¼ the scroll speed of per-frame sampling). */
const TIMELINE_SAMPLE_EVERY_N_FRAMES = 4

/**
 * Drives real-time RMS sampling from a MediaStream into a ring buffer.
 * No React state updates per frame — only mutates bufferRef and calls redrawRef.
 */
export function useRecordingTimelineSamples({
  stream,
  isActive,
  bufferRef,
  redrawRef,
}: {
  stream: MediaStream | null
  isActive: boolean
  bufferRef: React.MutableRefObject<RecordingTimelineSampleBuffer>
  redrawRef: React.MutableRefObject<(() => void) | null>
}): void {
  const smoothRef = useRef(0)

  useEffect(() => {
    if (!stream || !isActive) {
      resetTimelineBuffer(bufferRef.current)
      smoothRef.current = 0
      queueMicrotask(() => redrawRef.current?.())
      return
    }

    let cancelled = false
    let rafId = 0
    let audioCtx: AudioContext | null = null

    const start = async () => {
      audioCtx = new AudioContext()
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.88
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)
      const timeData = new Float32Array(analyser.fftSize)

      await audioCtx.resume()

      let frameIndex = 0
      const tick = () => {
        if (cancelled) return
        analyser.getFloatTimeDomainData(timeData)
        let sum = 0
        for (let i = 0; i < timeData.length; i++) {
          const s = timeData[i]!
          sum += s * s
        }
        const rms = Math.sqrt(sum / timeData.length)
        let target = Math.min(1, rms * 5.1)
        target = Math.pow(Math.max(0, target), 0.62)
        const SMOOTH = 0.78
        smoothRef.current =
          smoothRef.current * SMOOTH + target * (1 - SMOOTH)
        frameIndex += 1
        if (frameIndex % TIMELINE_SAMPLE_EVERY_N_FRAMES === 0) {
          pushTimelineSample(bufferRef.current, smoothRef.current)
          redrawRef.current?.()
        }
        rafId = requestAnimationFrame(tick)
      }

      rafId = requestAnimationFrame(tick)
    }

    void start()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      if (audioCtx) {
        void audioCtx.close()
        audioCtx = null
      }
      resetTimelineBuffer(bufferRef.current)
      smoothRef.current = 0
    }
  }, [stream, isActive, bufferRef, redrawRef])
}
