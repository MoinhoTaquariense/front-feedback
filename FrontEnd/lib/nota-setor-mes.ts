// Utilitário para buscar a média mensal por setor da API
export async function fetchNotaSetorMensal(token: string) {
  const res = await fetch("/api/backend/estatisticas/setor-mes", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Erro ao buscar nota mensal por setor");
  return res.json();
}
