// Utilitário para buscar a nota geral diária da API
export async function fetchNotaGeralDiaria(token: string) {
  const res = await fetch("/api/backend/estatisticas/geral-dia", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Erro ao buscar nota geral diária");
  return res.json();
}
