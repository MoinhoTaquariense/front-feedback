"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionTitle } from "@/components/product-ui";
import { useAuth } from "@/components/auth-context";

type Setor = { id: number; nome: string };
type Colaborador = {
  id: number;
  numeroidentificacao: string;
  nomecompleto: string;
  email: string;
  cargo?: string | null;
  setor?: string | null;
};

const campo =
  "mt-1.5 h-11 w-full rounded-xl border border-[#d9deea] bg-white px-3 text-sm text-[#172033] outline-none transition focus:border-[#5d3a2e] focus:ring-4 focus:ring-[#c99176]/20";

export default function ColaboradoresPage() {
  const { token } = useAuth();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [form, setForm] = useState({
    nomecompleto: "",
    numeroidentificacao: "",
    email: "",
    cargo: "",
    setorId: "",
  });
  const [notice, setNotice] = useState("");
  const [salvando, setSalvando] = useState(false);

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
        throw new Error(data.message || "Nao foi possivel concluir a operacao");
      return data;
    },
    [token],
  );

  const carregar = useCallback(async () => {
    if (!token) return;
    try {
      const [pessoas, setoresData] = await Promise.all([
        api("/colaboradores"),
        api("/setores"),
      ]);
      const proximosSetores: Setor[] = setoresData.data || [];
      setColaboradores(pessoas.data || []);
      setSetores(proximosSetores);
      setForm((atual) => ({
        ...atual,
        setorId: atual.setorId || String(proximosSetores[0]?.id || ""),
      }));
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Erro ao carregar funcionarios",
      );
    }
  }, [api, token]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function cadastrar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvando(true);
    try {
      await api("/colaboradores", {
        method: "POST",
        body: JSON.stringify({ ...form, setorId: Number(form.setorId) }),
      });
      setForm((atual) => ({
        nomecompleto: "",
        numeroidentificacao: "",
        email: "",
        cargo: "",
        setorId: atual.setorId,
      }));
      setNotice("Funcionario cadastrado com sucesso.");
      await carregar();
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Erro ao cadastrar funcionario",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="rounded-3xl border border-[#e6e9f0] bg-white p-6 shadow-[0_12px_32px_rgba(23,32,51,0.05)] lg:p-8">
          <p className="eyebrow">Base de participantes</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172033]">
            Funcionarios
          </h1>
          <p className="mt-3 max-w-2xl leading-6 text-[#687086]">
            Cadastre participantes para convites individuais. Voce visualiza e
            cadastra somente nos setores permitidos ao seu acesso.
          </p>
        </section>

        {notice && (
          <p
            role="status"
            className="rounded-2xl border border-[#ead8ce] bg-[#fff8f4] px-4 py-3 text-sm text-[#704435]"
          >
            {notice}
          </p>
        )}

        <section className="surface p-5 lg:p-6">
          <SectionTitle
            title="Cadastrar funcionario"
            description="Informe os dados basicos e o setor responsavel."
          />
          <form
            onSubmit={cadastrar}
            className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            <Campo
              label="Nome completo"
              value={form.nomecompleto}
              onChange={(nomecompleto) =>
                setForm((atual) => ({ ...atual, nomecompleto }))
              }
              required
            />
            <Campo
              label="Email"
              type="email"
              value={form.email}
              onChange={(email) => setForm((atual) => ({ ...atual, email }))}
              required
            />
            <Campo
              label="Identificacao"
              value={form.numeroidentificacao}
              onChange={(numeroidentificacao) =>
                setForm((atual) => ({ ...atual, numeroidentificacao }))
              }
              required
            />
            <Campo
              label="Cargo"
              value={form.cargo}
              onChange={(cargo) => setForm((atual) => ({ ...atual, cargo }))}
            />
            <label className="text-sm font-medium text-[#344054]">
              Setor
              <select
                required
                value={form.setorId}
                onChange={(event) =>
                  setForm((atual) => ({
                    ...atual,
                    setorId: event.target.value,
                  }))
                }
                className={campo}
              >
                <option value="">Selecione</option>
                {setores.map((setor) => (
                  <option key={setor.id} value={setor.id}>
                    {setor.nome}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button
                disabled={salvando || !setores.length}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5d3a2e] px-4 text-sm font-semibold text-white hover:bg-[#4e3026] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="size-4" />
                {salvando ? "Cadastrando..." : "Cadastrar"}
              </button>
            </div>
          </form>
        </section>

        <section className="surface p-5 lg:p-6">
          <SectionTitle
            title="Funcionarios no seu escopo"
            description={`${colaboradores.length} pessoa${colaboradores.length === 1 ? "" : "s"} disponivel${colaboradores.length === 1 ? "" : "is"}.`}
          />
          {colaboradores.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                title="Nenhum funcionario cadastrado"
                description="Cadastre a primeira pessoa para usar convites individuais."
              />
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-2xl border border-[#e6e9f0]">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-[#fafbfe] text-xs font-bold uppercase tracking-wide text-[#8a92a4]">
                  <tr>
                    <th className="px-5 py-3">Funcionario</th>
                    <th className="px-5 py-3">Identificacao</th>
                    <th className="px-5 py-3">Setor</th>
                    <th className="px-5 py-3">Cargo</th>
                  </tr>
                </thead>
                <tbody>
                  {colaboradores.map((colaborador) => (
                    <tr
                      key={colaborador.id}
                      className="border-t border-[#edf0f5]"
                    >
                      <td className="px-5 py-4">
                        <p className="flex items-center gap-2 font-semibold text-[#172033]">
                          <Users className="size-4 text-[#8b5a46]" />
                          {colaborador.nomecompleto}
                        </p>
                        <p className="mt-1 text-xs text-[#687086]">
                          {colaborador.email}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-[#687086]">
                        {colaborador.numeroidentificacao}
                      </td>
                      <td className="px-5 py-4 text-[#687086]">
                        {colaborador.setor || "-"}
                      </td>
                      <td className="px-5 py-4 text-[#687086]">
                        {colaborador.cargo || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium text-[#344054]">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={campo}
      />
    </label>
  );
}
