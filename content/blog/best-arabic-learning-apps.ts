import type { ArticleBlock, BlogPost, InlineContent } from "../../lib/blog-types";

// Official sources checked on 2026-10-05. Keep citations beside the claims they support.
const sources = {
  duolingoDialects: "https://blog.duolingo.com/arabic-dialects/",
  duolingoArabic: "https://blog.duolingo.com/what-makes-arabic-hard-and-why-that-shouldnt-stop-you-from-learning-it/",
  duolingoCourse: "https://en.duolingo.com/course/ar/en",
  rosettaDialects: "https://support.rosettastone.com/rosetta-stone-language-dialects-and-descriptions/",
  rosettaArabic: "https://www.rosettastone.com/learn-arabic",
  pimsleurCatalog: "https://www.pimsleur.com/pimsleur-site-map/",
  pimsleurMsa: "https://www.pimsleur.com/learn-arabic-modern-standard/",
  pimsleurEgyptian: "https://www.pimsleur.com/learn-arabic-egyptian/",
  pimsleurEastern: "https://www.pimsleur.com/learn-arabic-eastern/",
  pimsleurLesson: "https://www.pimsleur.com/free-lesson/",
  mangoLanguages: "https://www.mangolanguages.com/available-languages",
  mangoMethod: "https://www.mangolanguages.com/how-it-works",
  mangoEgyptian: "https://www.mangolanguages.com/available-languages/egyptian-arabic",
  emirati: "https://alramsa.ae/alramsa-faqs/",
};

const link = (text: string, href: string) => ({ type: "link" as const, text, href });
const strong = (text: string) => ({ type: "strong" as const, text });
const paragraph = (content: InlineContent): ArticleBlock => ({ type: "paragraph", content });
const heading = (id: string, text: string, level: 2 | 3 = 2): ArticleBlock => ({ type: "heading", level, id, text });

export const bestArabicLearningApps = {
  slug: "best-arabic-learning-apps",
  status: "published",
  title: "Best Arabic Learning Apps in 2026: MSA, Egyptian, Levantine & Gulf Compared",
  seoTitle: "Best Arabic Learning Apps in 2026 | MSA, Gulf, Egyptian & Levantine",
  description: "Compare top Arabic learning apps for MSA, Gulf, Egyptian and Levantine Arabic, including Duolingo, Rosetta Stone, Pimsleur, Mango and HeyYusuf.",
  excerpt: "Choose your Arabic variety first, then your app. A practical comparison of five platforms for different places, people, and ways of learning.",
  category: "Learning guides",
  author: { type: "Organization", name: "HeyLanguages", url: "https://heylanguages.com" },
  datePublished: "2026-10-05",
  dateModified: "2026-10-05",
  productCta: {
    headline: "Want Gulf Arabic, MSA and Egyptian in one app?",
    description: "Explore practical beginner lessons, pronunciation practice and guided conversations in HeyYusuf.",
  },
  body: [
    paragraph([
      "An app can teach Arabic well and still teach the wrong variety for your goal. Modern Standard Arabic (MSA) serves formal communication and writing; everyday spoken Arabic varies by region. A lesson aimed at reading a news report is not the same preparation as one aimed at chatting with an Egyptian friend. ",
      link("Duolingo’s explanation of Arabic dialects", sources.duolingoDialects),
      " makes this distinction clear.",
    ]),
    paragraph("Start with who you want to speak to and what you want to understand. Then compare how each app asks you to learn: short exercises, audio conversations, visual immersion, or a guided mix. That is more useful than a single overall ranking."),
    {
      type: "callout",
      title: "Publisher disclosure",
      content: [
        "Disclosure: HeyYusuf is developed by HeyLanguages, the publisher of this article. We include it alongside alternatives and explain where another approach may suit you better. Learn more about ",
        link("HeyLanguages", "/"),
        " and ",
        link("HeyYusuf", "/heyyusuf"),
        ".",
      ],
    },
    paragraph("Course information was checked against official sources on October 5, 2026. We compared documented Arabic varieties and teaching approaches; we did not conduct a hands-on completion test or measure learning outcomes. “Best for” reflects our editorial judgment about which approach fits each goal."),

    heading("quick-comparison", "Quick answer: choose the Arabic variety first"),
    {
      type: "table",
      caption: "Arabic course coverage in the official sources checked for this comparison",
      columns: ["App", "MSA", "Gulf Arabic", "Egyptian", "Levantine", "Best for"],
      rows: [
        [[link("HeyYusuf", "/heyyusuf")], "Yes", "Yes", "Yes", "Not listed", "Beginners seeking separate MSA, Gulf, and Egyptian paths"],
        [[link("Duolingo", sources.duolingoArabic)], "Yes", "Not listed", "Not listed", "Not listed", "A gamified introduction to MSA"],
        [[link("Rosetta Stone", sources.rosettaDialects)], "Yes", "Not listed", "Not listed", "Not listed", "Immersive MSA with visual and audio cues"],
        [[link("Pimsleur", sources.pimsleurCatalog)], "Yes", "Not listed", "Yes", "Yes — called Eastern Arabic", "Audio-first speaking practice"],
        [[link("Mango Languages", sources.mangoLanguages)], "Yes", "Not listed", "Yes", "Yes", "Broad variety choice, including Iraqi Arabic"],
      ],
    },
    paragraph("“Not listed” means a dedicated course in that variety was not identified in the linked official information. It does not mean the app contains no regional vocabulary. A “Yes” confirms variety coverage, not equal course length or proficiency outcomes. On smaller screens, scroll the table sideways to see every column."),
    paragraph([
      "Mango also lists Iraqi Arabic, which sits outside the table’s four variety columns. We have not relabelled it as Gulf Arabic. Pimsleur’s Eastern Arabic course covers the variety associated with Syria, Lebanon, Jordan, and Palestine—the Levantine option in this comparison. See ",
      link("Mango’s language catalogue", sources.mangoLanguages),
      " and ",
      link("Pimsleur’s Eastern Arabic description", sources.pimsleurEastern),
      ".",
    ]),

    heading("duolingo", "Duolingo: a gamified introduction to MSA"),
    paragraph([strong("Best for: "), "learners who find short exercises and game-like progress motivating."]),
    paragraph([
      strong("Arabic variety: "),
      "MSA. Duolingo specifically describes its Arabic course as a less-formal spoken version of MSA, rather than the register of a formal news script. It is not a dedicated Gulf, Egyptian, or Levantine course. ",
      link("Source: Duolingo’s Arabic course explanation", sources.duolingoArabic),
      ".",
    ]),
    paragraph([
      strong("Strengths: "),
      "the course combines short lessons with points and levels. Duolingo also documents Arabic script practice and exercises connecting letters to sounds. This makes it a sensible starting point when learning the writing system and establishing a repeatable routine are your immediate priorities. ",
      link("Official Arabic course overview", sources.duolingoCourse),
      "; ",
      link("Arabic-specific learning features", sources.duolingoArabic),
      ".",
    ]),
    paragraph([strong("Things to consider: "), "MSA practice does not amount to a course in the everyday dialect of a particular community. If your main goal is conversation with Emirati, Egyptian, or Levantine speakers, plan for materials in that variety as well."]),
    paragraph([strong("Choose it if: "), "a game-like routine is the feature most likely to keep you studying. For a learner seeking that format, Duolingo is a more directly documented fit than HeyYusuf’s guided-scenario positioning."]),

    heading("rosetta-stone", "Rosetta Stone: immersive MSA"),
    paragraph([strong("Best for: "), "learners who prefer connecting images, sounds, and meaning within a structured course."]),
    paragraph([
      strong("Arabic variety: "),
      "MSA. Rosetta Stone’s support documentation explicitly identifies it as the course variety. It notes some Egyptian influence in recorded accents, which should not be confused with a separate Egyptian dialect course. ",
      link("Source: Rosetta Stone’s dialect documentation", sources.rosettaDialects),
      ".",
    ]),
    paragraph([
      strong("Strengths: "),
      "Rosetta Stone describes an immersive sequence combining visual and audio cues, vocabulary, and sentence patterns. Its Arabic page also lists the TruAccent speech tool for pronunciation practice. That gives learners who want immersive MSA an alternative to a points-led routine. ",
      link("Official Arabic course details", sources.rosettaArabic),
      ".",
    ]),
    paragraph([strong("Things to consider: "), "choose it for its documented MSA course, not as a substitute for dedicated Gulf or Levantine instruction. If you prefer English explanations beside every example, try the lesson format before committing to an immersion-led approach."]),
    paragraph([strong("Choose it if: "), "visual immersion is your preferred way to practise MSA. Among these options, it is the clearest fit for that specific learning style."]),

    heading("pimsleur", "Pimsleur: audio-first speaking practice"),
    paragraph([strong("Best for: "), "learners who want listening and spoken responses to organise their study session."]),
    paragraph([
      strong("Arabic varieties: "),
      "separate courses in ",
      link("Modern Standard Arabic", sources.pimsleurMsa),
      ", ",
      link("Egyptian Arabic", sources.pimsleurEgyptian),
      ", and ",
      link("Eastern Arabic", sources.pimsleurEastern),
      ". Eastern is the Levantine choice, not a dedicated Gulf course.",
    ]),
    paragraph([
      strong("Strengths: "),
      "Pimsleur puts the audio lesson at the centre of its method, with participation rather than listening alone. Its introductory lesson page describes a 30-minute daily format. This is a particularly clear fit for someone who wants a regular session built around hearing and responding to spoken language. ",
      link("Source: Pimsleur’s lesson format", sources.pimsleurLesson),
      ".",
    ]),
    paragraph([strong("Things to consider: "), "make sure the course name matches your target variety before subscribing. A 30-minute audio session may suit your routine better—or worse—than brief screen exercises. If reading and writing are central to your goal, check the selected course’s reading content rather than assuming an audio-led programme covers everything you need."]),
    paragraph([strong("Choose it if: "), "audio-first speaking practice is your priority. We would put Pimsleur ahead of HeyYusuf on that particular format choice."]),

    heading("mango-languages", "Mango Languages: broad Arabic variety choice"),
    paragraph([strong("Best for: "), "learners choosing between several regional courses, especially those interested in Levantine or Iraqi Arabic."]),
    paragraph([
      strong("Arabic varieties: "),
      "Mango’s catalogue lists MSA, Egyptian, Iraqi, and Levantine Arabic. That is the broadest named Arabic variety selection among the five apps in this comparison. ",
      link("Source: Mango’s available languages", sources.mangoLanguages),
      ".",
    ]),
    paragraph([
      strong("Strengths: "),
      "Mango’s method builds lessons around conversations, then breaks phrases into smaller parts. It offers grammar and culture notes and lets learners record their voice and compare it with native-speaker audio. The Egyptian course page also describes phonetic help and replaying individual words. ",
      link("How Mango works", sources.mangoMethod),
      "; ",
      link("Egyptian course features", sources.mangoEgyptian),
      ".",
    ]),
    paragraph([strong("Things to consider: "), "pick the actual regional course you need. Iraqi and Gulf are not interchangeable course labels. A catalogue entry also tells you less than a look through that course’s lessons: check its progression and topics before deciding it fits your intended use."]),
    paragraph([strong("Choose it if: "), "having MSA, Egyptian, Iraqi, and Levantine options matters more than having a dedicated Gulf path. For that breadth of choice, Mango has the advantage in this shortlist."]),

    heading("heyyusuf", "HeyYusuf: separate MSA, Gulf, and Egyptian paths"),
    paragraph([strong("Best for: "), "beginners who want Gulf Arabic alongside MSA and Egyptian options in one product, with a clear lesson sequence."]),
    paragraph([
      strong("Arabic varieties: "),
      "MSA, Gulf Arabic, and Egyptian Arabic. The ",
      link("HeyYusuf product page", "/heyyusuf"),
      " presents these as distinct choices; the Gulf path has a UAE and Emirati-oriented direction.",
    ]),
    paragraph([
      strong("Strengths: "),
      "lessons connect useful words and phrases to listening audio, automated pronunciation feedback and guided conversations. Quizzes and conversation challenges reinforce familiar language, while alphabet practice supports reading. Arabic text, English meanings and pronunciation guides support beginners. XP and Continue Learning help learners track progress and resume practice. See ",
      link("the app screenshots and feature walkthrough", "/heyyusuf/features"),
      " or ",
      link("hear the three varieties in the website sample", "/heyyusuf#try-arabic"),
      " before choosing a path.",
    ]),
    paragraph([
      strong("Things to consider: "),
      "It does not currently offer a Levantine path. Android is available on Google Play; iPhone is still coming soon. The Gulf path focuses on everyday speech in the UAE, with an emphasis on Emirati Arabic.",
    ]),
    paragraph([strong("Choose it if: "), "you want practical beginner progression with explicitly separated Arabic varieties, especially Gulf and MSA. If your priority is Levantine Arabic, compare Pimsleur and Mango instead."]),

    heading("choose-by-goal", "Which app fits your goal?"),
    paragraph("Match your main goal to the formats above."),
    {
      type: "list",
      items: [
        [strong("Best for a gamified MSA introduction: "), link("Duolingo", "#duolingo"), ", if short exercises, points, and levels are what help you return."],
        [strong("Best for audio-first speaking practice: "), link("Pimsleur", "#pimsleur"), ", if you want an audio-led session and can choose the course for your target variety."],
        [strong("Best for broad Arabic variety coverage in this comparison: "), link("Mango Languages", "#mango-languages"), ", with its MSA, Egyptian, Iraqi, and Levantine selection."],
        [strong("Best fit here for Gulf Arabic + MSA in one product: "), link("HeyYusuf", "#heyyusuf"), ", which also offers Egyptian and keeps the paths distinct."],
        [strong("Best for immersive MSA: "), link("Rosetta Stone", "#rosetta-stone"), ", if visual and audio cues are the way you want to work through a course."],
      ],
    },
    paragraph("Before paying, try to answer three questions from a sample lesson: Is this the Arabic I want to use? Am I practising the skill I care about—reading, listening, or speaking? Can I see a next step I would realistically follow? A product’s teaching format is more useful to your decision than a claim that it suits everyone."),

    heading("frequently-asked-questions", "Frequently asked questions"),
    heading("which-app-teaches-gulf", "Which app teaches Gulf Arabic?", 3),
    paragraph([
      "Among these five apps, ",
      link("HeyYusuf", "/heyyusuf"),
      " explicitly offers Gulf Arabic, with a UAE and Emirati-oriented direction, alongside separate MSA and Egyptian paths.",
    ]),
    heading("does-duolingo-teach-gulf", "Does Duolingo teach Gulf Arabic?", 3),
    paragraph([
      "No dedicated Gulf course is identified in ",
      link("Duolingo’s official Arabic course explanation", sources.duolingoArabic),
      ". It describes the course as a less-formal spoken version of MSA. Choose a resource explicitly labelled Gulf or Emirati if that is the variety you want to practise.",
    ]),
    heading("msa-in-the-uae", "Is MSA enough for living in the UAE?", 3),
    paragraph([
      "MSA is useful for formal communication and written Arabic, but it is not the same as everyday Emirati speech. If your goal is conversation with Emiratis, we recommend adding Emirati or Gulf listening and speaking practice. The right balance depends on the people and situations in your life. ",
      link("Al Ramsa Institute explains the MSA–Emirati distinction", sources.emirati),
      ".",
    ]),
    heading("beginner-dialect", "Which Arabic variety should beginners learn?", 3),
    paragraph([
      "Start with the people you want to speak to: Egyptian for an Egyptian context, Levantine for a Levantine context, or Gulf/Emirati for your intended Gulf setting. If reading and formal communication come first, consider MSA. There is no single first choice for every beginner; ",
      link("Al Ramsa’s guidance on choosing MSA or Emirati", sources.emirati),
      " similarly starts with your goals.",
    ]),
    heading("msa-and-dialect-together", "Can I learn MSA and a dialect at the same time?", 3),
    paragraph([
      "Yes—you can choose to study both. MSA and a regional variety serve different contexts, as ",
      link("Rosetta Stone’s dialect guidance", sources.rosettaDialects),
      " explains. Our practical suggestion is to give each a clear role: MSA for a reading goal, for example, and one dialect for everyday exchanges. Label your notes by variety and reduce the workload if studying both becomes hard to sustain.",
    ]),

    heading("source-notes", "Source notes"),
    paragraph("Links beside the comparison and app sections lead to the official course pages and documentation used for this article. HeyYusuf details come from our current product page. Availability was checked on October 5, 2026. Course content can change, so check the selected provider’s current listing before subscribing."),
  ],
} satisfies BlogPost;
