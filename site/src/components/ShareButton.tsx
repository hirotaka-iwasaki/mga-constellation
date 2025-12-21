import { useState, useCallback, useMemo, useEffect } from 'preact/hooks'
import type { Constellation, StarPosition } from '../types'

interface ShareButtonProps {
  selectedConstellations: Constellation[]
  positions: StarPosition[]
  titleToIdMap: Map<string, string>
  triggerShare?: boolean
  onShareComplete?: () => void
  hidden?: boolean
}

export function ShareButton({ selectedConstellations, positions, titleToIdMap, triggerShare, onShareComplete, hidden }: ShareButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const showSuccessMessage = useCallback((message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 2000)
  }, [])

  // 位置マップを作成
  const positionMap = useMemo(() => {
    if (!positions) return new Map()
    return new Map(positions.map(p => [p.id, p]))
  }, [positions])

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (selectedConstellations.length === 0) return null

    try {
      const SIZE = 1200
      const PADDING = 80
      const canvas = document.createElement('canvas')
      canvas.width = SIZE
      canvas.height = SIZE
      const ctx = canvas.getContext('2d')!

      // 背景グラデーション
      const gradient = ctx.createLinearGradient(0, 0, 0, SIZE)
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(0.5, '#1e293b')
      gradient.addColorStop(1, '#0f172a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, SIZE, SIZE)

      // 選択された星座の全ての星の座標を収集
      const allPoints: { x: number; y: number; songId: string }[] = []
      selectedConstellations.forEach(constellation => {
        constellation.songs.forEach(title => {
          const songId = titleToIdMap.get(title)
          if (songId) {
            const pos = positionMap.get(songId)
            if (pos) {
              allPoints.push({ x: pos.x, y: pos.y, songId })
            }
          }
        })
      })

      if (allPoints.length === 0) return null

      // バウンディングボックスを計算
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      allPoints.forEach(p => {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
      })

      // 正方形にするため、大きい方に合わせる
      const width = maxX - minX
      const height = maxY - minY
      const size = Math.max(width, height, 10) // 最低サイズ10
      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2

      // パディングを含めた描画範囲
      const viewSize = size * 1.3 // 30%のマージン
      const viewMinX = centerX - viewSize / 2
      const viewMinY = centerY - viewSize / 2

      // 座標変換関数
      const transform = (x: number, y: number) => ({
        x: PADDING + ((x - viewMinX) / viewSize) * (SIZE - PADDING * 2),
        y: PADDING + ((y - viewMinY) / viewSize) * (SIZE - PADDING * 2),
      })

      // 星座線を描画
      selectedConstellations.forEach(constellation => {
        const points: { x: number; y: number }[] = []
        constellation.songs.forEach(title => {
          const songId = titleToIdMap.get(title)
          if (songId) {
            const pos = positionMap.get(songId)
            if (pos) {
              points.push(transform(pos.x, pos.y))
            }
          }
        })

        if (points.length < 2) return

        // 点線で星座線を描画
        ctx.strokeStyle = constellation.color
        ctx.lineWidth = 2
        ctx.setLineDash([8, 8])

        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y)
        }
        ctx.stroke()
        ctx.setLineDash([])
      })

      // 選択された星のIDセット
      const highlightedStarIds = new Set<string>()
      selectedConstellations.forEach(constellation => {
        constellation.songs.forEach(title => {
          const songId = titleToIdMap.get(title)
          if (songId) highlightedStarIds.add(songId)
        })
      })

      // 全ての星を描画（選択されていない星は薄く）
      positions.forEach(pos => {
        const { x, y } = transform(pos.x, pos.y)
        const isHighlighted = highlightedStarIds.has(pos.id)

        if (isHighlighted) {
          // 選択された星：明るく描画
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 20)
          glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
          glowGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)')
          glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.fillStyle = glowGradient
          ctx.beginPath()
          ctx.arc(x, y, 20, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = 'white'
          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // 選択されていない星：薄く描画
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 12)
          glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
          glowGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)')
          glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.fillStyle = glowGradient
          ctx.beginPath()
          ctx.arc(x, y, 12, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // 星座名タグを描画
      ctx.font = 'bold 28px sans-serif'
      let tagX = 40
      const tagY = SIZE - 60

      selectedConstellations.forEach(c => {
        const text = c.name
        const metrics = ctx.measureText(text)
        const padding = 16
        const tagWidth = metrics.width + padding * 2
        const tagHeight = 44

        // タグ背景
        ctx.fillStyle = c.color + '60'
        ctx.beginPath()
        ctx.roundRect(tagX, tagY - tagHeight + 10, tagWidth, tagHeight, 22)
        ctx.fill()

        // タグ枠線
        ctx.strokeStyle = c.color + '80'
        ctx.lineWidth = 2
        ctx.stroke()

        // テキスト
        ctx.fillStyle = c.color
        ctx.fillText(text, tagX + padding, tagY)

        tagX += tagWidth + 12
      })

      // ウォーターマーク
      ctx.font = '20px sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.textAlign = 'right'
      ctx.fillText('#ミセス推し座', SIZE - 24, SIZE - 20)

      return new Promise(resolve => {
        canvas.toBlob(b => resolve(b), 'image/png', 0.95)
      })
    } catch (error) {
      console.error('Failed to generate image:', error)
      return null
    }
  }, [selectedConstellations, positionMap, titleToIdMap])

  const handleShare = useCallback(async () => {
    if (isGenerating || selectedConstellations.length === 0) return
    setIsGenerating(true)

    try {
      const blob = await generateImage()
      if (!blob) {
        setIsGenerating(false)
        return
      }

      const file = new File([blob], 'mga-constellation.png', { type: 'image/png' })

      // Web Share APIが使えるかチェック（ファイル共有対応）
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Mrs. GREEN APPLE 星座マップ',
          text: `${selectedConstellations.map(c => c.name).join('、')}の星座`,
        })
        showSuccessMessage('共有しました')
      } else {
        // ファイル共有非対応の場合はダウンロード
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'mga-constellation.png'
        a.click()
        URL.revokeObjectURL(url)
        showSuccessMessage('保存しました')
      }
    } catch (error) {
      // ユーザーが共有をキャンセルした場合はエラーを無視
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error)
      }
    } finally {
      setIsGenerating(false)
    }
  }, [isGenerating, generateImage, selectedConstellations, showSuccessMessage])

  // 外部からのトリガーに応答
  useEffect(() => {
    if (triggerShare && !isGenerating) {
      handleShare().finally(() => {
        onShareComplete?.()
      })
    }
  }, [triggerShare])

  // 星座が選択されていない場合は非表示
  const hasSelection = selectedConstellations.length > 0

  // hidden指定時はUIを非表示（ロジックのみ）
  if (hidden) {
    return successMessage ? (
      <div class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600/90 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap animate-fade-in-toast">
        {successMessage}
      </div>
    ) : null
  }

  return (
    <div class="flex flex-col gap-2" data-tutorial="share-button">
      {/* 画像共有ボタン */}
      <button
        onClick={handleShare}
        disabled={isGenerating || !hasSelection}
        class={`w-9 h-9 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg flex items-center justify-center active:bg-slate-800 disabled:opacity-50 ${!hasSelection ? 'opacity-30' : ''}`}
        aria-label="画像として共有"
        title={hasSelection ? '画像として共有' : '星座を選択してください'}
      >
        {isGenerating ? (
          <div class="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
        ) : (
          <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      {/* 成功通知 */}
      {successMessage && (
        <div class="absolute top-12 right-0 bg-emerald-600/90 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap animate-fade-in">
          {successMessage}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        @keyframes fade-in-toast {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-toast {
          animation: fade-in-toast 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
