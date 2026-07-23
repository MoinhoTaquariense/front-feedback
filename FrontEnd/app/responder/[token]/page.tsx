"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  HeartHandshake,
  LockKeyhole,
  Send,
} from "lucide-react";
import Image from "next/image";

type Opcao = { id: number; valor: string; rotulo: string };
type Condicao = {
  perguntaId: number;
  operador:
    | "IGUAL"
    | "DIFERENTE"
    | "CONTEM"
    | "NAO_CONTEM"
    | "MAIOR_IGUAL"
    | "MENOR_IGUAL";
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
type Formulario = {
  campanha: { nome: string; instrucoes?: string };
  questionario: { nome: string; versao: number };
  perguntas: Pergunta[];
};
type Valores = Record<number, string | string[]>;

const SEGUNDOS_POR_TIPO: Record<string, number> = {
  ESCALA_5: 10,
  NPS: 10,
  UNICA: 12,
  MULTIPLA: 18,
  TEXTO_CURTO: 35,
  TEXTO_LONGO: 75,
  INSTRUCAO: 8,
};

function estimarDuracaoMinutos(perguntas: Pergunta[]) {
  const segundos = perguntas.reduce(
    (total, pergunta) => total + (SEGUNDOS_POR_TIPO[pergunta.tipo] || 15),
    15,
  );
  return Math.max(1, Math.ceil(segundos / 60));
}

function perguntaVisivel(pergunta: Pergunta, valores: Valores) {
  const condicao = pergunta.condicao;
  if (!condicao) return true;
  const resposta = valores[condicao.perguntaId];
  if (!resposta || (Array.isArray(resposta) && !resposta.length)) return false;
  const itens = (Array.isArray(resposta) ? resposta : [resposta]).map(String);
  const esperado = String(condicao.valor ?? "");
  if (condicao.operador === "IGUAL") return itens.includes(esperado);
  if (condicao.operador === "DIFERENTE")
    return itens.every((item) => item !== esperado);
  if (condicao.operador === "CONTEM")
    return itens.some((item) =>
      item.toLowerCase().includes(esperado.toLowerCase()),
    );
  if (condicao.operador === "NAO_CONTEM")
    return itens.every(
      (item) => !item.toLowerCase().includes(esperado.toLowerCase()),
    );
  const numero = Number(itens[0]);
  const limite = Number(condicao.valor);
  if (!Number.isFinite(numero) || !Number.isFinite(limite)) return false;
  return condicao.operador === "MAIOR_IGUAL"
    ? numero >= limite
    : numero <= limite;
}

function mensagemDeLink(mensagem: string) {
  const texto = mensagem.toLowerCase();
  if (texto.includes("expir"))
    return {
      titulo: "Este link expirou",
      descricao:
        "A campanha nao esta mais recebendo respostas. Solicite um novo convite a pessoa que compartilhou esta pesquisa.",
    };
  if (texto.includes("usad") || texto.includes("respond"))
    return {
      titulo: "Esta resposta ja foi registrada",
      descricao:
        "Agradecemos sua participacao. Cada convite pode ser respondido apenas uma vez.",
    };
  return {
    titulo: "Nao foi possivel abrir a pesquisa",
    descricao: mensagem || "Confira o link ou solicite um novo convite.",
  };
}

function criarIdParticipacao() {
  if (typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  if (typeof window.crypto?.getRandomValues === "function") {
    const valores = new Uint32Array(4);
    window.crypto.getRandomValues(valores);
    return Array.from(valores, (valor) => valor.toString(36)).join("-");
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export default function ResponderPage() {
  const params = useParams<{ token: string }>();
  const token = String(params.token || "");
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [valores, setValores] = useState<Valores>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [participacaoId, setParticipacaoId] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(
    "Carregando pesquisa...",
  );
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [sending, setSending] = useState(false);
  const [completed, setCompleted] = useState(false);

  const carregar = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`/api/backend/responder/${token}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message);
      setFormulario(data.data);
      setLoadingMessage("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nao foi possivel abrir a pesquisa",
      );
    }
  }, [token]);
  useEffect(() => {
    void carregar();
  }, [carregar]);
  useEffect(() => {
    if (!token) return;
    const participationKey = `avaliacao:${token}`;
    let id = window.localStorage.getItem(participationKey);
    if (!id) {
      id = criarIdParticipacao();
      window.localStorage.setItem(participationKey, id);
    }
    setParticipacaoId(id);
    try {
      const draft = window.sessionStorage.getItem(
        `rascunho-avaliacao:${token}`,
      );
      if (draft) setValores(JSON.parse(draft));
    } catch {
      window.sessionStorage.removeItem(`rascunho-avaliacao:${token}`);
    }
  }, [token]);
  useEffect(() => {
    if (token && formulario && !completed)
      window.sessionStorage.setItem(
        `rascunho-avaliacao:${token}`,
        JSON.stringify(valores),
      );
  }, [completed, formulario, token, valores]);

  const perguntasVisiveis = useMemo(
    () =>
      (formulario?.perguntas || []).filter((item) =>
        perguntaVisivel(item, valores),
      ),
    [formulario, valores],
  );
  useEffect(() => {
    setCurrentIndex((indice) =>
      Math.min(indice, Math.max(0, perguntasVisiveis.length - 1)),
    );
  }, [perguntasVisiveis.length]);
  const pergunta = perguntasVisiveis[currentIndex];
  const totalPerguntas = perguntasVisiveis.length;
  const progresso = totalPerguntas
    ? Math.round(((currentIndex + 1) / totalPerguntas) * 100)
    : 0;
  const duracao = useMemo(
    () => estimarDuracaoMinutos(perguntasVisiveis),
    [perguntasVisiveis],
  );
  function valorAtual(id: number) {
    return valores[id];
  }
  function atualizar(id: number, value: string | string[]) {
    setValores((atuais) => ({ ...atuais, [id]: value }));
    setFieldError("");
  }
  function valido(perguntaAtual: Pergunta) {
    if (!perguntaAtual.obrigatoria || perguntaAtual.tipo === "INSTRUCAO")
      return true;
    const valor = valorAtual(perguntaAtual.id);
    return Array.isArray(valor) ? valor.length > 0 : Boolean(valor?.trim());
  }
  function avancar() {
    if (!pergunta) return;
    if (!valido(pergunta)) {
      setFieldError(
        "Esta pergunta e obrigatoria. Selecione ou escreva uma resposta para continuar.",
      );
      return;
    }
    setCurrentIndex((indice) => Math.min(indice + 1, totalPerguntas - 1));
    setFieldError("");
  }
  async function enviar() {
    if (!formulario || !participacaoId) return;
    if (pergunta && !valido(pergunta)) {
      setFieldError(
        "Esta pergunta e obrigatoria. Selecione ou escreva uma resposta para enviar.",
      );
      return;
    }
    setSending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/backend/responder/${token}/respostas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participacaoId,
            respostas: Object.entries(valores).map(([perguntaId, valor]) => ({
              perguntaId: Number(perguntaId),
              valor,
            })),
          }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message);
      window.sessionStorage.removeItem(`rascunho-avaliacao:${token}`);
      setCompleted(true);
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Nao foi possivel enviar sua resposta",
      );
    } finally {
      setSending(false);
    }
  }

  if (error && !formulario) {
    const state = mensagemDeLink(error);
    return (
      <PublicState
        title={state.titulo}
        description={state.descricao}
        icon="error"
      />
    );
  }
  if (!formulario)
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] p-6">
        <div className="rounded-3xl border border-[#e6e9f0] bg-white px-8 py-10 text-center shadow-sm">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-[#ead8ce] border-t-[#5d3a2e]" />
          <p className="mt-4 text-sm text-[#687086]">{loadingMessage}</p>
        </div>
      </main>
    );
  if (completed)
    return (
      <PublicState
        title="Obrigado por compartilhar sua opiniao"
        description="Sua resposta foi registrada com sucesso e ajudara a melhorar a experiencia que oferecemos."
        icon="success"
      />
    );
  if (!pergunta)
    return (
      <PublicState
        title="Pesquisa sem perguntas"
        description="Esta pesquisa ainda nao possui perguntas disponiveis para resposta."
        icon="error"
      />
    );

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[#e6e9f0]">
              <Image
                src="/images/logoMotMenor.png"
                alt="Motasa"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#172033]">Motasa</p>
              <p className="text-xs text-[#8a92a4]">Pesquisa de experiencia</p>
            </div>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#687086] shadow-sm ring-1 ring-[#e6e9f0]">
            Etapa {currentIndex + 1} de {totalPerguntas}
          </span>
        </header>
        <section className="overflow-hidden rounded-3xl border border-[#e6e9f0] bg-white shadow-[0_16px_40px_rgba(23,32,51,0.08)]">
          <div className="h-1.5 bg-[#edf0f5]">
            <div
              className="h-full rounded-r-full bg-[#5d3a2e] transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <div className="p-6 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b5a46]">
              {formulario.campanha.nome}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#172033] sm:text-3xl">
              {formulario.questionario.nome}
            </h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#687086]">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-4 text-[#8b5a46]" />
                Cerca de {duracao} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole className="size-4 text-[#8b5a46]" />
                Resposta confidencial
              </span>
            </div>
            {currentIndex === 0 && (
              <p className="mt-5 rounded-2xl bg-[#fff8f4] p-4 text-sm leading-6 text-[#704435]">
                {formulario.campanha.instrucoes ||
                  "Sua opiniao e importante. Responda com sinceridade; isso leva apenas alguns minutos."}
                <span className="mt-2 block text-xs text-[#8a5a48]">
                  A estimativa considera o tipo de cada pergunta e se ajusta se
                  surgirem etapas condicionais.
                </span>
              </p>
            )}
            <div className="mt-8 border-t border-[#edf0f5] pt-7">
              {pergunta.tipo === "INSTRUCAO" ? (
                <div className="rounded-2xl bg-[#fafbfe] p-5">
                  <HeartHandshake className="size-6 text-[#8b5a46]" />
                  <h2 className="mt-3 text-xl font-semibold text-[#172033]">
                    {pergunta.texto}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#687086]">
                    Leia esta orientacao e avance quando estiver pronto.
                  </p>
                </div>
              ) : (
                <QuestionInput
                  pergunta={pergunta}
                  valor={valorAtual(pergunta.id)}
                  onChange={(value) => atualizar(pergunta.id, value)}
                />
              )}
            </div>
            {fieldError && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {fieldError}
              </p>
            )}
            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {error}
              </p>
            )}
            <footer className="mt-8 flex items-center justify-between gap-3 border-t border-[#edf0f5] pt-6">
              <button
                type="button"
                onClick={() => {
                  setCurrentIndex((indice) => Math.max(indice - 1, 0));
                  setFieldError("");
                }}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#687086] hover:bg-[#f3f5f8] disabled:invisible"
              >
                <ChevronLeft className="size-4" />
                Voltar
              </button>
              {currentIndex === totalPerguntas - 1 ? (
                <button
                  type="button"
                  onClick={() => void enviar()}
                  disabled={sending || !participacaoId}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#5d3a2e] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4e3026] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="size-4" />
                  {sending ? "Enviando..." : "Enviar resposta"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={avancar}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#5d3a2e] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4e3026]"
                >
                  Continuar
                  <ChevronRight className="size-4" />
                </button>
              )}
            </footer>
          </div>
        </section>
        <p className="mt-5 text-center text-xs leading-5 text-[#8a92a4]">
          Suas respostas sao utilizadas somente para esta pesquisa. Nao envie
          dados sensiveis.
        </p>
      </div>
    </main>
  );
}

function QuestionInput({
  pergunta,
  valor,
  onChange,
}: {
  pergunta: Pergunta;
  valor: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}) {
  const escala = pergunta.tipo === "ESCALA_5" || pergunta.tipo === "NPS";
  const numeros = Array.from(
    { length: pergunta.tipo === "NPS" ? 11 : 5 },
    (_, index) => (pergunta.tipo === "NPS" ? index : index + 1),
  );
  return (
    <div>
      <div className="flex gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#fff1e9] text-xs font-bold text-[#7a4937]">
          {pergunta.ordem}
        </span>
        <div>
          <h2 className="text-xl font-semibold leading-8 text-[#172033]">
            {pergunta.texto}
          </h2>
          {pergunta.obrigatoria && (
            <p className="mt-1 text-xs font-medium text-[#b54708]">
              Resposta obrigatoria
            </p>
          )}
        </div>
      </div>
      {escala ? (
        <div
          className={`mt-7 grid gap-2 ${pergunta.tipo === "NPS" ? "grid-cols-6 sm:grid-cols-11" : "grid-cols-5"}`}
        >
          {numeros.map((numero) => (
            <button
              key={numero}
              type="button"
              onClick={() => onChange(String(numero))}
              className={`min-h-12 rounded-xl border text-sm font-semibold transition ${String(valor || "") === String(numero) ? "border-[#5d3a2e] bg-[#5d3a2e] text-white shadow-sm" : "border-[#d9deea] bg-white text-[#344054] hover:border-[#c99176] hover:bg-[#fff8f4]"}`}
            >
              {numero}
            </button>
          ))}
        </div>
      ) : pergunta.tipo === "UNICA" ? (
        <div className="mt-6 space-y-2">
          {pergunta.opcoes.map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              onClick={() => onChange(String(opcao.id))}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition ${String(valor || "") === String(opcao.id) ? "border-[#5d3a2e] bg-[#fff8f4] text-[#5d3a2e]" : "border-[#d9deea] text-[#344054] hover:border-[#c99176]"}`}
            >
              <span
                className={`size-4 rounded-full border-4 ${String(valor || "") === String(opcao.id) ? "border-[#5d3a2e] bg-white" : "border-[#d0d5dd] bg-white"}`}
              />
              {opcao.rotulo}
            </button>
          ))}
        </div>
      ) : pergunta.tipo === "MULTIPLA" ? (
        <div className="mt-6 space-y-2">
          {pergunta.opcoes.map((opcao) => {
            const selecionados = Array.isArray(valor) ? valor : [];
            const marcado = selecionados.includes(String(opcao.id));
            return (
              <button
                key={opcao.id}
                type="button"
                onClick={() =>
                  onChange(
                    marcado
                      ? selecionados.filter((item) => item !== String(opcao.id))
                      : [...selecionados, String(opcao.id)],
                  )
                }
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition ${marcado ? "border-[#5d3a2e] bg-[#fff8f4] text-[#5d3a2e]" : "border-[#d9deea] text-[#344054] hover:border-[#c99176]"}`}
              >
                <span
                  className={`flex size-4 items-center justify-center rounded border ${marcado ? "border-[#5d3a2e] bg-[#5d3a2e] text-white" : "border-[#d0d5dd] bg-white"}`}
                >
                  {marcado && <CheckCircle2 className="size-3" />}
                </span>
                {opcao.rotulo}
              </button>
            );
          })}
        </div>
      ) : (
        <textarea
          value={typeof valor === "string" ? valor : ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            pergunta.tipo === "TEXTO_LONGO"
              ? "Escreva sua resposta aqui..."
              : "Digite sua resposta"
          }
          className="mt-6 min-h-32 w-full rounded-2xl border border-[#d9deea] bg-white px-4 py-3 text-sm leading-6 text-[#172033] outline-none transition placeholder:text-[#98a2b3] focus:border-[#5d3a2e] focus:ring-4 focus:ring-[#c99176]/20"
        />
      )}
    </div>
  );
}

function PublicState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: "success" | "error";
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] p-5">
      <section className="w-full max-w-md rounded-3xl border border-[#e6e9f0] bg-white p-8 text-center shadow-[0_16px_40px_rgba(23,32,51,0.08)]">
        <div
          className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${icon === "success" ? "bg-emerald-50 text-emerald-600" : "bg-[#fff1e9] text-[#8b5a46]"}`}
        >
          {icon === "success" ? (
            <CheckCircle2 className="size-7" />
          ) : (
            <HeartHandshake className="size-7" />
          )}
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[#172033]">
          {title}
        </h1>
        <p className="mt-3 leading-6 text-[#687086]">{description}</p>
        <p className="mt-7 text-xs text-[#8a92a4]">Motasa Feedbacks</p>
      </section>
    </main>
  );
}
