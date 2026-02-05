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
  cardSize?: "xs" | "sm" | "md" | "lg";
};

const parseGridArea = (value?: string) => {
  if (!value) return {};
  const [row, col] = value.split("/").map((item) => parseInt(item.trim(), 10));
  if (!row || !col) return {};
  return { gridRow: row, gridColumn: col } as const;
};

const buildMotionProps = (index: number, rotate: number, lift: number) => ({
  initial: { opacity: 0, y: lift + 12, rotate: rotate - 4 },
  animate: { opacity: 1, y: lift, rotate },
  transition: { delay: index * 0.06, duration: 0.5 },
});

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
          {cards.map((item, index) => {
            const fanOffset = index - (cards.length - 1) / 2;
            const fanRotate = Math.max(-8, Math.min(8, fanOffset * 3));
            const fanLift = Math.abs(fanOffset) * 1.6;
            return (
              <motion.div
                key={item.card.id}
                {...buildMotionProps(index, fanRotate, fanLift)}
                className="scroll-card"
              >
                <TarotCard
                  card={item.card}
                  isRevealed={item.isRevealed}
                  isReversed={item.isReversed}
                  isActive={index === activeIndex}
                  positionLabel={item.position.title}
                  onFlip={() => onFlip(index)}
                  onHold={() => onHold(index)}
                  size={size}
                />
              </motion.div>
            );
          })}
        </div>
      ) : null}

      {layout === "grid" ? (
        <div className="grid grid-cols-3 gap-4">
          {cards.map((item, index) => (
            <motion.div key={item.card.id} {...buildMotionProps(index, 0, 0)}>
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

      {layout === "cross" ? (
        <div className="grid grid-cols-3 grid-rows-3 place-items-center gap-4">
          {cards.map((item, index) => (
            <motion.div
              key={item.card.id}
              style={parseGridArea(item.position.gridArea)}
              {...buildMotionProps(index, 0, 0)}
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

      {layout === "celtic" ? (
        <div className="celtic-board">
          {cards.map((item, index) => {
            const pos = getCelticPosition(index);
            return (
              <motion.div
                key={item.card.id}
                className="celtic-slot"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  transform: `translate(-50%, -50%) rotate(${pos.rotate}deg)`,
                }}
                {...buildMotionProps(index, 0, 0)}
              >
                <TarotCard
                  card={item.card}
                  isRevealed={item.isRevealed}
                  isReversed={item.isReversed}
                  isActive={index === activeIndex}
                  positionLabel={item.position.title}
                  onFlip={() => onFlip(index)}
                  onHold={() => onHold(index)}
                  size={"xs"}
                />
              </motion.div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function getCelticPosition(index: number) {
  // Fits on a single phone screen: left cluster + right staff
  const staffX = 85;
  const staffY = [18, 38, 58, 78];
  const crossX = 40;
  const crossY = 48;

  switch (index) {
    case 0:
      return { left: crossX, top: crossY, rotate: 0 };
    case 1:
      return { left: crossX, top: crossY, rotate: 90 };
    case 2:
      return { left: crossX, top: 72, rotate: 0 };
    case 3:
      return { left: 18, top: crossY, rotate: 0 };
    case 4:
      return { left: crossX, top: 24, rotate: 0 };
    case 5:
      return { left: 62, top: crossY, rotate: 0 };
    case 6:
      return { left: staffX, top: staffY[0], rotate: 0 };
    case 7:
      return { left: staffX, top: staffY[1], rotate: 0 };
    case 8:
      return { left: staffX, top: staffY[2], rotate: 0 };
    case 9:
      return { left: staffX, top: staffY[3], rotate: 0 };
    default:
      return { left: 50, top: 50, rotate: 0 };
  }
}
