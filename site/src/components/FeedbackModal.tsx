import { useState, useCallback, useRef } from 'preact/hooks'

interface FeedbackModalProps {
  onClose: () => void
}

// セキュリティ設定
const MAX_CONTENT_LENGTH = 1000
const RATE_LIMIT_MS = 30000 // 30秒間隔

// HTMLエスケープ関数
function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const CATEGORIES = [
  { id: 'idea', label: '機能リクエスト', icon: '💡' },
  { id: 'bug', label: 'バグ報告', icon: '🐛' },
  { id: 'praise', label: '感想・応援', icon: '✨' },
  { id: 'other', label: 'その他', icon: '💬' },
]

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [category, setCategory] = useState<string>('')
  const [content, setContent] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [rateLimitError, setRateLimitError] = useState(false)
  const lastSubmitTime = useRef<number>(0)

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }, [onClose])

  const handleSubmit = useCallback(async () => {
    if (!category || !content.trim()) return

    // レート制限チェック
    const now = Date.now()
    if (now - lastSubmitTime.current < RATE_LIMIT_MS) {
      setRateLimitError(true)
      return
    }
    setRateLimitError(false)
    lastSubmitTime.current = now

    setSubmitState('submitting')

    // 入力値をサニタイズ
    const sanitizedContent = sanitizeInput(content.trim().slice(0, MAX_CONTENT_LENGTH))

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: sanitizedContent,
          type: category,
          platform: 'web',
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitState('success')
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Feedback submission failed:', error)
      setSubmitState('error')
    }
  }, [category, content])

  const isValid = category && content.trim().length > 0 && content.length <= MAX_CONTENT_LENGTH
  const isSubmitting = submitState === 'submitting'

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
        class={`relative bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl transition-transform duration-300 max-h-[85vh] overflow-y-auto ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
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

        {submitState === 'success' ? (
          // 送信完了画面
          <div class="text-center py-6">
            <div class="text-4xl mb-4">✨</div>
            <h2 class="text-xl font-bold text-white mb-2">
              ありがとうございます！
            </h2>
            <p class="text-slate-300 text-sm mb-6">
              フィードバックを受け付けました。<br />
              今後の改善に活用させていただきます。
            </p>
            <button
              onClick={handleClose}
              class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              閉じる
            </button>
          </div>
        ) : submitState === 'error' ? (
          // エラー画面
          <div class="text-center py-6">
            <div class="text-4xl mb-4">😢</div>
            <h2 class="text-xl font-bold text-white mb-2">
              送信できませんでした
            </h2>
            <p class="text-slate-300 text-sm mb-6">
              通信エラーが発生しました。<br />
              しばらく待ってからお試しください。
            </p>
            <div class="flex gap-3 justify-center">
              <button
                onClick={() => setSubmitState('idle')}
                class="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                戻る
              </button>
              <button
                onClick={handleSubmit}
                class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
              >
                再送信
              </button>
            </div>
          </div>
        ) : (
          // 入力フォーム
          <>
            <h2 class="text-lg font-bold text-white mb-1 pr-8">
              匿名フィードバック
            </h2>
            <p class="text-slate-400 text-sm mb-4">
              ご意見・ご要望をお聞かせください
            </p>

            {/* カテゴリ選択 */}
            <div class="mb-4">
              <label class="block text-sm text-slate-300 mb-2">カテゴリ</label>
              <div class="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    class={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                      category === cat.id
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span class="mr-1.5">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 内容入力 */}
            <div class="mb-4">
              <div class="flex justify-between items-center mb-2">
                <label class="text-sm text-slate-300">内容</label>
                <span class={`text-xs ${content.length > MAX_CONTENT_LENGTH ? 'text-red-400' : 'text-slate-500'}`}>
                  {content.length}/{MAX_CONTENT_LENGTH}
                </span>
              </div>
              <textarea
                value={content}
                onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
                placeholder="詳しく教えてください..."
                rows={4}
                maxLength={MAX_CONTENT_LENGTH + 100}
                class={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none resize-none ${
                  content.length > MAX_CONTENT_LENGTH ? 'border-red-500' : 'border-slate-600 focus:border-slate-500'
                }`}
              />
              {content.length > MAX_CONTENT_LENGTH && (
                <p class="text-red-400 text-xs mt-1">文字数が上限を超えています</p>
              )}
            </div>

            {/* レート制限エラー */}
            {rateLimitError && (
              <div class="mb-4 p-3 bg-amber-900/30 border border-amber-600 rounded-lg">
                <p class="text-amber-400 text-sm">
                  連続送信はできません。しばらく待ってからお試しください。
                </p>
              </div>
            )}

            {/* 送信ボタン */}
            <button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              class={`w-full py-3 font-medium rounded-lg transition-colors ${
                isValid && !isSubmitting
                  ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  送信中...
                </span>
              ) : (
                '送信する'
              )}
            </button>

            <p class="text-slate-500 text-xs text-center mt-3">
              ※ 個人情報は入力しないでください
            </p>
          </>
        )}
      </div>
    </div>
  )
}
