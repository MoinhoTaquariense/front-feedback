"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Check, Pencil, Plus, UserPlus, Users, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionTitle, StatusBadge } from "@/components/product-ui";
import { useAuth } from "@/components/auth-context";

type Setor = { id: number; nome: string; descricao?: string; ativo: boolean };
type Usuario = {
  id: number;
  nome: string;
  email: string;
  papel: "RH_MASTER" | "GESTOR_SETOR" | "OPERADOR_RH";
  ativo: boolean;
  setorId: number;
  setor?: Setor;
  setoresAcesso?: Setor[];
};
type Formulario = {
  nome: string;
  email: string;
  senha: string;
  setorId: string;
  papel: Usuario["papel"];
  setorIds: number[];
};
const vazio: Formulario = {
  nome: "",
  email: "",
  senha: "",
  setorId: "",
  papel: "GESTOR_SETOR",
  setorIds: [],
};
const papeis = {
  RH_MASTER: "RH master",
  GESTOR_SETOR: "Gestor de setor",
  OPERADOR_RH: "Operador de RH",
};
const input =
  "mt-1.5 h-11 w-full rounded-xl border border-[#d9deea] bg-white px-3 text-sm outline-none focus:border-[#5d3a2e] focus:ring-4 focus:ring-[#c99176]/20";
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[#c99176]/25";

export default function AdministracaoPage() {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [aba, setAba] = useState("acessos");
  const [form, setForm] = useState<Formulario>(vazio);
  const [editando, setEditando] = useState<number | null>(null);
  const [aberto, setAberto] = useState(false);
  const [notice, setNotice] = useState("");
  const [erro, setErro] = useState("");
  const [novoSetor, setNovoSetor] = useState("");
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
      const [u, s] = await Promise.all([api("/usuarios"), api("/setores")]);
      setUsuarios(u.data || []);
      setSetores(s.data || []);
      setErro("");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Você não tem acesso à administração",
      );
    }
  }, [api, token]);
  useEffect(() => {
    void carregar();
  }, [carregar]);
  function toggleSetor(id: number) {
    setForm((atual) => ({
      ...atual,
      setorIds: atual.setorIds.includes(id)
        ? atual.setorIds.filter((item) => item !== id)
        : [...atual.setorIds, id],
    }));
  }
  function editar(usuario: Usuario) {
    setEditando(usuario.id);
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      setorId: String(usuario.setorId),
      papel: usuario.papel,
      setorIds: (usuario.setoresAcesso || []).map((setor) => setor.id),
    });
    setAberto(true);
  }
  function fechar() {
    setAberto(false);
    setEditando(null);
    setForm(vazio);
  }
  function novoAcesso() {
    setAba("acessos");
    setEditando(null);
    setForm(vazio);
    setNotice("");
    setAberto(true);
  }
  async function salvar(event: FormEvent) {
    event.preventDefault();
    if (!form.setorId) {
      setNotice("Selecione um setor principal.");
      return;
    }
    try {
      const payload = {
        ...form,
        setorId: Number(form.setorId),
        setorIds: [...new Set([Number(form.setorId), ...form.setorIds])],
        ...(editando && !form.senha ? { senha: undefined } : {}),
      };
      await api(editando ? `/usuarios/${editando}` : "/usuarios", {
        method: editando ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setNotice(editando ? "Acesso atualizado." : "Acesso criado.");
      fechar();
      await carregar();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Erro ao salvar");
    }
  }
  async function trocarAcesso(usuario: Usuario) {
    try {
      await api(`/usuarios/${usuario.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ativo: !usuario.ativo }),
      });
      setNotice(usuario.ativo ? "Acesso desativado." : "Acesso reativado.");
      await carregar();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao alterar acesso",
      );
    }
  }
  async function criarSetor(event: FormEvent) {
    event.preventDefault();
    try {
      await api("/setores", {
        method: "POST",
        body: JSON.stringify({ nome: novoSetor }),
      });
      setNovoSetor("");
      setNotice("Setor criado.");
      await carregar();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Erro ao criar setor");
    }
  }
  async function trocarSetor(setor: Setor) {
    try {
      await api(`/setores/${setor.id}`, {
        method: "PUT",
        body: JSON.stringify({ ativo: !setor.ativo }),
      });
      setNotice(setor.ativo ? "Setor inativado." : "Setor reativado.");
      await carregar();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Erro ao alterar setor",
      );
    }
  }
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="rounded-3xl border border-[#e6e9f0] bg-white p-6 shadow-[0_12px_32px_rgba(23,32,51,0.05)] lg:p-8">
          <p className="eyebrow">Administração do RH</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#172033]">
                Pessoas, acessos e setores
              </h1>
              <p className="mt-3 max-w-2xl leading-6 text-[#687086]">
                Controle quem entra na plataforma, o papel de cada pessoa e os
                setores permitidos.
              </p>
            </div>
            <button
              onClick={novoAcesso}
              className={`${button} bg-[#5d3a2e] text-white hover:bg-[#4e3026]`}
            >
              <UserPlus className="size-4" />
              Novo acesso
            </button>
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
        {erro && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {erro}
          </div>
        )}
        <div className="flex gap-2 border-b border-[#e6e9f0]">
          <button
            onClick={() => setAba("acessos")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold ${aba === "acessos" ? "border-[#5d3a2e] text-[#5d3a2e]" : "border-transparent text-[#687086]"}`}
          >
            Acessos ({usuarios.length})
          </button>
          <button
            onClick={() => setAba("setores")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold ${aba === "setores" ? "border-[#5d3a2e] text-[#5d3a2e]" : "border-transparent text-[#687086]"}`}
          >
            Setores ({setores.length})
          </button>
        </div>
        {aba === "acessos" ? (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <Metric
                label="Acessos ativos"
                value={usuarios.filter((usuario) => usuario.ativo).length}
              />
              <Metric
                label="Gestores"
                value={
                  usuarios.filter((usuario) => usuario.papel === "GESTOR_SETOR")
                    .length
                }
              />
              <Metric
                label="Setores ativos"
                value={setores.filter((setor) => setor.ativo).length}
              />
            </section>
            {aberto && (
              <section className="surface p-5 lg:p-6">
                <SectionTitle
                  title={editando ? "Editar acesso" : "Criar acesso"}
                  description="A senha deve ter pelo menos seis caracteres; deixe-a vazia ao editar para mantê-la."
                  action={
                    <button
                      onClick={fechar}
                      className="rounded-lg p-2 text-[#687086]"
                    >
                      <X className="size-4" />
                    </button>
                  }
                />
                <form
                  onSubmit={salvar}
                  className="mt-5 grid gap-4 md:grid-cols-2"
                >
                  <label className="text-sm font-medium">
                    Nome
                    <input
                      required
                      value={form.nome}
                      onChange={(event) =>
                        setForm({ ...form, nome: event.target.value })
                      }
                      className={input}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    E-mail
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                      className={input}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    {editando ? "Nova senha (opcional)" : "Senha temporária"}
                    <input
                      required={!editando}
                      minLength={6}
                      type="password"
                      value={form.senha}
                      onChange={(event) =>
                        setForm({ ...form, senha: event.target.value })
                      }
                      className={input}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Papel
                    <select
                      value={form.papel}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          papel: event.target.value as Usuario["papel"],
                        })
                      }
                      className={input}
                    >
                      {Object.entries(papeis).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium md:col-span-2">
                    Setor principal
                    <select
                      required
                      value={form.setorId}
                      onChange={(event) =>
                        setForm({ ...form, setorId: event.target.value })
                      }
                      className={input}
                    >
                      <option value="">Selecione</option>
                      {setores
                        .filter((setor) => setor.ativo)
                        .map((setor) => (
                          <option key={setor.id} value={setor.id}>
                            {setor.nome}
                          </option>
                        ))}
                    </select>
                  </label>
                  <div className="rounded-2xl bg-[#fafbfe] p-4 md:col-span-2">
                    <p className="text-sm font-semibold">
                      Setores adicionais de acesso
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {setores
                        .filter((setor) => setor.ativo)
                        .map((setor) => (
                          <button
                            key={setor.id}
                            type="button"
                            onClick={() => toggleSetor(setor.id)}
                            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${form.setorIds.includes(setor.id) ? "border-[#5d3a2e] bg-[#fff8f4] text-[#5d3a2e]" : "border-[#d9deea]"}`}
                          >
                            {form.setorIds.includes(setor.id) && (
                              <Check className="size-3" />
                            )}
                            {setor.nome}
                          </button>
                        ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <button
                      className={`${button} bg-[#5d3a2e] text-white hover:bg-[#4e3026]`}
                    >
                      {editando ? "Salvar alterações" : "Criar acesso"}
                    </button>
                  </div>
                </form>
              </section>
            )}
            <section className="surface p-5 lg:p-6">
              <SectionTitle
                title="Pessoas com acesso"
                description="Desative acessos sem apagar o histórico."
              />
              {usuarios.length ? (
                <div className="mt-5 overflow-x-auto rounded-2xl border border-[#e6e9f0]">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-[#fafbfe] text-xs font-bold uppercase tracking-wide text-[#8a92a4]">
                      <tr>
                        <th className="px-5 py-3">Pessoa</th>
                        <th className="px-5 py-3">Papel</th>
                        <th className="px-5 py-3">Setores</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((usuario) => (
                        <tr
                          key={usuario.id}
                          className="border-t border-[#edf0f5]"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[#172033]">
                              {usuario.nome}
                            </p>
                            <p className="text-xs text-[#687086]">
                              {usuario.email}
                            </p>
                          </td>
                          <td className="px-5 py-4">{papeis[usuario.papel]}</td>
                          <td className="px-5 py-4 text-[#687086]">
                            {(usuario.setoresAcesso || [])
                              .map((setor) => setor.nome)
                              .join(", ") ||
                              usuario.setor?.nome ||
                              "-"}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge
                              value={usuario.ativo ? "ATIVO" : "INATIVO"}
                            />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => editar(usuario)}
                                className={`${button} border border-[#d9deea] bg-white text-[#344054]`}
                              >
                                <Pencil className="size-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => void trocarAcesso(usuario)}
                                className={`${button} ${usuario.ativo ? "border border-red-200 bg-white text-red-700" : "bg-[#5d3a2e] text-white"}`}
                              >
                                {usuario.ativo ? "Desativar" : "Reativar"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-5">
                  <EmptyState
                    title="Nenhum acesso"
                    description="Crie o primeiro acesso para gestores e operadores."
                  />
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <section className="surface p-5 lg:p-6">
              <SectionTitle
                title="Criar setor"
                description="Setores organizam permissões, campanhas e resultados."
              />
              <form onSubmit={criarSetor} className="mt-5 flex flex-wrap gap-3">
                <input
                  required
                  value={novoSetor}
                  onChange={(event) => setNovoSetor(event.target.value)}
                  placeholder="Ex.: Pós-venda"
                  className="h-11 min-w-64 flex-1 rounded-xl border border-[#d9deea] px-3 text-sm"
                />
                <button className={`${button} bg-[#5d3a2e] text-white`}>
                  <Plus className="size-4" />
                  Criar
                </button>
              </form>
            </section>
            <section className="surface p-5 lg:p-6">
              <SectionTitle
                title="Setores cadastrados"
                description="Inative um setor quando ele não receberá novas campanhas ou acessos."
              />
              {setores.length ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {setores.map((setor) => (
                    <article
                      key={setor.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[#e6e9f0] p-4"
                    >
                      <div>
                        <p className="font-semibold text-[#172033]">
                          {setor.nome}
                        </p>
                        <div className="mt-2">
                          <StatusBadge
                            value={setor.ativo ? "ATIVO" : "INATIVO"}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => void trocarSetor(setor)}
                        className={`${button} ${setor.ativo ? "border border-red-200 bg-white text-red-700" : "bg-[#5d3a2e] text-white"}`}
                      >
                        {setor.ativo ? "Inativar" : "Reativar"}
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5">
                  <EmptyState
                    title="Nenhum setor"
                    description="Crie setores antes de atribuir acessos."
                  />
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#687086]">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-[#172033]">{value}</p>
        </div>
        <Users className="size-5 text-[#8b5a46]" />
      </div>
    </article>
  );
}
