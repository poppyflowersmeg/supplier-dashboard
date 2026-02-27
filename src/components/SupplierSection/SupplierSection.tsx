import { useState } from 'react'
import { useSuppliers } from '../../hooks/useSuppliers'
import { SupplierCard } from './SupplierCard'
import { SupplierModal } from './SupplierModal'
import type { Supplier } from '../../lib/types'

export function SupplierSection() {
  const { data: suppliers = [] } = useSuppliers()
  const [collapsed, setCollapsed] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  const sorted = [...suppliers].sort((a, b) => (a.priority || 99) - (b.priority || 99))

  const openAdd = () => {
    setEditingSupplier(null)
    setModalOpen(true)
  }

  const openEdit = (id: number) => {
    const s = suppliers.find((x) => x.id === id) ?? null
    setEditingSupplier(s)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingSupplier(null)
  }

  return (
    <>
      <div
        className={`section-header${collapsed ? ' collapsed' : ''}`}
        id="suppliers-header"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="section-toggle-chevron">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </span>
          <span className="section-title">Farm Partners &amp; Wholesalers</span>
        </div>
      </div>
      <div id="cards-section" className={collapsed ? 'collapsed' : ''} style={{ overflow: 'auto' }}>
        <div id="cards-scroll">
          {sorted.map((s) => (
            <SupplierCard key={s.id} supplier={s} onEdit={openEdit} />
          ))}
          <button className="add-supplier-card" onClick={openAdd}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Add Supplier
          </button>
        </div>
      </div>
      {modalOpen && (
        <SupplierModal supplier={editingSupplier} onClose={closeModal} />
      )}
    </>
  )
}
