# Y22 AI — Demo Research Brief

Job target: **Founding AI Engineer (Part-Time) — Prompt Engineering & LLM Applications**, [LinkedIn job 4405106487](https://www.linkedin.com/jobs/view/4405106487), Prosper TX, equity for first 6 months convertible to paid.

## 1. Company profile

Y22 AI is a sales-training platform that "analyzes real sales calls to uncover what your best reps do differently — then trains your team to execute those behaviors through AI buyer simulations" ([y22.ai](https://y22.ai/)). Three product surfaces visible from the LinkedIn page and snippets ([linkedin.com/company/y22-ai](https://www.linkedin.com/company/y22-ai)):

- **AI roleplay simulations** customized to the customer's ICP.
- **Whisper** — a real-time in-call sales assistant.
- **Automated call scoring** against a proprietary **28-point behavioral framework** that compares winning vs. lost deals.

Stage / size signals:
- 2–10 employees, ~4 surfaced on LinkedIn ([linkedin.com/company/y22-ai](https://www.linkedin.com/company/y22-ai)).
- No funding round announced — unconfirmed; not in Crunchbase / TechCrunch search hits.
- HQ Prosper, TX per the job post ([job 4405106487](https://www.linkedin.com/jobs/view/4405106487)); founder lists Tampa FL on LinkedIn ([rocketreach.co/brandon-hurley](https://rocketreach.co/brandon-hurley-email_299168208)) — likely a remote/distributed setup.
- Industry: Software Development. Customer logos: none public — unconfirmed.
- The role being **part-time, equity-only for 6 months** is the strongest stage signal: pre-seed / bootstrapped, founder is hand-picking technical co-builders, not yet hiring full-time engineers.

## 2. Founder / likely interviewer

**Brandon Hurley** — Founder, Y22 AI (2025–) ([LinkedIn](https://www.linkedin.com/in/brandondhurley/), [RocketReach](https://rocketreach.co/brandon-hurley-email_299168208)).

Career arc:
- Penske Truck Leasing — Sales Rep, 2021–2023.
- The Prodigy Group — Founder, 2023– (sales recruiting / talent agency).
- Sales Society — Co-Founder, 2024– ("premium sales platform connecting verified sales talent with employers nationwide"; domain registered St. Louis MO) ([linkedin.com/company/gosalessociety](https://www.linkedin.com/company/gosalessociety), [whois gosalessociety.us](https://www.whois.com/whois/gosalessociety.us)).
- Glider — Partner, 2024–.
- Y22 AI — Founder, 2025–.
- Education: Missouri State University (2016–2021).
- Personal motto displayed on profile: **"I will not be outworked."**

Important framing: Hurley is **not a Brandon-Bornancin-style prior-exit founder**. He's a former carrier sales rep who built a sales-recruiting business, saw firsthand that reps don't get coached, and is using AI to productize what top performers actually do. The interviewer's mental model is "manager who watched too many bad reps fail" — not "ML researcher." Talk to that lived experience.

Co-founder / second name on the LinkedIn page: **Khalid Yousuf** — likely the technical counterpart (unconfirmed role).

Public vocabulary to mirror: "behaviors that drive deals," "winning vs. losing calls," "what top performers do differently," "reps actually want to use," "execute the behaviors" — all directly from y22.ai and the LinkedIn copy. He thinks in behaviors and reps, not in tokens and embeddings.

## 3. Competitor landscape (and who has shipped voice)

| Competitor | Focus | Voice / real-time in last 12 months? |
|---|---|---|
| **Hyperbound** | Outbound SDR roleplay, gamified | Audio-only roleplay shipped, but voice AI is still on the roadmap as "aspirational" per their own ecosystem coverage ([uhubs.ai writeup](https://www.uhubs.ai/post/how-this-viral-ai-hyperbound-company-is-reinventing-roleplay-practice), [hyperbound.ai](https://www.hyperbound.ai/)) |
| **Second Nature** | Onboarding, certification, avatars; 4.6/5 G2, 298 reviews ([outdoo.ai/blog/yoodli-alternatives](https://www.outdoo.ai/blog/yoodli-alternatives)) | Avatar-based, criticized as "scripted, not dynamic" ([outdoo.ai/blog/hyperbound-alternatives](https://www.outdoo.ai/blog/hyperbound-alternatives)) |
| **Yoodli** | Communication coaching; raised $40M Series B Dec 2025 ([yoodli.ai blog](https://yoodli.ai/blog/yoodli-raises-40-million-series-b-to-lead-the-future-of-experiential-learning), [GeekWire](https://www.geekwire.com/2025/ai-roleplay-startup-yoodli-raises-13-7m-to-help-sales-teams-practice-their-pitches/)) | Real-time delivery feedback (filler words, pace) but reviewers report **noticeable lag breaking conversational flow** ([outdoo.ai/blog/hyperbound-alternatives](https://www.outdoo.ai/blog/hyperbound-alternatives)) |
| **Pclub.io / Demodesk Coach / Gong roleplay / Salesloft / Outreach CI** | Adjacent CI + coaching | Roleplay is bolted onto CI; not the design center — unconfirmed any shipped low-latency voice roleplay |
| **Quantified, PitchMonster, Mindtickle, Sandler AI Coach** | Various | Avatar / scripted; no headline real-time voice launch in last 12 months |

**The opening:** no leading roleplay vendor has shipped a sub-1s, expressive, multilingual voice loop. xAI's [Grok Voice Agent API](https://x.ai/news/grok-voice-agent-api) launched **Dec 17, 2025** at $0.05/min with <1s time-to-first-audio, 100+ languages, mid-conversation language switching, OpenAI-Realtime-compatible, and direct audio-to-audio (no STT→LLM→TTS hop) ([DataCamp tutorial](https://www.datacamp.com/tutorial/grok-voice-agent-api), [Medium launch coverage](https://medium.com/@CherryZhouTech/xai-launches-grok-voice-agent-api-at-0-05-per-minute-6d0d6ddd553d)). Standalone Grok TTS landed Mar 16, 2026 with inline `[laugh]`/`<whisper>` tags; standalone STT Apr 18, 2026 ([MarkTechPost](https://www.marktechpost.com/2026/04/18/xai-launches-standalone-grok-speech-to-text-and-text-to-speech-apis-targeting-enterprise-voice-developers/), [basenor.com](https://www.basenor.com/blogs/news/xai-launches-grok-text-to-speech-api-5-voices-20-languages)). **A Grok-Voice-driven buyer persona is a thing no current Y22 competitor has in production.** That is the wedge.

## 4. Buyer pain themes

From G2 / Reddit / blog write-ups summarized in [outdoo.ai](https://www.outdoo.ai/blog/hyperbound-alternatives), [hyperbound.ai/blog](https://www.hyperbound.ai/blog/ai-sales-roleplay-tools-xcr5c), and [autointerviewai.com](https://www.autointerviewai.com/blog/ai-sales-simulators-vs-human-roleplay-win-rates-2026) (Reddit/G2 quotes; r/sales direct posts not surfaced — unconfirmed via direct link):

- **"Feels fake."** "People hate roleplays, they feel very fake and unrealistic" — most-cited rep complaint.
- **Robotic voice / lag.** "AI needs to get less robotic before it truly helps." Yoodli specifically called out for "noticeable lag while the AI processes."
- **Generic personas.** "Prospects often ask unexpected questions which it doesn't really handle well" — AI plateaus after ~2 minutes.
- **No objection variety.** Personas agree too much; can't push back like a real prospect.
- **Scoring without rigor.** Yoodli criticized as "delivery metrics king but limited evaluation of messaging quality or sales strategy."
- **No behavior change.** Managers complain about the gap between feedback and what reps actually do on the next live call.

Hurley's 28-point framework and Whisper feature are direct responses to #5 and #6. Tie the demo to those.

## 5. Tech stack signals

From the [JD](https://www.linkedin.com/jobs/view/4405106487):

- Python, LLMs (OpenAI / Anthropic / **Grok** explicitly named — match), structured outputs, prompt versioning + temperature optimization, eval workflows.
- RAG, embeddings, vector DBs.
- SQL, backend/API, Docker, AWS or GCP.
- Nice-to-have: **LangChain / LangGraph / LlamaIndex**, **voice AI and real-time conversation systems**, LoRA/PEFT fine-tuning, sales-tech experience.
- Application asks for GitHub + past LLM project summaries + weekly availability.

The mention of Grok in the JD alongside OpenAI/Anthropic is the green light. Build on Grok Voice Agent API and reference it explicitly.

## 6. The 30-second impress

**One screen: a live Grok-Voice roleplay where the rep is being scored against Y22's behavioral framework in real time, with a Whisper-style coaching ribbon below the call.**

The micro-interaction that wins:
1. Rep clicks "Roleplay: skeptical mid-market CFO, price objection variant."
2. Voice connects in <1s — Grok speaks first with an unhappy `<whisper>I've got 5 minutes</whisper>`-style opener (impossible on competitor stacks).
3. As the rep talks, **a 6-tile behavior scorecard** lights up live: *Discovery depth, Objection acknowledgement, Value framing, Multithreading, Next-step specificity, Talk-ratio*. Each tile flips green/yellow with a one-line LLM judge rationale streamed in.
4. When the rep fumbles, Whisper drops one line ("ask what changed in their budget cycle") — the rep can take it or ignore it.
5. End of call: 30-second auto-replay clipping the **one moment** the deal turned, with the framework citation.

Why this lands with Hurley specifically: it's not a tech demo — it's the manager-over-the-shoulder coaching moment he's been doing manually his whole sales career, instantiated. It speaks his vocabulary ("behaviors," "what top performers do," "the moment the deal turned"), uses the stack the JD called out (Grok + Python + RAG-backed framework), and exhibits the one capability no competitor has shipped: **expressive, sub-second, language-switching voice roleplay.** It also implies the rest of the platform (call ingestion, framework retrieval, scoring eval harness) without requiring you to build it.

Secondary flex if there's room: a second tab showing the **prompt-eval harness** — versioned persona prompts, golden objection set, regression scores per version. That directly answers the JD's "prompt testing, versioning, and temperature optimization" line and signals you understand prompts as software, not vibes.