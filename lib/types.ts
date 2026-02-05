export type Arcana = "major" | "minor";
export type Suit = "wands" | "cups" | "swords" | "pentacles";

export type TarotCardMeaning = {
  title: string;
  meaning: string;
  psychology: string;
  advice: string;
};

export type TarotCardData = {
  id: string;
  name: string;
  arcana: Arcana;
  suit?: Suit;
  rank?: string;
  number?: number;
  element: string;
  keywords: string[];
  upright: TarotCardMeaning;
  reversed: TarotCardMeaning;
  symbolism: string[];
  history: string;
  combinations: {
    general: string;
    withMajor: string;
    withCourt: string;
  };
  seed: number;
};

export type TarotSpreadPosition = {
  title: string;
  hint: string;
  gridArea?: string;
};

export type TarotSpread = {
  id: string;
  name: string;
  count: number;
  layout: "line" | "fan" | "grid" | "cross" | "celtic";
  description: string;
  positions: TarotSpreadPosition[];
};

export type TarotReadingCard = {
  cardId: string;
  isReversed: boolean;
  isRevealed: boolean;
  position: TarotSpreadPosition;
};

export type TarotReading = {
  id: string;
  spreadId: string;
  createdAt: number;
  cards: TarotReadingCard[];
  activeIndex: number;
};

export type TarotSession = TarotReading & {
  summary?: string;
};

export type UserProfile = {
  birthDate: string | null;
  zodiac: {
    id: string;
    name: string;
    element: string;
    focus: string;
    tone: string;
  } | null;
};
