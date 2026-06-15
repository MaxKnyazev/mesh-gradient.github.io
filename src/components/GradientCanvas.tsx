import { useCallback, useEffect, useRef } from 'react'
import { calcDistances, formatDistancePercent } from '../lib/distances'
import { renderMeshGradient } from '../lib/renderMeshGradient'
import type { GradientStateApi } from '../hooks/useGradientState'

interface GradientCanvasProps {
  api: GradientStateApi
}

type DragTarget =
  | { type: 'color'; id: string }
  | { type: 'measurement' }
  | null

export function GradientCanvas({ api }: GradientCanvasProps) {
  const { state, selection, addMode, addColorPoint, setMeasurementPoint, movePoint, selectAt } =
    api

  const containerRef = useRef<HTMLDivElement>(null)
  const gradientCanvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const dragRef = useRef<DragTarget>(null)
  const rafRef = useRef<number | null>(null)

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const canvas = overlayCanvasRef.current!
      const rect = canvas.getBoundingClientRect()
      const scaleX = state.width / rect.width
      const scaleY = state.height / rect.height
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    },
    [state.width, state.height],
  )

  useEffect(() => {
    const canvas = gradientCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      renderMeshGradient(ctx, state.width, state.height, state.points)
      rafRef.current = null
    })

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [state.width, state.height, state.points])

  useEffect(() => {
    const canvas = overlayCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, state.width, state.height)

    if (state.measurementPoint) {
      const distances = calcDistances(
        state.measurementPoint,
        state.points,
        state.width,
        state.height,
      )
      ctx.setLineDash([6, 4])
      ctx.lineWidth = 1.5
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '12px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (const point of state.points) {
        const dist = distances.find((d) => d.pointId === point.id)?.distance ?? 0
        const mx = state.measurementPoint.x
        const my = state.measurementPoint.y

        ctx.beginPath()
        ctx.moveTo(mx, my)
        ctx.lineTo(point.x, point.y)
        ctx.stroke()

        const lx = (mx + point.x) / 2
        const ly = (my + point.y) / 2
        const label = formatDistancePercent(dist)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
        const tw = ctx.measureText(label).width
        ctx.fillRect(lx - tw / 2 - 4, ly - 8, tw + 8, 16)
        ctx.fillStyle = '#fff'
        ctx.fillText(label, lx, ly)
      }

      ctx.setLineDash([])
    }

    for (const point of state.points) {
      const isSelected = selection?.type === 'color' && selection.id === point.id

      if (isSelected) {
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = point.color
      ctx.fill()
      ctx.strokeStyle = isSelected ? '#fff' : 'rgba(0,0,0,0.5)'
      ctx.lineWidth = isSelected ? 2.5 : 1.5
      ctx.stroke()
    }

    if (state.measurementPoint) {
      const mp = state.measurementPoint
      const isSelected = selection?.type === 'measurement'
      const size = 10

      ctx.save()
      ctx.translate(mp.x, mp.y)
      ctx.strokeStyle = isSelected ? '#fff' : '#fbbf24'
      ctx.lineWidth = isSelected ? 2.5 : 2
      ctx.beginPath()
      ctx.moveTo(-size, 0)
      ctx.lineTo(size, 0)
      ctx.moveTo(0, -size)
      ctx.lineTo(0, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, 0, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#fbbf24'
      ctx.fill()
      ctx.restore()
    }
  }, [state, selection])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    const { x, y } = getCanvasCoords(e)

    if (addMode === 'color') {
      addColorPoint(x, y)
      return
    }
    if (addMode === 'measurement') {
      setMeasurementPoint(x, y)
      return
    }

    if (state.measurementPoint) {
      const d = Math.hypot(x - state.measurementPoint.x, y - state.measurementPoint.y)
      if (d <= 12) {
        dragRef.current = { type: 'measurement' }
        return
      }
    }

    for (let i = state.points.length - 1; i >= 0; i--) {
      const p = state.points[i]
      const d = Math.hypot(x - p.x, y - p.y)
      if (d <= 12) {
        dragRef.current = { type: 'color', id: p.id }
        api.setSelection({ type: 'color', id: p.id })
        return
      }
    }

    selectAt(x, y)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return
    const { x, y } = getCanvasCoords(e)
    if (dragRef.current.type === 'measurement') {
      movePoint('measurement', null, x, y)
    } else {
      movePoint('color', dragRef.current.id, x, y)
    }
  }

  const handleMouseUp = () => {
    dragRef.current = null
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    const { x, y } = getCanvasCoords(e)
    if (selectAt(x, y)) {
      api.deleteSelected()
    }
  }

  return (
    <div className="canvas-wrapper" ref={containerRef}>
      <div
        className="canvas-stack"
        style={{ aspectRatio: `${state.width} / ${state.height}` }}
      >
        <canvas
          ref={gradientCanvasRef}
          width={state.width}
          height={state.height}
          className="gradient-canvas"
        />
        <canvas
          ref={overlayCanvasRef}
          width={state.width}
          height={state.height}
          className="overlay-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={handleContextMenu}
        />
      </div>
    </div>
  )
}
