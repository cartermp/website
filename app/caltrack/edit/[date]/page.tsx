import { EditCalorieForm } from '../../components/EditCalorieForm'
import { getEntriesForDate } from '@/lib/getData'
import { CalorieEntry } from '@/lib/types'
import { formatDate } from '@/lib/dateUtils'

export const revalidate = 0
export const dynamic = "force-dynamic"

// Define params type for Next.js 15
type PageParams = Promise<{ date: string }>;

export default async function EditCaloriesPage(props: {
  params: PageParams
}) {
  const params = await props.params;
  const entries = await getEntriesForDate(params.date) as CalorieEntry[]
  const mode = entries.length === 0 ? 'add' : 'edit'

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
        {entries.length === 0 ? "Add Today's Calories" : `Edit Calories for ${formatDate(params.date)}`}
      </h1>

      <EditCalorieForm date={params.date} initialEntries={entries} mode={mode} />
    </div>
  )
}
