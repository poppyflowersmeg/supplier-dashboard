export interface Supplier {
  id: number
  name: string
  supplierType: 'Farm' | 'Wholesaler'
  boxMin: string
  leadTime: string
  contactEmail: string
  phone: string
  specialties: string // comma-separated string
  limitations: string
  notes: string
  priority: number
  createdAt: string
}

export interface CatalogItem {
  id: number
  supplierId: number
  variety: string
  color: string
  stems: string
  price: string
  supplierNotes: string
  poppyNotes: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbToSupplier(r: any): Supplier {
  return {
    id: r.id,
    name: r.name,
    supplierType: r.supplierType,
    boxMin: r.boxMin || '',
    leadTime: r.leadTime || '',
    contactEmail: r.contactEmail || '',
    phone: r.phone || '',
    specialties: (r.specialties || []).join(', '),
    limitations: r.limitations || '',
    notes: r.notes || '',
    priority: r.id,
    createdAt: r.createdAt,
  }
}

export function supplierToDB(s: Omit<Supplier, 'id' | 'priority'>) {
  return {
    name: s.name,
    supplierType: s.supplierType,
    boxMin: s.boxMin || null,
    leadTime: s.leadTime || '',
    contactEmail: s.contactEmail || '',
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
    supplierId: r.supplierId,
    variety: r.variety,
    color: r.color || '',
    stems: r.stems || '',
    price: r.price || '',
    supplierNotes: r.supplierNotes || '',
    poppyNotes: r.poppyNotes || '',
  }
}

export function catalogItemToDB(item: Omit<CatalogItem, 'id'>) {
  return {
    supplierId: item.supplierId,
    variety: item.variety,
    color: item.color || '',
    stems: String(item.stems || ''),
    price: String(item.price || ''),
    supplierNotes: item.supplierNotes || '',
    poppyNotes: item.poppyNotes || '',
  }
}
