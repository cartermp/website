import { getEntriesForDate, getData } from "@/lib/getData"
import { formatDate } from "@/lib/dateUtils"
import {
    groupEntriesByMealType,
    calculateMealTypeTotals,
    TARGET_CALORIES
} from "@/lib/calorieUtils"
import type { CalorieEntry } from "@/lib/types"
import { Card } from "../../components/ui/card"
import { StatDisplay } from "../../components/ui/stat-display"
import type { Metadata } from 'next'

interface Props {
    params: { date: string }
}

// Tell Next.js to generate a static page that revalidates every 60 seconds
export const dynamic = "force-static"
// Instead of revalidate = false, we set a revalidation period (in seconds)
export const revalidate = 60

// Generate all possible date paths at build time
export async function generateStaticParams() {
  const entries = (await getData()) as CalorieEntry[]
  const uniqueDates = Array.from(new Set(entries.map((entry) => entry.date)))
  return uniqueDates.map((date) => ({
    date,
  }))
}

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const formattedDate = formatDate(params.date)
  
    return {
      title: `Daily Food Journal - ${formattedDate}`,
      description: `Food journal entries for ${formattedDate}`,
    }
  }

export default async function SharedCaloriePage({ params: { date } }: Props) {
    const entries = await getEntriesForDate(date) as CalorieEntry[]
    const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0)

    // Group entries by meal type
    const mealsByType = groupEntriesByMealType(entries)
    const mealTypeTotals = calculateMealTypeTotals(mealsByType)

    // Determine color for total calories
    const calorieColor = totalCalories > TARGET_CALORIES
        ? 'text-red-600 dark:text-red-400'
        : 'text-green-600 dark:text-green-400'

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-300">
                    Daily Food Journal
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 mt-2">
                    {formatDate(date)}
                </p>
            </div>

            <Card variant="stats" className="p-4">
                <div className="grid grid-cols-2 gap-4">
                    <StatDisplay
                        label="Target"
                        value={`${TARGET_CALORIES} calories`}
                    />
                    <StatDisplay
                        label="Actual"
                        value={`${totalCalories} calories`}
                        valueColor={calorieColor}
                    />
                </div>
            </Card>

            <div className="space-y-4">
                {mealTypeTotals.map(({ type, total }) => (
                    <Card
                        key={type}
                        variant="outline"
                        className="overflow-hidden"
                    >
                        <div className="p-4">
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                {type} ({total} cal)
                            </h3>
                            <ul className="mt-3 space-y-2">
                                {mealsByType[type].map((meal, index) => (
                                    <li
                                        key={index}
                                        className="text-gray-600 dark:text-gray-400 flex justify-between"
                                    >
                                        <span>{meal.meal_name}</span>
                                        <span>{meal.calories} cal</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
