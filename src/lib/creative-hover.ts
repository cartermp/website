const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)")
const root = document.documentElement
const selector = ".post-list > li, a[href], h1, h2, h3, h4, h5, h6"

// Each pose is x, y, turn, and stretch. Smaller elements get a bigger turn.
type Pose = [x: number, y: number, turn: number, stretch?: number]
const moves: Pose[][] = [
  [[0.15, -1, -1, 1.1], [0, 0.25, 0.25, 0.94], [0, -0.3, -0.2]],
  [[0, 1, 0.35, 0.93], [0.14, -0.24, -0.3, 1.06], [0, 0.25, 0.12]],
  [[-1, 0, -0.55], [0.8, 0, 0.7], [-0.32, 0, -0.25]],
  [[1, 0, 0.55], [-0.8, 0, -0.7], [0.32, 0, 0.25]],
  [[0.85, -0.65, 0.65, 1.03], [-0.2, -0.35, -0.8], [0.18, 0.08, 0.2]],
  [[0, 0.36, -0.25, 0.9], [0.28, -0.82, 0.8, 1.08], [-0.12, -0.2, -0.35]],
  [[-0.5, -0.52, -0.85], [0.42, -0.85, 1, 1.04], [0.13, 0.12, -0.2]],
]
const lastMove = new WeakMap<Element, Pose[]>()
const playing = new Map<Element, Animation>()
let previousMove: Pose[] | undefined

function play(anchor: Element) {
  // Move the title itself so the invisible full-card hit area stays in place.
  const target = anchor.matches(".post-title-link") ? anchor.firstElementChild ?? anchor : anchor
  if (typeof target.animate !== "function" || playing.has(target)) return

  const remaining = moves.filter((move) => move !== lastMove.get(target) && move !== previousMove)
  const move = remaining[Math.floor(Math.random() * remaining.length)]
  lastMove.set(target, move)
  previousMove = move

  const card = anchor.matches(".post-list > li")
  const heading = anchor.matches("h1, h2, h3, h4, h5, h6, .post-title-link")
  const distance = card ? 12 : heading ? 6 : 8
  const angle = card ? 1.2 : heading ? 2.4 : 10
  const inline = target === anchor && anchor.matches("a") && getComputedStyle(anchor).display === "inline"

  const [firstX, firstY, firstTurn] = move[0]
  const windUp: Pose = [-firstX * 0.16, -firstY * 0.16, -firstTurn * 0.12, 0.97]
  const poses: Pose[] = [[0, 0, 0], windUp, ...move, [0, 0, 0]]
  const timing = [0, 0.18, 0.46, 0.64, 0.8, 1]
  const frames = poses.map(([x, y, turn, stretch = 1], index) => {
    const timingFrame = { offset: timing[index], easing: index < 2 ? "ease-in-out" : "ease-out" }
    if (inline) return { ...timingFrame, left: `${x * distance}px`, top: `${y * distance}px` }
    const scale = card ? 1 + (stretch - 1) * 0.16 : stretch
    return { ...timingFrame, transform: `translate(${x * distance}px, ${y * distance}px) rotate(${turn * angle}deg) scale(${scale})` }
  })

  const animation = target.animate(frames, { duration: card ? 1080 : 880 })
  playing.set(target, animation)
  animation.onfinish = () => {
    if (playing.get(target) === animation) playing.delete(target)
  }
}

function reactToEntry(event: PointerEvent | FocusEvent) {
  if (root.dataset.theme !== "creative" || reducedMotion.matches) return
  if (event instanceof PointerEvent && event.pointerType === "touch") return
  const target = event.target
  if (!(target instanceof Element)) return
  if (event.type === "focusin" && !target.matches(":focus-visible")) return

  const item = target.closest(selector)
  const card = target.closest(".post-list > li")
  for (const element of new Set([card, item])) {
    if (!element || (event.relatedTarget instanceof Node && element.contains(event.relatedTarget))) continue
    play(element)
  }
}

document.addEventListener("pointerover", reactToEntry)
document.addEventListener("focusin", reactToEntry)
reducedMotion.addEventListener("change", () => {
  if (!reducedMotion.matches) return
  for (const animation of playing.values()) animation.cancel()
  playing.clear()
})
