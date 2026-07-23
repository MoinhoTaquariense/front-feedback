// Função para buscar dados do setor por ano
export async function fetchNotaSetorAno(token: string) {
  const res = await fetch("/api/backend/estatisticas/setor-ano", {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Erro ao buscar dados do setor por ano");
  const data = await res.json();
  // Espera-se um array de 12 números
  if (!Array.isArray(data) || data.length !== 12) throw new Error("Formato de resposta inesperado");
  return data;
}
