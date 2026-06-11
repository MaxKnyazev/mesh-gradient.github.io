import type { ExportData, GradientState } from '../types'

export function exportToJson(state: GradientState): string {
  const data: ExportData = {
    version: 1,
    width: state.width,
    height: state.height,
    points: state.points,
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

function isColorPoint(value: unknown): value is ExportData['points'][number] {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    typeof p.x === 'number' &&
    typeof p.y === 'number' &&
    typeof p.color === 'string' &&
    typeof p.radius === 'number' &&
    p.radius > 0
  )
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

  if (!data.points.every(isColorPoint)) {
    throw new Error('Некорректные данные точек')
  }

  const measurementPoint =
    data.measurementPoint === null
      ? null
      : isMeasurementPoint(data.measurementPoint)
        ? data.measurementPoint
        : (() => {
            throw new Error('Некорректная измерительная точка')
          })()

  const points = data.points as ExportData['points']

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
