export function distanceToCircleEdge(
  x: number,
  y: number,
  cx: number,
  cy: number,
  radius: number,
): number {
  const d = Math.hypot(x - cx, y - cy)
  return Math.abs(d - radius)
}

export function nearestPointOnCircle(
  x: number,
  y: number,
  cx: number,
  cy: number,
  radius: number,
): { x: number; y: number } {
  const dx = x - cx
  const dy = y - cy
  const d = Math.hypot(dx, dy)
  if (d === 0) {
    return { x: cx + radius, y: cy }
  }
  const sign = d >= radius ? 1 : -1
  return {
    x: cx + sign * (dx / d) * radius,
    y: cy + sign * (dy / d) * radius,
  }
}
