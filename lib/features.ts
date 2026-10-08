// Evidence and asset provenance: reports/features-audit.json.
// Keep these statements aligned with the visible Features page.
export const verifiedProductFeatures = [
  "Guided lessons and learning units",
  "Vocabulary with Arabic text, English meanings and pronunciation guides",
  "Guided conversations",
  "Arabic audio and pronunciation practice",
  "Voice recording and online pronunciation feedback",
  "Quizzes and challenges",
  "Arabic alphabet learning",
  "Illustrated learning scenarios",
  "Learning progress and a Continue activity",
  "Number and price practice",
] as const;

export const featureArtwork = {
  cafe: {
    src: "/product/features/first-cafe-conversation.png",
    width: 1536, height: 1024,
    alt: "HeyYusuf lesson illustration of Yusuf and a learner ordering drinks at a café counter",
    caption: "Lesson illustration from Your First Café Conversation: ordering drinks and responding to a server.",
  },
  clothes: {
    src: "/product/features/choose-with-yusuf.png",
    width: 1536, height: 1024,
    alt: "HeyYusuf lesson illustration of Yusuf holding a blue shirt while a learner considers what to wear",
    caption: "Lesson illustration from Choose with Yusuf: choosing a shirt and expressing a preference.",
  },
} as const;

// Unedited screenshots supplied by the owner from the current QA build.
// These are not asserted to represent the public Play Store build.
export const featureScreenshots = {
  home: {
    src: "/product/features/home-progress.jpeg", width: 826, height: 1599,
    alt: "HeyYusuf home screen showing Gulf Arabic, Intermediate level, 2730 XP and Continue Learning at 29%",
    caption: "Home: your selected path, XP and a shortcut to continue learning.",
  },
  path: {
    src: "/product/features/learning-path.jpeg", width: 828, height: 1600,
    alt: "Unit 1, Your First Arabic Conversation, showing sequenced activities including Say Hello, Meet Yusuf and Order a Drink with completion checkmarks",
    caption: "Unit 1: a sequence of lessons and conversation activities with completion checkmarks.",
  },
  pronunciation: {
    src: "/product/features/pronunciation-feedback.jpeg", width: 826, height: 1601,
    alt: "Meet Yusuf Gulf Arabic lesson with an Arabic greeting, transliteration, English meaning, listening and hold-to-speak controls, and a 95% pronunciation result",
    caption: "Speaking practice: listen, hold to speak and review pronunciation feedback.",
  },
  challenge: {
    src: "/product/features/conversation-challenge.jpeg", width: 824, height: 1599,
    alt: "Your First Arabic Conversation Challenge at question 2 of 20, asking for a greeting reply with three Arabic and transliterated answer choices",
    caption: "Conversation challenge: choose the missing reply using Arabic and transliteration.",
  },
  alphabet: {
    src: "/product/features/alphabet-overview.jpeg", width: 818, height: 1598,
    alt: "Alphabet screen titled Make sense of the script, with a 13-step Build and Read introduction to baab, meaning door",
    caption: "Alphabet practice: a 13-step introduction from letters to the word baab, meaning door.",
  },
  vowels: {
    src: "/product/features/alphabet-vowels.jpeg", width: 824, height: 1599,
    alt: "Build and Read step 3 of 13 showing the letter baa with ba, bi and bu vowel marks, a Listen button and an exploration counter",
    caption: "One letter, three sounds: explore ba, bi and bu with audio support.",
  },
} as const;
