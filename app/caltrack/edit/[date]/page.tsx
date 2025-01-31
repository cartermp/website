import { EditCalorieForm } from '../../components/EditCalorieForm'
import { notFound } from 'next/navigation'
import { getEntriesForDate } from '@/lib/getData'

export const revalidate = 0
export const dynamic = "force-dynamic"

import { CalorieEntry } from '@/lib/types'

export default async function EditCaloriesPage({
  params
}: {
  params: { date: string }
}) {
  const entries = await getEntriesForDate(params.date) as CalorieEntry[]

  if (entries.length === 0) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        Edit Calories for {new Date(params.date).toLocaleDateString()}
      </h1>

      <EditCalorieForm date={params.date} initialEntries={entries} />
    </div>
  )
}
