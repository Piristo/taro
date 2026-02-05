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
import { formatBirthDate, hashString } from "../lib/utils";
import PeriodTabs, { PeriodKey } from "./PeriodTabs";
import StatRing from "./StatRing";

export default function TarotHome() {
  const {
    spreads,
    spreadsAll,
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
    profile,
    setBirthDate,
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

  const zodiacNote = profile.zodiac
    ? `Ваш знак: ${profile.zodiac.name} · ${profile.zodiac.element} · ${profile.zodiac.tone}. Фокус: ${profile.zodiac.focus}.`
    : "Добавьте дату рождения, чтобы получить персональный тон расклада.";

  const activeCard = readingCards[activeIndex];
  const hasReading = Boolean(currentReading);
  const [period, setPeriod] = useState<PeriodKey>("today");
  const [navActive, setNavActive] = useState("home");
  const [editingBirth, setEditingBirth] = useState(false);
  const showBirthForm = editingBirth || !profile.birthDate;

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const version = process.env.NEXT_PUBLIC_APP_VERSION;
    if (!version) return;
    const params = new URLSearchParams(window.location.search);
    const current = params.get("v");
    if (current !== version) {
      params.set("v", version);
      window.localStorage.setItem("appVersion", version);
      const nextUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.location.replace(nextUrl);
    } else {
      window.localStorage.setItem("appVersion", version);
    }
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
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
    selectSpread(spreadMap[period]);
  }, [period, selectSpread]);

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
                  Привет, искатель
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

          <motion.div variants={fadeUp} id="section-tabs">
            <PeriodTabs value={period} onChange={setPeriod} />
          </motion.div>

          <motion.div
            variants={fadeUp}
            id="section-ritual"
            className="card-panel flex flex-col gap-3 p-4"
          >
            <div className="section-head">
              <div>
                <p className="section-title">Ваш ритуал</p>
                <div className="flex items-center gap-2">
                  <span className="section-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3L14.6 8.6L20 9.4L16 13.2L17.2 18.6L12 15.6L6.8 18.6L8 13.2L4 9.4L9.4 8.6L12 3Z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </span>
                  <h2 className="text-lg text-[var(--ink-100)]">Мистический фокус</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => startReading()}
                className="rounded-full bg-[var(--gold-400)] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-black"
              >
                Новый расклад
              </button>
            </div>
            <p className="text-sm text-[var(--ink-200)]">{predictive.message}</p>
            {showBirthForm ? (
              <div className="card-panel soft flex flex-col gap-3 p-3">
                <div className="profile-date-row">
                  <div>
                    <p className="section-title">Дата рождения</p>
                    <p className="text-sm text-[var(--ink-100)]">Персональный тон расклада</p>
                  </div>
                  <div className="profile-date-field">
                    <button
                      type="button"
                      className="profile-date-button"
                      onClick={() => {
                        const el = document.getElementById("birth-date-input") as HTMLInputElement | null;
                        el?.showPicker?.();
                        el?.focus();
                      }}
                    >
                      {profile.birthDate ? formatBirthDate(profile.birthDate) : "ДД.ММ.ГГГГ"}
                      <span aria-hidden="true" className="profile-date-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M7 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M17 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M4 9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M6 6H18C19.1 6 20 6.9 20 8V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V8C4 6.9 4.9 6 6 6Z" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                    </button>
                    <input
                      id="birth-date-input"
                      type="date"
                      value={profile.birthDate ?? ""}
                      onChange={(event) => {
                        const next = event.target.value;
                        setBirthDate(next);
                        if (next) setEditingBirth(false);
                      }}
                      onBlur={() => {
                        if (profile.birthDate) setEditingBirth(false);
                      }}
                      className="profile-date-input"
                      aria-label="Дата рождения"
                    />
                  </div>
                </div>
                <p className="text-xs text-[var(--ink-200)]">{zodiacNote}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingBirth(true)}
                className="profile-pill"
              >
                <span className="profile-pill-title">Знак:</span>
                <span className="profile-pill-value">
                  {profile.zodiac?.name ?? ""}
                  {profile.birthDate ? ` · ${formatBirthDate(profile.birthDate)}` : ""}
                </span>
                <span className="profile-pill-action">Изменить</span>
              </button>
            )}
            <div className={ritualDense ? "ritual-cards dense" : "ritual-cards"}>
              <CardDisplay
                spread={currentSpread}
                cards={readingCards}
                activeIndex={activeIndex}
                onActiveIndex={setActiveIndex}
                onFlip={handleFlip}
                onHold={handleHold}
                showHeader={false}
                variant="plain"
                cardSize={ritualCardSize}
              />
            </div>
            <div className="flex flex-col gap-1 text-xs text-[var(--ink-300)]">
              <span>Оффлайн · {deckCount} карт · без рекламы</span>
              <span className="text-[var(--gold-400)]">{supportNote}</span>
            </div>
          </motion.div>
        </motion.header>

        <main className="flex flex-col gap-6">
          <div id="section-spread">
            <SpreadSelector
              spreads={spreads}
              selectedId={selectedSpreadId}
              recommendedId={predictive.recommendedId}
              onSelect={(id) => {
                selectSpread(id);
                startReading(id);
                telegram.haptic("light");
              }}
            />
          </div>

          <div className="card-panel flex flex-col gap-4 p-4" id="section-energy">
            <div className="section-head">
              <div>
                <p className="section-title">Энергия</p>
                <div className="flex items-center gap-2">
                  <span className="section-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M4 14C6.5 8 10 6 12 6C14 6 17.5 8 20 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <circle cx="12" cy="16" r="3.5" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  </span>
                  <h3 className="text-lg text-[var(--ink-100)]">Баланс дня</h3>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold-400)]">
                Сегодня
              </span>
            </div>
            <div className="flex gap-3">
              <StatRing label="Любовь" value={74} tone="gold" />
              <StatRing label="Поток" value={62} tone="ember" />
              <StatRing label="Работа" value={81} tone="ivory" />
            </div>
          </div>

          <div id="section-interpretation">
            <Interpretation
              card={activeCard?.card}
              position={activeCard?.position}
              isRevealed={activeCard?.isRevealed ?? false}
              isReversed={activeCard?.isReversed ?? false}
              zodiac={profile.zodiac}
            />
          </div>

          <button
            type="button"
            onClick={() => startReading()}
            className="rounded-2xl bg-gradient-to-r from-[#f7b267] to-[#f08c3a] px-6 py-4 text-center text-sm uppercase tracking-[0.3em] text-[#1a110c]"
          >
            Что мне делать сегодня
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

        <nav className="bottom-nav" id="section-nav">
          <button
            type="button"
            onClick={() => {
              setNavActive("home");
              scrollToSection("section-tabs");
            }}
            className={navActive === "home" ? "nav-item nav-item-active" : "nav-item"}
            aria-label="Home"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 11L12 4L20 11V20H4V11Z" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              setNavActive("cards");
              scrollToSection("section-ritual");
            }}
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
            onClick={() => {
              setNavActive("audio");
              scrollToSection("section-interpretation");
            }}
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
        spreads={spreadsAll}
        cardNames={cardNames}
        onClose={toggleHistory}
        onSelect={loadSession}
        onClear={handleClearHistory}
      />
    </div>
  );
}
  const ritualDense =
    currentSpread?.layout === "cross" ||
    currentSpread?.layout === "grid" ||
    currentSpread?.layout === "celtic";

  const ritualCardSize = ritualDense ? "xs" : "sm";
