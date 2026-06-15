import type { ColorPoint } from '../types'

export interface PointWeight {
  pointId: string
  weight: number
}

const INFLUENCE_POWER = 2

export function influenceWeight(centerDist: number, radius: number): number {
  const r = Math.max(radius, 1)
  const d = Math.max(centerDist, 0.5)

  if (d <= r) {
    return Math.pow(r / d, INFLUENCE_POWER)
  }

  const edgeDist = d - r
  return Math.pow(r / (edgeDist + r), INFLUENCE_POWER)
}

function normalizeWeights(rawWeights: PointWeight[]): PointWeight[] {
  const total = rawWeights.reduce((sum, item) => sum + item.weight, 0)
  if (total === 0) {
    const equal = 1 / rawWeights.length
    return rawWeights.map((item) => ({ ...item, weight: equal }))
  }
  return rawWeights.map((item) => ({
    ...item,
    weight: item.weight / total,
  }))
}

export function findSolidPointId(
  x: number,
  y: number,
  points: ColorPoint[],
): string | null {
  let solidPointId: string | null = null
  let closestCenterDist = Infinity

  for (const point of points) {
    const centerDist = Math.hypot(x - point.x, y - point.y)
    if (centerDist <= point.radius && centerDist < closestCenterDist) {
      solidPointId = point.id
      closestCenterDist = centerDist
    }
  }

  return solidPointId
}

export function computeGradientWeights(
  x: number,
  y: number,
  points: ColorPoint[],
): PointWeight[] {
  const rawWeights = points.map((point) => ({
    pointId: point.id,
    weight: influenceWeight(
      Math.hypot(x - point.x, y - point.y),
      point.radius,
    ),
  }))

  return normalizeWeights(rawWeights)
}

export function computeMeasurementWeights(
  x: number,
  y: number,
  points: ColorPoint[],
): PointWeight[] {
  const solidPointId = findSolidPointId(x, y, points)

  if (solidPointId) {
    return points.map((point) => ({
      pointId: point.id,
      weight: point.id === solidPointId ? 1 : 0,
    }))
  }

  return computeGradientWeights(x, y, points)
}
