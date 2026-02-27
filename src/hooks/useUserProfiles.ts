import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '../lib/supabase'
import type { UserProfile } from '../lib/types'

export function useUserProfiles() {
  return useQuery({
    queryKey: ['userProfiles'],
    queryFn: async () => {
      const { data, error } = await db
        .from('userProfiles')
        .select('id, email, isAdmin, canManageUsers')
        .order('email')
      if (error) throw error
      return data as UserProfile[]
    },
  })
}

export function useCurrentUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['currentUserProfile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await db
        .from('userProfiles')
        .select('id, email, isAdmin, canManageUsers')
        .eq('id', userId!)
        .single()
      if (error) throw error
      return data as UserProfile
    },
  })
}

export function useToggleAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isAdmin }: { id: string; isAdmin: boolean }) => {
      const { error } = await db
        .from('userProfiles')
        .update({ isAdmin })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfiles'] })
    },
  })
}
