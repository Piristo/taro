"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { spreads, tarotDeck } from "../lib/tarot-data";
import { TarotCardData, TarotReading, TarotSession, TarotSpread, UserProfile } from "../lib/types";
import { createId, pickUnique } from "../lib/utils";
import { clearSessions, getProfile, getSessions, saveProfile, upsertSession } from "../lib/storage";
import { getZodiacSign } from "../lib/astro";

type ReadingCardView = {
  card: TarotCardData;
  isReversed: boolean;
  isRevealed: boolean;
  position: TarotSpread["positions"][number];
};

type TarotContextValue = {
  spreads: TarotSpread[];
  selectedSpreadId: string;
  selectSpread: (id: string) => void;
  startReading: (spreadId?: string) => void;
  currentReading: TarotReading | null;
  currentSpread: TarotSpread | null;
  readingCards: ReadingCardView[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  revealCard: (index: number) => void;
  revealAll: () => void;
  history: TarotSession[];
  historyOpen: boolean;
  toggleHistory: () => void;
  loadSession: (id: string) => void;
  clearHistory: () => void;
  profile: UserProfile;
  setBirthDate: (value: string) => void;
};

const TarotContext = createContext<TarotContextValue | null>(null);

export function TarotProvider({ children }: { children: React.ReactNode }) {
  const [selectedSpreadId, setSelectedSpreadId] = useState(spreads[0]?.id ?? "");
  const [currentReading, setCurrentReading] = useState<TarotReading | null>(null);
  const [history, setHistory] = useState<TarotSession[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ birthDate: null, zodiac: null });

  const deckMap = useMemo(() => new Map(tarotDeck.map((card) => [card.id, card])), []);

  const currentSpread = useMemo(
    () => spreads.find((spread) => spread.id === (currentReading?.spreadId ?? selectedSpreadId)) ?? null,
    [currentReading?.spreadId, selectedSpreadId]
  );

  const readingCards = useMemo<ReadingCardView[]>(() => {
    if (!currentReading) return [];
    return currentReading.cards
      .map((card) => ({
        card: deckMap.get(card.cardId)!,
        isRevealed: card.isRevealed,
        isReversed: card.isReversed,
        position: card.position,
      }))
      .filter((card) => card.card);
  }, [currentReading, deckMap]);

  const activeIndex = currentReading?.activeIndex ?? 0;

  const selectSpread = useCallback((id: string) => {
    setSelectedSpreadId(id);
  }, []);

  const persistReading = useCallback((reading: TarotReading) => {
    upsertSession(reading).catch(() => undefined);
    setHistory((prev) => {
      const existing = prev.find((item) => item.id === reading.id);
      if (!existing) {
        return [reading, ...prev];
      }
      return prev.map((item) => (item.id === reading.id ? reading : item));
    });
  }, []);

  const startReading = useCallback(
    (spreadId?: string) => {
      const targetSpreadId = spreadId ?? selectedSpreadId;
      const spread = spreads.find((item) => item.id === targetSpreadId) ?? spreads[0];
      if (!spread) return;

      const picks = pickUnique(tarotDeck, spread.count);
      const reading: TarotReading = {
        id: createId("reading"),
        spreadId: spread.id,
        createdAt: Date.now(),
        cards: picks.map((card, index) => ({
          cardId: card.id,
          isReversed: Math.random() > 0.7,
          isRevealed: false,
          position: spread.positions[index],
        })),
        activeIndex: 0,
      };
      setSelectedSpreadId(spread.id);
      setCurrentReading(reading);
      persistReading(reading);
    },
    [persistReading, selectedSpreadId]
  );

  const revealCard = useCallback((index: number) => {
    setCurrentReading((prev) => {
      if (!prev) return prev;
      const cards = prev.cards.map((card, cardIndex) =>
        cardIndex === index ? { ...card, isRevealed: true } : card
      );
      const next = { ...prev, cards, activeIndex: index };
      persistReading(next);
      return next;
    });
  }, [persistReading]);

  const revealAll = useCallback(() => {
    setCurrentReading((prev) => {
      if (!prev) return prev;
      const cards = prev.cards.map((card) => ({ ...card, isRevealed: true }));
      const next = { ...prev, cards };
      persistReading(next);
      return next;
    });
  }, [persistReading]);

  const setActiveIndex = useCallback((index: number) => {
    setCurrentReading((prev) => {
      if (!prev) return prev;
      const safeIndex = Math.max(0, Math.min(index, prev.cards.length - 1));
      return { ...prev, activeIndex: safeIndex };
    });
  }, []);

  const toggleHistory = useCallback(() => {
    setHistoryOpen((prev) => !prev);
  }, []);

  const loadSession = useCallback(
    (id: string) => {
      const session = history.find((item) => item.id === id);
      if (session) {
        setCurrentReading(session);
        setSelectedSpreadId(session.spreadId);
        setHistoryOpen(false);
      }
    },
    [history]
  );

  const clearHistory = useCallback(() => {
    clearSessions().then(() => setHistory([]));
  }, []);

  useEffect(() => {
    getSessions().then((sessions) => setHistory(sessions)).catch(() => undefined);
  }, []);

  useEffect(() => {
    getProfile()
      .then((stored) => {
        if (!stored) return;
        setProfile({ birthDate: stored.birthDate, zodiac: stored.zodiac as UserProfile["zodiac"] });
      })
      .catch(() => undefined);
  }, []);

  const setBirthDate = useCallback((value: string) => {
    if (!value) {
      const next = { birthDate: null, zodiac: null };
      setProfile(next);
      saveProfile({ id: "profile", ...next }).catch(() => undefined);
      return;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return;
    const zodiac = getZodiacSign(date);
    const next = {
      birthDate: value,
      zodiac: {
        id: zodiac.id,
        name: zodiac.name,
        element: zodiac.element,
        focus: zodiac.focus,
        tone: zodiac.tone,
      },
    };
    setProfile(next);
    saveProfile({ id: "profile", ...next }).catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({
      spreads,
      selectedSpreadId,
      selectSpread,
      startReading,
      currentReading,
      currentSpread,
      readingCards,
      activeIndex,
      setActiveIndex,
      revealCard,
      revealAll,
      history,
      historyOpen,
      toggleHistory,
      loadSession,
      clearHistory,
      profile,
      setBirthDate,
    }),
    [
      activeIndex,
      currentReading,
      currentSpread,
      clearHistory,
      history,
      historyOpen,
      loadSession,
      profile,
      readingCards,
      revealAll,
      revealCard,
      selectSpread,
      selectedSpreadId,
      setActiveIndex,
      setBirthDate,
      startReading,
      toggleHistory,
    ]
  );

  return <TarotContext.Provider value={value}>{children}</TarotContext.Provider>;
}

export function useTarot() {
  const context = useContext(TarotContext);
  if (!context) throw new Error("useTarot must be used within TarotProvider");
  return context;
}
