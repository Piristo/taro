export type ZodiacSign = {
  id: string;
  name: string;
  element: "Огонь" | "Земля" | "Воздух" | "Вода";
  focus: string;
  tone: string;
};

const zodiac: Array<{
  id: string;
  name: string;
  element: ZodiacSign["element"];
  focus: string;
  tone: string;
  start: [number, number];
  end: [number, number];
}> = [
  { id: "capricorn", name: "Козерог", element: "Земля", focus: "структура и цель", tone: "спокойная устойчивость", start: [12, 22], end: [1, 19] },
  { id: "aquarius", name: "Водолей", element: "Воздух", focus: "свобода и идея", tone: "свежий взгляд", start: [1, 20], end: [2, 18] },
  { id: "pisces", name: "Рыбы", element: "Вода", focus: "чувство и интуиция", tone: "мягкая чувствительность", start: [2, 19], end: [3, 20] },
  { id: "aries", name: "Овен", element: "Огонь", focus: "импульс и старт", tone: "смелая энергия", start: [3, 21], end: [4, 19] },
  { id: "taurus", name: "Телец", element: "Земля", focus: "ресурс и опора", tone: "зрелая стабильность", start: [4, 20], end: [5, 20] },
  { id: "gemini", name: "Близнецы", element: "Воздух", focus: "контакт и идеи", tone: "живое любопытство", start: [5, 21], end: [6, 20] },
  { id: "cancer", name: "Рак", element: "Вода", focus: "дом и безопасность", tone: "бережная забота", start: [6, 21], end: [7, 22] },
  { id: "leo", name: "Лев", element: "Огонь", focus: "сердце и выражение", tone: "яркая уверенность", start: [7, 23], end: [8, 22] },
  { id: "virgo", name: "Дева", element: "Земля", focus: "детали и чистота", tone: "точная ясность", start: [8, 23], end: [9, 22] },
  { id: "libra", name: "Весы", element: "Воздух", focus: "баланс и красота", tone: "мягкое равновесие", start: [9, 23], end: [10, 22] },
  { id: "scorpio", name: "Скорпион", element: "Вода", focus: "глубина и трансформация", tone: "сильная глубина", start: [10, 23], end: [11, 21] },
  { id: "sagittarius", name: "Стрелец", element: "Огонь", focus: "смысл и путь", tone: "вдохновляющая широта", start: [11, 22], end: [12, 21] },
];

const isInRange = (month: number, day: number, start: [number, number], end: [number, number]) => {
  if (start[0] === 12 && end[0] === 1) {
    return (month === 12 && day >= start[1]) || (month === 1 && day <= end[1]);
  }
  if (month === start[0] && day >= start[1]) return true;
  if (month === end[0] && day <= end[1]) return true;
  if (month > start[0] && month < end[0]) return true;
  return false;
};

export function getZodiacSign(date: Date): ZodiacSign {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const found = zodiac.find((item) => isInRange(month, day, item.start, item.end));
  if (found) {
    return {
      id: found.id,
      name: found.name,
      element: found.element,
      focus: found.focus,
      tone: found.tone,
    };
  }
  return {
    id: "capricorn",
    name: "Козерог",
    element: "Земля",
    focus: "структура и цель",
    tone: "спокойная устойчивость",
  };
}
