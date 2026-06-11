import { useRef } from 'react'
import { downloadJson, parseImportJson } from '../lib/jsonIO'
import type { GradientStateApi } from '../hooks/useGradientState'

interface ToolbarProps {
  api: GradientStateApi
}

export function Toolbar({ api }: ToolbarProps) {
  const { state, addMode, setAddMode, deleteSelected, selection, loadState } = api
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = parseImportJson(reader.result as string)
        loadState(imported)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Ошибка импорта')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="toolbar">
      <button
        type="button"
        className={addMode === 'color' ? 'active' : ''}
        onClick={() => setAddMode(addMode === 'color' ? null : 'color')}
      >
        + Точка
      </button>
      <button
        type="button"
        className={addMode === 'measurement' ? 'active' : ''}
        onClick={() => setAddMode(addMode === 'measurement' ? null : 'measurement')}
      >
        + Измерительная
      </button>
      <button
        type="button"
        disabled={!selection}
        onClick={deleteSelected}
      >
        Удалить выбранную
      </button>
      <div className="toolbar-spacer" />
      <button type="button" onClick={() => downloadJson(state)}>
        Экспорт JSON
      </button>
      <button type="button" onClick={() => fileInputRef.current?.click()}>
        Импорт JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={handleImport}
      />
    </div>
  )
}
