import type { Supplier } from '../../lib/types'

interface Props {
  supplier: Supplier
  onEdit: (id: number) => void
}

export function SupplierCard({ supplier: s, onEdit }: Props) {
  const specialtyChips = (s.specialties || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

  return (
    <div className="supplier-card">
      <div className="card-top">
        <div className="card-top-text">
          <div className="card-name" title={s.name}>{s.name}</div>
          <div className="card-badges">
            <span className={`badge badge-${s.type === 'Wholesaler' ? 'wholesaler' : 'farm'}`}>
              {s.type}
            </span>
          </div>
        </div>
      </div>
      {s.boxMin && (
        <div className="card-info-row" style={{ fontSize: '.79rem' }}>
          <span className="info-icon">📦</span>
          <span><strong>Min:</strong> {s.boxMin}</span>
        </div>
      )}
      {s.leadTime && (
        <div className="card-info-row" style={{ fontSize: '.79rem' }}>
          <span className="info-icon">🕐</span>
          <span>{s.leadTime}</span>
        </div>
      )}
      {specialtyChips.length > 0 && (
        <div className="specialties-list">
          {specialtyChips.map((chip) => (
            <span key={chip} className="specialty-chip">{chip}</span>
          ))}
        </div>
      )}
      {s.limitations && (
        <div className="limitations-row">
          <span>⚠</span>
          <span>{s.limitations}</span>
        </div>
      )}
      {s.email && (
        <div className="card-info-row" style={{ fontSize: '.78rem' }}>
          <span className="info-icon">✉️</span>
          <a href={`mailto:${s.email}`}>{s.email}</a>
        </div>
      )}
      {s.phone && (
        <div className="card-info-row" style={{ fontSize: '.78rem' }}>
          <span className="info-icon">📞</span>
          <span>{s.phone}</span>
        </div>
      )}
      {s.notes && <div className="card-note">{s.notes}</div>}
      <div className="card-actions">
        <button
          className="btn btn-ghost btn-sm"
          style={{ flex: 1 }}
          onClick={() => onEdit(s.id)}
        >
          ✏️ Edit
        </button>
      </div>
    </div>
  )
}
