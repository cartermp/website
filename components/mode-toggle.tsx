"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"

const subscribe = () => () => {}

const themeChoices = {
  system: {
    label: "System",
    next: "light",
    icon: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>,
  },
  light: {
    label: "Light",
    next: "dark",
    icon: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19m0-14-1.4 1.4M6.4 17.6 5 19" /></>,
  },
  dark: {
    label: "Dark",
    next: "system",
    icon: <path d="M20.8 15.1A9 9 0 0 1 8.9 3.2a9 9 0 1 0 11.9 11.9Z" />,
  },
} as const

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)
  const mode = mounted && (theme === "light" || theme === "dark") ? theme : "system"
  const current = themeChoices[mode]
  const label = `Theme: ${current.label}. Switch to ${themeChoices[current.next].label}.`

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={!mounted}
      onClick={() => setTheme(current.next)}
      className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-canvas/60 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {current.icon}
      </svg>
    </button>
  )
}
