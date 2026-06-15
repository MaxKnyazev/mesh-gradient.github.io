import { useCallback, useState } from 'react'
import type { AddMode, ColorPoint, GradientState, Selection } from '../types'

function createId(): string {
  return crypto.randomUUID()
}

const DEFAULT_STATE: GradientState = {
  width: 600,
  height: 600,
  points: [
    { id: createId(), x: 150, y: 150, color: '#ff6b6b', radius: 250 },
    { id: createId(), x: 450, y: 150, color: '#4ecdc4', radius: 250 },
    { id: createId(), x: 300, y: 450, color: '#ffe66d', radius: 280 },
  ],
  measurementPoint: null,
}

export function useGradientState() {
  const [state, setState] = useState<GradientState>(DEFAULT_STATE)
  const [selection, setSelection] = useState<Selection>(null)
  const [addMode, setAddMode] = useState<AddMode>(null)
  const [showPointBoundaries, setShowPointBoundaries] = useState(false)

  const addColorPoint = useCallback((x: number, y: number) => {
    const point: ColorPoint = {
      id: createId(),
      x,
      y,
      color: '#a78bfa',
      radius: 200,
    }
    setState((prev) => ({ ...prev, points: [...prev.points, point] }))
    setSelection({ type: 'color', id: point.id })
    setAddMode(null)
  }, [])

  const setMeasurementPoint = useCallback((x: number, y: number) => {
    setState((prev) => ({ ...prev, measurementPoint: { x, y } }))
    setSelection({ type: 'measurement' })
    setAddMode(null)
  }, [])

  const updateColorPoint = useCallback(
    (id: string, patch: Partial<Omit<ColorPoint, 'id'>>) => {
      setState((prev) => ({
        ...prev,
        points: prev.points.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }))
    },
    [],
  )

  const updateMeasurementPoint = useCallback(
    (patch: Partial<{ x: number; y: number }>) => {
      setState((prev) => {
        if (!prev.measurementPoint) return prev
        return {
          ...prev,
          measurementPoint: { ...prev.measurementPoint, ...patch },
        }
      })
    },
    [],
  )

  const movePoint = useCallback(
    (type: 'color' | 'measurement', idOrNull: string | null, x: number, y: number) => {
      const clamp = (v: number, max: number) => Math.max(0, Math.min(v, max))
      setState((prev) => {
        const cx = clamp(x, prev.width)
        const cy = clamp(y, prev.height)
        if (type === 'measurement') {
          return {
            ...prev,
            measurementPoint: prev.measurementPoint
              ? { x: cx, y: cy }
              : { x: cx, y: cy },
          }
        }
        if (!idOrNull) return prev
        return {
          ...prev,
          points: prev.points.map((p) =>
            p.id === idOrNull ? { ...p, x: cx, y: cy } : p,
          ),
        }
      })
    },
    [],
  )

  const deleteSelected = useCallback(() => {
    if (!selection) return
    if (selection.type === 'measurement') {
      setState((prev) => ({ ...prev, measurementPoint: null }))
      setSelection(null)
      return
    }
    setState((prev) => ({
      ...prev,
      points: prev.points.filter((p) => p.id !== selection.id),
    }))
    setSelection(null)
  }, [selection])

  const setFieldSize = useCallback((width: number, height: number) => {
    const w = Math.max(100, Math.min(width, 1200))
    const h = Math.max(100, Math.min(height, 1200))
    setState((prev) => ({
      ...prev,
      width: w,
      height: h,
      points: prev.points.map((p) => ({
        ...p,
        x: Math.min(p.x, w),
        y: Math.min(p.y, h),
      })),
      measurementPoint: prev.measurementPoint
        ? {
            x: Math.min(prev.measurementPoint.x, w),
            y: Math.min(prev.measurementPoint.y, h),
          }
        : null,
    }))
  }, [])

  const loadState = useCallback((newState: GradientState) => {
    setState(newState)
    setSelection(null)
    setAddMode(null)
  }, [])

  const selectAt = useCallback(
    (x: number, y: number, hitRadius = 12): boolean => {
      if (state.measurementPoint) {
        const d = Math.hypot(
          x - state.measurementPoint.x,
          y - state.measurementPoint.y,
        )
        if (d <= hitRadius) {
          setSelection({ type: 'measurement' })
          return true
        }
      }

      for (let i = state.points.length - 1; i >= 0; i--) {
        const p = state.points[i]
        const d = Math.hypot(x - p.x, y - p.y)
        if (d <= hitRadius) {
          setSelection({ type: 'color', id: p.id })
          return true
        }
      }
      return false
    },
    [state.measurementPoint, state.points],
  )

  return {
    state,
    selection,
    addMode,
    setAddMode,
    addColorPoint,
    setMeasurementPoint,
    updateColorPoint,
    updateMeasurementPoint,
    movePoint,
    deleteSelected,
    setFieldSize,
    loadState,
    selectAt,
    setSelection,
    showPointBoundaries,
    setShowPointBoundaries,
  }
}

export type GradientStateApi = ReturnType<typeof useGradientState>
