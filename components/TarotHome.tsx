"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo } from "react";
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
    revealAll,
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

  return (
    <div className="relative min-h-screen">
      <ArcaneCanvas />
      <div className="safe-area mx-auto flex w-full max-w-5xl flex-col gap-6">
        <motion.header
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
          {...handlers}
          style={{ transform: `translateY(${pull * 0.4}px)` }}
        >
          <motion.div variants={fadeUp} className="glass-panel flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-300)]">
                  Telegram Mini App
                </p>
                <h1 className="text-2xl text-[var(--ink-100)]">Таро Гадание</h1>
                <p className="text-sm text-[var(--ink-200)]">Путь к ясности через символы.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleHistory}
                  className="rounded-full border border-[rgba(218,165,32,0.35)] px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-[var(--ink-200)]"
                >
                  История
                </button>
                <button
                  type="button"
                  onClick={() => startReading()}
                  className="rounded-full bg-[var(--gold-400)] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-black"
                >
                  Новый расклад
                </button>
              </div>
            </div>

            <div className="ornament-line" />

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--ink-200)]">
              <span>Полностью оффлайн · {deckCount} карт · Без рекламы и оплат</span>
              <span className="text-[var(--gold-400)]">{supportNote}</span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--ink-200)]">{predictive.message}</p>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--ink-300)]">
                Потяните вниз для обновления
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <SpreadSelector
              spreads={spreads}
              selectedId={selectedSpreadId}
              recommendedId={predictive.recommendedId}
              onSelect={selectSpread}
            />
          </motion.div>

          <motion.div variants={fadeUp} className="relative h-2">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-[rgba(218,165,32,0.35)]"
              style={{ width: `${Math.min(pull, 100)}%`, opacity: pull > 4 ? 1 : 0 }}
            />
            {ready ? (
              <span className="absolute right-0 -top-6 text-[10px] uppercase tracking-[0.3em] text-[var(--gold-400)]">
                Отпустите
              </span>
            ) : null}
          </motion.div>
        </motion.header>

        <main className="flex flex-col gap-6">
          <CardDisplay
            spread={currentSpread}
            cards={readingCards}
            activeIndex={activeIndex}
            onActiveIndex={setActiveIndex}
            onFlip={handleFlip}
            onHold={handleHold}
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => startReading()}
              className="rounded-full border border-[rgba(218,165,32,0.35)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--ink-200)]"
            >
              Повторить расклад
            </button>
            <button
              type="button"
              onClick={revealAll}
              className="rounded-full border border-[rgba(218,165,32,0.35)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--ink-200)]"
            >
              Открыть все
            </button>
            <button
              type="button"
              onClick={toggleHistory}
              className="rounded-full border border-[rgba(218,165,32,0.35)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--ink-200)]"
            >
              Сессии
            </button>
          </div>

          <Interpretation
            card={activeCard?.card}
            position={activeCard?.position}
            isRevealed={activeCard?.isRevealed ?? false}
            isReversed={activeCard?.isReversed ?? false}
          />
        </main>
      </div>

      <AnimatePresence>
        {hasReading ? null : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 flex items-center justify-center"
          >
            <div className="glass-panel soft max-w-md p-6 text-center text-[var(--ink-200)]">
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
