"use client";

import { useState } from "react";
import { TarotCardData, TarotSpreadPosition } from "../lib/types";
import { motion } from "framer-motion";
import { fadeUp } from "../lib/animations";

type InterpretationProps = {
  card?: TarotCardData;
  position?: TarotSpreadPosition;
  isRevealed: boolean;
  isReversed: boolean;
};

export default function Interpretation({
  card,
  position,
  isRevealed,
  isReversed,
}: InterpretationProps) {
  const [expanded, setExpanded] = useState(false);

  if (!card) {
    return (
      <div className="glass-panel soft p-5 text-center text-[var(--ink-300)]">
        Выберите карту, чтобы получить интерпретацию.
      </div>
    );
  }

  if (!isRevealed) {
    return (
      <div className="glass-panel soft p-5 text-center text-[var(--ink-300)]">
        Нажмите на карту, чтобы открыть значение.
      </div>
    );
  }

  const meaning = isReversed ? card.reversed : card.upright;

  return (
    <motion.div
      className="glass-panel soft flex flex-col gap-4 p-5"
      variants={fadeUp}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-300)]">Интерпретация</p>
          <h3 className="text-xl text-[var(--ink-100)]">{card.name}</h3>
          <p className="text-sm text-[var(--gold-400)]">
            {position?.title ?? "Позиция"} · {isReversed ? "Перевернутая" : "Прямая"}
          </p>
        </div>
        <div className="rounded-full border border-[rgba(218,165,32,0.3)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[var(--ink-200)]">
          {card.element}
        </div>
      </div>

      <div className="ornament-line" />

      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--ink-300)]">{meaning.title}</p>
        <p className="text-base text-[var(--ink-100)]">{meaning.meaning}</p>
        <p className="mt-3 text-sm text-[var(--ink-200)]">{meaning.psychology}</p>
        <p className="mt-2 text-sm text-[var(--ink-200)]">{meaning.advice}</p>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="rounded-full border border-[rgba(218,165,32,0.35)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--gold-400)] transition hover:bg-[rgba(218,165,32,0.12)]"
      >
        {expanded ? "Свернуть" : "Показать глубже"}
      </button>

      {expanded ? (
        <div className="grid gap-3 text-sm text-[var(--ink-200)]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-300)]">Символизм</p>
            <p>{card.symbolism.join(" · ")}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-300)]">История</p>
            <p>{card.history}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-300)]">Сочетания</p>
            <p>{card.combinations.general}</p>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[rgba(218,165,32,0.18)] bg-[rgba(18,10,7,0.45)] p-3 text-xs text-[var(--ink-200)]">
        Поддержка: это символическое чтение. Слушайте себя бережно и сохраняйте право на выбор.
      </div>
    </motion.div>
  );
}
