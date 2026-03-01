"use client"

import { useState, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { EmailInput } from "@/components/email-input"
import { RiskGauge } from "@/components/risk-gauge"
import { analyzeEmail } from "@/lib/analyze-email"

export default function PhishingDashboard() {
  const [score, setScore] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [flags, setFlags] = useState<string[]>([])

  const handleAnalyze = useCallback((content: string, adress: string) => {
    setIsAnalyzing(true)
    setScore(null)
    setFlags([])

    // Symulacja opóźnienia analizy (UX)
    setTimeout(() => {
      const result = analyzeEmail(content, adress)
      setScore(result.score)
      setFlags(result.flags)
      setIsAnalyzing(false)
    }, 1500)
  }, [])

  const handleClear = useCallback(() => {
    setScore(null)
    setFlags([])
    setIsAnalyzing(false)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Subtelne tło dekoracyjne */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent pointer-events-none" />

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <DashboardHeader />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Panel wprowadzania wiadomości */}
          <div className="rounded-xl border border-border bg-card p-6">
            <EmailInput
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              hasResult={score !== null}
              onClear={handleClear}
            />
          </div>

          {/* Panel oceny ryzyka */}
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 w-full">
              <h2 className="text-sm font-medium text-foreground">
                Ocena zagrożenia
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            <RiskGauge score={score} isAnalyzing={isAnalyzing} />

            {/* Wykryte wskaźniki */}
            {flags.length > 0 && !isAnalyzing && (
              <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Wykryte wskaźniki ryzyka
                  </h3>
                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-destructive/10 px-1.5 text-[10px] font-medium text-destructive">
                    {flags.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {flags.map((flag) => (
                    <span
                      key={flag}
                      className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground border border-border"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stan początkowy */}
            {score === null && !isAnalyzing && (
              <p className="text-xs text-muted-foreground/50 text-center max-w-[240px]">
                Wklej wiadomość e-mail w polu po lewej stronie i kliknij
                „Analizuj ryzyko”, aby rozpocząć ocenę zagrożenia.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}