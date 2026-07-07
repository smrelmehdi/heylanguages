# HeyYusuf Audio QA

## Rule
If a phrase fails TTS twice, replace it with a simpler natural Arabic phrase instead of spending more time tuning it.

## Priority
1. Onboarding
2. Basic Words
3. Greetings
4. Café
5. First quiz audio
6. Taxi / Directions
7. Later lessons

## Issues

| Section | Item | Arabic shown | Issue | Decision | Status |
|---|---:|---|---|---|---|
| Greetings | 12 | مع السلامة | TTS says maa salamati / maa salamhoo | Replace with بالسلامة | Pending regen |
| Greetings | 15 | إن شاء الله | rushed/repeated | audioText steering fixed | Done |
| Café | 17 | تسلم | TTS failed repeatedly | Replaced with مشكور | Done |
| Café | 19 | إي، بكم؟ | too fast/wrong | Replaced with إي نعم، بكم؟ | Done |
