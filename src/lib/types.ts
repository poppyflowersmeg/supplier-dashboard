export interface Supplier {
  id: number
  name: string
  type: 'Farm' | 'Wholesaler'
  boxMin: string
  leadTime: string
  email: string
  phone: string
  specialties: string // comma-separated string
  limitations: string
  notes: string
  priority: number
}

export interface CatalogItem {
  id: number
  supplierId: number
  variety: string
  color: string
  stems: string
  price: string
  notes: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbToSupplier(r: any): Supplier {
  return {
    id: r.id,
    name: r.name,
    type: r.partner_type,
    boxMin: r.min || '',
    leadTime: r.lead_time || '',
    email: r.contact_email || '',
    phone: r.phone || '',
    specialties: (r.specialties || []).join(', '),
    limitations: r.limitations || '',
    notes: r.notes || '',
    priority: r.id,
  }
}

export function supplierToDB(s: Omit<Supplier, 'id' | 'priority'>) {
  return {
    name: s.name,
    partner_type: s.type,
    min: s.boxMin || null,
    lead_time: s.leadTime || '',
    contact_email: s.email || '',
    phone: s.phone || '',
    specialties: (s.specialties || '').split(',').map((x) => x.trim()).filter(Boolean),
    limitations: s.limitations || '',
    notes: s.notes || '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbToCatalogItem(r: any): CatalogItem {
  return {
    id: r.id,
    supplierId: r.supplier_id,
    variety: r.variety,
    color: r.color || '',
    stems: r.stems || '',
    price: r.price || '',
    notes: r.notes || '',
  }
}

export function catalogItemToDB(item: Omit<CatalogItem, 'id'>) {
  return {
    supplier_id: item.supplierId,
    variety: item.variety,
    color: item.color || '',
    stems: String(item.stems || ''),
    price: String(item.price || ''),
    notes: item.notes || '',
  }
}
