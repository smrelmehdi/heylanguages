# HeyYusuf — Arabic Letter Tracing Feature Spec (Post-Launch)

## Overview

Teach users to write Arabic by tracing letters on screen with finger input. Integrated into the learning journey — not a standalone module but connected to lessons and scenarios the user has already completed.

---

## Learning Progression

### Phase 1: Isolated Letters (28 letters)
- Learn each letter's basic shape in isolation
- Grouped by visual similarity (6 groups):
  - Group 1: ب ت ث ن ي (base shape + dots vary)
  - Group 2: ج ح خ (cup shape)
  - Group 3: د ذ (simple curve)
  - Group 4: ر ز (descender)
  - Group 5: س ش ص ض (teeth shapes)
  - Group 6: ط ظ ع غ ف ق ك ل م ه و ا (remaining unique shapes)
- Each group = 1 "writing lesson" in the app

### Phase 2: Connected Forms
- Each letter has 4 forms: isolated, initial, medial, final
- Teach how letters connect in words
- Show animated connection between letters
- Practice tracing 2-3 letter combinations

### Phase 3: Trace Full Words
- Words from lessons the user already completed
- "You learned قهوة (coffee) — now write it"
- Trace the full connected word
- Links writing practice to existing vocab

---

## UX Flow

### Tracing Screen Layout
- Top: letter name (Arabic + English + transliteration), progress bar
- Center: large canvas area with grey letter outline
- Numbered dots showing stroke order (1, 2, 3...)
- Arrow indicators showing stroke direction (right-to-left for most)
- Bottom: "Show me" button (animates the stroke), "Try again" button, "Next" button

### User Interaction
1. Screen shows grey letter outline with numbered stroke guides
2. "Show me" button plays an animation of the correct stroke order
3. User traces with finger on the canvas
4. Real-time visual feedback:
   - Green trail: on the correct path
   - Yellow trail: close but drifting
   - Red trail: off path
5. After completing all strokes:
   - Star rating (1-3 stars based on accuracy)
   - +5 XP per letter, +10 XP for 3 stars
   - Option to retry or continue

### Stroke Order Rules (Arabic-specific)
- Main body drawn right-to-left
- Dots (nuqat) added after the main stroke
- Diacritics added last
- Connected letters: right-to-left flow, lift pen between disconnected segments

---

## Technical Architecture

### Drawing Engine
- Library: react-native-skia (preferred) or @shopify/react-native-skia
- Alternative: react-native-svg + PanResponder for simpler implementation
- Canvas captures touch points at 60fps

### Letter Data Format
```typescript
interface ArabicLetter {
  id: string;
  character: string;           // 'ب'
  name: string;                // 'Ba'
  nameArabic: string;          // 'باء'
  group: number;               // 1-6
  forms: {
    isolated: LetterForm;
    initial: LetterForm;
    medial: LetterForm;
    final: LetterForm;
  };
}

interface LetterForm {
  svgPath: string;             // SVG path data for the outline
  strokes: Stroke[];           // Ordered array of strokes
  width: number;
  height: number;
}

interface Stroke {
  order: number;               // 1, 2, 3...
  type: 'main' | 'dot' | 'diacritic';
  path: Point[];               // Array of {x, y} points defining the stroke
  direction: 'rtl' | 'ltr' | 'up' | 'down';
  startPoint: Point;
  endPoint: Point;
}
```

### Accuracy Scoring
- Sample user's drawn points along the path
- Compare against template stroke path
- Calculate average distance from ideal path
- Scoring thresholds:
  - 3 stars: average distance < 10px
  - 2 stars: average distance < 20px
  - 1 star: average distance < 35px
  - Fail: average distance ≥ 35px (retry prompt)
- Also check stroke order: did user draw strokes in correct sequence?

### SVG Letter Paths
Options for sourcing:
1. **Open source**: Look for Arabic calligraphy SVG datasets (Google Noto Arabic has path data)
2. **Generate**: Use an Arabic font, extract SVG paths programmatically
3. **Commission**: Hire a calligrapher to create stroke-order SVGs (most accurate but expensive)
4. **AI-assisted**: Use font path data + manually annotate stroke order and direction

---

## Integration with Existing App

### Home Screen Placement
- New "Unit 3: Write Arabic" section below Unit 2
- Or: "Writing" tab alongside Learn, Chat, Profile
- Or: Writing practice unlocks within each lesson (most integrated approach)

### Recommended: Integrated Approach
After completing a flashcard lesson:
- "Want to learn to write these words?" prompt
- Opens writing practice for the letters in that lesson's vocab
- Example: After "Basic Words" lesson → trace the letters that appear in كويس، شوية، دلوقتي

### XP Integration
- +5 XP per letter traced (any stars)
- +10 XP for 3-star trace
- +25 XP for completing a letter group
- +50 XP for tracing a full word correctly
- Counts toward daily streak

### Dialect Independence
- Arabic script is the same across all dialects
- Writing lessons are shared content — no need for dialect-specific versions
- Words used in Phase 3 (word tracing) come from the user's selected dialect

---

## Content Scope

| Phase | Items | Effort |
|-------|-------|--------|
| Phase 1: Isolated letters | 28 letters × 1 form = 28 SVG paths + stroke data | 1-2 weeks |
| Phase 2: Connected forms | 28 letters × 3 forms = 84 SVG paths + stroke data | 2-3 weeks |
| Phase 3: Word tracing | ~50 words from Unit 1 vocab | 1 week |

Total estimated effort: 4-6 weeks

---

## MVP vs Full Version

### MVP (ship first)
- Phase 1 only: 28 isolated letters
- 6 letter group lessons
- Basic accuracy scoring (path distance only, no stroke order check)
- Simple green/red feedback
- PanResponder + react-native-svg (simpler than Skia)

### Full Version (iterate)
- All 3 phases
- Stroke order validation
- Animated "show me" demonstrations
- Word tracing connected to lesson vocab
- Skia for smoother drawing experience
- Haptic feedback on correct completion

---

## Viral Potential

Screen recordings of Arabic letter tracing are visually satisfying — potential TikTok/Reels content:
- Timelapse of tracing the full alphabet
- "I learned to write Arabic in 30 days" challenge
- Side-by-side: first attempt vs after practice
- Add sharing: "Share your trace" exports an image of the traced letter with score

---

## Open Questions

- [ ] Source for stroke-order SVG data — open source or commission?
- [ ] Skia vs SVG+PanResponder — performance testing needed
- [ ] Should letters teach Naskh (print) or Ruq'ah (handwriting) style?
- [ ] How forgiving should accuracy be? Too strict = frustrating, too loose = no learning
- [ ] Should there be a "free draw" sandbox mode for practice?

---

## References

- Duolingo's character writing (Japanese/Chinese) for UX reference
- Google Noto Naskh Arabic font (potential SVG path source)
- Arabic Calligraphy stroke order guides
- react-native-skia documentation
