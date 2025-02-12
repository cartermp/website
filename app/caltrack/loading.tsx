import { Card } from './components/ui/card'

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="flex gap-4">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Stats Card Skeleton */}
      <Card variant="stats" className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Card>

      {/* Trend Chart Skeleton */}
      <Card variant="outline" className="p-4">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </Card>

      {/* Daily Entries Skeleton */}
      {[1, 2, 3].map((i) => (
        <Card key={i} variant="outline" className="p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            {[1, 2].map((j) => (
              <div key={j} className="flex justify-between items-center">
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
} 