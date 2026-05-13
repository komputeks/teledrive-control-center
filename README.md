# TeleDrive Next Control Center

TeleDrive Next Control Center is a phase 3 Next.js 16 App Router migration of a Telegram-backed object storage control plane inspired by tg-s3, rclone-style web workflows, and MultCloud-like transfer orchestration.

## What is included now

- Next.js 16 App Router structure
- Route handlers under `app/api/next/...`
- Worker-style upload endpoints for:
  - browser multipart uploads
  - URL import jobs
- Telegram upload worker design
- AES-GCM encrypted token-reference handling server-side
- Chunk manifest planning tables
- Telegram message mapping tables
- Signed-link creation and verification endpoints
- Download reconstruction planning endpoint
- Supabase-backed storage metadata
- GitHub Actions CI ready for production workflows

## Core architecture

### App Router frontend
- `app/page.tsx`
- `components-next/workspace-dashboard.tsx`

### Route handlers
- `/api/next/storage/buckets`
- `/api/next/storage/files`
- `/api/next/storage/folders`
- `/api/next/storage/transfers`
- `/api/next/storage/share-links`
- `/api/next/telegram/integrations`
- `/api/next/workers/browser-upload`
- `/api/next/workers/url-import`
- `/api/next/download/[slug]`
- `/api/next/share/verify/[slug]`

### Worker design
Each upload job creates:
1. `storage_files` row
2. `storage_transfers` row
3. `file_chunk_manifest` rows
4. `telegram_message_map` rows

This is the bridge toward a true Telegram-backed object storage engine.

## Remaining implementation steps for full Telegram backend
- Persist encrypted real bot tokens in a secrets vault or dedicated encrypted table
- Upload each chunk to Telegram via Bot API
- Store returned message IDs and file IDs in `telegram_message_map`
- Stream chunk downloads from Telegram and reconstruct binary responses
- Enforce signed link passwords, expirations, and download counters server-side
- Add queue runners / cron / durable background processing

## Environment notes
Required environment variables are expected in deployment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `TELEDRIVE_ENCRYPTION_KEY`

## CI
GitHub Actions should run:
- install
- lint
- typecheck
- build
- secret scanning extensions later

## Deployment
Deploy on Vercel as a Next.js application.
