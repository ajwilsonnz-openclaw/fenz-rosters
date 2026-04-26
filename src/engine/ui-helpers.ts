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

export function getCalendarDays(viewDate: Date, shift: 'Day' | 'Night'): ({ date: Date; day: number; color: string } | null)[] {
  const year = viewDate.getUTCFullYear();
  const month = viewDate.getUTCMonth();
  
  // First day of month
  const firstDay = new Date(Date.UTC(year, month, 1));
  const startingDayOfWeek = firstDay.getUTCDay(); // 0 (Sun) to 6 (Sat)
  
  // Total days in month
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const totalDays = lastDay.getUTCDate();
  
  const days: ({ date: Date; day: number; color: string } | null)[] = [];
  
  // Padding for start of month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Fill in days
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(Date.UTC(year, month, d));
    const { getOnDutyWatch } = require('./watch-math');
    const onDutyWatch = getOnDutyWatch(date, shift);
    days.push({
      date,
      day: d,
      color: getWatchColor(onDutyWatch)
    });
  }
  
  return days;
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
