# SignBridge AI

**Not everyone speaks with voice — but everyone deserves to be heard.**

AI-powered sign language translation web app for the **Yarl Geek Challenge Junior** (Digital Technology Solution). Helps hearing-impaired and speech-impaired users communicate via sign-to-text, text-to-speech, voice-to-text, emergency phrases, and learning tools.

## Tech stack

- **Next.js 16** · React 19 · TypeScript · Tailwind CSS v4
- **MediaPipe Hands** — real-time hand landmarks
- **TensorFlow.js** — modular gesture classifier (mock heuristics + TF.js hook)
- **ElevenLabs** — text-to-speech (server API route)
- **Neon Postgres** — database (users, translation history)
- **JWT sessions** — secure auth via API routes
- **WebRTC** — browser camera & Web Speech API for microphone

## Quick start

### 1. Install dependencies

```bash
npm install
npm install @tensorflow/tfjs   # optional; enables TF.js init in classifier
```

### 2. Environment variables

Copy the example file and fill in your keys:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string (pooled recommended) |
| `AUTH_SECRET` | Random secret for session cookies (min 16 chars) |
| `ELEVENLABS_API_KEY` | **Required** — TTS, STT, agent signing (server only, never public) |
| `ELEVENLABS_AGENT_ID` | Optional — Conversational AI agent (used with API key) |
| `ELEVENLABS_VOICE_ID` | Voice ID from ElevenLabs Voice Library |

Never commit `.env.local` or real API keys.

### 3. Neon setup

1. Create a project at [console.neon.tech](https://console.neon.tech).
2. Copy the **connection string** (use pooled connection for serverless).
3. Open the **SQL Editor** and run `neon/schema.sql`.
4. Add `DATABASE_URL` and `AUTH_SECRET` to `.env.local`.

```bash
# Generate AUTH_SECRET (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **HTTPS** or `localhost` for camera/microphone permissions.

```bash
npm run build   # production build
npm start       # run production server
```

## Folder structure

```
signbridge_ai/
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── page.tsx            # Landing page
│   │   ├── translator/         # Live sign translator
│   │   ├── voice/              # Voice-to-text
│   │   ├── emergency/          # Emergency phrases
│   │   ├── learn/              # Sign language lessons
│   │   ├── history/            # Translation history
│   │   ├── about/              # About & impact
│   │   ├── settings/           # User settings
│   │   ├── login/ signup/      # Auth pages
│   │   └── api/
│   │       ├── auth/           # Login, signup, session
│   │       ├── history/        # Translation CRUD
│   │       ├── tts/            # ElevenLabs proxy
│   │       └── health/         # API status check
│   ├── components/             # UI (layout, translator, auth, …)
│   ├── context/                # AppProvider (theme, language, auth)
│   ├── hooks/                  # useTextToSpeech
│   ├── lib/
│   │   ├── gestures/           # MediaPipe + classifier
│   │   ├── elevenlabs/         # TTS service
│   │   ├── db/                 # Neon client
│   │   ├── auth/               # Session helpers
│   │   └── history.ts          # Save/load translations
│   └── types/
├── neon/
│   └── schema.sql              # Postgres tables
├── .env.local.example
└── public/
```

## Pages & navigation

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, problem/solution, features, impact |
| Live Translator | `/translator` | Camera + gesture detection + TTS |
| Voice-to-Text | `/voice` | Microphone → large readable text |
| Emergency | `/emergency` | Quick phrases + audio |
| Learn | `/learn` | Lessons + camera practice |
| History | `/history` | Saved translations (Supabase or local) |
| About | `/about` | Impact & future roadmap |
| Settings | `/settings` | Theme, language, voice, API status |
| Auth | `/login`, `/signup` | Neon-backed auth + guest mode |

**Mobile:** bottom navigation · **Desktop:** sidebar (hidden on landing hero)

## Gesture detection (demo)

Sample gestures: `hello`, `thank_you`, `yes`, `no`, `help`, `stop`.

The classifier in `src/lib/gestures/gesture-classifier.ts` uses hand geometry heuristics for demos. Replace `classifyWithModel()` with a loaded `model.json` when you have a trained TensorFlow.js model.

## Guest mode

Users can **Continue as guest** without signing in. History is stored in `localStorage`. Logged-in users sync to Neon `translation_history`.

## Competition demo tips

1. Allow camera permission when prompted on `/translator`.
2. Show an open palm for **hello**, fist for **no**, spread fingers for **help**.
3. Configure ElevenLabs for premium speech; otherwise the app falls back to browser `speechSynthesis`.
4. Sign in once to demo cloud history sync.

## Future enhancements

- **Sinhala language** — UI, emergency phrases, gesture translations, and voice recognition
- Custom models for Sri Lankan sign language datasets
- Offline PWA support
- Real-time two-way chat between sign and voice users
- Admin dashboard for schools and hospitals
- Integration with messaging apps and wearables

## License

Built for educational competition use. Configure your own API keys before deployment.
