"use client";

import { motion } from "framer-motion";
import { TarotSpread } from "../lib/types";
import { cn } from "../lib/utils";

type SpreadSelectorProps = {
  spreads: TarotSpread[];
  selectedId: string;
  recommendedId?: string;
  onSelect: (id: string) => void;
};

export default function SpreadSelector({
  spreads,
  selectedId,
  recommendedId,
  onSelect,
}: SpreadSelectorProps) {
  return (
    <div className="glass-panel soft flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-300)]">
            Расклад
          </p>
          <h2 className="text-lg text-[var(--ink-100)]">Выберите форму вопроса</h2>
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold-400)]">
          6 вариантов
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {spreads.map((spread) => {
          const isSelected = spread.id === selectedId;
          const isRecommended = spread.id === recommendedId;
          return (
            <motion.button
              key={spread.id}
              type="button"
              onClick={() => onSelect(spread.id)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "relative rounded-full border px-4 py-2 text-left text-sm transition",
                isSelected
                  ? "border-[var(--gold-400)] bg-[rgba(218,165,32,0.16)] text-[var(--ink-100)]"
                  : "border-[rgba(218,165,32,0.2)] text-[var(--ink-200)] hover:border-[var(--gold-400)]",
                isRecommended ? "glow-amber" : ""
              )}
            >
              <div className="text-[11px] uppercase tracking-[0.25em] text-[var(--ink-300)]">
                {spread.count} карт
              </div>
              <div className="text-sm text-[var(--ink-100)]">{spread.name}</div>
              {isRecommended ? (
                <span className="absolute -right-2 -top-2 rounded-full bg-[var(--gold-400)] px-2 py-1 text-[9px] uppercase tracking-[0.3em] text-black">
                  Совет
                </span>
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
