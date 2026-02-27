// ── Supabase ───────────────────────────────────────────────────
const SUPABASE_URL = 'https://rfcpsppeaocwcnmejbrd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_w-6fGm9m0XyMNDOjciomMg_X-WdkhJA';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Row → app object
function dbToSupplier(r) {
  return {
    id:          r.id,
    name:        r.name,
    type:        r.partner_type,
    boxMin:      r.min || '',
    leadTime:    r.lead_time || '',
    email:       r.contact_email || '',
    phone:       r.phone || '',
    specialties: (r.specialties || []).join(', '),
    limitations: r.limitations || '',
    notes:       r.notes || '',
    weeklyAvailable: true, priority: r.id,
  };
}

// App object → DB row
function supplierToDB(s) {
  return {
    name:          s.name,
    partner_type:  s.type,
    min:           s.boxMin || null,
    lead_time:     s.leadTime || '',
    contact_email: s.email || '',
    phone:         s.phone || '',
    specialties:   (s.specialties || '').split(',').map(x => x.trim()).filter(Boolean),
    limitations:   s.limitations || '',
    notes:         s.notes || '',
  };
}

// Catalog: DB row → app object
function dbToCatalogItem(r) {
  return {
    id:         r.id,
    supplierId: r.supplier_id,
    variety:    r.variety,
    color:      r.color || '',
    stems:      r.stems || '',
    price:      r.price || '',
    notes:      r.notes || '',
  };
}

// Catalog: app object → DB row
function catalogItemToDB(item) {
  return {
    supplier_id: item.supplierId,
    variety:     item.variety,
    color:       item.color || '',
    stems:       String(item.stems || ''),
    price:       String(item.price || ''),
    notes:       item.notes || '',
  };
}

// ── State ──────────────────────────────────────────────────────
let state;

// ── Toast ──────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

// ── Auth ───────────────────────────────────────────────────────
function showLoginScreen(note) {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('nav-user').classList.add('hidden');
  if (note) showToast(note);
}

function hideLoginScreen() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('nav-user').classList.remove('hidden');
}

function setAuthButtons(enabled) {
  const on = enabled ? '' : 'not-allowed';
  const els = ['btn-add-supplier', 'btn-add-item'];
  els.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.disabled = !enabled;
    el.style.cursor = enabled ? '' : on;
  });
}

let appLoading = false;

async function handleAuthChange(event, session) {
  const user = session?.user;

  if (!user) {
    state = null;
    appLoading = false;
    showLoginScreen();
    setAuthButtons(false);
    return;
  }

  // Enforce meg@poppyflowers.com only
  if (user.email?.toLowerCase() !== 'meg@poppyflowers.com') {
    await db.auth.signOut();
    showLoginScreen('Access is restricted to meg@poppyflowers.com.');
    return;
  }

  // Authenticated ✓
  hideLoginScreen();
  setAuthButtons(true);
  document.getElementById('nav-user-email').textContent = user.email;

  // Load data once (guard against double-fire from onAuthStateChange + getSession)
  if (!state && !appLoading) {
    appLoading = true;
    await initApp();
    appLoading = false;
  }
}

document.getElementById('btn-google-login').addEventListener('click', async () => {
  const { error } = await db.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
  if (error) showToast('Sign-in failed: ' + error.message);
});

document.getElementById('btn-signout').addEventListener('click', async () => {
  await db.auth.signOut();
});

// Handle ongoing auth changes (sign-in, sign-out, token refresh)
// Skip INITIAL_SESSION — we handle that explicitly via getSession() below
db.auth.onAuthStateChange((event, session) => {
  if (event !== 'INITIAL_SESSION') handleAuthChange(event, session);
});

// Initial session check — getSession() waits for token refresh if needed
(async () => {
  const { data: { session } } = await db.auth.getSession();
  await handleAuthChange('initial', session);
})();

// ── Ordering Flow Banner ───────────────────────────────────────
// ── Supplier Cards ─────────────────────────────────────────────
function renderCards() {
  const scroll = document.getElementById('cards-scroll');
  const addBtn = document.getElementById('btn-add-supplier');
  scroll.querySelectorAll('.supplier-card').forEach(c => c.remove());

  const sorted = [...state.suppliers].sort((a,b) => (a.priority||99) - (b.priority||99));

  sorted.forEach(s => {
    const card = document.createElement('div');
    card.className = 'supplier-card';

    const specialtyChips = (s.specialties || '').split(',').map(x => x.trim()).filter(Boolean)
      .map(x => `<span class="specialty-chip">${esc(x)}</span>`).join('');

    card.innerHTML = `
      <div class="card-top">
        <div class="card-top-text">
          <div class="card-name" title="${esc(s.name)}">${esc(s.name)}</div>
          <div class="card-badges">
            <span class="badge badge-${s.type === 'Wholesaler' ? 'wholesaler' : 'farm'}">${esc(s.type)}</span>
          </div>
        </div>
      </div>
      ${s.boxMin ? `<div class="card-info-row" style="font-size:.79rem"><span class="info-icon">📦</span><span><strong>Min:</strong> ${esc(s.boxMin)}</span></div>` : ''}
      ${s.leadTime ? `<div class="card-info-row" style="font-size:.79rem"><span class="info-icon">🕐</span><span>${esc(s.leadTime)}</span></div>` : ''}
      ${specialtyChips ? `<div class="specialties-list">${specialtyChips}</div>` : ''}
      ${s.limitations ? `<div class="limitations-row"><span>⚠</span><span>${esc(s.limitations)}</span></div>` : ''}
      ${s.email ? `<div class="card-info-row" style="font-size:.78rem"><span class="info-icon">✉️</span><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></div>` : ''}
      ${s.phone ? `<div class="card-info-row" style="font-size:.78rem"><span class="info-icon">📞</span><span>${esc(s.phone)}</span></div>` : ''}
      ${s.notes ? `<div class="card-note">${esc(s.notes)}</div>` : ''}
      <div class="card-actions">
        <button class="btn btn-ghost btn-sm" data-edit-supplier="${s.id}" style="flex:1">✏️ Edit</button>
      </div>
    `;

    scroll.insertBefore(card, addBtn);
  });

  scroll.querySelectorAll('[data-edit-supplier]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openSupplierModal(parseInt(btn.dataset.editSupplier));
    });
  });
}

// ── Catalog ────────────────────────────────────────────────────
function renderCatalog() {
  const filterSel = document.getElementById('catalog-filter');
  const currentFilter = filterSel.value || 'all';
  const sorted = [...state.suppliers].sort((a,b) => (a.priority||99) - (b.priority||99));
  filterSel.innerHTML = '<option value="all">All Suppliers</option>' +
    sorted.map(s => `<option value="${s.id}" ${currentFilter == s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('');

  const search = document.getElementById('catalog-search').value.toLowerCase();
  const tbody = document.getElementById('catalog-tbody');
  tbody.innerHTML = '';

  const sortedCatalog = [...state.catalog].sort((a,b) => {
    const pa = (state.suppliers.find(x=>x.id==a.supplierId)||{}).priority || 99;
    const pb = (state.suppliers.find(x=>x.id==b.supplierId)||{}).priority || 99;
    return pa - pb;
  });

  const filtered = sortedCatalog.filter(item => {
    const s = state.suppliers.find(x => x.id == item.supplierId);
    if (!s) return false;
    if (currentFilter !== 'all' && item.supplierId != currentFilter) return false;
    if (search && !(
      item.variety.toLowerCase().includes(search) ||
      item.color.toLowerCase().includes(search) ||
      (item.notes||'').toLowerCase().includes(search) ||
      s.name.toLowerCase().includes(search)
    )) return false;
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--border)" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <p>No catalog items match your search.</p>
    </div></td></tr>`;
    return;
  }

  let lastSupplierId = null;
  filtered.forEach(item => {
    const s = state.suppliers.find(x => x.id == item.supplierId);
    if (!s) return;

    if (currentFilter === 'all' && item.supplierId !== lastSupplierId) {
      const groupRow = document.createElement('tr');
      groupRow.innerHTML = `<td colspan="7" class="group-label">
        ${esc(s.name)} <span style="font-weight:400;text-transform:none;letter-spacing:0">— ${s.type}</span>
      </td>`;
      tbody.appendChild(groupRow);
      lastSupplierId = item.supplierId;
    }

    const row = document.createElement('tr');
    const noteLC = (item.notes || '').toLowerCase();
    const isUnavailable = item.supplierId === AGROGANA_ID &&
      (noteLC.includes('no available') || noteLC.includes('erradicated'));
    if (isUnavailable) row.classList.add('row-unavailable');

    row.innerHTML = `
      <td>${currentFilter !== 'all' ? `<span class="supplier-tag ${s.type==='Wholesaler'?'wholesaler':''}">${esc(s.name)}</span>` : ''}</td>
      <td style="font-weight:600">${esc(item.variety)}</td>
      <td>${esc(item.color||'—')}</td>
      <td style="text-align:center">${item.stems ? item.stems : '—'}</td>
      <td class="price-cell">${item.price ? (/^[\d.]+$/.test(item.price) ? '$' + Number(item.price).toFixed(2) : item.price) : '—'}</td>
      <td class="note-cell">${esc(item.notes||'')}</td>
      <td><div class="actions-cell">
        <button class="btn-icon" data-edit-item="${item.id}" title="Edit">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div></td>
    `;
    tbody.appendChild(row);
  });

  tbody.querySelectorAll('[data-edit-item]').forEach(btn => {
    btn.addEventListener('click', () => openItemModal(parseInt(btn.dataset.editItem)));
  });
}

// ── Supplier Modal ─────────────────────────────────────────────
let currentType = 'Farm';
function selectType(t) {
  currentType = t;
  document.getElementById('s-type').value = t;
  document.getElementById('type-farm').className       = 'type-radio' + (t==='Farm'       ? ' selected-farm'       : '');
  document.getElementById('type-wholesaler').className = 'type-radio' + (t==='Wholesaler' ? ' selected-wholesaler' : '');
}

function openSupplierModal(id) {
  const s = id ? state.suppliers.find(x => x.id === id) : null;
  document.getElementById('supplier-modal-title').textContent = s ? 'Edit Supplier' : 'Add Supplier';
  document.getElementById('s-id').value          = s ? s.id : '';
  document.getElementById('s-name').value        = s ? s.name : '';
  document.getElementById('s-boxmin').value      = s ? s.boxMin : '';
  document.getElementById('s-leadtime').value    = s ? s.leadTime : '';
  document.getElementById('s-specialties').value = s ? s.specialties : '';
  document.getElementById('s-limitations').value = s ? s.limitations : '';
  document.getElementById('s-email').value       = s ? s.email : '';
  document.getElementById('s-phone').value       = s ? s.phone : '';
  document.getElementById('s-notes').value       = s ? s.notes : '';
  selectType(s ? s.type : 'Farm');
  document.getElementById('supplier-delete-zone').classList.toggle('hidden', !s);
  showModal('modal-supplier');
}

document.getElementById('btn-save-supplier').addEventListener('click', async () => {
  const name = document.getElementById('s-name').value.trim();
  if (!name) { alert('Please enter a supplier name.'); return; }
  const id = document.getElementById('s-id').value;
  const data = {
    name,
    type:        document.getElementById('s-type').value,
    boxMin:      document.getElementById('s-boxmin').value.trim(),
    leadTime:    document.getElementById('s-leadtime').value.trim(),
    specialties: document.getElementById('s-specialties').value.trim(),
    limitations: document.getElementById('s-limitations').value.trim(),
    email:       document.getElementById('s-email').value.trim(),
    phone:       document.getElementById('s-phone').value.trim(),
    notes:       document.getElementById('s-notes').value.trim(),
  };
  if (id) {
    const { error } = await db.from('partners').update(supplierToDB(data)).eq('id', id);
    if (error) { showToast('Error saving supplier'); console.error(error); return; }
    Object.assign(state.suppliers.find(x => x.id == id), data);
    showToast('Supplier updated ✓');
  } else {
    const { data: row, error } = await db.from('partners').insert(supplierToDB(data)).select().single();
    if (error) { showToast('Error adding supplier'); console.error(error); return; }
    state.suppliers.push(dbToSupplier(row));
    showToast('Supplier added ✓');
  }
  closeModal('modal-supplier');
  renderAll();
});

document.getElementById('btn-delete-supplier').addEventListener('click', async () => {
  const id = parseInt(document.getElementById('s-id').value);
  if (!confirm('Delete this supplier and all their catalog items? This cannot be undone.')) return;
  const { error, count } = await db.from('partners').delete({ count: 'exact' }).eq('id', id);
  if (error || count === 0) { showToast("You don't have permission to delete partners"); return; }
  state.suppliers = state.suppliers.filter(s => s.id !== id);
  // Cascade deletes catalog items in DB; reload to stay in sync
  const { data: catalog } = await db.from('catalog').select('*').order('id');
  if (catalog) state.catalog = catalog.map(dbToCatalogItem);
  closeModal('modal-supplier');
  renderAll();
  showToast('Supplier deleted');
});

// ── Catalog Item Modal ─────────────────────────────────────────
function openItemModal(id) {
  const item = id ? state.catalog.find(x => x.id === id) : null;
  document.getElementById('item-modal-title').textContent = item ? 'Edit Catalog Item' : 'Add Catalog Item';
  document.getElementById('i-id').value = item ? item.id : '';

  const sorted = [...state.suppliers].sort((a,b)=>(a.priority||99)-(b.priority||99));
  const sel = document.getElementById('i-supplier');
  sel.innerHTML = sorted.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  if (item) sel.value = item.supplierId;

  document.getElementById('i-variety').value = item ? item.variety : '';
  document.getElementById('i-color').value   = item ? item.color : '';
  document.getElementById('i-stems').value   = item ? item.stems : '';
  document.getElementById('i-price').value   = item ? item.price : '';
  document.getElementById('i-notes').value   = item ? item.notes : '';
  document.getElementById('item-delete-zone').classList.toggle('hidden', !item);
  showModal('modal-item');
}

document.getElementById('btn-save-item').addEventListener('click', async () => {
  const variety = document.getElementById('i-variety').value.trim();
  if (!variety) { alert('Please enter a variety name.'); return; }
  const id = document.getElementById('i-id').value;
  const data = {
    supplierId: parseInt(document.getElementById('i-supplier').value),
    variety,
    color: document.getElementById('i-color').value.trim(),
    stems: document.getElementById('i-stems').value.trim(),
    price: document.getElementById('i-price').value.trim(),
    notes: document.getElementById('i-notes').value.trim(),
  };
  if (id) {
    const { error } = await db.from('catalog').update(catalogItemToDB(data)).eq('id', id);
    if (error) { showToast('Error saving item'); console.error(error); return; }
    Object.assign(state.catalog.find(x => x.id == id), data);
    showToast('Item updated ✓');
  } else {
    const { data: row, error } = await db.from('catalog').insert(catalogItemToDB(data)).select().single();
    if (error) { showToast('Error adding item'); console.error(error); return; }
    state.catalog.push(dbToCatalogItem(row));
    showToast('Item added ✓');
  }
  closeModal('modal-item');
  renderCatalog();
});

document.getElementById('btn-delete-item').addEventListener('click', async () => {
  const id = parseInt(document.getElementById('i-id').value);
  if (!confirm('Remove this item from the catalog?')) return;
  const { error } = await db.from('catalog').delete().eq('id', id);
  if (error) { showToast('Error deleting item'); console.error(error); return; }
  state.catalog = state.catalog.filter(i => i.id !== id);
  closeModal('modal-item');
  renderCatalog();
  showToast('Item removed');
});

// ── Modal Helpers ──────────────────────────────────────────────
function showModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.close)));
document.querySelectorAll('.modal-backdrop').forEach(bd => bd.addEventListener('click', e => { if (e.target === bd) closeModal(bd.id); }));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(bd => closeModal(bd.id));
});

// ── Add Supplier / Item triggers ───────────────────────────────
document.getElementById('btn-add-supplier')?.addEventListener('click', () => openSupplierModal(null));
document.getElementById('btn-add-item')?.addEventListener('click', () => {
  if (state.suppliers.length === 0) { alert('Add a supplier first.'); return; }
  openItemModal(null);
});

// ── Catalog Search / Filter ────────────────────────────────────
document.getElementById('catalog-search').addEventListener('input', renderCatalog);
document.getElementById('catalog-filter').addEventListener('change', renderCatalog);

// ── Suppliers section toggle ────────────────────────────────────
document.getElementById('suppliers-header').addEventListener('click', () => {
  const header = document.getElementById('suppliers-header');
  const section = document.getElementById('cards-section');
  const isCollapsed = section.classList.toggle('collapsed');
  header.classList.toggle('collapsed', isCollapsed);
});

// ── Save / Export ──────────────────────────────────────────────
document.getElementById('btn-save')?.addEventListener('click', () => {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data saved ✓');
});

// ── Utility ────────────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── Sync from Google Sheet ──────────────────────────────────────
const SHEET_ID  = '1kgAWJhepfPxy-A5rmPwaMb5XAEL2CEf8';
const SHEET_GID = '1252533107';
const AGROGANA_ID = 2;

function normVariety(s) {
  return (s || '').toUpperCase().trim()
    .replace(/[–—]/g, '-')       // normalise dashes
    .replace(/\s+/g, ' ');        // collapse whitespace
}

document.getElementById('btn-sync-sheet').addEventListener('click', syncFromSheet);

function syncFromSheet() {
  const btn  = document.getElementById('btn-sync-sheet');
  const icon = document.getElementById('sync-icon');
  btn.disabled = true;
  icon.classList.add('syncing');

  const cbName = '_sheetSync_' + Date.now();
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
              `?tqx=out:json;responseHandler:${cbName}&gid=${SHEET_GID}`;

  const cleanup = (script) => {
    delete window[cbName];
    if (script && script.parentNode) script.parentNode.removeChild(script);
    btn.disabled = false;
    icon.classList.remove('syncing');
  };

  window[cbName] = async function(resp) {
    try {
      if (!resp || !resp.table) throw new Error('Empty response');
      const rows = resp.table.rows || [];

      // Build lookup: normalised variety → note string (col D=3, col E=4)
      const lookup = {};
      rows.forEach(row => {
        const variety = row.c && row.c[3] ? String(row.c[3].v || '').trim() : '';
        const note    = row.c && row.c[4] ? String(row.c[4].v || '').trim() : '';
        if (variety) lookup[normVariety(variety)] = note;
      });

      let updated = 0;
      const toUpdate = [];
      state.catalog.forEach(item => {
        if (item.supplierId !== AGROGANA_ID) return;
        const key = normVariety(item.variety);
        if (key in lookup) {
          const incoming = lookup[key];
          if (item.notes !== incoming) { item.notes = incoming; toUpdate.push(item); updated++; }
        }
      });

      // Persist changed notes to Supabase
      if (toUpdate.length) {
        await Promise.all(toUpdate.map(item =>
          db.from('catalog').update({ notes: item.notes }).eq('id', item.id)
        ));
      }

      renderCatalog();
      showToast(updated
        ? `Sheet synced — ${updated} Agrogana note${updated > 1 ? 's' : ''} updated ✓`
        : 'Sheet synced — no changes detected');
    } catch(e) {
      showToast('Sync error: ' + e.message);
    }
    cleanup(script);
  };

  const script = document.createElement('script');
  script.src = url;
  script.onerror = () => {
    showToast('Sync failed — publish the sheet via File → Share → Publish to web');
    cleanup(script);
  };
  document.head.appendChild(script);
}

// ── Init ───────────────────────────────────────────────────────
function renderAll() {
  renderCards();
  renderCatalog();
}

async function initApp() {
  const [{ data: partners, error: pErr }, { data: catalog, error: cErr }] = await Promise.all([
    db.from('partners').select('*').order('id'),
    db.from('catalog').select('*').order('id'),
  ]);
  if (pErr || cErr) { showToast('Failed to load data'); console.error(pErr || cErr); return; }
  state = {
    suppliers: partners.map(dbToSupplier),
    catalog:   catalog.map(dbToCatalogItem),
  };
  renderAll();
}
