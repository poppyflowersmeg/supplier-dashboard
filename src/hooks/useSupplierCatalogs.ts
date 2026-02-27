import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '../lib/supabase'
import type { SupplierCatalogEntry } from '../lib/types'

export function useSupplierCatalogs(supplierId: number) {
  return useQuery({
    queryKey: ['supplierCatalogs', supplierId],
    queryFn: async () => {
      const { data, error } = await db
        .from('supplierCatalogs')
        .select('*')
        .eq('supplierId', supplierId)
        .order('id')
      if (error) throw error
      return data as SupplierCatalogEntry[]
    },
    enabled: supplierId > 0,
  })
}

export function useAddCatalogLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ supplierId, label, url }: { supplierId: number; label: string; url: string }) => {
      const { data, error } = await db
        .from('supplierCatalogs')
        .insert({ supplierId, label, url, type: 'link' })
        .select()
        .single()
      if (error) throw error
      return data as SupplierCatalogEntry
    },
    onSuccess: (_, { supplierId }) => {
      queryClient.invalidateQueries({ queryKey: ['supplierCatalogs', supplierId] })
    },
  })
}

export function useAddCatalogPdf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ supplierId, label, file }: { supplierId: number; label: string; file: File }) => {
      const path = `${supplierId}/${Date.now()}-${file.name}`
      const { error: uploadError } = await db.storage.from('supplier-catalogs').upload(path, file)
      if (uploadError) throw uploadError
      const { data, error } = await db
        .from('supplierCatalogs')
        .insert({ supplierId, label, url: path, type: 'pdf' })
        .select()
        .single()
      if (error) throw error
      return data as SupplierCatalogEntry
    },
    onSuccess: (_, { supplierId }) => {
      queryClient.invalidateQueries({ queryKey: ['supplierCatalogs', supplierId] })
    },
  })
}

export function useDeleteCatalogEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (entry: SupplierCatalogEntry) => {
      if (entry.type === 'pdf') {
        await db.storage.from('supplier-catalogs').remove([entry.url])
      }
      const { error } = await db.from('supplierCatalogs').delete().eq('id', entry.id)
      if (error) throw error
    },
    onSuccess: (_, entry) => {
      queryClient.invalidateQueries({ queryKey: ['supplierCatalogs', entry.supplierId] })
    },
  })
}

export async function getPdfSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await db.storage.from('supplier-catalogs').createSignedUrl(path, 60)
  if (error) return null
  return data.signedUrl
}
