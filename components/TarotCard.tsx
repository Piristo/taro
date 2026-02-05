"use client";

import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import { TarotCardData } from "../lib/types";
import { cn, seededRandom } from "../lib/utils";
import { useCardFlip } from "../hooks/useCardFlip";

type TarotCardProps = {
  card: TarotCardData;
  isRevealed: boolean;
  isReversed: boolean;
  isActive?: boolean;
  positionLabel?: string;
  onFlip?: () => void;
  onHold?: () => void;
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<TarotCardProps["size"]>, string> = {
  sm: "h-[180px] w-[120px]",
  md: "h-[220px] w-[150px]",
  lg: "h-[260px] w-[180px]",
};

export default function TarotCard({
  card,
  isRevealed,
  isReversed,
  isActive,
  positionLabel,
  onFlip,
  onHold,
  size = "md",
}: TarotCardProps) {
  const holdTimer = useRef<number | null>(null);
  const didHold = useRef(false);
  const { rotateY, rotateZ } = useCardFlip({ isRevealed, isReversed });
  const isSmall = size === "sm";
  const arcanaLabel = isSmall ? (card.arcana === "major" ? "Ст." : "Мл.") : card.arcana === "major" ? "Старший" : "Младший";
  const elementLabel = isSmall
    ? card.element === "Воздух"
      ? "Возд."
      : card.element === "Земля"
        ? "Зем."
        : card.element
    : card.element;
  const orientationLabel = isSmall
    ? isReversed
      ? "Перев." : "Прямая"
    : isReversed
      ? "Перевернутая"
      : "Прямая";

  const stars = useMemo(() => {
    const rand = seededRandom(card.seed);
    return Array.from({ length: 14 }).map(() => ({
      cx: 20 + rand() * 160,
      cy: 20 + rand() * 280,
      r: 0.6 + rand() * 1.6,
      o: 0.25 + rand() * 0.5,
    }));
  }, [card.seed]);

  const handlePointerDown = () => {
    didHold.current = false;
    if (!onHold) return;
    holdTimer.current = window.setTimeout(() => {
      didHold.current = true;
      onHold();
    }, 420);
  };

  const cancelHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const handleClick = () => {
    if (didHold.current) return;
    onFlip?.();
  };

  return (
    <div
      className={cn(
        "tarot-card relative",
        sizeClasses[size],
        "cursor-pointer",
        isActive ? "scale-[1.02]" : "scale-100"
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Карта ${card.name}`}
    >
      <motion.div
        className={cn(
          "tarot-card-inner h-full w-full rounded-[20px]",
          isActive ? "glow-amber" : "shadow-ritual"
        )}
        animate={{ rotateY }}
        transition={{ duration: 0.65, ease: [0.22, 0.61, 0.36, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="tarot-card-face tarot-card-back absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--ink-300)]">
            Таро
          </div>
          <div className="h-20 w-20 rounded-full border border-[rgba(218,165,32,0.4)] p-4">
            <div className="h-full w-full rounded-full border border-[rgba(218,165,32,0.35)]" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--ink-200)]">
            Нажмите
          </div>
        </div>

        <div
          className="tarot-card-face tarot-card-front absolute inset-0"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div
            className="flex h-full w-full flex-col items-center justify-between px-3 py-4"
            style={{ transform: `rotate(${rotateZ}deg)` }}
          >
            <div
              className={cn(
                "flex w-full items-center justify-between uppercase text-[var(--ink-300)]",
                isSmall ? "text-[8px] tracking-[0.18em]" : "text-[10px] tracking-[0.2em]"
              )}
            >
              <span>{arcanaLabel}</span>
              <span className="text-[var(--gold-400)]">{elementLabel}</span>
            </div>

            <div className="w-full flex-1">
              <svg viewBox="0 0 200 320" className="h-full w-full">
                <defs>
                  <linearGradient id={`grad-${card.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3a1f12" />
                    <stop offset="50%" stopColor="#1f0f08" />
                    <stop offset="100%" stopColor="#3a1f12" />
                  </linearGradient>
                </defs>
                <rect x="10" y="10" width="180" height="300" rx="20" fill={`url(#grad-${card.id})`} stroke="#8b4513" strokeWidth="1" />
                {stars.map((star, index) => (
                  <circle
                    key={`${card.id}-star-${index}`}
                    cx={star.cx}
                    cy={star.cy}
                    r={star.r}
                    fill="#d9a73b"
                    opacity={star.o}
                  />
                ))}
                <circle cx="100" cy="160" r="46" fill="none" stroke="#d9a73b" strokeWidth="1.4" opacity="0.6" />
                {card.arcana === "major" ? (
                  <path
                    d="M100 112 L114 146 L151 146 L121 168 L132 204 L100 182 L68 204 L79 168 L49 146 L86 146 Z"
                    fill="none"
                    stroke="#d9a73b"
                    strokeWidth="1.4"
                    opacity="0.8"
                  />
                ) : card.suit === "wands" ? (
                  <g stroke="#d9a73b" strokeWidth="2" opacity="0.8" fill="none">
                    <path d="M100 112 L100 210" />
                    <path d="M92 130 L108 140" />
                    <path d="M92 160 L108 170" />
                    <path d="M92 190 L108 200" />
                  </g>
                ) : card.suit === "cups" ? (
                  <g stroke="#d9a73b" strokeWidth="2" opacity="0.8" fill="none">
                    <path d="M70 140 H130" />
                    <path d="M70 140 C70 170 130 170 130 140" />
                    <path d="M82 170 H118" />
                    <path d="M90 170 V190 H110 V170" />
                  </g>
                ) : card.suit === "swords" ? (
                  <g stroke="#d9a73b" strokeWidth="2" opacity="0.8" fill="none">
                    <path d="M100 112 L100 205" />
                    <path d="M90 150 H110" />
                    <path d="M96 205 L104 205 L100 214 Z" />
                  </g>
                ) : (
                  <path
                    d="M100 118 L112 150 L148 150 L119 170 L130 204 L100 184 L70 204 L81 170 L52 150 L88 150 Z"
                    fill="none"
                    stroke="#d9a73b"
                    strokeWidth="1.4"
                    opacity="0.8"
                  />
                )}
                <circle cx="100" cy="160" r="6" fill="#d9a73b" opacity="0.8" />
              </svg>
            </div>

            <div className="flex w-full flex-col items-center gap-1 pb-1">
              <div
                className={cn(
                  "text-center uppercase text-[var(--ink-200)]",
                  isSmall ? "text-[10px] tracking-[0.18em] leading-tight" : "text-sm tracking-[0.2em]"
                )}
              >
                {card.name}
              </div>
              <div
                className={cn(
                  "uppercase text-[var(--gold-400)]",
                  isSmall ? "text-[8px] tracking-[0.2em]" : "text-[10px] tracking-[0.25em]"
                )}
              >
                {orientationLabel}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {positionLabel ? (
        <div className="pointer-events-none absolute -top-3 left-3 rounded-full bg-[rgba(18,10,7,0.85)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--ink-200)] shadow-ritual">
          {positionLabel}
        </div>
      ) : null}
    </div>
  );
}
