"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface HolidayStepProps {
  holidays: string[]
  setHolidays: (holidays: string[]) => void
  onNext: () => void
  onBack: () => void
}

export default function HolidayStep({ holidays, setHolidays, onNext, onBack }: HolidayStepProps) {
  const [inputDate, setInputDate] = useState("")

  const addHoliday = () => {
    if(inputDate && !holidays.includes(inputDate)) {
      setHolidays([...holidays, inputDate])
      setInputDate("")
    }
  }

  const removeHoliday = (date: string) => {
    setHolidays(holidays.filter(d=>d!==date))
  }

  return (
    <Card className="p-8 bg-white shadow-lg">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Step: Public Holidays</h2>
      <p className="text-gray-600 mb-4">Select holidays when no classes are held.</p>

      <div className="flex gap-2 mb-4">
        <input type="date" value={inputDate} onChange={e=>setInputDate(e.target.value)} className="border px-3 py-2 rounded"/>
        <Button onClick={addHoliday} className="bg-blue-600 text-white px-4 py-2 rounded">Add</Button>
      </div>

      <ul className="mb-6">
        {holidays.map(d=>(
          <li key={d} className="flex justify-between items-center bg-gray-100 p-2 rounded mb-1">
            {d}
            <Button onClick={()=>removeHoliday(d)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Remove</Button>
          </li>
        ))}
      </ul>

      <div className="flex justify-between">
        <Button onClick={onBack} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg">Back</Button>
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">Next</Button>
      </div>
    </Card>
  )
}
