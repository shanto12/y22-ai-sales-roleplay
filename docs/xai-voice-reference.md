# xAI Grok Voice Agent API — Engineering Reference

Compiled 2026-04-29 from the official xAI docs, REST reference, the `xai-org/xai-cookbook` repo, and the Grok Voice Think Fast 1.0 launch post. URLs cited inline; check each one before quoting in production code — the API is <6 months old and is still moving.

**TL;DR shape for our Netlify architecture**

- Browser ⇄ `wss://api.x.ai/v1/realtime` over **WebSocket** (no first-party WebRTC; LiveKit/Pipecat/Voximplant wrap it for media transport).
- Long-lived `XAI_API_KEY` **must stay server-side**. The Netlify Function mints a 5-minute ephemeral token via `POST https://api.x.ai/v1/realtime/client_secrets` and returns `{ value, expires_at }` to the browser.
- Browser opens the WebSocket using the token in the WebSocket subprotocol array (browsers cannot send custom Authorization headers).
- Persona is set with a `session.update` event sent over the open WebSocket, **not** in the token-minting call.
- Transcripts arrive as live events on the same socket: `response.output_audio_transcript.delta` (assistant) and `conversation.item.input_audio_transcription.completed` / `conversation.item.added` (user). No webhook. Capture client-side and POST to backend at end-of-call.
- Pricing: $0.05/min flat (~$3/hour) on `grok-voice-think-fast-1.0`. Tools billed separately per 1k calls.
- Marketed as "OpenAI Realtime API compatible" but several events are renamed or unsupported — see Section H. The cookbook even uses OpenAI's `openai-insecure-api-key.<token>` subprotocol against the xAI endpoint, which is a tell.

---

## A. Authentication & token minting

### A1. Endpoint base URL for the Voice Agent API

- WebSocket realtime: `wss://api.x.ai/v1/realtime` (optional `?model=grok-voice-think-fast-1.0` query param; default is the legacy `grok-voice-fast-1.0`).
- REST companion endpoints under `https://api.x.ai/v1/...`:
  - `POST /v1/realtime/client_secrets` — mint ephemeral token.
  - `POST /v1/tts`, `GET /v1/tts/voices`, `wss://api.x.ai/v1/tts` — TTS.
  - `POST /v1/stt`, `wss://api.x.ai/v1/stt` — STT.

Source: [Voice REST API reference](https://docs.x.ai/developers/rest-api-reference/inference/voice), [Voice Agent API docs](https://docs.x.ai/developers/model-capabilities/audio/voice-agent).

### A2. Auth header

Server-side: `Authorization: Bearer ${XAI_API_KEY}` on the WebSocket upgrade or any REST call.

Browser-side: browsers can't set `Authorization` on a WebSocket upgrade, so xAI piggybacks on the `Sec-WebSocket-Protocol` header. Two strings are documented in the wild:

- `xai-client-secret.${TOKEN}` — documented in the xAI Voice Agent API page text.
- `openai-insecure-api-key.${TOKEN}` (alongside `realtime` and `openai-beta.realtime-v1`) — what the official **xAI cookbook web sample** actually uses today against the xAI realtime URL.

Both are reported to work as part of the OpenAI-Realtime compatibility surface. **For our demo, follow the cookbook sample verbatim** (Section I) — that's what xAI actively maintains.

Source: [Ephemeral Tokens docs](https://docs.x.ai/developers/model-capabilities/audio/ephemeral-tokens), [xai-cookbook web client `useWebSocket.ts`](https://github.com/xai-org/xai-cookbook/blob/main/voice-examples/agent/web/client/src/hooks/useWebSocket.ts).

### A3. Ephemeral token endpoint

- **URL:** `POST https://api.x.ai/v1/realtime/client_secrets`
- **Auth:** `Authorization: Bearer ${XAI_API_KEY}` (server-side only).
- **Request body** (from REST reference):

  ```json
  {
    "expires_after": { "seconds": 300 },
    "session": {
      "model": "grok-voice-think-fast-1.0"
    }
  }
  ```

  - `expires_after.seconds` — integer, max **3600**.
  - `session` (optional) — initial config. The doc explicitly notes the `client_secrets` endpoint **does not support a full `session` object or `expires_after.anchor`** like OpenAI's does, but `session.model` is accepted. Persona/voice/tools should be set with a `session.update` event after the WebSocket opens.

- **Response body:**

  ```json
  {
    "value": "<ephemeral token string>",
    "expires_at": 1714400000
  }
  ```

  - `value` — string token to be passed in the WebSocket subprotocol on the browser.
  - `expires_at` — Unix timestamp.

Source: [Ephemeral Tokens docs](https://docs.x.ai/developers/model-capabilities/audio/ephemeral-tokens), [Voice REST API reference](https://docs.x.ai/developers/rest-api-reference/inference/voice).

### A4. Can `XAI_API_KEY` be used directly client-side?

**No.** xAI's docs explicitly say: "Never expose your API key in client-side code. Always use ephemeral tokens for browser and mobile applications." For our Netlify Functions architecture: the function holds `XAI_API_KEY` as an env var, exchanges it for a fresh ephemeral token per session, returns `{ value, expires_at }` to the browser, and the browser then opens the WebSocket directly to `wss://api.x.ai/v1/realtime`.

Source: [Ephemeral Tokens docs](https://docs.x.ai/developers/model-capabilities/audio/ephemeral-tokens).

---

## B. Browser connection (WebRTC vs WebSocket)

### B5. What transport does the browser use?

**WebSocket only**, natively. The realtime endpoint is `wss://api.x.ai/v1/realtime` — there is no first-party WebRTC SDP exchange in the xAI docs. WebRTC connectivity is provided through third-party wrappers (LiveKit Agents, Pipecat, Voximplant). xAI lists "WebRTC Agent" as a demo app but it sits behind LiveKit.

Source: [Voice Agent API docs](https://docs.x.ai/developers/model-capabilities/audio/voice-agent), [xAI Voice landing page](https://x.ai/api/voice).

### B6. Official xAI LiveKit Plugin / JS SDK?

- **LiveKit plugin (Python):** `livekit-agents[xai]` (Python extra). Live integration page: [LiveKit xAI plugin docs](https://docs.livekit.io/agents/integrations/llm/xai/) and [LiveKit Realtime plugin for xAI](https://docs.livekit.io/agents/models/realtime/plugins/xai/). Two paths: LiveKit Inference (no xAI key needed) or self-hosted plugin with your own xAI key.
- **LiveKit plugin (Node):** `@livekit/agents-plugin-openai@1.x` is what LiveKit's node integration uses (the OpenAI plugin, pointed at xAI's URL — confirms the OpenAI-Realtime-compatibility story).
- **No first-party xAI JS SDK for browser.** The `xai-org/xai-cookbook` web sample is plain `fetch` + native `WebSocket`. No npm package shipped by xAI for browser.

Minimum LiveKit Python example (from LiveKit docs, verbatim):

```python
from livekit.agents import AgentSession, inference

session = AgentSession(
    llm=inference.LLM(
        model="xai/grok-4-1-fast-non-reasoning",
        extra_kwargs={"max_completion_tokens": 1000}
    ),
)
```

Note that LiveKit's chat-LLM plugin uses Grok text models, not the voice agent. For voice with LiveKit, use the realtime plugin (`livekit.plugins.xai.realtime.RealtimeModel(voice="ara")`) — see [DataCamp tutorial](https://www.datacamp.com/tutorial/grok-voice-agent-api).

### B7. If LiveKit-based: what does the Netlify Function return?

Not relevant for the recommended path (we're going direct WebSocket, not LiveKit). For completeness: a LiveKit token-mint function returns `{ url: "wss://<your-project>.livekit.cloud", token: "<livekit-jwt>" }`. The browser then uses `livekit-client` to join that room. Agent runs separately as a worker. This is heavier than what we need.

### B8. OpenAI-Realtime-compatible WebRTC SDP flow?

**Not exposed.** The xAI Voice Agent API only documents the WebSocket variant of the OpenAI Realtime spec. There is no `POST /v1/realtime` SDP endpoint or `RTCDataChannel` flow in the xAI docs. If you need WebRTC media transport you must layer LiveKit/Pipecat in front. For a Netlify-hosted browser demo, **WebSocket is the path of least resistance** — a single `new WebSocket(...)` call after fetching an ephemeral token.

Source: [Voice REST API reference](https://docs.x.ai/developers/rest-api-reference/inference/voice).

---

## C. Persona / system-prompt injection

### C9. How to supply a system prompt

Send a `session.update` event over the WebSocket immediately after `session.created` / `conversation.created`. Persona lives in `session.instructions`:

```json
{
  "type": "session.update",
  "session": {
    "instructions": "You are a skeptical CFO at a mid-market SaaS company...",
    "voice": "rex",
    "turn_detection": { "type": "server_vad" },
    "audio": {
      "input":  { "format": { "type": "audio/pcm", "rate": 24000 } },
      "output": { "format": { "type": "audio/pcm", "rate": 24000 } }
    }
  }
}
```

It is **not** part of the `client_secrets` request body — the docs flag `session` is not fully supported there. Cookbook sample sends `session.update` from the client after seeing `conversation.created` (see [`useWebSocket.ts`](https://github.com/xai-org/xai-cookbook/blob/main/voice-examples/agent/web/client/src/hooks/useWebSocket.ts)). For our demo the cleanest pattern is to have the Netlify Function return both the ephemeral token *and* the persona text, and have the browser send `session.update` once the socket opens — exactly what the cookbook backend at [`xai/backend-nodejs/src/index.ts`](https://github.com/xai-org/xai-cookbook/blob/main/voice-examples/agent/web/xai/backend-nodejs/src/index.ts) does.

Source: [Voice Agent API docs](https://docs.x.ai/developers/model-capabilities/audio/voice-agent).

### C10. System-prompt length limit

**Unconfirmed in docs as of 2026-04-29** — no explicit max documented for `session.instructions`. Adjacent: TTS `text` max is 15,000 chars; voice agent context will be governed by the underlying `grok-voice-think-fast-1.0` context window which xAI hasn't published. Likely safe to assume "a few thousand tokens" works; will need to test live with our longest persona.

---

## D. Voices

### D11. The five voices and selection

| voice_id | Gender   | Documented tone                  |
| -------- | -------- | -------------------------------- |
| `eve`    | Female   | Energetic, upbeat (default)      |
| `ara`    | Female   | Warm, friendly                   |
| `rex`    | Male     | Confident, clear                 |
| `sal`    | Neutral  | Smooth, balanced                 |
| `leo`    | Male     | Authoritative, strong            |

Selection: set `session.voice` to one of those IDs in the `session.update` event. Cookbook default is `ara`.

**Inline emotion/style tags:** the `/v1/tts` endpoint advertises "inline speech tags" (laughter, whispers, pauses) in its `text` field. The realtime voice agent docs do **not** document specific inline tags for the model output, and there's no `style` field on `session.update`. **Unconfirmed in docs as of 2026-04-29** — likely the model picks up emotional cues from the system prompt itself rather than from inline tags, will need to test live.

Source: [Voice Agent API docs](https://docs.x.ai/developers/model-capabilities/audio/voice-agent), [TTS docs](https://docs.x.ai/developers/model-capabilities/audio/text-to-speech).

---

## E. Transcripts (CRITICAL — needed for post-call scoring)

### E12. Are per-turn transcripts exposed?

**Yes — live, over the WebSocket.** No webhook, no separate REST GET.

### E13. How to capture them

Two streams of events on the same socket:

**Assistant (model) audio transcript — incremental:**
- `response.output_audio_transcript.delta` — payload includes `delta` (string chunk), `response_id`, `item_id`. Append `delta`s in order.
- `response.output_audio_transcript.done` — final text for that response item.
- `response.text.delta` — text-only modality deltas (xAI's name; OpenAI calls this `response.output_text.delta`).
- `response.done` — whole response is complete.

**User (caller) audio transcript:**
- `input_audio_buffer.speech_started` / `..speech_stopped` — VAD edges.
- `input_audio_buffer.committed` — buffer flushed to the model.
- `conversation.item.added` — server emits the user item with the transcript inside `item.content[i].transcript` when `content[i].type === "input_audio"`. The cookbook reads it from this event (see `App.tsx`).
- `conversation.item.input_audio_transcription.completed` — emitted once with the final user transcript. xAI uses `completed` for both partial and final (no `.delta` event).

**Shape (synthesized example based on docs + cookbook usage):**

```json
// Assistant delta
{
  "type": "response.output_audio_transcript.delta",
  "response_id": "resp_...",
  "item_id": "item_...",
  "output_index": 0,
  "delta": "Sure, I can help with that."
}

// User finalized
{
  "type": "conversation.item.input_audio_transcription.completed",
  "item_id": "item_...",
  "content_index": 0,
  "transcript": "Hey, can you tell me about pricing?"
}
```

Timestamps are not first-class fields on these events; capture client-side `Date.now()` per delta if you need them. The non-realtime `/v1/stt` endpoint *does* return word-level `start`/`end` floats, but that's a separate API.

For our scoring backend: accumulate `transcript` per turn in the browser into a `[{role, text, t}]` array and POST to a Netlify Function on `response.done` or call-end.

Sources: [Voice REST API reference](https://docs.x.ai/developers/rest-api-reference/inference/voice), [xai-cookbook App.tsx](https://github.com/xai-org/xai-cookbook/blob/main/voice-examples/agent/web/client/src/App.tsx).

### E14. If no native transcript / fallback

N/A — native transcripts are emitted. If they ever fail, you can pipe captured user audio chunks through `POST /v1/stt` after the call.

---

## F. Models

### F15. Model(s) backing the Voice Agent API

Selectable via `?model=` on the WebSocket URL or via `session.model` in the `client_secrets` request:

- `grok-voice-think-fast-1.0` — current flagship, launched 2026-04-25. Tops τ-voice Bench at 67.3%. Reasoning happens "in the background" with no extra latency. **Use this.**
- `grok-voice-fast-1.0` — legacy/default if no `model` param is passed; effectively deprecated. Avoid.

The text-LLM Grok models (`grok-4.20-*`) are **not** the voice models — those are for chat completions, used by LiveKit's chat plugin path.

Sources: [Grok Voice Think Fast 1.0 launch post](https://x.ai/news/grok-voice-think-fast-1), [MarkTechPost coverage](https://www.marktechpost.com/2026/04/25/xai-launches-grok-voice-think-fast-1-0-topping-%CF%84-voice-bench-at-67-3-outperforming-gemini-gpt-realtime-and-more/).

---

## G. Pricing / quota

### G16. Pricing

- **$0.05 per minute of audio** (~$3/hour) on `grok-voice-think-fast-1.0`. Flat rate, no separate token billing for the audio model itself. Confirmed in third-party coverage; xAI's `developers/models` pricing page does not yet break out a Voice API row, so cross-reference before scaling.
- **Tool calls billed separately** (per LaoZhang AI's article, which mirrors xAI's tool pricing on the text models):
  - `web_search`: $5 / 1k calls
  - `x_search`: $5 / 1k calls
  - `code_execution`: $5 / 1k calls
  - `file_search` / Collections Search: $2.50 / 1k calls
- **Concurrent sessions:** 100 per team (per LaoZhang, **unconfirmed in xAI's first-party docs as of 2026-04-29**).
- **Max session duration:** 30 minutes (same caveat).
- **Free tier:** **Unconfirmed in docs** — xAI has historically offered API credits for new accounts, no explicit voice-specific free minute allotment is published. Will need to test live.
- **Region:** Currently `us-east-1` only (per LaoZhang).

For a public Netlify demo: gate with a backend rate limiter (the cookbook backend already includes `express-rate-limit` at 10 sessions/min/IP and 100 req/15min/IP — copy that). At $0.05/min an unbounded leak hurts fast.

Sources: [LaoZhang quickstart guide (April 2026)](https://blog.laozhang.ai/en/posts/grok-voice-agent-api), [Quasa coverage](https://quasa.io/media/grok-voice-think-fast-1-0-the-3-hour-voice-ai-that-s-about-to-replace-entire-call-centers).

---

## H. Compatibility caveats vs OpenAI Realtime

xAI advertises compatibility with the OpenAI Realtime API spec. Real differences flagged in the xAI docs:

**Renamed events**

- xAI: `response.text.delta` ⇄ OpenAI: `response.output_text.delta`.
- Audio transcript delta: xAI uses `response.output_audio_transcript.delta` (matches OpenAI's newer naming).

**Unsupported client events**

- `conversation.item.retrieve`
- `conversation.item.truncate`
- `output_audio_buffer.clear` (WebRTC/SIP only on OpenAI)

**Unsupported server events**

- `conversation.item.done`
- `conversation.item.input_audio_transcription.delta` — xAI emits only `.completed`.
- `conversation.item.input_audio_transcription.failed`
- `conversation.item.input_audio_transcription.segment`
- `conversation.item.retrieved`
- `conversation.item.truncated`
- `input_audio_buffer.dtmf_event_received` (SIP only)
- `input_audio_buffer.timeout_triggered`
- `output_audio_buffer.started` / `.stopped` / `.cleared` (WebRTC/SIP only on OpenAI)
- `rate_limits.updated`

**Tool calling differences**

- Native server-side tool types: `web_search`, `x_search`, `file_search` (Collections), `mcp` (MCP servers), and custom `function`. Function-call flow is the same as OpenAI's: `response.function_call_arguments.done` → `conversation.item.create` with `function_call_output` → `response.create`.
- "Parallel tool calls" caveat from xAI docs: **all** function call results must be returned before emitting `response.create`.

**Session config gotcha**

- The `client_secrets` endpoint does not accept the full OpenAI-style `session` object. Send `session.update` over the WebSocket after open. Persona, voice, tools, audio format all go there.

Source: [Voice Agent API docs](https://docs.x.ai/developers/model-capabilities/audio/voice-agent).

---

## I. Working code sample

### I18. Reference snippet — from xai-cookbook (verbatim)

The xAI cookbook ships a React + TypeScript browser client and a Node.js token-minting backend. Both are MIT-style example code, verbatim below. Repo root: [`xai-org/xai-cookbook/voice-examples/agent/web/`](https://github.com/xai-org/xai-cookbook/tree/main/voice-examples/agent/web).

#### REFERENCE SNIPPET — Node.js backend, ephemeral token endpoint (from docs, verbatim)

File: [`voice-examples/agent/web/xai/backend-nodejs/src/index.ts`](https://github.com/xai-org/xai-cookbook/blob/main/voice-examples/agent/web/xai/backend-nodejs/src/index.ts)

```ts
/**
 * XAI Voice Web Backend - Node.js
 *
 * Express server that provides ephemeral tokens for direct client-to-XAI connections.
 */

import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";

const app = express();

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:5173,http://localhost:8080").split(",");

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

const sessionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many session creation requests, please try again later.'
});

const XAI_API_KEY = process.env.XAI_API_KEY || "";
const PORT = process.env.PORT || "8000";
const INSTRUCTIONS = process.env.INSTRUCTIONS || "You are a helpful voice assistant. You are speaking to a user in real-time over audio. Keep your responses conversational and concise since they will be spoken aloud.";
const VOICE = process.env.VOICE || "ara";

app.post("/session", sessionLimiter, async (req, res) => {
  try {
    const SESSION_REQUEST_URL = "https://api.x.ai/v1/realtime/client_secrets";
    const response = await fetch(SESSION_REQUEST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expires_after: { seconds: 300 }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "Failed to create session",
        details: errorText
      });
    }

    const data = await response.json() as { value: string; expires_at: number };

    res.json({
      client_secret: {
        value: data.value,
        expires_at: data.expires_at,
      },
      voice: VOICE,
      instructions: INSTRUCTIONS,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create session",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

For Netlify Functions, port the body of the `/session` handler into a function file (`netlify/functions/session.ts`) — same `fetch` to `client_secrets`, same response shape. Keep the `sessionLimiter` (or use Netlify's built-in rate-limiting headers / a Redis-backed limiter).

#### REFERENCE SNIPPET — Browser WebSocket connect (from docs, verbatim)

File: [`voice-examples/agent/web/client/src/hooks/useWebSocket.ts`](https://github.com/xai-org/xai-cookbook/blob/main/voice-examples/agent/web/client/src/hooks/useWebSocket.ts) (excerpted to the connect path)

```ts
const XAI_REALTIME_URL = "wss://api.x.ai/v1/realtime";

// 1. Mint ephemeral token via backend
const response = await fetch(`${API_BASE_URL}/session`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
});
const data = await response.json();
const ephemeralToken = data.client_secret.value;

// 2. Open WebSocket using OpenAI-compatible subprotocol
const ws = new WebSocket(XAI_REALTIME_URL, [
  "realtime",
  `openai-insecure-api-key.${ephemeralToken}`,
  "openai-beta.realtime-v1",
]);

// 3. On `conversation.created`, send session.update with persona/voice/audio
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === "conversation.created") {
    ws.send(JSON.stringify({
      type: "session.update",
      session: {
        instructions: data.instructions,
        voice: data.voice,
        audio: {
          input:  { format: { type: "audio/pcm", rate: sampleRate } },
          output: { format: { type: "audio/pcm", rate: sampleRate } },
        },
        turn_detection: { type: "server_vad" },
      },
    }));
  }

  if (message.type === "session.updated") {
    // 4. Optionally kick off the call with an opening message
    ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
    ws.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: "Say hello and introduce yourself" }],
      },
    }));
    ws.send(JSON.stringify({ type: "response.create" }));
  }

  // 5. Handle audio + transcript streams
  if (message.type === "response.output_audio.delta") {
    playAudio(message.delta); // base64 PCM16
  }
  if (message.type === "response.output_audio_transcript.delta") {
    // Assistant transcript chunk
  }
  if (message.type === "conversation.item.added") {
    // Look inside item.content[i].transcript for user transcript
  }
};
```

The full hook handles audio capture (`getUserMedia` → `AudioContext` at native sample rate → PCM16 → base64 → `input_audio_buffer.append`), playback, interruption (stop playback on `input_audio_buffer.speech_started`), and reconnect.

#### REFERENCE SNIPPET — Server-side WebSocket from xAI docs (Python and Node, verbatim)

File: from the [Voice Agent API docs](https://docs.x.ai/developers/model-capabilities/audio/voice-agent) (used when running entirely backend-side, with the long-lived API key).

```python
import asyncio, json, os, websockets

async def voice_agent():
    async with websockets.connect(
        "wss://api.x.ai/v1/realtime?model=grok-voice-think-fast-1.0",
        additional_headers={"Authorization": f"Bearer {os.environ['XAI_API_KEY']}"}
    ) as ws:
        await ws.send(json.dumps({
            "type": "session.update",
            "session": {
                "voice": "eve",
                "instructions": "You are a helpful assistant.",
                "turn_detection": {"type": "server_vad"}
            }
        }))
        await ws.send(json.dumps({
            "type": "conversation.item.create",
            "item": {"type": "message", "role": "user",
                     "content": [{"type": "input_text", "text": "Hello!"}]}
        }))
        await ws.send(json.dumps({"type": "response.create"}))
        async for msg in ws:
            event = json.loads(msg)
            print(f"Event: {event['type']}")

asyncio.run(voice_agent())
```

```javascript
import WebSocket from "ws";

const ws = new WebSocket("wss://api.x.ai/v1/realtime?model=grok-voice-think-fast-1.0", {
  headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}` },
});

ws.on("open", () => {
  ws.send(JSON.stringify({
    type: "session.update",
    session: {
      voice: "eve",
      instructions: "You are a helpful assistant.",
      turn_detection: { type: "server_vad" }
    }
  }));
  ws.send(JSON.stringify({
    type: "conversation.item.create",
    item: { type: "message", role: "user",
            content: [{ type: "input_text", text: "Hello!" }] }
  }));
  ws.send(JSON.stringify({ type: "response.create" }));
});

ws.on("message", (data) => {
  const event = JSON.parse(data);
  console.log("Event:", event.type);
});
```

These two run server-side with the long-lived API key in an `Authorization` header. They only matter if we want a backend agent (e.g., for Twilio); the browser path uses the cookbook flow above.

---

## J. Webhook for call-ended

### J19. Does xAI fire a call-ended webhook?

**No.** The Voice Agent API is a single bidirectional WebSocket — there is no documented call-ended webhook, no transcript pull endpoint, no separate session record retrievable via REST. End-of-call cleanup is entirely client-side.

**Recommended pattern for our scoring backend:**

1. Browser maintains a `turns: [{ role, text, t }]` array, populated from `response.output_audio_transcript.delta` (assistant) and `conversation.item.added` / `conversation.item.input_audio_transcription.completed` (user).
2. On user-pressed "End call" (or browser `beforeunload`), browser POSTs `{ session_id, turns, started_at, ended_at }` to a Netlify Function (e.g. `netlify/functions/score`).
3. Backend stores raw transcript, then calls Grok-4.x text completion with our scoring rubric to produce the post-call review.
4. Persistence: short-lived (24h?) blob in Netlify Blobs or whichever store we standardize on.

Use `navigator.sendBeacon` or `fetch(..., { keepalive: true })` for the unload path so the POST survives tab close.

Source: [Voice REST API reference](https://docs.x.ai/developers/rest-api-reference/inference/voice) — no webhook/REST transcript retrieval listed.

---

## Citations / source URLs

- [xAI — Grok Voice Agent API announcement](https://x.ai/news/grok-voice-agent-api)
- [xAI — Grok Voice Think Fast 1.0 launch (2026-04-25)](https://x.ai/news/grok-voice-think-fast-1)
- [xAI — Voice landing page](https://x.ai/api/voice)
- [xAI Docs — Voice APIs overview](https://docs.x.ai/developers/model-capabilities/audio/voice)
- [xAI Docs — Voice Agent API](https://docs.x.ai/developers/model-capabilities/audio/voice-agent)
- [xAI Docs — Ephemeral Tokens](https://docs.x.ai/developers/model-capabilities/audio/ephemeral-tokens)
- [xAI Docs — Voice REST API reference](https://docs.x.ai/developers/rest-api-reference/inference/voice)
- [xAI Docs — Models and Pricing](https://docs.x.ai/developers/models)
- [GitHub — xai-org/xai-cookbook (web voice example)](https://github.com/xai-org/xai-cookbook/tree/main/voice-examples/agent/web)
- [LiveKit — xAI LLM plugin](https://docs.livekit.io/agents/integrations/llm/xai/)
- [LiveKit — xAI Realtime plugin](https://docs.livekit.io/agents/models/realtime/plugins/xai/)
- [DataCamp — Grok Voice Agent API tutorial](https://www.datacamp.com/tutorial/grok-voice-agent-api)
- [LaoZhang AI — Endpoint, Pricing, Quickstart guide (April 2026)](https://blog.laozhang.ai/en/posts/grok-voice-agent-api)
- [MarkTechPost — grok-voice-think-fast-1.0 launch coverage](https://www.marktechpost.com/2026/04/25/xai-launches-grok-voice-think-fast-1-0-topping-%CF%84-voice-bench-at-67-3-outperforming-gemini-gpt-realtime-and-more/)
- [Quasa — pricing coverage](https://quasa.io/media/grok-voice-think-fast-1-0-the-3-hour-voice-ai-that-s-about-to-replace-entire-call-centers)
