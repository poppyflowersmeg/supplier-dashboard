import { useState } from 'react'
import { useSuppliers } from '../../hooks/useSuppliers'
import { useCatalog } from '../../hooks/useCatalog'
import { CatalogTable } from './CatalogTable'
import { CatalogModal } from './CatalogModal'
import type { CatalogItem } from '../../lib/types'

export function CatalogSection() {
  const { data: suppliers = [] } = useSuppliers()
  const { data: catalog = [] } = useCatalog()
  const [search, setSearch] = useState('')
  const [filterSupplierId, setFilterSupplierId] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null)

  const sorted = [...suppliers].sort((a, b) => (a.priority || 99) - (b.priority || 99))

  const searchLower = search.toLowerCase()
  const filteredCatalog = catalog.filter((item) => {
    if (!searchLower) return true
    const s = suppliers.find((x) => x.id === item.supplierId)
    return (
      item.variety.toLowerCase().includes(searchLower) ||
      item.color.toLowerCase().includes(searchLower) ||
      (item.supplierNotes || '').toLowerCase().includes(searchLower) ||
      (item.poppyNotes || '').toLowerCase().includes(searchLower) ||
      (s?.name ?? '').toLowerCase().includes(searchLower)
    )
  })

  const openAdd = () => {
    if (suppliers.length === 0) {
      alert('Add a supplier first.')
      return
    }
    setEditingItem(null)
    setModalOpen(true)
  }

  const openEdit = (id: number) => {
    const item = catalog.find((x) => x.id === id) ?? null
    setEditingItem(item)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
  }

  return (
    <div id="main-section">
      <div className="section-header" style={{ cursor: 'default', marginBottom: 14 }}>
        <span className="section-title">Flower Catalog</span>
      </div>
      <div className="catalog-toolbar">
        <div className="search-wrap">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search variety, color, notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          style={{ minWidth: 170 }}
          value={filterSupplierId}
          onChange={(e) => setFilterSupplierId(e.target.value)}
        >
          <option value="all">All Suppliers</option>
          {sorted.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Item
          </button>
        </div>
      </div>
      <div className="catalog-table-wrap">
        <div className="catalog-table-scroll">
          <table className="catalog-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Variety</th>
                <th>Color / Grade</th>
                <th>Stems / Bunch</th>
                <th>
                  Price / Stem<br/>
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '.68rem', opacity: 0.7 }}>
                    *Not including freight
                  </span>
                </th>
                <th>Notes</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <CatalogTable
              catalog={filteredCatalog}
              suppliers={suppliers}
              filterSupplierId={filterSupplierId}
              onEdit={openEdit}
            />
          </table>
        </div>
      </div>
      {modalOpen && (
        <CatalogModal item={editingItem} suppliers={suppliers} onClose={closeModal} />
      )}
    </div>
  )
}
