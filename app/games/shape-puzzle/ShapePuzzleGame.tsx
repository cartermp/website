"use client"

import { useMemo, useState } from "react"
import type { MouseEvent } from "react"

type ShapeId = "circle" | "square" | "triangle" | "diamond"

type ColorId = "coral" | "sky" | "lime" | "violet"

type Cell = {
  shape: ShapeId
  color: ColorId
}

const shapes: { id: ShapeId; label: string }[] = [
  { id: "circle", label: "Circle" },
  { id: "square", label: "Square" },
  { id: "triangle", label: "Triangle" },
  { id: "diamond", label: "Diamond" },
]

const colors: { id: ColorId; label: string; hex: string }[] = [
  { id: "coral", label: "Coral", hex: "#fb7185" },
  { id: "sky", label: "Sky", hex: "#38bdf8" },
  { id: "lime", label: "Lime", hex: "#84cc16" },
  { id: "violet", label: "Violet", hex: "#a855f7" },
]

const targetBoard: Cell[] = [
  { shape: "circle", color: "coral" },
  { shape: "square", color: "sky" },
  { shape: "triangle", color: "lime" },
  { shape: "diamond", color: "violet" },
  { shape: "square", color: "coral" },
  { shape: "triangle", color: "sky" },
  { shape: "diamond", color: "lime" },
  { shape: "circle", color: "violet" },
  { shape: "triangle", color: "coral" },
]

const getShapeIndex = (shape: ShapeId) => shapes.findIndex((item) => item.id === shape)
const getColorIndex = (color: ColorId) => colors.findIndex((item) => item.id === color)

const makeInitialBoard = () =>
  targetBoard.map((cell, index) => {
    const shapeIndex = getShapeIndex(cell.shape)
    const colorIndex = getColorIndex(cell.color)

    return {
      shape: shapes[(shapeIndex + 1 + index) % shapes.length].id,
      color: colors[(colorIndex + 2 + index) % colors.length].id,
    }
  })

const renderShape = (shape: ShapeId, colorHex: string) => {
  switch (shape) {
    case "circle":
      return <circle cx="50" cy="50" r="28" fill={colorHex} />
    case "square":
      return <rect x="22" y="22" width="56" height="56" rx="8" fill={colorHex} />
    case "triangle":
      return <polygon points="50 16 86 84 14 84" fill={colorHex} />
    case "diamond":
      return <polygon points="50 12 88 50 50 88 12 50" fill={colorHex} />
  }
}

const ShapeTile = ({ cell, isSelected, isTarget }: { cell: Cell; isSelected: boolean; isTarget: boolean }) => {
  const color = colors.find((item) => item.id === cell.color) ?? colors[0]

  return (
    <div
      className={`flex items-center justify-center rounded-2xl border transition shadow-sm ${
        isTarget
          ? "border-slate-200/70 dark:border-slate-700/70 bg-white/60 dark:bg-slate-900/60"
          : "border-slate-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80"
      } ${isSelected ? "ring-2 ring-sky-400/80" : ""}`}
    >
      <svg viewBox="0 0 100 100" className="h-12 w-12">
        {renderShape(cell.shape, color.hex)}
      </svg>
    </div>
  )
}

export default function ShapePuzzleGame() {
  const [board, setBoard] = useState<Cell[]>(() => makeInitialBoard())
  const [moves, setMoves] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const solved = useMemo(
    () => board.every((cell, index) => cell.shape === targetBoard[index].shape && cell.color === targetBoard[index].color),
    [board]
  )

  const updateCell = (index: number, updater: (cell: Cell) => Cell) => {
    setBoard((prev) => prev.map((cell, cellIndex) => (cellIndex === index ? updater(cell) : cell)))
    setMoves((prev) => prev + 1)
  }

  const cycleShape = (index: number) => {
    updateCell(index, (cell) => {
      const shapeIndex = getShapeIndex(cell.shape)
      return { ...cell, shape: shapes[(shapeIndex + 1) % shapes.length].id }
    })
  }

  const cycleColor = (index: number) => {
    updateCell(index, (cell) => {
      const colorIndex = getColorIndex(cell.color)
      return { ...cell, color: colors[(colorIndex + 1) % colors.length].id }
    })
  }

  const handleTileClick = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    setSelectedIndex(index)
    if (event.shiftKey) {
      cycleColor(index)
      return
    }

    cycleShape(index)
  }

  const handleReset = () => {
    setBoard(makeInitialBoard())
    setMoves(0)
    setSelectedIndex(null)
  }

  const selectedCell = selectedIndex !== null ? board[selectedIndex] : null

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Puzzle</p>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50">Shape Circuit</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
            Align every tile with the target pattern. Click a tile to rotate its shape, or hold Shift while clicking to
            cycle the color. It&apos;s a medium difficulty logic warm-up.
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Target</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Match this arrangement.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">3 × 3</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {targetBoard.map((cell, index) => (
              <ShapeTile key={`target-${index}`} cell={cell} isSelected={false} isTarget />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Your Board</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Moves: {moves}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 hover:border-sky-400 dark:hover:border-sky-500 transition"
              >
                Reset
              </button>
              {solved && (
                <span className="rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Solved
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {board.map((cell, index) => (
              <button
                key={`play-${index}`}
                type="button"
                onClick={(event) => handleTileClick(index, event)}
                className="focus:outline-none"
                aria-pressed={selectedIndex === index}
                aria-label={`Tile ${index + 1}: ${shapes.find((item) => item.id === cell.shape)?.label}, ${colors.find((item) => item.id === cell.color)?.label}`}
              >
                <ShapeTile cell={cell} isSelected={selectedIndex === index} isTarget={false} />
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/80 dark:bg-slate-900/60 p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Selected tile</p>
            {selectedCell ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {shapes.find((item) => item.id === selectedCell.shape)?.label}
                </span>
                <span className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {colors.find((item) => item.id === selectedCell.color)?.label}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => selectedIndex !== null && cycleShape(selectedIndex)}
                    className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-sky-400 dark:hover:border-sky-500 transition"
                  >
                    Next shape
                  </button>
                  <button
                    type="button"
                    onClick={() => selectedIndex !== null && cycleColor(selectedIndex)}
                    className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-sky-400 dark:hover:border-sky-500 transition"
                  >
                    Next color
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Select a tile to reveal controls.</p>
            )}
          </div>
        </section>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">How it works</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Every tile has a shape and a color. Cycle them until your board mirrors the target grid exactly.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Keyboard tip</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Use Shift + click to change a tile&apos;s color without cycling its shape.
          </p>
        </div>
      </section>
    </div>
  )
}
