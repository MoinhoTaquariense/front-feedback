"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionTitle, StatusBadge } from "@/components/product-ui";
import { useAuth } from "@/components/auth-context";
type Plano = {
  id: number;
  titulo: string;
  prioridade: string;
  status: string;
  prazoEm?: string;
  setor?: { nome: string };
  responsavel?: { id: number; nome: string };
};
type Setor = { id: number; nome: string };
type Responsavel = { id: number; nome: string; email: string };
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition";
export default function PlanosAcaoPage() {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [titulo, setTitulo] = useState(() => searchParams.get("titulo") || "");
  const campanhaId = searchParams.get("campanhaId");
  const origemTipo = searchParams.get("origemTipo");
  const origemReferencia = searchParams.get("origemReferencia");
  const [setorId, setSetorId] = useState("");
  const [prazo, setPrazo] = useState("");
  const [prioridade, setPrioridade] = useState("MEDIA");
  const [responsavelId, setResponsavelId] = useState("");
  const [erro, setErro] = useState("");
  const api = useCallback(
    async (p: string, o: RequestInit = {}) => {
      const r = await fetch(`/api/backend${p}`, {
        ...o,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...o.headers,
        },
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok)
        throw new Error(d.message || "Não foi possível concluir a ação");
      return d;
    },
    [token],
  );
  const carregar = useCallback(async () => {
    if (!token) return;
    try {
      const [p, s, r] = await Promise.all([
        api("/planos-acao"),
        api("/setores"),
        api("/planos-acao/responsaveis"),
      ]);
      setPlanos(p.data || []);
      setSetores(s.data || []);
      setResponsaveis(r.data || []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar planos");
    }
  }, [api, token]);
  useEffect(() => {
    void carregar();
  }, [carregar]);
  async function criar() {
    if (!titulo || !setorId) return setErro("Informe título e setor.");
    try {
      await api("/planos-acao", {
        method: "POST",
        body: JSON.stringify({
          titulo,
          setorId: Number(setorId),
          prioridade,
          prazoEm: prazo || null,
          campanhaId: campanhaId ? Number(campanhaId) : null,
          origemTipo,
          origemReferencia,
          responsavelId: responsavelId ? Number(responsavelId) : null,
        }),
      });
      setTitulo("");
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao criar plano");
    }
  }
  async function avancar(p: Plano) {
    try {
      await api(`/planos-acao/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: p.status === "ABERTA" ? "EM_ANDAMENTO" : "CONCLUIDA",
        }),
      });
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao atualizar plano");
    }
  }
  const hoje = new Date();
  const emTresDias = new Date();
  emTresDias.setDate(hoje.getDate() + 3);
  const pendentes = planos.filter((p) => !["CONCLUIDA", "VALIDADA"].includes(p.status));
  const atrasadas = pendentes.filter((p) => p.prazoEm && new Date(p.prazoEm) < hoje).length;
  const proximas = pendentes.filter((p) => p.prazoEm && new Date(p.prazoEm) >= hoje && new Date(p.prazoEm) <= emTresDias).length;
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="rounded-3xl border border-[#e6e9f0] bg-white p-6">
          <p className="eyebrow">Fechamento do ciclo</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#172033]">
            Planos de ação
          </h1>
          <p className="mt-3 text-[#687086]">
            Transforme alertas em responsáveis, prazos e entregas acompanháveis.
          </p>
        </section>
        {(atrasadas > 0 || proximas > 0) && <section className="grid gap-3 sm:grid-cols-2">{atrasadas > 0 && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><strong>{atrasadas}</strong> ação(ões) com prazo vencido.</div>}{proximas > 0 && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><strong>{proximas}</strong> ação(ões) vencem nos próximos 3 dias.</div>}</section>}
        {erro && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}
        <section className="surface p-5">
          <SectionTitle title="Nova ação" />
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ação necessária"
              className="h-11 rounded-xl border px-3 md:col-span-2"
            />
            <select
              value={responsavelId}
              onChange={(event) => setResponsavelId(event.target.value)}
              className="h-11 rounded-xl border px-3 text-sm"
            >
              <option value="">Responsável</option>
              {responsaveis.map((responsavel) => (
                <option key={responsavel.id} value={responsavel.id}>
                  {responsavel.nome}
                </option>
              ))}
            </select>
            <select
              value={setorId}
              onChange={(e) => setSetorId(e.target.value)}
              className="h-11 rounded-xl border px-3"
            >
              <option value="">Setor</option>
              {setores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
            <select
              value={prioridade}
              onChange={(event) => setPrioridade(event.target.value)}
              className="h-11 rounded-xl border px-3 text-sm"
            >
              <option value="BAIXA">Prioridade baixa</option>
              <option value="MEDIA">Prioridade média</option>
              <option value="ALTA">Prioridade alta</option>
              <option value="CRITICA">Prioridade crítica</option>
            </select>
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="h-11 rounded-xl border px-3"
            />
            <button
              onClick={() => void criar()}
              className={`${button} bg-[#5d3a2e] text-white`}
            >
              <Plus className="size-4" />
              Criar
            </button>
          </div>
        </section>
        <section className="grid gap-5 lg:grid-cols-3">
          {["ABERTA", "EM_ANDAMENTO", "BLOQUEADA", "CONCLUIDA", "VALIDADA"].map(
            (status) => (
              <article key={status} className="surface p-5">
                <SectionTitle title={status.replaceAll("_", " ")} />
                <div className="mt-4 space-y-3">
                  {planos
                    .filter((p) => p.status === status)
                    .map((p) => (
                      <div key={p.id} className="rounded-xl border p-4">
                        <div className="flex justify-between gap-2">
                          <p className="font-semibold">{p.titulo}</p>
                          <StatusBadge value={p.status} />
                        </div>
                        <p className="mt-2 text-xs text-[#687086]">
                          {p.setor?.nome} · {p.prioridade}
                        </p>
                        {p.prazoEm && (
                          <p className={`mt-1 text-xs ${new Date(p.prazoEm) < hoje && !["CONCLUIDA", "VALIDADA"].includes(p.status) ? "font-semibold text-red-700" : ""}`}>
                            Prazo:{" "}
                            {new Date(p.prazoEm).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                        {!["CONCLUIDA", "VALIDADA"].includes(p.status) && (
                          <button
                            onClick={() => void avancar(p)}
                            className="mt-3 inline-flex gap-1 text-xs font-semibold text-[#8a5a48]"
                          >
                            <CheckCircle2 className="size-3.5" />
                            {p.status === "ABERTA" ? "Iniciar" : "Concluir"}
                          </button>
                        )}
                      </div>
                    ))}
                  {!planos.some((p) => p.status === status) && (
                    <p className="text-sm text-[#8a92a4]">Sem ações.</p>
                  )}
                </div>
              </article>
            ),
          )}
        </section>
        {!planos.length && (
          <EmptyState
            title="Nenhum plano de ação"
            description="Crie uma ação a partir de um alerta ou resultado."
          />
        )}
      </div>
    </AppShell>
  );
}
