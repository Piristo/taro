import { TarotCardData } from "./types";

const majorFiles: Record<number, string> = {
  0: "00-TheFool.jpg",
  1: "01-TheMagician.jpg",
  2: "02-TheHighPriestess.jpg",
  3: "03-TheEmpress.jpg",
  4: "04-TheEmperor.jpg",
  5: "05-TheHierophant.jpg",
  6: "06-TheLovers.jpg",
  7: "07-TheChariot.jpg",
  8: "08-Strength.jpg",
  9: "09-TheHermit.jpg",
  10: "10-WheelOfFortune.jpg",
  11: "11-Justice.jpg",
  12: "12-TheHangedMan.jpg",
  13: "13-Death.jpg",
  14: "14-Temperance.jpg",
  15: "15-TheDevil.jpg",
  16: "16-TheTower.jpg",
  17: "17-TheStar.jpg",
  18: "18-TheMoon.jpg",
  19: "19-TheSun.jpg",
  20: "20-Judgement.jpg",
  21: "21-TheWorld.jpg",
};

const suitMap: Record<NonNullable<TarotCardData["suit"]>, string> = {
  cups: "Cups",
  wands: "Wands",
  swords: "Swords",
  pentacles: "Pentacles",
};

const rankMap: Record<string, string> = {
  "Туз": "01",
  "Двойка": "02",
  "Тройка": "03",
  "Четверка": "04",
  "Пятерка": "05",
  "Шестерка": "06",
  "Семерка": "07",
  "Восьмерка": "08",
  "Девятка": "09",
  "Десятка": "10",
  "Паж": "11",
  "Рыцарь": "12",
  "Королева": "13",
  "Король": "14",
};

export function getRwsImagePath(card: TarotCardData) {
  if (card.arcana === "major" && typeof card.number === "number") {
    const file = majorFiles[card.number];
    return file ? `/rws/${file}` : null;
  }

  if (card.arcana === "minor" && card.suit && card.rank) {
    const suit = suitMap[card.suit];
    const rank = rankMap[card.rank];
    if (suit && rank) {
      return `/rws/${suit}${rank}.jpg`;
    }
  }

  return null;
}
