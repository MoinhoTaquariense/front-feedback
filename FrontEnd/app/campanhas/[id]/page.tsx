"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Clipboard,
  Link2,
  Send,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionTitle, StatusBadge } from "@/components/product-ui";
import { useAuth } from "@/components/auth-context";

type Convite = {
  id: number;
  tipo: "PUBLICO" | "INDIVIDUAL";
  status: string;
  usos: number;
  expiraEm?: string;
  colaborador?: { id: number; nomecompleto: string; email: string };
};
type Campanha = {
  id: number;
  nome: string;
  status: string;
  anonima: boolean;
  aceitaLinkPublico: boolean;
  aceitaLinkIndividual: boolean;
  encerraEm?: string;
  mensagemPadrao?: string;
  versao?: { numero: number; questionario?: { nome: string } };
  setores?: { id: number; nome: string }[];
  convites: Convite[];
};
type Colaborador = {
  id: number;
  nomecompleto: string;
  email: string;
  setorId?: number;
  setor?: string;
};
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[#c99176]/25";

export default function CampanhaDetalhePage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [campanha, setCampanha] = useState<Campanha | null>(null);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [notice, setNotice] = useState("");
  const [links, setLinks] = useState<{ link: string; mensagem: string }[]>([]);
  const api = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const response = await fetch(`/api/backend${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "Não foi possível concluir a operação");
      return data;
    },
    [token],
  );
  const carregar = useCallback(async () => {
    if (!token || !params.id) return;
    try {
      const [c, p] = await Promise.all([
        api(`/campanhas/${params.id}`),
        api("/colaboradores"),
      ]);
      setCampanha(c.data);
      setColaboradores(p.data || []);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao carregar campanha",
      );
    }
  }, [api, params.id, token]);
  useEffect(() => {
    void carregar();
  }, [carregar]);
  const colaboradoresElegiveis = campanha
    ? colaboradores.filter((pessoa) =>
        (campanha.setores || []).some((setor) => setor.id === pessoa.setorId),
      )
    : [];
  async function gerar(tipo: "PUBLICO" | "INDIVIDUAL") {
    if (!campanha) return;
    try {
      const data = await api(`/campanhas/${campanha.id}/convites`, {
        method: "POST",
        body: JSON.stringify({
          tipo,
          colaboradorIds: tipo === "INDIVIDUAL" ? selecionados : [],
        }),
      });
      setLinks(data.data || []);
      setSelecionados([]);
      setNotice(
        tipo === "PUBLICO"
          ? "Link público gerado."
          : "Convites individuais gerados.",
      );
      await carregar();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao gerar convite",
      );
    }
  }
  async function revogar(conviteId: number) {
    if (!campanha || !window.confirm("Revogar este convite?")) return;
    try {
      await api(`/campanhas/${campanha.id}/convites/${conviteId}/revogar`, {
        method: "POST",
      });
      setNotice("Convite revogado.");
      await carregar();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao revogar convite",
      );
    }
  }
  async function encerrar() {
    if (!campanha || !window.confirm("Encerrar a campanha agora?")) return;
    try {
      await api(`/campanhas/${campanha.id}/encerrar`, { method: "POST" });
      setNotice("Campanha encerrada.");
      await carregar();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao encerrar campanha",
      );
    }
  }
  async function copiar(texto: string) {
    await navigator.clipboard.writeText(texto);
    setNotice("Convite copiado.");
  }
  if (!campanha)
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl">
          <EmptyState
            title="Carregando campanha"
            description={notice || "Buscando as configurações e convites."}
          />
        </div>
      </AppShell>
    );
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-7">
        <Link
          href="/campanhas"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#8b5a46]"
        >
          <ArrowLeft className="size-4" />
          Todas as campanhas
        </Link>
        <section className="rounded-3xl border border-[#e6e9f0] bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold text-[#172033]">
                  {campanha.nome}
                </h1>
                <StatusBadge value={campanha.status} />
              </div>
              <p className="mt-3 text-[#687086]">
                {campanha.versao?.questionario?.nome} · versão{" "}
                {campanha.versao?.numero} ·{" "}
                {campanha.anonima
                  ? "resposta anônima"
                  : "resposta identificada"}
              </p>
              <p className="mt-2 text-sm text-[#8a92a4]">
                Setores:{" "}
                {(campanha.setores || [])
                  .map((setor) => setor.nome)
                  .join(", ") || "sem filtro"}
              </p>
            </div>
            {campanha.status === "ATIVA" && (
              <button
                onClick={() => void encerrar()}
                className={`${button} border border-red-200 bg-white text-red-700 hover:bg-red-50`}
              >
                <Ban className="size-4" />
                Encerrar campanha
              </button>
            )}
          </div>
        </section>
        {notice && (
          <div
            role="status"
            className="rounded-2xl border border-[#ead8ce] bg-[#fff8f4] px-4 py-3 text-sm text-[#704435]"
          >
            {notice}
          </div>
        )}
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="surface p-5 lg:p-6">
            <SectionTitle
              title="Link público"
              description="Compartilhe um único link por mensagem, QR code ou canal de atendimento."
            />
            {campanha.aceitaLinkPublico ? (
              <button
                disabled={campanha.status !== "ATIVA"}
                onClick={() => void gerar("PUBLICO")}
                className={`${button} mt-5 bg-[#5d3a2e] text-white hover:bg-[#4e3026] disabled:opacity-50`}
              >
                <Link2 className="size-4" />
                Gerar link público
              </button>
            ) : (
              <p className="mt-5 text-sm text-[#687086]">
                Esta campanha não aceita link público.
              </p>
            )}
          </section>
          <section className="surface p-5 lg:p-6">
            <SectionTitle
              title="Convites individuais"
              description="Selecione pessoas dos setores desta campanha e gere um link único para cada uma."
            />
            {campanha.aceitaLinkIndividual ? (
              <>
                {colaboradoresElegiveis.length ? (
                  <div className="mt-5 max-h-48 space-y-2 overflow-auto rounded-xl border border-[#e6e9f0] p-3">
                    {colaboradoresElegiveis.map((pessoa) => (
                      <label
                        key={pessoa.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-[#fafbfe]"
                      >
                        <input
                          type="checkbox"
                          checked={selecionados.includes(pessoa.id)}
                          onChange={() =>
                            setSelecionados((atual) =>
                              atual.includes(pessoa.id)
                                ? atual.filter((id) => id !== pessoa.id)
                                : [...atual, pessoa.id],
                            )
                          }
                          className="size-4 accent-[#5d3a2e]"
                        />
                        <span>
                          <strong className="block text-[#172033]">
                            {pessoa.nomecompleto}
                          </strong>
                          <span className="text-xs text-[#687086]">
                            {pessoa.email}
                            {pessoa.setor ? ` · ${pessoa.setor}` : ""}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 rounded-xl bg-[#fafbfe] p-3 text-sm text-[#687086]">
                    Não há colaboradores nos setores desta campanha.
                  </p>
                )}
                <button
                  disabled={campanha.status !== "ATIVA" || !selecionados.length}
                  onClick={() => void gerar("INDIVIDUAL")}
                  className={`${button} mt-4 bg-[#5d3a2e] text-white hover:bg-[#4e3026] disabled:opacity-50`}
                >
                  <Users className="size-4" />
                  Gerar {selecionados.length || ""} convite
                  {selecionados.length === 1 ? "" : "s"}
                </button>
              </>
            ) : (
              <p className="mt-5 text-sm text-[#687086]">
                Esta campanha não aceita convites individuais.
              </p>
            )}
          </section>
        </div>
        {links.length > 0 && (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <SectionTitle
              title="Convites prontos para envio"
              description="Copie a mensagem que já inclui o link correto."
            />
            {links.map((item) => (
              <div key={item.link} className="mt-3 flex gap-2">
                <input
                  readOnly
                  value={item.link}
                  className="h-10 min-w-0 flex-1 rounded-xl border border-emerald-200 bg-white px-3 text-sm"
                />
                <button
                  onClick={() => void copiar(item.mensagem)}
                  className={`${button} border border-emerald-300 bg-white text-emerald-800`}
                >
                  <Clipboard className="size-4" />
                  Copiar
                </button>
              </div>
            ))}
          </section>
        )}
        <section className="surface p-5 lg:p-6">
          <SectionTitle
            title="Convites gerados"
            description={`${campanha.convites.length} convite${campanha.convites.length === 1 ? "" : "s"} registrado${campanha.convites.length === 1 ? "" : "s"} nesta campanha.`}
          />
          {campanha.convites.length ? (
            <div className="mt-5 overflow-x-auto rounded-2xl border border-[#e6e9f0]">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-[#fafbfe] text-xs font-bold uppercase tracking-wide text-[#8a92a4]">
                  <tr>
                    <th className="px-5 py-3">Destinatário</th>
                    <th className="px-5 py-3">Tipo</th>
                    <th className="px-5 py-3">Uso</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {campanha.convites.map((convite) => (
                    <tr key={convite.id} className="border-t border-[#edf0f5]">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#172033]">
                          {convite.colaborador?.nomecompleto || "Link público"}
                        </p>
                        <p className="text-xs text-[#687086]">
                          {convite.colaborador?.email || "Compartilhável"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        {convite.tipo === "PUBLICO" ? "Público" : "Individual"}
                      </td>
                      <td className="px-5 py-4">{convite.usos}</td>
                      <td className="px-5 py-4">
                        <StatusBadge value={convite.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        {convite.status === "ATIVO" && (
                          <button
                            onClick={() => void revogar(convite.id)}
                            className="text-sm font-semibold text-red-700"
                          >
                            Revogar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                title="Nenhum convite gerado"
                description="Ative a campanha e gere um link público ou convites individuais."
              />
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
