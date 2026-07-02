# Vartika Cleaning Solutions

A cleaning service booking platform built with Next.js 15, Supabase, and Nodemailer.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3.4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password for admin)
- **Email**: Nodemailer via Brevo SMTP
- **Media**: Cloudinary (image upload & storage)
- **Monorepo**: Turborepo + npm workspaces
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm 10+
- A Supabase project
- A Brevo account (or any SMTP provider)
- A Cloudinary account

### Setup

```bash
# 1. Navigate to the app
cd vartika

# 2. Install dependencies
npm install

# 3. Copy env template and fill in your credentials
cp apps/web/.env.example apps/web/.env.local
```

### Environment Variables

Edit `apps/web/.env.local` with your credentials:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `SMTP_HOST` | SMTP server (e.g. `smtp-relay.brevo.com`) |
| `SMTP_PORT` | SMTP port (e.g. `587`) |
| `SMTP_USER` | SMTP login (your Brevo account email) |
| `SMTP_PASS` | SMTP key from Brevo |
| `FROM_EMAIL` | Verified sender email in Brevo |
| `ADMIN_EMAIL` | Where admin booking notifications are sent |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_SITE_URL` | Site URL (`http://localhost:3000` for dev) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Company WhatsApp number |

### Database

Run the migrations in Supabase SQL Editor (in order):

1. `supabase/migrations/001_bookings.sql`
2. `supabase/migrations/002_services.sql`
3. `supabase/migrations/003_gallery.sql`
4. `supabase/migrations/004_testimonials.sql`
5. `supabase/migrations/005_seo_settings.sql`
6. `supabase/seed.sql`

Then add RLS policies for anonymous SELECT on `services`, `gallery`, `testimonials`, and `seo_settings`:

```sql
CREATE POLICY "anon_select_services" ON services FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_gallery" ON gallery FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_testimonials" ON testimonials FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_seo" ON seo_settings FOR SELECT TO anon USING (true);
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin Login

Navigate to `/admin/login` and sign in with a Supabase Auth user.

## Project Structure

```
vartika/
├── apps/web/           # Next.js application
│   ├── app/            # App Router pages
│   │   ├── (public)/   # Public-facing pages
│   │   ├── admin/      # Admin dashboard pages
│   │   └── api/        # API routes
│   ├── components/     # React components
│   │   ├── admin/      # Admin components
│   │   ├── public/     # Public components
│   │   └── ui/         # Shared UI primitives
│   ├── lib/            # Utilities & helpers
│   │   ├── supabase/   # Supabase clients & queries
│   │   ├── cloudinary/ # Cloudinary integration
│   │   ├── constants/  # App constants
│   │   └── seo/        # SEO helpers
│   └── styles/         # Global styles
├── packages/
│   ├── constants/      # Shared constants
│   ├── types/          # TypeScript types
│   └── validators/     # Zod schemas
└── supabase/
    ├── migrations/     # SQL migrations
    └── functions/      # Edge Functions
```
