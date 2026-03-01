"use client"

import { useState, useRef } from "react"
import { ShieldCheck, Trash2, ClipboardPaste } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmailInputProps {
  onAnalyze: (content: string, adress: string) => void
  isAnalyzing: boolean
  hasResult: boolean
  onClear: () => void
}

export function EmailInput({ onAnalyze, isAnalyzing, hasResult, onClear }: EmailInputProps) {
  const [emailContent, setEmailContent] = useState("")
  const [emailAdress, setEmailAdress] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleAnalyze() {
    if (emailContent.trim().length === 0 || emailAdress.trim().length === 0) return
    onAnalyze(emailContent, emailAdress)
  }

  function handleClear() {
    setEmailContent("")
    setEmailAdress("")
    onClear()
    textareaRef.current?.focus()
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      setEmailContent(text)
      textareaRef.current?.focus()
    } catch {
      textareaRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleAnalyze()
    }
  }

  const charCount = emailContent.length
  const canAnalyze = emailContent.trim().length > 10

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <label htmlFor="email-adress" className="text-sm font-medium text-foreground">
          Adres nadawcy
        </label>
        <div className="relative flex-1 min-h-0 px-8">
          <input
            type="text"
            id="email-adress"
            value={emailAdress}
            onChange={(e) => setEmailAdress(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Adres e-mail nadawcy"
            className="w-full h-10 resize-none rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/50 transition-all font-mono leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>

      <label htmlFor="email-content" className="text-sm font-medium text-foreground">
        Treść wiadomości
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePaste}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Wklej ze schowka"
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          Wklej
        </button>

        {emailContent.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            aria-label="Wyczyść treść wiadomości"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Wyczyść
          </button>
        )}
      </div>

      <div className="relative flex-1 min-h-0">
        <textarea
          ref={textareaRef}
          id="email-content"
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Wklej pełną treść wiadomości, włącznie z nagłówkami, tematem i treścią...\n\nPrzykład:\nOd: support@bank-secure.com\nTemat: Pilne: Twoje konto zostało naruszone\n\nDrogi Kliencie,\nWykryliśmy nieautoryzowaną próbę logowania do Twojego konta...`}
          className="w-full h-full min-h-[280px] resize-none rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/50 transition-all font-mono leading-relaxed"
          spellCheck={false}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground tabular-nums">
          {charCount.toLocaleString()} znaków
        </span>

        <div className="flex items-center gap-3">
          {hasResult && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Resetuj
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            className="min-w-[140px] cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <div className="h-4 w-4 mr-1.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                Analizowanie...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-1.5" />
                Analizuj ryzyko
              </>
            )}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/60">
        Naciśnij{" "}
        <kbd className="inline-flex items-center rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          Ctrl + Enter
        </kbd>{" "}
        aby szybko rozpocząć analizę
      </p>
    </div>
  )
}