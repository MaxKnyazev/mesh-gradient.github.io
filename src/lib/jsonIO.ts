import { computeMeasurementWeights } from './blendWeights'
import type { ColorPoint, ExportData, GradientState } from '../types'

export function exportToJson(state: GradientState): string {
  const measurementWeights = state.measurementPoint
    ? computeMeasurementWeights(
        state.measurementPoint.x,
        state.measurementPoint.y,
        state.points,
      )
    : null

  const points = state.points.map((point) => {
    const exported: ExportData['points'][number] = { ...point }
    if (measurementWeights) {
      const weight =
        measurementWeights.find((item) => item.pointId === point.id)?.weight ?? 0
      exported.chance = Math.round(weight * 1000) / 10
    }
    return exported
  })

  const data: ExportData = {
    version: 1,
    width: state.width,
    height: state.height,
    points,
    measurementPoint: state.measurementPoint,
  }
  return JSON.stringify(data, null, 2)
}

export function downloadJson(state: GradientState, filename = 'mesh-gradient.json'): void {
  const blob = new Blob([exportToJson(state)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function parseColorPoint(value: unknown): ColorPoint | null {
  if (!value || typeof value !== 'object') return null
  const p = value as Record<string, unknown>
  if (
    typeof p.id !== 'string' ||
    typeof p.x !== 'number' ||
    typeof p.y !== 'number' ||
    typeof p.color !== 'string' ||
    typeof p.radius !== 'number' ||
    p.radius <= 0
  ) {
    return null
  }
  if (p.chance !== undefined && typeof p.chance !== 'number') {
    return null
  }

  return {
    id: p.id,
    x: p.x,
    y: p.y,
    color: p.color,
    radius: p.radius,
  }
}

function isMeasurementPoint(
  value: unknown,
): value is NonNullable<ExportData['measurementPoint']> {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return typeof p.x === 'number' && typeof p.y === 'number'
}

export function parseImportJson(text: string): GradientState {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Некорректный JSON')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Некорректная структура данных')
  }

  const data = parsed as Record<string, unknown>

  if (data.version !== 1) {
    throw new Error('Неподдерживаемая версия формата')
  }

  if (typeof data.width !== 'number' || data.width <= 0) {
    throw new Error('Некорректная ширина поля')
  }

  if (typeof data.height !== 'number' || data.height <= 0) {
    throw new Error('Некорректная высота поля')
  }

  if (!Array.isArray(data.points) || data.points.length === 0) {
    throw new Error('Должна быть хотя бы одна цветная точка')
  }

  const points: ColorPoint[] = []
  for (const point of data.points) {
    const parsedPoint = parseColorPoint(point)
    if (!parsedPoint) {
      throw new Error('Некорректные данные точек')
    }
    points.push(parsedPoint)
  }

  const measurementPoint =
    data.measurementPoint === null
      ? null
      : isMeasurementPoint(data.measurementPoint)
        ? data.measurementPoint
        : (() => {
            throw new Error('Некорректная измерительная точка')
          })()

  for (const point of points) {
    if (
      point.x < 0 ||
      point.x > data.width ||
      point.y < 0 ||
      point.y > data.height
    ) {
      throw new Error(`Точка ${point.id} выходит за пределы поля`)
    }
  }

  return {
    width: data.width,
    height: data.height,
    points,
    measurementPoint,
  }
}
