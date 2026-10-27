/**
 * Даты и суточные задания.
 *
 * Ежедневка выбирается детерминированно из даты: один и тот же день всегда даёт
 * одно и то же задание, а хеш используется как «жеребьёвка» по массиву заданий.
 */

/** Локальная дата в виде YYYY-MM-DD (без UTC-сдвигов). */
export function localDateKey(date?: Date): string {
  const d = date || new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function yesterdayDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateKey(d);
}

/** FNV-1a: 32-битный хеш строки, всегда неотрицательный. */
export function dailyHash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
