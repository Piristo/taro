import { useMemo } from "react";

type UseCardFlipOptions = {
  isRevealed: boolean;
  isReversed: boolean;
};

export function useCardFlip({ isRevealed, isReversed }: UseCardFlipOptions) {
  return useMemo(() => {
    return {
      rotateY: isRevealed ? 180 : 0,
      rotateZ: isReversed ? 180 : 0,
      frontOpacity: isRevealed ? 1 : 0,
      backOpacity: isRevealed ? 0 : 1,
    };
  }, [isRevealed, isReversed]);
}
