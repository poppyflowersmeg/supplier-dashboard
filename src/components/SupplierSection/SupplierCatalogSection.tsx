import { useState, useEffect } from 'react'
import { db } from '../../lib/supabase'
import {
  useSupplierCatalogs,
  useAddCatalogLink,
  useAddCatalogPdf,
  useDeleteCatalogEntry,
  getPdfSignedUrl,
} from '../../hooks/useSupplierCatalogs'
import type { SupplierCatalogEntry } from '../../lib/types'

interface Props {
  supplierId: number
}

export function SupplierCatalogSection({ supplierId }: Props) {
  const { data: entries = [], isLoading } = useSupplierCatalogs(supplierId)
  const addLink = useAddCatalogLink()
  const addPdf = useAddCatalogPdf()
  const deleteEntry = useDeleteCatalogEntry()

  const [isMeg, setIsMeg] = useState(false)
  const [addMode, setAddMode] = useState<'none' | 'link' | 'pdf'>('none')
  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [pdfLabel, setPdfLabel] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  useEffect(() => {
    db.auth.getUser().then(({ data }) => {
      setIsMeg(data.user?.email === 'meg@poppyflowers.com')
    })
  }, [])

  const handleAddLink = async () => {
    if (!linkUrl.trim()) return
    try {
      await addLink.mutateAsync({ supplierId, label: linkLabel.trim(), url: linkUrl.trim() })
      setLinkLabel('')
      setLinkUrl('')
      setAddMode('none')
    } catch {
      alert('Error saving link')
    }
  }

  const handleAddPdf = async () => {
    if (!pdfFile) return
    try {
      await addPdf.mutateAsync({ supplierId, label: pdfLabel.trim(), file: pdfFile })
      setPdfLabel('')
      setPdfFile(null)
      setAddMode('none')
    } catch {
      alert('Error uploading PDF')
    }
  }

  const handleDelete = async (entry: SupplierCatalogEntry) => {
    if (!confirm('Remove this catalog entry?')) return
    try {
      await deleteEntry.mutateAsync(entry)
    } catch {
      alert('Error deleting entry')
    }
  }

  const handleOpenPdf = async (path: string) => {
    const url = await getPdfSignedUrl(path)
    if (url) window.open(url, '_blank')
  }

  const cancelAdd = () => {
    setAddMode('none')
    setLinkLabel('')
    setLinkUrl('')
    setPdfLabel('')
    setPdfFile(null)
  }

  return (
    <div className="catalog-section">
      <div className="catalog-section-title">Catalog</div>

      {isLoading && <div className="catalog-empty">Loading…</div>}

      {!isLoading && entries.length === 0 && (
        <div className="catalog-empty">No catalog entries yet.</div>
      )}

      {entries.length > 0 && (
        <div className="catalog-entry-list">
          {entries.map((entry) => (
            <div key={entry.id} className="catalog-entry">
              <span className="catalog-entry-icon">{entry.type === 'pdf' ? '📄' : '🔗'}</span>
              <span className="catalog-entry-label">
                {entry.type === 'pdf' ? (
                  <button className="btn-link" onClick={() => handleOpenPdf(entry.url)}>
                    {entry.label || 'PDF'}
                  </button>
                ) : (
                  <a href={entry.url} target="_blank" rel="noreferrer">
                    {entry.label || entry.url}
                  </a>
                )}
              </span>
              {isMeg && (
                <button
                  className="btn-ghost catalog-delete-btn"
                  onClick={() => handleDelete(entry)}
                  disabled={deleteEntry.isPending}
                  title="Remove"
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isMeg && (
        <div className="catalog-add-controls">
          {addMode === 'none' && (
            <div className="catalog-add-buttons">
              <button className="btn btn-secondary btn-sm" onClick={() => setAddMode('link')}>+ Link</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setAddMode('pdf')}>+ PDF</button>
            </div>
          )}

          {addMode === 'link' && (
            <div className="catalog-add-form">
              <input
                type="text"
                placeholder="Label (e.g. Spring 2026 Price List)"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
              />
              <input
                type="url"
                placeholder="https://…"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <div className="catalog-form-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddLink}
                  disabled={addLink.isPending || !linkUrl.trim()}
                >
                  {addLink.isPending ? 'Saving…' : 'Save'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={cancelAdd}>Cancel</button>
              </div>
            </div>
          )}

          {addMode === 'pdf' && (
            <div className="catalog-add-form">
              <input
                type="text"
                placeholder="Label (e.g. 2026 Catalog)"
                value={pdfLabel}
                onChange={(e) => setPdfLabel(e.target.value)}
              />
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              />
              <div className="catalog-form-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddPdf}
                  disabled={addPdf.isPending || !pdfFile}
                >
                  {addPdf.isPending ? 'Uploading…' : 'Upload'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={cancelAdd}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
