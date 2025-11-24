/*
  Lê um arquivo Txt que contém os feriados Nacionais do ano.
*/

import userSettings from '../services/UserSettings';

export interface UpcomingHolidayItem {
  id: string;
  name: string;
  dateText: string;
}

interface RawHoliday {
  name: string;
  date: Date;
}

interface GroupedHoliday {
  name: string;
  start: Date;
  end: Date;
}

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/**
 * Busca o conteúdo dos feriados do servidor
 */
async function fetchHolidaysContent(): Promise<string> {
  const baseUrl = userSettings.getBaseUrl();
  const url = `${baseUrl}/melissa/ExportNationalHolidaysToTxt`;
  console.log('[Holidays] Fetching from:', url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    console.log('[Holidays] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const content = await response.text();
    console.log('[Holidays] Content length:', content.length);
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

const monthAbbrevPtBr: Record<number, string> = {
  0: 'Jan.',
  1: 'Fev.',
  2: 'Mar.',
  3: 'Abr.',
  4: 'Mai.',
  5: 'Jun.',
  6: 'Jul.',
  7: 'Ago.',
  8: 'Set.',
  9: 'Out.',
  10: 'Nov.',
  11: 'Dez.'
};

export const formatPtBrCustom = (date: Date): string => {
  const d = pad2(date.getDate());
  const m = monthAbbrevPtBr[date.getMonth()];
  const y = date.getFullYear();
  return `${d} De ${m} De ${y}`; // ex.: 24 De Dez. De 2025
};

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const isConsecutiveDay = (prev: Date, curr: Date) =>
  startOfDay(addDays(prev, 1)).getTime() === startOfDay(curr).getTime();

const parseHolidayLine = (line: string): RawHoliday | null => {
  // Formato: "Nome: dd/mm/yyyy"
  const [namePart, datePart] = line.split(':').map((s) => s?.trim());
  if (!namePart || !datePart) return null;

  const [dd, mm, yyyy] = datePart.split('/').map((s) => parseInt(s, 10));
  if (!dd || !mm || !yyyy) return null;
  const date = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(date.getTime())) return null;
  return { name: namePart, date };
};

const groupConsecutiveHolidays = (items: RawHoliday[]): GroupedHoliday[] => {
  if (items.length === 0) return [];
  const sorted = [...items].sort((a, b) => a.date.getTime() - b.date.getTime());
  const groups: GroupedHoliday[] = [];

  let current: GroupedHoliday | null = null;
  for (const item of sorted) {
    if (!current) {
      current = { name: item.name, start: item.date, end: item.date };
      continue;
    }
    if (current.name === item.name && isConsecutiveDay(current.end, item.date)) {
      current.end = item.date;
      continue;
    }
    groups.push(current);
    current = { name: item.name, start: item.date, end: item.date };
  }
  if (current) groups.push(current);
  return groups;
};

const toUpcoming = (groups: GroupedHoliday[], now = new Date()): GroupedHoliday[] => {
  const today = startOfDay(now).getTime();
  return groups
    .filter((g) => startOfDay(g.end).getTime() >= today)
    .sort((a, b) => startOfDay(a.start).getTime() - startOfDay(b.start).getTime());
};

const toDisplayItems = (groups: GroupedHoliday[]): UpcomingHolidayItem[] =>
  groups.map((g) => {
    const singleDay = startOfDay(g.start).getTime() === startOfDay(g.end).getTime();
    const dateText = singleDay
      ? `${formatPtBrCustom(g.start)}`
      : `De ${formatPtBrCustom(g.start)} At\u00E9 ${formatPtBrCustom(g.end)}`;
    return {
      id: `${g.name}-${g.start.toISOString()}`,
      name: g.name,
      dateText
    };
  });
export async function getUpcomingHolidays(limit = 2): Promise<UpcomingHolidayItem[]> {
  try {
    const content = await fetchHolidaysContent();

    const lines = content
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const raw: RawHoliday[] = lines
      .map(parseHolidayLine)
      .filter((x): x is RawHoliday => !!x);

    const grouped = groupConsecutiveHolidays(raw);
    const upcoming = toUpcoming(grouped);
    const display = toDisplayItems(upcoming).slice(0, Math.max(0, limit));
    return display;
  } catch (e) {
    console.warn('[Holidays] Falha ao obter os feriados pelo arquivo Txt:', e);
    return [];
  }
}
export type HolidayRange = { name: string; start: Date; end: Date };

const expandRangeToDates = (range: HolidayRange): Date[] => {
  const dates: Date[] = [];
  let d = startOfDay(range.start);
  const end = startOfDay(range.end);
  while (d.getTime() <= end.getTime()) {
    dates.push(new Date(d));
    d = addDays(d, 1);
  }
  return dates;
};

const ymd = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

async function loadGrouped(): Promise<HolidayRange[]> {
  const content = await fetchHolidaysContent();
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const raw: RawHoliday[] = lines
    .map(parseHolidayLine)
    .filter((x): x is RawHoliday => !!x);
  return groupConsecutiveHolidays(raw);
}

export async function getHolidayRangesForYear(year: number): Promise<HolidayRange[]> {
  try {
    const grouped = await loadGrouped();
    return grouped.filter((g) => g.start.getFullYear() === year || g.end.getFullYear() === year);
  } catch (e) {
    console.warn('[Holidays] Falha ao obter intervalos do ano:', e);
    return [];
  }
}

export async function getHolidayDateStringsForYear(year: number): Promise<string[]> {
  try {
    const ranges = await getHolidayRangesForYear(year);
    const allDays = ranges.flatMap(expandRangeToDates);
    const inYear = allDays.filter((d) => d.getFullYear() === year);
    const uniq = Array.from(new Set(inYear.map(ymd)));
    return uniq.sort();
  } catch (e) {
    console.warn('[Holidays] Falha ao obter String Data:', e);
    return [];
  }
}





