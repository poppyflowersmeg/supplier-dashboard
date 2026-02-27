import type { ReactElement } from 'react'
import type { CatalogItem, Supplier } from '../../lib/types'
import type { FreightBoxSize } from './CatalogSection'

const AGROGANA_ID = 2

function formatPrice(price: string) {
  if (!price) return '—'
  if (/^[\d.]+$/.test(price)) return '$' + Number(price).toFixed(2)
  return price
}

function getFreight(s: Supplier, size: FreightBoxSize): number | null {
  switch (size) {
    case 'box': return s.freightPerStemBoxAvg
    case 'hb':  return s.freightPerStemHBAvg
    case 'qb':  return s.freightPerStemQBAvg
    case 'eb':  return s.freightPerStemEBAvg
  }
}

interface Props {
  catalog: CatalogItem[]
  suppliers: Supplier[]
  filterSupplierId: string // 'all' or supplier id string
  freightBoxSize: FreightBoxSize
  onEdit: (id: number) => void
}

export function CatalogTable({ catalog, suppliers, filterSupplierId, freightBoxSize, onEdit }: Props) {
  const sortedCatalog = [...catalog].sort((a, b) => {
    const pa = suppliers.find((x) => x.id === a.supplierId)?.priority ?? 99
    const pb = suppliers.find((x) => x.id === b.supplierId)?.priority ?? 99
    return pa - pb
  })

  const filtered = sortedCatalog.filter((item) => {
    if (!suppliers.find((x) => x.id === item.supplierId)) return false
    if (filterSupplierId !== 'all' && item.supplierId !== Number(filterSupplierId)) return false
    return true
  })

  if (filtered.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={9}>
            <div className="empty-state">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p>No catalog items match your search.</p>
            </div>
          </td>
        </tr>
      </tbody>
    )
  }

  const rows: ReactElement[] = []
  let lastSupplierId: number | null = null

  filtered.forEach((item) => {
    const s = suppliers.find((x) => x.id === item.supplierId)
    if (!s) return

    if (filterSupplierId === 'all' && item.supplierId !== lastSupplierId) {
      rows.push(
        <tr key={`group-${item.supplierId}`}>
          <td colSpan={9} className="group-label">
            {s.name}{' '}
            <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
              — {s.supplierType}
            </span>
          </td>
        </tr>
      )
      lastSupplierId = item.supplierId
    }

    const noteLC = (item.supplierNotes || '').toLowerCase()
    const isUnavailable =
      item.supplierId === AGROGANA_ID &&
      (noteLC.includes('no available') || noteLC.includes('erradicated'))

    const freight = getFreight(s, freightBoxSize)

    rows.push(
      <tr key={item.id} className={isUnavailable ? 'row-unavailable' : ''}>
        <td>
          {filterSupplierId !== 'all' && (
            <span className={`supplier-tag${s.supplierType === 'Wholesaler' ? ' wholesaler' : ''}`}>
              {s.name}
            </span>
          )}
        </td>
        <td style={{ fontWeight: 600 }}>{item.variety}</td>
        <td>{item.color || '—'}</td>
        <td style={{ textAlign: 'center' }}>{item.stems || '—'}</td>
        <td className="price-cell">{formatPrice(item.price)}</td>
        <td className="price-cell">{freight != null ? '$' + freight.toFixed(2) : '—'}</td>
        <td className="note-cell">{item.supplierNotes || ''}</td>
        <td className="note-cell">{item.poppyNotes || ''}</td>
        <td>
          <div className="actions-cell">
            <button
              className="btn-icon"
              onClick={() => onEdit(item.id)}
              title="Edit"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    )
  })

  return <tbody>{rows}</tbody>
}

