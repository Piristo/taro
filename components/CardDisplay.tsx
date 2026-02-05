"use client";

import { motion } from "framer-motion";
import { TarotCardData, TarotSpread } from "../lib/types";
import { cn } from "../lib/utils";
import { useSwipe } from "../hooks/useSwipe";
import TarotCard from "./TarotCard";

type CardDisplayData = {
  card: TarotCardData;
  isReversed: boolean;
  isRevealed: boolean;
  position: TarotSpread["positions"][number];
};

type CardDisplayPropsInternal = {
  spread: TarotSpread | null;
  cards: CardDisplayData[];
  activeIndex: number;
  onActiveIndex: (index: number) => void;
  onFlip: (index: number) => void;
  onHold: (index: number) => void;
  showHeader?: boolean;
  variant?: "panel" | "plain";
  cardSize?: "sm" | "md" | "lg";
};

const parseGridArea = (value?: string) => {
  if (!value) return {};
  const [row, col] = value.split("/").map((item) => parseInt(item.trim(), 10));
  if (!row || !col) return {};
  return { gridRow: row, gridColumn: col } as const;
};

export default function CardDisplay({
  spread,
  cards,
  activeIndex,
  onActiveIndex,
  onFlip,
  onHold,
  showHeader = true,
  variant = "panel",
  cardSize,
}: CardDisplayPropsInternal) {
  const handlers = useSwipe({
    onSwipeLeft: () => onActiveIndex(activeIndex + 1),
    onSwipeRight: () => onActiveIndex(activeIndex - 1),
  });

  if (!spread || cards.length === 0) {
    return (
      <div
        className={cn(
          variant === "panel" ? "card-panel" : "",
          "flex min-h-[260px] items-center justify-center p-10 text-center text-[var(--ink-300)]"
        )}
      >
        Карты ждут вашего вопроса.
      </div>
    );
  }

  const layout = spread.layout;
  const isCompact = cards.length > 5;
  const size = cardSize ?? (isCompact ? "sm" : "md");

  return (
    <div
      className={cn(
        variant === "panel" ? "card-panel" : "",
        "flex w-full flex-col gap-4"
      )}
      {...handlers}
    >
      {showHeader ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-300)]">Расклад</p>
            <h3 className="text-lg text-[var(--ink-100)]">{spread.name}</h3>
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--gold-400)]">
            {spread.count} карт
          </div>
        </div>
      ) : null}

      {layout === "line" ? (
        <div className="scroll-row flex gap-3 overflow-x-auto pb-2">
          {cards.map((item, index) => (
            <TarotCard
              key={item.card.id}
              card={item.card}
              isRevealed={item.isRevealed}
              isReversed={item.isReversed}
              isActive={index === activeIndex}
              positionLabel={item.position.title}
              onFlip={() => onFlip(index)}
              onHold={() => onHold(index)}
              size={size}
            />
          ))}
        </div>
      ) : null}

      {layout === "grid" ? (
        <div className="grid grid-cols-3 gap-4">
          {cards.map((item, index) => (
            <TarotCard
              key={item.card.id}
              card={item.card}
              isRevealed={item.isRevealed}
              isReversed={item.isReversed}
              isActive={index === activeIndex}
              positionLabel={item.position.title}
              onFlip={() => onFlip(index)}
              onHold={() => onHold(index)}
              size={"sm"}
            />
          ))}
        </div>
      ) : null}

      {layout === "cross" ? (
        <div className="grid grid-cols-3 grid-rows-3 place-items-center gap-4">
          {cards.map((item, index) => (
            <motion.div key={item.card.id} style={parseGridArea(item.position.gridArea)}>
              <TarotCard
                card={item.card}
                isRevealed={item.isRevealed}
                isReversed={item.isReversed}
                isActive={index === activeIndex}
                positionLabel={item.position.title}
                onFlip={() => onFlip(index)}
                onHold={() => onHold(index)}
                size={"sm"}
              />
            </motion.div>
          ))}
        </div>
      ) : null}

      {layout === "celtic" ? (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gridTemplateRows: "repeat(4, minmax(0, 1fr))",
          }}
        >
          {cards.map((item, index) => (
            <motion.div
              key={item.card.id}
              style={{
                ...parseGridArea(item.position.gridArea),
                transform: index === 1 ? "rotate(90deg)" : undefined,
              }}
            >
              <TarotCard
                card={item.card}
                isRevealed={item.isRevealed}
                isReversed={item.isReversed}
                isActive={index === activeIndex}
                positionLabel={item.position.title}
                onFlip={() => onFlip(index)}
                onHold={() => onHold(index)}
                size={"sm"}
              />
            </motion.div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
