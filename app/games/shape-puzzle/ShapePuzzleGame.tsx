"use client"

import { useEffect, useMemo, useState } from "react"
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

const fallbackSolutionGrid: ShapeId[][] = [
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

const buildConstraints = (solution: ShapeId[][]): Constraint[] =>
  constraintSeeds.map((seed) => {
    const { row, col, direction } = seed
    const nextRow = direction === "down" ? row + 1 : row
    const nextCol = direction === "right" ? col + 1 : col
    const relation = solution[row][col] === solution[nextRow][nextCol] ? "same" : "different"
    return { row, col, direction, relation }
  })

const generateSolutionGrid = (): ShapeId[][] => {
  const attemptLimit = 40
  const shapeIds: ShapeId[] = ["arc", "spire"]

  for (let attempt = 0; attempt < attemptLimit; attempt += 1) {
    const grid: ShapeId[][] = Array.from({ length: gridSize }, () => Array<ShapeId>(gridSize).fill("arc"))
    const rowCounts = Array.from({ length: gridSize }, () => ({ arc: 0, spire: 0 }))
    const colCounts = Array.from({ length: gridSize }, () => ({ arc: 0, spire: 0 }))

    const canPlace = (row: number, col: number, shape: ShapeId) => {
      if (rowCounts[row][shape] >= halfRow || colCounts[col][shape] >= halfRow) return false
      if (col >= 2 && grid[row][col - 1] === shape && grid[row][col - 2] === shape) return false
      if (row >= 2 && grid[row - 1][col] === shape && grid[row - 2][col] === shape) return false

      const remainingRow = gridSize - col - 1
      const nextRowCounts = { ...rowCounts[row], [shape]: rowCounts[row][shape] + 1 }
      if (nextRowCounts.arc + remainingRow < halfRow || nextRowCounts.spire + remainingRow < halfRow) return false

      const remainingCol = gridSize - row - 1
      const nextColCounts = { ...colCounts[col], [shape]: colCounts[col][shape] + 1 }
      if (nextColCounts.arc + remainingCol < halfRow || nextColCounts.spire + remainingCol < halfRow) return false

      return true
    }

    const fill = (index: number): boolean => {
      if (index === gridSize * gridSize) return true
      const row = Math.floor(index / gridSize)
      const col = index % gridSize
      const shuffledShapes = [...shapeIds].sort(() => Math.random() - 0.5)

      for (const shape of shuffledShapes) {
        if (!canPlace(row, col, shape)) continue
        grid[row][col] = shape
        rowCounts[row][shape] += 1
        colCounts[col][shape] += 1

        if (fill(index + 1)) return true

        rowCounts[row][shape] -= 1
        colCounts[col][shape] -= 1
      }

      return false
    }

    if (fill(0)) {
      return grid
    }
  }

  return fallbackSolutionGrid
}

const makeInitialBoard = (solution: ShapeId[][]): CellValue[][] =>
  Array.from({ length: gridSize }, (_, row) =>
    Array.from({ length: gridSize }, (_, col) => {
      if (fixedCells.has(`${row}-${col}`)) {
        return solution[row][col]
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
  hintShape,
  isHint,
  isRelated,
}: {
  value: CellValue
  isFixed: boolean
  isSelected: boolean
  isInvalid: boolean
  hintShape: ShapeId | null
  isHint: boolean
  isRelated: boolean
}) => {
  const shape = shapes.find((item) => item.id === value)
  const hint = shapes.find((item) => item.id === hintShape)

  return (
    <div
      className={`flex items-center justify-center rounded-2xl border transition shadow-sm ${
        isFixed
          ? "border-slate-300/80 dark:border-slate-600/80 bg-slate-100/90 dark:bg-slate-800/70"
          : "border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/70"
      } ${isSelected ? "ring-2 ring-teal-400/80" : ""} ${
        isHint ? "ring-2 ring-sky-400/80" : ""
      } ${isInvalid ? "border-rose-400 ring-2 ring-rose-300/70" : ""} ${
        isRelated && !isSelected && !isInvalid && !isHint ? "ring-1 ring-slate-200/80 dark:ring-slate-700/80" : ""
      }`}
    >
      {shape ? (
        <svg viewBox="0 0 100 100" className="h-10 w-10 sm:h-11 sm:w-11">
          {renderShape(shape.id, shape.color)}
        </svg>
      ) : hint ? (
        <svg viewBox="0 0 100 100" className="h-10 w-10 sm:h-11 sm:w-11 opacity-60">
          {renderShape(hint.id, hint.color)}
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
  const [puzzle] = useState(() => {
    const solutionGrid = generateSolutionGrid()
    return {
      solutionGrid,
      constraints: buildConstraints(solutionGrid),
    }
  })
  const [board, setBoard] = useState<CellValue[][]>(() => makeInitialBoard(puzzle.solutionGrid))
  const [validationBoard, setValidationBoard] = useState<CellValue[][]>(() =>
    makeInitialBoard(puzzle.solutionGrid)
  )
  const [moves, setMoves] = useState(0)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [hintCell, setHintCell] = useState<{ row: number; col: number } | null>(null)

  const { solutionGrid, constraints } = puzzle

  const solved = useMemo(
    () =>
      board.every((row, rowIndex) =>
        row.every((cell, colIndex) => cell !== null && cell === solutionGrid[rowIndex][colIndex])
      ),
    [board, solutionGrid]
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      setValidationBoard(board)
    }, 250)

    return () => clearTimeout(timeout)
  }, [board])

  const lineStatuses = useMemo(() => {
    const rows = validationBoard.map((row) => getLineStatus(row))
    const cols = Array.from({ length: gridSize }, (_, col) =>
      getLineStatus(validationBoard.map((row) => row[col]))
    )
    return { rows, cols }
  }, [validationBoard])

  const invalidCells = useMemo(() => {
    const invalid = new Set<string>()

    validationBoard.forEach((row, rowIndex) => {
      if (hasTriple(row) || isLineOverfilled(row)) {
        row.forEach((_, colIndex) => invalid.add(getCellKey(rowIndex, colIndex)))
      }
    })

    for (let col = 0; col < gridSize; col += 1) {
      const column = validationBoard.map((row) => row[col])
      if (hasTriple(column) || isLineOverfilled(column)) {
        column.forEach((_, rowIndex) => invalid.add(getCellKey(rowIndex, col)))
      }
    }

    constraints.forEach((constraint) => {
      const first = getCellValue(validationBoard, constraint.row, constraint.col)
      const second = getCellValue(
        validationBoard,
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
  }, [constraints, validationBoard])

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
    setHintCell(null)
  }

  const handleTileClick = (row: number, col: number, event: MouseEvent<HTMLButtonElement>) => {
    setSelectedCell({ row, col })
    updateCell(row, col, event.shiftKey ? 2 : 1)
  }

  const handleReset = () => {
    setBoard(makeInitialBoard(solutionGrid))
    setMoves(0)
    setSelectedCell(null)
    setHintCell(null)
  }

  const selectedValue = selectedCell ? board[selectedCell.row][selectedCell.col] : null
  const selectedShape = shapes.find((shape) => shape.id === selectedValue) ?? null
  const hintShape = hintCell ? solutionGrid[hintCell.row][hintCell.col] : null
  const hasEmptyCells = board.some((row) => row.some((cell) => cell === null))
  const filledCells = board.flat().filter((cell) => cell !== null).length
  const totalCells = gridSize * gridSize
  const progressPercent = Math.round((filledCells / totalCells) * 100)
  const balancedRows = lineStatuses.rows.filter((status) => status === "balanced").length
  const balancedCols = lineStatuses.cols.filter((status) => status === "balanced").length
  const progressLabel = solved
    ? "Encore!"
    : progressPercent < 25
      ? "Warm-up"
      : progressPercent < 50
        ? "Finding rhythm"
        : progressPercent < 75
          ? "In the groove"
          : "Finale stretch"
  const conflictCount = invalidCells.size

  const handleHint = () => {
    const emptyCells: Array<{ row: number; col: number }> = []

    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === null) {
          emptyCells.push({ row: rowIndex, col: colIndex })
        }
      })
    })

    if (emptyCells.length === 0) return

    const selection = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    setHintCell(selection)
    setSelectedCell(selection)
  }

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
            touch in a row or column. Match the equality and contrast clues to finish the tango, then take a bow.
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
                <>
                  <button
                    type="button"
                    onClick={handleHint}
                    disabled={!hasEmptyCells}
                    className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 hover:border-sky-400 dark:hover:border-sky-500 transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Hint
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-500 transition"
                  >
                    Reset
                  </button>
                </>
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
                  const isHint = hintCell?.row === rowIndex && hintCell?.col === colIndex
                  const isRelated =
                    selectedCell?.row === rowIndex || selectedCell?.col === colIndex
                  const hintValue = isHint ? hintShape : null
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
                      <ShapeTile
                        value={cell}
                        isFixed={isFixed}
                        isSelected={isSelected}
                        isInvalid={isInvalid}
                        hintShape={hintValue}
                        isHint={isHint}
                        isRelated={isRelated}
                      />
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
          <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-br from-white/90 via-slate-50/90 to-slate-100/70 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-900/40 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Progress</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{progressLabel}</p>
              </div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {filledCells}/{totalCells} tiles
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-slate-800/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 via-sky-400 to-orange-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-2 py-1">
                Balanced rows: {balancedRows}/{gridSize}
              </span>
              <span className="rounded-full border border-slate-200/80 dark:border-slate-700/80 px-2 py-1">
                Balanced cols: {balancedCols}/{gridSize}
              </span>
              <span
                className={`rounded-full border px-2 py-1 ${
                  conflictCount > 0
                    ? "border-rose-200/80 text-rose-500 dark:border-rose-500/40 dark:text-rose-300"
                    : "border-emerald-200/80 text-emerald-600 dark:border-emerald-500/40 dark:text-emerald-300"
                }`}
              >
                {conflictCount > 0 ? `${conflictCount} conflict${conflictCount === 1 ? "" : "s"}` : "No conflicts"}
              </span>
            </div>
          </div>
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
                    {status === "balanced" ? "Balanced ✓" : status === "progress" ? "Filling" : "Check"}
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
                    {status === "balanced" ? "Balanced ✓" : status === "progress" ? "Filling" : "Check"}
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
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">How it works</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Tap a tile to cycle between arc, spire, and empty. The equality symbol means the adjacent shapes match, while
            the contrast symbol means they differ.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 px-2 py-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-teal-200/80 text-teal-500">=</span>
              Same
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 px-2 py-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-orange-200/80 text-orange-500">×</span>
              Different
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Keyboard tip</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Use Shift + click to advance two steps in the cycle for faster edits.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Selecting a tile will softly highlight its row and column so you can spot patterns faster.
          </p>
        </div>
      </section>
    </div>
  )
}
