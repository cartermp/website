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
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Calorie Tracking</h1>
            <div className="flex gap-4">
                <ShareButton date={today} /><Link
                    href={`/caltrack/edit/${today}`}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                    {todayEntry ? "Edit Today's Calories" : "Add Today's Calories"}
                </Link>
            </div>
        </div>
    )
}
