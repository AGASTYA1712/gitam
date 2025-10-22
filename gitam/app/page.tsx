"use client"

import { useState } from "react"
import SemesterStep from "@/components/semester-step"
import TimetableStep from "@/components/timetable-step"
import ResultsStep from "@/components/results-step"
import { calculateAttendance, type AttendanceCalculations, type SemesterData } from "@/lib/attendance-calculations"

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [timetable, setTimetable] = useState<Record<string, string[]>>({})
  const [semesterData, setSemesterData] = useState<SemesterData | null>(null)
  const [attendanceResult, setAttendanceResult] = useState<AttendanceCalculations | null>(null)

  const nextStep = () => setCurrentStep((prev) => prev + 1)
  const prevStep = () => setCurrentStep((prev) => prev - 1)
  const resetSteps = () => {
    setCurrentStep(0)
    setTimetable({})
    setSemesterData(null)
    setAttendanceResult(null)
  }

  const handleTimetableSubmit = (data: Record<string, string[]>) => {
    setTimetable(data)
    nextStep()
  }

  const handleSemesterSubmit = (data: SemesterData & { holidays?: string[] }) => {
    setSemesterData(data)
    const result = calculateAttendance(timetable, {
      startDate: data.startDate,
      endDate: data.endDate,
      attendance: data.attendance,
      holidays: data.holidays ?? [],
    })
    setAttendanceResult(result)
    nextStep()
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {currentStep === 0 && <TimetableStep onSubmit={handleTimetableSubmit} />}
      {currentStep === 1 && <SemesterStep timetable={timetable} onSubmit={handleSemesterSubmit} onBack={prevStep} />}
      {currentStep === 2 && semesterData && attendanceResult && (
        <ResultsStep timetable={timetable} semesterData={semesterData} onReset={resetSteps} />
      )}
    </div>
  )
}
