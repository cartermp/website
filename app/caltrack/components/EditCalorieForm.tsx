'use client'

import { CalorieFormShared } from "./CalorieFormShared"

interface EditCalorieFormProps {
  date: string
  initialEntries: CalorieEntry[]
}

export function EditCalorieForm({ date, initialEntries }: EditCalorieFormProps) {
  return <CalorieFormShared date={date} initialEntries={initialEntries} mode="edit" />
}
