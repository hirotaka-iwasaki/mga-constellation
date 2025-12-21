import { useCallback, useRef, useEffect, useState } from 'preact/hooks'
import { createPortal } from 'preact/compat'
import type { Song, Constellation, SongEssence } from '../types'

interface SongDetailModalProps {
  song: Song
  constellations: Constellation[]  // この曲が収録されている星座一覧
  essence?: SongEssence  // 楽曲分析データ（遅延ロード）
  currentIndex: number
  totalCount: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  onSelectConstellation: (constellation: Constellation) => void
}

const SWIPE_CLOSE_THRESHOLD = 100 // この距離以上スワイプしたら閉じる

export function SongDetailModal({
  song,
  constellations,
  essence,
  currentIndex,
  totalCount,
  onClose,
  onNext,
  onPrev,
  onSelectConstellation,
}: SongDetailModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  // スワイプで閉じる用の状態
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const canDragClose = useRef(false) // スクロール位置が0の時のみtrue

  // タッチ開始
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const scrollEl = contentRef.current
    // スクロール位置が最上部の時のみドラッグで閉じることを許可
    canDragClose.current = !scrollEl || scrollEl.scrollTop <= 0
    dragStartY.current = e.touches[0].clientY
    setIsDragging(false)
    setDragOffset(0)
  }, [])

  // タッチ移動
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const deltaY = e.touches[0].clientY - dragStartY.current

    // 下方向へのスワイプで、スクロールが最上部の場合のみ
    if (deltaY > 0 && canDragClose.current) {
      // スクロールを防いでモーダルを移動
      e.preventDefault()
      setIsDragging(true)
      setDragOffset(deltaY)
    }
  }, [])

  // タッチ終了
  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      if (dragOffset > SWIPE_CLOSE_THRESHOLD) {
        // 閾値を超えたら閉じる
        onClose()
      } else {
        // 閾値未満なら元に戻す
        setDragOffset(0)
      }
    }
    setIsDragging(false)
  }, [isDragging, dragOffset, onClose])

  // ポータル用のコンテナをbody直下に作成
  useEffect(() => {
    const container = document.createElement('div')
    container.id = 'song-detail-portal'
    document.body.appendChild(container)
    setPortalContainer(container)

    return () => {
      document.body.removeChild(container)
    }
  }, [])

  // アルバムとライブを分類
  const albums = constellations.filter(c => c.type === 'album' || c.type === 'single')
  const lives = constellations.filter(c => c.type === 'live')

  // ポータルコンテナが準備できるまで何も表示しない
  if (!portalContainer) return null

  const modalContent = (
    <div class="fixed inset-0 z-50 flex flex-col">
      {/* 背景オーバーレイ */}
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダルコンテンツ */}
      <div
        ref={modalRef}
        class={`relative mt-auto bg-slate-900 rounded-t-2xl max-h-[85vh] flex flex-col ${isDragging ? '' : 'animate-slide-up-modal'}`}
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ドラッグハンドル */}
        <div class="flex justify-center py-3">
          <div class="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* ヘッダー（ナビゲーション付き） */}
        <div class="flex items-center px-4 pb-3 border-b border-slate-700">
          <button
            onClick={onPrev}
            class="p-2 text-slate-400 active:text-white active:bg-white/10 rounded-full"
            aria-label="前の曲"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="flex-1 text-center">
            <h2 class="text-xl font-bold text-white">{song.title}</h2>
            <p class="text-sm text-slate-400 mt-0.5">
              {song.releaseDate} · {currentIndex + 1}/{totalCount}
            </p>
          </div>

          <button
            onClick={onNext}
            class="p-2 text-slate-400 active:text-white active:bg-white/10 rounded-full"
            aria-label="次の曲"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* スクロール可能なコンテンツ */}
        <div
          ref={contentRef}
          class="flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          {/* エッセンス情報 */}
          {essence && (
            <section class="mb-6">
              {/* テーマタグ */}
              {(essence.themes?.length > 0 || essence.emotion) && (
                <div class="flex flex-wrap gap-1.5 mb-3">
                  {essence.themes?.map(theme => (
                    <span
                      key={theme}
                      class="px-2 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    >
                      {theme}
                    </span>
                  ))}
                  {essence.emotion && (
                    <span class="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {essence.emotion}
                    </span>
                  )}
                </div>
              )}

              {/* メッセージ */}
              {essence.message && (
                <p class="text-sm text-slate-200 leading-relaxed mb-4 border-l-2 border-indigo-500/50 pl-3">
                  {essence.message}
                </p>
              )}

              {/* 解釈 */}
              {essence.interpretation && (
                <div class="mb-4">
                  <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Interpretation</h3>
                  <p class="text-sm text-slate-400 leading-relaxed">
                    {essence.interpretation}
                  </p>
                </div>
              )}

              {/* 歌詞分析 */}
              {essence.lyricsAnalysis && (
                <div class="mb-4 space-y-3">
                  {/* キーワード */}
                  {essence.lyricsAnalysis.keywords?.length > 0 && (
                    <div>
                      <h4 class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Keywords</h4>
                      <div class="flex flex-wrap gap-1">
                        {essence.lyricsAnalysis.keywords.map(kw => (
                          <span key={kw} class="px-1.5 py-0.5 text-xs bg-slate-800 text-slate-300 rounded">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* モチーフ */}
                  {essence.lyricsAnalysis.motifs?.length > 0 && (
                    <div>
                      <h4 class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Motifs</h4>
                      <ul class="text-xs text-slate-400 space-y-0.5">
                        {essence.lyricsAnalysis.motifs.map(motif => (
                          <li key={motif} class="flex items-start gap-1.5">
                            <span class="text-indigo-400 mt-0.5">•</span>
                            <span>{motif}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 隠喩・比喩 */}
                  {essence.lyricsAnalysis.metaphors?.length > 0 && (
                    <div>
                      <h4 class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Metaphors</h4>
                      <ul class="text-xs text-slate-400 space-y-0.5">
                        {essence.lyricsAnalysis.metaphors.map(meta => (
                          <li key={meta} class="flex items-start gap-1.5">
                            <span class="text-amber-400 mt-0.5">◇</span>
                            <span>{meta}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 本人コメント */}
              {essence.relatedQuotes && essence.relatedQuotes.length > 0 && (
                <div class="mb-4">
                  <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Artist Comments</h3>
                  <div class="space-y-2">
                    {essence.relatedQuotes.map((q, i) => (
                      <div key={i} class="bg-slate-800/50 rounded-lg p-3">
                        <p class="text-sm text-slate-300 italic">"{q.quote}"</p>
                        <p class="text-xs text-slate-500 mt-1">— {q.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 関連曲 */}
              {essence.connections && Object.keys(essence.connections).length > 0 && (
                <div class="mb-4">
                  <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Connections</h3>
                  <div class="space-y-1">
                    {Object.entries(essence.connections).map(([key, value]) => (
                      <div key={key} class="flex items-start gap-2 text-xs">
                        <span class="text-slate-500 flex-shrink-0">
                          {key === 'answerTo' ? '← Answer to' :
                           key === 'answeredBy' ? '→ Answered by' :
                           key === 'themeRelation' ? '≈ Theme' :
                           key === 'sameProject' ? '⊂ Same project' :
                           key === 'tieUp' ? '♪ Tie-up' : key}:
                        </span>
                        <span class="text-slate-300">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 免責事項 */}
              <p class="text-[10px] text-slate-600 text-center mt-4">
                ※ 楽曲についての解釈は当サイト独自のものであり、アーティストの公式見解ではありません
              </p>
            </section>
          )}

          {/* 外部リンク */}
          <section class="mb-6">
            <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Listen</h3>
            <div class="flex gap-3">
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' Mrs. GREEN APPLE')}`}
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/20 text-red-400 active:bg-red-600/30"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span class="text-sm font-medium">YouTube</span>
              </a>
              <a
                href={`https://open.spotify.com/search/${encodeURIComponent(song.title + ' Mrs. GREEN APPLE')}`}
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600/20 text-emerald-400 active:bg-emerald-600/30"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span class="text-sm font-medium">Spotify</span>
              </a>
              <a
                href={`https://music.apple.com/jp/search?term=${encodeURIComponent(song.title + ' Mrs. GREEN APPLE')}`}
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-pink-600/20 text-pink-400 active:bg-pink-600/30"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.401-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.785-.455-2.105-1.245-.38-.94.093-2.003 1.116-2.494.285-.137.59-.217.9-.27.457-.077.92-.136 1.378-.214.295-.05.452-.188.49-.472.002-.016.005-.032.005-.05V9.315c0-.269-.08-.347-.346-.3l-3.98.756c-.036.007-.07.018-.12.03v6.637c0 .424-.048.84-.225 1.227-.283.616-.765 1.012-1.415 1.2-.34.097-.69.15-1.043.17-1.015.05-1.86-.5-2.14-1.382-.315-.99.188-2.028 1.238-2.52.27-.127.56-.2.856-.25.47-.08.946-.143 1.417-.222.28-.047.43-.18.472-.464.002-.02.006-.04.006-.06V7.12c0-.176.026-.345.105-.503.073-.148.185-.256.34-.318.12-.049.246-.08.374-.104l5.186-.99c.186-.036.374-.07.563-.088.322-.03.52.138.54.46.003.04.003.082.003.123v4.42z"/>
                </svg>
                <span class="text-sm font-medium">Apple</span>
              </a>
            </div>
          </section>

          {/* 収録アルバム */}
          {albums.length > 0 && (
            <section class="mb-6">
              <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Albums</h3>
              <div class="space-y-2">
                {albums.map(c => (
                  <button
                    key={c.id}
                    onClick={() => onSelectConstellation(c)}
                    class="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 active:bg-slate-700/50 text-left"
                  >
                    <span
                      class="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <div class="flex-1 min-w-0">
                      <span class="block text-sm text-white truncate">{c.name}</span>
                      <span class="block text-xs text-slate-500">{c.year}</span>
                    </div>
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* 収録ライブ */}
          {lives.length > 0 && (
            <section class="mb-6">
              <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Lives</h3>
              <div class="space-y-2">
                {lives.map(c => (
                  <button
                    key={c.id}
                    onClick={() => onSelectConstellation(c)}
                    class="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 active:bg-slate-700/50 text-left"
                  >
                    <span
                      class="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <div class="flex-1 min-w-0">
                      <span class="block text-sm text-white truncate">{c.name}</span>
                      <span class="block text-xs text-slate-500">{c.year}</span>
                    </div>
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* 収録情報がない場合 */}
          {albums.length === 0 && lives.length === 0 && (
            <section class="mb-6">
              <p class="text-sm text-slate-500 text-center py-4">
                収録情報はありません
              </p>
            </section>
          )}
        </div>

        {/* 閉じるボタン */}
        <div class="p-4 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            class="w-full py-3 rounded-xl bg-slate-800 text-slate-300 font-medium active:bg-slate-700"
          >
            閉じる
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up-modal {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up-modal {
          animation: slide-up-modal 0.3s ease-out;
        }
      `}</style>
    </div>
  )

  return createPortal(modalContent, portalContainer)
}
