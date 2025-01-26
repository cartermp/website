import { CalorieFormShared } from "./CalorieFormShared"

export function CalorieForm() {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  
  return <CalorieFormShared date={dateStr} mode="add" />
}
