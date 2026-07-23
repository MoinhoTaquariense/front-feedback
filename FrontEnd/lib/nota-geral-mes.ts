// Utilitário para buscar a média geral mensal da API
export async function fetchNotaGeralMensal(token: string) {
  const res = await fetch("/api/backend/estatisticas/geral-mes", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Erro ao buscar nota geral mensal");
  return res.json();
}
