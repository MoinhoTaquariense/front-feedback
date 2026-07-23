"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  FilePlus2,
  ListChecks,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionTitle, StatusBadge } from "@/components/product-ui";
import {
  QuestionnaireTemplates,
  type QuestionnaireTemplate,
} from "@/components/questionnaire-templates";
import { useAuth } from "@/components/auth-context";

type Opcao = { id: number; rotulo: string };
type Condicao = {
  perguntaId: number;
  operador: "IGUAL" | "DIFERENTE" | "MAIOR_IGUAL" | "MENOR_IGUAL";
  valor: string | number;
};
type Pergunta = {
  id: number;
  ordem: number;
  tipo: string;
  texto: string;
  obrigatoria: boolean;
  condicao?: Condicao | null;
  opcoes: Opcao[];
};
type Versao = {
  id: number;
  numero: number;
  status: "RASCUNHO" | "PUBLICADA" | "ARQUIVADA";
  perguntas?: Pergunta[];
};
type Questionario = {
  id: number;
  nome: string;
  descricao?: string | null;
  status: string;
  versoes: Versao[];
};
const tipos = [
  ["ESCALA_5", "Escala de 1 a 5"],
  ["NPS", "NPS (0 a 10)"],
  ["UNICA", "Escolha única"],
  ["MULTIPLA", "Múltipla escolha"],
  ["TEXTO_CURTO", "Texto curto"],
  ["TEXTO_LONGO", "Texto longo"],
  ["INSTRUCAO", "Texto de instrução"],
] as const;
const input =
  "mt-1.5 w-full rounded-xl border border-[#d9deea] bg-white px-3 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#5d3a2e] focus:ring-4 focus:ring-[#c99176]/20";
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[#c99176]/25";

export default function QuestionariosPage() {
  const { token } = useAuth();
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null);
  const [versaoId, setVersaoId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [instrucoes, setInstrucoes] = useState("");
  const [tipo, setTipo] = useState("ESCALA_5");
  const [textoPergunta, setTextoPergunta] = useState("");
  const [opcoes, setOpcoes] = useState("");
  const [obrigatoria, setObrigatoria] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [textoEdicao, setTextoEdicao] = useState("");
  const [obrigatoriaEdicao, setObrigatoriaEdicao] = useState(false);
  const [condicaoEdicao, setCondicaoEdicao] = useState<Condicao | null>(null);
  const selecionado = useMemo(
    () => questionarios.find((item) => item.id === selecionadoId) ?? null,
    [questionarios, selecionadoId],
  );
  const versao = useMemo(
    () =>
      selecionado?.versoes.find((item) => item.id === versaoId) ??
      selecionado?.versoes[0] ??
      null,
    [selecionado, versaoId],
  );
  const perguntas = useMemo(
    () => [...(versao?.perguntas || [])].sort((a, b) => a.ordem - b.ordem),
    [versao],
  );
  const podeEditar = versao?.status === "RASCUNHO";
  const exigeOpcoes = tipo === "UNICA" || tipo === "MULTIPLA";
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
  const carregar = useCallback(
    async (id?: number | null) => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await api("/questionarios");
        const lista: Questionario[] = data.data || [];
        const nextId =
          id === undefined ? (selecionadoId ?? lista[0]?.id ?? null) : id;
        const detalhe = nextId ? await api(`/questionarios/${nextId}`) : null;
        const listaDetalhada = detalhe
          ? lista.map((item) => (item.id === nextId ? detalhe.data : item))
          : lista;
        setQuestionarios(listaDetalhada);
        setSelecionadoId(nextId);
        setVersaoId(
          (detalhe?.data ?? listaDetalhada.find((item) => item.id === nextId))
            ?.versoes[0]?.id ?? null,
        );
      } catch (error) {
        setNotice(
          error instanceof Error
            ? error.message
            : "Erro ao carregar questionários",
        );
      } finally {
        setLoading(false);
      }
    },
    [api, selecionadoId, token],
  );
  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function criar(event: FormEvent) {
    event.preventDefault();
    try {
      const data = await api("/questionarios", {
        method: "POST",
        body: JSON.stringify({ nome, descricao, instrucoes }),
      });
      setNome("");
      setDescricao("");
      setInstrucoes("");
      setNotice(
        "Questionário criado em rascunho. Monte as perguntas antes de publicar.",
      );
      await carregar(data.data.questionario.id);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao criar questionário",
      );
    }
  }

  async function criarAPartirDoModelo(modelo: QuestionnaireTemplate) {
    try {
      setLoading(true);
      const repeticoes = questionarios.filter((questionario) =>
        questionario.nome.startsWith(modelo.nome),
      ).length;
      const nomeModelo = repeticoes
        ? `${modelo.nome} ${repeticoes + 1}`
        : modelo.nome;
      const data = await api("/questionarios/modelo", {
        method: "POST",
        body: JSON.stringify({
          nome: nomeModelo,
          descricao: modelo.descricao,
          instrucoes:
            "Responda com sinceridade. Suas respostas nos ajudam a tomar melhores decis\u00f5es.",
          perguntas: modelo.perguntas.map((pergunta) => ({
            tipo: pergunta.tipo,
            texto: pergunta.texto,
            obrigatoria: pergunta.obrigatoria,
            opcoes: (pergunta.opcoes ?? []).map((rotulo, index) => ({
              valor: String(index + 1),
              rotulo,
            })),
          })),
        }),
      });
      const { questionario } = data.data;

      setNotice(
        `Modelo “${nomeModelo}” criado com ${modelo.perguntas.length} perguntas.`,
      );
      await carregar(questionario.id);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Erro ao criar modelo de question\u00e1rio",
      );
    } finally {
      setLoading(false);
    }
  }

  async function selecionar(id: number) {
    setSelecionadoId(id);
    await carregar(id);
  }
  async function excluirQuestionario() {
    if (
      !selecionado ||
      !window.confirm(
        `Excluir o questionário “${selecionado.nome}”? Esta ação não pode ser desfeita.`,
      )
    )
      return;
    try {
      await api(`/questionarios/${selecionado.id}`, { method: "DELETE" });
      const proximoId = questionarios.find(
        (questionario) => questionario.id !== selecionado.id,
      )?.id;
      setPreview(false);
      setEditandoId(null);
      setNotice("Questionário removido da biblioteca.");
      await carregar(proximoId ?? null);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao excluir questionário",
      );
    }
  }
  async function adicionar(event: FormEvent) {
    event.preventDefault();
    if (!selecionado || !versao) return;
    try {
      const lista = opcoes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      await api(
        `/questionarios/${selecionado.id}/versoes/${versao.id}/perguntas`,
        {
          method: "POST",
          body: JSON.stringify({
            tipo,
            texto: textoPergunta,
            obrigatoria: tipo === "INSTRUCAO" ? false : obrigatoria,
            opcoes: exigeOpcoes
              ? lista.map((rotulo, index) => ({
                  valor: String(index + 1),
                  rotulo,
                }))
              : [],
          }),
        },
      );
      setTextoPergunta("");
      setOpcoes("");
      setNotice("Pergunta adicionada ao rascunho.");
      await carregar(selecionado.id);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao adicionar pergunta",
      );
    }
  }
  async function publicar() {
    if (!selecionado || !versao) return;
    try {
      await api(
        `/questionarios/${selecionado.id}/versoes/${versao.id}/publicar`,
        { method: "POST" },
      );
      setNotice(
        "Versão publicada. Para alterar o conteúdo, crie uma nova versão.",
      );
      await carregar(selecionado.id);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao publicar versão",
      );
    }
  }
  async function duplicar() {
    if (!selecionado || !versao) return;
    try {
      const data = await api(
        `/questionarios/${selecionado.id}/versoes/${versao.id}/duplicar`,
        { method: "POST" },
      );
      setNotice("Nova versão em rascunho criada.");
      await carregar(selecionado.id);
      setVersaoId(data.data.id);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao criar nova versão",
      );
    }
  }
  function iniciarEdicao(pergunta: Pergunta) {
    setEditandoId(pergunta.id);
    setTextoEdicao(pergunta.texto);
    setObrigatoriaEdicao(pergunta.obrigatoria);
    setCondicaoEdicao(pergunta.condicao ?? null);
  }
  async function salvarEdicao() {
    if (!selecionado || !versao || !editandoId) return;
    try {
      await api(
        `/questionarios/${selecionado.id}/versoes/${versao.id}/perguntas/${editandoId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            texto: textoEdicao,
            obrigatoria: obrigatoriaEdicao,
            condicao: condicaoEdicao,
          }),
        },
      );
      setEditandoId(null);
      setNotice("Pergunta atualizada.");
      await carregar(selecionado.id);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao atualizar pergunta",
      );
    }
  }
  async function remover(perguntaId: number) {
    if (
      !selecionado ||
      !versao ||
      !window.confirm("Remover esta pergunta do rascunho?")
    )
      return;
    try {
      await api(
        `/questionarios/${selecionado.id}/versoes/${versao.id}/perguntas/${perguntaId}`,
        { method: "DELETE" },
      );
      setNotice("Pergunta removida.");
      await carregar(selecionado.id);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao remover pergunta",
      );
    }
  }
  async function mover(indice: number, direcao: -1 | 1) {
    if (!selecionado || !versao) return;
    const destino = indice + direcao;
    if (destino < 0 || destino >= perguntas.length) return;
    const ids = perguntas.map((pergunta) => pergunta.id);
    [ids[indice], ids[destino]] = [ids[destino], ids[indice]];
    try {
      await api(
        `/questionarios/${selecionado.id}/versoes/${versao.id}/perguntas/reordenar`,
        { method: "POST", body: JSON.stringify({ perguntaIds: ids }) },
      );
      await carregar(selecionado.id);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao reordenar perguntas",
      );
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="rounded-3xl border border-[#e6e9f0] bg-white p-6 shadow-[0_12px_32px_rgba(23,32,51,0.05)] lg:p-8">
          <p className="eyebrow">Biblioteca de pesquisas</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#172033]">
                Questionários bem estruturados
              </h1>
              <p className="mt-3 max-w-2xl leading-6 text-[#687086]">
                Crie, organize, teste e publique pesquisas confiáveis para suas
                campanhas.
              </p>
            </div>
            <a
              href="#novo-questionario"
              className={`${button} bg-[#5d3a2e] text-white hover:bg-[#4e3026]`}
            >
              <FilePlus2 className="size-4" />
              Novo questionário
            </a>
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
        <QuestionnaireTemplates
          disabled={loading}
          onSelect={(modelo) => void criarAPartirDoModelo(modelo)}
        />
        <section id="novo-questionario" className="surface p-5 lg:p-6">
          <SectionTitle
            title="Criar um questionário"
            description="Ele nasce como rascunho e pode ser evoluído antes de ser usado em uma campanha."
          />
          <form onSubmit={criar} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-[#344054]">
              Nome
              <input
                required
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex.: Pesquisa de satisfação"
                className={input}
              />
            </label>
            <label className="text-sm font-medium text-[#344054]">
              Descrição{" "}
              <span className="font-normal text-[#8a92a4]">(opcional)</span>
              <input
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Quando esta pesquisa deve ser usada?"
                className={input}
              />
            </label>
            <label className="text-sm font-medium text-[#344054] md:col-span-2">
              Instruções para o respondente
              <textarea
                value={instrucoes}
                onChange={(event) => setInstrucoes(event.target.value)}
                placeholder="Explique o objetivo e o tempo estimado da pesquisa."
                className={`${input} min-h-24`}
              />
            </label>
            <div>
              <button
                disabled={loading}
                className={`${button} bg-[#5d3a2e] text-white hover:bg-[#4e3026] disabled:opacity-50`}
              >
                <Plus className="size-4" />
                Criar rascunho
              </button>
            </div>
          </form>
        </section>
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="surface h-fit p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#172033]">Biblioteca</h2>
              <button
                onClick={() => void carregar()}
                aria-label="Atualizar questionários"
                className="rounded-lg p-2 text-[#687086] hover:bg-[#f3f5f8]"
              >
                <RefreshCw
                  className={`size-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
            <p className="mt-1 text-xs text-[#8a92a4]">
              {questionarios.length} questionário
              {questionarios.length === 1 ? "" : "s"}
            </p>
            <div className="mt-4 space-y-2">
              {questionarios.map((item) => (
                <button
                  key={item.id}
                  onClick={() => void selecionar(item.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${selecionadoId === item.id ? "border-[#5d3a2e] bg-[#fff8f4] shadow-sm" : "border-[#e6e9f0] hover:border-[#c99176] hover:bg-[#fafbfe]"}`}
                >
                  <p className="truncate font-semibold text-[#172033]">
                    {item.nome}
                  </p>
                  <p className="mt-1 text-xs text-[#687086]">
                    {item.versoes.length} versão
                    {item.versoes.length === 1 ? "" : "ões"}
                  </p>
                </button>
              ))}
              {!loading && questionarios.length === 0 && (
                <p className="rounded-xl bg-[#fafbfe] p-3 text-sm text-[#687086]">
                  Sua biblioteca ainda está vazia.
                </p>
              )}
            </div>
          </aside>
          <section className="surface min-w-0 p-5 lg:p-6">
            {!selecionado || !versao ? (
              <EmptyState
                title="Selecione um questionário"
                description="Escolha um item da biblioteca ou crie um novo rascunho para começar a editar."
              />
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e6e9f0] pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-[#172033]">
                        {selecionado.nome}
                      </h2>
                      <StatusBadge value={versao.status} />
                    </div>
                    <p className="mt-2 text-sm text-[#687086]">
                      {selecionado.descricao ||
                        "Sem descrição. Adicione contexto para facilitar o reuso."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={versao.id}
                      onChange={(event) =>
                        setVersaoId(Number(event.target.value))
                      }
                      className="h-10 rounded-xl border border-[#d9deea] bg-white px-3 text-sm text-[#344054]"
                    >
                      {selecionado.versoes.map((item) => (
                        <option key={item.id} value={item.id}>
                          Versão {item.numero} - {item.status.toLowerCase()}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setPreview((value) => !value)}
                      className={`${button} border border-[#d9deea] bg-white text-[#344054] hover:bg-[#f3f5f8]`}
                    >
                      <Eye className="size-4" />
                      {preview ? "Fechar prévia" : "Prévia"}
                    </button>
                    {versao.status === "PUBLICADA" && (
                      <button
                        onClick={() => void duplicar()}
                        className={`${button} border border-[#d9deea] bg-white text-[#344054] hover:bg-[#f3f5f8]`}
                      >
                        <Copy className="size-4" />
                        Nova versão
                      </button>
                    )}
                    {podeEditar && (
                      <button
                        onClick={() => void publicar()}
                        className={`${button} bg-[#5d3a2e] text-white hover:bg-[#4e3026]`}
                      >
                        <CheckCircle2 className="size-4" />
                        Publicar
                      </button>
                    )}
                    <button
                      onClick={() => void excluirQuestionario()}
                      className={`${button} border border-red-200 bg-white text-red-700 hover:bg-red-50`}
                    >
                      <Trash2 className="size-4" />
                      Excluir
                    </button>
                  </div>
                </div>
                {preview ? (
                  <SurveyPreview
                    nome={selecionado.nome}
                    perguntas={perguntas}
                    onClose={() => setPreview(false)}
                  />
                ) : (
                  <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
                    <div>
                      <SectionTitle
                        title={`Perguntas da versão ${versao.numero}`}
                        description={
                          podeEditar
                            ? "Use as setas para ordenar e o lápis para editar o conteúdo."
                            : "Versões publicadas ficam protegidas para preservar os resultados."
                        }
                      />
                      {perguntas.length === 0 ? (
                        <div className="mt-4">
                          <EmptyState
                            title="Ainda não há perguntas"
                            description="Adicione a primeira pergunta no painel ao lado."
                          />
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {perguntas.map((pergunta, indice) => (
                            <article
                              key={pergunta.id}
                              className="rounded-2xl border border-[#e6e9f0] bg-white p-4"
                            >
                              <div className="flex items-start gap-3">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#fff1e9] text-xs font-bold text-[#7a4937]">
                                  {pergunta.ordem}
                                </span>
                                <div className="min-w-0 flex-1">
                                  {editandoId === pergunta.id ? (
                                    <div>
                                      <textarea
                                        value={textoEdicao}
                                        onChange={(event) =>
                                          setTextoEdicao(event.target.value)
                                        }
                                        className="min-h-20 w-full rounded-xl border border-[#d9deea] px-3 py-2 text-sm outline-none focus:border-[#5d3a2e]"
                                      />
                                      <label className="mt-3 flex items-center gap-2 text-sm font-medium text-[#344054]">
                                        <input
                                          type="checkbox"
                                          checked={obrigatoriaEdicao}
                                          onChange={(event) =>
                                            setObrigatoriaEdicao(
                                              event.target.checked,
                                            )
                                          }
                                          className="size-4 accent-[#5d3a2e]"
                                        />
                                        Resposta obrigatória
                                      </label>
                                      <div className="mt-4 rounded-xl border border-[#e6e9f0] bg-[#fafbfe] p-3">
                                        <p className="text-sm font-semibold text-[#344054]">
                                          Exibir esta pergunta somente se
                                        </p>
                                        <select
                                          value={
                                            condicaoEdicao?.perguntaId ?? ""
                                          }
                                          onChange={(event) => {
                                            const fonte = perguntas.find(
                                              (item) =>
                                                item.id ===
                                                Number(event.target.value),
                                            );
                                            if (!fonte) {
                                              setCondicaoEdicao(null);
                                              return;
                                            }
                                            const numerica = [
                                              "ESCALA_5",
                                              "NPS",
                                            ].includes(fonte.tipo);
                                            setCondicaoEdicao({
                                              perguntaId: fonte.id,
                                              operador: numerica
                                                ? "MENOR_IGUAL"
                                                : "IGUAL",
                                              valor: numerica
                                                ? fonte.tipo === "NPS"
                                                  ? 6
                                                  : 3
                                                : (fonte.opcoes[0]?.id ?? ""),
                                            });
                                          }}
                                          className="mt-2 w-full rounded-lg border border-[#d9deea] bg-white px-2.5 py-2 text-sm outline-none focus:border-[#5d3a2e]"
                                        >
                                          <option value="">
                                            Sempre exibir
                                          </option>
                                          {perguntas
                                            .filter(
                                              (item) =>
                                                item.ordem < pergunta.ordem &&
                                                [
                                                  "ESCALA_5",
                                                  "NPS",
                                                  "UNICA",
                                                  "MULTIPLA",
                                                ].includes(item.tipo),
                                            )
                                            .map((item) => (
                                              <option
                                                key={item.id}
                                                value={item.id}
                                              >
                                                {item.ordem}. {item.texto}
                                              </option>
                                            ))}
                                        </select>
                                        {condicaoEdicao &&
                                          (() => {
                                            const fonte = perguntas.find(
                                              (item) =>
                                                item.id ===
                                                condicaoEdicao.perguntaId,
                                            );
                                            const numerica =
                                              fonte &&
                                              ["ESCALA_5", "NPS"].includes(
                                                fonte.tipo,
                                              );
                                            if (!fonte) return null;
                                            return (
                                              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                                <select
                                                  value={
                                                    condicaoEdicao.operador
                                                  }
                                                  onChange={(event) =>
                                                    setCondicaoEdicao({
                                                      ...condicaoEdicao,
                                                      operador: event.target
                                                        .value as Condicao["operador"],
                                                    })
                                                  }
                                                  className="rounded-lg border border-[#d9deea] bg-white px-2.5 py-2 text-sm outline-none focus:border-[#5d3a2e]"
                                                >
                                                  {numerica ? (
                                                    <>
                                                      <option value="MENOR_IGUAL">
                                                        for menor ou igual a
                                                      </option>
                                                      <option value="MAIOR_IGUAL">
                                                        for maior ou igual a
                                                      </option>
                                                      <option value="IGUAL">
                                                        for igual a
                                                      </option>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <option value="IGUAL">
                                                        for igual a
                                                      </option>
                                                      <option value="DIFERENTE">
                                                        for diferente de
                                                      </option>
                                                    </>
                                                  )}
                                                </select>
                                                {numerica ? (
                                                  <input
                                                    type="number"
                                                    min={
                                                      fonte.tipo === "NPS"
                                                        ? 0
                                                        : 1
                                                    }
                                                    max={
                                                      fonte.tipo === "NPS"
                                                        ? 10
                                                        : 5
                                                    }
                                                    value={condicaoEdicao.valor}
                                                    onChange={(event) =>
                                                      setCondicaoEdicao({
                                                        ...condicaoEdicao,
                                                        valor: Number(
                                                          event.target.value,
                                                        ),
                                                      })
                                                    }
                                                    className="rounded-lg border border-[#d9deea] bg-white px-2.5 py-2 text-sm outline-none focus:border-[#5d3a2e]"
                                                  />
                                                ) : (
                                                  <select
                                                    value={condicaoEdicao.valor}
                                                    onChange={(event) =>
                                                      setCondicaoEdicao({
                                                        ...condicaoEdicao,
                                                        valor:
                                                          event.target.value,
                                                      })
                                                    }
                                                    className="rounded-lg border border-[#d9deea] bg-white px-2.5 py-2 text-sm outline-none focus:border-[#5d3a2e]"
                                                  >
                                                    {fonte.opcoes.map(
                                                      (opcao) => (
                                                        <option
                                                          key={opcao.id}
                                                          value={opcao.id}
                                                        >
                                                          {opcao.rotulo}
                                                        </option>
                                                      ),
                                                    )}
                                                  </select>
                                                )}
                                              </div>
                                            );
                                          })()}
                                      </div>
                                      <div className="mt-3 flex gap-2">
                                        <button
                                          onClick={() => void salvarEdicao()}
                                          className={`${button} bg-[#5d3a2e] text-white hover:bg-[#4e3026]`}
                                        >
                                          Salvar
                                        </button>
                                        <button
                                          onClick={() => setEditandoId(null)}
                                          className={`${button} border border-[#d9deea] bg-white text-[#344054]`}
                                        >
                                          <X className="size-4" />
                                          Cancelar
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium text-[#172033]">
                                          {pergunta.texto}
                                        </p>
                                        {pergunta.obrigatoria && (
                                          <span className="text-xs font-semibold text-[#b54708]">
                                            Obrigatória
                                          </span>
                                        )}
                                      </div>
                                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#8a92a4]">
                                        {pergunta.tipo.replaceAll("_", " ")}
                                      </p>
                                      {pergunta.opcoes?.length > 0 && (
                                        <p className="mt-3 rounded-lg bg-[#fafbfe] px-3 py-2 text-sm text-[#687086]">
                                          {pergunta.opcoes
                                            .map((opcao) => opcao.rotulo)
                                            .join(" | ")}
                                        </p>
                                      )}
                                    </>
                                  )}
                                </div>
                                {podeEditar && editandoId !== pergunta.id && (
                                  <div className="flex shrink-0 gap-1">
                                    <button
                                      onClick={() => void mover(indice, -1)}
                                      disabled={indice === 0}
                                      aria-label="Mover pergunta para cima"
                                      className="rounded-lg p-2 text-[#687086] hover:bg-[#f3f5f8] disabled:opacity-30"
                                    >
                                      <ChevronUp className="size-4" />
                                    </button>
                                    <button
                                      onClick={() => void mover(indice, 1)}
                                      disabled={indice === perguntas.length - 1}
                                      aria-label="Mover pergunta para baixo"
                                      className="rounded-lg p-2 text-[#687086] hover:bg-[#f3f5f8] disabled:opacity-30"
                                    >
                                      <ChevronDown className="size-4" />
                                    </button>
                                    <button
                                      onClick={() => iniciarEdicao(pergunta)}
                                      aria-label="Editar pergunta"
                                      className="rounded-lg p-2 text-[#687086] hover:bg-[#f3f5f8]"
                                    >
                                      <Pencil className="size-4" />
                                    </button>
                                    <button
                                      onClick={() => void remover(pergunta.id)}
                                      aria-label="Remover pergunta"
                                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="size-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                    {podeEditar && (
                      <form
                        onSubmit={adicionar}
                        className="h-fit rounded-2xl border border-[#ead8ce] bg-[#fffaf7] p-4"
                      >
                        <div className="flex items-center gap-2">
                          <ListChecks className="size-4 text-[#7a4937]" />
                          <h3 className="font-semibold text-[#172033]">
                            Adicionar pergunta
                          </h3>
                        </div>
                        <div className="mt-4 space-y-3">
                          <label className="text-sm font-medium text-[#344054]">
                            Tipo
                            <select
                              value={tipo}
                              onChange={(event) => setTipo(event.target.value)}
                              className={input}
                            >
                              {tipos.map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="text-sm font-medium text-[#344054]">
                            Pergunta
                            <textarea
                              required
                              value={textoPergunta}
                              onChange={(event) =>
                                setTextoPergunta(event.target.value)
                              }
                              placeholder="Digite a pergunta para o respondente"
                              className={`${input} min-h-24`}
                            />
                          </label>
                          {exigeOpcoes && (
                            <label className="text-sm font-medium text-[#344054]">
                              Opções
                              <input
                                required
                                value={opcoes}
                                onChange={(event) =>
                                  setOpcoes(event.target.value)
                                }
                                placeholder="Ex.: Ótimo, Bom, Regular"
                                className={input}
                              />
                              <span className="mt-1 block text-xs font-normal text-[#8a92a4]">
                                Separe cada opção por vírgula.
                              </span>
                            </label>
                          )}
                          {tipo !== "INSTRUCAO" && (
                            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#344054]">
                              <input
                                type="checkbox"
                                checked={obrigatoria}
                                onChange={(event) =>
                                  setObrigatoria(event.target.checked)
                                }
                                className="size-4 accent-[#5d3a2e]"
                              />
                              Resposta obrigatória
                            </label>
                          )}
                          <button
                            className={`${button} w-full bg-[#5d3a2e] text-white hover:bg-[#4e3026]`}
                          >
                            <Plus className="size-4" />
                            Adicionar pergunta
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function SurveyPreview({
  nome,
  perguntas,
  onClose,
}: {
  nome: string;
  perguntas: Pergunta[];
  onClose: () => void;
}) {
  return (
    <div className="mt-6 rounded-3xl bg-[#f6f7fb] p-5 lg:p-8">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#e6e9f0] bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Prévia do respondente</p>
            <h3 className="mt-2 text-xl font-semibold text-[#172033]">
              {nome}
            </h3>
            <p className="mt-2 text-sm text-[#687086]">
              Assim sua pesquisa será apresentada antes de receber respostas.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar prévia"
            className="rounded-lg p-2 text-[#687086] hover:bg-[#f3f5f8]"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-6 space-y-5">
          {perguntas.length ? (
            perguntas.map((pergunta) => (
              <div key={pergunta.id} className="border-t border-[#edf0f5] pt-5">
                <p className="font-medium text-[#172033]">
                  {pergunta.ordem}. {pergunta.texto}
                </p>
                {pergunta.tipo === "ESCALA_5" && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((numero) => (
                      <span
                        key={numero}
                        className="rounded-lg border border-[#d9deea] p-2 text-center text-sm"
                      >
                        {numero}
                      </span>
                    ))}
                  </div>
                )}
                {pergunta.tipo === "NPS" && (
                  <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-11">
                    {Array.from({ length: 11 }, (_, numero) => (
                      <span
                        key={numero}
                        className="rounded-lg border border-[#d9deea] p-2 text-center text-xs"
                      >
                        {numero}
                      </span>
                    ))}
                  </div>
                )}
                {["UNICA", "MULTIPLA"].includes(pergunta.tipo) && (
                  <div className="mt-3 space-y-2">
                    {pergunta.opcoes.map((opcao) => (
                      <div
                        key={opcao.id}
                        className="rounded-lg border border-[#e6e9f0] px-3 py-2 text-sm text-[#687086]"
                      >
                        {opcao.rotulo}
                      </div>
                    ))}
                  </div>
                )}
                {["TEXTO_CURTO", "TEXTO_LONGO"].includes(pergunta.tipo) && (
                  <div className="mt-3 h-20 rounded-xl border border-[#d9deea] bg-[#fafbfe]" />
                )}
              </div>
            ))
          ) : (
            <p className="rounded-xl bg-[#fafbfe] p-4 text-sm text-[#687086]">
              Adicione perguntas para visualizar a pesquisa.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
