import chroma from 'chroma-js'
import { LOWER_TARGET, MAINTAIN_TARGET, UPPER_TARGET } from './calorieUtils'

export function getCalorieColor(calories: number, dark = false): string {
  // Define colors for each zone (light or dark mode)
  const greenColor = dark ? 'rgb(34,197,94)' : 'rgb(22,163,74)'  // Success green
  const orangeColor = dark ? 'rgb(249,115,22)' : 'rgb(234,88,12)' // Warning orange
  const redColor = dark ? 'rgb(239,68,68)' : 'rgb(220,38,38)'     // Danger red

  if (calories <= LOWER_TARGET) return greenColor
  if (calories >= MAINTAIN_TARGET) return redColor

  // Determine which zone we're in and compute the interpolation factor
  if (calories <= UPPER_TARGET) {
    // Between lower and upper target - interpolate from green to orange
    const t = (calories - LOWER_TARGET) / (UPPER_TARGET - LOWER_TARGET)
    const scale = chroma.scale([greenColor, orangeColor]).mode('lab')
    return scale(t).css()
  } else {
    // Between upper target and maintain - interpolate from orange to red
    const t = (calories - UPPER_TARGET) / (MAINTAIN_TARGET - UPPER_TARGET)
    const scale = chroma.scale([orangeColor, redColor]).mode('lab')
    return scale(t).css()
  }
}
