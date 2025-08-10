'use client'

import { CalorieEntry, DailyStats } from "@/lib/types"
import { CalorieFormShared } from "./CalorieFormShared"

interface EditCalorieFormProps {
  date: string
  initialEntries: CalorieEntry[]
  mode: 'add' | 'edit'
  dailyStats?: DailyStats | null
}

export function EditCalorieForm({ date, initialEntries, mode, dailyStats }: EditCalorieFormProps) {
  return <CalorieFormShared date={date} initialEntries={initialEntries} mode={mode} dailyStats={dailyStats} />
}
