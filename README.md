# TeleDrive Control Center

TeleDrive Control Center is a modern Vercel-friendly control plane for a Telegram-backed object storage platform inspired by tg-s3, rclone-style workflows, and MultCloud-like transfer management.

## Current scope

This repository currently delivers:
- Bucket and namespace management
- Tracked file inventory
- URL-based upload queue
- Transfer activity dashboard
- Vercel serverless API routes backed by Supabase
- Responsive React + TypeScript + Tailwind UI

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- Vercel serverless functions
- Supabase database

## API routes

- `GET/POST/PUT/DELETE /api/storage-buckets`
- `GET/POST/PUT/DELETE /api/storage-files`
- `GET/POST/PUT/DELETE /api/storage-transfers`

## Suggested next steps

To turn this into a true Telegram-backed storage product, add:
- Telegram bot ingestion workers
- Chunk splitting and reassembly
- Background jobs and retries
- Signed download/share links
- Auth and multi-user workspaces
- Search, filters, bulk actions, and scheduler support
- S3-compatible gateway endpoints

## Local development

```bash
npm install
npm run build
npm run dev
```

## Deployment

Designed to deploy cleanly on Vercel.
