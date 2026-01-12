"use client"

import { useMemo, useState } from "react"
import type { MouseEvent } from "react"

type ShapeId = "circle" | "square"

type Cell = {
  value: ShapeId | null
  fixed: boolean
}

const shapes: { id: ShapeId; label: string; hex: string }[] = [
  { id: "circle", label: "Circle", hex: "#38bdf8" },
  { id: "square", label: "Square", hex: "#fb7185" },
]

const boardSize = 4
const totalCells = boardSize * boardSize

const shuffle = <T,>(items: T[]) => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const getShapeIndex = (shape: ShapeId) => shapes.findIndex((item) => item.id === shape)

const renderShape = (shape: ShapeId, colorHex: string) => {
  switch (shape) {
    case "circle":
      return <circle cx="50" cy="50" r="28" fill={colorHex} />
    case "square":
      return <rect x="22" y="22" width="56" height="56" rx="10" fill={colorHex} />
  }
}

const generateSolution = (): ShapeId[] => {
  const solution: ShapeId[] = Array.from({ length: totalCells })
  const rowCounts = Array.from({ length: boardSize }, () => [0, 0])
  const colCounts = Array.from({ length: boardSize }, () => [0, 0])

  const place = (index: number, shape: ShapeId) => {
    solution[index] = shape
    const row = Math.floor(index / boardSize)
    const col = index % boardSize
    const shapeIndex = getShapeIndex(shape)
    rowCounts[row][shapeIndex] += 1
    colCounts[col][shapeIndex] += 1
  }

  const remove = (index: number, shape: ShapeId) => {
    solution[index] = undefined as unknown as ShapeId
    const row = Math.floor(index / boardSize)
    const col = index % boardSize
    const shapeIndex = getShapeIndex(shape)
    rowCounts[row][shapeIndex] -= 1
    colCounts[col][shapeIndex] -= 1
  }

  const isValid = (index: number, shape: ShapeId) => {
    const row = Math.floor(index / boardSize)
    const col = index % boardSize
    const shapeIndex = getShapeIndex(shape)

    if (rowCounts[row][shapeIndex] >= boardSize / 2) {
      return false
    }

    if (colCounts[col][shapeIndex] >= boardSize / 2) {
      return false
    }

    if (col >= 2) {
      const left = solution[index - 1]
      const leftLeft = solution[index - 2]
      if (left === shape && leftLeft === shape) {
        return false
      }
    }

    if (row >= 2) {
      const up = solution[index - boardSize]
      const upUp = solution[index - boardSize * 2]
      if (up === shape && upUp === shape) {
        return false
      }
    }

    return true
  }

  const backtrack = (index: number): boolean => {
    if (index === totalCells) {
      return true
    }

    const row = Math.floor(index / boardSize)
    const col = index % boardSize

    for (const shape of shuffle(shapes.map((item) => item.id))) {
      if (!isValid(index, shape)) {
        continue
      }

      place(index, shape)

      if (col === boardSize - 1) {
        if (rowCounts[row][0] !== boardSize / 2 || rowCounts[row][1] !== boardSize / 2) {
          remove(index, shape)
          continue
        }
      }

      if (row === boardSize - 1) {
        if (colCounts[col][0] !== boardSize / 2 || colCounts[col][1] !== boardSize / 2) {
          remove(index, shape)
          continue
        }
      }

      if (backtrack(index + 1)) {
        return true
      }

      remove(index, shape)
    }

    return false
  }

  backtrack(0)
  return solution
}

const makePuzzle = () => {
  const solution = generateSolution()
  const revealCount = 8
  const revealIndexes = new Set(shuffle(Array.from({ length: totalCells }, (_, index) => index)).slice(0, revealCount))

  const board: Cell[] = solution.map((shape, index) =>
    revealIndexes.has(index)
      ? { value: shape, fixed: true }
      : {
          value: null,
          fixed: false,
        }
  )

  return { solution, board }
}

const getRuleIssues = (board: Cell[]) => {
  const invalid = new Set<number>()

  for (let row = 0; row < boardSize; row += 1) {
    const rowValues = board.slice(row * boardSize, row * boardSize + boardSize).map((cell) => cell.value)
    const counts = shapes.map((shape) => rowValues.filter((value) => value === shape.id).length)

    counts.forEach((count, shapeIndex) => {
      if (count > boardSize / 2) {
        rowValues.forEach((value, colIndex) => {
          if (value === shapes[shapeIndex].id) {
            invalid.add(row * boardSize + colIndex)
          }
        })
      }
    })

    for (let col = 0; col <= boardSize - 3; col += 1) {
      const window = rowValues.slice(col, col + 3)
      if (window.every((value) => value && value === window[0])) {
        invalid.add(row * boardSize + col)
        invalid.add(row * boardSize + col + 1)
        invalid.add(row * boardSize + col + 2)
      }
    }
  }

  for (let col = 0; col < boardSize; col += 1) {
    const columnValues = Array.from({ length: boardSize }, (_, row) => board[row * boardSize + col].value)
    const counts = shapes.map((shape) => columnValues.filter((value) => value === shape.id).length)

    counts.forEach((count, shapeIndex) => {
      if (count > boardSize / 2) {
        columnValues.forEach((value, rowIndex) => {
          if (value === shapes[shapeIndex].id) {
            invalid.add(rowIndex * boardSize + col)
          }
        })
      }
    })

    for (let row = 0; row <= boardSize - 3; row += 1) {
      const window = columnValues.slice(row, row + 3)
      if (window.every((value) => value && value === window[0])) {
        invalid.add(row * boardSize + col)
        invalid.add((row + 1) * boardSize + col)
        invalid.add((row + 2) * boardSize + col)
      }
    }
  }

  return invalid
}

const ShapeTile = ({
  cell,
  isSelected,
  isInvalid,
}: {
  cell: Cell
  isSelected: boolean
  isInvalid: boolean
}) => {
  const color = cell.value ? shapes.find((item) => item.id === cell.value) : null

  return (
    <div
      className={`flex items-center justify-center rounded-2xl border transition shadow-sm ${
        cell.fixed
          ? "border-slate-200/70 dark:border-slate-700/70 bg-slate-50/80 dark:bg-slate-900/70"
          : "border-slate-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80"
      } ${isSelected ? "ring-2 ring-sky-400/80" : ""} ${isInvalid ? "ring-2 ring-rose-400/80" : ""}`}
    >
      <svg viewBox="0 0 100 100" className="h-12 w-12">
        {cell.value && color ? renderShape(cell.value, color.hex) : <rect x="24" y="24" width="52" height="52" rx="12" fill="#e2e8f0" />}
      </svg>
    </div>
  )
}

export default function ShapePuzzleGame() {
  const [{ solution, board }, setPuzzle] = useState(() => makePuzzle())
  const [moves, setMoves] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const invalidTiles = useMemo(() => getRuleIssues(board), [board])
  const solved = useMemo(
    () => board.every((cell, index) => cell.value !== null && cell.value === solution[index]),
    [board, solution]
  )

  const cycleTile = (index: number) => {
    setPuzzle((prev) => {
      const nextBoard = prev.board.map((cell) => ({ ...cell }))
      const target = nextBoard[index]

      if (target.fixed) {
        return prev
      }

      if (target.value === null) {
        target.value = shapes[0].id
      } else if (target.value === shapes[0].id) {
        target.value = shapes[1].id
      } else {
        target.value = null
      }

      return { ...prev, board: nextBoard }
    })
    setMoves((prev) => prev + 1)
  }

  const handleTileClick = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setSelectedIndex(index)
    cycleTile(index)
  }

  const handleReset = () => {
    setPuzzle(makePuzzle())
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
            Inspired by LinkedIn&apos;s Tango, fill the 4×4 grid so every row and column contains two circles and two squares,
            with no three identical shapes touching in a line.
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Puzzle Grid</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Each refresh generates a new board.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">4 × 4</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {board.map((cell, index) => (
              <button
                key={`play-${index}`}
                type="button"
                onClick={(event) => handleTileClick(index, event)}
                className="focus:outline-none"
                aria-pressed={selectedIndex === index}
                aria-label={`Tile ${index + 1}: ${cell.value ? shapes.find((item) => item.id === cell.value)?.label : "Empty"}`}
              >
                <ShapeTile
                  cell={cell}
                  isSelected={selectedIndex === index}
                  isInvalid={invalidTiles.has(index)}
                />
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Status</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Moves: {moves}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 hover:border-sky-400 dark:hover:border-sky-500 transition"
              >
                New puzzle
              </button>
              {solved && (
                <span className="rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Solved
                </span>
              )}
              {!solved && invalidTiles.size > 0 && (
                <span className="rounded-full border border-rose-200/80 bg-rose-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
                  Rule break
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/80 dark:bg-slate-900/60 p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Selected tile</p>
            {selectedCell ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {selectedCell.value ? shapes.find((item) => item.id === selectedCell.value)?.label : "Empty"}
                </span>
                {selectedCell.fixed && (
                  <span className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Fixed
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Select a tile to cycle its shape.</p>
            )}
          </div>
        </section>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Rules</h3>
          <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>Each row and column must contain two circles and two squares.</li>
            <li>No three identical shapes can touch in a row or column.</li>
            <li>Fixed tiles cannot be changed.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Controls</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Click a tile to cycle empty → circle → square. Tap “New puzzle” for a fresh board.
          </p>
        </div>
      </section>
    </div>
  )
}
