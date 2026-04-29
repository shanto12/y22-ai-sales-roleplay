/**
 * Provenance for synthetic data shipped in this demo.
 *
 * Every fixture in src/data/* is invented for demonstration purposes.
 * No real customer transcripts, sales calls, or PII are used anywhere
 * in this codebase or in the deployed app.
 */

export const PROVENANCE = {
  attestation:
    'All personas, transcripts, scores, and prompt versions are synthetic. No real call recordings, customer names, or PII are present.',
  authoredBy: 'shanto12 — for the Y22 AI founding-engineer demo, 2026-04-29',
  sources: [
    {
      name: 'Y22 AI public homepage and LinkedIn page',
      use: 'Vocabulary calibration only ("behaviors", "what top performers do") — no copyrighted text reproduced.',
      url: 'https://y22.ai/',
    },
    {
      name: 'xAI Grok Voice Agent API documentation',
      use: 'API surface, model name, voice IDs, pricing facts.',
      url: 'https://docs.x.ai/developers/model-capabilities/audio/voice-agent',
    },
  ],
} as const
