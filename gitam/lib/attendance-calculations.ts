export interface SemesterData {
  startDate: string
  endDate: string
  attendance: Record<string, number>
  holidays?: string[]
}

export interface AttendanceCalculations {
  subjects: string[]
  overallAttendanceNow: number
  bestCaseOverallAttendance: number
  totalWeeks: number
  totalDays: number
  daysRemaining: number
  isEligibleOverall: boolean
  isBestCaseEligibleOverall: boolean
  eligibilityNow: Record<string, boolean>
  bestCaseEligibility: Record<string, boolean>
  futureAttendanceNeeded: Record<string, number>
  recommendations: Record<string, string>
  totalClassesTillEnd: Record<string, number>
  currentAttendedClasses: Record<string, number>
  classesPerSubject: Record<string, number>
  bestCaseAttendance: Record<string, number>
}

function countWorkingDays(start: Date, end: Date, holidays: string[] = []) {
  let count = 0
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay()
    const iso = d.toISOString().split("T")[0]
    if (day !== 0 && day !== 6 && !holidays.includes(iso)) count++
  }
  return count
}

export function calculateAttendance(
  timetable: Record<string, string[]>,
  semesterData: SemesterData,
): AttendanceCalculations {
  const startDate = new Date(semesterData.startDate)
  const endDate = new Date(semesterData.endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const holidays = semesterData.holidays || []

  const totalDays = countWorkingDays(startDate, endDate, holidays)
  const daysElapsed = countWorkingDays(startDate, today < startDate ? startDate : today, holidays)
  const daysRemaining = Math.max(0, totalDays - daysElapsed)

  // Subjects
  const subjects = Array.from(
    new Set(
      Object.values(timetable)
        .flat()
        .filter(Boolean)
        .map((s) => s.trim()),
    ),
  ).sort()

  // Classes per subject per week
  const classesPerSubject: Record<string, number> = {}
  subjects.forEach((subject) => {
    let count = 0
    Object.values(timetable).forEach((slots) => {
      if (slots.includes(subject)) count++
    })
    classesPerSubject[subject] = count
  })

  // Total classes till end (consider only working days)
  const totalClassesTillEnd: Record<string, number> = {}
  subjects.forEach((subject) => {
    const weeklyCount = classesPerSubject[subject]
    totalClassesTillEnd[subject] = Math.round((weeklyCount / 5) * totalDays)
  })

  // Current attended classes based on entered attendance percentage
  const currentAttendedClasses: Record<string, number> = {}
  subjects.forEach((subject) => {
    const weeklyCount = classesPerSubject[subject]
    const classesHeld = Math.round((weeklyCount / 5) * daysElapsed)
    const attendancePercentage = semesterData.attendance[subject] || 0
    currentAttendedClasses[subject] = Math.round((attendancePercentage / 100) * classesHeld)
  })

  let totalAttended = 0
  let totalHeld = 0
  subjects.forEach((subject) => {
    totalAttended += currentAttendedClasses[subject]
    totalHeld += Math.round((classesPerSubject[subject] / 5) * daysElapsed)
  })
  const overallAttendanceNow = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0

  // Best case attendance
  const bestCaseAttendance: Record<string, number> = {}
  subjects.forEach((subject) => {
    const attended = currentAttendedClasses[subject] + daysRemaining * (classesPerSubject[subject] / 5)
    bestCaseAttendance[subject] =
      totalClassesTillEnd[subject] > 0 ? Math.min(100, (attended / totalClassesTillEnd[subject]) * 100) : 0
  })
  const bestCaseOverallAttendance =
    subjects.length > 0
      ? Math.min(100, subjects.reduce((sum, s) => sum + bestCaseAttendance[s], 0) / subjects.length)
      : 0

  // Eligibility
  const eligibilityNow: Record<string, boolean> = {}
  const bestCaseEligibility: Record<string, boolean> = {}
  subjects.forEach((subject) => {
    eligibilityNow[subject] = currentAttendedClasses[subject] / totalClassesTillEnd[subject] >= 0.65
    bestCaseEligibility[subject] = bestCaseAttendance[subject] >= 65
  })
  const isEligibleOverall = overallAttendanceNow >= 75 && Object.values(eligibilityNow).every(Boolean)
  const isBestCaseEligibleOverall = bestCaseOverallAttendance >= 75 && Object.values(bestCaseEligibility).every(Boolean)

  // Future attendance needed
  const futureAttendanceNeeded: Record<string, number> = {}
  subjects.forEach((subject) => {
    const classesRemaining = totalClassesTillEnd[subject] - currentAttendedClasses[subject]
    const classesNeeded = Math.ceil(totalClassesTillEnd[subject] * 0.65) - currentAttendedClasses[subject]
    futureAttendanceNeeded[subject] =
      classesRemaining > 0 ? Math.min(100, Math.max(0, (classesNeeded / classesRemaining) * 100)) : 0
  })

  // Recommendations
  const recommendations: Record<string, string> = {}
  subjects.forEach((subject) => {
    const perc = (currentAttendedClasses[subject] / totalClassesTillEnd[subject]) * 100
    if (perc >= 75) recommendations[subject] = "on-track"
    else if (perc >= 65) recommendations[subject] = futureAttendanceNeeded[subject] <= 50 ? "on-track" : "caution"
    else recommendations[subject] = "critical"
  })

  return {
    subjects,
    overallAttendanceNow,
    bestCaseOverallAttendance,
    totalWeeks: Math.ceil(totalDays / 5),
    totalDays,
    daysRemaining,
    isEligibleOverall,
    isBestCaseEligibleOverall,
    eligibilityNow,
    bestCaseEligibility,
    futureAttendanceNeeded,
    recommendations,
    totalClassesTillEnd,
    currentAttendedClasses,
    classesPerSubject,
    bestCaseAttendance,
  }
}

export function getRecommendationMessage(status: string, subject: string, futureNeeded: number): string {
  switch (status) {
    case "on-track":
      return "You're on track! Maintain your current attendance."
    case "caution":
      return `Attend at least ${futureNeeded}% of remaining classes to meet 65% requirement.`
    case "critical":
      return "Critical! Attend all remaining classes to meet 65% requirement."
    default:
      return ""
  }
}
