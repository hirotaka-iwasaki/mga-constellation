import { useState, useCallback, useEffect, useRef } from 'preact/hooks'

interface RoadmapModalProps {
  onClose: () => void
  onOpenFeedback: () => void
}

interface IdeaItem {
  id: string
  title: string
  description: string
  category?: string // カテゴリを追跡用に追加
}

interface IdeaSection {
  title: string
  icon: string
  color: string
  items: IdeaItem[]
}

// 実装済み機能データ
interface FeatureItem {
  title: string
  description: string
}

interface FeatureSection {
  title: string
  icon: string
  items: FeatureItem[]
}

const implementedFeatures: FeatureSection[] = [
  {
    title: "星座機能",
    icon: "🎵",
    items: [
      { title: "星座表示", description: "アルバム/ライブを選んで星座を表示" },
      { title: "複数選択", description: "複数の星座を同時に表示・比較" },
      { title: "アニメーション", description: "星座線が順番に繋がる演出" },
    ]
  },
  {
    title: "検索・ナビゲーション",
    icon: "🔍",
    items: [
      { title: "曲検索", description: "曲名で検索してジャンプ" },
      { title: "カードスワイプ", description: "スワイプで次/前の曲へ移動" },
      { title: "キーボード操作", description: "←→でナビ、/で検索、Escで解除" },
    ]
  },
  {
    title: "カスタム星座",
    icon: "✨",
    items: [
      { title: "オリジナル星座", description: "好きな曲を選んで星座を作成" },
      { title: "名前付け", description: "作った星座に名前を付ける" },
      { title: "共有", description: "画像として保存・SNSでシェア" },
    ]
  },
  {
    title: "楽曲情報",
    icon: "📖",
    items: [
      { title: "詳細カード", description: "収録アルバム/ライブ一覧を表示" },
      { title: "外部リンク", description: "YouTube/Spotify/Apple Musicへ" },
      { title: "楽曲考察", description: "LLMによるテーマ分析を表示" },
    ]
  },
  {
    title: "操作",
    icon: "🖐️",
    items: [
      { title: "タッチ操作", description: "ドラッグで移動、ピンチでズーム" },
      { title: "チュートリアル", description: "操作方法をいつでも確認" },
    ]
  },
]

// カテゴリ別アイデアデータ（IDを追加）
// 目標票数（この数で100%になる）
const VOTE_GOAL = 20

const ideas: Record<string, IdeaSection> = {
  explore: {
    title: "探索・発見",
    icon: "🔭",
    color: "text-blue-400",
    items: [
      { id: "explore-concept-constellation", title: "考察星座", description: "本質が近い楽曲同士を繋げる新しい星座" },
      { id: "explore-lucky-star", title: "今日のラッキースター", description: "ランダムな曲へジャンプして新しい出会いを" },
      { id: "explore-first-live-link", title: "初披露ライブへのリンク", description: "曲が初めて演奏されたライブへジャンプ" },
      { id: "explore-progress-counter", title: "探索率カウンター", description: "「空の○○%を探索済み」の表示" },
      { id: "explore-easter-egg", title: "日付ベースのイースターエッグ", description: "記念日に特別な星座が出現" },
      { id: "explore-common-songs", title: "共通曲ハイライト", description: "複数星座で共有される曲を強調表示" },
      { id: "explore-guide-mode", title: "星座ガイドモード", description: "当時のセットリストを順に辿るガイド" },
      { id: "explore-complete-constellation", title: "全曲制覇スペシャル星座", description: "全曲訪問で隠し星座が出現" },
      { id: "explore-quiz", title: "星座クイズ", description: "星座線だけでアルバム/ライブを当てるゲーム" },
      { id: "explore-audio-preview", title: "オーディオプレビュー", description: "星選択時に30秒プレビュー再生" },
      { id: "explore-live-gallery", title: "ライブ写真ギャラリー", description: "ライブ星座選択時に公式写真を表示" },
      { id: "explore-ar-mode", title: "AR星空モード", description: "カメラ越しに星空を重ねて表示" },
    ]
  },
  share: {
    title: "共有・カスタマイズ",
    icon: "✨",
    color: "text-pink-400",
    items: [
      { id: "share-url-short", title: "URL短縮", description: "共有URLをより短く、シェアしやすく" },
      { id: "share-hashtag", title: "推奨ハッシュタグ表示", description: "共有時に #ミセス推し座 を提案" },
      { id: "share-diagnosis", title: "診断・称号機能", description: "選んだ曲傾向から「Pop星雲型」などの称号" },
      { id: "share-complete-badge", title: "星座コンプリートバッジ", description: "アルバム全曲探索で達成カードを付与" },
      { id: "share-dynamic-ogp", title: "動的OGP画像生成", description: "選択した星座のプレビュー画像を自動生成" },
    ]
  },
  display: {
    title: "表示・演出",
    icon: "🌟",
    color: "text-amber-400",
    items: [
      { id: "display-jacket", title: "カードにジャケット表示", description: "アルバムアートを詳細カードに表示" },
      { id: "display-mv-thumbnail", title: "MVサムネイル表示", description: "楽曲カードにYouTube公式MVのサムネイル" },
      { id: "display-artist-photo", title: "アーティスト写真", description: "ヘッダーやアバウトに公式写真を表示" },
      { id: "display-song-label", title: "曲名ラベル表示", description: "ズームに応じて曲名を表示/非表示" },
      { id: "display-phase", title: "フェーズ1/2の視覚的分類", description: "活動フェーズで楽曲を色分け" },
      { id: "display-pulse-animation", title: "星の脈動アニメーション", description: "タップ時にゆっくり脈動する演出" },
      { id: "display-shooting-star", title: "流れ星エフェクト", description: "操作がないと流れ星が流れる" },
      { id: "display-bg-color", title: "背景カラー演出", description: "選択中アルバムのテーマカラーを背景に反映" },
      { id: "display-color-theme", title: "カラーテーマ切替", description: "昼/夜モード、GREEN APPLEモードなど" },
    ]
  },
  utility: {
    title: "便利機能",
    icon: "⚡",
    color: "text-emerald-400",
    items: [
      { id: "utility-pwa", title: "PWA対応", description: "ホーム画面に追加してアプリのように使用" },
      { id: "utility-spotify", title: "Spotify連携", description: "再生履歴に基づき、よく聴く曲を強調" },
      { id: "utility-apple-music", title: "Apple Music連携", description: "ライブラリとの連携機能" },
      { id: "utility-i18n", title: "多言語対応", description: "英語表示に切り替え可能" },
    ]
  },
}

const STORAGE_KEY = 'mga-voted-ideas'

function getVotedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveVotedId(ideaId: string): void {
  const voted = getVotedIds()
  if (!voted.includes(ideaId)) {
    voted.push(ideaId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(voted))
  }
}

// 全アイデアをフラット化（カテゴリ情報付き）
function getAllIdeas(): (IdeaItem & { categoryKey: string; categoryColor: string })[] {
  const allIdeas: (IdeaItem & { categoryKey: string; categoryColor: string })[] = []
  Object.entries(ideas).forEach(([key, section]) => {
    section.items.forEach(item => {
      allIdeas.push({ ...item, categoryKey: key, categoryColor: section.color })
    })
  })
  return allIdeas
}

// アイデアの達成判定
function isAchieved(voteCount: number): boolean {
  return voteCount >= VOTE_GOAL
}

export function RoadmapModal({ onClose, onOpenFeedback }: RoadmapModalProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [votedIds, setVotedIds] = useState<string[]>([])
  const [votingId, setVotingId] = useState<string | null>(null)
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false)
  // 達成アニメーション用: 直前に達成したアイデアID
  const [justAchievedId, setJustAchievedId] = useState<string | null>(null)
  // 達成セクションの開閉
  const [isAchievedOpen, setIsAchievedOpen] = useState(true)
  // モーダルのスクロールコンテナref
  const modalRef = useRef<HTMLDivElement>(null)
  // 開発予定セクションのref
  const achievedSectionRef = useRef<HTMLDivElement>(null)
  // トースト通知用
  const [toast, setToast] = useState<{ message: string; isAchieved: boolean } | null>(null)

  // 初期化: 投票数取得 & localStorage から投票済みID読み込み
  useEffect(() => {
    setVotedIds(getVotedIds())

    // 投票数を取得
    fetch('/api/votes')
      .then(res => res.json())
      .then(data => {
        if (data.votes) {
          setVotes(data.votes)
        }
      })
      .catch(err => {
        console.error('Failed to fetch votes:', err)
      })
  }, [])

  // モーダル表示中は背景のスクロールを無効化
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }, [onClose])

  const handleOpenFeedback = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
      onOpenFeedback()
    }, 300)
  }, [onClose, onOpenFeedback])

  const handleVote = useCallback(async (ideaId: string) => {
    if (votingId) return // 投票中は無視

    const prevVotes = votes[ideaId] || 0
    const wasAchieved = isAchieved(prevVotes)

    setVotingId(ideaId)
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId }),
      })
      const data = await res.json()

      if (data.success) {
        const newVotes = data.votes
        setVotes(prev => ({ ...prev, [ideaId]: newVotes }))
        saveVotedId(ideaId)
        setVotedIds(prev => [...prev, ideaId])

        // 今回の投票で達成したかチェック
        const justAchieved = !wasAchieved && isAchieved(newVotes)

        // トースト表示
        setToast({
          message: justAchieved ? '投票ありがとう！開発者に届けました' : '投票ありがとう！',
          isAchieved: justAchieved
        })
        setTimeout(() => setToast(null), 3000)

        if (justAchieved) {
          // 達成アニメーションをトリガー
          setJustAchievedId(ideaId)
          // 開発予定セクションを開く
          setIsAchievedOpen(true)
          // 開発予定セクションにスクロール（即座に開始）
          achievedSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          // アニメーション終了後にリセット（長めに表示）
          setTimeout(() => {
            setJustAchievedId(null)
          }, 6000)
        }
      }
    } catch (err) {
      console.error('Failed to vote:', err)
    } finally {
      setVotingId(null)
    }
  }, [votingId, votes])

  return (
    <div
      class={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* 背景オーバーレイ */}
      <div class="absolute inset-0 bg-slate-950/90" onClick={handleClose} />

      {/* モーダル本体 */}
      <div
        ref={modalRef}
        class={`relative bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-lg w-full shadow-2xl transition-transform duration-300 max-h-[85vh] overflow-y-auto overscroll-contain ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
        style={{ touchAction: 'pan-y' }}
        onTouchMove={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={handleClose}
          class="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
          aria-label="閉じる"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ヘッダー */}
        <h2 class="text-lg font-bold text-white mb-1 pr-8">
          Ideas
        </h2>
        <p class="text-slate-400 text-sm mb-3">
          検討中のアイデア - 欲しい機能に投票してください
        </p>

        {/* フィードバックボタン */}
        <button
          onClick={handleOpenFeedback}
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-sm rounded-lg border border-emerald-500/30 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          「これが欲しい！」を送る
        </button>

        {/* 開発予定セクション */}
        {(() => {
          const achievedIdeas = getAllIdeas().filter(item => isAchieved(votes[item.id] || 0))
          if (achievedIdeas.length === 0) return null

          return (
            <div ref={achievedSectionRef} class="mb-5">
              <button
                onClick={() => setIsAchievedOpen(!isAchievedOpen)}
                class="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 rounded-lg border border-amber-500/30 transition-colors"
              >
                <span class="text-sm text-amber-300 flex items-center gap-2 font-medium">
                  <span>🚀</span>
                  開発予定
                  <span class="text-xs bg-amber-500/30 px-1.5 py-0.5 rounded-full">
                    {achievedIdeas.length}
                  </span>
                </span>
                <svg
                  class={`w-4 h-4 text-amber-400 transition-transform ${isAchievedOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isAchievedOpen && (
                <div class="mt-2 space-y-1.5">
                  {achievedIdeas.map((item) => {
                    const isJustAchieved = justAchievedId === item.id

                    return (
                      <div
                        key={item.id}
                        class={`
                          relative overflow-hidden rounded-lg px-3 py-2 border flex items-start gap-2
                          ${isJustAchieved
                            ? 'bg-amber-500/30 border-amber-400 animate-achieved-snap'
                            : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20'
                          }
                        `}
                      >
                        {/* 達成キラキラエフェクト */}
                        {isJustAchieved && (
                          <div class="absolute inset-0 pointer-events-none">
                            <div class="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-sparkle-1" />
                            <div class="absolute top-2 right-4 w-1.5 h-1.5 bg-amber-200 rounded-full animate-sparkle-2" />
                            <div class="absolute bottom-1 left-1/3 w-1 h-1 bg-white rounded-full animate-sparkle-3" />
                            <div class="absolute bottom-2 right-8 w-1 h-1 bg-amber-300 rounded-full animate-sparkle-1" />
                          </div>
                        )}

                        <div class="relative flex-1 min-w-0">
                          <div class="flex items-center gap-2">
                            <span class="text-sm text-amber-100 font-medium">{item.title}</span>
                            <svg class="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                          </div>
                          <div class="text-xs text-amber-200/60 mt-0.5">{item.description}</div>
                        </div>

                        {/* 票数表示 */}
                        <div class="relative flex-shrink-0 text-xs text-amber-300/70 flex items-center gap-1">
                          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          <span>{votes[item.id] || 0}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })()}

        {/* できること（折りたたみ） */}
        <div class="mb-5">
          <button
            onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
            class="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
          >
            <span class="text-sm text-white/80 flex items-center gap-2">
              <span>🌟</span>
              もうできること
            </span>
            <svg
              class={`w-4 h-4 text-white/50 transition-transform ${isFeaturesOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isFeaturesOpen && (
            <div class="mt-2 space-y-3">
              {implementedFeatures.map((section) => (
                <div key={section.title} class="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div class="text-xs font-medium text-white/70 mb-2 flex items-center gap-1.5">
                    <span>{section.icon}</span>
                    {section.title}
                  </div>
                  <div class="space-y-1">
                    {section.items.map((item) => (
                      <div key={item.title} class="flex items-start gap-2 text-xs">
                        <svg class="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                        <div>
                          <span class="text-white/80">{item.title}</span>
                          <span class="text-white/40 ml-1">- {item.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* カテゴリ別アイデア */}
        {Object.entries(ideas).map(([key, section]) => {
          // 達成済みを除いた未達成アイデアのみ表示
          const pendingItems = section.items.filter(item => !isAchieved(votes[item.id] || 0))
          if (pendingItems.length === 0) return null

          return (
            <section key={key} class="mb-5 last:mb-0">
              <h3 class={`text-sm font-medium mb-2 flex items-center gap-1.5 ${section.color}`}>
                <span>{section.icon}</span>
                {section.title}
              </h3>

              <div class="space-y-1.5">
                {pendingItems.map((item) => {
                  const isVoted = votedIds.includes(item.id)
                  const isVoting = votingId === item.id
                  const voteCount = votes[item.id] || 0
                  const progressPercent = Math.min((voteCount / VOTE_GOAL) * 100, 100)

                  return (
                    <div
                      key={item.id}
                      class="relative overflow-hidden bg-white/5 rounded-lg px-3 py-2 border border-white/10 flex items-start gap-2"
                    >
                      {/* プログレスバー背景 */}
                      <div
                        class="absolute inset-0 bg-emerald-400 opacity-20 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                      <div class="relative flex-1 min-w-0">
                        <div class="text-sm text-white/90">{item.title}</div>
                        <div class="text-xs text-white/50 mt-0.5">{item.description}</div>
                      </div>

                      {/* 投票ボタン */}
                      <button
                        onClick={() => !isVoted && handleVote(item.id)}
                        disabled={isVoting || isVoted}
                        class={`relative flex-shrink-0 p-1.5 rounded-full transition-all ${
                          isVoted
                            ? 'text-pink-400 cursor-default'
                            : 'text-white/40 hover:text-pink-400 active:scale-110'
                        } ${isVoting ? 'opacity-50 cursor-wait' : ''}`}
                        aria-label={isVoted ? '投票済み' : '投票する'}
                      >
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill={isVoted ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {/* フッター */}
        <div class="mt-6 pt-4 border-t border-white/10 text-center text-white/40 text-xs">
          <p>
            このサイトは非公式のファンメイドプロジェクトです。
          </p>
        </div>
      </div>

      {/* トースト通知 */}
      {toast && (
        <div
          class={`
            fixed bottom-8 left-1/2 -translate-x-1/2 z-[80]
            px-4 py-3 rounded-xl shadow-lg
            flex items-center gap-2
            animate-toast-in
            ${toast.isAchieved
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              : 'bg-slate-800 text-white border border-slate-600'
            }
          `}
        >
          {toast.isAchieved ? (
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ) : (
            <svg class="w-5 h-5 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
          <span class="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  )
}
