import type { TranscriptLine } from '../types.ts'

/** Providers may send revised completed transcription events for one utterance. */
export function mergeTranscript(lines: TranscriptLine[], line: TranscriptLine): TranscriptLine[] {
  const index = line.id ? lines.findIndex(item => item.id === line.id && item.who === line.who) : -1
  if (index >= 0) return lines.map((item, i) => i === index ? { ...line, t: item.t } : item)
  const last = lines.at(-1)
  if (last?.who === 'user' && line.who === 'user' && (!last.id || !line.id) && line.text.startsWith(last.text.replace(/[.!?]$/, ''))) {
    return [...lines.slice(0, -1), { ...line, t: last.t }]
  }
  return [...lines, line]
}
