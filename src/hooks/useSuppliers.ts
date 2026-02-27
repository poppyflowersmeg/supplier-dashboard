import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '../lib/supabase'
import { dbToSupplier, supplierToDB } from '../lib/types'
import type { Supplier } from '../lib/types'

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await db.from('partners').select('*').order('id')
      if (error) throw error
      return data.map(dbToSupplier)
    },
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (supplier: Omit<Supplier, 'id' | 'priority'>) => {
      const { data, error } = await db.from('partners').insert(supplierToDB(supplier)).select().single()
      if (error) throw error
      return dbToSupplier(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, priority: _priority, ...supplier }: Supplier) => {
      const { error } = await db.from('partners').update(supplierToDB(supplier)).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error, count } = await db.from('partners').delete({ count: 'exact' }).eq('id', id)
      if (error || count === 0) throw new Error("You don't have permission to delete partners")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
    },
  })
}
