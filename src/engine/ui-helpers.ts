export function getWatchColor(watch?: string | null): string {
  switch (watch) {
    case 'Red': return '#ef4444';
    case 'Green': return '#22c55e';
    case 'Blue': return '#3b82f6';
    case 'Brown': return '#a16207';
    case 'Yellow': return '#eab308';
    default: return '#9ca3af';
  }
}

export function getOperationalTime(realDate: Date): { date: Date; shift: 'Day' | 'Night' } {
  const hours = realDate.getHours();
  const d = new Date(realDate);
  if (hours < 8) {
    d.setDate(d.getDate() - 1);
    return { date: d, shift: 'Night' };
  } else if (hours < 18) {
    return { date: d, shift: 'Day' };
  } else {
    return { date: d, shift: 'Night' };
  }
}

export function getCalendarDays(date: Date, shift: 'Day' | 'Night'): ({ date: Date; day: number; color: string } | null)[] {
  return [];
}

export const REGIONS = [
  "New Zealand",
  "Te Hiku",
  "Nga Tai ki te Puku",
  "Te Upoko",
  "Te Ihu"
];

export const REGION_TO_DISTRICTS: Record<string, string[]> = {
  "Te Hiku": ["Auckland", "Waitemata", "Counties Manukau", "Northland"],
  "Nga Tai ki te Puku": ["Waikato", "Bay of Plenty", "Taranaki", "Gisborne"],
  "Te Upoko": ["Wellington", "Manawatu-Whanganui", "Hawkes Bay"],
  "Te Ihu": ["Canterbury", "Otago", "Southland", "Nelson-Marlborough", "West Coast"]
};
