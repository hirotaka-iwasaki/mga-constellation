import { useState, useCallback, useRef, useEffect } from 'preact/hooks'
import type { Constellation } from '../types'

interface CategorySelectorProps {
  constellations: Constellation[]
  customConstellations: Constellation[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onCreateCustom: () => void
  onEditCustom: (constellation: Constellation) => void
  onDeleteCustom: (id: string) => void
}

type CategoryType = 'live' | 'custom' | 'album'

const CATEGORY_LABELS: Record<CategoryType, string> = {
  live: 'ライブ',
  custom: '推し座',
  album: 'アルバム',
}

export function CategorySelector({
  constellations,
  customConstellations,
  selectedIds,
  onSelectionChange,
  onCreateCustom,
  onEditCustom,
  onDeleteCustom,
}: CategorySelectorProps) {
  const [openCategory, setOpenCategory] = useState<CategoryType | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // カテゴリごとにグループ化
  const grouped: Record<CategoryType, Constellation[]> = {
    live: [],
    custom: [],
    album: [],
  }

  constellations.forEach((c) => {
    if (c.type === 'live') {
      grouped.live.push(c)
    } else if (c.type === 'album' || c.type === 'single') {
      grouped.album.push(c)
    }
  })

  // 推し座（カスタム星座）を追加
  grouped.custom = customConstellations

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

  // すべての星座（既存 + カスタム）
  const allConstellations = [...constellations, ...customConstellations]

  const selectedConstellations = selectedIds
    .map((id) => allConstellations.find((c) => c.id === id))
    .filter((c): c is Constellation => c !== undefined)

  return (
    <div class="absolute bottom-0 left-0 right-0 z-40" ref={dropdownRef}>
      {/* カテゴリボタン */}
      <div class="bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-4">
        <div class="flex gap-2 justify-center flex-wrap">
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
              {openCategory === cat && (
                <div
                  class={`
                    absolute bottom-full mb-2 w-72 max-h-64 overflow-y-auto overscroll-contain touch-pan-y
                    bg-slate-800 rounded-lg shadow-xl border border-slate-600 animate-dropdown
                    ${cat === 'live' ? 'left-0' : cat === 'album' ? 'right-0' : 'left-1/2 -translate-x-1/2'}
                  `}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  {/* 推し座の場合は作成ボタンを表示 */}
                  {cat === 'custom' && (
                    <button
                      onClick={() => {
                        setOpenCategory(null)
                        onCreateCustom()
                      }}
                      class="w-full px-4 py-3 text-left flex items-center gap-3 text-green-400 active:bg-white/5 border-b border-slate-700"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span class="text-sm font-medium">推し座を作成</span>
                    </button>
                  )}
                  {/* 推し座が空の場合 */}
                  {cat === 'custom' && (!grouped[cat] || grouped[cat].length === 0) && (
                    <div class="px-4 py-3 text-sm text-slate-400">
                      まだ推し座がありません
                    </div>
                  )}
                  {/* 星座リスト */}
                  {grouped[cat]?.map((c) => {
                    const isSelected = selectedIds.includes(c.id)
                    const isCustom = cat === 'custom'
                    return (
                      <div
                        key={c.id}
                        class={`
                          w-full px-4 py-3 flex items-center gap-3 transition-colors
                          ${isSelected ? 'bg-white/10' : ''}
                        `}
                      >
                        <button
                          onClick={() => handleSelectConstellation(c.id)}
                          class="flex-1 flex items-center gap-3 text-left active:bg-white/5"
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
                        {/* カスタム星座の編集・削除ボタン */}
                        {isCustom && (
                          <>
                            <button
                              onClick={() => {
                                setOpenCategory(null)
                                onEditCustom(c)
                              }}
                              class="p-1 text-slate-500 hover:text-blue-400 active:text-blue-400"
                              aria-label={`${c.name}を編集`}
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDeleteCustom(c.id)}
                              class="p-1 text-slate-500 hover:text-red-400 active:text-red-400"
                              aria-label={`${c.name}を削除`}
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
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
