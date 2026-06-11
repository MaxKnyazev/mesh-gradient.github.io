import { calcDistances } from '../lib/distances'
import type { GradientState } from '../types'

interface DistancePanelProps {
  state: GradientState
}

export function DistancePanel({ state }: DistancePanelProps) {
  if (!state.measurementPoint) return null

  const distances = calcDistances(state.measurementPoint, state.points)

  return (
    <section className="distance-panel">
      <h2>Расстояния от измерительной точки</h2>
      <table>
        <thead>
          <tr>
            <th>Точка</th>
            <th>Цвет</th>
            <th>Расстояние</th>
          </tr>
        </thead>
        <tbody>
          {distances.map((d, i) => (
            <tr key={d.pointId}>
              <td>#{i + 1}</td>
              <td>
                <span
                  className="color-swatch"
                  style={{ backgroundColor: d.color }}
                />
                {d.color}
              </td>
              <td>{Math.round(d.distance)} px</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
