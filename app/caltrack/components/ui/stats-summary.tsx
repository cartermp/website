import { Card } from './card'
import { StatDisplay } from './stat-display'
import { TARGET_CALORIES, MAX_TDEE_CALORIES } from '@/lib/calorieUtils'

interface StatsSummaryProps {
    dayTotal: number
    avgCalories: number
    percentDiff: number
    isHighest: boolean
    isLowest: boolean
    mealTypeComparison: Array<{
        type: string
        dayTotal: number
        rangeAvg: number
        diff: number
    }>
}

export function StatsSummary({
    dayTotal,
    avgCalories,
    percentDiff,
    isHighest,
    isLowest,
    mealTypeComparison
}: StatsSummaryProps) {
    // Helper to format percentage
    const formatPercent = (num: number) => {
        const rounded = Math.round(num * 10) / 10
        return `${rounded >= 0 ? '+' : ''}${rounded}%`
    }

    // Helper to get color class based on value
    const getColorClass = (value: number) => {
        if (value > 0) return 'text-red-600 dark:text-red-400'
        if (value < 0) return 'text-green-600 dark:text-green-400'
        return 'text-gray-600 dark:text-gray-400'
    }

    // Get color class for average calories based on target
    const getCalorieColorClass = (calories: number) => {
        if (calories > MAX_TDEE_CALORIES) return 'text-red-600 dark:text-red-400'
        if (calories > TARGET_CALORIES) return 'text-red-600 dark:text-red-400'
        return 'text-green-600 dark:text-green-400'
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            <Card variant="stats" className="p-3 sm:p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <StatDisplay
                        label="7-Day Avg"
                        value={`${Math.round(avgCalories)} cal`}
                        valueColor={getCalorieColorClass(avgCalories)}
                        className="col-span-2 sm:col-span-1"
                    />
                    <StatDisplay
                        label="vs Average"
                        value={formatPercent(percentDiff)}
                        valueColor={getColorClass(percentDiff)}
                    />
                    <div className="col-span-2 sm:col-span-1 flex flex-wrap gap-2 items-center justify-start sm:justify-center">
                        {isHighest && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs sm:text-sm rounded-full whitespace-nowrap">
                                Highest Day
                            </span>
                        )}
                        {isLowest && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs sm:text-sm rounded-full whitespace-nowrap">
                                Lowest Day
                            </span>
                        )}
                    </div>
                </div>
            </Card>

            <Card variant="outline" className="p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
                    Meal Type Analysis
                </h3>
                <div className="space-y-3 sm:space-y-4">
                    {mealTypeComparison.map(({ type, dayTotal, rangeAvg, diff }) => (
                        <div key={type} className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-0">
                                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{type}</span>
                                <div className="flex items-baseline justify-between sm:justify-end gap-2">
                                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                                        {Math.round(rangeAvg)} cal avg
                                    </span>
                                    <span className={`text-sm sm:text-base font-medium ${getColorClass(diff)}`}>
                                        {formatPercent((diff / rangeAvg) * 100)}
                                    </span>
                                </div>
                            </div>
                            <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-purple-500 dark:bg-purple-400 transition-all duration-300"
                                    style={{ width: `${Math.min(100, (dayTotal / rangeAvg) * 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
} 