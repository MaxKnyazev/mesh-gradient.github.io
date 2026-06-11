import type { ColorPoint, MeasurementPoint } from '../types'

export interface PointDistance {
  pointId: string
  color: string
  distance: number
}

export function calcDistances(
  measurementPoint: MeasurementPoint,
  points: ColorPoint[],
): PointDistance[] {
  return points.map((point) => ({
    pointId: point.id,
    color: point.color,
    distance: Math.hypot(point.x - measurementPoint.x, point.y - measurementPoint.y),
  }))
}
