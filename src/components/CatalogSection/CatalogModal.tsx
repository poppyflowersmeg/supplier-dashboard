import { useState, useEffect } from 'react'
import { useCreateCatalogItem, useUpdateCatalogItem, useDeleteCatalogItem } from '../../hooks/useCatalog'
import { useToast } from '../Toast'
import type { CatalogItem, Supplier } from '../../lib/types'

interface Props {
  item: CatalogItem | null // null = add mode
  suppliers: Supplier[]
  onClose: () => void
}

interface FormState {
  supplierId: number
  variety: string
  color: string
  stems: string
  price: string
  notes: string
}

export function CatalogModal({ item, suppliers, onClose }: Props) {
  const { showToast } = useToast()
  const createItem = useCreateCatalogItem()
  const updateItem = useUpdateCatalogItem()
  const deleteItem = useDeleteCatalogItem()

  const sorted = [...suppliers].sort((a, b) => (a.priority || 99) - (b.priority || 99))
  const defaultSupplierId = sorted[0]?.id ?? 0

  const [form, setForm] = useState<FormState>({
    supplierId: item?.supplierId ?? defaultSupplierId,
    variety: item?.variety ?? '',
    color: item?.color ?? '',
    stems: item?.stems ?? '',
    price: item?.price ?? '',
    notes: item?.notes ?? '',
  })

  useEffect(() => {
    setForm({
      supplierId: item?.supplierId ?? defaultSupplierId,
      variety: item?.variety ?? '',
      color: item?.color ?? '',
      stems: item?.stems ?? '',
      price: item?.price ?? '',
      notes: item?.notes ?? '',
    })
  }, [item, defaultSupplierId])

  const handleField = (field: keyof FormState, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSave = async () => {
    if (!form.variety.trim()) {
      alert('Please enter a variety name.')
      return
    }
    try {
      if (item) {
        await updateItem.mutateAsync({ ...form, id: item.id })
        showToast('Item updated ✓')
      } else {
        await createItem.mutateAsync(form)
        showToast('Item added ✓')
      }
      onClose()
    } catch {
      showToast('Error saving item')
    }
  }

  const handleDelete = async () => {
    if (!item) return
    if (!confirm('Remove this item from the catalog?')) return
    try {
      await deleteItem.mutateAsync(item.id)
      showToast('Item removed')
      onClose()
    } catch {
      showToast('Error deleting item')
    }
  }

  const isBusy = createItem.isPending || updateItem.isPending || deleteItem.isPending

  return (
    <div
      className="modal-backdrop"
      id="modal-item"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{item ? 'Edit Catalog Item' : 'Add Catalog Item'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <label>Supplier *</label>
            <select
              value={form.supplierId}
              onChange={(e) => handleField('supplierId', Number(e.target.value))}
            >
              {sorted.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="form-row-2">
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label>Variety *</label>
              <input
                type="text"
                value={form.variety}
                onChange={(e) => handleField('variety', e.target.value)}
                placeholder="e.g. Garden Rose"
              />
            </div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label>Color / Grade</label>
              <input
                type="text"
                value={form.color}
                onChange={(e) => handleField('color', e.target.value)}
                placeholder="e.g. Blush Pink"
              />
            </div>
          </div>
          <div className="form-row-2" style={{ marginTop: 14 }}>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label>Stems per Bunch</label>
              <input
                type="text"
                value={form.stems}
                onChange={(e) => handleField('stems', e.target.value)}
                placeholder="e.g. 10"
              />
            </div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label>Price</label>
              <input
                type="text"
                value={form.price}
                onChange={(e) => handleField('price', e.target.value)}
                placeholder="e.g. $0.24/stem or $9.99/bunch"
              />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: 14 }}>
            <label>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleField('notes', e.target.value)}
              placeholder="Grade, seasonal notes, special conditions…"
              style={{ minHeight: 55 }}
            />
          </div>
          {item && (
            <div className="delete-zone">
              <p>Remove this item from the catalog.</p>
              <button className="btn-danger" onClick={handleDelete} disabled={isBusy}>
                Delete Item
              </button>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isBusy}>
            Save Item
          </button>
        </div>
      </div>
    </div>
  )
}
