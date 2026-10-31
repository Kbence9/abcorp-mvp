# abcorp-mvp

Pénzügyi elemző és pályázatkezelő webes platform kis- és középvállalkozásoknak.
A cél: az Excelben vezetett pénzügyi modellek (pl. megtérülés-számítás) böngészőben
futtatása, a pályázatok egy helyen kezelése, és az eredményekből riport készítése.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Supabase (Postgres, Auth, Storage) · Tailwind CSS · shadcn/ui

## Státusz

Korai MVP (v0.0.6), aktív fejlesztés alatt.

| Funkció | Állapot |
| --- | --- |
| Regisztráció, bejelentkezés (Supabase Auth) | kész |
| Felhasználói dashboard, cégprofil | kész |
| ROI / megtérülés-számítás (`/api/calculate-roi`) | kész |
| Pályázatok listázása, feltöltése (Supabase Storage) | kész |
| Admin felület (`/admin`, `/palyazatok/admin`) | kész |
| Excel-sablonok feltöltése és futtatása (ExcelJS) | tervezett |
| PDF-riport generálás (pdf-lib) | tervezett |
| Pályázat-értesítők | tervezett |

## Futtatás helyben

**Előfeltételek:** Node.js 20+, egy Supabase-projekt (az ingyenes csomag elég).

```bash
git clone https://github.com/Kbence9/abcorp-mvp.git
cd abcorp-mvp
npm install
```

Hozz létre egy `.env.local` fájlt a projekt gyökerében (ez a fájl a `.gitignore` miatt
nem kerül a repóba), és add meg benne a Supabase-projekted adatait
(Supabase → Project Settings → API):

| Változó | Mi ez |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | a Supabase-projekt URL-je |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a projekt publikus (anon) kulcsa |

Ezután:

```bash
npm run dev
```

Az alkalmazás a <http://localhost:3000> címen érhető el.

### Supabase-oldali beállítás

Az alkalmazás a következőket várja a Supabase-projektben:

- `profiles` tábla (felhasználói és cégadatok, `is_admin` mező az admin jogosultsághoz)
- `roi_calculations` tábla (a mentett megtérülés-számítások)
- `palyazatok` tábla és azonos nevű Storage bucket (a feltöltött pályázati anyagok)

## Parancsok

| Parancs | Mit csinál |
| --- | --- |
| `npm run dev` | fejlesztői szerver |
| `npm run build` | éles build |
| `npm run start` | az éles build futtatása |
| `npm run lint` | ESLint |

## Mappák

```
app/          oldalak és API-útvonalak (App Router)
components/   React-komponensek (ROI-űrlap, pályázatlista, feltöltés, ui/)
lib/supabase/ Supabase kliens (böngésző, szerver, middleware)
middleware.ts munkamenet-frissítés és útvonalvédelem
```

## Licenc

MIT, lásd [LICENSE](LICENSE).
