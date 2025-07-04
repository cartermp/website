'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendsAnalytics } from './analytics/TrendsAnalytics'
import { PatternsAnalytics } from './analytics/PatternsAnalytics'
import { FoodsAnalytics } from './analytics/FoodsAnalytics'
import type { CalorieData } from '@/lib/types'

interface AnalyticsDashboardProps {
  initialData: CalorieData
}

type AnalyticsTab = 'trends' | 'patterns' | 'foods'

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('trends')

  const tabs = [
    { id: 'trends' as const, label: 'Trends & Overview', description: 'Calorie trends, averages, and progress charts' },
    { id: 'patterns' as const, label: 'Eating Patterns', description: 'Day-of-week, weekend vs weekday, meal timing' },
    { id: 'foods' as const, label: 'Food Analysis', description: 'Top foods, diversity, meal type breakdown' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights into your calorie tracking data
          </p>
        </div>
        <Link
          href="/caltrack/api-keys"
          className="w-full sm:w-auto text-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          API Keys
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <div className="text-left">
                <div className="font-medium">{tab.label}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'trends' && (
          <TrendsAnalytics data={initialData} />
        )}
        
        {activeTab === 'patterns' && (
          <PatternsAnalytics entries={initialData.entries} />
        )}
        
        {activeTab === 'foods' && (
          <FoodsAnalytics entries={initialData.entries} />
        )}
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Quick Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {initialData.entries.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Total Entries</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {new Set(initialData.entries.map(e => e.date)).size}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Days Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {new Set(initialData.entries.map(e => e.meal_name.toLowerCase().trim())).size}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Unique Foods</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(initialData.overallAverage)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Avg Daily Calories</div>
          </div>
        </div>
      </div>
    </div>
  )
}