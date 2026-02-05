"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useTarot } from "../contexts/TarotContext";
import { fadeUp, stagger } from "../lib/animations";
import { telegram } from "../lib/telegram";
import { usePredictiveUI } from "../hooks/usePredictiveUI";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import ArcaneCanvas from "./ArcaneCanvas";
import SpreadSelector from "./SpreadSelector";
import CardDisplay from "./CardDisplay";
import Interpretation from "./Interpretation";
import HistoryDrawer from "./HistoryDrawer";
import { tarotDeck } from "../lib/tarot-data";
import { hashString } from "../lib/utils";
import PeriodTabs, { PeriodKey } from "./PeriodTabs";
import StatRing from "./StatRing";

export default function TarotHome() {
  const {
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
    history,
    historyOpen,
    toggleHistory,
    loadSession,
    clearHistory,
  } = useTarot();

  const predictive = usePredictiveUI(spreads, history);
  const supportNote = useMemo(() => {
    const notes = [
      "Доверьтесь первому ощущению и сохраняйте мягкость к себе.",
      "Помните: это символический язык, а выбор всегда за вами.",
      "Сделайте вдох, и пусть карты отразят ваш внутренний ритм.",
    ];
    if (!currentReading?.id) return notes[0];
    const seed = hashString(currentReading.id);
    return notes[seed % notes.length];
  }, [currentReading?.id]);

  const activeCard = readingCards[activeIndex];
  const hasReading = Boolean(currentReading);
  const [period, setPeriod] = useState<PeriodKey>("today");
  const [navActive, setNavActive] = useState("home");

  const { pull, ready, handlers } = usePullToRefresh({
    onRefresh: () => {
      startReading();
      telegram.haptic("soft");
    },
  });

  useEffect(() => {
    telegram.ready();
    telegram.expand();
    telegram.setColors("#2C1810", "#1B0F0A");
  }, []);

  const handleFlip = (index: number) => {
    revealCard(index);
    telegram.haptic("light");
  };

  const handleHold = (index: number) => {
    setActiveIndex(index);
    telegram.haptic("medium");
  };

  const handleClearHistory = () => {
    const confirmed = window.confirm("Очистить историю сессий? Это действие нельзя отменить.");
    if (confirmed) clearHistory();
  };

  const deckCount = useMemo(() => tarotDeck.length, []);
  const cardNames = useMemo(
    () => Object.fromEntries(tarotDeck.map((card) => [card.id, card.name])),
    []
  );

  useEffect(() => {
    const spreadMap: Record<PeriodKey, string> = {
      today: "daily-3",
      week: "five-cross",
      year: "nine-grid",
    };
    selectSpread(spreadMap[period] ?? selectedSpreadId);
  }, [period, selectSpread, selectedSpreadId]);

  return (
    <div className="relative min-h-screen">
      <ArcaneCanvas />
      <div className="safe-area mx-auto flex w-full max-w-md flex-col gap-6">
        <motion.header
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
          {...handlers}
          style={{ transform: `translateY(${pull * 0.35}px)` }}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full border border-[rgba(218,165,32,0.35)] bg-[rgba(18,10,7,0.8)] shadow-ritual" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-300)]">
                  Hi seeker
                </p>
                <h1 className="text-xl text-[var(--ink-100)]">Таро Гадание</h1>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleHistory}
              className="nav-item border border-[rgba(218,165,32,0.2)]"
              aria-label="Меню"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </motion.div>

          <motion.div variants={fadeUp}>
            <PeriodTabs value={period} onChange={setPeriod} />
          </motion.div>

          <motion.div variants={fadeUp} className="card-panel flex flex-col gap-3 p-4">
            <div className="section-head">
              <div>
                <p className="section-title">Your ritual</p>
                <h2 className="text-lg text-[var(--ink-100)]">Мистический фокус</h2>
              </div>
              <button
                type="button"
                onClick={() => startReading()}
                className="rounded-full bg-[var(--gold-400)] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-black"
              >
                New draw
              </button>
            </div>
            <p className="text-sm text-[var(--ink-200)]">{predictive.message}</p>
            <CardDisplay
              spread={currentSpread}
              cards={readingCards}
              activeIndex={activeIndex}
              onActiveIndex={setActiveIndex}
              onFlip={handleFlip}
              onHold={handleHold}
              showHeader={false}
              variant="plain"
            />
            <div className="flex items-center justify-between text-xs text-[var(--ink-300)]">
              <span>Оффлайн · {deckCount} карт · без рекламы</span>
              <span className="text-[var(--gold-400)]">{supportNote}</span>
            </div>
          </motion.div>
        </motion.header>

        <main className="flex flex-col gap-6">
          <SpreadSelector
            spreads={spreads}
            selectedId={selectedSpreadId}
            recommendedId={predictive.recommendedId}
            onSelect={selectSpread}
          />

          <div className="card-panel flex flex-col gap-4 p-4">
            <div className="section-head">
              <div>
                <p className="section-title">Energy</p>
                <h3 className="text-lg text-[var(--ink-100)]">Баланс дня</h3>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold-400)]">
                Today
              </span>
            </div>
            <div className="flex gap-3">
              <StatRing label="Love" value={74} tone="gold" />
              <StatRing label="Flow" value={62} tone="ember" />
              <StatRing label="Work" value={81} tone="ivory" />
            </div>
          </div>

          <Interpretation
            card={activeCard?.card}
            position={activeCard?.position}
            isRevealed={activeCard?.isRevealed ?? false}
            isReversed={activeCard?.isReversed ?? false}
          />

          <button
            type="button"
            onClick={() => startReading()}
            className="rounded-2xl bg-gradient-to-r from-[#f7b267] to-[#f08c3a] px-6 py-4 text-center text-sm uppercase tracking-[0.3em] text-[#1a110c]"
          >
            What can I do today
          </button>

          <div className="relative h-2">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-[rgba(218,165,32,0.35)]"
              style={{ width: `${Math.min(pull, 100)}%`, opacity: pull > 4 ? 1 : 0 }}
            />
            {ready ? (
              <span className="absolute right-0 -top-6 text-[10px] uppercase tracking-[0.3em] text-[var(--gold-400)]">
                Отпустите
              </span>
            ) : null}
          </div>
        </main>

        <nav className="bottom-nav">
          <button
            type="button"
            onClick={() => setNavActive("home")}
            className={navActive === "home" ? "nav-item nav-item-active" : "nav-item"}
            aria-label="Home"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 11L12 4L20 11V20H4V11Z" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setNavActive("cards")}
            className={navActive === "cards" ? "nav-item nav-item-active" : "nav-item"}
            aria-label="Cards"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="5" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M9 9H15" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              setNavActive("history");
              toggleHistory();
            }}
            className={navActive === "history" ? "nav-item nav-item-active" : "nav-item"}
            aria-label="History"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 4V10H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 10C5.6 6.8 8.6 5 12 5C16.4 5 20 8.6 20 13C20 17.4 16.4 21 12 21C8.3 21 5.1 18.9 4.3 15.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setNavActive("audio")}
            className={navActive === "audio" ? "nav-item nav-item-active" : "nav-item"}
            aria-label="Audio"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 12H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M9 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M13 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M17 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M20 12H20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {hasReading ? null : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 flex items-center justify-center"
          >
            <div className="card-panel max-w-sm p-6 text-center text-[var(--ink-200)]">
              Выберите расклад и начните ритуал. Ваши ответы уже внутри.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HistoryDrawer
        open={historyOpen}
        history={history}
        spreads={spreads}
        cardNames={cardNames}
        onClose={toggleHistory}
        onSelect={loadSession}
        onClear={handleClearHistory}
      />
    </div>
  );
}
