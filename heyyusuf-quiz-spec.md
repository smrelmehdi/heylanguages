# HeyYusuf AR — Unit 2 Quiz System Spec

## Overview

Mixed-format quizzes that test scenario vocabulary and comprehension. Each quiz has **18 questions** across 4 formats, shuffled so no two same formats appear back-to-back.

---

## Quiz Placement in Unit 2

```
1. Café Ordering
2. Taxi Ride
3. Hotel Check-in
→ Quiz Part 1 (covers scenarios 1-3)
4. Restaurant
5. Supermarket
6. Pharmacy
→ Quiz Part 2 (covers scenarios 4-6)
7. Barbershop
8. Airport
9. (TBD — 9th scenario added later)
→ Quiz Part 3 (added later with scenario 9)
```

---

## 4 Question Formats

### Format 1: Scene Replay (4 per quiz)
- **UI**: Scene image at top (reuse scenario entrance/interior images), audio auto-plays a Gulf Arabic phrase
- **Prompt**: "What is the correct response?"
- **Options**: 4 Arabic phrases with transliteration below each
- **Interaction**: Tap to select → green flash for correct, red shake for wrong
- **Assets needed**: Reuses existing scene images + pre-generated audio

### Format 2: Fill the Conversation (5 per quiz)
- **UI**: Chat-bubble style dialogue (Yusuf on left, NPC on right), one bubble is blank/highlighted
- **Prompt**: "Complete the conversation"
- **Options**: 3 Arabic phrases (one correct, two plausible distractors)
- **Interaction**: Tap option → it fills into the blank bubble → check animation
- **Visual**: Dark card background, speech bubbles in #1A1A1A with teal border for the blank

### Format 3: Listening Challenge (5 per quiz)
- **UI**: Large speaker/play button centered, teal accent
- **Prompt**: "What did you hear?"
- **Options**: 4 options showing Arabic + transliteration
- **Interaction**: Can replay audio up to 3 times, then pick answer
- **Audio**: Reuses pre-generated ElevenLabs MP3s from scenario audio folders

### Format 4: Emoji Match (4 per quiz)
- **UI**: Left column: 4 Arabic phrases. Right column: 4 emoji/icon groups (shuffled)
- **Prompt**: "Match each phrase to its meaning"
- **Interaction**: Tap left item → tap right item to connect. Lines draw between matches.
- **Scoring**: All 4 correct = full points. Partial = 0 (treat as one question)
- **Emoji examples**: ☕ = coffee, 🚕 = taxi, 🏨 = hotel, 💰 = price/money, 👋 = greeting

---

## Data Structure

```typescript
type QuizFormat = 'scene_replay' | 'fill_conversation' | 'listening' | 'emoji_match';

interface BaseQuestion {
  id: string;
  format: QuizFormat;
  scenarioSource: string; // which scenario this tests
  xpValue: number; // 10
}

interface SceneReplayQuestion extends BaseQuestion {
  format: 'scene_replay';
  sceneImage: ImageSourcePropType; // require('../assets/images/...')
  audioFile: string; // path to MP3
  prompt: string; // "What is the correct response?"
  options: {
    arabic: string;
    transliteration: string;
    isCorrect: boolean;
  }[];
}

interface FillConversationQuestion extends BaseQuestion {
  format: 'fill_conversation';
  dialogue: {
    speaker: 'yusuf' | 'npc';
    arabic: string;
    transliteration: string;
    isBlank: boolean; // true for the one to fill
  }[];
  options: {
    arabic: string;
    transliteration: string;
    isCorrect: boolean;
  }[];
}

interface ListeningQuestion extends BaseQuestion {
  format: 'listening';
  audioFile: string;
  options: {
    arabic: string;
    transliteration: string;
    isCorrect: boolean;
  }[];
}

interface EmojiMatchQuestion extends BaseQuestion {
  format: 'emoji_match';
  pairs: {
    arabic: string;
    transliteration: string;
    emoji: string; // emoji or icon name
  }[];
}

type QuizQuestion = SceneReplayQuestion | FillConversationQuestion | ListeningQuestion | EmojiMatchQuestion;
```

---

## Quiz Flow

### Sequence
1. **Intro screen**: "Quiz Part X" title, Yusuf Lottie (waving), "18 questions · ~5 min", Start button
2. **Progress bar**: Top of screen, fills left to right, shows "3/18"
3. **Question card**: Renders based on format type
4. **Feedback**: Correct → green flash + ✓ + haptic + "+10 XP" float animation. Wrong → red shake + ✗ + show correct answer for 2s
5. **Between questions**: 0.5s pause, slide transition to next
6. **Results screen**: Score circle (e.g. 16/18), XP earned, star rating (⭐⭐⭐ for 100%, ⭐⭐ for ≥78%, ⭐ for <78%), "Retry Missed" or "Continue" button

### Shuffle Rules
- Randomize question order each attempt
- Never place two same-format questions back-to-back
- Algorithm: shuffle all, then swap any adjacent same-format pairs

### Retry Logic
- Passing = 14/18 (≈78%)
- Below passing: show "Retry Missed Questions" button
- Retry only loads the questions answered incorrectly
- Retry preserves XP from correct answers (no double-counting)
- Can retry unlimited times until passing

### XP Rewards
- +10 XP per correct answer
- +50 XP bonus for perfect score (18/18)
- Max per quiz: 230 XP (180 + 50 bonus)
- XP awarded immediately after each correct answer (feel the dopamine)

---

## Design Specs

### Colors (existing design system)
- Background: `#0A0A0A`
- Card: `#111111` / `#1A1A1A`
- Accent/teal: `#00897B`
- Success/correct: `#00732F`
- Error/wrong: `#D32F2F`
- Text primary: `#FFFFFF`
- Text secondary: `#999999`
- Transliteration: `#CCCCCC` italic

### Layout
- Full screen, no tab bar during quiz (focus mode)
- Progress bar: 4px height, teal fill, top of screen below status bar
- Question area: centered, padded 20px horizontal
- Options: full-width rounded cards (borderRadius 12), 56px min height, stacked vertical with 10px gap
- Selected state: teal border (2px)
- Scene images: 100% width, 180px height, borderRadius 16, top of card

### Animations
- Card entrance: slide up + fade in (300ms)
- Correct answer: scale pulse 1.0→1.05→1.0 + green background flash
- Wrong answer: horizontal shake (translateX -10→10→-10→0)
- XP float: "+10 XP" text floats up and fades out (600ms)
- Progress bar: smooth width transition (200ms ease)
- Emoji match lines: animated draw (SVG or simple View connections)

### Audio
- Correct: short positive chime (can use expo-av or skip if no asset)
- Wrong: short error tone
- Scene Replay / Listening: play from pre-generated MP3s using existing playLocalAudio()

---

## Quiz Part 1 — Questions (Café, Taxi, Hotel)

### Scene Replay (4)

**Q1** — Café scene
- Image: dubai-cafe-interior.png
- Audio plays: "شو تبي تشرب؟" (Shu tabi tishrab? — What do you want to drink?)
- Options:
  - ✅ "أبي قهوة عربية" (Abi gahwa arabiya — I want Arabic coffee)
  - "وين الحمام؟" (Wain al-hammam? — Where's the bathroom?)
  - "كم الحساب؟" (Kam al-hisab? — How much is the bill?)
  - "أبي غرفة" (Abi ghurfa — I want a room)

**Q2** — Taxi scene
- Image: dubai-taxi-interior.png
- Audio plays: "وين تبي تروح؟" (Wain tabi trooh? — Where do you want to go?)
- Options:
  - ✅ "دبي مول لو سمحت" (Dubai Mall law samaht — Dubai Mall please)
  - "أبي قهوة" (Abi gahwa — I want coffee)
  - "كم الليلة؟" (Kam al-layla? — How much per night?)
  - "شكراً حبيبي" (Shukran habibi — Thanks dear)

**Q3** — Hotel scene
- Image: dubai-hotel-interior.png
- Audio plays: "عندك حجز؟" (Indak hajiz? — Do you have a reservation?)
- Options:
  - ✅ "إي عندي حجز" (Ee indi hajiz — Yes I have a reservation)
  - "أبي شاي" (Abi chai — I want tea)
  - "لا شكراً" (La shukran — No thanks)
  - "كم الأجرة؟" (Kam al-ujra? — How much is the fare?)

**Q4** — Café scene
- Image: dubai-cafe-entrance.png
- Audio plays: "تبي سكر؟" (Tabi sukkar? — Do you want sugar?)
- Options:
  - ✅ "شوية سكر" (Shwayya sukkar — A little sugar)
  - "غرفة لشخصين" (Ghurfa li-shakhsain — Room for two)
  - "وين المطار؟" (Wain al-matar? — Where's the airport?)
  - "بكم هذا؟" (Bikam hatha? — How much is this?)

### Fill the Conversation (5)

**Q5** — Café ordering
- Yusuf: "السلام عليكم" (As-salamu alaykum)
- Barista: "وعليكم السلام! شو تبي؟" (Wa alaykum as-salam! Shu tabi?)
- Yusuf: **[BLANK]**
- Options:
  - ✅ "أبي كرك لو سمحت" (Abi karak law samaht — I want karak please)
  - "وين دبي مول؟" (Wain Dubai Mall?)
  - "عندي حجز" (Indi hajiz — I have a reservation)

**Q6** — Taxi negotiation
- Yusuf: "السلام عليكم، أبي أروح المارينا" (Salaam, I want to go to Marina)
- Driver: "إن شاء الله. بس فيه زحمة هالحين" (Inshallah. But there's traffic now)
- Yusuf: **[BLANK]**
- Options:
  - ✅ "مافي مشكلة" (Mafi mushkila — No problem)
  - "أبي قهوة" (Abi gahwa — I want coffee)
  - "كم الليلة؟" (Kam al-layla? — How much per night?)

**Q7** — Hotel check-in
- Receptionist: "أهلاً وسهلاً! كيف أقدر أساعدك؟" (Welcome! How can I help?)
- Yusuf: **[BLANK]**
- Options:
  - ✅ "أبي أسوي تشيك إن" (Abi asawi check-in — I want to check in)
  - "كم الأجرة؟" (Kam al-ujra? — How much is the fare?)
  - "أبي كرك" (Abi karak — I want karak tea)

**Q8** — Café paying
- Yusuf: "كم الحساب؟" (How much is the bill?)
- Barista: "خمسة عشر درهم" (15 dirhams)
- Yusuf: **[BLANK]**
- Options:
  - ✅ "تفضل، شكراً" (Tafaddal, shukran — Here you go, thanks)
  - "وين الغرفة؟" (Wain al-ghurfa? — Where's the room?)
  - "أبي أنزل هني" (Abi anzil hini — I want to get off here)

**Q9** — Taxi arrival
- Driver: "وصلنا" (Wasalna — We arrived)
- Yusuf: **[BLANK]**
- Driver: "الله يسلمك" (Allah yisalmak — God keep you safe)
- Options:
  - ✅ "شكراً حبيبي، مع السلامة" (Shukran habibi, ma'a as-salama — Thanks, goodbye)
  - "أبي قهوة عربية" (Abi gahwa arabiya — I want Arabic coffee)
  - "عندك حجز؟" (Indak hajiz? — Do you have a reservation?)

### Listening Challenge (5)

**Q10** — Audio: "لو سمحت" (Law samaht)
- ✅ "لو سمحت" (Law samaht — Please)
- "إن شاء الله" (Inshallah — God willing)
- "ما شاء الله" (Mashallah — God has willed it)
- "الحمد لله" (Alhamdulillah — Praise God)

**Q11** — Audio: "كم الأجرة؟" (Kam al-ujra?)
- "وين الفندق؟" (Wain al-funduq? — Where's the hotel?)
- ✅ "كم الأجرة؟" (Kam al-ujra? — How much is the fare?)
- "شو تبي؟" (Shu tabi? — What do you want?)
- "كيف حالك؟" (Kaif halak? — How are you?)

**Q12** — Audio: "غرفة لشخصين" (Ghurfa li-shakhsain)
- "قهوة بدون سكر" (Gahwa bidoon sukkar — Coffee without sugar)
- "تاكسي للمطار" (Taxi lil-matar — Taxi to airport)
- ✅ "غرفة لشخصين" (Ghurfa li-shakhsain — Room for two)
- "الحساب لو سمحت" (Al-hisab law samaht — The bill please)

**Q13** — Audio: "إن شاء الله" (Inshallah)
- "مع السلامة" (Ma'a as-salama — Goodbye)
- "الحمد لله" (Alhamdulillah — Praise God)
- ✅ "إن شاء الله" (Inshallah — God willing)
- "لو سمحت" (Law samaht — Please)

**Q14** — Audio: "أبي كرك بهارات" (Abi karak baharat)
- "أبي قهوة عربية" (Abi gahwa arabiya — I want Arabic coffee)
- ✅ "أبي كرك بهارات" (Abi karak baharat — I want spiced karak)
- "أبي شاي أخضر" (Abi chai akhdar — I want green tea)
- "أبي ماي" (Abi mai — I want water)

### Emoji Match (4)

**Q15** — Café vocab
- ☕ → "قهوة" (Gahwa — Coffee)
- 🫖 → "كرك" (Karak — Karak tea)
- 🧁 → "كيكة" (Kaika — Cake)
- 💰 → "الحساب" (Al-hisab — The bill)

**Q16** — Taxi vocab
- 🚕 → "تاكسي" (Taxi)
- 📍 → "وين" (Wain — Where)
- 🚦 → "زحمة" (Zahma — Traffic)
- 👋 → "مع السلامة" (Ma'a as-salama — Goodbye)

**Q17** — Hotel vocab
- 🏨 → "فندق" (Funduq — Hotel)
- 🛏️ → "غرفة" (Ghurfa — Room)
- 🔑 → "مفتاح" (Miftah — Key)
- 📋 → "حجز" (Hajiz — Reservation)

**Q18** — Mixed common phrases
- ✅ → "إي" (Ee — Yes)
- ❌ → "لا" (La — No)
- 🙏 → "شكراً" (Shukran — Thank you)
- 🤲 → "لو سمحت" (Law samaht — Please)

---

## Quiz Part 2 — Questions (Restaurant, Supermarket, Pharmacy)

> Questions to be generated once scenarios 4-6 dialogue arrays are finalized and audio is generated. Same structure: 4 Scene Replay + 5 Fill Conversation + 5 Listening + 4 Emoji Match = 18 total.

---

## File Structure

```
app/
  quiz-unit2.tsx          — Main quiz screen (handles all 4 formats)
  components/
    quiz/
      SceneReplay.tsx     — Scene image + audio + 4 options
      FillConversation.tsx — Chat bubble dialogue + blank + 3 options  
      ListeningChallenge.tsx — Play button + 4 options
      EmojiMatch.tsx      — Drag/tap matching interface
      QuizProgress.tsx    — Top progress bar
      QuizResults.tsx     — Score screen with retry/continue
      QuizIntro.tsx       — Pre-quiz intro with Yusuf
data/
  quiz-part1.ts           — Question data for Quiz Part 1
  quiz-part2.ts           — Question data for Quiz Part 2
```

---

## Claude Code Prompt

```
Build the Unit 2 quiz system for HeyYusuf AR. Read this spec file and PROJECT_MEMORY.md for full context.

Create a new quiz screen at app/quiz-unit2.tsx that supports 4 question formats:

1. Scene Replay — show a scene image + auto-play audio, user picks correct response from 4 options
2. Fill the Conversation — chat-bubble dialogue with one blank, user picks from 3 options to fill it
3. Listening Challenge — play button for audio (replayable up to 3x), pick what was said from 4 options  
4. Emoji Match — match 4 Arabic phrases to 4 emojis by tapping pairs

Quiz structure:
- 18 questions per quiz, mixed formats (4 scene + 5 fill + 5 listening + 4 emoji)
- Shuffle questions but never place two same-format questions back-to-back
- Full screen focus mode (hide tab bar)
- Progress bar at top showing current/total

Flow: Intro screen → questions → results screen
- Intro: Quiz title, Yusuf Lottie waving, "18 questions", Start button
- Each question: show format-specific UI, tap to answer, green pulse for correct (+10 XP float), red shake for wrong (show correct for 2s), auto-advance after 0.5s
- Results: score circle, XP earned, stars (3 for 100%, 2 for ≥78%, 1 for <78%)
- Passing = 14/18. Below passing shows "Retry Missed" button that only replays wrong answers
- Perfect score bonus: +50 XP

Create question data in data/quiz-part1.ts with the exact questions from the spec.
Create placeholder data/quiz-part2.ts with the same structure (fill in after scenarios 4-6 are done).

Create component files in app/components/quiz/ for each format.

Design system: bg #0A0A0A, cards #111/#1A1A1A, accent #00897B, success #00732F, error #D32F2F, white text. Options are full-width rounded cards (borderRadius 12, 56px min height). Use existing playLocalAudio() from utils/tts.ts for audio playback.

Wire into the home screen at app/(tabs)/index.tsx — Quiz Part 1 appears after Hotel Check-in, Quiz Part 2 appears after Pharmacy. Use route params to select which quiz data to load.
```
