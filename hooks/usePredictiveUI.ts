import { useMemo } from "react";
import { TarotSpread, TarotSession } from "../lib/types";

type PredictiveResult = {
  recommendedId?: string;
  message: string;
};

export function usePredictiveUI(spreads: TarotSpread[], history: TarotSession[]): PredictiveResult {
  return useMemo(() => {
    const hour = new Date().getHours();
    const morning = hour >= 6 && hour <= 11;
    const evening = hour >= 18 || hour <= 1;

    let recommended = spreads.find((spread) => spread.id === "daily-3");
    let message = "Подсказка дня: выберите расклад, который звучит ближе всего.";

    if (history.length > 2) {
      recommended = spreads.find((spread) => spread.id === "nine-grid") ?? recommended;
      message = "Вы готовы к глубине: попробуйте 9-карточный анализ.";
    }

    if (morning) {
      recommended = spreads.find((spread) => spread.id === "daily-3") ?? recommended;
      message = "Утренний фокус: короткий расклад, чтобы настроить день.";
    }

    if (evening) {
      recommended = spreads.find((spread) => spread.id === "five-heart") ?? recommended;
      message = "Вечерняя мягкость: расклад о чувствах и балансе.";
    }

    return { recommendedId: recommended?.id, message };
  }, [history.length, spreads]);
}
