"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, TrendingUp, FileText } from "lucide-react"
import { useFilters } from "@/components/filter-context"
import { useState } from "react"
import { 
  PERIODOS, 
  getPeriodoByBackendValue,
  getPeriodoByValue
} from "@/lib/departamentos"

export function FiltersSidebar() {
  const { filters, updateFilter, clearFilters } = useFilters()
  const [localNome, setLocalNome] = useState(filters.nome || "")

  const handlePeriodoChange = (value: string) => {
    const periodo = getPeriodoByValue(value)
    console.log('Período selecionado:', { value, periodo, backendValue: periodo?.backendValue })
    updateFilter('periodo', periodo?.backendValue)
  }

  const handleApplyFilters = () => {
    updateFilter('nome', localNome.trim() || undefined)
  }

  const handleClearFilters = () => {
    clearFilters()
    setLocalNome("")
  }

  // Get current values for display
  const currentPeriodo = filters.periodo ? getPeriodoByBackendValue(filters.periodo) : null

  return (
    <div className="w-80 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-black">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-black mb-2 block">Período</label>
            <Select value={currentPeriodo?.value || ""} onValueChange={handlePeriodoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent>
                {PERIODOS.map((periodo) => (
                  <SelectItem key={periodo.value} value={periodo.value}>
                    {periodo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-black mb-2 block">Buscar</label>
            <Input 
              placeholder="Nome ou ID..." 
              value={localNome}
              onChange={(e) => setLocalNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilters()
                }
              }}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleApplyFilters} className="flex-1 text-white" style={{ backgroundColor: "#693019" }}>
              Aplicar
            </Button>
            <Button onClick={handleClearFilters} variant="outline" className="flex-1 bg-transparent text-black">
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
