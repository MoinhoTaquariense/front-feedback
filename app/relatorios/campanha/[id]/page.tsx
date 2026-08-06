"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ClipboardList, FileText, Gauge, MessageSquare, RefreshCw, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionTitle } from "@/components/product-ui";
import { useAuth } from "@/components/auth-context";

type Pergunta = { id: number; ordem: number; texto: string; tipo: string; respostas: number; media: string | number };
type Nota = { pergunta_id: number; nota: string | number; quantidade: number };
type Texto = { id: number; pergunta_id: number; pergunta: string; data: string; resposta: string };
type Relatorio = { campanha: { id: number; nome: string; status: string; setores: string }; metricas: { respostas: number; respostas_total: number; textos: number; media: string | number; convites: number; taxaResposta: number | null }; perguntas: Pergunta[]; distribuicao: Nota[]; textos: Texto[] };
const button = "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[#c99176]/25";

export default function RelatorioCompletoCampanhaPage() {
  const { token, logout } = useAuth();
  const params = useParams<{ id: string }>();
  const campanhaId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const carregar = useCallback(async () => {
    if (!token || !campanhaId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/backend/relatorios/campanha/${campanhaId}/completo`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) { logout(); throw new Error("Sua sessão expirou. Entre novamente."); }
      if (!response.ok) throw new Error(data.message || "Não foi possível carregar o relatório completo.");
      setRelatorio(data.data); setErro("");
    } catch (error) { setErro(error instanceof Error ? error.message : "Erro ao carregar relatório."); }
    finally { setLoading(false); }
  }, [campanhaId, logout, token]);
  useEffect(() => { void carregar(); }, [carregar]);
  const notasPorPergunta = useMemo(() => { const mapa = new Map<number, Nota[]>(); relatorio?.distribuicao.forEach((item) => mapa.set(item.pergunta_id, [...(mapa.get(item.pergunta_id) || []), item])); return mapa; }, [relatorio]);
  const textosPorPergunta = useMemo(() => { const mapa = new Map<number, Texto[]>(); relatorio?.textos.forEach((item) => mapa.set(item.pergunta_id, [...(mapa.get(item.pergunta_id) || []), item])); return mapa; }, [relatorio]);
  const maiorNota = Math.max(...(relatorio?.distribuicao || []).map((item) => Number(item.quantidade)), 1);
  const cards = relatorio ? [{ label: "Respostas", value: relatorio.metricas.respostas, detail: "Participações recebidas", icon: ClipboardList }, { label: "Adesão", value: relatorio.metricas.taxaResposta === null ? "—" : `${relatorio.metricas.taxaResposta}%`, detail: relatorio.metricas.taxaResposta === null ? "Link público ilimitado" : `${relatorio.metricas.convites} convites gerados`, icon: Gauge }, { label: "Média numérica", value: relatorio.metricas.media, detail: "Todas as escalas", icon: TrendingUp }, { label: "Textos", value: relatorio.metricas.textos, detail: "Respostas abertas", icon: MessageSquare }] : [];
  return <AppShell><div className="mx-auto max-w-7xl space-y-7">
    <section className="rounded-3xl border border-[#e6e9f0] bg-white p-6 shadow-[0_12px_32px_rgba(23,32,51,0.05)] lg:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><Link href="/relatorios" className="inline-flex items-center gap-1 text-sm font-semibold text-[#8b5a46] hover:text-[#5d3a2e]"><ArrowLeft className="size-4" />Voltar para resultados</Link><p className="eyebrow mt-5">Relatório completo da campanha</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172033]">{relatorio?.campanha.nome || "Carregando campanha..."}</h1><p className="mt-3 max-w-2xl leading-6 text-[#687086]">Indicadores, médias, distribuição de notas e todas as respostas de texto, sem identificar participantes.</p></div><button onClick={() => void carregar()} disabled={loading} className={`${button} border border-[#d9deea] bg-white text-[#344054] hover:bg-[#f3f5f8]`}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />Atualizar</button></div>{relatorio && <div className="mt-5 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-[#f3f5f8] px-3 py-1.5 font-semibold text-[#4c5568]">{relatorio.campanha.status}</span>{relatorio.campanha.setores && <span className="rounded-full bg-[#f4eee9] px-3 py-1.5 font-semibold text-[#704435]">{relatorio.campanha.setores}</span>}</div>}</section>
    {erro && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{erro}</div>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <article key={card.label} className="surface p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-[#687086]">{card.label}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-[#172033]">{loading ? "..." : card.value}</p><p className="mt-2 text-xs text-[#8a92a4]">{card.detail}</p></div><div className="rounded-xl bg-[#fff1e9] p-2.5 text-[#7a4937]"><card.icon className="size-5" /></div></div></article>)}</section>
    <section className="surface p-5 lg:p-6"><SectionTitle title="Notas e médias por pergunta" description="A distribuição mostra quantas vezes cada nota foi dada na campanha." />{!relatorio?.perguntas.length && !loading ? <div className="mt-5"><EmptyState title="Ainda não há respostas nesta campanha" description="As respostas recebidas aparecerão aqui." /></div> : <div className="mt-5 space-y-5">{relatorio?.perguntas.map((pergunta) => { const notas = notasPorPergunta.get(pergunta.id) || []; const numerica = ["ESCALA_5", "NPS"].includes(pergunta.tipo); return <article key={pergunta.id} className="rounded-2xl border border-[#e6e9f0] bg-[#fafbfe] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-[#8a92a4]">Pergunta {pergunta.ordem}</p><h2 className="mt-1 font-semibold text-[#172033]">{pergunta.texto}</h2><p className="mt-1 text-sm text-[#687086]">{pergunta.respostas} respostas · {pergunta.tipo.replaceAll("_", " ")}</p></div>{numerica && <div className="rounded-xl bg-white px-4 py-2 text-right shadow-sm"><p className="text-xs text-[#8a92a4]">Média</p><p className="text-xl font-semibold text-[#172033]">{pergunta.media}</p></div>}</div>{numerica && <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-11">{notas.map((nota) => <div key={`${pergunta.id}-${nota.nota}`}><div className="flex h-24 items-end rounded-lg bg-white p-1"><div className="w-full rounded-md bg-[#c99176]" style={{ height: `${Math.max(8, (Number(nota.quantidade) / maiorNota) * 100)}%` }} /></div><p className="mt-2 text-center text-xs font-semibold text-[#344054]">{nota.nota}</p><p className="text-center text-[11px] text-[#8a92a4]">{nota.quantidade}x</p></div>)}</div>}</article>; })}</div>}</section>
    <section className="surface p-5 lg:p-6"><SectionTitle title="Todas as respostas de texto" description="Respostas abertas da campanha, exibidas sem nomes, e-mails ou outros identificadores." />{!relatorio?.textos.length && !loading ? <div className="mt-5"><EmptyState title="Não há respostas textuais nesta campanha" description="Quando participantes responderem perguntas abertas, os textos serão exibidos aqui." /></div> : <div className="mt-5 space-y-6">{[...(textosPorPergunta.entries())].map(([perguntaId, textos]) => <article key={perguntaId}><div className="flex items-center gap-2"><FileText className="size-4 text-[#8b5a46]" /><h2 className="font-semibold text-[#172033]">{textos[0]?.pergunta}</h2><span className="rounded-full bg-[#f3f5f8] px-2 py-0.5 text-xs font-semibold text-[#687086]">{textos.length}</span></div><div className="mt-3 grid gap-3 lg:grid-cols-2">{textos.map((texto) => <article key={texto.id} className="rounded-2xl border border-[#e6e9f0] bg-[#fafbfe] p-4"><p className="whitespace-pre-wrap text-sm leading-6 text-[#344054]">“{texto.resposta}”</p><p className="mt-3 text-xs text-[#8a92a4]">{new Date(`${texto.data}T12:00:00`).toLocaleDateString("pt-BR")}</p></article>)}</div></article>)}</div>}</section>
  </div></AppShell>;
}