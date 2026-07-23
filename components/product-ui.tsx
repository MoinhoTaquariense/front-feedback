import type { ReactNode } from "react"
import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatusBadge({ value }: { value: string }) {
  const label = value.replaceAll("_", " ").toLowerCase()
  const tone = value === "ATIVA" || value === "PUBLICADA" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : value === "ENCERRADA" || value === "ARQUIVADA" ? "bg-slate-100 text-slate-600 ring-slate-500/20" : "bg-amber-50 text-amber-700 ring-amber-600/20"
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset", tone)}>{label}</span>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-[#d9deea] bg-[#fafbfe] px-6 py-12 text-center"><div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-white text-[#5d3a2e] shadow-sm"><Inbox className="size-5" /></div><h3 className="mt-4 font-semibold text-[#172033]">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#687086]">{description}</p>{action && <div className="mt-5">{action}</div>}</div>
}

export function SectionTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-base font-semibold text-[#172033]">{title}</h2>{description && <p className="mt-1 text-sm text-[#687086]">{description}</p>}</div>{action}</div>
}
