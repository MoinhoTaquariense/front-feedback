// Utilitário para buscar a média semanal por setor da API
export async function fetchNotaSetorSemanal(token: string) {
  const res = await fetch("/api/backend/estatisticas/setor-semana", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Erro ao buscar nota semanal por setor");
  return res.json();
}
