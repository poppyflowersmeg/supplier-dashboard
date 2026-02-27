import type { Supplier } from '../../lib/types'
import { useSupplierCatalogs, getPdfSignedUrl } from '../../hooks/useSupplierCatalogs'

interface Props {
  supplier: Supplier
  onEdit: (id: number) => void
}

export function SupplierCard({ supplier: s, onEdit }: Props) {
  const { data: catalogEntries = [] } = useSupplierCatalogs(s.id)
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
            <span className={`badge badge-${s.supplierType === 'Wholesaler' ? 'wholesaler' : 'farm'}`}>
              {s.supplierType}
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
      {s.freightPerStemAvg != null && (
        <div className="card-info-row" style={{ fontSize: '.79rem' }}>
          <span className="info-icon">🚚</span>
          <span><strong>Avg Freight:</strong> ${s.freightPerStemAvg.toFixed(2)}/stem</span>
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
      {s.contactEmail && (
        <div className="card-info-row" style={{ fontSize: '.78rem' }}>
          <span className="info-icon">✉️</span>
          <a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a>
        </div>
      )}
      {s.phone && (
        <div className="card-info-row" style={{ fontSize: '.78rem' }}>
          <span className="info-icon">📞</span>
          <span>{s.phone}</span>
        </div>
      )}
      {s.notes && <div className="card-note">{s.notes}</div>}
      {catalogEntries.length > 0 && (
        <div className="card-catalog">
          <div className="card-catalog-title">Catalog</div>
          {catalogEntries.map((entry) => (
            <div key={entry.id} className="card-catalog-entry">
              <span>{entry.type === 'pdf' ? '📄' : '🔗'}</span>
              {entry.type === 'pdf' ? (
                <button
                  className="btn-link"
                  onClick={async () => {
                    const url = await getPdfSignedUrl(entry.url)
                    if (url) window.open(url, '_blank')
                  }}
                >
                  {entry.label || 'PDF'}
                </button>
              ) : (
                <a href={entry.url} target="_blank" rel="noreferrer">
                  {entry.label || entry.url}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
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
