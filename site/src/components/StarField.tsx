import { useState, useCallback, useMemo, useRef, useEffect } from 'preact/hooks'
import { CategorySelector } from './CategorySelector'
import type { Song, StarPosition, Constellation } from '../types'

interface StarFieldProps {
  songs: Song[]
  positions: StarPosition[]
  constellations: Constellation[]
}

export function StarField({ songs, positions, constellations }: StarFieldProps) {
  const [selectedStar, setSelectedStar] = useState<string | null>(null)
  const [selectedConstellationIds, setSelectedConstellationIds] = useState<string[]>([])

  // パン＆ズーム用のstate
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastTouch, setLastTouch] = useState<{ x: number; y: number } | null>(null)
  const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // viewBoxを初期値にリセット（リサイズ時）
  useEffect(() => {
    const resetViewBox = () => setViewBox({ x: 0, y: 0, width: 100, height: 100 })
    window.addEventListener('resize', resetViewBox)
    return () => window.removeEventListener('resize', resetViewBox)
  }, [])

  // 曲IDからSongを取得するマップ
  const songMap = useMemo(() => new Map(songs.map(s => [s.id, s])), [songs])

  // タイトルからSong IDを取得するマップ
  const titleToIdMap = useMemo(() => new Map(songs.map(s => [s.title, s.id])), [songs])

  // 位置IDからポジションを取得するマップ
  const positionMap = useMemo(() => new Map(positions.map(p => [p.id, p])), [positions])

  // 選択中の星座に含まれる曲IDのセット
  const highlightedSongIds = useMemo(() => {
    const ids = new Set<string>()
    selectedConstellationIds.forEach(constellationId => {
      const constellation = constellations.find(c => c.id === constellationId)
      if (constellation) {
        constellation.songs.forEach(title => {
          const songId = titleToIdMap.get(title)
          if (songId) ids.add(songId)
        })
      }
    })
    return ids
  }, [selectedConstellationIds, constellations, titleToIdMap])

  // 星座線のデータを計算
  const constellationLines = useMemo(() => {
    return selectedConstellationIds.map(constellationId => {
      const constellation = constellations.find(c => c.id === constellationId)
      if (!constellation) return null

      // 曲タイトルから座標を取得（順番を保持）
      const points: { x: number; y: number; songId: string }[] = []
      constellation.songs.forEach(title => {
        const songId = titleToIdMap.get(title)
        if (songId) {
          const pos = positionMap.get(songId)
          if (pos) {
            points.push({ x: pos.x, y: pos.y, songId })
          }
        }
      })

      return {
        id: constellation.id,
        color: constellation.color,
        points,
      }
    }).filter((line): line is NonNullable<typeof line> => line !== null)
  }, [selectedConstellationIds, constellations, titleToIdMap, positionMap])

  // ハイライト中かどうか（何か選択されているか）
  const hasSelection = selectedConstellationIds.length > 0

  // 星をタップしたときの処理
  const handleStarTap = useCallback((starId: string) => {
    setSelectedStar(prev => prev === starId ? null : starId)
  }, [])

  // リリース日順にソートした曲IDリスト（メモ化）
  const sortedSongIds = useMemo(() =>
    [...songs]
      .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime())
      .map(s => s.id),
    [songs]
  )

  // ナビゲーション用の曲リスト（星座選択時はその曲順、それ以外はリリース日順）
  const navigableSongIds = useMemo(() => {
    if (selectedConstellationIds.length > 0) {
      // 星座が選択されている場合、その星座の曲順で並べる
      // 複数星座選択時は、最初に選択した星座の順序を使用
      const constellation = constellations.find(c => c.id === selectedConstellationIds[0])
      if (constellation) {
        // titleToIdMapを使って効率的に変換
        return constellation.songs
          .map(title => titleToIdMap.get(title))
          .filter((id): id is string => id !== undefined)
      }
    }
    // 星座が選択されていない場合はリリース日順（事前にソート済み）
    return sortedSongIds
  }, [selectedConstellationIds, constellations, titleToIdMap, sortedSongIds])

  // 選択中の星のインデックス
  const selectedStarIndex = useMemo(() => {
    if (!selectedStar) return -1
    return navigableSongIds.indexOf(selectedStar)
  }, [selectedStar, navigableSongIds])

  // 次/前の星に移動してビューを中央に
  const navigateToStar = useCallback((starId: string) => {
    const pos = positionMap.get(starId)
    if (!pos) return

    setSelectedStar(starId)

    // その星を画面中央に持ってくる
    setViewBox(prev => ({
      ...prev,
      x: pos.x - prev.width / 2,
      y: pos.y - prev.height / 2,
    }))
  }, [positionMap])

  const goToNextStar = useCallback(() => {
    if (selectedStarIndex < 0) return
    const nextIndex = (selectedStarIndex + 1) % navigableSongIds.length
    navigateToStar(navigableSongIds[nextIndex])
  }, [selectedStarIndex, navigableSongIds, navigateToStar])

  const goToPrevStar = useCallback(() => {
    if (selectedStarIndex < 0) return
    const prevIndex = (selectedStarIndex - 1 + navigableSongIds.length) % navigableSongIds.length
    navigateToStar(navigableSongIds[prevIndex])
  }, [selectedStarIndex, navigableSongIds, navigateToStar])

  // カードスワイプ用のstate
  const [cardSwipeStart, setCardSwipeStart] = useState<number | null>(null)
  const [cardSwipeOffset, setCardSwipeOffset] = useState(0)

  const handleCardTouchStart = useCallback((e: TouchEvent) => {
    e.stopPropagation()
    setCardSwipeStart(e.touches[0].clientX)
    setCardSwipeOffset(0)
  }, [])

  const handleCardTouchMove = useCallback((e: TouchEvent) => {
    if (cardSwipeStart === null) return
    e.stopPropagation()
    const delta = e.touches[0].clientX - cardSwipeStart
    setCardSwipeOffset(delta)
  }, [cardSwipeStart])

  const handleCardTouchEnd = useCallback((e: TouchEvent) => {
    e.stopPropagation()
    const threshold = 50
    if (cardSwipeOffset < -threshold) {
      goToNextStar()
    } else if (cardSwipeOffset > threshold) {
      goToPrevStar()
    }
    setCardSwipeStart(null)
    setCardSwipeOffset(0)
  }, [cardSwipeOffset, goToNextStar, goToPrevStar])

  // 背景タップで選択解除
  const handleBackgroundTap = useCallback((e: Event) => {
    if ((e.target as Element).tagName === 'svg' && !isPanning) {
      setSelectedStar(null)
    }
  }, [isPanning])

  // スクリーン座標をSVG座標に変換
  const screenToSvg = useCallback((screenX: number, screenY: number) => {
    if (!svgRef.current || !containerRef.current) return { x: 0, y: 0 }
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((screenX - rect.left) / rect.width) * viewBox.width + viewBox.x
    const y = ((screenY - rect.top) / rect.height) * viewBox.height + viewBox.y
    return { x, y }
  }, [viewBox])

  // パン処理
  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()

    // スクリーンのピクセル移動量をSVG座標系に変換
    const svgDeltaX = (deltaX / rect.width) * viewBox.width
    const svgDeltaY = (deltaY / rect.height) * viewBox.height

    setViewBox(prev => {
      let newX = prev.x - svgDeltaX
      let newY = prev.y - svgDeltaY

      // 範囲制限（端の星も中央に持ってこれるように余裕を持たせる）
      const minX = -prev.width / 2
      const maxX = 100 - prev.width / 2
      const minY = -prev.height / 2
      const maxY = 100 - prev.height / 2

      newX = Math.max(minX, Math.min(maxX, newX))
      newY = Math.max(minY, Math.min(maxY, newY))

      return { ...prev, x: newX, y: newY }
    })
  }, [viewBox.width, viewBox.height])

  // ズーム処理
  const handleZoom = useCallback((scale: number, centerX: number, centerY: number) => {
    setViewBox(prev => {
      const newWidth = Math.max(20, Math.min(200, prev.width / scale))
      const newHeight = Math.max(20, Math.min(200, prev.height / scale))

      // ズームの中心点を維持
      const svgCenter = screenToSvg(centerX, centerY)
      const widthRatio = newWidth / prev.width
      const heightRatio = newHeight / prev.height

      let newX = svgCenter.x - (svgCenter.x - prev.x) * widthRatio
      let newY = svgCenter.y - (svgCenter.y - prev.y) * heightRatio

      // 範囲制限（ズームアウト時も対応）
      const minX = Math.min(0, (100 - newWidth) / 2)
      const maxX = Math.max(0, 100 - newWidth / 2)
      const minY = Math.min(0, (100 - newHeight) / 2)
      const maxY = Math.max(0, 100 - newHeight / 2)

      newX = Math.max(minX, Math.min(maxX, newX))
      newY = Math.max(minY, Math.min(maxY, newY))

      return { x: newX, y: newY, width: newWidth, height: newHeight }
    })
  }, [screenToSvg])

  // タッチイベントハンドラー
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      setIsPanning(false)
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      setLastPinchDistance(Math.sqrt(dx * dx + dy * dy))
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1 && lastTouch) {
      const deltaX = e.touches[0].clientX - lastTouch.x
      const deltaY = e.touches[0].clientY - lastTouch.y

      // 小さな動きは無視（タップとの区別）
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setIsPanning(true)
        handlePan(deltaX, deltaY)
        setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      }
    } else if (e.touches.length === 2 && lastPinchDistance !== null) {
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)

      const scale = distance / lastPinchDistance
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2

      handleZoom(scale, centerX, centerY)
      setLastPinchDistance(distance)
    }
  }, [lastTouch, lastPinchDistance, handlePan, handleZoom])

  const handleTouchEnd = useCallback(() => {
    setLastTouch(null)
    setLastPinchDistance(null)
    // 少し遅延してisPanningをリセット（タップイベントとの競合を避ける）
    setTimeout(() => setIsPanning(false), 100)
  }, [])

  // マウスイベントハンドラー（デスクトップ用）
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 0) {
      setLastTouch({ x: e.clientX, y: e.clientY })
      setIsPanning(false)
    }
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (lastTouch && e.buttons === 1) {
      const deltaX = e.clientX - lastTouch.x
      const deltaY = e.clientY - lastTouch.y

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        setIsPanning(true)
        handlePan(deltaX, deltaY)
        setLastTouch({ x: e.clientX, y: e.clientY })
      }
    }
  }, [lastTouch, handlePan])

  const handleMouseUp = useCallback(() => {
    setLastTouch(null)
    setTimeout(() => setIsPanning(false), 100)
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const scale = e.deltaY > 0 ? 0.9 : 1.1
    handleZoom(scale, e.clientX, e.clientY)
  }, [handleZoom])

  // ダブルタップでリセット
  const lastTapTime = useRef(0)
  const handleDoubleTap = useCallback(() => {
    const now = Date.now()
    if (now - lastTapTime.current < 300) {
      // ダブルタップ検出 → 初期位置にリセット（100x100座標系）
      setViewBox({ x: 0, y: 0, width: 100, height: 100 })
    }
    lastTapTime.current = now
  }, [])

  return (
    <div
      ref={containerRef}
      class="relative w-full h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* 星空の背景グラデーション */}
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

      {/* SVG星空 */}
      <svg
        ref={svgRef}
        class="absolute inset-0 w-full h-full select-none"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid slice"
        onClick={(e) => {
          handleBackgroundTap(e)
          handleDoubleTap()
        }}
      >
        <defs>
          {/* 星のグロー効果 */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 星のグロー（白） */}
          <radialGradient id="star-white" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 星座線を描画 */}
        {constellationLines.map((line, lineIndex) => {
          if (line.points.length < 2) return null

          // 星と星の間に小さな点を配置
          const dots: { x: number; y: number }[] = []
          for (let i = 0; i < line.points.length - 1; i++) {
            const p1 = line.points[i]
            const p2 = line.points[i + 1]
            const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
            const numDots = Math.floor(dist / 1.5) // 1.5単位ごとに点を配置
            for (let j = 1; j < numDots; j++) {
              const t = j / numDots
              dots.push({
                x: p1.x + (p2.x - p1.x) * t,
                y: p1.y + (p2.y - p1.y) * t,
              })
            }
          }

          return (
            <g key={line.id} class="constellation-line">
              {dots.map((dot, i) => (
                <circle
                  key={i}
                  cx={dot.x}
                  cy={dot.y}
                  r="0.2"
                  fill={line.color}
                  opacity="0"
                  class="constellation-dot"
                  style={{
                    animationDelay: `${lineIndex * 0.1 + i * 0.01}s`,
                  }}
                />
              ))}
            </g>
          )
        })}

        {/* 星を描画 */}
        {positions.map((pos) => {
          const isSelected = selectedStar === pos.id
          const isHighlighted = highlightedSongIds.has(pos.id)
          const isDimmed = hasSelection && !isHighlighted
          const starSize = isSelected || isHighlighted ? 2.5 : 1.8

          return (
            <g
              key={pos.id}
              onClick={(e) => {
                e.stopPropagation()
                handleStarTap(pos.id)
              }}
              class="cursor-pointer"
              style={{
                transition: 'opacity 0.3s ease',
                opacity: isDimmed ? 0.2 : 1,
              }}
            >
              {/* タップ領域を広げる透明な円 */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={3}
                fill="transparent"
              />
              {/* グロー（白） */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={starSize}
                fill="url(#star-white)"
                opacity={isSelected || isHighlighted ? 0.7 : 0.4}
                class="transition-all duration-300"
              />
              {/* 星の中心 */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={starSize * 0.35}
                fill="white"
                filter="url(#glow)"
                opacity={0.9}
                class="transition-all duration-300"
              />
            </g>
          )
        })}
      </svg>

      {/* カテゴリ選択UI */}
      <CategorySelector
        constellations={constellations}
        selectedIds={selectedConstellationIds}
        onSelectionChange={setSelectedConstellationIds}
      />

      {/* 選択時の詳細パネル（カテゴリUIの下に表示） */}
      {selectedStar && songMap.get(selectedStar) && (
        <div
          class="absolute bottom-28 left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg p-4 z-30 animate-slide-up"
          style={{
            transform: `translateX(${cardSwipeOffset * 0.3}px)`,
            transition: cardSwipeStart !== null ? 'none' : 'transform 0.2s ease-out',
          }}
          onTouchStart={handleCardTouchStart}
          onTouchMove={handleCardTouchMove}
          onTouchEnd={handleCardTouchEnd}
        >
          <div class="flex items-center gap-3">
            {/* 前へボタン */}
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevStar() }}
              class="p-2 text-slate-400 active:text-white active:bg-white/10 rounded-full flex-shrink-0"
              aria-label="前の曲"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* 曲情報 */}
            <div class="flex-1 min-w-0 text-center">
              <div class="text-lg font-medium text-white truncate">{songMap.get(selectedStar)!.title}</div>
              <div class="text-sm text-slate-400 mt-0.5">{songMap.get(selectedStar)!.releaseDate}</div>
              <div class="text-xs text-slate-500 mt-0.5">
                {selectedStarIndex >= 0 ? selectedStarIndex + 1 : '-'} / {navigableSongIds.length}
              </div>
            </div>

            {/* 次へボタン */}
            <button
              onClick={(e) => { e.stopPropagation(); goToNextStar() }}
              class="p-2 text-slate-400 active:text-white active:bg-white/10 rounded-full flex-shrink-0"
              aria-label="次の曲"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <header class="absolute top-0 left-0 right-0 p-4 z-10">
        <h1 class="text-xl font-light tracking-wider text-white/90">
          MRS. GREEN APPLE
          <span class="block text-xs text-white/50 mt-0.5">CONSTELLATION MAP</span>
        </h1>
      </header>

      {/* 楽曲数の表示 */}
      <div class="absolute bottom-4 left-4 text-xs text-white/40">
        {songs.length} songs
      </div>

      {/* ミニマップ */}
      <div class="absolute top-16 right-3 w-20 h-20 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden z-20">
        <svg viewBox="0 0 100 100" class="w-full h-full">
          {/* 全ての星を小さく表示（白） */}
          {positions.map((pos) => {
            const isHighlighted = highlightedSongIds.has(pos.id)
            return (
              <circle
                key={pos.id}
                cx={pos.x}
                cy={pos.y}
                r={isHighlighted ? 1.5 : 0.8}
                fill="#ffffff"
                opacity={isHighlighted ? 1 : 0.4}
              />
            )
          })}
          {/* 現在の表示範囲を示す枠 */}
          <rect
            x={viewBox.x}
            y={viewBox.y}
            width={viewBox.width}
            height={viewBox.height}
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />
        </svg>
      </div>

      {/* CSSアニメーション */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
        @keyframes fade-in-dot {
          from { opacity: 0; }
          to { opacity: 0.4; }
        }
        .constellation-dot {
          animation: fade-in-dot 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
