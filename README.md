# SUMO — Heavyweight quests for old wallets

Landing page crypto bertema **task / quest** dengan alur terkunci: login memakai X (Privy), lalu user harus membuktikan satu **wallet EVM yang umurnya lebih dari 3 tahun**. Umur wallet dicek di server lewat **Etherscan API**. Setelah lolos gate, user menyelesaikan 3 lift (wallet age, follow, reply).

Stack: **Next.js 14 App Router + TypeScript + Tailwind CSS v4 + Privy (X login) + JSON file database + Etherscan API v2**.

> Ini MVP yang jujur: verifikasi follow & reply masih **mock** (selalu sukses setelah 2 detik). Titik pemasangan logika X API aslinya sudah ditandai `TODO(live-verification)` di `src/lib/verify/`.

---

## 1. Fitur

- **Landing page** full animasi + responsive: hero, Tasks preview, quest board, footer, marquee, mascot SVG buatan sendiri.
- **Login X saja** lewat Privy (`loginMethods: ['twitter']`) — tanpa email/password/seed phrase.
- Setelah login tampil avatar, nama, `@username`, dan tombol **Disconnect**.
- **Eligibility = umur wallet > 3 tahun**, dicek 100% di server:
  1. User submit alamat EVM di gate.
  2. Server verifikasi Privy access token, validasi format alamat, cek wallet belum dipakai akun lain.
  3. Server panggil Etherscan API v2 (`account/txlist`, fallback `account/tokentx`) untuk transaksi Ethereum pertama wallet.
  4. Eligible hanya jika transaksi pertama **lebih tua dari 3 tahun**.
- **Tidak eligible** → state “Not Eligible” dengan tanggal aktivitas pertama, umur wallet, dan form untuk coba wallet lain.
- **Eligible** → badge “Eligible ✓”, wallet dikunci ke akun, progress bar, dan 3 lift:
  1. Wallet older than 3 years (otomatis selesai saat gate lolos).
  2. Follow akun SUMO → buka profil di tab baru → Verify.
  3. Reply post terakhir SUMO → buka post di tab baru → Verify.
- Semua task selesai → state **“You're In!”** dengan ringkasan `@username`, wallet, umur wallet, status completed.
- Loading, error, empty state untuk semua aksi; rate limit sederhana per user; semua route API verifikasi Privy token.

---

## 2. Desain

Palet dari brief dipetakan ke peran (bukan hex berserakan):

| Token | Hex | Peran |
|---|---|---|
| `void` | `#211951` | background utama |
| `deep` | `#170f3a` | panel/card gelap (turunan) |
| `paper` | `#F0F3FF` | teks & section terang |
| `violet` | `#836FFF` | aksen A: shadow keras, nomor, stempel |
| `mint` | `#15F5BA` | aksen B: CTA utama, status eligible/completed |
| `alert` | `#FF5C7A` | error / not eligible |

Arah: **Web3 maximalism + neo-brutalism** (border 3px, hard shadow tanpa blur, stiker miring, marquee). Font: **Anton** (display), **Space Grotesk** (body), **JetBrains Mono** (data). Semua token ada di `src/app/globals.css` (`@theme`).

---

## 3. Struktur Folder

```
.
├── data/
│   ├── .gitkeep
│   └── sumo.json                  # database JSON (dibuat otomatis, gitignored)
├── public/
│   ├── sumo-chibi.png             # mascot chibi di hero card
│   └── sumo-logo.png              # logo di navbar/footer
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── eligibility/route.ts        # gate umur wallet (Etherscan)
│   │   │   └── tasks/
│   │   │       ├── verify-follow/route.ts
│   │   │       └── verify-reply/route.ts
│   │   ├── globals.css            # Tailwind v4 + token desain
│   │   ├── icon.png               # favicon
│   │   ├── layout.tsx             # font, metadata, Privy provider
│   │   └── page.tsx               # susun semua section
│   ├── components/
│   │   ├── brand/                 # mascot SVG, logo/ikon
│   │   ├── layout/                # Navbar, Footer, ConfigBanner
│   │   ├── providers/             # PrivyProvider + context auth
│   │   ├── quest/                 # ConnectButton, ProfileCard, TaskCard,
│   │   │                          # WalletForm, WalletGateCard, gate panels,
│   │   │                          # SuccessState
│   │   ├── sections/              # Hero, TasksPreview, QuestBoard
│   │   └── ui/                    # Button, Card, Sticker, Marquee, ProgressBar,
│   │                              # InlineAlert, Avatar, Spinner
│   ├── config/
│   │   └── links.ts               # SEMUA link eksternal (ganti di sini)
│   ├── hooks/
│   │   └── use-quest.ts           # state machine client (gate wallet + tasks)
│   └── lib/
│       ├── auth.ts                # verifikasi token Privy + ambil akun X
│       ├── etherscan.ts           # wallet age: txlist/tokentx + cache + verdict
│       ├── evm.ts                 # validasi alamat EVM
│       ├── http.ts                # HttpError + wrapper route
│       ├── privy.ts               # PrivyClient server-only
│       ├── progress.ts            # bangun QuestProgress dari record
│       ├── quest-types.ts         # tipe bersama client/server
│       ├── rate-limit.ts          # in-memory limiter
│       ├── store.ts               # baca/tulis JSON + lock + atomic write
│       ├── users.ts               # upsert, link wallet, task progress
│       └── verify/
│           ├── follow.ts          # mock + stub live verifier
│           ├── reply.ts           # mock + stub live verifier
│           ├── index.ts           # pilih mock/live
│           ├── types.ts           # interface verifier
│           └── verify-task.ts     # handler bersama 2 route verify
├── .env.example
├── .eslintrc.json
├── .npmrc
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

(Tailwind v4 dikonfigurasi lewat CSS `@theme` di `src/app/globals.css` — tidak ada `tailwind.config`.)

---

## 4. Quick Start

```bash
npm install
cp .env.example .env.local     # Windows: copy .env.example .env.local
# isi .env.local (lihat bagian 5-7)
npm run dev                    # http://localhost:3000
```

Build produksi:

```bash
npm run build
npm start
```

Catatan:
- `.env.local` dibaca otomatis oleh Next.js. `.env` juga dibaca; file itu sudah disediakan dan masuk `.gitignore`.
- Tidak ada langkah database. File `data/sumo.json` dibuat otomatis saat user pertama kali disimpan.
- `.npmrc` menyetel `legacy-peer-deps=true` karena peer Solana opsional dari Privy v2 bentrok dengan npm 11; app ini tidak memakai Solana.
- Tanpa `NEXT_PUBLIC_PRIVY_APP_ID`, app tetap bisa dibuka (landing page tampil) dengan banner “Setup mode”; tombol login dinonaktifkan sampai env diisi.

---

## 5. Setup Privy (login X)

1. Buka [dashboard.privy.io](https://dashboard.privy.io) → login → **Create app** → beri nama, mis. `SUMO`.
2. Ambil **App ID** dan buat **App secret**:
   - Masuk app → **Configuration → App settings → Basics**.
   - Di bagian **API keys**, klik **New secret** → pilih **Full access** (server perlu `getUser`) → **Generate secret** → copy.
   - App ID ada di halaman yang sama (Basics). App secret **tidak bisa dilihat lagi** — simpan di `.env.local`.
3. Aktifkan login X:
   - Sidebar app → **Login Methods** → tab **Socials** → **X (Twitter)** → toggle **enabled**.
   - Paling gampang: biarkan memakai **credential default Privy** (tanpa custom Client ID/Secret). Login tetap jalan dan branding mengikuti Privy.
   - Kalau mau pakai X app sendiri, isi Client ID/Secret dari langkah 6.
4. Isi allowed origin / app client:
   - Tambahkan `http://localhost:3000` dan `http://localhost:3100` serta domain produksi nanti di konfigurasi **App clients / allowed origins**. Tanpa ini, login dari origin tersebut bisa ditolak.
5. Di code, login method sudah dikunci di `src/components/providers/privy-provider.tsx`:

   ```ts
   loginMethods: ["twitter"],
   ```

---

## 6. Setup X Developer App (opsional)

Login X lewat Privy **tidak wajib** memakai X app sendiri — kalau memakai credential default Privy, lewati bagian ini. Bagian ini hanya untuk custom OAuth login atau eksperimen verifikasi task live.

1. Buka [developer.x.com](https://developer.x.com) → **Developer Portal → Projects & Apps** → create project + app.
2. **User authentication settings → Set up**:
   - **App permissions**: `Read` (cukup untuk login).
   - **Type of App**: `Web App, Automated App or Bot` (**Confidential client** — Privy butuh client secret). Jangan `Native App`.
   - **Callback URI / Redirect URL**:
     ```
     https://auth.privy.io/api/v1/oauth/callback
     ```
     persis, tanpa trailing slash, jangan localhost.
   - **Website URL**: domain kamu (sementara boleh `https://x.com/SUMO_fake`).
3. Ambil **OAuth 2.0 Client ID and Client Secret** → tempel di Privy **Login Methods → Socials → X** (custom credentials) dan simpan juga di `.env.local`.

> App ini **tidak** memakai `TWITTER_BEARER_TOKEN` lagi untuk eligibility. Kalau nanti verifikasi follow/reply live diimplementasikan, token/endpoint X API akan dibutuhkan lagi. Saat ini follow/reply masih mock.

---

## 7. Environment Variables

Salin `.env.example` → `.env.local`, lalu isi:

| Variable | Wajib | Dipakai oleh | Keterangan |
|---|---|---|---|
| `NEXT_PUBLIC_PRIVY_APP_ID` | ya | client + server | App ID Privy. Satu-satunya var yang boleh sampai browser. |
| `PRIVY_APP_SECRET` | ya | server | Untuk verifikasi access token & `getUser`. **Jangan** pakai prefix `NEXT_PUBLIC_`. |
| `ETHERSCAN_API_KEY` | ya | server | Etherscan API v2, untuk membaca transaksi Ethereum pertama wallet. Jangan pernah ke client. |
| `TWITTER_CLIENT_ID` | opsional | Privy dashboard | Hanya kalau pakai custom X login. Tidak dibaca runtime app. |
| `TWITTER_CLIENT_SECRET` | opsional | Privy dashboard | Sama seperti di atas. |
| `TWITTER_BEARER_TOKEN` | opsional | server | Disiapkan untuk verifikasi X task live nanti. Tidak dipakai sekarang. |
| `WALLET_MIN_AGE_YEARS` | opsional | server | Default `3`. Umur minimum wallet (strictly older than). |
| `DATA_FILE` | opsional | server | Lokasi file JSON. Default `./data/sumo.json` (relatif ke root project). |
| `TASKS_VERIFY_MODE` | opsional | server | `mock` (default) atau `live`. |
| `ETHERSCAN_API_URL` | opsional | server | Override base URL Etherscan (untuk stub lokal). |

Buat API key Etherscan gratis di [etherscan.io/myapikey](https://etherscan.io/myapikey). Free tier cukup untuk MVP, tapi perhatikan rate limit 5 request/detik; hasil pengecekan wallet di-cache 1 jam di server.

---

## 8. Database (JSON file)

Tidak ada database server. Semua state disimpan di **satu file JSON**:

```
data/sumo.json   ← dibuat otomatis saat pertama kali menulis
```

- Lokasi bisa diganti lewat `DATA_FILE`. Path relatif dihitung dari root project.
- Isi file: `{ version: 1, users: [ ... ] }`. Tiap user menyimpan:
  - identitas X (`id` = Privy DID, `twitterId`, username, nama, avatar),
  - hasil gate (`eligible`, `eligibilityCheckedAt`),
  - wallet (`walletAddress` lowercase, `walletFirstTxAt`, `walletAgeDays`, `walletAgeYears`, `walletSubmittedAt`),
  - progress task (`followVerifiedAt`, `replyVerifiedAt`),
  - `createdAt` / `updatedAt` (ISO string).
- **Uniqueness dijaga di kode**, di dalam satu locked read-modify-write:
  - satu wallet hanya boleh dipakai satu user,
  - satu akun X hanya satu record.
- **Tulis atomic**: JSON ditulis ke file `.tmp` lalu di-rename, jadi file tidak pernah setengah tertulis.
- **Antrian in-process** (`src/lib/store.ts`) membuat request concurrent tidak saling menimpa. Ini single-process/single-instance; untuk multi-instance pindah ke DB nyata.
- Reset data saat testing: hapus `data/sumo.json` (atau timpa dengan `{"version":1,"users":[]}`).
- File JSON ini gitignored. Jangan commit data user.

---

## 9. Alur & Aturan Bisnis

1. **Login** → Privy mengembalikan access token + linked account `twitter_oauth` (field `subject` = X user id).
2. **Wallet-age gate** (`POST /api/eligibility`, butuh `Authorization: Bearer <privy access token>`):
   - tanpa body `address` → server mengembalikan state gate saat ini (`wallet_required` atau `eligible`),
   - dengan `{ address }`:
     - rate limit 8×/menit/user,
     - validasi regex EVM, normalisasi lowercase,
     - kalau akun sudah punya wallet: hanya boleh wallet yang sama (idempotent); ganti wallet → 409,
     - kalau wallet dipakai user lain → 409,
     - Etherscan cek transaksi Ethereum pertama (`txlist`, fallback `tokentx`); hasil di-cache 1 jam,
     - eligible jika transaksi pertama **strictly older** dari `WALLET_MIN_AGE_YEARS` (default 3),
     - kalau eligible → wallet dikunci ke akun, `eligible=true`, lift 01 selesai.
3. **Verify follow/reply** (`POST /api/tasks/verify-follow` / `verify-reply`):
   - rate limit 6×/menit/user, wajib lolos gate,
   - idempotent (kalau sudah selesai, tidak error),
   - `mock` mode: delay 2 detik lalu sukses; `live` mode: memanggil verifier asli (belum diimplementasi → 501),
   - sukses → simpan timestamp.
4. **Selesai** → wallet + follow + reply completed → UI menampilkan “You're In!”.

Semua route API ada di `runtime = "nodejs"` dan `dynamic = "force-dynamic"` karena memakai file JSON + Privy server SDK + Etherscan.

---

## 10. API Reference Singkat

Semua route butuh header:

```
Authorization: Bearer <access token Privy>
Content-Type: application/json
```

| Method | Route | Body | Sukses | Error penting |
|---|---|---|---|---|
| POST | `/api/eligibility` | `{}` atau `{ "address": "0x…40 hex" }` | `200 { eligible, reason, message, cached, progress, wallet }` | 401 token, 409 wallet dipakai/ganti, 422 format, 429 limit, 502/503 Etherscan |
| POST | `/api/tasks/verify-follow` | `{}` | `200 { message, progress }` | 403 belum lolos gate, 422 gagal verify, 429, 501 live belum ada |
| POST | `/api/tasks/verify-reply` | `{}` | `200 { message, progress }` | sama |

`reason` eligibility: `wallet_required`, `wallet_eligible`, `wallet_too_young`, `wallet_no_history`.

Contoh:

```bash
TOKEN="<access token dari Privy>"
curl -X POST http://localhost:3000/api/eligibility \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"}'
```

`progress` berbentuk:

```json
{
  "twitter": { "id": "123", "username": "user", "name": "User", "avatarUrl": "https://…" },
  "eligibility": {
    "eligible": true,
    "checkedAt": "2026-11-15T…",
    "minAgeYears": 3,
    "wallet": {
      "address": "0xd8da…6045",
      "firstTxAt": "2015-09-28T…",
      "ageDays": 4000,
      "ageYears": 11.1,
      "minAgeYears": 3
    }
  },
  "tasks": {
    "wallet": { "status": "completed", "address": "0xd8da…", "firstTxAt": "2015-09-28T…", "ageYears": 11.1 },
    "follow": { "status": "pending" },
    "reply": { "status": "pending" }
  },
  "completedCount": 1, "totalCount": 3, "percent": 33, "allDone": false,
  "verifyMode": "mock"
}
```

---

## 11. Verifikasi Task: Mock vs Live

Default: **mock**. Atur lewat env:

```
TASKS_VERIFY_MODE=mock   # selalu sukses setelah 2 detik
TASKS_VERIFY_MODE=live   # memakai verifier asli
```

- Mock & live **dipisah per file**:
  - `src/lib/verify/follow.ts` → `mockFollowVerifier`, `liveFollowVerifier`
  - `src/lib/verify/reply.ts` → `mockReplyVerifier`, `liveReplyVerifier`
  - `src/lib/verify/index.ts` → `getVerifier(task, mode)`
- Placeholder asli ditandai komentar `TODO(live-verification)` dan sengaja `throw NotImplementedError` supaya route menjawab 501, bukan lolos diam-diam.
- Petunjuk endpoint ada di komentar file terkait:
  - follow: `GET /2/users/by/username/:username` lalu `GET /2/users/:source_user_id/following` (butuh **user-context token**).
  - reply: `GET /2/tweets/search/recent?query=conversation_id:<SUMO_LAST_POST_ID> from:<username>`.

Status mode juga ditampilkan kecil di UI (“verification mode: mock”) supaya tidak menipu pengunjung.

---

## 12. Mengganti Link

Semua link eksternal ada di **`src/config/links.ts`**:

```ts
export const LINKS = {
  SUMO_TWITTER_PROFILE: "https://x.com/SUMO_fake",
  SUMO_TWITTER_USERNAME: "SUMO_fake",
  SUMO_LAST_POST: "https://x.com/SUMO_fake/status/0000000000000000000",
  SUMO_LAST_POST_ID: "0000000000000000000",
};
```

Ganti 4 nilai itu; komponen mengambil dari file ini (navbar, hero, task, footer, success state, TODO verifier). Tidak ada href X yang di-hardcode di komponen. Setelah ganti, restart dev server.

---

## 13. Testing Checklist

- [ ] `npm install && npm run dev` — landing page tampil, banner setup hilang setelah env diisi.
- [ ] Klik **Connect Twitter** → modal Privy hanya menampilkan X → login → avatar/nama/`@username` + Disconnect muncul.
- [ ] Gate muncul: submit wallet acak/baru → **Not Eligible** + tanggal aktivitas pertama + umur wallet.
- [ ] Submit wallet tua (mis. wallet dengan transaksi Ethereum > 3 tahun) → **Eligible ✓**, wallet terkunci, progress 1/3.
- [ ] Wallet sama dari akun lain → 409 “already linked to another SUMO account”.
- [ ] Ganti wallet setelah eligible → 409 “cannot be changed”.
- [ ] Verify follow & reply → tombol berubah “Verifying…” ±2 detik → status Completed, progress naik ke 3/3.
- [ ] Semua selesai → **You're In!** menampilkan `@username`, wallet, umur wallet, completed.
- [ ] Disconnect → state kembali kosong.
- [ ] `npm run build` lolos tanpa error TypeScript/lint.

Contoh wallet untuk testing: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` (aktivitas pertama 2015 → eligible).

---

## 14. Troubleshooting

| Gejala | Sebab / solusi |
|---|---|
| Banner merah “Setup mode” | `NEXT_PUBLIC_PRIVY_APP_ID` kosong. Isi `.env.local`, restart dev server. |
| Modal Privy tidak menampilkan X / error origin | X belum di-enable di **Login Methods → Socials**, atau origin belum diizinkan di app client Privy. |
| 401 “session invalid” | Access token Privy kedaluwarsa (±1 jam). Klik Disconnect lalu connect ulang. |
| “Etherscan is not configured” | `ETHERSCAN_API_KEY` kosong. Isi di `.env.local`, restart. |
| “Etherscan rejected the API key” | Key salah/expired. Generate ulang di [etherscan.io/myapikey](https://etherscan.io/myapikey). |
| “Etherscan rate limit reached” | Terlalu banyak lookup. Tunggu sebentar; hasil wallet sukses di-cache 1 jam. |
| “No Ethereum transaction history found” | Wallet belum pernah bertransaksi di Ethereum mainnet. Coba wallet lain. |
| “Wallet too young” | Transaksi pertama < 3 tahun. Coba wallet yang lebih tua. |
| Wallet dianggap sudah dipakai | Memang aturannya (unik). Reset data saat testing: hapus `data/sumo.json`. |
| `STORE_CORRUPT` / JSON rusak | Restore backup atau hapus `data/sumo.json` untuk mulai dari kosong. |
| Data “hilang” setelah deploy | JSON lokal tidak ikut ke instance baru. Set `DATA_FILE` ke volume persisten atau pindah ke DB nyata. |

---

## 15. Keamanan & Batasan

- Semua API route memverifikasi **Privy access token** (`privy.verifyAuthToken`) dan mengambil identitas X dari **Privy getUser**, bukan dari body client.
- Status eligible **tidak pernah** dipercaya dari client; hanya hasil Etherscan di server yang bisa mengunci wallet.
- `PRIVY_APP_SECRET` dan `ETHERSCAN_API_KEY` hanya dipakai server. Hanya `NEXT_PUBLIC_PRIVY_APP_ID` yang masuk bundle browser.
- Rate limit per user: eligibility 8/menit, verify 6/menit (in-memory, single instance).
- Wallet: format divalidasi, di-lowercase, unik, dikunci setelah lolos, dan tidak bisa diganti.
- Wallet yang tidak lolos tidak disimpan, jadi user boleh mencoba wallet lain.
- File JSON tidak boleh di-commit; sudah masuk `.gitignore`.

Batasan MVP:
- **Umur wallet = transaksi pertama di Ethereum mainnet** (normal tx, fallback ERC-20 transfer). Wallet yang aktif hanya di chain lain belum terdeteksi.
- Wallet dibuat tapi belum pernah bertransaksi dianggap tidak punya umur → not eligible.
- Rate limiter in-memory → pindah ke Redis/Upstash untuk multi-instance/serverless.
- JSON file lokal → untuk produksi pindah ke Postgres/Redis dan backup rutin. Jangan pakai JSON store di multi-instance.
- Verifikasi follow/reply masih mock (lihat bagian 11).
- `@privy-io/server-auth` sudah ditandai deprecated oleh Privy (penggantinya `@privy-io/node`), tapi tetap dipakai di sini; method yang dipakai (`verifyAuthToken`, `getUser`) masih stabil. Migrasi nanti cukup di `src/lib/privy.ts` + `src/lib/auth.ts`.
