import { useState, useEffect, useCallback } from 'preact/hooks'

const WELCOME_KEY = 'mga-welcome-shown'

interface WelcomeModalProps {
  onClose: () => void
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = useCallback(() => {
    localStorage.setItem(WELCOME_KEY, 'true')
    setIsVisible(false)
    setTimeout(onClose, 300)
  }, [onClose])

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
        class={`relative bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl transition-transform duration-300 ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
      >
        <h2 class="text-xl font-bold text-white text-center mb-4">
          Mrs. GREEN APPLE<br />
          <span class="text-emerald-400">星座マップ</span>
        </h2>

        <p class="text-slate-300 text-sm text-center mb-6 leading-relaxed">
          全楽曲を星に見立てた星図です。<br />
          ライブやアルバムを選ぶと<br />
          星座が浮かび上がります。
        </p>

        <button
          onClick={handleClose}
          class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
        >
          はじめる
        </button>

        <p class="text-slate-500 text-xs text-center mt-4">
          ファンメイドの非公式プロジェクトです
        </p>
      </div>
    </div>
  )
}

// 初回かどうかをチェックするヘルパー
export function shouldShowWelcome(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(WELCOME_KEY) !== 'true'
}
