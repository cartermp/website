import { getToday } from "@/lib/dateUtils"
import { CalorieFormShared } from "./CalorieFormShared"

export function CalorieForm() {
  return <CalorieFormShared date={getToday()} mode="add" />
}
