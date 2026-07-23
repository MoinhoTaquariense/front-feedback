"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  BellRing,
  ClipboardList,
  Gauge,
  RefreshCw,
  RotateCcw,
  Send,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionTitle } from "@/components/product-ui";
import { useAuth } from "@/components/auth-context";

type Tendencia = { data: string; respostas: number };
type Resumo = {
  respostas: number;
  campanhas: number;
  convites: number;
  media: string | number;
  taxa_resposta: string | number;
  tendencia: Tendencia[];
};
type Variacao = { valor: number; percentual: number | null };
type Alerta = {
  tipo: "ADESAO_BAIXA" | "SATISFACAO_CRITICA" | "PRAZO_PROXIMO";
  severidade: "ALTA" | "MEDIA" | "BAIXA";
  campanhaId: number;
  campanha: string;
  titulo: string;
  descricao: string;
};
type Insights = {
  periodo: { inicio: string; fim: string; dias: number };
  atual: {
    respostas: number;
    campanhas: number;
    convites: number;
    media: string | number;
    taxa_resposta: string | number;
  };
  anterior: {
    respostas: number;
    campanhas: number;
    convites: number;
    media: string | number;
    taxa_resposta: string | number;
  };
  variacoes: { respostas: Variacao; taxaResposta: Variacao; media: Variacao };
  metasConfiguradas?: number;
  alertas: Alerta[];
};
type Pergunta = {
  id: number;
  texto: string;
  tipo: string;
  respostas: number;
  media: string | number;
};
type SetorResultado = {
  id: number;
  nome: string;
  respostas: number;
  media: string | number;
};
type Comentario = {
  pergunta: string;
  texto: string;
  data: string;
  sentimento: "POSITIVO" | "NEUTRO" | "NEGATIVO";
};
type ComentariosData = {
  minimo: number;
  respostas: number;
  comentarios: Comentario[];
  sentimentos: Record<Comentario["sentimento"], number>;
};
type Setor = { id: number; nome: string };
type Campanha = { id: number; nome: string };
type MetaIndicador = {
  id: number;
  indicador: "TAXA_RESPOSTA" | "MEDIA";
  alvo: string | number;
  setor?: { id: number; nome: string } | null;
  campanha?: { id: number; nome: string } | null;
};
type Filtros = { periodo: string; setorId: string; campanhaId: string };
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[#c99176]/25";

function initialFilters(): Filtros {
  if (typeof window === "undefined")
    return { periodo: "30", setorId: "", campanhaId: "" };
  const query = new URLSearchParams(window.location.search);
  return {
    periodo: query.get("periodo") || "30",
    setorId: query.get("setorId") || "",
    campanhaId: query.get("campanhaId") || "",
  };
}

function textoVariacao(variacao?: Variacao, unidade = "") {
  if (!variacao) return "Sem período anterior";
  if (variacao.percentual === null) return "Primeiro período com dados";
  const sinal = variacao.valor > 0 ? "+" : "";
  return `${sinal}${variacao.valor}${unidade} vs. período anterior`;
}

export default function RelatoriosPage() {
  const { token } = useAuth();
  const [filtros, setFiltros] = useState<Filtros>(initialFilters);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [setoresResultado, setSetoresResultado] = useState<SetorResultado[]>(
    [],
  );
  const [comentariosData, setComentariosData] =
    useState<ComentariosData | null>(null);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [metas, setMetas] = useState<MetaIndicador[]>([]);
  const [metaForm, setMetaForm] = useState({
    escopo: "SETOR",
    setorId: "",
    campanhaId: "",
    indicador: "TAXA_RESPOSTA",
    alvo: "60",
  });
  const [salvandoMeta, setSalvandoMeta] = useState(false);
  const [periodicidade, setPeriodicidade] = useState<
    "DIA" | "MES" | "TRIMESTRE"
  >("DIA");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const api = useCallback(
    async (path: string) => {
      const response = await fetch(`/api/backend${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "Erro ao consultar relatório");
      return data;
    },
    [token],
  );
  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filtros.campanhaId) params.set("campanhaId", filtros.campanhaId);
    if (filtros.setorId) params.set("setorId", filtros.setorId);
    if (filtros.periodo !== "todos") {
      const inicio = new Date();
      inicio.setDate(inicio.getDate() - Number(filtros.periodo));
      params.set("inicio", inicio.toISOString().slice(0, 10));
    }
    return params.toString();
  }, [filtros]);
  useEffect(() => {
    const params = new URLSearchParams();
    if (filtros.periodo !== "30") params.set("periodo", filtros.periodo);
    if (filtros.setorId) params.set("setorId", filtros.setorId);
    if (filtros.campanhaId) params.set("campanhaId", filtros.campanhaId);
    const value = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${value ? `?${value}` : ""}`,
    );
  }, [filtros]);
  const carregar = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const suffix = query ? `?${query}` : "";
      const [
        resumoData,
        perguntasData,
        setoresResultadoData,
        setoresData,
        campanhasData,
        comentariosResultado,
        insightsData,
        metasData,
      ] = await Promise.all([
        api(`/relatorios/resumo${suffix}`),
        api(`/relatorios/perguntas${suffix}`),
        api(`/relatorios/setores${suffix}`),
        api("/setores"),
        api("/campanhas"),
        api(`/relatorios/comentarios${suffix}`),
        api(`/relatorios/insights${suffix}`),
        api("/metas-indicadores"),
      ]);
      setResumo(resumoData.data);
      setPerguntas(perguntasData.data || []);
      setSetoresResultado(setoresResultadoData.data || []);
      setSetores(setoresData.data || []);
      setCampanhas(campanhasData.data || []);
      setComentariosData(comentariosResultado.data);
      setInsights(insightsData.data);
      setMetas(metasData.data || []);
      setErro("");
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao carregar resultados",
      );
    } finally {
      setLoading(false);
    }
  }, [api, query, token]);
  useEffect(() => {
    void carregar();
  }, [carregar]);
  async function exportar() {
    try {
      const response = await fetch(
        `/api/backend/relatorios/exportacao${query ? `?${query}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error("Não foi possível exportar");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "relatorio-avaliacoes.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao exportar");
    }
  }
  async function salvarMeta(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvandoMeta(true);
    try {
      const response = await fetch("/api/backend/metas-indicadores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          indicador: metaForm.indicador,
          alvo: Number(metaForm.alvo),
          setorId:
            metaForm.escopo === "SETOR" && metaForm.setorId
              ? Number(metaForm.setorId)
              : null,
          campanhaId:
            metaForm.escopo === "CAMPANHA" && metaForm.campanhaId
              ? Number(metaForm.campanhaId)
              : null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "N\u00e3o foi poss\u00edvel salvar a meta");
      setMetaForm((atual) => ({
        ...atual,
        alvo: atual.indicador === "TAXA_RESPOSTA" ? "60" : "4",
      }));
      await carregar();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "N\u00e3o foi poss\u00edvel salvar a meta",
      );
    } finally {
      setSalvandoMeta(false);
    }
  }
  async function removerMeta(id: number) {
    try {
      const response = await fetch(`/api/backend/metas-indicadores/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "N\u00e3o foi poss\u00edvel remover a meta");
      await carregar();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "N\u00e3o foi poss\u00edvel remover a meta",
      );
    }
  }
  const cards = resumo
    ? [
        {
          label: "Respostas recebidas",
          value: resumo.respostas,
          icon: ClipboardList,
          detail: textoVariacao(insights?.variacoes.respostas),
        },
        {
          label: "Campanhas",
          value: resumo.campanhas,
          icon: Send,
          detail: "Com resultados no período",
        },
        {
          label: "Taxa de resposta",
          value: `${resumo.taxa_resposta}%`,
          icon: Gauge,
          detail: `${textoVariacao(insights?.variacoes.taxaResposta, " p.p.")} · ${resumo.convites} convites`,
        },
        {
          label: "Média das escalas",
          value: resumo.media,
          icon: TrendingUp,
          detail: textoVariacao(insights?.variacoes.media),
        },
      ]
    : [];
  const tendenciaHistorica = useMemo(() => {
    const grupos = new Map<
      string,
      { data: string; respostas: number; rotulo: string }
    >();
    (resumo?.tendencia || []).forEach((item) => {
      const data = new Date(`${item.data}T12:00:00`);
      const ano = data.getFullYear();
      const mes = data.getMonth();
      const trimestre = Math.floor(mes / 3) + 1;
      const chave =
        periodicidade === "DIA"
          ? item.data
          : periodicidade === "MES"
            ? `${ano}-${String(mes + 1).padStart(2, "0")}`
            : `${ano}-T${trimestre}`;
      const rotulo =
        periodicidade === "DIA"
          ? data.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            })
          : periodicidade === "MES"
            ? data.toLocaleDateString("pt-BR", {
                month: "short",
                year: "2-digit",
              })
            : `${trimestre}º tri. ${ano}`;
      const existente = grupos.get(chave) || {
        data: chave,
        respostas: 0,
        rotulo,
      };
      existente.respostas += Number(item.respostas);
      grupos.set(chave, existente);
    });
    return [...grupos.values()].sort((a, b) => a.data.localeCompare(b.data));
  }, [periodicidade, resumo?.tendencia]);
  const maiorTendencia = Math.max(
    ...tendenciaHistorica.map((item) => item.respostas),
    1,
  );
  const maiorSetor = Math.max(
    ...setoresResultado.map((item) => Number(item.respostas)),
    1,
  );
  const pontoAtencao = perguntas
    .filter(
      (pergunta) =>
        ["ESCALA_5", "NPS"].includes(pergunta.tipo) &&
        Number(pergunta.media) > 0,
    )
    .sort((a, b) => Number(a.media) - Number(b.media))[0];
  const setoresComMedia = setoresResultado
    .filter((setor) => Number(setor.media) > 0)
    .sort((a, b) => Number(b.media) - Number(a.media));
  const melhorSetor = setoresComMedia[0];
  const setorEmAtencao = setoresComMedia.at(-1);
  const filtrosAtivos =
    filtros.periodo !== "30" || filtros.setorId || filtros.campanhaId;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="rounded-3xl border border-[#e6e9f0] bg-white p-6 shadow-[0_12px_32px_rgba(23,32,51,0.05)] lg:p-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow">Resultados e insights</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172033]">
                Descubra onde agir primeiro
              </h1>
              <p className="mt-3 max-w-2xl leading-6 text-[#687086]">
                Compare campanhas e setores, acompanhe a evolução e exporte
                exatamente o recorte que está analisando.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => void carregar()}
                disabled={loading}
                className={`${button} border border-[#d9deea] bg-white text-[#344054] hover:bg-[#f3f5f8]`}
              >
                <RefreshCw
                  className={`size-4 ${loading ? "animate-spin" : ""}`}
                />
                Atualizar
              </button>
              <button
                onClick={() => void exportar()}
                className={`${button} bg-[#5d3a2e] text-white hover:bg-[#4e3026]`}
              >
                <ArrowDownToLine className="size-4" />
                Exportar CSV
              </button>
            </div>
          </div>
        </section>
        <section className="surface p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="mr-auto">
              <p className="text-sm font-semibold text-[#172033]">
                Recorte dos resultados
              </p>
              <p className="mt-0.5 text-xs text-[#8a92a4]">
                Os filtros ficam na URL para facilitar o compartilhamento
                interno.
              </p>
            </div>
            <select
              value={filtros.periodo}
              onChange={(event) =>
                setFiltros((atual) => ({
                  ...atual,
                  periodo: event.target.value,
                }))
              }
              className="h-10 rounded-xl border border-[#d9deea] bg-white px-3 text-sm text-[#344054]"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="todos">Todo o período</option>
            </select>
            <select
              value={filtros.setorId}
              onChange={(event) =>
                setFiltros((atual) => ({
                  ...atual,
                  setorId: event.target.value,
                }))
              }
              className="h-10 rounded-xl border border-[#d9deea] bg-white px-3 text-sm text-[#344054]"
            >
              <option value="">Todos os setores</option>
              {setores.map((setor) => (
                <option key={setor.id} value={setor.id}>
                  {setor.nome}
                </option>
              ))}
            </select>
            {filtrosAtivos && (
              <button
                onClick={() =>
                  setFiltros({ periodo: "30", setorId: "", campanhaId: "" })
                }
                className={`${button} border border-[#d9deea] bg-white text-[#344054] hover:bg-[#f3f5f8]`}
              >
                <RotateCcw className="size-4" />
                Limpar filtros
              </button>
            )}
            <select
              value={filtros.campanhaId}
              onChange={(event) =>
                setFiltros((atual) => ({
                  ...atual,
                  campanhaId: event.target.value,
                }))
              }
              className="h-10 max-w-52 rounded-xl border border-[#d9deea] bg-white px-3 text-sm text-[#344054]"
            >
              <option value="">Todas as campanhas</option>
              {campanhas.map((campanha) => (
                <option key={campanha.id} value={campanha.id}>
                  {campanha.nome}
                </option>
              ))}
            </select>
          </div>
        </section>
        <section className="surface p-5 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-[#172033]">
                Metas e limites de alerta
              </p>
              <p className="mt-1 text-sm text-[#687086]">
                Defina a adesão ou média esperada por setor ou campanha. A meta
                da campanha tem prioridade sobre a do setor.
              </p>
            </div>
            <span className="rounded-full bg-[#f4eee9] px-3 py-1 text-xs font-semibold text-[#704435]">
              {metas.length}{" "}
              {metas.length === 1 ? "meta ativa" : "metas ativas"}
            </span>
          </div>
          <form
            onSubmit={(event) => void salvarMeta(event)}
            className="mt-5 grid gap-3 md:grid-cols-5"
          >
            <select
              value={metaForm.escopo}
              onChange={(event) =>
                setMetaForm((atual) => ({
                  ...atual,
                  escopo: event.target.value,
                }))
              }
              className="h-11 rounded-xl border border-[#d9deea] bg-white px-3 text-sm text-[#344054]"
            >
              <option value="SETOR">Por setor</option>
              <option value="CAMPANHA">Por campanha</option>
            </select>
            {metaForm.escopo === "SETOR" ? (
              <select
                required
                value={metaForm.setorId}
                onChange={(event) =>
                  setMetaForm((atual) => ({
                    ...atual,
                    setorId: event.target.value,
                  }))
                }
                className="h-11 rounded-xl border border-[#d9deea] bg-white px-3 text-sm text-[#344054]"
              >
                <option value="">Selecione o setor</option>
                {setores.map((setor) => (
                  <option key={setor.id} value={setor.id}>
                    {setor.nome}
                  </option>
                ))}
              </select>
            ) : (
              <select
                required
                value={metaForm.campanhaId}
                onChange={(event) =>
                  setMetaForm((atual) => ({
                    ...atual,
                    campanhaId: event.target.value,
                  }))
                }
                className="h-11 rounded-xl border border-[#d9deea] bg-white px-3 text-sm text-[#344054]"
              >
                <option value="">Selecione a campanha</option>
                {campanhas.map((campanha) => (
                  <option key={campanha.id} value={campanha.id}>
                    {campanha.nome}
                  </option>
                ))}
              </select>
            )}
            <select
              value={metaForm.indicador}
              onChange={(event) =>
                setMetaForm((atual) => ({
                  ...atual,
                  indicador: event.target.value,
                  alvo: event.target.value === "TAXA_RESPOSTA" ? "60" : "4",
                }))
              }
              className="h-11 rounded-xl border border-[#d9deea] bg-white px-3 text-sm text-[#344054]"
            >
              <option value="TAXA_RESPOSTA">Adesão (%)</option>
              <option value="MEDIA">Média (0 a 5)</option>
            </select>
            <input
              required
              type="number"
              min="0"
              max={metaForm.indicador === "TAXA_RESPOSTA" ? 100 : 5}
              step="0.1"
              value={metaForm.alvo}
              onChange={(event) =>
                setMetaForm((atual) => ({ ...atual, alvo: event.target.value }))
              }
              placeholder="Meta"
              className="h-11 rounded-xl border border-[#d9deea] bg-white px-3 text-sm text-[#344054]"
            />
            <button
              disabled={salvandoMeta}
              className={`${button} bg-[#5d3a2e] text-white hover:bg-[#4e3026] disabled:opacity-60`}
            >
              {salvandoMeta ? "Salvando..." : "Salvar meta"}
            </button>
          </form>
          {metas.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {metas.map((meta) => (
                <div
                  key={meta.id}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#e6e9f0] bg-[#fafbfe] px-3 py-2 text-xs text-[#4c5568]"
                >
                  <span className="font-semibold text-[#172033]">
                    {meta.campanha?.nome || meta.setor?.nome || "Escopo"}
                  </span>
                  <span>
                    {meta.indicador === "TAXA_RESPOSTA"
                      ? `Adesão ≥ ${meta.alvo}%`
                      : `Média ≥ ${meta.alvo}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => void removerMeta(meta.id)}
                    className="font-semibold text-[#a4512e] hover:text-[#7a3e27]"
                    aria-label="Remover meta"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        {erro && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {erro}
          </div>
        )}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article key={card.label} className="surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#687086]">
                    {card.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-[#172033]">
                    {loading ? "..." : String(card.value ?? 0)}
                  </p>
                  <p className="mt-2 text-xs text-[#8a92a4]">{card.detail}</p>
                </div>
                <div className="rounded-xl bg-[#fff1e9] p-2.5 text-[#7a4937]">
                  <card.icon className="size-5" />
                </div>
              </div>
            </article>
          ))}
        </section>
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
          <article className="surface p-5 lg:p-6">
            <SectionTitle
              title="Comparativo histórico"
              description={
                insights
                  ? `Comparação com os ${insights.periodo.dias} dias anteriores ao recorte atual.`
                  : "Calculando a comparação entre períodos."
              }
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Respostas",
                  value: insights?.variacoes.respostas,
                  suffix: "",
                },
                {
                  label: "Taxa de resposta",
                  value: insights?.variacoes.taxaResposta,
                  suffix: " p.p.",
                },
                {
                  label: "Média numérica",
                  value: insights?.variacoes.media,
                  suffix: "",
                },
              ].map((item) => {
                const positivo = (item.value?.valor || 0) >= 0;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[#e6e9f0] bg-[#fafbfe] p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8a92a4]">
                      {item.label}
                    </p>
                    <div
                      className={`mt-3 flex items-center gap-1.5 text-xl font-semibold ${positivo ? "text-[#287a4b]" : "text-[#b54708]"}`}
                    >
                      {positivo ? (
                        <ArrowUpRight className="size-4" />
                      ) : (
                        <ArrowDownRight className="size-4" />
                      )}
                      {item.value
                        ? `${item.value.valor > 0 ? "+" : ""}${item.value.valor}${item.suffix}`
                        : "—"}
                    </div>
                    <p className="mt-1.5 text-xs text-[#687086]">
                      {item.value?.percentual === null
                        ? "Sem base anterior"
                        : item.value
                          ? `${item.value.percentual! > 0 ? "+" : ""}${item.value.percentual}% de variação`
                          : "Carregando"}
                    </p>
                  </div>
                );
              })}
            </div>
          </article>
          <article className="rounded-2xl border border-[#ead8ce] bg-[#fffaf7] p-5 lg:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-[#fff1e9] p-2.5 text-[#a4512e]">
                <BellRing className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-[#172033]">
                  Alertas prioritários
                </p>
                <p className="mt-1 text-sm text-[#704435]">
                  Sinais que pedem acompanhamento antes do encerramento da
                  coleta.
                </p>
              </div>
            </div>
            {insights?.alertas.length ? (
              <div className="mt-5 space-y-3">
                {insights.alertas.map((alerta) => (
                  <div
                    key={`${alerta.tipo}-${alerta.campanhaId}`}
                    className="rounded-xl border border-[#ead8ce] bg-white/75 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#172033]">
                        {alerta.titulo}
                      </p>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${alerta.severidade === "ALTA" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        {alerta.severidade}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-[#8a5a48]">
                      {alerta.campanha}
                    </p>
                    <p className="mt-2 text-sm leading-5 text-[#704435]">
                      {alerta.descricao}
                    </p>
                    <Link
                      href={`/planos-acao?campanhaId=${alerta.campanhaId}&origemTipo=ALERTA&origemReferencia=${alerta.tipo}&titulo=${encodeURIComponent(`Tratar: ${alerta.titulo}`)}`}
                      className="mt-3 inline-flex text-xs font-semibold text-[#8a5a48] hover:text-[#5d3a2e]"
                    >
                      Criar plano de ação
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-dashed border-[#ead8ce] bg-white/60 p-4 text-sm text-[#704435]">
                Nenhum alerta crítico no recorte atual. Continue acompanhando a
                evolução das campanhas.
              </p>
            )}
          </article>
        </section>
        {pontoAtencao && (
          <section className="rounded-2xl border border-[#ead8ce] bg-[#fffaf7] p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#a4512e]" />
              <div>
                <p className="font-semibold text-[#172033]">
                  Ponto de atenção no recorte atual
                </p>
                <p className="mt-1 text-sm leading-6 text-[#704435]">
                  “{pontoAtencao.texto}” apresenta a menor média entre as
                  perguntas numéricas: <strong>{pontoAtencao.media}</strong>.
                  Vale investigar este tema antes de novas ações.
                </p>
              </div>
            </div>
          </section>
        )}
        {(melhorSetor || setorEmAtencao) && (
          <section className="grid gap-4 md:grid-cols-2">
            {melhorSetor && (
              <article className="rounded-2xl border border-[#cce7da] bg-[#f3fbf7] p-5">
                <div className="flex items-start gap-3">
                  <TrendingUp className="mt-0.5 size-5 shrink-0 text-[#277a55]" />
                  <div>
                    <p className="text-sm font-semibold text-[#172033]">
                      Melhor desempenho por setor
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#1c6041]">
                      {melhorSetor.nome} · média {melhorSetor.media}
                    </p>
                    <p className="mt-1 text-sm text-[#477260]">
                      {melhorSetor.respostas} respostas no recorte atual.
                    </p>
                  </div>
                </div>
              </article>
            )}
            {setorEmAtencao && setorEmAtencao.id !== melhorSetor?.id && (
              <article className="rounded-2xl border border-[#ead8ce] bg-[#fffaf7] p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#a4512e]" />
                  <div>
                    <p className="text-sm font-semibold text-[#172033]">
                      Setor para acompanhar de perto
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#7a3e27]">
                      {setorEmAtencao.nome} · média {setorEmAtencao.media}
                    </p>
                    <p className="mt-1 text-sm text-[#704435]">
                      Compare os comentários e abra um plano de ação, se
                      necessário.
                    </p>
                  </div>
                </div>
              </article>
            )}
          </section>
        )}
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="surface p-5 lg:p-6">
            <SectionTitle
              title="Evolução de respostas"
              description="Volume diário das respostas no período selecionado."
            />
            <div className="mt-3 flex justify-end">
              <select
                value={periodicidade}
                onChange={(event) =>
                  setPeriodicidade(
                    event.target.value as "DIA" | "MES" | "TRIMESTRE",
                  )
                }
                className="h-9 rounded-lg border border-[#d9deea] bg-white px-2.5 text-xs font-medium text-[#344054]"
                aria-label="Agrupamento da evolução"
              >
                <option value="DIA">Por dia</option>
                <option value="MES">Por mês</option>
                <option value="TRIMESTRE">Por trimestre</option>
              </select>
            </div>
            {tendenciaHistorica.length ? (
              <div className="mt-7 flex h-52 items-end gap-2">
                {tendenciaHistorica
                  .slice(periodicidade === "DIA" ? -14 : -10)
                  .map((item) => (
                    <div
                      key={item.data}
                      className="flex min-w-0 flex-1 flex-col items-center gap-2"
                    >
                      <div
                        title={`${item.respostas} respostas`}
                        className="w-full rounded-t-lg bg-[#c99176] transition hover:bg-[#5d3a2e]"
                        style={{
                          height: `${Math.max(8, (item.respostas / maiorTendencia) * 168)}px`,
                        }}
                      />
                      <span className="text-[10px] text-[#8a92a4]">
                        {item.rotulo}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  title="Ainda não há evolução disponível"
                  description="As respostas aparecerão aqui ao longo do tempo."
                />
              </div>
            )}
          </section>
          <section className="surface p-5 lg:p-6">
            <SectionTitle
              title="Comparativo por setor"
              description="Média das perguntas numéricas e total de respostas por setor."
            />
            {setoresResultado.length ? (
              <div className="mt-6 space-y-5">
                {setoresResultado.map((setor) => (
                  <div key={setor.id}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-semibold text-[#172033]">
                        {setor.nome}
                      </span>
                      <span className="text-[#687086]">
                        {setor.respostas} respostas · média {setor.media}
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#edf0f5]">
                      <div
                        className="h-full rounded-full bg-[#5d3a2e]"
                        style={{
                          width: `${Math.max(4, (Number(setor.respostas) / maiorSetor) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  title="Sem comparação por setor"
                  description="Associe campanhas a setores e receba respostas para visualizar o comparativo."
                />
              </div>
            )}
          </section>
        </div>
        <section className="surface p-5 lg:p-6">
          <SectionTitle
            title="Leitura por pergunta"
            description="Use as médias para localizar temas com espaço de melhoria. Perguntas de texto permanecem sem média."
          />
          {perguntas.length === 0 && !loading ? (
            <div className="mt-5">
              <EmptyState
                title="Ainda não há respostas para analisar"
                description="Os resultados aparecem aqui assim que uma campanha receber respostas."
              />
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-2xl border border-[#e6e9f0]">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-[#fafbfe] text-xs font-bold uppercase tracking-wide text-[#8a92a4]">
                  <tr>
                    <th className="px-5 py-3">Pergunta</th>
                    <th className="px-5 py-3">Tipo</th>
                    <th className="px-5 py-3">Respostas</th>
                    <th className="px-5 py-3 text-right">Média</th>
                  </tr>
                </thead>
                <tbody>
                  {perguntas.map((pergunta) => {
                    const numerica =
                      pergunta.tipo === "ESCALA_5" || pergunta.tipo === "NPS";
                    return (
                      <tr
                        key={pergunta.id}
                        className="border-t border-[#edf0f5] text-[#344054]"
                      >
                        <td className="max-w-xl px-5 py-4 font-medium text-[#172033]">
                          {pergunta.texto}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#f3f5f8] px-2.5 py-1 text-xs font-semibold text-[#687086]">
                            {pergunta.tipo.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-4">{pergunta.respostas}</td>
                        <td
                          className={`px-5 py-4 text-right font-semibold ${numerica && Number(pergunta.media) > 0 && Number(pergunta.media) < (pergunta.tipo === "NPS" ? 7 : 3) ? "text-[#b54708]" : "text-[#172033]"}`}
                        >
                          {numerica ? pergunta.media : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="surface p-5 lg:p-6">
          <SectionTitle
            title="Voz do participante"
            description="Comentários sem identificação, liberados somente quando o recorte preserva a privacidade."
          />
          {comentariosData &&
          comentariosData.respostas < comentariosData.minimo ? (
            <div className="mt-5">
              <EmptyState
                title="Privacidade preservada neste recorte"
                description={`São necessárias ao menos ${comentariosData.minimo} respostas; o recorte atual possui ${comentariosData.respostas}.`}
              />
            </div>
          ) : !comentariosData?.comentarios.length ? (
            <div className="mt-5">
              <EmptyState
                title="Ainda não há comentários textuais"
                description="As respostas abertas aparecerão aqui quando participantes compartilharem detalhes."
              />
            </div>
          ) : (
            <>
              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700">
                  {comentariosData.sentimentos.POSITIVO} positivos
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-700">
                  {comentariosData.sentimentos.NEUTRO} neutros
                </span>
                <span className="rounded-full bg-red-50 px-3 py-1.5 font-semibold text-red-700">
                  {comentariosData.sentimentos.NEGATIVO} negativos
                </span>
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {comentariosData.comentarios.map((comentario, index) => (
                  <article
                    key={`${comentario.pergunta}-${comentario.data}-${index}`}
                    className="rounded-2xl border border-[#e6e9f0] bg-[#fafbfe] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#8a92a4]">
                        {comentario.pergunta}
                      </p>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-bold ${comentario.sentimento === "POSITIVO" ? "bg-emerald-50 text-emerald-700" : comentario.sentimento === "NEGATIVO" ? "bg-red-50 text-red-700" : "bg-slate-200 text-slate-700"}`}
                      >
                        {comentario.sentimento.toLowerCase()}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#344054]">
                      “{comentario.texto}”
                    </p>
                    <p className="mt-3 text-xs text-[#8a92a4]">
                      {new Date(
                        `${comentario.data}T12:00:00`,
                      ).toLocaleDateString("pt-BR")}
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
