import { useState, useEffect, useCallback, useRef } from 'preact/hooks'

const TUTORIAL_KEY = 'mga-tutorial-completed'
const TUTORIAL_VERSION = '4'

interface TutorialStep {
  target: string // data-tutorial属性のセレクタ
  title: string
  description: string
  position: 'top' | 'bottom' | 'center' | 'center-bottom' | 'top-center'
  // onEnter: このステップに入った時に実行
  onEnter?: 'focus-start' | 'show-card-start' | 'select-babel' | 'reset-view'
  // onExit: このステップから次へ進む時に実行
  onExit?: 'show-card-start' | 'hide-card' | 'select-babel' | 'clear-selection'
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: '[data-tutorial="starfield"]',
    title: '🍏 Mrs. GREEN APPLEの\n楽曲を星に見立てた星図です',
    description: '',
    position: 'center-bottom',
    onEnter: 'reset-view', // 全体を見せるため初期位置にリセット
  },
  {
    target: '[data-tutorial="star-start"]',
    title: '⭐ 星をタップすると',
    description: '',
    position: 'bottom',
    onEnter: 'focus-start', // ステップに入った時にStaRtの星を画面中央に
    onExit: 'show-card-start', // 次へ進む時にカードを表示
  },
  {
    target: '[data-tutorial="card"]',
    title: '🎵 曲が表示されます',
    description: '',
    position: 'top',
    onExit: 'hide-card', // 次へ進む時にカードを消す
  },
  {
    target: '[data-tutorial="footer"]',
    title: '🎤 ライブのセットリストや\nアルバム収録曲を選ぶと',
    description: '',
    position: 'top',
    onExit: 'select-babel', // 次へ進む時に星座を選択
  },
  {
    target: '[data-tutorial="starfield"]',
    title: '✨ セトリや収録曲で\n星座が作れます',
    description: '',
    position: 'center-bottom',
    onExit: 'clear-selection', // 次へ進む時に選択解除
  },
  {
    target: '[data-tutorial="oshiza-button"]',
    title: '💚 自分で好きな曲を集めて\n"推し座"も作れます',
    description: '',
    position: 'top',
  },
  {
    target: '[data-tutorial="share-button"]',
    title: '📸 推し座が作れたら\n画像にしてシェアしてみてね',
    description: '',
    position: 'top-center',
  },
]

interface SpotlightRect {
  x: number
  y: number
  width: number
  height: number
}

interface TutorialOverlayProps {
  onComplete: () => void
  onAction?: (action: string) => void
}

export function TutorialOverlay({ onComplete, onAction }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null)
  const [tooltipStyle, setTooltipStyle] = useState<{ top?: string; bottom?: string; left: string; transform: string }>({
    left: '50%',
    transform: 'translateX(-50%)',
  })
  const overlayRef = useRef<HTMLDivElement>(null)

  const step = TUTORIAL_STEPS[currentStep]
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1

  // onActionをrefで保持（依存配列に入れないため）
  const onActionRef = useRef(onAction)
  onActionRef.current = onAction

  // ステップ変更時にスポットライトを更新（リトライ付き）
  // currentStepのみを依存配列に入れる（無限ループ防止）
  useEffect(() => {
    const currentStepData = TUTORIAL_STEPS[currentStep]

    // 現在のステップのonEnterを実行（ある場合）
    if (currentStepData.onEnter && onActionRef.current) {
      onActionRef.current(currentStepData.onEnter)
    }

    let retryCount = 0
    const maxRetries = 20
    let cancelled = false

    const tryUpdateSpotlight = () => {
      if (cancelled) return

      const target = document.querySelector(currentStepData.target)
      if (target) {
        const rect = target.getBoundingClientRect()
        // カードはより大きめのパディングで包む
        const isCard = currentStepData.target.includes('card')
        const padding = isCard ? 12 : 8
        setSpotlight({
          x: rect.left - padding,
          y: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        })

        // ツールチップの位置を計算
        const centerX = rect.left + rect.width / 2
        if (currentStepData.position === 'top') {
          setTooltipStyle({
            bottom: `${window.innerHeight - rect.top + 16}px`,
            left: `${centerX}px`,
            transform: 'translateX(-50%)',
          })
        } else if (currentStepData.position === 'bottom') {
          setTooltipStyle({
            top: `${rect.bottom + 16}px`,
            left: `${centerX}px`,
            transform: 'translateX(-50%)',
          })
        } else if (currentStepData.position === 'center-bottom') {
          // 中央とフッターの間（画面の80%あたり）
          setTooltipStyle({
            top: '80%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          })
        } else if (currentStepData.position === 'top-center') {
          // 上部中央（画面の20%あたり）
          setTooltipStyle({
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          })
        } else {
          // center
          setTooltipStyle({
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          })
        }
      } else if (retryCount < maxRetries) {
        retryCount++
        setTimeout(tryUpdateSpotlight, 100)
      }
    }

    // onEnter実行後、アニメーション完了を待ってからターゲットを探す
    // カードのslide-upアニメーションは0.2s = 200msなので、余裕を持って300ms待つ
    const timeoutId = setTimeout(tryUpdateSpotlight, 300)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [currentStep])

  const handleNext = useCallback(() => {
    // 現在のステップのonExitを実行（次に進む前の準備）
    if (step.onExit && onAction) {
      onAction(step.onExit)
    }

    if (currentStep < TUTORIAL_STEPS.length - 1) {
      // 少し待ってから次のステップに進む（onExitの効果が反映されるのを待つ）
      setTimeout(() => setCurrentStep(prev => prev + 1), 100)
    } else {
      localStorage.setItem(TUTORIAL_KEY, TUTORIAL_VERSION)
      setIsVisible(false)
      setTimeout(onComplete, 300)
    }
  }, [currentStep, step, onAction, onComplete])

  const handleSkip = useCallback(() => {
    localStorage.setItem(TUTORIAL_KEY, TUTORIAL_VERSION)
    setIsVisible(false)
    setTimeout(onComplete, 300)
  }, [onComplete])

  // スポットライトがまだ見つからない場合はローディング表示
  if (!spotlight) {
    return (
      <div class="fixed inset-0 z-[60] bg-slate-950/90 flex items-center justify-center">
        <div class="text-white/50 text-sm">読み込み中...</div>
      </div>
    )
  }

  return (
    <div
      ref={overlayRef}
      class={`fixed inset-0 z-[60] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* クリック用の透明レイヤー */}
      <div class="absolute inset-0 z-0" onClick={handleNext} />

      {/* SVGマスクでスポットライト効果 */}
      <svg class="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={spotlight.x}
              y={spotlight.y}
              width={spotlight.width}
              height={spotlight.height}
              rx="8"
              ry="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(2, 6, 23, 0.85)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* スポットライト枠線 */}
      <div
        class="absolute border-2 border-white/50 rounded-lg pointer-events-none transition-all duration-300"
        style={{
          left: `${spotlight.x}px`,
          top: `${spotlight.y}px`,
          width: `${spotlight.width}px`,
          height: `${spotlight.height}px`,
        }}
      />

      {/* ツールチップ */}
      <div
        class="absolute z-10 flex flex-col items-center w-[85vw] max-w-md px-8 py-4"
        style={tooltipStyle}
        onClick={handleNext}
      >
        <p class="text-white text-lg font-medium text-center whitespace-pre-line mb-4 pointer-events-none w-full">
          {step.title}
        </p>
        {step.description && (
          <p class="text-slate-300 text-sm text-center mb-4 pointer-events-none">
            {step.description}
          </p>
        )}

        {/* ステップインジケーター */}
        <div class="flex gap-2 mb-4 pointer-events-none">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              class={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-white' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* ボタン */}
        <div class="flex gap-3 whitespace-nowrap">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            class="px-6 py-2 bg-white text-slate-900 rounded-full font-medium text-sm hover:bg-slate-100 active:bg-slate-200 transition-colors"
          >
            {isLastStep ? 'はじめる' : '次へ'}
          </button>
          {!isLastStep && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSkip()
              }}
              class="px-4 py-2 text-slate-400 text-sm hover:text-slate-300 transition-colors"
            >
              スキップ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
