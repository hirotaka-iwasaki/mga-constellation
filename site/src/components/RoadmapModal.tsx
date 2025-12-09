import { useState, useCallback, useEffect } from 'preact/hooks'

interface RoadmapModalProps {
  onClose: () => void
  onOpenFeedback: () => void
}

// カテゴリ別アイデアデータ（TODO.mdの[公開:xxx]タグから抽出）
const ideas = {
  explore: {
    title: "探索・発見",
    icon: "🔭",
    color: "text-blue-400",
    items: [
      { title: "今日のラッキースター", description: "ランダムな曲へジャンプして新しい出会いを" },
      { title: "初披露ライブへのリンク", description: "曲が初めて演奏されたライブへジャンプ" },
      { title: "探索率カウンター", description: "「空の○○%を探索済み」の表示" },
      { title: "日付ベースのイースターエッグ", description: "記念日に特別な星座が出現" },
      { title: "共通曲ハイライト", description: "複数星座で共有される曲を強調表示" },
      { title: "星座ガイドモード", description: "当時のセットリストを順に辿るガイド" },
      { title: "全曲制覇スペシャル星座", description: "全曲訪問で隠し星座が出現" },
      { title: "星座クイズ", description: "星座線だけでアルバム/ライブを当てるゲーム" },
      { title: "オーディオプレビュー", description: "星選択時に30秒プレビュー再生" },
      { title: "AR星空モード", description: "カメラ越しに星空を重ねて表示" },
    ]
  },
  share: {
    title: "共有・カスタマイズ",
    icon: "✨",
    color: "text-pink-400",
    items: [
      { title: "URL短縮", description: "共有URLをより短く、シェアしやすく" },
      { title: "推奨ハッシュタグ表示", description: "共有時に #ミセス推し座 を提案" },
      { title: "診断・称号機能", description: "選んだ曲傾向から「Pop星雲型」などの称号" },
      { title: "星座コンプリートバッジ", description: "アルバム全曲探索で達成カードを付与" },
      { title: "動的OGP画像生成", description: "選択した星座のプレビュー画像を自動生成" },
    ]
  },
  display: {
    title: "表示・演出",
    icon: "🌟",
    color: "text-amber-400",
    items: [
      { title: "カードにジャケット表示", description: "アルバムアートを詳細カードに表示" },
      { title: "曲名ラベル表示", description: "ズームに応じて曲名を表示/非表示" },
      { title: "フェーズ1/2の視覚的分類", description: "活動フェーズで楽曲を色分け" },
      { title: "星の脈動アニメーション", description: "タップ時にゆっくり脈動する演出" },
      { title: "流れ星エフェクト", description: "操作がないと流れ星が流れる" },
      { title: "背景カラー演出", description: "選択中アルバムのテーマカラーを背景に反映" },
      { title: "カラーテーマ切替", description: "昼/夜モード、GREEN APPLEモードなど" },
    ]
  },
  utility: {
    title: "便利機能",
    icon: "⚡",
    color: "text-emerald-400",
    items: [
      { title: "PWA対応", description: "ホーム画面に追加してアプリのように使用" },
      { title: "Spotify連携", description: "再生履歴に基づき、よく聴く曲を強調" },
      { title: "Apple Music連携", description: "ライブラリとの連携機能" },
      { title: "多言語対応", description: "英語表示に切り替え可能" },
    ]
  },
}

export function RoadmapModal({ onClose, onOpenFeedback }: RoadmapModalProps) {
  const [isVisible, setIsVisible] = useState(true)

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
          検討中のアイデア
        </p>

        {/* フィードバックボタン */}
        <button
          onClick={handleOpenFeedback}
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-sm rounded-lg border border-emerald-500/30 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          「これが欲しい！」を送る
        </button>

        {/* カテゴリ別アイデア */}
        {Object.entries(ideas).map(([key, section]) => (
          <section key={key} class="mb-5 last:mb-0">
            <h3 class={`text-sm font-medium mb-2 flex items-center gap-1.5 ${section.color}`}>
              <span>{section.icon}</span>
              {section.title}
            </h3>

            <div class="space-y-1.5">
              {section.items.map((item, idx) => (
                <div
                  key={idx}
                  class="bg-white/5 rounded-lg px-3 py-2 border border-white/10"
                >
                  <div class="text-sm text-white/90">{item.title}</div>
                  <div class="text-xs text-white/50 mt-0.5">{item.description}</div>
                </div>
              ))}
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
