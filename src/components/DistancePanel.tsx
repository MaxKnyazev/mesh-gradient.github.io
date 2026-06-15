import { calcDistances, formatDistancePercent } from '../lib/distances'
import type { GradientState } from '../types'

interface DistancePanelProps {
  state: GradientState
}

export function DistancePanel({ state }: DistancePanelProps) {
  if (!state.measurementPoint) return null

  const distances = calcDistances(state.measurementPoint, state.points)
  const total = distances.reduce((sum, item) => sum + item.distance, 0)

  return (
    <section className="distance-panel">
      <h2>Доли от измерительной точки</h2>
      <table>
        <thead>
          <tr>
            <th>Точка</th>
            <th>Цвет</th>
            <th>Доля</th>
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
              <td>{formatDistancePercent(d.distance)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>Итого</td>
            <td>{formatDistancePercent(total)}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  )
}
