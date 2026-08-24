# 🧴 Fragrance Collection Database

Umar's personal fragrance archive — for layering combos, review scripts, and collection tracking.

## Structure

Each fragrance entry in `fragrance-db.json` has:

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✅ | Short slug (e.g. `sauvage-edt`) |
| `name` | ✅ | Full name (e.g. "Sauvage Eau de Toilette") |
| `brand` | ✅ | House/brand name |
| `type` | ✅ | "EDT", "EDP", "Parfum", "Extrait", "Cologne", "Body Spray" |
| `volume` | Optional | e.g. "100ml" |
| `year` | Optional | Release year |
| `gender` | Optional | "Male", "Female", "Unisex" |
| `season` | Optional | Array: "Spring", "Summer", "Fall", "Winter" |
| `occasion` | Optional | Array: "Daily", "Office", "Date Night", "Formal", "Clubbing", "Casual" |
| `longevity` | Optional | "Weak", "Moderate", "Good", "Excellent", "Beast" |
| `sillage` | Optional | "Intimate", "Moderate", "Heavy", "Beast" |
| `rating` | Optional | 1-10 (your personal rating) |
| `topNotes` | Optional | Array of notes |
| `heartNotes` | Optional | Array of notes |
| `baseNotes` | Optional | Array of notes |
| `scentProfile` | Optional | Array of vibe tags: "Fresh", "Sweet", "Spicy", "Woody", "Aromatic", "Citrus", "Gourmand", "Aquatic", "Floral", "Earthy", "Smoky", "Leather", "Powdery", "Green", etc. |
| `complements` | Optional | Array of other fragrance IDs that layer well with this |
| `reviewScript` | Optional | Cached/prewritten review script |
| `tags` | Optional | Array of personal tags (e.g. "dumb-reach", "winter-banger", "date-killer") |
| `notes` | Optional | Free-text personal notes |

## Adding / Updating

**Quick add (just names):** Paste names and brands — I'll scaffold entries. We backfill notes later.

**Full entry:** Send as much detail as you want. I'll parse and structure it.

## Usage

- **Layering combos:** Ask me "what layers well with [X]?" — I'll cross-reference notes, scent profiles, and known complements.
- **Review scripts:** Ask for a script template for a fragrance — I'll generate based on notes, season, and occasion.
- **What's missing:** Ask "what should I add to my collection based on what I have?"

---

_Last updated: 24 Aug 2026_