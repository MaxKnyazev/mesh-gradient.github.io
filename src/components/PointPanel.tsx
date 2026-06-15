import type { GradientStateApi } from '../hooks/useGradientState'

interface PointPanelProps {
  api: GradientStateApi
}

export function PointPanel({ api }: PointPanelProps) {
  const {
    state,
    selection,
    updateColorPoint,
    updateMeasurementPoint,
    setFieldSize,
    showPointBoundaries,
    setShowPointBoundaries,
  } = api

  const selectedColorPoint =
    selection?.type === 'color'
      ? state.points.find((p) => p.id === selection.id)
      : null

  return (
    <div className="side-column">
      <aside className="point-panel">
        <h2>Свойства</h2>

        <section className="panel-section">
          <h3>Размер поля</h3>
          <label>
            Ширина
            <input
              type="number"
              min={100}
              max={1200}
              value={state.width}
              onChange={(e) =>
                setFieldSize(Number(e.target.value), state.height)
              }
            />
          </label>
          <label>
            Высота
            <input
              type="number"
              min={100}
              max={1200}
              value={state.height}
              onChange={(e) =>
                setFieldSize(state.width, Number(e.target.value))
              }
            />
          </label>
        </section>

        {selectedColorPoint && (
          <section className="panel-section">
            <h3>Цветная точка</h3>
            <label>
              X
              <input
                type="number"
                min={0}
                max={state.width}
                value={Math.round(selectedColorPoint.x)}
                onChange={(e) =>
                  updateColorPoint(selectedColorPoint.id, {
                    x: Number(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Y
              <input
                type="number"
                min={0}
                max={state.height}
                value={Math.round(selectedColorPoint.y)}
                onChange={(e) =>
                  updateColorPoint(selectedColorPoint.id, {
                    y: Number(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Цвет
              <input
                type="color"
                value={selectedColorPoint.color}
                onChange={(e) =>
                  updateColorPoint(selectedColorPoint.id, {
                    color: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Радиус: {Math.round(selectedColorPoint.radius)} px
              <input
                type="range"
                min={10}
                max={500}
                value={selectedColorPoint.radius}
                onChange={(e) =>
                  updateColorPoint(selectedColorPoint.id, {
                    radius: Number(e.target.value),
                  })
                }
              />
            </label>
          </section>
        )}

        {selection?.type === 'measurement' && state.measurementPoint && (
          <section className="panel-section">
            <h3>Измерительная точка</h3>
            <p className="hint">Не влияет на градиент</p>
            <label>
              X
              <input
                type="number"
                min={0}
                max={state.width}
                value={Math.round(state.measurementPoint.x)}
                onChange={(e) =>
                  updateMeasurementPoint({ x: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Y
              <input
                type="number"
                min={0}
                max={state.height}
                value={Math.round(state.measurementPoint.y)}
                onChange={(e) =>
                  updateMeasurementPoint({ y: Number(e.target.value) })
                }
              />
            </label>
          </section>
        )}

        {!selection && (
          <p className="hint">Выберите точку на холсте или добавьте новую</p>
        )}
      </aside>

      <label className="panel-checkbox panel-checkbox-below">
        <input
          type="checkbox"
          checked={showPointBoundaries}
          onChange={(e) => setShowPointBoundaries(e.target.checked)}
        />
        Показывать границы точек
      </label>
    </div>
  )
}
