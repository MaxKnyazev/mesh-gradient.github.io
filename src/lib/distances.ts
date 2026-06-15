import type { ColorPoint, MeasurementPoint } from '../types'
import { computeMeasurementWeights } from './blendWeights'

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
): PointDistance[] {
  const weights = computeMeasurementWeights(
    measurementPoint.x,
    measurementPoint.y,
    points,
  )

  return points.map((point) => {
    const weight = weights.find((item) => item.pointId === point.id)?.weight ?? 0
    return {
      pointId: point.id,
      color: point.color,
      distance: weight * 100,
    }
  })
}
