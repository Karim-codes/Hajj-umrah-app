export function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(dateStr?: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr || '—';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr?: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr || '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatDay(dateStr?: string): string {
  const d = parseDate(dateStr);
  if (!d) return '';
  return d.toLocaleDateString('en-GB', { weekday: 'short' });
}

export function daysUntil(dateStr?: string): number | null {
  const d = parseDate(dateStr);
  if (!d) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysBetween(startStr?: string, endStr?: string): number | null {
  const s = parseDate(startStr);
  const e = parseDate(endStr);
  if (!s || !e) return null;
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

export function getCurrentStay(hotels: { hotel1?: any; hotel2?: any } | undefined) {
  if (!hotels) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (const key of ['hotel1', 'hotel2'] as const) {
    const hotel = hotels[key];
    if (!hotel) continue;
    const checkIn = parseDate(hotel.checkIn);
    const checkOut = parseDate(hotel.checkOut);
    if (checkIn && checkOut) {
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      if (now >= checkIn && now <= checkOut) return hotel;
    }
  }
  return null;
}

export function getStepStatus(
  startDate?: string,
  endDate?: string
): 'done' | 'active' | 'upcoming' {
  if (!startDate) return 'upcoming';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = parseDate(startDate);
  const end = endDate ? parseDate(endDate) : start;
  if (!start) return 'upcoming';
  start.setHours(0, 0, 0, 0);
  if (end) end.setHours(0, 0, 0, 0);
  if (end && now > end) return 'done';
  if (now >= start && (!end || now <= end)) return 'active';
  return 'upcoming';
}
