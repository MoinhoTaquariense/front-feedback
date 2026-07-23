"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Link2,
  Plus,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionTitle, StatusBadge } from "@/components/product-ui";
import { useAuth } from "@/components/auth-context";

type Versao = {
  id: number;
  numero: number;
  status: string;
  questionario?: { nome: string };
};
type Questionario = { id: number; nome: string; versoes: Versao[] };
type Setor = { id: number; nome: string };
type Campanha = {
  id: number;
  nome: string;
  status: string;
  encerraEm?: string;
  anonima: boolean;
  aceitaLinkPublico?: boolean;
  versao?: Versao;
  setores?: Setor[];
  indicadores: { convites: number; respondidas: number; taxaResposta: number };
};
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[#c99176]/25";
const input =
  "mt-1.5 h-11 w-full rounded-xl border border-[#d9deea] bg-white px-3 text-sm text-[#172033] outline-none transition focus:border-[#5d3a2e] focus:ring-4 focus:ring-[#c99176]/20";
const etapas = ["Pesquisa", "Público", "Regras", "Revisão"];

export default function CampanhasPage() {
  const { token } = useAuth();
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [etapa, setEtapa] = useState(1);
  const [nome, setNome] = useState("");
  const [versaoId, setVersaoId] = useState("");
  const [setorIds, setSetorIds] = useState<number[]>([]);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [anonima, setAnonima] = useState(true);
  const [aceitaLinkPublico, setAceitaLinkPublico] = useState(true);
  const [aceitaLinkIndividual, setAceitaLinkIndividual] = useState(false);
  const [limitePublico, setLimitePublico] = useState("0");
  const [mensagem, setMensagem] = useState(
    "Olá! Sua opinião é muito importante. Responda nossa avaliação:",
  );
  const [notice, setNotice] = useState("");
  const [links, setLinks] = useState<{ link: string; mensagem: string }[]>([]);
  const [creating, setCreating] = useState(false);

  const versoes = useMemo(
    () =>
      questionarios.flatMap((questionario) =>
        questionario.versoes
          .filter((versao) => versao.status === "PUBLICADA")
          .map((versao) => ({
            ...versao,
            questionario: { nome: questionario.nome },
          })),
      ),
    [questionarios],
  );
  const versaoSelecionada = versoes.find(
    (versao) => String(versao.id) === versaoId,
  );
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
    if (!token) return;
    try {
      const [campanhasData, questionariosData, setoresData] = await Promise.all(
        [api("/campanhas"), api("/questionarios"), api("/setores")],
      );
      setCampanhas(campanhasData.data || []);
      setQuestionarios(questionariosData.data || []);
      setSetores(setoresData.data || []);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao carregar campanhas",
      );
    }
  }, [api, token]);
  useEffect(() => {
    void carregar();
  }, [carregar]);

  function alternarSetor(id: number) {
    setSetorIds((atuais) =>
      atuais.includes(id)
        ? atuais.filter((item) => item !== id)
        : [...atuais, id],
    );
  }
  function avancar() {
    if (etapa === 1 && (!nome.trim() || !versaoId)) {
      setNotice(
        "Dê um nome à campanha e selecione uma versão publicada para continuar.",
      );
      return;
    }
    if (etapa === 2 && !aceitaLinkPublico && !aceitaLinkIndividual) {
      setNotice("Escolha pelo menos uma modalidade de convite.");
      return;
    }
    if (etapa === 2 && setorIds.length === 0) {
      setNotice("Selecione ao menos um setor que receberá esta campanha.");
      return;
    }
    if (etapa === 3 && inicio && fim && new Date(fim) <= new Date(inicio)) {
      setNotice("O encerramento deve acontecer depois do início.");
      return;
    }
    setNotice("");
    setEtapa((atual) => Math.min(atual + 1, 4));
  }
  async function criar() {
    if (setorIds.length === 0) {
      setNotice("Selecione ao menos um setor que receberá esta campanha.");
      setEtapa(2);
      return;
    }
    setCreating(true);
    try {
      await api("/campanhas", {
        method: "POST",
        body: JSON.stringify({
          nome,
          versaoId: Number(versaoId),
          setorIds,
          iniciaEm: inicio || null,
          encerraEm: fim || null,
          anonima,
          aceitaLinkPublico,
          aceitaLinkIndividual,
          limiteRespostasPublico: aceitaLinkPublico
            ? Number(limitePublico || 0)
            : 0,
          mensagemPadrao: mensagem,
        }),
      });
      setNome("");
      setVersaoId("");
      setSetorIds([]);
      setInicio("");
      setFim("");
      setAceitaLinkPublico(true);
      setAceitaLinkIndividual(false);
      setLimitePublico("0");
      setEtapa(1);
      setNotice(
        "Campanha criada como rascunho. Revise-a na lista e ative quando estiver pronta.",
      );
      await carregar();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao criar campanha",
      );
    } finally {
      setCreating(false);
    }
  }
  async function ativar(id: number) {
    try {
      await api(`/campanhas/${id}/ativar`, { method: "POST" });
      setNotice("Campanha ativada com sucesso.");
      await carregar();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Erro ao ativar");
    }
  }
  async function ativarEGerarLink(id: number) {
    try {
      await api(`/campanhas/${id}/ativar`, { method: "POST" });
      const data = await api(`/campanhas/${id}/convites`, {
        method: "POST",
        body: JSON.stringify({ tipo: "PUBLICO" }),
      });
      setLinks(data.data || []);
      setNotice(
        "Campanha ativada e link público criado. A pesquisa já pode receber respostas.",
      );
      await carregar();
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Erro ao ativar e gerar o link",
      );
    }
  }
  async function gerarLink(id: number) {
    try {
      const data = await api(`/campanhas/${id}/convites`, {
        method: "POST",
        body: JSON.stringify({ tipo: "PUBLICO" }),
      });
      setLinks(data.data || []);
      setNotice(
        "Link público criado. Compartilhe-o com o público da campanha.",
      );
      await carregar();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Erro ao gerar link");
    }
  }
  async function copiar(texto: string) {
    await navigator.clipboard.writeText(texto);
    setNotice("Conteúdo copiado para a área de transferência.");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="rounded-3xl border border-[#e6e9f0] bg-white p-6 shadow-[0_12px_32px_rgba(23,32,51,0.05)] lg:p-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="eyebrow">Coleta de feedback</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172033]">
                Campanhas que geram respostas
              </h1>
              <p className="mt-3 leading-6 text-[#687086]">
                Planeje a pesquisa, defina regras de coleta e acompanhe a
                participação em um único lugar.
              </p>
            </div>
            <a
              href="#nova-campanha"
              className={`${button} bg-[#5d3a2e] text-white shadow-sm hover:bg-[#4e3026]`}
            >
              <Plus className="size-4" />
              Nova campanha
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
        <section id="nova-campanha" className="surface overflow-hidden">
          <div className="border-b border-[#e6e9f0] px-5 py-5 lg:px-6">
            <SectionTitle
              title="Nova campanha"
              description="Configure sua coleta em quatro passos simples."
            />
            <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {etapas.map((nomeEtapa, indice) => {
                const numero = indice + 1;
                return (
                  <li
                    key={nomeEtapa}
                    className={`flex items-center gap-2 text-sm font-semibold ${numero === etapa ? "text-[#5d3a2e]" : numero < etapa ? "text-emerald-700" : "text-[#98a2b3]"}`}
                  >
                    <span
                      className={`flex size-6 items-center justify-center rounded-full text-xs ${numero === etapa ? "bg-[#5d3a2e] text-white" : numero < etapa ? "bg-emerald-100 text-emerald-700" : "bg-[#edf0f5]"}`}
                    >
                      {numero < etapa ? <Check className="size-3.5" /> : numero}
                    </span>
                    {nomeEtapa}
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="p-5 lg:p-6">
            {etapa === 1 && (
              <div className="grid max-w-3xl gap-5 md:grid-cols-2">
                <label className="text-sm font-medium text-[#344054]">
                  Nome da campanha
                  <input
                    required
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    placeholder="Ex.: Atendimento - Julho"
                    className={input}
                  />
                </label>
                <label className="text-sm font-medium text-[#344054]">
                  Questionário e versão
                  <select
                    required
                    value={versaoId}
                    onChange={(event) => setVersaoId(event.target.value)}
                    className={input}
                  >
                    <option value="">Selecione uma versão publicada</option>
                    {versoes.map((versao) => (
                      <option key={versao.id} value={versao.id}>
                        {versao.questionario?.nome} - versão {versao.numero}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-2xl bg-[#fafbfe] p-4 text-sm text-[#687086] md:col-span-2">
                  <p className="font-semibold text-[#344054]">
                    Por que escolher uma versão publicada?
                  </p>
                  <p className="mt-1 leading-6">
                    Isso garante que todas as respostas usem o mesmo conjunto de
                    perguntas e que seus resultados possam ser comparados.
                  </p>
                </div>
                {versoes.length === 0 && (
                  <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 md:col-span-2">
                    Publique uma versão de questionário antes de iniciar uma
                    campanha.
                  </p>
                )}
              </div>
            )}
            {etapa === 2 && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <h3 className="font-semibold text-[#172033]">
                    Quem pode participar?
                  </h3>
                  <p className="mt-1 text-sm text-[#687086]">
                    Selecione os setores que participarão da campanha. Este
                    escopo protege a visibilidade dos resultados entre áreas.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {setores.length ? (
                      setores.map((setor) => (
                        <button
                          key={setor.id}
                          type="button"
                          onClick={() => alternarSetor(setor.id)}
                          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${setorIds.includes(setor.id) ? "border-[#5d3a2e] bg-[#fff8f4] text-[#5d3a2e]" : "border-[#d9deea] text-[#687086] hover:border-[#c99176]"}`}
                        >
                          <span
                            className={`flex size-4 items-center justify-center rounded border ${setorIds.includes(setor.id) ? "border-[#5d3a2e] bg-[#5d3a2e] text-white" : "border-[#cbd2df]"}`}
                          >
                            {setorIds.includes(setor.id) && (
                              <Check className="size-3" />
                            )}
                          </span>
                          {setor.nome}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-[#8a92a4]">
                        Nenhum setor disponível.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#172033]">
                    Como as pessoas receberão a pesquisa?
                  </h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setAceitaLinkPublico((value) => !value)}
                      className={`rounded-2xl border p-4 text-left transition ${aceitaLinkPublico ? "border-[#5d3a2e] bg-[#fff8f4]" : "border-[#d9deea]"}`}
                    >
                      <div className="flex items-center justify-between">
                        <Link2 className="size-5 text-[#8b5a46]" />
                        <span
                          className={`flex size-5 items-center justify-center rounded border ${aceitaLinkPublico ? "border-[#5d3a2e] bg-[#5d3a2e] text-white" : "border-[#cbd2df]"}`}
                        >
                          {aceitaLinkPublico && <Check className="size-3.5" />}
                        </span>
                      </div>
                      <p className="mt-3 font-semibold text-[#172033]">
                        Link público
                      </p>
                      <p className="mt-1 text-sm leading-5 text-[#687086]">
                        Um link para compartilhar por canal, QR code ou
                        mensagem.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAceitaLinkIndividual((value) => !value)}
                      className={`rounded-2xl border p-4 text-left transition ${aceitaLinkIndividual ? "border-[#5d3a2e] bg-[#fff8f4]" : "border-[#d9deea]"}`}
                    >
                      <div className="flex items-center justify-between">
                        <Users className="size-5 text-[#8b5a46]" />
                        <span
                          className={`flex size-5 items-center justify-center rounded border ${aceitaLinkIndividual ? "border-[#5d3a2e] bg-[#5d3a2e] text-white" : "border-[#cbd2df]"}`}
                        >
                          {aceitaLinkIndividual && (
                            <Check className="size-3.5" />
                          )}
                        </span>
                      </div>
                      <p className="mt-3 font-semibold text-[#172033]">
                        Convites individuais
                      </p>
                      <p className="mt-1 text-sm leading-5 text-[#687086]">
                        Links únicos para destinatários específicos.
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {etapa === 3 && (
              <div className="grid max-w-3xl gap-5 md:grid-cols-2">
                <label className="text-sm font-medium text-[#344054]">
                  Início{" "}
                  <span className="font-normal text-[#8a92a4]">(opcional)</span>
                  <input
                    type="datetime-local"
                    value={inicio}
                    onChange={(event) => setInicio(event.target.value)}
                    className={input}
                  />
                </label>
                <label className="text-sm font-medium text-[#344054]">
                  Encerramento{" "}
                  <span className="font-normal text-[#8a92a4]">(opcional)</span>
                  <input
                    type="datetime-local"
                    value={fim}
                    onChange={(event) => setFim(event.target.value)}
                    className={input}
                  />
                </label>
                {aceitaLinkPublico && (
                  <label className="text-sm font-medium text-[#344054]">
                    Limite de respostas públicas
                    <input
                      type="number"
                      min="0"
                      value={limitePublico}
                      onChange={(event) => setLimitePublico(event.target.value)}
                      className={input}
                    />
                    <span className="mt-1 block text-xs font-normal text-[#8a92a4]">
                      Use 0 para permitir respostas sem limite.
                    </span>
                  </label>
                )}
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e6e9f0] p-4 text-sm text-[#344054] md:mt-6">
                  <input
                    type="checkbox"
                    checked={anonima}
                    onChange={(event) => setAnonima(event.target.checked)}
                    className="mt-0.5 size-4 accent-[#5d3a2e]"
                  />
                  <span>
                    <strong className="block">Coleta anônima</strong>
                    <span className="mt-1 block text-[#687086]">
                      Não associe a resposta à identidade do participante.
                    </span>
                  </span>
                </label>
                <label className="text-sm font-medium text-[#344054] md:col-span-2">
                  Mensagem do convite
                  <textarea
                    value={mensagem}
                    onChange={(event) => setMensagem(event.target.value)}
                    className="mt-1.5 min-h-28 w-full rounded-xl border border-[#d9deea] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#5d3a2e] focus:ring-4 focus:ring-[#c99176]/20"
                  />
                </label>
              </div>
            )}
            {etapa === 4 && (
              <div className="max-w-3xl">
                <h3 className="text-lg font-semibold text-[#172033]">
                  Revise antes de criar
                </h3>
                <p className="mt-1 text-sm text-[#687086]">
                  A campanha será criada como rascunho e poderá ser ativada
                  quando você quiser.
                </p>
                <dl className="mt-5 divide-y divide-[#edf0f5] overflow-hidden rounded-2xl border border-[#e6e9f0]">
                  <Resumo label="Campanha" value={nome} />
                  <Resumo
                    label="Questionário"
                    value={
                      versaoSelecionada
                        ? `${versaoSelecionada.questionario?.nome} - versão ${versaoSelecionada.numero}`
                        : "-"
                    }
                  />
                  <Resumo
                    label="Público"
                    value={
                      setorIds.length
                        ? setores
                            .filter((setor) => setorIds.includes(setor.id))
                            .map((setor) => setor.nome)
                            .join(", ")
                        : "Nenhum setor selecionado"
                    }
                  />
                  <Resumo
                    label="Coleta"
                    value={[
                      aceitaLinkPublico && "Link público",
                      aceitaLinkIndividual && "Convites individuais",
                    ]
                      .filter(Boolean)
                      .join(" e ")}
                  />
                  <Resumo
                    label="Período"
                    value={`${inicio ? new Date(inicio).toLocaleString("pt-BR") : "Início imediato"} até ${fim ? new Date(fim).toLocaleString("pt-BR") : "sem prazo"}`}
                  />
                  <Resumo
                    label="Privacidade"
                    value={
                      anonima ? "Resposta anônima" : "Resposta identificada"
                    }
                  />
                </dl>
              </div>
            )}
          </div>
          <footer className="flex items-center justify-between border-t border-[#e6e9f0] bg-[#fafbfe] px-5 py-4 lg:px-6">
            <button
              type="button"
              onClick={() => {
                setEtapa((atual) => Math.max(atual - 1, 1));
                setNotice("");
              }}
              disabled={etapa === 1}
              className={`${button} text-[#687086] hover:bg-white disabled:invisible`}
            >
              <ChevronLeft className="size-4" />
              Voltar
            </button>
            {etapa < 4 ? (
              <button
                type="button"
                onClick={avancar}
                disabled={etapa === 1 && versoes.length === 0}
                className={`${button} bg-[#5d3a2e] text-white hover:bg-[#4e3026] disabled:opacity-50`}
              >
                Continuar
                <ChevronRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void criar()}
                disabled={creating}
                className={`${button} bg-[#5d3a2e] text-white hover:bg-[#4e3026] disabled:opacity-50`}
              >
                <Sparkles className="size-4" />
                {creating ? "Criando..." : "Criar campanha"}
              </button>
            )}
          </footer>
        </section>
        {links.length > 0 && (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <SectionTitle
              title="Link pronto para envio"
              description="O link permite respostas públicas conforme as regras da campanha."
            />
            {links.map((item) => (
              <div
                key={item.link}
                className="mt-4 flex flex-col gap-3 sm:flex-row"
              >
                <input
                  readOnly
                  value={item.link}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-emerald-200 bg-white px-3 text-sm text-[#344054]"
                />
                <button
                  onClick={() => void copiar(item.mensagem)}
                  className={`${button} border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100`}
                >
                  <Clipboard className="size-4" />
                  Copiar convite
                </button>
              </div>
            ))}
          </section>
        )}
        <section className="surface p-5 lg:p-6">
          <SectionTitle
            title="Suas campanhas"
            description={`${campanhas.length} campanha${campanhas.length === 1 ? "" : "s"} no seu escopo de acesso.`}
          />
          {campanhas.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                title="Nenhuma campanha criada"
                description="Crie a primeira campanha para iniciar a coleta de feedback."
              />
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-2xl border border-[#e6e9f0]">
              <div className="hidden grid-cols-[1.6fr_.7fr_.8fr_.7fr] gap-4 border-b border-[#e6e9f0] bg-[#fafbfe] px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#8a92a4] md:grid">
                <span>Campanha</span>
                <span>Status</span>
                <span>Respostas</span>
                <span className="text-right">Ações</span>
              </div>
              {campanhas.map((campanha) => (
                <article
                  key={campanha.id}
                  className="grid gap-4 border-b border-[#edf0f5] px-5 py-5 last:border-0 md:grid-cols-[1.6fr_.7fr_.8fr_.7fr] md:items-center"
                >
                  <div>
                    <h3 className="font-semibold text-[#172033]">
                      {campanha.nome}
                    </h3>
                    <p className="mt-1 text-sm text-[#687086]">
                      {campanha.versao?.questionario?.nome || "Questionário"} -
                      versão {campanha.versao?.numero || "-"}
                    </p>
                    {campanha.encerraEm && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-[#8a92a4]">
                        <CalendarDays className="size-3.5" />
                        Encerra em{" "}
                        {new Date(campanha.encerraEm).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    )}
                  </div>
                  <div>
                    <StatusBadge value={campanha.status} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#172033]">
                      {campanha.indicadores.respondidas}{" "}
                      <span className="font-normal text-[#687086]">
                        respostas
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-[#8a92a4]">
                      {campanha.indicadores.taxaResposta}% de conversão
                    </p>
                  </div>
                  <div className="flex gap-2 md:justify-end">
                    <Link
                      href={`/campanhas/${campanha.id}`}
                      className={`${button} border border-[#d9deea] bg-white text-[#344054] hover:bg-[#f3f5f8]`}
                    >
                      Gerenciar
                    </Link>
                    {campanha.status !== "ATIVA" &&
                      campanha.status !== "ENCERRADA" &&
                      (campanha.aceitaLinkPublico ? (
                        <button
                          onClick={() => void ativarEGerarLink(campanha.id)}
                          className={`${button} bg-[#5d3a2e] text-white hover:bg-[#4e3026]`}
                        >
                          <Link2 className="size-4" />
                          Ativar e gerar link
                        </button>
                      ) : (
                        <button
                          onClick={() => void ativar(campanha.id)}
                          className={`${button} border border-[#d9deea] bg-white text-[#344054] hover:bg-[#f3f5f8]`}
                        >
                          Ativar
                        </button>
                      ))}
                    <button
                      disabled={
                        campanha.status !== "ATIVA" ||
                        !campanha.aceitaLinkPublico
                      }
                      onClick={() => void gerarLink(campanha.id)}
                      className={`${button} bg-[#5d3a2e] text-white hover:bg-[#4e3026] disabled:cursor-not-allowed disabled:opacity-45`}
                    >
                      <Link2 className="size-4" />
                      <span className="hidden xl:inline">Gerar link</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Resumo({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-[#687086]">{label}</dt>
      <dd className="text-sm font-semibold text-[#172033]">{value}</dd>
    </div>
  );
}
