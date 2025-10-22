"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const TIME_SLOTS = [
  "8:00-9:00",
  "9:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-1:00",
  "1:00-2:00",
  "2:00-3:00",
  "3:00-4:00",
  "4:00-5:00",
]

interface TimetableStepProps {
  onSubmit: (data: Record<string, string[]>) => void
}

export default function TimetableStep({ onSubmit }: TimetableStepProps) {
  const [timetable, setTimetable] = useState<Record<string, string[]>>(
    DAYS.reduce(
      (acc, day) => {
        acc[day] = Array(TIME_SLOTS.length).fill("")
        return acc
      },
      {} as Record<string, string[]>,
    ),
  )

  const handleInputChange = (day: string, slotIndex: number, value: string) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: prev[day].map((subject, idx) => (idx === slotIndex ? value : subject)),
    }))
  }

  const handleSubmit = () => {
    // Validation: ensure at least one non-empty subject
    const hasAny = Object.values(timetable).some((slots) => slots.some((s) => s.trim() !== ""))
    if (!hasAny) {
      alert("Please add at least one subject to your timetable")
      return
    }

    onSubmit(timetable)
  }

  return (
    <Card className="p-8 bg-white shadow-lg">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Step 1: Create Your Timetable</h2>
      <p className="text-gray-600 mb-6">
        Enter your subject names in the timetable grid below. Each cell represents a class slot.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-blue-100 p-3 text-left font-semibold text-blue-900">Time</th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="border border-gray-300 bg-blue-100 p-3 text-center font-semibold text-blue-900"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time, slotIndex) => (
              <tr key={time}>
                <td className="border border-gray-300 bg-gray-50 p-3 font-semibold text-gray-700">{time}</td>
                {DAYS.map((day) => (
                  <td key={`${day}-${time}`} className="border border-gray-300 p-2">
                    <input
                      type="text"
                      placeholder="Subject"
                      value={timetable[day][slotIndex]}
                      onChange={(e) => handleInputChange(day, slotIndex, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-semibold"
        >
          Next: Enter Semester Details
        </Button>
      </div>
    </Card>
  )
}
