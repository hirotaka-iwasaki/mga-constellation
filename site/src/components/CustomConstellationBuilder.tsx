import { useState, useCallback, useMemo, useRef, useEffect } from 'preact/hooks'
import type { Song, Constellation } from '../types'

interface CustomConstellationBuilderProps {
  songs: Song[]
  editingConstellation?: Constellation
  onSave: (constellation: Constellation) => void
  onCancel: () => void
}

const COLOR_PRESETS = [
  // Row 1: 暖色系
  '#FF6B6B', // レッド
  '#FF8C42', // オレンジ
  '#FFD93D', // イエロー
  '#FFB6C1', // ライトピンク
  '#FF6B9D', // ピンク
  '#FF69B4', // ホットピンク
  // Row 2: 寒色系
  '#9D6BFF', // パープル
  '#A855F7', // バイオレット
  '#6B9DFF', // ブルー
  '#38BDF8', // スカイブルー
  '#6BFFB8', // ミント
  '#4ADE80', // グリーン
]

const ITEM_HEIGHT = 44 // 各アイテムの高さ（px）

export function CustomConstellationBuilder({
  songs,
  editingConstellation,
  onSave,
  onCancel,
}: CustomConstellationBuilderProps) {
  const isEditMode = !!editingConstellation

  // Song IDからSongを取得するマップ（先に定義）
  const songMap = useMemo(() => new Map(songs.map(s => [s.id, s])), [songs])

  // タイトルからSong IDを取得するマップ
  const titleToIdMap = useMemo(() => new Map(songs.map(s => [s.title, s.id])), [songs])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>(() => {
    if (editingConstellation) {
      return editingConstellation.songs
        .map(title => titleToIdMap.get(title))
        .filter((id): id is string => id !== undefined)
    }
    return []
  })
  const [name, setName] = useState(editingConstellation?.name ?? '')
  const [color, setColor] = useState(editingConstellation?.color ?? COLOR_PRESETS[0])
  const searchInputRef = useRef<HTMLInputElement>(null)

  // ドラッグ&ドロップ用の状態
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const dragStartY = useRef(0)
  const listRef = useRef<HTMLDivElement>(null)

  // 検索入力にフォーカス（新規作成時のみ）
  useEffect(() => {
    if (!isEditMode) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [isEditMode])

  // リリース日順にソート済みの曲リスト
  const sortedSongs = useMemo(() =>
    [...songs].sort((a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    ),
    [songs]
  )

  // 検索でフィルタリング（スペース無視の検索にも対応）
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return sortedSongs
    const query = searchQuery.toLowerCase()
    const queryNoSpace = query.replace(/\s+/g, '')
    return sortedSongs.filter(song => {
      const title = song.title.toLowerCase()
      const titleNoSpace = title.replace(/\s+/g, '')
      // 通常検索 OR スペース無視検索
      return title.includes(query) || titleNoSpace.includes(queryNoSpace)
    })
  }, [sortedSongs, searchQuery])

  // 曲の選択/解除
  const handleToggleSong = useCallback((songId: string) => {
    setSelectedSongIds(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    )
  }, [])

  // 選択から削除
  const handleRemoveSong = useCallback((songId: string) => {
    setSelectedSongIds(prev => prev.filter(id => id !== songId))
  }, [])

  // 選択をすべてクリア
  const handleClearAll = useCallback(() => {
    setSelectedSongIds([])
  }, [])

  // ドラッグ開始
  const handleDragStart = useCallback((index: number, clientY: number) => {
    setDragIndex(index)
    dragStartY.current = clientY
    setDragOffset(0)
  }, [])

  // ドラッグ中
  const handleDragMove = useCallback((clientY: number) => {
    if (dragIndex === null) return
    const offset = clientY - dragStartY.current
    setDragOffset(offset)
  }, [dragIndex])

  // ドラッグ終了
  const handleDragEnd = useCallback(() => {
    if (dragIndex === null) return

    // 移動先のインデックスを計算
    const moveBy = Math.round(dragOffset / ITEM_HEIGHT)
    const newIndex = Math.max(0, Math.min(selectedSongIds.length - 1, dragIndex + moveBy))

    if (newIndex !== dragIndex) {
      setSelectedSongIds(prev => {
        const newIds = [...prev]
        const [removed] = newIds.splice(dragIndex, 1)
        newIds.splice(newIndex, 0, removed)
        return newIds
      })
    }

    setDragIndex(null)
    setDragOffset(0)
  }, [dragIndex, dragOffset, selectedSongIds.length])

  // タッチイベントハンドラ
  const handleTouchStart = useCallback((index: number, e: TouchEvent) => {
    e.preventDefault()
    handleDragStart(index, e.touches[0].clientY)
  }, [handleDragStart])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (dragIndex === null) return
    e.preventDefault()
    handleDragMove(e.touches[0].clientY)
  }, [dragIndex, handleDragMove])

  const handleTouchEnd = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  // マウスイベントハンドラ（PC用）
  const handleMouseDown = useCallback((index: number, e: MouseEvent) => {
    e.preventDefault()
    handleDragStart(index, e.clientY)
  }, [handleDragStart])

  useEffect(() => {
    if (dragIndex === null) return

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY)
    }

    const handleMouseUp = () => {
      handleDragEnd()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragIndex, handleDragMove, handleDragEnd])

  // 保存処理
  const handleSave = useCallback(() => {
    if (selectedSongIds.length < 2) return
    if (!name.trim()) return

    // タイトル配列に変換
    const songTitles = selectedSongIds
      .map(id => songMap.get(id)?.title)
      .filter((t): t is string => t !== undefined)

    const constellation: Constellation = {
      // 編集時は既存のIDを保持、新規作成時は新しいIDを生成
      id: editingConstellation?.id ?? `custom-${Date.now()}`,
      name: name.trim(),
      type: 'theme', // カスタム星座は 'theme' タイプ
      year: editingConstellation?.year ?? new Date().getFullYear(),
      color,
      songs: songTitles,
    }

    onSave(constellation)
  }, [selectedSongIds, name, color, songMap, onSave, editingConstellation])

  const canSave = selectedSongIds.length >= 2 && name.trim().length > 0

  // ドラッグ中のアイテムの視覚的な位置を計算
  const getItemStyle = (index: number) => {
    if (dragIndex === null) return {}

    if (index === dragIndex) {
      return {
        transform: `translateY(${dragOffset}px)`,
        zIndex: 10,
        opacity: 0.9,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }
    }

    // 他のアイテムの位置調整
    const moveBy = Math.round(dragOffset / ITEM_HEIGHT)
    const targetIndex = Math.max(0, Math.min(selectedSongIds.length - 1, dragIndex + moveBy))

    if (dragIndex < targetIndex) {
      // 下に移動中
      if (index > dragIndex && index <= targetIndex) {
        return { transform: `translateY(-${ITEM_HEIGHT}px)`, transition: 'transform 0.15s ease' }
      }
    } else if (dragIndex > targetIndex) {
      // 上に移動中
      if (index < dragIndex && index >= targetIndex) {
        return { transform: `translateY(${ITEM_HEIGHT}px)`, transition: 'transform 0.15s ease' }
      }
    }

    return { transition: 'transform 0.15s ease' }
  }

  return (
    <div class="fixed inset-0 z-50 flex flex-col bg-slate-950">
      {/* ヘッダー */}
      <div class="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900">
        <button
          onClick={onCancel}
          class="p-2 -ml-2 text-slate-400 active:text-white"
          aria-label="キャンセル"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h1 class="text-lg font-medium text-white">
          {isEditMode ? '推し座を編集' : '推し座を作成'}
        </h1>
        <button
          onClick={handleSave}
          disabled={!canSave}
          class={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            canSave
              ? 'bg-white text-slate-900 active:bg-slate-200'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isEditMode ? '更新' : '作成'}
        </button>
      </div>

      {/* 選択中の曲 */}
      <div class="flex-shrink-0 border-b border-slate-700 bg-slate-900/50">
        <div class="px-4 py-2 flex items-center justify-between">
          <span class="text-sm text-slate-400">
            選択中 ({selectedSongIds.length}曲)
            {selectedSongIds.length < 2 && (
              <span class="ml-2 text-green-300">※2曲以上選んでください</span>
            )}
          </span>
          {selectedSongIds.length > 0 && (
            <button
              onClick={handleClearAll}
              class="text-xs text-slate-500 underline"
            >
              クリア
            </button>
          )}
        </div>
        {selectedSongIds.length > 0 && (
          <div
            ref={listRef}
            class="px-4 pb-3 max-h-44 overflow-y-auto"
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div class="space-y-1 relative">
              {selectedSongIds.map((songId, index) => {
                const song = songMap.get(songId)
                if (!song) return null
                return (
                  <div
                    key={songId}
                    class={`flex items-center gap-2 px-2 py-2 bg-slate-800 rounded-lg select-none ${
                      dragIndex === index ? 'cursor-grabbing' : ''
                    }`}
                    style={getItemStyle(index)}
                  >
                    {/* ドラッグハンドル */}
                    <div
                      class="p-1 cursor-grab text-slate-500 active:text-slate-300 touch-none"
                      onTouchStart={(e) => handleTouchStart(index, e)}
                      onMouseDown={(e) => handleMouseDown(index, e)}
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" />
                      </svg>
                    </div>
                    <span class="w-5 h-5 flex items-center justify-center text-xs text-slate-500 bg-slate-700 rounded flex-shrink-0">
                      {index + 1}
                    </span>
                    <span class="flex-1 text-sm text-white truncate">{song.title}</span>
                    <button
                      onClick={() => handleRemoveSong(songId)}
                      class="p-1 text-slate-400 active:text-red-400 rounded"
                      aria-label="削除"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 検索 */}
      <div class="flex-shrink-0 px-4 py-3 border-b border-slate-700">
        <div class="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
            placeholder="曲名で検索..."
            class="w-full px-4 py-2.5 pl-10 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 active:text-white"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 曲リスト */}
      <div class="flex-1 overflow-y-auto overscroll-contain">
        <div class="px-4 py-2 text-xs text-slate-500 sticky top-0 bg-slate-950">
          すべての曲 ({filteredSongs.length}曲)
        </div>
        <div class="px-4 pb-4">
          {filteredSongs.map((song) => {
            const isSelected = selectedSongIds.includes(song.id)
            return (
              <button
                key={song.id}
                onClick={() => handleToggleSong(song.id)}
                class={`w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors ${
                  isSelected
                    ? 'bg-white/10'
                    : 'active:bg-white/5'
                }`}
              >
                <span
                  class={`w-5 h-5 flex items-center justify-center rounded-full border-2 flex-shrink-0 ${
                    isSelected
                      ? 'bg-white border-white'
                      : 'border-slate-500'
                  }`}
                >
                  {isSelected && (
                    <svg class="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  )}
                </span>
                <span class="flex-1 min-w-0 text-left">
                  <span class="block text-sm text-white truncate">{song.title}</span>
                  <span class="block text-xs text-slate-400">{song.year}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 名前と色の設定 */}
      <div class="flex-shrink-0 border-t border-slate-700 bg-slate-900 px-4 py-4 space-y-4">
        {/* 名前入力 */}
        <div>
          <label class="block text-xs text-slate-400 mb-1.5">星座の名前</label>
          <input
            type="text"
            value={name}
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
            placeholder="例: 夏ソング座"
            maxLength={20}
            class="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
          />
        </div>

        {/* 色選択 */}
        <div>
          <label class="block text-xs text-slate-400 mb-1.5">星座線の色</label>
          <div class="flex gap-3 overflow-x-auto py-2 -mx-4 px-4">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                class={`w-9 h-9 rounded-full flex-shrink-0 transition-transform ${
                  color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                }`}
                style={{ backgroundColor: c }}
                aria-label={`色: ${c}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
