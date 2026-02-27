import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { db } from '../lib/supabase'
import { useSuppliers } from '../hooks/useSuppliers'
import { useCatalog } from '../hooks/useCatalog'
import { useToast } from './Toast'
import type { CatalogItem } from '../lib/types'

const SHEET_ID = '1kgAWJhepfPxy-A5rmPwaMb5XAEL2CEf8'
const SHEET_GID = '1252533107'
const AGROGANA_ID = 2

function normVariety(s: string) {
  return (s || '').toUpperCase().trim()
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
}

interface Props {
  userEmail: string
  onSignOut: () => void
}

export function NavBar({ userEmail, onSignOut }: Props) {
  const [syncing, setSyncing] = useState(false)
  const { showToast } = useToast()
  const { data: suppliers = [] } = useSuppliers()
  const { data: catalog = [] } = useCatalog()
  const queryClient = useQueryClient()

  const handleSave = () => {
    const dataStr = JSON.stringify({ suppliers, catalog }, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data saved ✓')
  }

  const syncFromSheet = () => {
    setSyncing(true)
    const cbName = '_sheetSync_' + Date.now()
    const url =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
      `?tqx=out:json;responseHandler:${cbName}&gid=${SHEET_GID}`

    const cleanup = (script: HTMLScriptElement) => {
      delete (window as unknown as Record<string, unknown>)[cbName]
      script.parentNode?.removeChild(script)
      setSyncing(false)
    }

    ;(window as unknown as Record<string, unknown>)[cbName] = async function (resp: unknown) {
      const script = document.querySelector(`script[src="${url}"]`) as HTMLScriptElement
      try {
        const r = resp as { table?: { rows?: Array<{ c?: Array<{ v?: unknown } | null> }> } }
        if (!r || !r.table) throw new Error('Empty response')
        const rows = r.table.rows || []

        const lookup: Record<string, string> = {}
        rows.forEach((row) => {
          const variety = row.c?.[3]?.v ? String(row.c[3]!.v).trim() : ''
          const note = row.c?.[4]?.v ? String(row.c[4]!.v).trim() : ''
          if (variety) lookup[normVariety(variety)] = note
        })

        const currentCatalog = queryClient.getQueryData<CatalogItem[]>(['catalog']) || []
        let updated = 0
        const toUpdate: Array<{ id: number; supplierNotes: string }> = []

        currentCatalog.forEach((item) => {
          if (item.supplierId !== AGROGANA_ID) return
          const key = normVariety(item.variety)
          if (key in lookup) {
            const incoming = lookup[key]
            if (item.supplierNotes !== incoming) {
              toUpdate.push({ id: item.id, supplierNotes: incoming })
              updated++
            }
          }
        })

        if (toUpdate.length) {
          await Promise.all(
            toUpdate.map((item) =>
              db.from('catalogItems').update({ supplierNotes: item.supplierNotes }).eq('id', item.id)
            )
          )
          queryClient.invalidateQueries({ queryKey: ['catalog'] })
        }

        showToast(
          updated
            ? `Sheet synced — ${updated} Agrogana note${updated > 1 ? 's' : ''} updated ✓`
            : 'Sheet synced — no changes detected'
        )
      } catch (e) {
        showToast('Sync error: ' + (e instanceof Error ? e.message : String(e)))
      }
      cleanup(script)
    }

    const script = document.createElement('script')
    script.src = url
    script.onerror = () => {
      showToast('Sync failed — publish the sheet via File → Share → Publish to web')
      cleanup(script)
    }
    document.head.appendChild(script)
  }

  return (
    <nav>
      <div className="nav-brand">
        POPPY
        <span style={{ fontWeight: 300, letterSpacing: '.06em', opacity: 0.5, fontSize: '.8rem', marginLeft: 4 }}>
          / Supplier Dashboard
        </span>
      </div>
      <div className="nav-actions">
        <div className="nav-user">
          <span className="nav-user-email">{userEmail}</span>
          <button className="btn btn-ghost btn-sm" onClick={onSignOut}>Sign out</button>
        </div>
        <button
          className="btn btn-sync btn-sm"
          onClick={syncFromSheet}
          disabled={syncing}
          title="Pull latest availability notes from Agrogana Google Sheet"
        >
          <svg
            id="sync-icon"
            className={syncing ? 'syncing' : ''}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Sync Agrogana Availability
        </button>
        <button className="btn btn-primary btn-sm" onClick={handleSave}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Save Dashboard
        </button>
      </div>
    </nav>
  )
}
