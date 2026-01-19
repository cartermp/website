"use client"

import { useMemo, useState } from "react"
import type { MouseEvent } from "react"

type ShapeId = "arc" | "spire"

type CellValue = ShapeId | null

type Constraint = {
  row: number
  col: number
  direction: "right" | "down"
  relation: "same" | "different"
}

const shapes: { id: ShapeId; label: string; color: string }[] = [
  { id: "arc", label: "Arc", color: "#14b8a6" },
  { id: "spire", label: "Spire", color: "#f97316" },
]

const gridSize = 6
const halfRow = gridSize / 2

const solutionGrid: ShapeId[][] = [
  ["arc", "spire", "arc", "spire", "arc", "spire"],
  ["spire", "arc", "spire", "arc", "spire", "arc"],
  ["arc", "spire", "arc", "spire", "arc", "spire"],
  ["spire", "arc", "spire", "arc", "spire", "arc"],
  ["arc", "spire", "arc", "spire", "arc", "spire"],
  ["spire", "arc", "spire", "arc", "spire", "arc"],
]

const fixedCells = new Set(
  [
    [0, 0],
    [0, 3],
    [0, 5],
    [1, 1],
    [1, 4],
    [2, 2],
    [2, 5],
    [3, 0],
    [3, 3],
    [4, 1],
    [4, 4],
    [5, 2],
  ].map(([row, col]) => `${row}-${col}`)
)

const constraintSeeds: Array<{ row: number; col: number; direction: "right" | "down" }> = [
  { row: 0, col: 0, direction: "right" },
  { row: 0, col: 2, direction: "right" },
  { row: 0, col: 4, direction: "down" },
  { row: 1, col: 1, direction: "down" },
  { row: 1, col: 3, direction: "right" },
  { row: 2, col: 0, direction: "down" },
  { row: 2, col: 2, direction: "down" },
  { row: 2, col: 4, direction: "right" },
  { row: 3, col: 1, direction: "right" },
  { row: 3, col: 3, direction: "down" },
  { row: 4, col: 0, direction: "right" },
  { row: 4, col: 2, direction: "right" },
  { row: 4, col: 4, direction: "right" },
]

const constraints: Constraint[] = constraintSeeds.map((seed) => {
  const { row, col, direction } = seed
  const nextRow = direction === "down" ? row + 1 : row
  const nextCol = direction === "right" ? col + 1 : col
  const relation = solutionGrid[row][col] === solutionGrid[nextRow][nextCol] ? "same" : "different"
  return { row, col, direction, relation }
})

const makeInitialBoard = (): CellValue[][] =>
  Array.from({ length: gridSize }, (_, row) =>
    Array.from({ length: gridSize }, (_, col) => {
      if (fixedCells.has(`${row}-${col}`)) {
        return solutionGrid[row][col]
      }
      return null
    })
  )

const renderShape = (shape: ShapeId, colorHex: string) => {
  switch (shape) {
    case "arc":
      return (
        <>
          <path d="M20 64c0-19.9 16.1-36 36-36 7.5 0 14.6 2.3 20.5 6.3" stroke={colorHex} strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="62" cy="28" r="10" fill={colorHex} />
        </>
      )
    case "spire":
      return (
        <>
          <path d="M50 12 80 44 62 44 62 88 38 88 38 44 20 44Z" fill={colorHex} />
          <circle cx="50" cy="34" r="8" fill="#fff" opacity="0.7" />
        </>
      )
  }
}

const ShapeTile = ({
  value,
  isFixed,
  isSelected,
  isInvalid,
}: {
  value: CellValue
  isFixed: boolean
  isSelected: boolean
  isInvalid: boolean
}) => {
  const shape = shapes.find((item) => item.id === value)

  return (
    <div
      className={`flex items-center justify-center rounded-2xl border transition shadow-sm ${
        isFixed
          ? "border-slate-300/80 dark:border-slate-600/80 bg-slate-100/90 dark:bg-slate-800/70"
          : "border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/70"
      } ${isSelected ? "ring-2 ring-teal-400/80" : ""} ${isInvalid ? "border-rose-400 ring-2 ring-rose-300/70" : ""}`}
    >
      {shape ? (
        <svg viewBox="0 0 100 100" className="h-10 w-10 sm:h-11 sm:w-11">
          {renderShape(shape.id, shape.color)}
        </svg>
      ) : (
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600">•</span>
      )}
    </div>
  )
}

const getCellKey = (row: number, col: number) => `${row}-${col}`

const getCellValue = (grid: CellValue[][], row: number, col: number) => grid[row]?.[col] ?? null

const hasTriple = (line: CellValue[]) =>
  line.some((value, index) => value && value === line[index + 1] && value === line[index + 2])

const isLineOverfilled = (line: CellValue[]) => {
  const arcCount = line.filter((cell) => cell === "arc").length
  const spireCount = line.filter((cell) => cell === "spire").length
  return arcCount > halfRow || spireCount > halfRow
}

const isLineComplete = (line: CellValue[]) => !line.includes(null)

const isLineBalanced = (line: CellValue[]) => {
  const arcCount = line.filter((cell) => cell === "arc").length
  const spireCount = line.filter((cell) => cell === "spire").length
  return arcCount === halfRow && spireCount === halfRow
}

const getLineStatus = (line: CellValue[]) => {
  if (isLineOverfilled(line)) return "over"
  if (hasTriple(line)) return "triple"
  if (isLineComplete(line) && !isLineBalanced(line)) return "unbalanced"
  if (isLineComplete(line) && isLineBalanced(line)) return "balanced"
  return "progress"
}

export default function ShapePuzzleGame() {
  const [board, setBoard] = useState<CellValue[][]>(() => makeInitialBoard())
  const [moves, setMoves] = useState(0)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)

  const solved = useMemo(
    () =>
      board.every((row, rowIndex) =>
        row.every((cell, colIndex) => cell !== null && cell === solutionGrid[rowIndex][colIndex])
      ),
    [board]
  )

  const lineStatuses = useMemo(() => {
    const rows = board.map((row) => getLineStatus(row))
    const cols = Array.from({ length: gridSize }, (_, col) => getLineStatus(board.map((row) => row[col])))
    return { rows, cols }
  }, [board])

  const invalidCells = useMemo(() => {
    const invalid = new Set<string>()

    board.forEach((row, rowIndex) => {
      if (hasTriple(row) || isLineOverfilled(row)) {
        row.forEach((_, colIndex) => invalid.add(getCellKey(rowIndex, colIndex)))
      }
    })

    for (let col = 0; col < gridSize; col += 1) {
      const column = board.map((row) => row[col])
      if (hasTriple(column) || isLineOverfilled(column)) {
        column.forEach((_, rowIndex) => invalid.add(getCellKey(rowIndex, col)))
      }
    }

    constraints.forEach((constraint) => {
      const first = getCellValue(board, constraint.row, constraint.col)
      const second = getCellValue(
        board,
        constraint.direction === "down" ? constraint.row + 1 : constraint.row,
        constraint.direction === "right" ? constraint.col + 1 : constraint.col
      )

      if (first && second) {
        const matches = first === second
        const isValid = constraint.relation === "same" ? matches : !matches
        if (!isValid) {
          invalid.add(getCellKey(constraint.row, constraint.col))
          invalid.add(
            getCellKey(
              constraint.direction === "down" ? constraint.row + 1 : constraint.row,
              constraint.direction === "right" ? constraint.col + 1 : constraint.col
            )
          )
        }
      }
    })

    return invalid
  }, [board])

  const updateCell = (row: number, col: number, steps = 1) => {
    if (fixedCells.has(getCellKey(row, col))) return

    setBoard((prev) => {
      const next = prev.map((line) => [...line])
      let current = next[row][col]
      for (let step = 0; step < steps; step += 1) {
        if (current === null) {
          current = shapes[0].id
        } else if (current === shapes[0].id) {
          current = shapes[1].id
        } else {
          current = null
        }
      }
      next[row][col] = current
      return next
    })
    setMoves((prev) => prev + 1)
  }

  const handleTileClick = (row: number, col: number, event: MouseEvent<HTMLButtonElement>) => {
    setSelectedCell({ row, col })
    updateCell(row, col, event.shiftKey ? 2 : 1)
  }

  const handleReset = () => {
    setBoard(makeInitialBoard())
    setMoves(0)
    setSelectedCell(null)
  }

  const selectedValue = selectedCell ? board[selectedCell.row][selectedCell.col] : null
  const selectedShape = shapes.find((shape) => shape.id === selectedValue) ?? null

  const cellSize = "clamp(44px, 7vw, 70px)"
  const cellGap = "clamp(6px, 1.2vw, 12px)"
  const constraintSize = "clamp(16px, 2vw, 20px)"

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Puzzle</p>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50">Arc &amp; Spire Tango</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
            Fill the 6 × 6 grid so each row and column holds three arcs and three spires. No three identical shapes may
            touch in a row or column. Match the equality and contrast clues to finish the tango.
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Puzzle Grid</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Moves: {moves}</p>
            </div>
            <div className="flex items-center gap-3">
              {solved ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-emerald-200/80 bg-emerald-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-400 transition"
                >
                  Play again
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-500 transition"
                >
                  Reset
                </button>
              )}
              {solved && (
                <span className="rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Solved
                </span>
              )}
            </div>
          </div>

          <div className="relative w-fit">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, ${cellSize})`,
                gap: cellGap,
                ["--cell-size" as string]: cellSize,
                ["--cell-gap" as string]: cellGap,
                ["--constraint-size" as string]: constraintSize,
              }}
            >
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const isFixed = fixedCells.has(getCellKey(rowIndex, colIndex))
                  const isSelected =
                    selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                  const isInvalid = invalidCells.has(getCellKey(rowIndex, colIndex))
                  return (
                    <button
                      key={`cell-${rowIndex}-${colIndex}`}
                      type="button"
                      onClick={(event) => handleTileClick(rowIndex, colIndex, event)}
                      className={`focus:outline-none transition ${
                        solved ? "animate-[pulse_1.6s_ease-in-out_infinite]" : ""
                      }`}
                      aria-pressed={isSelected}
                      aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}: ${
                        cell ? shapes.find((shape) => shape.id === cell)?.label : "empty"
                      }`}
                    >
                      <ShapeTile value={cell} isFixed={isFixed} isSelected={isSelected} isInvalid={isInvalid} />
                    </button>
                  )
                })
              )}
            </div>
            {constraints.map((constraint) => {
              const left =
                constraint.direction === "right"
                  ? `calc((var(--cell-size) + var(--cell-gap)) * ${constraint.col} + var(--cell-size) + var(--cell-gap) / 2 - var(--constraint-size) / 2)`
                  : `calc((var(--cell-size) + var(--cell-gap)) * ${constraint.col} + var(--cell-size) / 2 - var(--constraint-size) / 2)`
              const top =
                constraint.direction === "down"
                  ? `calc((var(--cell-size) + var(--cell-gap)) * ${constraint.row} + var(--cell-size) + var(--cell-gap) / 2 - var(--constraint-size) / 2)`
                  : `calc((var(--cell-size) + var(--cell-gap)) * ${constraint.row} + var(--cell-size) / 2 - var(--constraint-size) / 2)`
              return (
                <div
                  key={`constraint-${constraint.row}-${constraint.col}-${constraint.direction}`}
                  className={`absolute flex items-center justify-center rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/80 text-xs font-semibold shadow-sm ${
                    constraint.relation === "same" ? "text-teal-500" : "text-orange-500"
                  }`}
                  style={{
                    width: "var(--constraint-size)",
                    height: "var(--constraint-size)",
                    left,
                    top,
                  }}
                >
                  {constraint.relation === "same" ? "=" : "×"}
                </div>
              )
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Selected tile</p>
            {selectedCell ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Row {selectedCell.row + 1}, Column {selectedCell.col + 1}
                  </span>
                  <span className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {selectedShape ? selectedShape.label : "Empty"}
                  </span>
                  {fixedCells.has(getCellKey(selectedCell.row, selectedCell.col)) && (
                    <span className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Locked
                    </span>
                  )}
                </div>
                {!fixedCells.has(getCellKey(selectedCell.row, selectedCell.col)) && (
                  <button
                    type="button"
                    onClick={() => updateCell(selectedCell.row, selectedCell.col)}
                    className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-500 transition"
                  >
                    Cycle shape
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Select a tile to reveal controls.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/80 dark:bg-slate-900/60 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Row &amp; column balance</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
              {lineStatuses.rows.map((status, index) => (
                <div key={`row-${index}`} className="flex items-center justify-between">
                  <span>Row {index + 1}</span>
                  <span
                    className={`font-semibold ${
                      status === "balanced"
                        ? "text-emerald-600 dark:text-emerald-300"
                        : status === "progress"
                          ? "text-slate-500 dark:text-slate-400"
                          : "text-rose-500 dark:text-rose-300"
                    }`}
                  >
                    {status === "balanced" ? "Balanced" : status === "progress" ? "Filling" : "Check"}
                  </span>
                </div>
              ))}
              {lineStatuses.cols.map((status, index) => (
                <div key={`col-${index}`} className="flex items-center justify-between">
                  <span>Col {index + 1}</span>
                  <span
                    className={`font-semibold ${
                      status === "balanced"
                        ? "text-emerald-600 dark:text-emerald-300"
                        : status === "progress"
                          ? "text-slate-500 dark:text-slate-400"
                          : "text-rose-500 dark:text-rose-300"
                    }`}
                  >
                    {status === "balanced" ? "Balanced" : status === "progress" ? "Filling" : "Check"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {solved && (
            <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-semibold">🎉 Tango complete! Every clue matches.</div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-emerald-200/80 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200 hover:border-emerald-300 dark:hover:border-emerald-400 transition"
                >
                  Play again
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">How it works</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Tap a tile to cycle between arc, spire, and empty. The equality symbol means the adjacent shapes match, while
            the contrast symbol means they differ.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Keyboard tip</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Use Shift + click to advance two steps in the cycle for faster edits.
          </p>
        </div>
      </section>
    </div>
  )
}
