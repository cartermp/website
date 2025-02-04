'use client'

import { CalorieEntry } from "@/lib/types"
import { CalorieFormShared } from "./CalorieFormShared"

interface EditCalorieFormProps {
  date: string
  initialEntries: CalorieEntry[]
  mode: 'add' | 'edit'
}

export function EditCalorieForm({ date, initialEntries, mode }: EditCalorieFormProps) {
  return <CalorieFormShared date={date} initialEntries={initialEntries} mode={mode} />
}
