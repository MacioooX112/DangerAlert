"use client"

import { useEffect, useRef, useState } from "react"

interface RiskGaugeProps {
  score: number | null
  isAnalyzing: boolean
}

function getScoreColor(score: number): string {
  if (score <= 25) return "#22c55e"
  if (score <= 50) return "#eab308"
  if (score <= 75) return "#f97316"
  return "#ef4444"
}

function getScoreLabel(score: number): string {
  if (score <= 15) return "Bezpieczna"
  if (score <= 35) return "Niskie ryzyko"
  if (score <= 55) return "Umiarkowane"
  if (score <= 75) return "Wysokie ryzyko"
  return "Krytyczne"
}

function getScoreDescription(score: number): string {
  if (score <= 15) return "Ta wiadomość wygląda na prawidłową."
  if (score <= 35) return "Wykryto drobne podejrzane wskaźniki."
  if (score <= 55) return "Znaleziono kilka oznak phishingu."
  if (score <= 75) return "Silne oznaki próby phishingu."
  return "Bardzo wysokie prawdopodobieństwo ataku phishingowego!"
}

export function RiskGauge({ score, isAnalyzing }: RiskGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (score === null) {
      setDisplayScore(0)
      return
    }

    let start = 0
    const end = score
    const duration = 1200
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (end - start) * eased)
      setDisplayScore(current)
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [score])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const radius = size / 2 - 20
    const lineWidth = 14

    ctx.clearRect(0, 0, size, size)

    const startAngle = 0.75 * Math.PI
    const endAngle = 2.25 * Math.PI

    ctx.beginPath()
    ctx.arc(center, center, radius, startAngle, endAngle)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)"
    ctx.lineWidth = lineWidth
    ctx.lineCap = "round"
    ctx.stroke()

    if (score !== null && displayScore > 0) {
      const scoreAngle = startAngle + (displayScore / 100) * (endAngle - startAngle)

      const gradient = ctx.createConicGradient(startAngle, center, center)
      gradient.addColorStop(0, "#22c55e")
      gradient.addColorStop(0.25, "#84cc16")
      gradient.addColorStop(0.5, "#eab308")
      gradient.addColorStop(0.75, "#f97316")
      gradient.addColorStop(1, "#ef4444")

      ctx.beginPath()
      ctx.arc(center, center, radius, startAngle, scoreAngle)
      ctx.strokeStyle = gradient
      ctx.lineWidth = lineWidth
      ctx.lineCap = "round"
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(center, center, radius, startAngle, scoreAngle)
      ctx.strokeStyle = getScoreColor(displayScore)
      ctx.lineWidth = lineWidth + 8
      ctx.lineCap = "round"
      ctx.globalAlpha = 0.15
      ctx.filter = "blur(8px)"
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.filter = "none"
    }
  }, [displayScore, score])

  const hasScore = score !== null

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={260}
          height={260}
          className="w-[260px] h-[260px]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-sm text-muted-foreground">
                Analizowanie...
              </span>
            </div>
          ) : hasScore ? (
            <>
              <span
                className="text-5xl font-bold tracking-tight transition-colors duration-500 font-mono"
                style={{ color: getScoreColor(displayScore) }}
              >
                {displayScore}
              </span>
              <span className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
                Wynik ryzyka
              </span>
            </>
          ) : (
            <>
              <span className="text-5xl font-bold text-muted-foreground/30 font-mono">
                --
              </span>
              <span className="text-xs text-muted-foreground/50 mt-1 uppercase tracking-widest">
                Oczekiwanie na dane
              </span>
            </>
          )}
        </div>
      </div>

      {hasScore && !isAnalyzing && (
        <div className="text-center space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border"
            style={{
              color: getScoreColor(score),
              borderColor: `${getScoreColor(score)}33`,
              backgroundColor: `${getScoreColor(score)}0d`,
            }}
          >
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: getScoreColor(score) }}
            />
            {getScoreLabel(score)}
          </div>
          <p className="text-sm text-muted-foreground max-w-[240px]">
            {getScoreDescription(score)}
          </p>
        </div>
      )}
    </div>
  )
}