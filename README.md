# TeleDrive Next Control Center

TeleDrive Next Control Center is a clean Next.js App Router codebase for a Telegram-backed object storage platform inspired by tg-s3, rclone-style browser workflows, and MultCloud-like transfer management.

## Production stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase
- Vercel
- GitHub Actions CI

## Active application structure

### Frontend
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `components-next/*`

### Server utilities
- `lib/supabase-admin.ts`
- `lib/crypto.ts`
- `lib/telegram-worker.ts`

### Route handlers
- `src/app/api/next/storage/buckets`
- `src/app/api/next/storage/files`
- `src/app/api/next/storage/folders`
- `src/app/api/next/storage/transfers`
- `src/app/api/next/storage/share-links`
- `src/app/api/next/telegram/integrations`
- `src/app/api/next/workers/browser-upload`
- `src/app/api/next/workers/url-import`
- `src/app/api/next/download/[slug]`
- `src/app/api/next/share/verify/[slug]`

## Current capabilities

- Bucket and folder management
- Browser upload worker ingestion
- URL import worker ingestion
- Transfer queue metadata and state controls
- Signed-link generation and verification
- Download reconstruction planning endpoint
- Telegram chunk manifest planning
- Telegram message mapping model
- Encrypted token-reference handling design

## Database tables used

- `storage_buckets`
- `storage_files`
- `storage_transfers`
- `storage_folders`
- `share_links`
- `telegram_integrations`
- `file_chunk_manifest`
- `telegram_message_map`

## Next implementation targets

- Upload chunks to Telegram Bot API
- Persist encrypted real bot secrets securely
- Reconstruct and stream downloads from Telegram
- Enforce password-protected signed links and download counters
- Add background queue runners / cron / durable jobs
- Add team workspaces and permissions

## Local development

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

## Deployment

This repository is intended to be connected directly to Vercel as a Next.js project.
