/** Calendar reservations use the upper bound of the package's contract duration. */
const packages: Record<number, { hours: number; label: string }> = {
  1: { hours: 2, label: 'שעה עד שעתיים' },
  2: { hours: 3, label: 'שעתיים עד שלוש' },
  3: { hours: 3, label: 'שלוש שעות' },
  4: { hours: 3, label: 'עד שלוש שעות' },
  5: { hours: 6, label: 'עד שש שעות' },
  6: { hours: 9, label: 'עד תשע שעות' },
};

export const durationOptions = [1, 2, 3, 6, 9];

export function packageDurationHours(packageType: number): number | undefined {
  return packages[packageType]?.hours;
}

const russianLabels: Record<number, string> = {
  1: 'От одного до двух часов',
  2: 'От двух до трёх часов',
  3: 'Три часа',
  4: 'До трёх часов',
  5: 'До шести часов',
  6: 'До девяти часов',
};

export function packageDurationLabel(packageType: number, locale: 'he' | 'ru' = 'he'): string {
  if (locale === 'ru') return russianLabels[packageType] || '';
  return packages[packageType]?.label || '';
}

export function sessionDurationHours(session: {
  package_type: number;
  workflow?: { duration?: string } | null;
}): number | undefined {
  const saved = Number(session.workflow?.duration);
  return durationOptions.includes(saved) ? saved : packageDurationHours(session.package_type);
}
