import type { ColorPoint, MeasurementPoint } from '../types'

export interface PointDistance {
  pointId: string
  color: string
  distance: number
}

export function formatDistancePercent(distance: number): string {
  return `${distance.toFixed(1)}%`
}

export function calcDistances(
  measurementPoint: MeasurementPoint,
  points: ColorPoint[],
  width: number,
  height: number,
): PointDistance[] {
  const fieldDiagonal = Math.hypot(width, height)
  return points.map((point) => {
    const pixelDistance = Math.hypot(
      point.x - measurementPoint.x,
      point.y - measurementPoint.y,
    )
    return {
      pointId: point.id,
      color: point.color,
      distance: (pixelDistance / fieldDiagonal) * 100,
    }
  })
}
