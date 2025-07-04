'use client'

import { useMemo } from 'react'
import { Card } from '../ui/card'
import type { CalorieEntry } from '@/lib/types'

interface FoodsAnalyticsProps {
  entries: CalorieEntry[]
}

export function FoodsAnalytics({ entries }: FoodsAnalyticsProps) {
  // Top foods by frequency
  const topFoodsByFrequency = useMemo(() => {
    const foodStats = entries.reduce((acc, entry) => {
      const food = entry.meal_name.toLowerCase().trim()
      if (!acc[food]) {
        acc[food] = {
          name: entry.meal_name,
          frequency: 0,
          totalCalories: 0,
          calories: [],
          dates: new Set<string>(),
          mealTypes: new Set<string>()
        }
      }
      
      acc[food].frequency += 1
      acc[food].totalCalories += entry.calories
      acc[food].calories.push(entry.calories)
      acc[food].dates.add(entry.date)
      acc[food].mealTypes.add(entry.meal_type)
      
      return acc
    }, {} as Record<string, any>)

    return Object.values(foodStats)
      .map((food: any) => ({
        name: food.name,
        frequency: food.frequency,
        avgCalories: Math.round(food.totalCalories / food.frequency),
        totalCalories: food.totalCalories,
        minCalories: Math.min(...food.calories),
        maxCalories: Math.max(...food.calories),
        daysConsumed: food.dates.size,
        mealTypes: Array.from(food.mealTypes)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
  }, [entries])

  // Top foods by total calories
  const topFoodsByCalories = useMemo(() => {
    return [...topFoodsByFrequency]
      .sort((a, b) => b.totalCalories - a.totalCalories)
      .slice(0, 5)
  }, [topFoodsByFrequency])

  // Food diversity metrics
  const foodDiversity = useMemo(() => {
    const uniqueFoods = new Set(entries.map(entry => entry.meal_name.toLowerCase().trim()))
    const totalEntries = entries.length
    const diversityRatio = totalEntries > 0 ? Math.round((uniqueFoods.size / totalEntries) * 100 * 10) / 10 : 0

    return {
      uniqueFoods: uniqueFoods.size,
      totalEntries,
      diversityRatio
    }
  }, [entries])

  // Foods by meal type breakdown
  const foodsByMealType = useMemo(() => {
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
    
    return mealTypes.map(mealType => {
      const mealEntries = entries.filter(entry => entry.meal_type === mealType)
      const uniqueFoods = new Set(mealEntries.map(entry => entry.meal_name.toLowerCase().trim()))
      const totalCalories = mealEntries.reduce((sum, entry) => sum + entry.calories, 0)
      const avgCalories = mealEntries.length > 0 ? Math.round(totalCalories / mealEntries.length) : 0

      return {
        mealType,
        uniqueFoods: uniqueFoods.size,
        totalEntries: mealEntries.length,
        avgCalories,
        totalCalories
      }
    }).filter(stat => stat.totalEntries > 0)
  }, [entries])

  // Recent foods (last 7 days)
  const recentFoods = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentEntries = entries.filter(entry => 
      new Date(entry.date) >= sevenDaysAgo
    )

    const foodCounts = recentEntries.reduce((acc, entry) => {
      const food = entry.meal_name.toLowerCase().trim()
      acc[food] = (acc[food] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(foodCounts)
      .map(([food, count]) => {
        const originalEntry = recentEntries.find(entry => 
          entry.meal_name.toLowerCase().trim() === food
        )
        return {
          name: originalEntry?.meal_name || food,
          frequency: count
        }
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
  }, [entries])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Food Analysis</h2>
        
        {/* Food Diversity Overview */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Diet Diversity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {foodDiversity.uniqueFoods}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Unique Foods
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {foodDiversity.totalEntries}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Entries
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {foodDiversity.diversityRatio}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Diversity Ratio
              </div>
            </div>
          </div>
        </Card>

        {/* Foods by Meal Type */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Foods by Meal Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {foodsByMealType.map(stat => (
              <div key={stat.mealType} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {stat.mealType}
                </div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {stat.uniqueFoods}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  unique foods
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {stat.avgCalories}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  avg calories
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Foods by Frequency */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Most Frequent Foods</h3>
          <div className="space-y-3">
            {topFoodsByFrequency.slice(0, 8).map((food, index) => (
              <div key={food.name} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400 w-6">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {food.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {food.frequency}x
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    {food.avgCalories} cal avg
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {food.daysConsumed} days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Foods by Total Calories */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Highest Calorie Contributors</h3>
          <div className="space-y-3">
            {topFoodsByCalories.map((food, index) => (
              <div key={food.name} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400 w-6">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {food.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    {food.totalCalories.toLocaleString()} cal
                  </span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {food.frequency}x
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {food.minCalories}-{food.maxCalories} cal range
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Foods (Last 7 Days) */}
        {recentFoods.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Foods (Last 7 Days)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {recentFoods.map((food, index) => (
                <div key={food.name} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">
                    {food.name}
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 font-bold">
                    {food.frequency}x
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}