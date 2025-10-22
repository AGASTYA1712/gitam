"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getPublicHolidaysForSemester } from "@/lib/gitam-holidays"

interface SemesterStepProps {
  timetable: Record<string, string[]>
  onSubmit: (data: {
    startDate: string
    endDate: string
    attendance: Record<string, number>
    holidays?: string[]
  }) => void
  onBack: () => void
}

export default function SemesterStep({ timetable, onSubmit, onBack }: SemesterStepProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [attendance, setAttendance] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [holidays, setHolidays] = useState<string[]>([])

  useEffect(() => {
    if (startDate && endDate) {
      const autoHolidays = getPublicHolidaysForSemester(startDate, endDate)
      setHolidays(autoHolidays)
    }
  }, [startDate, endDate])

  const getUniqueSubjects = () => {
    const subjects = new Set<string>()
    Object.values(timetable).forEach((slots) => {
      slots.forEach((subject) => {
        if (subject.trim()) subjects.add(subject)
      })
    })
    return Array.from(subjects).sort()
  }

  const subjects = getUniqueSubjects()

  const handleAttendanceChange = (subject: string, value: string) => {
    const numValue = Math.min(100, Math.max(0, Number.parseInt(value) || 0))
    setAttendance((prev) => ({
      ...prev,
      [subject]: numValue,
    }))
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[subject]
      return newErrors
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!startDate) newErrors.startDate = "Start date is required"
    if (!endDate) newErrors.endDate = "End date is required"

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start >= end) newErrors.dateRange = "End date must be after start date"
    }

    subjects.forEach((subject) => {
      if (!(subject in attendance) || attendance[subject] === undefined || attendance[subject] === null) {
        newErrors[subject] = "Required"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        startDate,
        endDate,
        attendance,
        holidays,
      })
    }
  }

  const handleHolidaysInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const dates = input
      .split(",")
      .map((d) => d.trim())
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    setHolidays(dates)
  }

  return (
    <Card className="p-8 bg-white shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-blue-900">Step 2: Semester Details & Attendance</h2>

      {/* Semester Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Semester Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors.startDate
                delete newErrors.dateRange
                return newErrors
              })
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.startDate ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Semester End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value)
              setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors.endDate
                delete newErrors.dateRange
                return newErrors
              })
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.endDate ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
        </div>
      </div>
      {errors.dateRange && <p className="text-red-500 text-sm">{errors.dateRange}</p>}

      {/* Attendance Inputs */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Current Attendance (%)</h3>
        {subjects.map((subject) => (
          <div key={subject} className="flex items-center gap-3">
            <label className="flex-1 text-gray-700">{subject}</label>
            <input
              type="number"
              min={0}
              max={100}
              value={attendance[subject] ?? ""}
              onChange={(e) => handleAttendanceChange(subject, e.target.value)}
              placeholder="0"
              className={`w-20 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors[subject] ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors[subject] && <span className="text-red-500 text-sm">{errors[subject]}</span>}
          </div>
        ))}
      </div>

      {/* Holidays Input */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Public Holidays (GITAM Calendar)</h3>
        <p className="text-sm text-gray-600 mb-2">
          Automatically populated from GITAM academic calendar. You can add or remove holidays as needed.
        </p>
        <input
          type="text"
          value={holidays.join(",")}
          onChange={handleHolidaysInput}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
          placeholder="YYYY-MM-DD,YYYY-MM-DD,..."
        />
        {holidays.length > 0 && (
          <p className="text-sm text-green-600 mt-2">
            {holidays.length} public holiday(s) will be excluded from class calculations
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit}>Next</Button>
      </div>
    </Card>
  )
}
