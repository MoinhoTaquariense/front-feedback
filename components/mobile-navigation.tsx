"use client";

import {
  BarChart3,
  FileQuestion,
  LayoutDashboard,
  Send,
  Settings2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Início", icon: LayoutDashboard },
  { href: "/campanhas", label: "Campanhas", icon: Send },
  { href: "/colaboradores", label: "Pessoas", icon: Users },
  { href: "/questionarios", label: "Pesquisas", icon: FileQuestion },
  { href: "/relatorios", label: "Resultados", icon: BarChart3 },
  { href: "/administracao", label: "Admin", icon: Settings2 },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const { papel } = useAuth();
  const visibleItems =
    papel === "RH_MASTER"
      ? items
      : items.filter((item) => item.href !== "/administracao");
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[#dce2eb] bg-white/95 px-1 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-1 shadow-[0_-8px_24px_rgba(23,32,51,0.08)] backdrop-blur lg:hidden"
    >
      {visibleItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold",
              active ? "text-[#5d3a2e]" : "text-[#7b8496]",
            )}
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-lg",
                active && "bg-[#fff1e9]",
              )}
            >
              <item.icon className="size-4" />
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
