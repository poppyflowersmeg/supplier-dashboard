# Missing Elite Catalog Rows

**Sheet**: [Elite_Colombia_Pricing_Feb2026](https://docs.google.com/spreadsheets/d/1g8vygKo9AF4IgOxMCCIteBDpTdqnib4J070QXKAm6Gw/edit?gid=1618005650#gid=1618005650)
**DB count**: 532 rows | **Sheet count**: 565 rows | **Missing**: 33 rows

> [!NOTE]
> The original import appears to have used `Variety + Color` as a dedup key, collapsing rows that differ only by subcategory, grade, or size.

---

## Hydrangea — 14 missing rows

These Hydrangea varieties exist in the sheet with multiple grade/size entries (Select, Premium, Jumbo) but the DB only has one entry per variety. The **bolded** row is the one currently in the DB; the others are missing.

| # | Variety | Size | Grade | Price | Status |
|---|---------|------|-------|-------|--------|
| 1 | Green (Antique) | +22 cm | Jumbo | $1.86 | ❌ Missing |
| 2 | Green (Antique) | 18-19 cm | Premium | $1.26 | ❌ Missing |
| 3 | Hulk (Antique) | +22 cm | Jumbo | $1.86 | ❌ Missing |
| 4 | Hulk (Antique) | 18-19 cm | Premium | $1.26 | ❌ Missing |
| 5 | Kiwi (Antique) | +22 cm | Jumbo | $1.86 | ❌ Missing |
| 6 | Kiwi (Antique) | 18-19 cm | Premium | $1.26 | ❌ Missing |
| 7 | Purple (Antique) | 18-19 cm | Premium | $1.26 | ❌ Missing |
| 8 | Red (Antique) | +22 cm | Jumbo | $1.86 | ❌ Missing |
| 9 | Red (Antique) | 18-19 cm | Premium | $1.26 | ❌ Missing |
| 10 | Rose / Antique White Shades Pink | +22 cm | Jumbo | $1.86 | ❌ Missing |
| 11 | Rose / Antique White Shades Pink | 18-19 cm | Premium | $1.26 | ❌ Missing |

> [!IMPORTANT]
> The 3 remaining missing Hydrangea are trickier — the DB has "Green" at $0.40 (Mini/Dark Mini) but the sheet has both a "Dark Mini Green" at $0.40 and a "Mini Green" at $0.40 as separate rows. Similarly, the DB has one "Hulk" at $1.08 (Select) but the sheet also has a "Hulk (Antique Blue)" Big Petal entry at $1.11 which IS in the DB separately.

| # | Variety | Subcategory | Size | Grade | Price | Status |
|---|---------|-------------|------|-------|-------|--------|
| 12 | Green | Dark Mini | 8-9 cm | Select | $0.40 | ❌ Missing (DB has one "Green" at $0.40, likely the Mini) |
| 13 | Green (Antique) | Antique | 14-16 cm | Select | $1.08 | ❌ Missing (DB "Green" is $0.40 — this $1.08 entry wasn't imported) |
| 14 | Purple (Antique) | Antique | 14-16 cm | Select | $1.08 | ❓ Possibly the one in DB at $1.08 — need to verify |

---

## Stock — 8 missing rows

Each Kiro color appears twice in the sheet (Spray and Standard subcategories, same price). The DB has only one entry per color.

| # | Variety | Subcategory in sheet | Color | Price | Status |
|---|---------|---------------------|-------|-------|--------|
| 15 | Kiro Apricot | Standard | Apricot | $0.42 | ❌ Missing (DB has the Spray version) |
| 16 | Kiro Dark Blue | Standard | Dark Blue | $0.42 | ❌ Missing |
| 17 | Kiro Hot Pink | Standard | Hot Pink | $0.42 | ❌ Missing |
| 18 | Kiro Lavender | Standard | Lavender | $0.42 | ❌ Missing |
| 19 | Kiro Pink | Standard | Pink | $0.42 | ❌ Missing |
| 20 | Kiro Purple | Standard | Purple | $0.42 | ❌ Missing |
| 21 | Kiro White | Standard | White | $0.42 | ❌ Missing |
| 22 | Kiro Yellow | Standard | Yellow | $0.42 | ❌ Missing |

---

## Chrysanthemum — ~10 missing rows

Some Chrysanthemum varieties appear under multiple subcategories (e.g., Cushion stems=7, Cremon stems=10, etc.) but the DB only has one entry. These share the same `Variety + Color` key but differ by subcategory and stem count.

| # | Variety | Color | Missing Subcat (stems) | DB has Subcat (stems) |
|---|---------|-------|----------------------|---------------------|
| 23 | Bernal | Yellow | Cremon (10) | Cushion (7) |
| 24 | Andrea | Purple | Cremon (10) | Cushion (7) |
| 25 | Nandi | Bicolor | Cremon (10) | Daisy (7) or Cushion? |
| 26 | Rossano | Pink | Cremon (10) | Cushion (7) |
| 27 | Brazuca | Purple | Mum Ball (10) | Cushion (7) |
| 28 | Handsome | Bicolor | Daisy (7) | Minicarn (10) — same name cross-category |
| 29 | Kadanz | Bicolor | Daisy (7) | Minicarn (10) |
| 30 | Airbrush Custard | Bicolor | Daisy (7) | Minicarn (10) |
| 31 | Ruble | Bicolor | Daisy (7) | Minicarn (10) |

> [!NOTE]
> Items 28-31 (Handsome, Kadanz, Airbrush Custard, Ruble) appear in BOTH the Minicarnation (Carnation) category AND Chrysanthemum Daisy category. The DB has entries under both Carnation and Chrysanthemum, so these may actually be present. Need to verify the exact counts.

---

## Dianthus — 1 missing row

| # | Variety | Subcategory | Color | Price | Status |
|---|---------|-------------|-------|-------|--------|
| 32 | Green Ball | Green Ball | Green | $0.40 | ❌ Missing (DB has the "Green" subcategory version) |

---

## Summary

| Category | Missing | Root Cause |
|----------|---------|------------|
| Hydrangea | ~14 | Multiple grades/sizes per variety (Select/Premium/Jumbo) |
| Stock | 8 | Spray vs Standard subcategory duplicates |
| Chrysanthemum | ~10 | Cross-subcategory duplicates (Cushion/Cremon/Daisy/Button) |
| Dianthus | 1 | Duplicate subcategory for Green Ball |
| **Total** | **~33** | |

> [!WARNING]
> Before inserting these, consider: should each grade/size be a **separate catalog row**, or should the DB schema capture grade/size as additional columns on the existing row? Adding them as separate rows means the same variety name will appear multiple times in the catalog table, which might confuse users unless the grade/size is visible.
