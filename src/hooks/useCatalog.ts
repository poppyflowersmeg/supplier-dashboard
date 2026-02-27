import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '../lib/supabase'
import { dbToCatalogItem, catalogItemToDB } from '../lib/types'
import type { CatalogItem } from '../lib/types'

export function useCatalog() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: async () => {
      const pageSize = 1000
      let allRows: Record<string, unknown>[] = []
      let page = 0
      while (true) {
        const from = page * pageSize
        const { data, error } = await db.from('catalog').select('*').order('id').range(from, from + pageSize - 1)
        if (error) throw error
        allRows = allRows.concat(data)
        if (data.length < pageSize) break
        page++
      }
      return allRows.map(dbToCatalogItem)
    },
  })
}

export function useCreateCatalogItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (item: Omit<CatalogItem, 'id'>) => {
      const { data, error } = await db.from('catalog').insert(catalogItemToDB(item)).select().single()
      if (error) throw error
      return dbToCatalogItem(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
    },
  })
}

export function useUpdateCatalogItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...item }: CatalogItem) => {
      const { error } = await db.from('catalog').update(catalogItemToDB(item)).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
    },
  })
}

export function useDeleteCatalogItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await db.from('catalog').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
    },
  })
}
