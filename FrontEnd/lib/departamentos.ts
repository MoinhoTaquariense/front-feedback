// Mapeamento de departamentos/setores
export interface Departamento {
  id: string
  nome: string
  label: string
}

export const DEPARTAMENTOS: Departamento[] = [
  { id: "1", nome: "comercial", label: "Comercial" },
  { id: "2", nome: "marketing", label: "Marketing" },
  { id: "3", nome: "ti", label: "TI" },
  { id: "4", nome: "rh", label: "Recursos Humanos" },
  { id: "5", nome: "financeiro", label: "Financeiro" },
  { id: "6", nome: "operacoes", label: "Operações" },
]

// Função para obter departamento por ID
export function getDepartamentoById(id: string): Departamento | undefined {
  return DEPARTAMENTOS.find(dept => dept.id === id)
}

// Função para obter departamento por nome
export function getDepartamentoByNome(nome: string): Departamento | undefined {
  return DEPARTAMENTOS.find(dept => dept.nome === nome)
}

// Função para obter ID do departamento pelo nome
export function getDepartamentoIdByNome(nome: string): string | undefined {
  const departamento = getDepartamentoByNome(nome)
  return departamento?.id
}

// Função para obter nome do departamento pelo ID
export function getDepartamentoNomeById(id: string): string | undefined {
  const departamento = getDepartamentoById(id)
  return departamento?.nome
}

// Mapeamento de períodos válidos
export interface Periodo {
  value: string
  label: string
  backendValue: string
}

export const PERIODOS: Periodo[] = [
  { value: "1-dia", label: "Último Dia", backendValue: "1D" },
  { value: "7-dias", label: "Últimos 7 Dias", backendValue: "7D" },
  { value: "30-dias", label: "Últimos 30 Dias", backendValue: "30D" },
  { value: "3-meses", label: "Últimos 3 Meses", backendValue: "3M" },
  { value: "6-meses", label: "Últimos 6 Meses", backendValue: "6M" },
  { value: "1-ano", label: "Último Ano", backendValue: "1A" },
  { value: "2-anos", label: "Últimos 2 Anos", backendValue: "2A" },
]

// Função para obter período por value
export function getPeriodoByValue(value: string): Periodo | undefined {
  return PERIODOS.find(periodo => periodo.value === value)
}

// Função para obter período por backend value
export function getPeriodoByBackendValue(backendValue: string): Periodo | undefined {
  return PERIODOS.find(periodo => periodo.backendValue === backendValue)
}