// Utilitário para buscar a média diária por setor da API
export async function fetchNotaSetorDiaria(token: string) {
  const res = await fetch("/api/backend/estatisticas/setor-dia", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Erro ao buscar nota diária por setor");
  return res.json();
}
