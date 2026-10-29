/**
 * Карточки: модель данных для нового магазина.
 *
 * Заготовка: набор из двенадцати карточек с редкостью, палитрой и узором. Магазин,
 * гача и коллекция уже работают, а применение надетой карточки в игре — следующий шаг.
 */

export type CardTier = "base" | "common" | "rare" | "epic" | "legendary" | "divine";

/** Узор внутри карточки: рисуется процедурно, без картинок. */
export type CardPattern = "rings" | "waves" | "stars" | "shards" | "web" | "hexes";

export type Card = {
  id: string;
  name: string;
  motto: string;
  tier: CardTier;
  top: string;
  bottom: string;
  accent: string;
  pattern: CardPattern;
};

export const CARDS: Card[] = [
  {
    id: "card_base",
    name: "Чистый лист",
    motto: "с этого начинают",
    tier: "base",
    top: "#f7fbff",
    bottom: "#cfe6f2",
    accent: "#9fb8c6",
    pattern: "rings"
  },
  {
    id: "card_calm",
    name: "Полярный штиль",
    motto: "ни ветра, ни волны",
    tier: "common",
    top: "#eaf7ff",
    bottom: "#9fd6ee",
    accent: "#4fa9cf",
    pattern: "waves"
  },
  {
    id: "card_wolf",
    name: "Морской волк",
    motto: "море помнит каждого",
    tier: "common",
    top: "#e7f1f5",
    bottom: "#8fb2c4",
    accent: "#4c7f9c",
    pattern: "rings"
  },
  {
    id: "card_salt",
    name: "Соляной ветер",
    motto: "держись за воздух",
    tier: "common",
    top: "#f2fbff",
    bottom: "#b6e2f0",
    accent: "#59c0dc",
    pattern: "waves"
  },
  {
    id: "card_watch",
    name: "Ледяной дозор",
    motto: "никого не пропускает",
    tier: "rare",
    top: "#e6f6ff",
    bottom: "#7cc4e8",
    accent: "#2b8fc4",
    pattern: "hexes"
  },
  {
    id: "card_deep",
    name: "Глубинный свет",
    motto: "видно сквозь толщу",
    tier: "rare",
    top: "#dff3ff",
    bottom: "#5aa6d6",
    accent: "#1f6ea8",
    pattern: "stars"
  },
  {
    id: "card_lighthouse",
    name: "Штормовой маяк",
    motto: "гори, пока не поздно",
    tier: "rare",
    top: "#fff4e2",
    bottom: "#f0b45e",
    accent: "#c98a1e",
    pattern: "web"
  },
  {
    id: "card_compass",
    name: "Снежный компас",
    motto: "север всегда рядом",
    tier: "epic",
    top: "#eaf1ff",
    bottom: "#8f9fe0",
    accent: "#5a63c8",
    pattern: "hexes"
  },
  {
    id: "card_hole",
    name: "Хранитель полыньи",
    motto: "лёд под ним не трещит",
    tier: "epic",
    top: "#e4fbff",
    bottom: "#59c9d6",
    accent: "#1f9aa8",
    pattern: "rings"
  },
  {
    id: "card_aurora",
    name: "Северное сияние",
    motto: "небо легло на лёд",
    tier: "legendary",
    top: "#e9f7f0",
    bottom: "#7ad6b0",
    accent: "#2fae7f",
    pattern: "waves"
  },
  {
    id: "card_seal",
    name: "Печать кракена",
    motto: "три щупальца из восьми",
    tier: "legendary",
    top: "#efe9ff",
    bottom: "#9a86e8",
    accent: "#6a4fd8",
    pattern: "stars"
  },
  {
    id: "card_crown",
    name: "Корона глубин",
    motto: "внизу тоже есть трон",
    tier: "divine",
    top: "#fff0f4",
    bottom: "#e88fa8",
    accent: "#c9365f",
    pattern: "shards"
  }
];
