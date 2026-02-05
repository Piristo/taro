"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { drawer } from "../lib/animations";
import { formatDate } from "../lib/utils";
import { TarotSession, TarotSpread } from "../lib/types";

type HistoryDrawerProps = {
  open: boolean;
  history: TarotSession[];
  spreads: TarotSpread[];
  cardNames: Record<string, string>;
  onClose: () => void;
  onSelect: (id: string) => void;
  onClear: () => void;
};

const filters = [
  { id: "all", label: "Все" },
  { id: "3", label: "3" },
  { id: "5", label: "5" },
  { id: "9", label: "9" },
  { id: "10", label: "10" },
];

export default function HistoryDrawer({
  open,
  history,
  spreads,
  cardNames,
  onClose,
  onSelect,
  onClear,
}: HistoryDrawerProps) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return history;
    return history.filter((session) => session.cards.length === Number(filter));
  }, [filter, history]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(6,3,2,0.7)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            variants={drawer}
            initial="hidden"
            animate="show"
            exit="exit"
            className="glass-panel w-full max-w-3xl rounded-b-none p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-300)]">История</p>
                <h3 className="text-lg text-[var(--ink-100)]">Ваши сессии</h3>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClear}
                  className="rounded-full border border-[rgba(218,165,32,0.35)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[var(--ink-200)]"
                >
                  Очистить
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-[var(--gold-400)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-black"
                >
                  Закрыть
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em] transition ${
                    filter === item.id
                      ? "bg-[var(--gold-400)] text-black"
                      : "border border-[rgba(218,165,32,0.3)] text-[var(--ink-200)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid max-h-[50vh] gap-3 overflow-y-auto pr-2">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-[rgba(218,165,32,0.15)] p-4 text-center text-sm text-[var(--ink-300)]">
                  История пока пуста.
                </div>
              ) : (
                filtered.map((session) => {
                  const spread = spreads.find((item) => item.id === session.spreadId);
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => onSelect(session.id)}
                      className="glass-panel soft flex w-full flex-col gap-1 rounded-2xl p-4 text-left transition hover:border-[rgba(218,165,32,0.35)]"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[var(--ink-100)]">{spread?.name ?? "Расклад"}</p>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold-400)]">
                          {session.cards.length} карт
                        </span>
                      </div>
                      <p className="text-xs text-[var(--ink-300)]">{formatDate(session.createdAt)}</p>
                      <p className="text-xs text-[var(--ink-200)]">
                        {session.cards
                          .slice(0, 3)
                          .map((card) => cardNames[card.cardId] ?? card.cardId)
                          .join(" · ")}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
