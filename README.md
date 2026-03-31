# abcorp-mvp

KKV-k számára készült **pénzügyi elemző és pályázatkezelő platform**.  
Excel modellek online futtatása, pályázat kereső + értesítők, riport generálás.

**Tech stack:** Next.js 15 (App Router) + Supabase + TypeScript + Tailwind CSS

## Funkciók (MVP)
- Excel sablonok feltöltése és online futtatása (import/export)
- Pályázat kereső és automatikus értesítők
- Eredményekből riport generálás (PDF)
- Felhasználókezelés (regisztráció, cég adatok)

## Tech Stack Döntés
- **Frontend + Backend**: Next.js 15 (App Router, Server Components)
- **Adatbázis & Auth**: Supabase (Postgres, Auth, Storage, Realtime)
- **Excel kezelés**: ExcelJS
- **Riportok**: pdf-lib
- **Styling**: Tailwind CSS + shadcn/ui (opcionális)
- **Hosting**: Vercel (frontend) + Supabase

## Gyorsindítás

### Előfeltételek
- Node.js 20+
- Supabase fiók (ingyenes)

### 1. Supabase projekt létrehozása
1. Menj a [supabase.com](https://supabase.com) oldalra és hozz létre egy új projektet.
2. Másold ki az URL-t és az anon/public kulcsot (Settings → API).

### 2. Projekt telepítése
```bash
# Ha még nincs klónozva
git clone https://github.com/Kbence9/abcorp-mvp.git
cd abcorp-mvp

# Next.js projekt létrehozása Supabase sablonnal (ajánlott)
npx create-next-app@latest . --example with-supabase

# vagy ha már van alap Next.js, akkor manuálisan:
npm install @supabase/supabase-js @supabase/ssr



This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
