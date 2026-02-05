import { useMemo, useRef, useState } from "react";
import type { TouchEvent } from "react";
import { clamp } from "../lib/utils";

type PullToRefreshOptions = {
  onRefresh: () => void;
  threshold?: number;
  maxPull?: number;
};

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 140,
}: PullToRefreshOptions) {
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pull, setPull] = useState(0);
  const [ready, setReady] = useState(false);

  const handlers = useMemo(
    () => ({
      onTouchStart: (event: TouchEvent) => {
        if (window.scrollY > 2) return;
        startY.current = event.touches[0].clientY;
        pulling.current = true;
      },
      onTouchMove: (event: TouchEvent) => {
        if (!pulling.current) return;
        const currentY = event.touches[0].clientY;
        const delta = clamp(currentY - startY.current, 0, maxPull);
        setPull(delta);
        setReady(delta >= threshold);
      },
      onTouchEnd: () => {
        if (ready) onRefresh();
        pulling.current = false;
        setPull(0);
        setReady(false);
      },
      onTouchCancel: () => {
        pulling.current = false;
        setPull(0);
        setReady(false);
      },
    }),
    [maxPull, onRefresh, ready, threshold]
  );

  return { pull, ready, handlers };
}
