import type { ColorPoint } from '../types'
import { computeGradientWeights } from './blendWeights'

function parseColor(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '')
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized
  const num = parseInt(value, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export function renderMeshGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  points: ColorPoint[],
): void {
  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  const colorPoints: ColorPoint[] = points.map((p) => ({
    ...p,
    radius: Math.max(p.radius, 1),
  }))

  const parsedPoints = colorPoints.map((p) => ({
    id: p.id,
    ...parseColor(p.color),
  }))

  const pointById = new Map(parsedPoints.map((point) => [point.id, point]))

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const weights = computeGradientWeights(px, py, colorPoints)
      const idx = (py * width + px) * 4

      let r = 0
      let g = 0
      let b = 0

      for (const weight of weights) {
        const point = pointById.get(weight.pointId)!
        r += weight.weight * point.r
        g += weight.weight * point.g
        b += weight.weight * point.b
      }

      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}
