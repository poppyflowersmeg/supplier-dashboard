import { useState, useEffect } from 'react'
import { useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../../hooks/useSuppliers'
import { useToast } from '../Toast'
import type { Supplier } from '../../lib/types'
import { SupplierCatalogSection } from './SupplierCatalogSection'

interface Props {
  supplier: Supplier | null // null = add mode
  onClose: () => void
}

type SupplierType = 'Farm' | 'Wholesaler'

interface FormState {
  name: string
  supplierType: SupplierType
  boxMin: string
  leadTime: string
  specialties: string
  limitations: string
  contactEmail: string
  phone: string
  notes: string
  freightPerStemHBAvg: string
  freightPerStemQBAvg: string
  freightPerStemEBAvg: string
  freightRosesHBAvg: string
  freightRosesQBAvg: string
  freightHydrangeaQBAvg: string
  freightHydrangeaEBAvg: string
}

const defaultForm: FormState = {
  name: '',
  supplierType: 'Farm',
  boxMin: '',
  leadTime: '',
  specialties: '',
  limitations: '',
  contactEmail: '',
  phone: '',
  notes: '',
  freightPerStemHBAvg: '',
  freightPerStemQBAvg: '',
  freightPerStemEBAvg: '',
  freightRosesHBAvg: '',
  freightRosesQBAvg: '',
  freightHydrangeaQBAvg: '',
  freightHydrangeaEBAvg: '',
}

export function SupplierModal({ supplier, onClose }: Props) {
  const [form, setForm] = useState<FormState>(defaultForm)
  const { showToast } = useToast()
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()
  const deleteSupplier = useDeleteSupplier()

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name,
        supplierType: supplier.supplierType,
        boxMin: supplier.boxMin,
        leadTime: supplier.leadTime,
        specialties: supplier.specialties,
        limitations: supplier.limitations,
        contactEmail: supplier.contactEmail,
        phone: supplier.phone,
        notes: supplier.notes,
        freightPerStemHBAvg: supplier.freightPerStemHBAvg != null ? String(supplier.freightPerStemHBAvg) : '',
        freightPerStemQBAvg: supplier.freightPerStemQBAvg != null ? String(supplier.freightPerStemQBAvg) : '',
        freightPerStemEBAvg: supplier.freightPerStemEBAvg != null ? String(supplier.freightPerStemEBAvg) : '',
        freightRosesHBAvg: supplier.freightRosesHBAvg != null ? String(supplier.freightRosesHBAvg) : '',
        freightRosesQBAvg: supplier.freightRosesQBAvg != null ? String(supplier.freightRosesQBAvg) : '',
        freightHydrangeaQBAvg: supplier.freightHydrangeaQBAvg != null ? String(supplier.freightHydrangeaQBAvg) : '',
        freightHydrangeaEBAvg: supplier.freightHydrangeaEBAvg != null ? String(supplier.freightHydrangeaEBAvg) : '',
      })
    } else {
      setForm(defaultForm)
    }
  }, [supplier])

  const handleField = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('Please enter a supplier name.')
      return
    }
    const formData = {
      ...form,
      freightPerStemHBAvg: form.freightPerStemHBAvg.trim() ? Number(form.freightPerStemHBAvg) : null,
      freightPerStemQBAvg: form.freightPerStemQBAvg.trim() ? Number(form.freightPerStemQBAvg) : null,
      freightPerStemEBAvg: form.freightPerStemEBAvg.trim() ? Number(form.freightPerStemEBAvg) : null,
      freightRosesHBAvg: form.freightRosesHBAvg.trim() ? Number(form.freightRosesHBAvg) : null,
      freightRosesQBAvg: form.freightRosesQBAvg.trim() ? Number(form.freightRosesQBAvg) : null,
      freightHydrangeaQBAvg: form.freightHydrangeaQBAvg.trim() ? Number(form.freightHydrangeaQBAvg) : null,
      freightHydrangeaEBAvg: form.freightHydrangeaEBAvg.trim() ? Number(form.freightHydrangeaEBAvg) : null,
    }
    try {
      if (supplier) {
        await updateSupplier.mutateAsync({ ...formData, id: supplier.id, priority: supplier.priority })
        showToast('Supplier updated ✓')
      } else {
        await createSupplier.mutateAsync(formData)
        showToast('Supplier added ✓')
      }
      onClose()
    } catch {
      showToast('Error saving supplier')
    }
  }

  const handleDelete = async () => {
    if (!supplier) return
    if (!confirm('Delete this supplier and all their catalog items? This cannot be undone.')) return
    try {
      await deleteSupplier.mutateAsync(supplier.id)
      showToast('Supplier deleted')
      onClose()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error deleting supplier')
    }
  }

  const isBusy = createSupplier.isPending || updateSupplier.isPending || deleteSupplier.isPending

  return (
    <div
      className="modal-backdrop"
      id="modal-supplier"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{supplier ? 'Edit Supplier' : 'Add Supplier'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <label>Supplier Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleField('name', e.target.value)}
              placeholder="e.g. Agrogana"
            />
          </div>
          <div className="form-row" style={{ marginTop: 14 }}>
            <label>Type *</label>
            <div className="type-radio-group">
              <div
                className={`type-radio${form.supplierType === 'Farm' ? ' selected-farm' : ''}`}
                onClick={() => handleField('supplierType', 'Farm')}
              >
                🌿 Farm / Grower
              </div>
              <div
                className={`type-radio${form.supplierType === 'Wholesaler' ? ' selected-wholesaler' : ''}`}
                onClick={() => handleField('supplierType', 'Wholesaler')}
              >
                🏪 Wholesaler
              </div>
            </div>
          </div>
          <div className="form-row-2" style={{ marginTop: 14 }}>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label>Box / Order Minimum</label>
              <input
                type="text"
                value={form.boxMin}
                onChange={(e) => handleField('boxMin', e.target.value)}
                placeholder="e.g. 5 stems per variety"
              />
            </div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label>Lead Time</label>
              <input
                type="text"
                value={form.leadTime}
                onChange={(e) => handleField('leadTime', e.target.value)}
                placeholder="e.g. Order by Mon"
              />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: 14 }}>
            <label>Avg Freight / Stem ($)</label>
            <div className="form-row-2" style={{ marginTop: 4 }}>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '.68rem' }}>HB</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    value={form.freightPerStemHBAvg}
                    onChange={(e) => handleField('freightPerStemHBAvg', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '.68rem' }}>QB</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    value={form.freightPerStemQBAvg}
                    onChange={(e) => handleField('freightPerStemQBAvg', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '.68rem' }}>EB</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    value={form.freightPerStemEBAvg}
                    onChange={(e) => handleField('freightPerStemEBAvg', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="form-row" style={{ marginTop: 14 }}>
            <label>Roses Freight / Stem ($)</label>
            <div className="form-row-2" style={{ marginTop: 4 }}>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '.68rem' }}>HB</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    value={form.freightRosesHBAvg}
                    onChange={(e) => handleField('freightRosesHBAvg', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '.68rem' }}>QB</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    value={form.freightRosesQBAvg}
                    onChange={(e) => handleField('freightRosesQBAvg', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="form-row" style={{ marginTop: 14 }}>
            <label>Hydrangea Freight / Stem ($)</label>
            <div className="form-row-2" style={{ marginTop: 4 }}>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '.68rem' }}>QB</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    value={form.freightHydrangeaQBAvg}
                    onChange={(e) => handleField('freightHydrangeaQBAvg', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '.68rem' }}>EB</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    value={form.freightHydrangeaEBAvg}
                    onChange={(e) => handleField('freightHydrangeaEBAvg', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="form-row" style={{ marginTop: 14 }}>
            <label>Specialties (what they carry well)</label>
            <input
              type="text"
              value={form.specialties}
              onChange={(e) => handleField('specialties', e.target.value)}
              placeholder="e.g. Roses, Ranunculus, Dainty stems"
            />
          </div>
          <div className="form-row">
            <label>Limitations (what they don't carry / watch-outs)</label>
            <input
              type="text"
              value={form.limitations}
              onChange={(e) => handleField('limitations', e.target.value)}
              placeholder="e.g. No hydrangea, carnations, or mums"
            />
          </div>
          <div className="form-row-2">
            <div className="form-row">
              <label>Contact Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => handleField('contactEmail', e.target.value)}
                placeholder="orders@supplier.com"
              />
            </div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleField('phone', e.target.value)}
                placeholder="(800) 555-0100"
              />
            </div>
          </div>
          <div className="form-row">
            <label>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleField('notes', e.target.value)}
              placeholder="Anything the team should know…"
            />
          </div>
          {supplier && (
            <SupplierCatalogSection supplierId={supplier.id} />
          )}
          {supplier && (
            <div className="delete-zone">
              <p>Permanently remove this supplier and all their catalog items.</p>
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={isBusy}
              >
                Delete Supplier
              </button>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isBusy}>
            Save Supplier
          </button>
        </div>
      </div>
    </div>
  )
}
