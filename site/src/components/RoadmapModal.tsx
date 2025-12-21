import { useState, useCallback, useEffect } from 'preact/hooks'

interface RoadmapModalProps {
  onClose: () => void
  onOpenFeedback: () => void
}

interface IdeaItem {
  id: string
  title: string
  description: string
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

export function RoadmapModal({ onClose, onOpenFeedback }: RoadmapModalProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [votedIds, setVotedIds] = useState<string[]>([])
  const [votingId, setVotingId] = useState<string | null>(null)
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false)

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

    setVotingId(ideaId)
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId }),
      })
      const data = await res.json()

      if (data.success) {
        setVotes(prev => ({ ...prev, [ideaId]: data.votes }))
        saveVotedId(ideaId)
        setVotedIds(prev => [...prev, ideaId])
      }
    } catch (err) {
      console.error('Failed to vote:', err)
    } finally {
      setVotingId(null)
    }
  }, [votingId])

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

        {/* できること（折りたたみ） */}
        <div class="mb-5">
          <button
            onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
            class="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
          >
            <span class="text-sm text-white/80 flex items-center gap-2">
              <span>🌟</span>
              できること
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
        {Object.entries(ideas).map(([key, section]) => (
          <section key={key} class="mb-5 last:mb-0">
            <h3 class={`text-sm font-medium mb-2 flex items-center gap-1.5 ${section.color}`}>
              <span>{section.icon}</span>
              {section.title}
            </h3>

            <div class="space-y-1.5">
              {section.items.map((item) => {
                const isVoted = votedIds.includes(item.id)
                const isVoting = votingId === item.id
                const voteCount = votes[item.id] || 0

                return (
                  <div
                    key={item.id}
                    class="bg-white/5 rounded-lg px-3 py-2 border border-white/10 flex items-start gap-2"
                  >
                    <div class="flex-1 min-w-0">
                      <div class="text-sm text-white/90">{item.title}</div>
                      <div class="text-xs text-white/50 mt-0.5">{item.description}</div>
                    </div>

                    {/* 投票ボタン */}
                    <button
                      onClick={() => !isVoted && handleVote(item.id)}
                      disabled={isVoting || isVoted}
                      class={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                        isVoted
                          ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 cursor-default'
                          : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20 hover:text-white'
                      } ${isVoting ? 'opacity-50 cursor-wait' : ''}`}
                      aria-label={isVoted ? '投票済み' : '投票する'}
                    >
                      {isVoted ? (
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      ) : (
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                      <span>{voteCount}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {/* フッター */}
        <div class="mt-6 pt-4 border-t border-white/10 text-center text-white/40 text-xs">
          <p>
            このサイトは非公式のファンメイドプロジェクトです。
          </p>
        </div>
      </div>
    </div>
  )
}
