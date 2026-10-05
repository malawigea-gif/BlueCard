# Blue Card Website

The Blue Card Programme website and Admin panel, built with Next.js 15, Prisma and PostgreSQL (Supabase). It runs online on Vercel — see **Hosting online** below.

## Running for the first time (Windows / PowerShell)

Requires Node.js 20 or later.

```powershell
cd $HOME\Downloads\BlueCard
copy .env.example .env      # then fill in the Supabase settings, AUTH_SECRET and ADMIN_PASSWORD
npm install
npm run setup               # creates the tables, the Admin account and sample content
npm run dev                 # http://localhost:3000
```

Default Admin login: `admin@bluecard.lk` / `Admin@123` (configurable in `.env`). Change the password under **Users** after your first login.

For a live server: `npm run build`, then `npm start`.

## Pages

| Page | Route |
| --- | --- |
| Home — 3 articles in 3 columns + gallery | `/` |
| Our Programs + Blue Card Registration button | `/programs` |
| About Us — organisational structure, partner organisations | `/about` |
| Contact Us — details, map, message form | `/contact` |
| Login (Admin / User) | `/login` |
| Blue Card registration | `/register` |
| Member profile + digital Blue Card | `/profile` |
| Admin panel | `/admin` |

## Registration workflow

1. A visitor fills in the `/register` form, and the account is created with **Pending** status.
2. An Admin approves or rejects the application under **Blue Card Registrations** (a reason is required to reject).
3. On approval, a card number such as `BC-2026-00001` is issued automatically.
4. The member logs in to view their profile and print their Blue Card.

Member photos, passport copies and member documents are stored privately (Supabase Storage, or `uploads/private` when Supabase Storage is not configured) and can only be viewed by Admins and the member who uploaded them.

## Notes

- **SMS / email:** `src/lib/notify.ts` currently only writes notifications to the server log. Connect an SMS gateway or SMTP service there.
- **Backups:** Supabase keeps daily backups on paid plans only. On the free plan, download a backup from Supabase → Database → Backups, or use `pg_dump`, regularly.
- **Uploads:** stored in Supabase Storage when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set, otherwise in the local `uploads/` folder. Maximum 4 MB per file. Photos larger than 1 MB are made smaller in the browser before upload.

## Languages (English / Deutsch)

- The whole site — public pages and the Admin panel — works in English and German. Use the **EN | DE** buttons in the header; the choice is remembered in a `lang` cookie. Visitors whose browser is set to German get German on their first visit.
- All interface text is in `src/lib/i18n/dict.ts` (`en` and `de`).
- Articles, programmes, gallery captions, About/Contact texts and the tagline have an English and a German field in the Admin panel. German fields are optional — when one is empty, the English text is shown.
- Article editor: toolbar (bold, heading, bullet list), **Preview** and **Tidy up text**. Text is also tidied when saved, and `**` typed into a title is removed (titles are always bold).

After updating the code, stop the dev server and run `npx prisma db push` once (adds the German columns and regenerates the Prisma client), then `npm run dev`.

## Eligibility assessment (online test)

When a member reaches journey step **2. Eligibility assessment**, the **Eligibility assessment** card on their profile opens the online MCQ test (`/profile/assessment`).

- There are 5 papers (`src/lib/assessment/papers.ts`) of 40 questions each: 10 English, 10 general knowledge, 10 mathematics & IQ and 10 about Germany. The correct answers stay on the server and never reach the browser.
- Each attempt gets a random paper the member has not had yet. The order of the questions within each section, and of the answer options, also changes between attempts.
- The time limit is 50 minutes. The timer runs on the server, so closing the page does not stop it. When the time is up, the paper closes automatically and is marked.
- Each question can be answered only once (enforced by a unique key in the database).
- A member has at most 5 attempts. An Admin can give an attempt back by deleting it under **Blue Card Registrations → member → Eligibility test**.
- All results are listed under **Admin → Eligibility tests**.
- Change the duration, number of attempts and pass mark (60%) in `src/lib/assessment/config.ts`.

## Fees (PayHere)

- **Job matching & interviews fee (€10):** when a member reaches step **5. Job matching & interviews** (after qualification recognition), their profile shows a "Pay €10.00 online" button. The fee is valid for **one year** or **10 interviews**, whichever comes first; after that the member pays again.
- **Visa & service fee (€100):** paid when the member reaches step **7. Visa application**.
- Admins record interviews under **Blue Card Registrations → member → Fees & interviews**. Each interview counts against the member's valid fee. Cash or bank payments can be recorded there as "manual" payments.
- An Admin cannot move a member past step 5 or step 7 until the matching fee has been paid.
- All payments are listed under **Admin → Payments**. Change amounts and terms in `src/lib/payments/config.ts`.

### Setting up PayHere

1. In your PayHere merchant account, go to **Settings → Domains & Credentials** and add your domain to get the Merchant ID and Merchant Secret. For testing, use a separate account at sandbox.payhere.lk.
2. Add `SITE_URL`, `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET` and `PAYHERE_SANDBOX` to `.env` (see `.env.example`), then restart the server.
3. PayHere confirms each payment by calling `SITE_URL/api/payhere/notify`. **PayHere cannot reach localhost.** When testing on your own computer, add `PAYHERE_APP_ID` and `PAYHERE_APP_SECRET` (Settings → API Keys) so the site can ask PayHere directly when the member returns.
4. To take payments in EUR, foreign-currency payments must be enabled on your PayHere account.

## Hosting online (free): Vercel + Supabase

The site runs on **Vercel** (hosting) with **Supabase** (PostgreSQL database and file storage). Both have free plans. Vercel's disk is not permanent, so the database and uploaded files live in Supabase.

### 1. Supabase project
1. On https://supabase.com, create a **New project**. Choose the region **South Asia (Mumbai)** and keep the database password somewhere safe.
2. Click **Connect** (ORMs / connection string):
   - the **Transaction pooler** string (port 6543) goes into `DATABASE_URL`;
   - the **Session pooler** string (port 5432) goes into `DIRECT_URL`;
   - replace `[YOUR-PASSWORD]` with your database password.
3. In **Project Settings → API**:
   - the Project URL goes into `SUPABASE_URL`;
   - the `service_role` key goes into `SUPABASE_SERVICE_ROLE_KEY`. Keep this key secret.
   - The storage bucket is created automatically on the first upload.

### 2. Move the existing data from this computer (once)
```powershell
cd $HOME\Downloads\BlueCard
# put DATABASE_URL, DIRECT_URL, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY into .env (see .env.example)
npm install
npm run db:push                 # creates the tables in Supabase
npm run db:migrate-from-sqlite  # copies everything from prisma/dev.db and uploads/ to Supabase
npm run dev                     # check it: http://localhost:3000
```
If you do not need the old data, run `npm run db:seed` instead of `db:migrate-from-sqlite`. It creates only the Admin account and sample content.

### 3. GitHub → Vercel
1. Create a **private** GitHub repository and push the code. `.env`, `dev.db` and `uploads/` are not pushed (see `.gitignore`).
2. On https://vercel.com, choose **Add New → Project** and import that repository. Vercel detects Next.js automatically.
3. Under **Environment Variables**, add everything from `.env`: `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET` (a long random string) and the PayHere values. Set `SITE_URL` to `https://<your-project>.vercel.app`.
4. Click **Deploy**. From then on, every push to GitHub is deployed automatically.
5. In PayHere **Domains & Credentials**, add the `<your-project>.vercel.app` domain and put the Merchant Secret for that domain into `PAYHERE_MERCHANT_SECRET` on Vercel.

### Free plan limits
- **Supabase:** 500 MB database and 1 GB of files. A project that nobody uses for a week is paused; restore it from the dashboard.
- **Vercel Hobby:** for personal, non-commercial use only. Move to the Pro plan when the site goes live as a business and starts taking payments.
- Requests are limited to 4.5 MB, so each file can be at most 4 MB. Photos larger than 1 MB are made smaller in the browser automatically.
