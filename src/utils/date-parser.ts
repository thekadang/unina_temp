// Parse period string like "2026.08.05 - 2026.08.15 (11일)" to date objects
// Supports various formats: . / - as separators, with or without leading zeros
export function parsePeriod(period: string): {
  startDate: Date;
  endDate: Date;
  totalDays: number;
} | null {
  try {
    // Match pattern: YYYY[./-]M[M][./-]D[D] - YYYY[./-]M[M][./-]D[D] (N일)
    // Supports . / - as separators and optional leading zeros for month/day
    const match = period.match(/(\d{4})[.\/\-](\d{1,2})[.\/\-](\d{1,2})\s*[-~]\s*(\d{4})[.\/\-](\d{1,2})[.\/\-](\d{1,2})\s*\((\d+)일\)/);
    
    if (!match) {
      return null;
    }

    const [, startYear, startMonth, startDay, endYear, endMonth, endDay, days] = match;
    
    const startDate = new Date(
      parseInt(startYear),
      parseInt(startMonth) - 1, // JavaScript months are 0-indexed
      parseInt(startDay)
    );
    
    const endDate = new Date(
      parseInt(endYear),
      parseInt(endMonth) - 1,
      parseInt(endDay)
    );
    
    return {
      startDate,
      endDate,
      totalDays: parseInt(days)
    };
  } catch (error) {
    console.error('Error parsing period:', error);
    return null;
  }
}

// Format date to Korean string
export function formatDateKorean(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}년 ${month}월 ${day}일`;
}

// Get week start (Sunday) and week end (Saturday) for a given date
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  const start = new Date(date);
  start.setDate(date.getDate() - dayOfWeek);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return { start, end };
}

// Get all weeks between two dates
export function getWeeksBetween(startDate: Date, endDate: Date): Array<{ start: Date; end: Date }> {
  const weeks: Array<{ start: Date; end: Date }> = [];
  
  const tripStartWeek = getWeekRange(startDate);
  const tripEndWeek = getWeekRange(endDate);
  
  let currentWeek = tripStartWeek;
  
  while (currentWeek.start <= tripEndWeek.start) {
    weeks.push({
      start: new Date(currentWeek.start),
      end: new Date(currentWeek.end)
    });
    
    // Move to next week
    const nextStart = new Date(currentWeek.start);
    nextStart.setDate(nextStart.getDate() + 7);
    currentWeek = getWeekRange(nextStart);
  }
  
  return weeks;
}

// Get Korean month name
export function getKoreanMonth(date: Date): string {
  return `${date.getMonth() + 1}월`;
}