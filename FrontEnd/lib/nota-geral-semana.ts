// Utilitário para buscar a média geral semanal da API
export async function fetchNotaGeralSemanal(token: string) {
  const res = await fetch("/api/backend/estatisticas/geral-semana", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Erro ao buscar nota geral semanal");
  return res.json();
}
