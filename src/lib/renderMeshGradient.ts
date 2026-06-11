import type { ColorPoint } from '../types'

const BACKGROUND = { r: 26, g: 26, b: 26 }

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

  const parsedPoints = points.map((p) => ({
    x: p.x,
    y: p.y,
    radius: Math.max(p.radius, 1),
    ...parseColor(p.color),
  }))

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      let totalWeight = 0
      let r = 0
      let g = 0
      let b = 0

      for (const point of parsedPoints) {
        const d = Math.hypot(px - point.x, py - point.y)
        const w = Math.max(0, 1 - d / point.radius)
        if (w > 0) {
          r += w * point.r
          g += w * point.g
          b += w * point.b
          totalWeight += w
        }
      }

      const idx = (py * width + px) * 4
      if (totalWeight > 0) {
        data[idx] = r / totalWeight
        data[idx + 1] = g / totalWeight
        data[idx + 2] = b / totalWeight
      } else {
        data[idx] = BACKGROUND.r
        data[idx + 1] = BACKGROUND.g
        data[idx + 2] = BACKGROUND.b
      }
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}
