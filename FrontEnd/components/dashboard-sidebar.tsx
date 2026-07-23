"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileQuestion,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Search,
  Send,
  Settings2,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { cn } from "@/lib/utils";

const menu = [
  { icon: LayoutDashboard, label: "Visão geral", href: "/" },
  { icon: Send, label: "Campanhas", href: "/campanhas" },
  { icon: Users, label: "Funcionarios", href: "/colaboradores" },
  { icon: FileQuestion, label: "Questionários", href: "/questionarios" },
  { icon: BarChart3, label: "Resultados", href: "/relatorios" },
  { icon: ClipboardCheck, label: "Planos de ação", href: "/planos-acao" },
];
const management = [
  { icon: Users, label: "Administração", href: "/administracao" },
  { icon: ClipboardCheck, label: "Avaliações legadas", href: "/avaliacoes" },
  { icon: Settings2, label: "Estatísticas", href: "/estatisticas" },
];

type Entry = (typeof menu)[number] | (typeof management)[number];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, papel } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const visibleMenu = useMemo(
    () =>
      menu.filter((entry) =>
        entry.label.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
      ),
    [normalizedSearch],
  );
  const visibleManagement = useMemo(
    () =>
      (papel === "RH_MASTER" ? management : []).filter((entry) =>
        entry.label.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
      ),
    [normalizedSearch],
  );

  function navigationItem(entry: Entry) {
    const active = pathname === entry.href;
    return (
      <Link
        key={entry.href}
        href={entry.href}
        title={!expanded ? entry.label : undefined}
        className={cn(
          "group flex items-center rounded-xl text-sm font-medium transition-all duration-200",
          expanded ? "gap-3 px-3 py-2.5" : "mx-auto size-10 justify-center",
          active
            ? "bg-[#744634] text-white shadow-[0_7px_14px_rgba(116,70,52,0.28)]"
            : "text-[#687086] hover:bg-[#fff3ed] hover:text-[#744634]",
        )}
      >
        <entry.icon className="size-[18px] shrink-0" />
        {expanded && <span className="truncate">{entry.label}</span>}
      </Link>
    );
  }

  return (
    <aside
      aria-label="Navegação principal"
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[#e7e7ef] bg-white py-4 shadow-[8px_0_32px_rgba(44,48,73,0.035)] transition-[width] duration-300 lg:flex",
        expanded ? "w-[250px] px-3" : "w-[76px] px-2",
      )}
    >
      <div
        className={cn(
          "flex items-center",
          expanded ? "justify-between px-2" : "justify-center",
        )}
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="Motasa Feedbacks"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#744634] shadow-[0_5px_10px_rgba(116,70,52,0.24)]">
            <Image
              src="/images/logoMotMenor.png"
              alt=""
              width={23}
              height={23}
              className="object-contain brightness-0 invert"
            />
          </span>
          {expanded && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-[#303244]">
                Motasa
              </span>
              <span className="block truncate text-[11px] text-[#989aad]">
                Feedbacks
              </span>
            </span>
          )}
        </Link>
        {expanded && (
          <span
            className="size-2 rounded-full bg-[#744634]"
            aria-label="Sistema ativo"
          />
        )}
      </div>

      {expanded ? (
        <label className="relative mt-6 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#a3a5b5]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar..."
            className="h-10 w-full rounded-xl border border-transparent bg-[#f7f7fb] pl-9 pr-3 text-sm text-[#303244] outline-none placeholder:text-[#a3a5b5] focus:border-[#dfb7a4] focus:bg-white focus:ring-4 focus:ring-[#744634]/10"
          />
        </label>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="mx-auto mt-6 flex size-10 items-center justify-center rounded-xl bg-[#f7f7fb] text-[#75788b] hover:bg-[#fff3ed] hover:text-[#744634]"
          aria-label="Expandir menu"
          title="Expandir menu"
        >
          <Search className="size-[18px]" />
        </button>
      )}

      <nav className={cn("mt-6 space-y-6", expanded ? "" : "space-y-4")}>
        <section>
          {expanded && (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a6a8b7]">
              Principal
            </p>
          )}
          <div className="space-y-1">{visibleMenu.map(navigationItem)}</div>
        </section>
        <section className={visibleManagement.length ? "" : "hidden"}>
          {expanded && (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a6a8b7]">
              Gestão
            </p>
          )}
          <div className="space-y-1">
            {visibleManagement.map(navigationItem)}
          </div>
        </section>
        {expanded && visibleMenu.length + visibleManagement.length === 0 && (
          <p className="px-3 text-sm text-[#8f91a2]">
            Nenhuma área encontrada.
          </p>
        )}
      </nav>

      <div
        className={cn(
          "mt-auto border-t border-[#eeedf3] pt-3",
          expanded ? "space-y-1" : "space-y-2",
        )}
      >
        <a
          href="https://api.whatsapp.com/send?phone=5551997275633&text=Olá%2C%20preciso%20de%20ajuda%20com%20o%20sistema%20de%20feedbacks"
          target="_blank"
          rel="noopener noreferrer"
          title={!expanded ? "Ajuda" : undefined}
          className={cn(
            "flex items-center rounded-xl text-sm font-medium text-[#747689] hover:bg-[#fff3ed] hover:text-[#744634]",
            expanded ? "gap-3 px-3 py-2.5" : "mx-auto size-10 justify-center",
          )}
        >
          <HelpCircle className="size-[18px] shrink-0" />
          {expanded && "Ajuda e suporte"}
        </a>
        <button
          onClick={logout}
          title={!expanded ? "Sair da conta" : undefined}
          className={cn(
            "flex w-full items-center rounded-xl text-sm font-medium text-[#747689] hover:bg-red-50 hover:text-red-600",
            expanded ? "gap-3 px-3 py-2.5" : "mx-auto size-10 justify-center",
          )}
        >
          <LogOut className="size-[18px] shrink-0" />
          {expanded && "Sair da conta"}
        </button>
        <button
          onClick={() => setExpanded((value) => !value)}
          className={cn(
            "flex w-full items-center rounded-xl text-xs font-semibold text-[#8a8ca0] hover:bg-[#fff3ed] hover:text-[#744634]",
            expanded ? "gap-2 px-3 py-2.5" : "mx-auto size-10 justify-center",
          )}
          aria-label={expanded ? "Recolher menu" : "Expandir menu"}
          title={expanded ? "Recolher menu" : "Expandir menu"}
        >
          {expanded ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
          {expanded && "Recolher menu"}
        </button>
      </div>
    </aside>
  );
}
