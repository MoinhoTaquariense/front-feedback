"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface FilterParams {
  periodo?: string
  nome?: string
}

interface FilterContextType {
  filters: FilterParams
  setFilters: (filters: FilterParams) => void
  updateFilter: (key: keyof FilterParams, value: string | undefined) => void
  clearFilters: () => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterParams>({})

  const updateFilter = (key: keyof FilterParams, value: string | undefined) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value || undefined
      }
      console.log('FilterContext - Atualizando filtro:', { key, value, newFilters })
      return newFilters
    })
  }

  const clearFilters = () => {
    setFilters({})
  }

  return (
    <FilterContext.Provider value={{ filters, setFilters, updateFilter, clearFilters }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider')
  }
  return context
}