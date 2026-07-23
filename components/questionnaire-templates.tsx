"use client";

import {
  ClipboardCheck,
  Headphones,
  MessageSquareHeart,
  Star,
} from "lucide-react";

export type TemplateQuestion = {
  tipo: string;
  texto: string;
  obrigatoria: boolean;
  opcoes?: string[];
};
export type QuestionnaireTemplate = {
  id: string;
  nome: string;
  descricao: string;
  icone: "satisfacao" | "atendimento" | "nps";
  perguntas: TemplateQuestion[];
};

export const questionnaireTemplates: QuestionnaireTemplate[] = [
  {
    id: "satisfacao",
    nome: "Satisfação geral",
    descricao: "Pesquisa curta para entender a experiência completa.",
    icone: "satisfacao",
    perguntas: [
      {
        tipo: "ESCALA_5",
        texto: "Como você avalia sua experiência geral?",
        obrigatoria: true,
      },
      {
        tipo: "ESCALA_5",
        texto: "O atendimento atendeu às suas expectativas?",
        obrigatoria: true,
      },
      {
        tipo: "TEXTO_LONGO",
        texto: "O que podemos fazer para melhorar?",
        obrigatoria: false,
      },
    ],
  },
  {
    id: "atendimento",
    nome: "Atendimento",
    descricao: "Avalie clareza, agilidade e resolução da equipe.",
    icone: "atendimento",
    perguntas: [
      {
        tipo: "ESCALA_5",
        texto: "Como você avalia a cordialidade no atendimento?",
        obrigatoria: true,
      },
      {
        tipo: "ESCALA_5",
        texto: "Como você avalia a agilidade da resposta?",
        obrigatoria: true,
      },
      {
        tipo: "UNICA",
        texto: "Sua solicitação foi resolvida?",
        obrigatoria: true,
        opcoes: ["Sim, completamente", "Parcialmente", "Ainda não"],
      },
      {
        tipo: "TEXTO_LONGO",
        texto: "Conte mais sobre sua experiência.",
        obrigatoria: false,
      },
    ],
  },
  {
    id: "nps",
    nome: "NPS",
    descricao: "Meça a probabilidade de recomendação e descubra o motivo.",
    icone: "nps",
    perguntas: [
      {
        tipo: "NPS",
        texto: "De 0 a 10, quanto você recomendaria a Motasa?",
        obrigatoria: true,
      },
      {
        tipo: "TEXTO_LONGO",
        texto: "Qual é o principal motivo da sua nota?",
        obrigatoria: true,
      },
    ],
  },
];

const icons = {
  satisfacao: Star,
  atendimento: Headphones,
  nps: MessageSquareHeart,
};

export function QuestionnaireTemplates({
  onSelect,
  disabled,
}: {
  onSelect: (template: QuestionnaireTemplate) => void;
  disabled?: boolean;
}) {
  return (
    <section className="surface p-5 lg:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#fff1e9] p-2.5 text-[#7a4937]">
          <ClipboardCheck className="size-5" />
        </div>
        <div>
          <h2 className="font-semibold text-[#172033]">Comece com um modelo</h2>
          <p className="mt-1 text-sm text-[#687086]">
            Crie um rascunho com perguntas recomendadas e personalize depois.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {questionnaireTemplates.map((template) => {
          const Icon = icons[template.icone];
          return (
            <button
              key={template.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(template)}
              className="rounded-2xl border border-[#e6e9f0] p-4 text-left transition hover:border-[#c99176] hover:bg-[#fffaf7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon className="size-5 text-[#8b5a46]" />
              <p className="mt-3 font-semibold text-[#172033]">
                {template.nome}
              </p>
              <p className="mt-1 text-sm leading-5 text-[#687086]">
                {template.descricao}
              </p>
              <p className="mt-3 text-xs font-semibold text-[#8b5a46]">
                {template.perguntas.length} perguntas · Usar modelo
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
