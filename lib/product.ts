export type DialectKey = "msa" | "egyptian" | "gulf";

export type LearningPath = {
  id: DialectKey;
  shortLabel: string;
  label: string;
  description: string;
  futureSlug: string;
  /** Set only when the dedicated page exists; controls links and sitemap inclusion. */
  pageLastModified?: string;
  sampleTarget: string;
  arabic: string;
  pronunciation: string;
  english: string;
  audioSrc: string;
};

export const productAssets = {
  logo: {
    src: "/product/heyyusuf-logo.png",
    width: 500,
    height: 500,
  },
  yusuf: {
    src: "/product/yusuf-welcome.png",
    width: 500,
    height: 500,
  },
  pronunciation: {
    src: "/product/app-pronunciation.jpg",
    width: 621,
    height: 1344,
  },
  scenes: {
    cafe: {
      src: "/scenes/cafe-conversation.webp",
      width: 768,
      height: 1344,
    },
    belongings: {
      src: "/scenes/finding-belongings.jpg",
      width: 720,
      height: 1280,
    },
    clothes: {
      src: "/scenes/choosing-clothes.jpg",
      width: 720,
      height: 1280,
    },
  },
} as const;

export const learningPaths: readonly LearningPath[] = [
  {
    id: "msa",
    shortLabel: "MSA",
    label: "Modern Standard Arabic (MSA)",
    futureSlug: "/heyyusuf/msa",
    pageLastModified: "2026-10-06",
    sampleTarget: "try-arabic-msa",
    description: "A widely understood formal variety used across media, writing, and many structured settings.",
    arabic: "أي قميص تريد؟",
    pronunciation: "ayy qamiis turiid?",
    english: "Which shirt do you want?",
    audioSrc: "/audio/msa-which-shirt.mp3",
  },
  {
    id: "gulf",
    shortLabel: "Gulf",
    label: "Gulf Arabic",
    futureSlug: "/heyyusuf/gulf-arabic",
    pageLastModified: "2026-10-06",
    sampleTarget: "try-arabic-gulf",
    description: "Practical Gulf speech with a UAE and Emirati-oriented direction.",
    arabic: "أي قميص تبا؟",
    pronunciation: "ayy gamiiṣ tabaa?",
    english: "Which shirt do you want?",
    audioSrc: "/audio/gulf-which-shirt.mp3",
  },
  {
    id: "egyptian",
    shortLabel: "Egyptian",
    label: "Egyptian Arabic",
    futureSlug: "/heyyusuf/egyptian-arabic",
    pageLastModified: "2026-10-06",
    sampleTarget: "try-arabic-egyptian",
    description: "Everyday spoken Arabic centered on how people communicate in Egypt.",
    arabic: "عايز أنهي قميص؟",
    pronunciation: "ʿaayiz anhi ʾamiiṣ?",
    english: "Which shirt do you want?",
    audioSrc: "/audio/egyptian-which-shirt.mp3",
  },
] as const;

export const learningPathNames = learningPaths.map((path) => path.label);
export const learningPathList = `${learningPathNames.slice(0, -1).join(", ")} and ${learningPathNames.at(-1)}`;
export const productDefinition = `HeyYusuf is an Arabic-learning app with three separate learning paths: ${learningPathList}.`;
export const productDescription = `Learn Arabic with HeyYusuf through three separate learning paths: ${learningPathList}. Practice with guided lessons and pronunciation support.`;

export const everydayScenes = [
  {
    title: "Meet, greet, order",
    description: "Introduce yourself, ask for what you need, and take a first café exchange one line at a time.",
    image: productAssets.scenes.cafe,
    alt: "Yusuf speaking with a barista at a café counter",
  },
  {
    title: "Find what you need",
    description: "Use familiar words and place phrases while looking for keys, a wallet, or a phone.",
    image: productAssets.scenes.belongings,
    alt: "Yusuf helping a learner find belongings in a bedroom",
  },
  {
    title: "Choose and get ready",
    description: "Talk through clothes, colors, preferences, and simple getting-ready decisions.",
    image: productAssets.scenes.clothes,
    alt: "Yusuf and a learner choosing a shirt beside a wardrobe",
  },
] as const;
