"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { TarotCardData } from "../lib/types";
import { cn } from "../lib/utils";
import { useCardFlip } from "../hooks/useCardFlip";
import { getRwsImagePath } from "../lib/rws-images";

type TarotCardProps = {
  card: TarotCardData;
  isRevealed: boolean;
  isReversed: boolean;
  isActive?: boolean;
  positionLabel?: string;
  onFlip?: () => void;
  onHold?: () => void;
  size?: "xs" | "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<TarotCardProps["size"]>, string> = {
  xs: "h-[160px] w-[110px]",
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
  const [imageError, setImageError] = useState(false);
  const imagePath = getRwsImagePath(card);
  const showImage = Boolean(imagePath) && !imageError;
  const isSmall = size === "xs" || size === "sm";
  const arcanaLabel = isSmall
    ? card.arcana === "major"
      ? "Ст."
      : "Мл."
    : card.arcana === "major"
      ? "Старший"
      : "Младший";
  const elementLabel = isSmall
    ? card.element === "Воздух"
      ? "Возд."
      : card.element === "Земля"
        ? "Зем."
        : card.element
    : card.element;
  const orientationLabel = isSmall
    ? isReversed
      ? "Перев."
      : "Прямая"
    : isReversed
      ? "Перевернутая"
      : "Прямая";
  const topLabel = card.arcana === "major" ? String(card.number ?? "") : card.rank ?? "";

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
        isActive ? "scale-[1.02]" : "scale-100",
        isRevealed ? "is-revealed" : ""
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
        animate={{
          rotateY,
          scale: isRevealed ? (isActive ? 1.03 : 1.01) : 1,
          y: isRevealed ? (isActive ? -4 : -2) : 0,
        }}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
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
          className={cn(
            "tarot-card-face tarot-card-front absolute inset-0 relative",
            isRevealed ? "shine-sweep" : ""
          )}
        >
          <div
            className="flex h-full w-full flex-col items-center justify-between px-3 py-4"
            style={{ transform: `rotate(${rotateZ}deg)` }}
          >
            <div className="w-full flex-1 px-1 py-2">
              <div className="rws-frame">
                {showImage ? (
                  <Image
                    src={imagePath ?? ""}
                    alt={card.name}
                    className="rws-image"
                    width={300}
                    height={500}
                    sizes="(max-width: 640px) 140px, 200px"
                    onError={() => setImageError(true)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="rws-card"
                    data-arcana={card.arcana}
                    data-suit={card.suit}
                  >
                    <div className="rws-top">{topLabel}</div>
                    <div className="rws-art" data-suit={card.suit} data-arcana={card.arcana}>
                      <div className="rws-glyph">
                        {card.arcana === "major" ? (
                          <svg viewBox="0 0 64 64" width="48" height="48" fill="none">
                            <circle cx="32" cy="32" r="18" stroke="#1f120d" strokeWidth="2" />
                            <path d="M32 14L36 26H48L38 34L42 48L32 40L22 48L26 34L16 26H28L32 14Z" stroke="#1f120d" strokeWidth="2" fill="none" />
                          </svg>
                        ) : card.suit === "cups" ? (
                          <svg viewBox="0 0 64 64" width="44" height="44" fill="none">
                            <path d="M18 24H46" stroke="#1f120d" strokeWidth="2" />
                            <path d="M18 24C18 40 46 40 46 24" stroke="#1f120d" strokeWidth="2" />
                            <path d="M26 40H38" stroke="#1f120d" strokeWidth="2" />
                            <path d="M28 40V50H36V40" stroke="#1f120d" strokeWidth="2" />
                          </svg>
                        ) : card.suit === "wands" ? (
                          <svg viewBox="0 0 64 64" width="44" height="44" fill="none">
                            <path d="M32 14V50" stroke="#1f120d" strokeWidth="2" />
                            <path d="M26 22L38 28" stroke="#1f120d" strokeWidth="2" />
                            <path d="M26 34L38 40" stroke="#1f120d" strokeWidth="2" />
                          </svg>
                        ) : card.suit === "swords" ? (
                          <svg viewBox="0 0 64 64" width="44" height="44" fill="none">
                            <path d="M32 12V48" stroke="#1f120d" strokeWidth="2" />
                            <path d="M24 26H40" stroke="#1f120d" strokeWidth="2" />
                            <path d="M28 48L36 48L32 56Z" stroke="#1f120d" strokeWidth="2" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 64 64" width="44" height="44" fill="none">
                            <circle cx="32" cy="32" r="18" stroke="#1f120d" strokeWidth="2" />
                            <path d="M32 16L36 28H48L38 36L42 48L32 40L22 48L26 36L16 28H28L32 16Z" stroke="#1f120d" strokeWidth="2" fill="none" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="rws-title">{card.name}</div>
                    <div className="rws-orientation">{orientationLabel}</div>
                  </div>
                )}
                <div className="rws-badge">
                  <span>{orientationLabel}</span>
                </div>
                <div className="rws-meta">
                  <span>{arcanaLabel}</span>
                  <span>{elementLabel}</span>
                </div>
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
