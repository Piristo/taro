import { useMemo, useRef } from "react";
import type { TouchEvent } from "react";

type SwipeHandlers = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
};

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 40,
}: SwipeHandlers) {
  const startX = useRef(0);
  const startY = useRef(0);
  const isSwiping = useRef(false);

  return useMemo(
    () => ({
      onTouchStart: (event: TouchEvent) => {
        const touch = event.touches[0];
        startX.current = touch.clientX;
        startY.current = touch.clientY;
        isSwiping.current = true;
      },
      onTouchEnd: (event: TouchEvent) => {
        if (!isSwiping.current) return;
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - startX.current;
        const deltaY = touch.clientY - startY.current;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        if (Math.max(absX, absY) < threshold) return;
        if (absX > absY) {
          if (deltaX > 0) onSwipeRight?.();
          else onSwipeLeft?.();
        } else {
          if (deltaY > 0) onSwipeDown?.();
          else onSwipeUp?.();
        }
        isSwiping.current = false;
      },
      onTouchCancel: () => {
        isSwiping.current = false;
      },
    }),
    [onSwipeDown, onSwipeLeft, onSwipeRight, onSwipeUp, threshold]
  );
}
