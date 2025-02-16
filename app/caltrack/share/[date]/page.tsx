import { getStaticEntries, getStaticDates, getStaticEntriesForRange } from "@/lib/getData"
import { formatDate } from "@/lib/dateUtils"
import {
    groupEntriesByMealType,
    calculateMealTypeTotals,
    calculateDayStats,
    TARGET_CALORIES
} from "@/lib/calorieUtils"
import type { CalorieEntry } from "@/lib/types"
import { Card } from "../../components/ui/card"
import { StatDisplay } from "../../components/ui/stat-display"
import { StatsSummary } from "../../components/ui/stats-summary"
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Props {
    params: { date: string }
}

// Tell Next.js this is a static page that revalidates every hour
export const dynamic = "force-static"
export const revalidate = 3600 // 1 hour

// Generate all possible date paths at build time
export async function generateStaticParams() {
    const dates = await getStaticDates()
    return dates.map((date) => ({
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
    const entries = await getStaticEntries(date) as CalorieEntry[]
    
    // If no entries found for this date, return 404
    if (!entries || entries.length === 0) {
        notFound()
    }

    // Get entries for the past 7 days (including current day)
    const sevenDaysAgo = new Date(date)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const rangeEntries = await getStaticEntriesForRange(
        sevenDaysAgo.toISOString().split('T')[0],
        date
    ) as CalorieEntry[]

    const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0)

    // Group entries by meal type
    const mealsByType = groupEntriesByMealType(entries)
    const mealTypeTotals = calculateMealTypeTotals(mealsByType)

    // Calculate statistics
    const stats = calculateDayStats(entries, rangeEntries)

    // Determine color for total calories
    const calorieColor = totalCalories > TARGET_CALORIES
        ? 'text-red-600 dark:text-red-400'
        : 'text-green-600 dark:text-green-400'

    return (
        <div className="max-w-2xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
            <div className="mb-4 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-300">
                    Daily Food Journal
                </h1>
                <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mt-2">
                    {formatDate(date)}
                </p>
            </div>

            <Card variant="stats" className="p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

            <StatsSummary {...stats} />

            <div className="space-y-3 sm:space-y-4">
                {mealTypeTotals.map(({ type, total }) => (
                    <Card
                        key={type}
                        variant="outline"
                        className="overflow-hidden"
                    >
                        <div className="p-3 sm:p-4">
                            <h3 className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300">
                                {type} ({total} cal)
                            </h3>
                            <ul className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                                {mealsByType[type].map((meal, index) => (
                                    <li
                                        key={index}
                                        className="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex flex-col sm:flex-row justify-between gap-1 sm:gap-0"
                                    >
                                        <span className="break-words">{meal.meal_name}</span>
                                        <span className="text-right">{meal.calories} cal</span>
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
