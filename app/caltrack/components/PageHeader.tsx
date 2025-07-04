'use client'

import Link from 'next/link'
import { ShareButton } from './ShareButton'
import { getToday } from '@/lib/dateUtils'

interface PageHeaderProps {
    todayEntry?: boolean
}

export function PageHeader({ todayEntry }: PageHeaderProps) {
    const today = getToday()

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Calorie Tracking</h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <Link
                    href="/caltrack/stats"
                    className="w-full sm:w-auto text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    View Stats
                </Link>
                <Link
                    href="/caltrack/api-keys"
                    className="w-full sm:w-auto text-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                    API Keys
                </Link>
                <ShareButton date={today} />
                <Link
                    href={`/caltrack/edit/${today}`}
                    className="w-full sm:w-auto text-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                    {todayEntry ? "Edit Today's Calories" : "Add Today's Calories"}
                </Link>
            </div>
        </div>
    )
}
