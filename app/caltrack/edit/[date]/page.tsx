import { EditCalorieForm } from '../../components/EditCalorieForm'
import { getEntriesForDate } from '@/lib/getData'

export const revalidate = 0
export const dynamic = "force-dynamic"

import { CalorieEntry } from '@/lib/types'
import { formatDate } from '@/lib/dateUtils'

export default async function EditCaloriesPage({
  params
}: {
  params: { date: string }
}) {
  const entries = await getEntriesForDate(params.date) as CalorieEntry[]

  const mode = entries.length === 0 ? 'add' : 'edit'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        {entries.length === 0 ? "Add Today's Calories" : `Edit Calories for ${formatDate(params.date)}`}
      </h1>

      <EditCalorieForm date={params.date} initialEntries={entries} mode={mode} />
    </div>
  )
}
