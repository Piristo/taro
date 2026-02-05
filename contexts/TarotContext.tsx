"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { spreads as allSpreads, tarotDeck } from "../lib/tarot-data";
import { TarotCardData, TarotReading, TarotSession, TarotSpread, UserProfile } from "../lib/types";
import { createId, pickUnique } from "../lib/utils";
import { clearSessions, getProfile, getSessions, saveProfile, upsertSession } from "../lib/storage";
import { getZodiacSign } from "../lib/astro";

function parseBirthDate(input: string) {
  const trimmed = input.trim();
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const dot = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const slash = /^(\d{2})\/(\d{2})\/(\d{4})$/;

  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;

  if (iso.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map((v) => parseInt(v, 10));
    year = y;
    month = m;
    day = d;
  } else if (dot.test(trimmed)) {
    const match = trimmed.match(dot);
    if (match) {
      day = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      year = parseInt(match[3], 10);
    }
  } else if (slash.test(trimmed)) {
    const match = trimmed.match(slash);
    if (match) {
      day = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      year = parseInt(match[3], 10);
    }
  }

  if (!year || !month || !day) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;

  const canonical = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { date, canonical };
}

type ReadingCardView = {
  card: TarotCardData;
  isReversed: boolean;
  isRevealed: boolean;
  position: TarotSpread["positions"][number];
};

type TarotContextValue = {
  spreads: TarotSpread[];
  spreadsAll: TarotSpread[];
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
  const availableSpreads = useMemo(
    () => allSpreads.filter((spread) => spread.id !== "celtic-10"),
    []
  );
  const [selectedSpreadId, setSelectedSpreadId] = useState(availableSpreads[0]?.id ?? "");
  const [currentReading, setCurrentReading] = useState<TarotReading | null>(null);
  const [history, setHistory] = useState<TarotSession[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ birthDate: null, zodiac: null });

  const deckMap = useMemo(() => new Map(tarotDeck.map((card) => [card.id, card])), []);

  const currentSpread = useMemo(
    () =>
      allSpreads.find(
        (spread) => spread.id === (currentReading?.spreadId ?? selectedSpreadId)
      ) ?? null,
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
      const spread =
        allSpreads.find((item) => item.id === targetSpreadId) ?? availableSpreads[0];
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
    [availableSpreads, persistReading, selectedSpreadId]
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

    const parsed = parseBirthDate(value);
    if (!parsed) return;
    const zodiac = getZodiacSign(parsed.date);
    const next = {
      birthDate: parsed.canonical,
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
      spreads: availableSpreads,
      spreadsAll: allSpreads,
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
      availableSpreads,
      // allSpreads is module-level constant; safe to omit
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
