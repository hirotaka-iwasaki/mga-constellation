import { useState, useCallback, useMemo, useRef, useEffect } from 'preact/hooks'
import { CategorySelector } from './CategorySelector'
import { CustomConstellationBuilder } from './CustomConstellationBuilder'
import { ShareButton } from './ShareButton'
import { TutorialOverlay } from './TutorialOverlay'
import { WelcomeModal, shouldShowWelcome } from './WelcomeModal'
import { FeedbackModal } from './FeedbackModal'
import { RoadmapModal } from './RoadmapModal'
import { SongDetailModal } from './SongDetailModal'
import type { Song, StarPosition, Constellation, SongEssence } from '../types'

const CUSTOM_CONSTELLATIONS_KEY = 'mga-custom-constellations'

// エッセンスデータのキャッシュ（モジュールレベルでシングルトン）
let essencesCache: Record<string, SongEssence> | null = null
let essencesLoadPromise: Promise<Record<string, SongEssence>> | null = null

async function loadEssences(): Promise<Record<string, SongEssence>> {
  if (essencesCache) return essencesCache
  if (essencesLoadPromise) return essencesLoadPromise

  // 動的import()でコード分割 - 初期ロードに影響なし
  essencesLoadPromise = import('../content/essences.json')
    .then(module => {
      essencesCache = module.default
      return module.default
    })
    .catch(err => {
      console.error('Failed to load essences:', err)
      essencesCache = {}
      return {}
    })

  return essencesLoadPromise
}

interface StarFieldProps {
  songs: Song[]
  positions: StarPosition[]
  constellations: Constellation[]
}

export function StarField({ songs, positions, constellations }: StarFieldProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [selectedStar, setSelectedStar] = useState<string | null>('start')
  const [selectedConstellationIds, setSelectedConstellationIds] = useState<string[]>([])
  const [showSongDetail, setShowSongDetail] = useState(false)

  // エッセンスデータ（遅延ロード）
  const [essences, setEssences] = useState<Record<string, SongEssence> | null>(essencesCache)

  // モーダル表示時にエッセンスデータをロード
  useEffect(() => {
    if (showSongDetail && !essences) {
      loadEssences().then(setEssences)
    }
  }, [showSongDetail, essences])

  // カスタム星座の状態管理
  const [customConstellations, setCustomConstellations] = useState<Constellation[]>([])
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [editingConstellation, setEditingConstellation] = useState<Constellation | null>(null)

  // localStorageからカスタム星座を読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_CONSTELLATIONS_KEY)
      if (stored) {
        setCustomConstellations(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load custom constellations:', e)
    }
  }, [])

  // カスタム星座をlocalStorageに保存
  const saveCustomConstellations = useCallback((constellations: Constellation[]) => {
    try {
      localStorage.setItem(CUSTOM_CONSTELLATIONS_KEY, JSON.stringify(constellations))
    } catch (e) {
      console.error('Failed to save custom constellations:', e)
    }
  }, [])

  // カスタム星座を追加/更新
  const handleSaveCustomConstellation = useCallback((constellation: Constellation) => {
    let newConstellations: Constellation[]
    if (editingConstellation) {
      // 編集モード：既存の星座を更新
      newConstellations = customConstellations.map(c =>
        c.id === constellation.id ? constellation : c
      )
    } else {
      // 新規作成
      newConstellations = [...customConstellations, constellation]
    }
    setCustomConstellations(newConstellations)
    saveCustomConstellations(newConstellations)
    setIsBuilderOpen(false)
    setEditingConstellation(null)
    // 作成/更新した星座を自動選択
    if (!selectedConstellationIds.includes(constellation.id)) {
      setSelectedConstellationIds(prev => [...prev, constellation.id])
    }
  }, [customConstellations, saveCustomConstellations, editingConstellation, selectedConstellationIds])

  // カスタム星座を編集
  const handleEditCustomConstellation = useCallback((constellation: Constellation) => {
    setEditingConstellation(constellation)
    setIsBuilderOpen(true)
  }, [])

  // カスタム星座を削除
  const handleDeleteCustomConstellation = useCallback((id: string) => {
    const newConstellations = customConstellations.filter(c => c.id !== id)
    setCustomConstellations(newConstellations)
    saveCustomConstellations(newConstellations)
    // 選択中だった場合は選択解除
    setSelectedConstellationIds(prev => prev.filter(cid => cid !== id))
  }, [customConstellations, saveCustomConstellations])

  // 全ての星座（既存 + カスタム）
  // 既存の星座IDと重複するカスタム星座は除外
  const allConstellations = useMemo(() => {
    const existingIds = new Set(constellations.map(c => c.id))
    const uniqueCustom = customConstellations.filter(c => !existingIds.has(c.id))
    return [...constellations, ...uniqueCustom]
  }, [constellations, customConstellations])

  // 検索機能用のstate
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // パン＆ズーム用のstate
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastTouch, setLastTouch] = useState<{ x: number; y: number } | null>(null)
  const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 初期ローディング完了 & ウェルカムモーダル表示判定
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      // ローディング完了後に初回かどうかをチェック
      if (shouldShowWelcome()) {
        setShowWelcome(true)
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // viewBoxを初期値にリセット（リサイズ時）
  useEffect(() => {
    const resetViewBox = () => setViewBox({ x: 0, y: 0, width: 100, height: 100 })
    window.addEventListener('resize', resetViewBox)
    return () => window.removeEventListener('resize', resetViewBox)
  }, [])

  // 曲IDからSongを取得するマップ
  const songMap = useMemo(() => new Map(songs.map(s => [s.id, s])), [songs])

  // 曲タイトルから、その曲が収録されている星座一覧を取得するマップ
  const songToConstellationsMap = useMemo(() => {
    const map = new Map<string, Constellation[]>()
    allConstellations.forEach(constellation => {
      const uniqueTitles = [...new Set(constellation.songs)]
      uniqueTitles.forEach(title => {
        const existing = map.get(title) || []
        existing.push(constellation)
        map.set(title, existing)
      })
    })
    return map
  }, [allConstellations])

  // タイトルからSong IDを取得するマップ
  const titleToIdMap = useMemo(() => new Map(songs.map(s => [s.title, s.id])), [songs])

  // 位置IDからポジションを取得するマップ
  const positionMap = useMemo(() => new Map(positions.map(p => [p.id, p])), [positions])

  // 検索結果のフィルタリング（スペース無視の検索にも対応）
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    const queryNoSpace = query.replace(/\s+/g, '')
    return songs
      .filter(song => {
        const title = song.title.toLowerCase()
        const titleNoSpace = title.replace(/\s+/g, '')
        return title.includes(query) || titleNoSpace.includes(queryNoSpace)
      })
      .slice(0, 10) // 最大10件
  }, [searchQuery, songs])

  // 検索結果から曲を選択
  const handleSearchSelect = useCallback((songId: string) => {
    const pos = positionMap.get(songId)
    if (!pos) return

    setSelectedStar(songId)
    setIsSearchOpen(false)
    setSearchQuery('')

    // その星を画面中央に持ってくる
    setViewBox(prev => ({
      ...prev,
      x: pos.x - prev.width / 2,
      y: pos.y - prev.height / 2,
    }))
  }, [positionMap])

  // 検索モーダルを開く
  const openSearch = useCallback(() => {
    setIsSearchOpen(true)
    setTimeout(() => searchInputRef.current?.focus(), 100)
  }, [])

  // 検索モーダルを閉じる
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false)
    setSearchQuery('')
  }, [])

  // 選択中の星座オブジェクト
  const selectedConstellations = useMemo(() => {
    return selectedConstellationIds
      .map(id => allConstellations.find(c => c.id === id))
      .filter((c): c is Constellation => c !== undefined)
  }, [selectedConstellationIds, allConstellations])

  // 選択から星座を削除
  const handleRemoveConstellation = useCallback((id: string) => {
    setSelectedConstellationIds(prev => prev.filter(cid => cid !== id))
  }, [])

  // 星座選択時に1曲目を選択（画面移動なし）
  const handleConstellationSelect = useCallback((constellation: Constellation) => {
    if (constellation.songs.length > 0) {
      const firstSongTitle = constellation.songs[0]
      const firstSongId = titleToIdMap.get(firstSongTitle)
      if (firstSongId) {
        setSelectedStar(firstSongId)
      }
    }
  }, [titleToIdMap])

  // 選択中の星座に含まれる曲IDのセット
  const highlightedSongIds = useMemo(() => {
    const ids = new Set<string>()
    selectedConstellationIds.forEach(constellationId => {
      const constellation = allConstellations.find(c => c.id === constellationId)
      if (constellation) {
        constellation.songs.forEach(title => {
          const songId = titleToIdMap.get(title)
          if (songId) ids.add(songId)
        })
      }
    })
    return ids
  }, [selectedConstellationIds, allConstellations, titleToIdMap])

  // 星座線のデータを計算
  const constellationLines = useMemo(() => {
    return selectedConstellationIds.map(constellationId => {
      const constellation = allConstellations.find(c => c.id === constellationId)
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
  }, [selectedConstellationIds, allConstellations, titleToIdMap, positionMap])

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
      const constellation = allConstellations.find(c => c.id === selectedConstellationIds[0])
      if (constellation) {
        // titleToIdMapを使って効率的に変換
        return constellation.songs
          .map(title => titleToIdMap.get(title))
          .filter((id): id is string => id !== undefined)
      }
    }
    // 星座が選択されていない場合はリリース日順（事前にソート済み）
    return sortedSongIds
  }, [selectedConstellationIds, allConstellations, titleToIdMap, sortedSongIds])

  // 選択中の星のインデックス
  const selectedStarIndex = useMemo(() => {
    if (!selectedStar) return -1
    return navigableSongIds.indexOf(selectedStar)
  }, [selectedStar, navigableSongIds])

  // 次/前の星に移動（画面移動なし）
  const navigateToStar = useCallback((starId: string) => {
    setSelectedStar(starId)
  }, [])

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

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 検索モーダルが開いている場合は無視
      if (isSearchOpen) return

      // input要素にフォーカスがある場合は無視
      if (document.activeElement?.tagName === 'INPUT') return

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          if (selectedStar) {
            goToNextStar()
          } else if (navigableSongIds.length > 0) {
            // 何も選択されていない場合は最初の曲を選択
            navigateToStar(navigableSongIds[0])
          }
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          if (selectedStar) {
            goToPrevStar()
          } else if (navigableSongIds.length > 0) {
            // 何も選択されていない場合は最後の曲を選択
            navigateToStar(navigableSongIds[navigableSongIds.length - 1])
          }
          break
        case 'Escape':
          e.preventDefault()
          setSelectedStar(null)
          break
        case '/':
          // スラッシュキーで検索を開く（Vim風）
          e.preventDefault()
          openSearch()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, selectedStar, navigableSongIds, goToNextStar, goToPrevStar, navigateToStar, openSearch])

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
    // モーダル表示中は星空の操作を無効化
    if (showSongDetail) return

    if (e.touches.length === 1) {
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      setIsPanning(false)
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      setLastPinchDistance(Math.sqrt(dx * dx + dy * dy))
    }
  }, [showSongDetail])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // モーダル表示中は星空の操作を無効化
    if (showSongDetail) return

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
  }, [showSongDetail, lastTouch, lastPinchDistance, handlePan, handleZoom])

  const handleTouchEnd = useCallback(() => {
    // モーダル表示中は星空の操作を無効化
    if (showSongDetail) return

    setLastTouch(null)
    setLastPinchDistance(null)
    // 少し遅延してisPanningをリセット（タップイベントとの競合を避ける）
    setTimeout(() => setIsPanning(false), 100)
  }, [showSongDetail])

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
      class={`relative w-full h-dvh bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden ${showSongDetail ? '' : 'touch-none'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* ローディングスピナー */}
      {isLoading && (
        <div class="absolute inset-0 flex items-center justify-center z-50 bg-slate-950">
          <div class="loading-spinner" />
        </div>
      )}

      {/* ウェルカムモーダル（初回のみ） */}
      {showWelcome && (
        <WelcomeModal onClose={() => setShowWelcome(false)} />
      )}

      {/* チュートリアルオーバーレイ */}
      {showTutorial && (
        <TutorialOverlay
          onComplete={() => setShowTutorial(false)}
          onAction={(action) => {
            // onEnter: ステップに入った時の準備
            // onExit: ステップから次へ進む時の処理
            switch (action) {
              case 'reset-view': {
                // ビューを初期状態（全体表示）にリセット
                setViewBox({ x: 0, y: 0, width: 100, height: 100 })
                setSelectedStar(null)
                setSelectedConstellationIds([])
                break
              }
              case 'focus-start': {
                // ビューを初期状態（全体表示）にリセット
                setViewBox({ x: 0, y: 0, width: 100, height: 100 })
                break
              }
              case 'show-card-start': {
                // StaRtの星を選択してカードを表示（ズームアウト状態を維持）
                setSelectedStar('start')
                // ビューを初期状態（全体表示）にリセット
                setViewBox({ x: 0, y: 0, width: 100, height: 100 })
                break
              }
              case 'hide-card':
                setSelectedStar(null)
                break
              case 'select-babel':
                // BABEL no TOHを選択
                setSelectedConstellationIds(['babel-no-toh-2025'])
                break
              case 'clear-selection':
                setSelectedConstellationIds([])
                break
            }
          }}
        />
      )}

      {/* 星空の背景グラデーション */}
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

      {/* SVG星空 */}
      <svg
        ref={svgRef}
        class={`absolute inset-0 w-full h-full select-none transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        onClick={(e) => {
          handleBackgroundTap(e)
          handleDoubleTap()
        }}
        data-tutorial="starfield"
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

          {/* 選択された星のグロー（緑） */}
          <filter id="glow-green" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feFlood floodColor="#22c55e" floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 星座線を描画 */}
        {constellationLines.map((line, lineIndex) => {
          if (line.points.length < 2) return null

          // 星と星の間に小さな点を配置（累積インデックス付き）
          const dots: { x: number; y: number; cumulativeIndex: number }[] = []
          let cumulativeIndex = 0
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
                cumulativeIndex: cumulativeIndex++,
              })
            }
          }

          return (
            <g key={line.id} class="constellation-line">
              {dots.map((dot) => (
                <circle
                  key={dot.cumulativeIndex}
                  cx={dot.x}
                  cy={dot.y}
                  r="0.5"
                  fill={line.color}
                  opacity="0"
                  class="constellation-dot"
                  style={{
                    animationDelay: `${lineIndex * 0.15 + dot.cumulativeIndex * 0.008}s`,
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
          // チュートリアル用：StaRtの星にマークをつける
          const isStartStar = pos.id === 'start'

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
              {...(isStartStar ? { 'data-tutorial': 'star-start' } : {})}
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
              {/* 選択された星の緑色グロー */}
              {isSelected && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={starSize * 0.8}
                  fill="#22c55e"
                  opacity="0.4"
                  filter="url(#glow-green)"
                  class="transition-all duration-300"
                />
              )}
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

      {/* フッター（詳細カード + 選択タグ + カテゴリボタン） */}
      <div class="absolute bottom-0 left-0 right-0 z-40 flex flex-col">
        {/* 選択時の詳細パネル */}
        {selectedStar && songMap.get(selectedStar) && (
          <div
            data-tutorial="card"
            class="mx-4 mb-2 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg p-3 animate-slide-up"
            style={{
              transform: `translateX(${cardSwipeOffset * 0.3}px)`,
              transition: cardSwipeStart !== null ? 'none' : 'transform 0.2s ease-out',
            }}
            onTouchStart={handleCardTouchStart}
            onTouchMove={handleCardTouchMove}
            onTouchEnd={handleCardTouchEnd}
          >
            <div class="flex items-center gap-2">
              {/* 前へボタン */}
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevStar() }}
                class="p-1.5 text-slate-400 active:text-white active:bg-white/10 rounded-full flex-shrink-0"
                aria-label="前の曲"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* 曲情報（タップで詳細モーダル） */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowSongDetail(true) }}
                class="flex-1 min-w-0 text-center active:opacity-70"
              >
                <div class="text-base font-medium text-white truncate">{songMap.get(selectedStar)!.title}</div>
                <div class="text-xs text-slate-400">{songMap.get(selectedStar)!.releaseDate} · {selectedStarIndex >= 0 ? selectedStarIndex + 1 : '-'}/{navigableSongIds.length}</div>
                <div class="text-xs text-slate-500 mt-0.5">タップで詳細</div>
              </button>

              {/* 次へボタン */}
              <button
                onClick={(e) => { e.stopPropagation(); goToNextStar() }}
                class="p-1.5 text-slate-400 active:text-white active:bg-white/10 rounded-full flex-shrink-0"
                aria-label="次の曲"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* 選択中の星座タグ */}
        {selectedConstellations.length > 0 && (
          <div class="px-4 pb-2 flex items-center gap-2">
            <button
              onClick={() => setSelectedConstellationIds([])}
              class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 bg-slate-700 text-slate-300 border border-slate-600 active:bg-slate-600"
              aria-label="すべての選択を解除"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              解除
            </button>
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
                    onClick={() => handleRemoveConstellation(c.id)}
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

        {/* カテゴリ選択UI */}
        <CategorySelector
          constellations={constellations}
          customConstellations={customConstellations}
          selectedIds={selectedConstellationIds}
          onSelectionChange={setSelectedConstellationIds}
          onConstellationSelect={handleConstellationSelect}
          onCreateCustom={() => {
            setEditingConstellation(null)
            setIsBuilderOpen(true)
          }}
          onEditCustom={handleEditCustomConstellation}
          onDeleteCustom={handleDeleteCustomConstellation}
        />
      </div>

      {/* 楽曲数の表示 */}
      <div class="absolute left-4 text-xs text-white/40" style={{ bottom: 'calc(0.75rem + var(--sab))' }}>
        {songs.length} songs
      </div>

      {/* ヘッダー: タイトル + 検索ボタン */}
      <div class="absolute left-3 right-3 z-20 flex items-center justify-between" style={{ top: 'var(--header-offset)' }}>
        <h1 class="text-base font-light tracking-wider text-white/90">
          Mrs. GREEN APPLE
          <span class="block text-[10px] text-emerald-400/70">CONSTELLATION MAP</span>
        </h1>
        <button
          onClick={openSearch}
          class="w-9 h-9 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0 active:bg-slate-800"
          aria-label="曲を検索"
        >
          <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* 検索モーダル */}
      {isSearchOpen && (
        <div class="absolute inset-0 z-50 flex flex-col">
          {/* 背景オーバーレイ */}
          <div class="absolute inset-0 bg-slate-950/90" onClick={closeSearch} />

          {/* 検索コンテンツ */}
          <div class="relative z-10 p-4" style={{ paddingTop: 'var(--header-offset)' }}>
            {/* 検索入力 */}
            <div class="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                placeholder="曲名で検索..."
                class="w-full px-4 py-3 pl-10 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* 検索結果 */}
            {searchResults.length > 0 && (
              <div class="mt-2 bg-slate-800 border border-slate-600 rounded-lg overflow-hidden">
                {searchResults.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => handleSearchSelect(song.id)}
                    class="w-full px-4 py-3 text-left hover:bg-slate-700 active:bg-slate-600 border-b border-slate-700 last:border-b-0"
                  >
                    <div class="text-white">{song.title}</div>
                    <div class="text-sm text-slate-400">{song.releaseDate}</div>
                  </button>
                ))}
              </div>
            )}

            {/* 検索クエリがあるが結果がない場合 */}
            {searchQuery.trim() && searchResults.length === 0 && (
              <div class="mt-4 text-center text-slate-400">
                「{searchQuery}」に一致する曲が見つかりません
              </div>
            )}

            {/* 閉じるボタン */}
            <button
              onClick={closeSearch}
              class="mt-4 w-full py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 active:bg-slate-700"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 右側ボタン群 */}
      <div class="absolute right-3 z-20 flex flex-col gap-2" style={{ top: 'calc(var(--header-offset) + 3rem)' }}>
        {/* 共有ボタン */}
        <ShareButton
          selectedConstellations={selectedConstellations}
          positions={positions}
          titleToIdMap={titleToIdMap}
        />

        {/* 使い方ボタン */}
        <button
          onClick={() => setShowTutorial(true)}
          class="w-9 h-9 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg flex items-center justify-center active:bg-slate-800"
          aria-label="使い方を見る"
        >
          <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* ロードマップボタン */}
        <button
          onClick={() => setShowRoadmap(true)}
          class="w-9 h-9 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg flex items-center justify-center active:bg-slate-800"
          aria-label="ロードマップを見る"
        >
          <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </button>

        {/* フィードバックボタン */}
        <button
          onClick={() => setShowFeedback(true)}
          class="w-9 h-9 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg flex items-center justify-center active:bg-slate-800"
          aria-label="フィードバックを送る"
        >
          <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* フィードバックモーダル */}
      {showFeedback && (
        <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}

      {/* ロードマップモーダル */}
      {showRoadmap && (
        <RoadmapModal
          onClose={() => setShowRoadmap(false)}
          onOpenFeedback={() => setShowFeedback(true)}
        />
      )}

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
          animation: fade-in-dot 0.2s ease-out forwards;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      {/* カスタム星座ビルダー */}
      {isBuilderOpen && (
        <CustomConstellationBuilder
          songs={songs}
          editingConstellation={editingConstellation ?? undefined}
          onSave={handleSaveCustomConstellation}
          onCancel={() => {
            setIsBuilderOpen(false)
            setEditingConstellation(null)
          }}
        />
      )}

      {/* 楽曲詳細モーダル */}
      {showSongDetail && selectedStar && songMap.get(selectedStar) && (
        <SongDetailModal
          song={songMap.get(selectedStar)!}
          constellations={songToConstellationsMap.get(songMap.get(selectedStar)!.title) || []}
          essence={essences?.[selectedStar]}
          currentIndex={selectedStarIndex}
          totalCount={navigableSongIds.length}
          onClose={() => setShowSongDetail(false)}
          onNext={goToNextStar}
          onPrev={goToPrevStar}
          onSelectConstellation={(constellation) => {
            if (!selectedConstellationIds.includes(constellation.id)) {
              setSelectedConstellationIds(prev => [...prev, constellation.id])
            }
            handleConstellationSelect(constellation)
            setShowSongDetail(false)
          }}
        />
      )}
    </div>
  )
}
