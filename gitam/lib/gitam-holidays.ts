// GITAM University Academic Calendar 2025-26 - Public Holidays
// Extracted from the official academic calendar

export const GITAM_PUBLIC_HOLIDAYS_2025_2026 = [
  "2025-08-15", // Independence Day
  "2025-08-16", // Sri Krishna Janmastami
  "2025-08-27", // Vinayaka Chaturdhi
  "2025-10-02", // Mahatma Gandhi Jayanthi/Vijayadasami

  // October 2025
  "2025-10-20", // Deepavali

  // December 2025 (Even Semester)
  "2025-12-25", // Christmas

  // January 2026 (Even Semester)
  "2026-01-26", // Republic Day

  // March 2026 (Even Semester)
  "2026-03-03", // Holi

  // April 2026 (Even Semester)
  "2026-04-03", // Good Friday
  "2026-04-14", // Ambedkar Jayanthi
]

export function getPublicHolidaysForSemester(startDate: string, endDate: string): string[] {
  const start = new Date(startDate)
  const end = new Date(endDate)

  return GITAM_PUBLIC_HOLIDAYS_2025_2026.filter((holiday) => {
    const holidayDate = new Date(holiday)
    return holidayDate >= start && holidayDate <= end
  })
}
