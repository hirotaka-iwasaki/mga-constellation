import { useState, useCallback, useRef, useEffect } from 'preact/hooks'
import type { Constellation } from '../types'

interface CategorySelectorProps {
  constellations: Constellation[]
  customConstellations: Constellation[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onConstellationSelect?: (constellation: Constellation) => void
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
  onConstellationSelect,
  onCreateCustom,
  onEditCustom,
  onDeleteCustom,
}: CategorySelectorProps) {
  const [openCategory, setOpenCategory] = useState<CategoryType | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 既存の星座IDと重複するカスタム星座は除外
  const existingIds = new Set(constellations.map(c => c.id))
  const uniqueCustom = customConstellations.filter(c => !existingIds.has(c.id))
  const allConstellations = [...constellations, ...uniqueCustom]

  // カテゴリごとにグループ化
  const grouped: Record<CategoryType, Constellation[]> = {
    live: [],
    custom: [],
    album: [],
  }

  constellations.forEach((c) => {
    if (c.type === 'live') {
      grouped.live.push(c)
    } else if (c.type === 'album') {
      grouped.album.push(c)
    }
  })

  // 推し座（カスタム星座）を追加
  grouped.custom = uniqueCustom

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

  const selectedConstellations = selectedIds
    .map((id) => allConstellations.find((c) => c.id === id))
    .filter((c): c is Constellation => c !== undefined)

  const handleToggleCategory = useCallback((cat: CategoryType) => {
    setOpenCategory((prev) => (prev === cat ? null : cat))
    setHasInteracted(true)
  }, [])

  const handleSelectConstellation = useCallback(
    (id: string) => {
      const constellation = allConstellations.find(c => c.id === id)
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((sid) => sid !== id))
      } else {
        onSelectionChange([...selectedIds, id])
        // 新規選択時：メニューを閉じて1曲目へ移動
        setOpenCategory(null)
        if (constellation && onConstellationSelect) {
          onConstellationSelect(constellation)
        }
      }
    },
    [selectedIds, onSelectionChange, allConstellations, onConstellationSelect]
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

  return (
    <div class="absolute bottom-0 left-0 right-0 z-40" ref={dropdownRef} data-tutorial="footer">
      {/* 選択中タグ（フッター上に表示） */}
      {selectedConstellations.length > 0 && (
        <div class="px-4 pb-2 flex items-center gap-2">
          {/* すべて解除ボタン（固定） */}
          <button
            onClick={handleClearAll}
            class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 bg-slate-700 text-slate-300 border border-slate-600 active:bg-slate-600"
            aria-label="すべての選択を解除"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            すべて解除
          </button>
          {/* スクロール可能なタグ領域 */}
          <div
            class="flex gap-1.5 overflow-x-auto py-1 overscroll-contain touch-pan-x"
            onTouchMove={(e) => e.stopPropagation()}
          >
            {selectedConstellations.map((c) => (
              <span
                key={c.id}
                class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
                style={{
                  backgroundColor: c.color + '30',
                  color: c.color,
                  border: `1px solid ${c.color}50`,
                }}
              >
                {c.name}
                <button
                  onClick={() => handleRemoveSelection(c.id)}
                  class="ml-0.5 opacity-70 active:opacity-100"
                  aria-label={`${c.name}の選択を解除`}
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      {/* カテゴリボタン */}
      <div class="bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-4 pb-[max(4rem,calc(1rem+env(safe-area-inset-bottom,0px)))]">
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
                  ${cat === 'live' && !hasInteracted ? 'animate-pulse-glow' : ''}
                `}
                {...(cat === 'custom' ? { 'data-tutorial': 'oshiza-button' } : {})}
                {...(cat === 'live' ? { 'data-tutorial': 'live-button' } : {})}
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
                      class="w-full px-4 py-3 text-left flex items-center gap-3 text-emerald-300 active:bg-white/5 border-b border-slate-700"
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
                            <span class="block text-sm text-white break-words leading-tight">{c.name}</span>
                            <span class="block text-xs text-slate-400">{c.year}</span>
                          </span>
                          {isSelected && (
                            <svg class="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-pulse-glow {
          position: relative;
        }
        .animate-pulse-glow::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 12px;
          background: rgba(52, 211, 153, 0.4);
          filter: blur(8px);
          animation: pulse-glow 2s ease-in-out infinite;
          pointer-events: none;
          z-index: -1;
        }
      `}</style>
    </div>
  )
}
