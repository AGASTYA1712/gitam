"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { calculateAttendance, getRecommendationMessage, type SemesterData } from "@/lib/attendance-calculations"

interface ResultsStepProps {
  timetable: Record<string, string[]>
  semesterData: SemesterData
  onReset: () => void
}

export default function ResultsStep({ timetable, semesterData, onReset }: ResultsStepProps) {
  const calculations = useMemo(() => {
    return calculateAttendance(timetable, semesterData)
  }, [timetable, semesterData])

  const uniqueSubjects = useMemo(() => {
    return Array.from(new Set(calculations.subjects))
  }, [calculations.subjects])

  const endDateLabel = useMemo(
    () => (semesterData.endDate ? new Date(semesterData.endDate).toLocaleDateString() : "—"),
    [semesterData.endDate],
  )

  return (
    <div className="space-y-6">
      {/* Overall Status Card */}
      <Card className="p-8 bg-white shadow-lg border-l-4 border-blue-600">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Your Attendance Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Overall Attendance</p>
            <p className="text-3xl font-bold text-blue-600">{calculations.overallAttendanceNow.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-1">Required: 75%</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Semester Duration</p>
            <p className="text-3xl font-bold text-indigo-600">{calculations.totalWeeks}</p>
            <p className="text-xs text-gray-500 mt-1">weeks ({calculations.totalDays} days)</p>
          </div>
          <div className={`p-4 rounded-lg ${calculations.isEligibleOverall ? "bg-green-50" : "bg-red-50"}`}>
            <p className="text-sm text-gray-600 mb-1">Eligibility Status</p>
            <p className={`text-3xl font-bold ${calculations.isEligibleOverall ? "text-green-600" : "text-red-600"}`}>
              {calculations.isEligibleOverall ? "✓ Eligible" : "✗ Not Eligible"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg border-l-4 border-purple-600">
        <h2 className="text-2xl font-bold text-purple-900 mb-4">Best-Case Scenario Projection</h2>
        <p className="text-sm text-gray-600 mb-4">
          If you attend all remaining classes until {endDateLabel} ({calculations.daysRemaining} days remaining):
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Projected Overall Attendance</p>
            <p className="text-3xl font-bold text-purple-600">{calculations.bestCaseOverallAttendance.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-1">Required: 75%</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Days Remaining</p>
            <p className="text-3xl font-bold text-purple-600">{calculations.daysRemaining}</p>
            <p className="text-xs text-gray-500 mt-1">days to semester end</p>
          </div>
          <div
            className={`p-4 rounded-lg ${calculations.isBestCaseEligibleOverall ? "bg-green-100" : "bg-orange-100"}`}
          >
            <p className="text-sm text-gray-600 mb-1">Best-Case Eligibility</p>
            <p
              className={`text-3xl font-bold ${calculations.isBestCaseEligibleOverall ? "text-green-600" : "text-orange-600"}`}
            >
              {calculations.isBestCaseEligibleOverall ? "✓ Eligible" : "✗ Not Eligible"}
            </p>
          </div>
        </div>
      </Card>

      {/* Subject-wise Analysis */}
      <Card className="p-8 bg-white shadow-lg">
        <h3 className="text-xl font-bold text-blue-900 mb-6">Subject-wise Analysis</h3>
        <div className="space-y-4">
          {uniqueSubjects.map((subject) => {
            const isEligible = calculations.eligibilityNow[subject]
            const currentAttendance = semesterData.attendance[subject] || 0
            const futureNeeded = calculations.futureAttendanceNeeded[subject]
            const totalClasses = calculations.totalClassesTillEnd[subject]
            const attendedClasses = calculations.currentAttendedClasses[subject]
            const bestCaseAttendance = calculations.bestCaseAttendance[subject]
            const bestCaseEligible = calculations.bestCaseEligibility[subject]

            const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0

            return (
              <div
                key={subject}
                className={`p-4 rounded-lg border-l-4 ${
                  isEligible ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-800">{subject}</h4>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isEligible ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                    }`}
                  >
                    {currentAttendance}%
                  </span>
                </div>

                {/* Attendance Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Current Progress</span>
                    <span>
                      {attendedClasses} / {totalClasses} classes
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${isEligible ? "bg-green-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(100, attendancePercentage)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Classes/Week</p>
                    <p className="font-bold text-lg">{calculations.classesPerSubject[subject]}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Till End</p>
                    <p className="font-bold text-lg">{totalClasses}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Attended</p>
                    <p className="font-bold text-lg">{attendedClasses}</p>
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg mb-3 border border-purple-200">
                  <p className="text-sm font-semibold text-purple-900 mb-2">If you attend all remaining classes:</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">Projected Attendance</p>
                      <p className="text-lg font-bold text-purple-600">{bestCaseAttendance.toFixed(2)}%</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        bestCaseEligible ? "bg-green-200 text-green-800" : "bg-orange-200 text-orange-800"
                      }`}
                    >
                      {bestCaseEligible ? "✓ Eligible" : "✗ Not Eligible"}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Future attendance needed: <span className="font-bold text-blue-600">{futureNeeded}%</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Personalized Recommendations</h3>
        <ul className="space-y-2 text-gray-700">
          {uniqueSubjects.map((subject) => {
            const status = calculations.recommendations[subject]
            const futureNeeded = calculations.futureAttendanceNeeded[subject]
            const message = getRecommendationMessage(status, subject, futureNeeded)

            const iconColor =
              status === "on-track" ? "text-green-600" : status === "caution" ? "text-orange-600" : "text-red-600"
            const icon = status === "on-track" ? "✓" : status === "caution" ? "⚠" : "✗"

            return (
              <li key={subject} className="flex items-start gap-2">
                <span className={`${iconColor} font-bold`}>{icon}</span>
                <span>
                  <strong>{subject}:</strong> {message}
                </span>
              </li>
            )
          })}
        </ul>
      </Card>

      {/* Summary Statistics */}
      <Card className="p-8 bg-white shadow-lg">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Subjects</p>
            <p className="text-2xl font-bold text-gray-800">{uniqueSubjects.length}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Subjects Meeting 65% Threshold</p>
            <p className="text-2xl font-bold text-green-600">
              {uniqueSubjects.filter((s) => calculations.eligibilityNow[s]).length}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Classes Till End</p>
            <p className="text-2xl font-bold text-gray-800">
              {Object.values(calculations.totalClassesTillEnd).reduce((a, b) => a + b, 0)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Classes Attended</p>
            <p className="text-2xl font-bold text-gray-800">
              {Object.values(calculations.currentAttendedClasses).reduce((a, b) => a + b, 0)}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={onReset}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-semibold"
        >
          Calculate Again
        </Button>
      </div>
    </div>
  )
}
