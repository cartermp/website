import chroma from 'chroma-js'
import { TARGET_CALORIES, MAX_TDEE_CALORIES } from './calorieUtils'

export function getCalorieColor(calories: number, dark = false): string {
  // Define the two endpoints (light or dark mode)
  const startColor = dark ? 'rgb(34,197,94)' : 'rgb(22,163,74)'
  const endColor = dark ? 'rgb(239,68,68)' : 'rgb(220,38,38)'

  if (calories <= TARGET_CALORIES) return startColor
  if (calories >= MAX_TDEE_CALORIES) return endColor

  // Compute interpolation factor
  const t = (calories - TARGET_CALORIES) / (MAX_TDEE_CALORIES - TARGET_CALORIES)

  // Create a scale and interpolate using a perceptually uniform scale (e.g., LAB)
  const scale = chroma.scale([startColor, endColor]).mode('lab')
  return scale(t).css()
}
