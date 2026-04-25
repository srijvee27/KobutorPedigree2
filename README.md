# Pigeon Pedigree Generator

Production-ready Next.js (App Router) pedigree certificate generator with:

- Dynamic multi-level pedigree input form
- Instant image upload preview
- Pixel-focused pedigree chart preview
- Print + PDF export (A4)
- MySQL persistence through API routes
- Browser fallback storage when API runtime is unavailable (shared hosting limitation)

## 1) Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` from `.env.example`.
3. Import `sql/pedigree_schema.sql` in phpMyAdmin.
4. Run:
   ```bash
   npm run dev
   ```

## 2) API Endpoints

- `POST /api/save` - saves current pedigree
- `GET /api/load?latest=1` - loads latest pedigree
- `GET /api/load?id=<id>` - loads by record ID

## 3) XAMPP + InfinityFree Notes

- XAMPP local: use MySQL credentials from your local instance.
- InfinityFree: if Node/serverless runtime is restricted, app still works with local browser fallback storage for save/load.

## 4) Print/PDF

- `Print / Save as PDF` button:
  - Generates a downloadable A4 PDF via `html2canvas + jsPDF`.
  - Opens print dialog with `@media print` styles.

## 5) Screenshot

![Pigeon Pedigree Generator](public/Screenshot_20260425_104400_Chrome.jpg)
