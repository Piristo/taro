import { TarotCardData } from "./types";

const majorMeanings: Record<
  string,
  { upright: string; reversed: string }
> = {
  "major-00": {
    upright: "Свобода, начало пути, спонтанность, вера в жизнь.",
    reversed: "Безрассудство, остановка, страх нового.",
  },
  "major-01": {
    upright: "Воля, мастерство, инициатива, проявление силы.",
    reversed: "Манипуляция, растерянность, слабая концентрация.",
  },
  "major-02": {
    upright: "Интуиция, тайна, глубинное знание, внутренний голос.",
    reversed: "Скрытая информация, сомнение, шум вместо тишины.",
  },
  "major-03": {
    upright: "Плодородие, рост, забота, творческое изобилие.",
    reversed: "Перекос в заботе, зависимость, истощение.",
  },
  "major-04": {
    upright: "Структура, стабильность, власть, ответственность.",
    reversed: "Жесткость, контроль, подавление живого.",
  },
  "major-05": {
    upright: "Традиция, наставник, обучение, ценности.",
    reversed: "Конформизм, отрыв от сути, бунт против смысла.",
  },
  "major-06": {
    upright: "Выбор, союз, согласие ценностей, близость.",
    reversed: "Разлад, сомнение, конфликт ценностей.",
  },
  "major-07": {
    upright: "Движение, победа, самоконтроль, путь.",
    reversed: "Срыв курса, спешка, потеря управления.",
  },
  "major-08": {
    upright: "Внутренняя сила, терпение, мягкая власть.",
    reversed: "Сомнение, слабость, подавленные инстинкты.",
  },
  "major-09": {
    upright: "Уединение, мудрость, поиск, свет внутри.",
    reversed: "Изоляция, холод, уход от контакта.",
  },
  "major-10": {
    upright: "Цикл, перемены, поворот судьбы, шанс.",
    reversed: "Застой, задержка перемен, сопротивление циклу.",
  },
  "major-11": {
    upright: "Справедливость, баланс, закон, ответ.",
    reversed: "Смещение, предвзятость, отсутствие баланса.",
  },
  "major-12": {
    upright: "Пауза, иной взгляд, жертва ради смысла.",
    reversed: "Застревание, сопротивление, бесплодная задержка.",
  },
  "major-13": {
    upright: "Завершение, трансформация, освобождение.",
    reversed: "Сопротивление переменам, удержание прошлого.",
  },
  "major-14": {
    upright: "Гармония, умеренность, исцеление, ритм.",
    reversed: "Перекос, дисбаланс, нетерпение.",
  },
  "major-15": {
    upright: "Привязанность, искушение, материальная связь.",
    reversed: "Освобождение, выход из зависимости.",
  },
  "major-16": {
    upright: "Крушение иллюзий, резкий поворот, освобождение.",
    reversed: "Сдерживание перемен, кризис затянут.",
  },
  "major-17": {
    upright: "Надежда, вдохновение, исцеление, свет.",
    reversed: "Усталость, угасание веры, сомнение.",
  },
  "major-18": {
    upright: "Подсознание, туман, страхи, образы.",
    reversed: "Прояснение, раскрытие тайн, выход из страха.",
  },
  "major-19": {
    upright: "Радость, успех, ясность, жизненная сила.",
    reversed: "Затмение радости, сомнение в успехе.",
  },
  "major-20": {
    upright: "Пробуждение, итог, призвание, зов.",
    reversed: "Отложенный зов, страх решения.",
  },
  "major-21": {
    upright: "Завершение, целостность, гармония, результат.",
    reversed: "Незакрытый цикл, незавершенность.",
  },
};

const rankMap: Record<
  string,
  { upright: string; reversed: string }
> = {
  "Туз": { upright: "Начало и потенциал", reversed: "Потенциал блокирован" },
  "Двойка": { upright: "Баланс и выбор", reversed: "Внутренний разлад" },
  "Тройка": { upright: "Рост и проявление", reversed: "Рост замедлен" },
  "Четверка": { upright: "Стабильность и опора", reversed: "Застой или жесткость" },
  "Пятерка": { upright: "Напряжение и испытание", reversed: "Конфликт затянут" },
  "Шестерка": { upright: "Движение и союз", reversed: "Движение нарушено" },
  "Семерка": { upright: "Стратегия и стойкость", reversed: "Потеря фокуса" },
  "Восьмерка": { upright: "Навык и мастерство", reversed: "Рутина без смысла" },
  "Девятка": { upright: "Зрелость и глубина", reversed: "Настороженность" },
  "Десятка": { upright: "Кульминация и итог", reversed: "Перегрузка" },
  "Паж": { upright: "Весть и любопытство", reversed: "Задержка новостей" },
  "Рыцарь": { upright: "Импульс и движение", reversed: "Импульс без контроля" },
  "Королева": { upright: "Зрелая поддержка", reversed: "Скрытая напряженность" },
  "Король": { upright: "Ответственность и власть", reversed: "Жесткость власти" },
};

const suitMap: Record<
  NonNullable<TarotCardData["suit"]>,
  { label: string; domain: string }
> = {
  wands: { label: "Жезлы", domain: "воли, импульса и действия" },
  cups: { label: "Кубки", domain: "чувств, близости и отношений" },
  swords: { label: "Мечи", domain: "мыслей, решений и ясности" },
  pentacles: { label: "Пентакли", domain: "ресурса, тела и устойчивости" },
};

export function getRwsMeaning(card: TarotCardData, isReversed: boolean) {
  if (card.arcana === "major") {
    const meaning = majorMeanings[card.id];
    if (meaning) return isReversed ? meaning.reversed : meaning.upright;
    return isReversed ? card.reversed.meaning : card.upright.meaning;
  }

  if (!card.rank || !card.suit) {
    return isReversed ? card.reversed.meaning : card.upright.meaning;
  }

  const rank = rankMap[card.rank];
  const suit = suitMap[card.suit];
  const base = isReversed ? rank?.reversed ?? "Тема требует пересмотра" : rank?.upright ?? "Проявление сути";
  const domain = suit?.domain ?? "повседневных обстоятельств";
  return `${base}. Сфера ${domain}.`;
}
