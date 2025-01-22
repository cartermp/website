import { EditCalorieForm } from '../../components/EditCalorieForm'
import { promises as fs } from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { notFound } from 'next/navigation'

interface CalorieEntry {
  date: string
  meal_type: string
  meal_name: string
  calories: number
}

async function getEntriesForDate(date: string): Promise<CalorieEntry[]> {
  const csvFile = path.join(process.cwd(), 'data', 'calorie_tracking.csv')
  const fileContent = await fs.readFile(csvFile, 'utf-8')
  
  const { data } = Papa.parse<CalorieEntry>(fileContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  })
  
  return data.filter(entry => entry.date === date)
}

export default async function EditCaloriesPage({
  params
}: {
  params: { date: string }
}) {
  const entries = await getEntriesForDate(params.date)
  
  if (entries.length === 0) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        Edit Calories for {new Date(`${params.date}T12:00:00`).toLocaleDateString()}
      </h1>
      
      <EditCalorieForm date={params.date} initialEntries={entries} />
    </div>
  )
}
