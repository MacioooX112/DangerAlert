import { ShieldAlert } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between py-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 border border-primary/20">
          <ShieldAlert className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground text-balance">
            DangerAlert
          </h1>
          <p className="text-xs text-muted-foreground">
            Analiza ryzyka phishingu
          </p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span className="text-xs text-muted-foreground">System aktywny</span>
      </div>
    </header>
  )
}
