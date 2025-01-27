import { getEntriesForDate } from "@/lib/getData"

interface Props {
    params: { date: string }
}

interface MealEntry {
    meal_type: string
    meal_name: string
    calories: number
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: 'UTC',
    });
}

export default async function SharedCaloriePage({ params: { date } }: Props) {
    const TARGET_CALORIES = 2400

    const entries = await getEntriesForDate(date) as CalorieEntry[]
    const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0)

    // Group entries by meal type
    const mealsByType = entries.reduce((acc, entry) => {
        if (!acc[entry.meal_type]) {
            acc[entry.meal_type] = []
        }
        acc[entry.meal_type].push(entry)
        return acc
    }, {} as Record<string, MealEntry[]>)

    // Calculate totals for each meal type
    const mealTypeTotals = Object.entries(mealsByType).map(([type, meals]) => ({
        type,
        total: meals.reduce((sum, meal) => sum + meal.calories, 0)
    }))

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Phillip&apos;s Calorie Log -- {formatDate(date)}</h1>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
                <div>
                    <span className="text-lg text-gray-600 dark:text-gray-400">Target:</span>
                    <span className="ml-2 text-lg font-medium">{TARGET_CALORIES} calories</span>
                </div>
                <div>
                    <span className="text-lg text-gray-600 dark:text-gray-400">Actual:</span>
                    <span className={`ml-2 text-lg font-medium ${totalCalories > TARGET_CALORIES
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                        }`}>
                        {totalCalories} calories
                    </span>
                </div>
            </div>

            <div className="px-12 pb-4 space-y-4">
                {mealTypeTotals.map(({ type, total }) => (
                    <div key={type}>
                        <h3 className="font-medium text-gray-700 dark:text-gray-300">{type} ({total} cal)</h3>
                        <ul className="mt-2 space-y-1">
                            {mealsByType[type].map((meal, index) => (
                                <li key={index} className="text-gray-600 dark:text-gray-400 flex justify-between">
                                    <span>{meal.meal_name}</span>
                                    <span>{meal.calories} cal</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}
