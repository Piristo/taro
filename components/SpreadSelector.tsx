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
    <div className="card-panel flex flex-col gap-3 p-4">
      <div className="section-head">
        <div>
          <p className="section-title">Расклад</p>
          <h2 className="text-lg text-[var(--ink-100)]">Выберите расклад</h2>
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold-400)]">
          {spreads.length} вариантов
        </div>
      </div>
      <div className="chip-group">
        {spreads.map((spread) => {
          const isSelected = spread.id === selectedId;
          const isRecommended = spread.id === recommendedId;
          return (
            <motion.button
              key={spread.id}
              type="button"
              onClick={() => onSelect(spread.id)}
              whileTap={{ scale: 0.97 }}
              className={cn("chip", isSelected && "chip-active")}
            >
              {spread.count} · {spread.name}
              {isRecommended ? " ✦" : ""}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
