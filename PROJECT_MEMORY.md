# HeyYusuf — Project Memory
Last updated: March 23, 2026

---

## 🧠 Project Overview
**App:** HeyYusuf AR — Gulf Arabic learning app
**Company:** HeyLanguages Ltd (UK), heylanguages.com
**Developer:** El Mehdi Smerjel (Mehdi), Dubai-based freelancer
**Stack:** React Native + Expo, Supabase, Claude API, ElevenLabs TTS
**Project folder:** HeyYusuf-copy (new design, connected to existing Supabase DB)

---

## 🎨 Design System
- **Primary:** Teal `#00897B`
- **Background:** `#0A0A0A`
- **Cards:** `#111` / `#161616` / `#1A1A1A`
- **Card borders:** `0.5px solid #1e1e1e` or `#2a2a2a`
- **Success/correct:** Green `#00732F`
- **Error:** `#E24B4A`
- **Sand accent:** `#F5E6D0`
- **White text:** `#FFFFFF`
- **Muted text:** `#555` / `#888`
- **App icon:** Hey! speech bubble, teal gradient, dark bg

---

## 🗄️ Supabase
**URL:** fbuctddvwmcdyycyxlrq.supabase.co

### Tables:
- **users:** id, email, level, dialect, onboarding_completed, streak_count, last_active
- **conversations:** id, user_id, scenario, dialect, level, status, score, xp_earned, phrases_completed, phrases_total, started_at, completed_at
- **messages:** id, conversation_id, role, arabic_text, transliteration, translation, pronunciation_score, hints_used
- **learned_words:** id, user_id, arabic_word, transliteration, translation, dialect, times_seen, times_correct, difficulty, next_review
- **scenario_progress:** id, user_id, scenario, dialect, completed, best_score, attempts

---

## 📁 File Structure
```
app/
  _layout.tsx          — auth routing, session management
  index.tsx            — onboarding wizard (7 steps)
  login.tsx            — login/signup screen
  scenario.tsx         — conversation screen (café)
  chat.tsx             — free chat with Yusuf
  modal.tsx
  (tabs)/
    _layout.tsx        — tab bar (Learn, Chat, Profile)
    index.tsx          — home screen
    chat.tsx           — chat tab
    profile.tsx        — profile/settings screen

assets/
  images/
    icon.png           — app icon (Hey! speech bubble)
    adaptive-icon.png  — Android icon
    yusuf-welcome.png
    yusuf-presenting.png
    yusuf-pointing.png
    yusuf-excited.png
    yusuf-teaching.png
  audio/
    cafe/              — 24 pre-generated MP3s (w1-w12, u1-u12)

utils/
  supabase.ts          — Supabase client (AsyncStorage session)
  tts.ts               — ElevenLabs TTS (speakArabic, playLocalAudio, stopAudio)

scripts/
  generate-audio.ts    — pre-generates café audio files
```

---

## 🔐 Auth & Routing
### Routing matrix (_layout.tsx):
| Condition | Route |
|-----------|-------|
| Session + onboarding_completed = true | /(tabs) |
| Session + onboarding_completed = false | / (wizard) |
| No session + wizard_complete = 'true' (AsyncStorage) | /(tabs) |
| No session + no wizard data | / (wizard) |

### Wizard (index.tsx) — 7 steps:
1. Intro — "Assalamu alaykum, I'm Yusuf"
2. Name input
3. Level picker (Beginner/Intermediate/Advanced)
4. Dialect picker (Gulf/Egyptian/MSA/Levantine)
5. Reason picker (Travel/Family/Career)
6. Mic — say "Salam" (hardcoded feedback)
7. Final — "Create Account" or "Continue as Guest"

### On wizard completion:
- Saves to AsyncStorage: wizard_complete, wizard_name, wizard_dialect, wizard_level
- "Create Account" → /login → after auth, reads AsyncStorage → updates users table

---

## 🎙️ ElevenLabs TTS
- **Voice:** Sultan (Gulf Arabic male) — ID: `rUaPbzcZIu8df8iNL9WZ`
- **Model:** `eleven_multilingual_v2`
- **Plan:** Starter ($5/mo)
- **Key:** in .env as EXPO_PUBLIC_ELEVENLABS_API_KEY
- **Caching:** audioCache Map + FileSystem.cacheDirectory
- **Pre-generated:** 24 café MP3s in assets/audio/cafe/
- **Functions:** speakArabic(text), playLocalAudio(require), stopAudio()

---

## ☕ Café Scenario
**File:** app/scenario.tsx
**Dialogue:** 24 turns (12 waiter + 12 user) — Gulf Arabic
**Structure:**
- Part 1 (turns 1-8): Greetings
- Part 2 (turns 9-18): Ordering
- Part 3 (turns 19-24): Paying & goodbye

**Key phrases (Gulf dialect):**
- وش تبي؟ (wish tabi?) — What do you want?
- أبي قهوة (abi qahwa) — I want a coffee
- إيه، بكم؟ (ih, bikam?) — Yes, how much?

**On completion saves to:**
- conversations table (status: completed, xp_earned: 120)
- scenario_progress table (completed: true, best_score: 100)
- users table (last_active, streak_count incremented)

**Audio:** Local MP3s via playLocalAudio(), falls back to speakArabic()

---

## 🏠 Home Screen
**File:** app/(tabs)/index.tsx
**Data:** useFocusEffect refreshes on every visit

### Sections:
1. Header — "Ahlan, {name}!" + streak + XP pills
2. Daily Quest — hardcoded "Speak for 5 minutes" (to be made real)
3. Free Chat with Yusuf card — teal border, routes to /chat
4. Yusuf's Rule card
5. Unit 1: First Words
   - Basic Words (auto-completed)
   - Common Greetings (auto-completed)
   - Introduce Yourself (auto-completed)
6. Unit 2: Real Life Situations
   - Café Ordering ✅ (built, routes to /scenario?type=Cafe)
   - Taxi Ride 🔒 (coming soon alert)
   - At the Mall 🔒
   - Airport 🔒

### Lesson status logic:
- completed: yellow check ✓
- current/unlocked: teal play button
- locked: gray lock icon
- Connectors between lessons: teal if lesson above is completed

---

## 💬 Chat with Yusuf
**File:** app/chat.tsx
**API:** Claude Haiku (claude-haiku-4-5-20251001)
**System prompt:** Gulf Arabic tutor, warm/funny personality
**Response format:** JSON {arabic, transliteration, english, note}
**TTS:** Auto-speaks Arabic after 1 second, replay button on each bubble
**Status:** Free for all users during test period
**Quick chips:** Teach me a greeting, How do I order food, Teach me a number, Surprise me, Correct my Arabic

---

## 👤 Profile Screen
**File:** app/(tabs)/profile.tsx
### Features:
- Avatar with initial + name + level + dialect
- Stats: streak, XP, scenarios completed
- Dialect selector (Gulf/Egyptian/MSA/Levantine) — updates DB
- Redo wizard button
- Logout button (with confirmation)
- "HeyYusuf v1.0.0 · Made with ❤️ in Dubai"

---

## 🎭 Yusuf Character
**Current:** Female Lottie placeholder (teacher.json) — NEEDS REPLACEMENT
**Assets available:** 5 PNG poses (welcome, presenting, pointing, excited, teaching)
**Freelancer:** Rehman Javed — building Gulf Arab male Lottie
  - Phase 1: Waving + smiling + idle ($15) — in progress
  - Phase 2 (if good): Talking + Happy + Thinking ($30-40)
  - Phase 3: Pointing + Teaching ($20)
**Lottie frame segments needed:**
  - Idle: frames 0-60
  - Talking: frames 61-90
  - Happy: frames 91-120
  - Thinking: frames 121-180

---

## 💰 Business Model
- **Price:** $9.99/mo (decided, not yet implemented)
- **Lifetime deal:** $79 (for launch)
- **Free tier:** Limited (to be implemented)
- **Costs:** ~$15/mo fixed (ElevenLabs + Apple Dev + Google Play)
- **Break even:** 2 paying users

---

## 📱 Build & Deploy
- **Bundle ID (iOS):** com.heylanguages.heyyusuf
- **Package (Android):** com.heylanguages.heyyusuf
- **Version:** 1.0.0
- **Android testing:** EAS build + Expo tunnel (`npx expo start --tunnel`)
- **iOS:** Not yet on TestFlight

---

## 🗺️ HeyLanguages Suite
| App | Language | Color | Status |
|-----|----------|-------|--------|
| HeyYusuf | Arabic (Gulf) | Teal #00897B | In development |
| HeyCarlos | Spanish | Blue | Planned |
| HeyPierre | French | Green | Planned |
| HeyKemal | Turkish | Red | Planned |
| HeyMarco | Italian | Yellow | Planned |

---

## ✅ Done
- Auth + routing (login, signup, guest mode, wizard once)
- Wizard — 7 steps, dialect picker, saves to DB
- Home screen — real data, lesson rows, unit structure
- Café scenario — 24 turns, Gulf Arabic, local audio
- Completion screen — saves to Supabase
- Chat with Yusuf — Claude API + ElevenLabs TTS
- Profile screen — stats, dialect selector, logout
- App icon — Hey! speech bubble
- Android tested via Expo tunnel

## 🔜 Next Up
1. Taxi scenario (reuse conversation screen)
2. Node path animation (Duolingo-style)
3. Yusuf Lottie replacement (waiting for Rehman)
4. Daily quest — real tracking
5. TestFlight build
6. Pronunciation scoring (mic → Claude grades)
7. Paywall / subscription (RevenueCat)
8. learned_words saving from chat
