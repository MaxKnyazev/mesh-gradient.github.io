export interface ColorPoint {
  id: string
  x: number
  y: number
  color: string
  radius: number
}

export interface MeasurementPoint {
  x: number
  y: number
}

export interface GradientState {
  width: number
  height: number
  points: ColorPoint[]
  measurementPoint: MeasurementPoint | null
}

export interface ExportData {
  version: 1
  width: number
  height: number
  points: ColorPoint[]
  measurementPoint: MeasurementPoint | null
}

export type Selection =
  | { type: 'color'; id: string }
  | { type: 'measurement' }
  | null

export type AddMode = 'color' | 'measurement' | null
