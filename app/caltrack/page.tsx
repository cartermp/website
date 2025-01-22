import { promises as fs } from 'fs'
import path from 'path'
import Papa from 'papaparse'
import Link from 'next/link'
import { CalorieListItem } from './components/CalorieListItem'

interface CalorieEntry {
  date: string
  meal_type: string
  meal_name: string
  calories: number
}

const TARGET_CALORIES = 2400

async function getData(): Promise<CalorieEntry[]> {
  const csvFile = path.join(process.cwd(), 'data', 'calorie_tracking.csv')
  const fileContent = await fs.readFile(csvFile, 'utf-8')
  
  const { data } = Papa.parse<CalorieEntry>(fileContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  })
  
  return data
}

export default async function CalTrackPage() {
  const entries = await getData()
  
  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = []
    }
    acc[entry.date].push(entry)
    return acc
  }, {} as Record<string, CalorieEntry[]>)

  // Calculate daily totals and sort by date
  const dailyEntries = Object.entries(entriesByDate)
    .map(([date, dayEntries]) => ({
      date,
      entries: dayEntries,
      totalCalories: dayEntries.reduce((sum, entry) => sum + entry.calories, 0)
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Calculate average
  const average = dailyEntries.reduce((sum, day) => sum + day.totalCalories, 0) / dailyEntries.length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Calorie Tracking</h1>
        <Link 
          href="/caltrack/add"
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Add Today&apos;s Calories
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Daily Target:</span>
          <span className="ml-2 font-medium">{TARGET_CALORIES} calories</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Daily Average:</span>
          <span className="ml-2 font-medium">{Math.round(average)} calories</span>
        </div>
      </div>

      <ul className="space-y-4">
        {dailyEntries.map((day) => (
          <CalorieListItem
            key={day.date}
            date={day.date}
            entries={day.entries}
            totalCalories={day.totalCalories}
            targetCalories={TARGET_CALORIES}
          />
        ))}
      </ul>
    </div>
  )
}
