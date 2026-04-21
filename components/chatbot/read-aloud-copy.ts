import type { ChatCopy, ChatLocale } from "./chatbot-copy"
import { getHospitalAddressCopy } from "./hospital-address-copy"
import {
  getAssistantFirstPlainText,
  getAssistantSecondPlainText,
  getV3PlainText,
} from "./chatbot-copy"
import type { ParkingCopy } from "./parking-copy"
import type { SourcesPlacement } from "./prototype-config"
import type { ChatAssistantMessage } from "./demo-flow/types"

/** Strips markdown bold markers, common emoji/warning decoration, and collapses whitespace. */
export function sanitizeForSpeech(raw: string): string {
  let s = raw.replace(/\*\*/g, "")
  s = s.replace(
    /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
    ""
  )
  s = s.replace(/⚠️/g, "")
  s = s.replace(/\s+/g, " ").trim()
  return s
}

export function getReadAloudLabels(locale: ChatLocale) {
  return locale === "fr"
    ? {
        start: "Lire le message",
        pause: "Mettre en pause",
        resume: "Reprendre la lecture",
        stop: "Arrêter la lecture",
      }
    : {
        start: "Read message",
        pause: "Pause",
        resume: "Resume reading",
        stop: "Stop reading",
      }
}

/** Visible labels for read-aloud V2 (in-bubble controls). */
export function getReadAloudV2Labels(locale: ChatLocale) {
  return locale === "fr"
    ? {
        readAloud: "Lire à haute voix",
        stop: "Arrêter",
        pause: "Pause",
        play: "Lecture",
      }
    : {
        readAloud: "Read aloud",
        stop: "Stop",
        pause: "Pause",
        play: "Play",
      }
}

/**
 * Heuristic duration for TTS progress UI (Web Speech API does not expose real duration).
 */
export function estimateSpeechDurationMs(text: string, locale: ChatLocale): number {
  const t = text.trim()
  if (!t.length) return 8000
  const words = t.split(/\s+/).filter(Boolean).length
  const wpm = locale === "fr" ? 155 : 165
  const ms = (words / wpm) * 60_000
  return Math.max(6000, Math.min(600_000, ms))
}

/** Formats whole seconds as mm:ss for a countdown display. */
export function formatRemainingClock(totalSec: number): string {
  const s = Math.max(0, Math.ceil(totalSec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`
}

function joinParts(...parts: (string | null | undefined)[]): string {
  return parts
    .filter((p): p is string => !!p && p.trim().length > 0)
    .map((p) => p.trim())
    .join(" ")
}

/** Synthetic id for the static welcome card (not in `messages`). */
export const STATIC_GREETING_READ_ALOUD_ID = "__static_greeting__"

export function getGreetingReadAloudPlainText(copy: ChatCopy): string {
  return sanitizeForSpeech(
    joinParts(copy.greeting.line1, copy.greeting.line2, copy.greeting.disclaimer)
  )
}

/**
 * Split long text into shorter utterances. Chromium often fires `onend` almost
 * immediately for a single very long utterance; chaining shorter chunks is reliable.
 */
export function splitTextIntoSpeechChunks(text: string, maxLen = 400): string[] {
  const t = text.trim()
  if (!t) return []
  if (t.length <= maxLen) return [t]
  const chunks: string[] = []
  let start = 0
  while (start < t.length) {
    let end = Math.min(start + maxLen, t.length)
    if (end < t.length) {
      const segment = t.slice(start, end)
      const breakCandidates = [
        segment.lastIndexOf(". "),
        segment.lastIndexOf("? "),
        segment.lastIndexOf("! "),
        segment.lastIndexOf("\n"),
        segment.lastIndexOf(" "),
      ]
      const breakAt = Math.max(...breakCandidates)
      if (breakAt >= Math.floor(maxLen * 0.2)) {
        const nextStart = start + breakAt + 1
        if (nextStart > start) end = nextStart
      }
    }
    const piece = t.slice(start, end).trim()
    if (piece.length > 0) chunks.push(piece)
    start = end
  }
  return chunks.length > 0 ? chunks : [t]
}

/**
 * Safari (Apple WebKit) generally speaks correctly with only `utterance.lang` set.
 * Chromium-based browsers often produce no audible output unless `utterance.voice`
 * is set to an entry from `speechSynthesis.getVoices()`.
 */
export function shouldAssignExplicitSpeechVoice(): boolean {
  if (typeof navigator === "undefined") return true
  const vendor = navigator.vendor ?? ""
  if (/Apple Computer|Apple Inc/i.test(vendor)) return false
  return true
}

export function pickSpeechVoiceForLang(
  voices: SpeechSynthesisVoice[],
  bcp47: string
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null
  const want = bcp47.replace("_", "-").toLowerCase()
  const primary = want.split("-")[0] ?? ""
  const norm = (lang: string) => lang.replace("_", "-").toLowerCase()

  const exact = voices.filter((v) => norm(v.lang).startsWith(want))
  const loose =
    exact.length > 0
      ? exact
      : voices.filter((v) => norm(v.lang).startsWith(primary))
  const pool = loose.length > 0 ? loose : voices

  const local = pool.find((v) => v.localService)
  if (local) return local
  const def = pool.find((v) => v.default)
  if (def) return def
  return pool[0] ?? null
}

/** BCP47 for synthesis: Quebec French for `fr` so Chrome can pick a Canadian voice when available. */
export function getSpeechBcp47ForChatLocale(locale: ChatLocale): string {
  return locale === "fr" ? "fr-CA" : "en-US"
}

function rankFrenchVoiceForUtterance(
  normLang: (s: string) => string,
  want: string,
  v: SpeechSynthesisVoice
): number {
  const L = normLang(v.lang)
  if (want.startsWith("fr-ca")) {
    if (L.startsWith("fr-ca")) return 0
    if (L.startsWith("fr-fr")) return 1
    return 2
  }
  if (want.startsWith("fr-fr")) {
    if (L.startsWith("fr-fr")) return 0
    if (L.startsWith("fr-ca")) return 1
    return 2
  }
  if (L.startsWith("fr-ca")) return 0
  if (L.startsWith("fr-fr")) return 1
  return 2
}

/**
 * For Chromium: never pick a voice whose language primary tag differs from the
 * utterance — mismatches often yield **silent** playback. If none match, return
 * null and rely on `utterance.lang` alone.
 *
 * For French, orders `fr-*` voices to match the requested region first (e.g.
 * `fr-CA` → Canadian voices before France), so fallback stays natural when the
 * exact subtag is unavailable.
 */
export function pickSpeechVoiceMatchingUtteranceLang(
  voices: SpeechSynthesisVoice[],
  bcp47: string
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null
  const want = bcp47.replace("_", "-").toLowerCase()
  const primary = want.split("-")[0] ?? ""
  const norm = (lang: string) => lang.replace("_", "-").toLowerCase()
  const samePrimary = voices.filter(
    (v) => norm(v.lang).split("-")[0] === primary
  )
  if (samePrimary.length === 0) return null

  const exact = samePrimary.filter((v) => norm(v.lang).startsWith(want))
  const pool = exact.length > 0 ? exact : samePrimary

  const sorted = [...pool].sort((a, b) => {
    if (primary === "fr") {
      const d =
        rankFrenchVoiceForUtterance(norm, want, a) -
        rankFrenchVoiceForUtterance(norm, want, b)
      if (d !== 0) return d
    }
    if (a.localService && !b.localService) return -1
    if (!a.localService && b.localService) return 1
    if (a.default && !b.default) return -1
    if (!a.default && b.default) return 1
    return 0
  })
  return sorted[0] ?? null
}

/** Ensures non-zero volume and stable defaults (some engines behave oddly otherwise). */
export function applySpeechUtteranceOutputDefaults(u: SpeechSynthesisUtterance): void {
  u.volume = 1
  u.rate = 1
  u.pitch = 1
}

function servicesV4SourcesPlain(copy: ChatCopy): string {
  const links = copy.v3.links
  const v = copy.v4
  if (links.length === 0) return ""
  const between = v.servicesSourcesBetweenLinks
  let mid = ""
  for (let i = 0; i < links.length; i++) {
    if (i > 0) mid += between
    mid += links[i]!.title
  }
  return joinParts(
    v.servicesSourcesBeforeFirstLink,
    mid,
    v.servicesSourcesAfterLastLink
  )
}

function parkingV4SourcesPlain(parkingCopy: ParkingCopy): string {
  const link = parkingCopy.officialLinks[0]
  if (!link) return ""
  const v = parkingCopy.v4
  return joinParts(v.sourcesBeforeLink, link.title, v.sourcesAfterLink)
}

function parkingSourcesMessagePlain(
  parkingCopy: ParkingCopy,
  placement: SourcesPlacement
): string {
  const links = parkingCopy.officialLinks
  if (links.length === 0) return ""
  const titles = links.map((l) => l.title)
  if (placement === "inline" || placement === "below") {
    return joinParts(parkingCopy.sourcesHeading, titles.join(", "))
  }
  return joinParts(
    parkingCopy.sourcesHeading,
    titles.map((t) => `• ${t}`).join(" ")
  )
}

function servicesInlineSourcesPlain(copy: ChatCopy): string {
  if (copy.sourcesInline.length === 0) return ""
  return joinParts(
    copy.sourcesHeading,
    copy.sourcesInline.map((s) => s.title).join(", ")
  )
}

/**
 * Returns plain text for speech synthesis, or null if nothing meaningful to read.
 */
export function getReadAloudPlainText(
  msg: ChatAssistantMessage,
  copy: ChatCopy,
  parkingCopy: ParkingCopy,
  placement: SourcesPlacement,
  locale: ChatLocale
): string | null {
  switch (msg.step) {
    case "services_first": {
      const main = sanitizeForSpeech(
        msg.playbackStructured
          ? joinParts(
              copy.assistantFirst.intro,
              ...copy.assistantFirst.bullets.map((b) => `• ${b}`)
            )
          : getAssistantFirstPlainText(copy, placement)
      )
      const withSources =
        placement === "inline" &&
        msg.revealComplete &&
        copy.sourcesInline.length > 0
          ? joinParts(main, sanitizeForSpeech(servicesInlineSourcesPlain(copy)))
          : main
      return withSources.length > 0 ? withSources : null
    }
    case "services_v3":
      return sanitizeForSpeech(getV3PlainText(copy)) || null
    case "services_followup": {
      const raw = msg.playbackStructured
        ? getAssistantSecondPlainText(copy)
        : msg.displayText || getAssistantSecondPlainText(copy)
      const s = sanitizeForSpeech(raw)
      return s.length > 0 ? s : null
    }
    case "services_combined_v4": {
      const main = sanitizeForSpeech(getAssistantFirstPlainText(copy, placement))
      const tailSentence = sanitizeForSpeech(servicesV4SourcesPlain(copy))
      const follow = sanitizeForSpeech(copy.assistantFollowUp)
      return joinParts(main, tailSentence, follow) || null
    }
    case "parking_body": {
      const raw =
        msg.playbackStructured || msg.revealComplete
          ? parkingCopy.body
          : msg.displayText || parkingCopy.body
      const s = sanitizeForSpeech(raw)
      return s.length > 0 ? s : null
    }
    case "parking_source": {
      const s = sanitizeForSpeech(
        parkingSourcesMessagePlain(parkingCopy, placement)
      )
      return s.length > 0 ? s : null
    }
    case "parking_followup": {
      const raw =
        msg.playbackStructured || msg.revealComplete
          ? parkingCopy.followUp
          : msg.displayText || parkingCopy.followUp
      const s = sanitizeForSpeech(raw)
      return s.length > 0 ? s : null
    }
    case "parking_combined_v4": {
      const main = sanitizeForSpeech(parkingCopy.body)
      const tailSentence = sanitizeForSpeech(parkingV4SourcesPlain(parkingCopy))
      const follow = sanitizeForSpeech(parkingCopy.followUp)
      return joinParts(main, tailSentence, follow) || null
    }
    case "hospital_address": {
      const raw = getHospitalAddressCopy(locale).replace(
        /\[([^\]]*)\]\([^)]+\)/g,
        "$1"
      )
      const s = sanitizeForSpeech(raw)
      return s.length > 0 ? s : null
    }
    default:
      return null
  }
}
