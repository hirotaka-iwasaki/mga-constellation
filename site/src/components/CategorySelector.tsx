import { useState, useCallback, useRef, useEffect } from 'preact/hooks'
import type { Constellation } from '../types'

interface CategorySelectorProps {
  constellations: Constellation[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}

type CategoryType = 'live' | 'album' | 'single'

const CATEGORY_LABELS: Record<CategoryType, string> = {
  live: 'ライブ',
  album: 'アルバム',
  single: 'シングル',
}

export function CategorySelector({
  constellations,
  selectedIds,
  onSelectionChange,
}: CategorySelectorProps) {
  const [openCategory, setOpenCategory] = useState<CategoryType | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // カテゴリごとにグループ化
  const grouped = constellations.reduce(
    (acc, c) => {
      if (c.type === 'live' || c.type === 'album' || c.type === 'single') {
        if (!acc[c.type]) acc[c.type] = []
        acc[c.type].push(c)
      }
      return acc
    },
    {} as Record<CategoryType, Constellation[]>
  )

  // 年で降順ソート
  Object.keys(grouped).forEach((key) => {
    grouped[key as CategoryType]?.sort((a, b) => b.year - a.year)
  })

  // ドロップダウンの外をタップで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenCategory(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggleCategory = useCallback((cat: CategoryType) => {
    setOpenCategory((prev) => (prev === cat ? null : cat))
  }, [])

  const handleSelectConstellation = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((sid) => sid !== id))
      } else {
        onSelectionChange([...selectedIds, id])
      }
    },
    [selectedIds, onSelectionChange]
  )

  const handleRemoveSelection = useCallback(
    (id: string) => {
      onSelectionChange(selectedIds.filter((sid) => sid !== id))
    },
    [selectedIds, onSelectionChange]
  )

  const handleClearAll = useCallback(() => {
    onSelectionChange([])
  }, [onSelectionChange])

  const selectedConstellations = selectedIds
    .map((id) => constellations.find((c) => c.id === id))
    .filter((c): c is Constellation => c !== undefined)

  return (
    <div class="absolute bottom-0 left-0 right-0 z-40" ref={dropdownRef}>
      {/* 選択中タグ */}
      {selectedConstellations.length > 0 && (
        <div class="px-4 pb-2 flex flex-wrap gap-2 items-center">
          {selectedConstellations.map((c) => (
            <span
              key={c.id}
              class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: c.color + '30',
                color: c.color,
                border: `1px solid ${c.color}50`,
              }}
            >
              {c.name}
              <button
                onClick={() => handleRemoveSelection(c.id)}
                class="ml-0.5 opacity-70 hover:opacity-100"
                aria-label={`${c.name}の選択を解除`}
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
          <button
            onClick={handleClearAll}
            class="text-xs text-slate-400 underline ml-2"
          >
            すべて解除
          </button>
        </div>
      )}

      {/* カテゴリボタン */}
      <div class="bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-4">
        <div class="flex gap-2 justify-center">
          {(Object.keys(CATEGORY_LABELS) as CategoryType[]).map((cat) => (
            <div key={cat} class="relative">
              <button
                onClick={() => handleToggleCategory(cat)}
                class={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${openCategory === cat
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800 text-slate-300 active:bg-slate-700'
                  }
                `}
              >
                {CATEGORY_LABELS[cat]}
                <svg
                  class={`inline-block w-4 h-4 ml-1 transition-transform ${openCategory === cat ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* ドロップダウンメニュー */}
              {openCategory === cat && grouped[cat] && (
                <div
                  class={`
                    absolute bottom-full mb-2 w-72 max-h-64 overflow-y-auto overscroll-contain touch-pan-y
                    bg-slate-800 rounded-lg shadow-xl border border-slate-600 animate-dropdown
                    ${cat === 'live' ? 'left-0' : cat === 'single' ? 'right-0' : 'left-1/2 -translate-x-1/2'}
                  `}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  {grouped[cat].map((c) => {
                    const isSelected = selectedIds.includes(c.id)
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectConstellation(c.id)}
                        class={`
                          w-full px-4 py-3 text-left flex items-center gap-3 transition-colors
                          ${isSelected ? 'bg-white/10' : 'active:bg-white/5'}
                        `}
                      >
                        <span
                          class="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span class="flex-1 min-w-0">
                          <span class="block text-sm text-white truncate">{c.name}</span>
                          <span class="block text-xs text-slate-400">{c.year}</span>
                        </span>
                        {isSelected && (
                          <svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fill-rule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes dropdown {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-dropdown {
          animation: dropdown 0.15s ease-out;
        }
      `}</style>
    </div>
  )
}
