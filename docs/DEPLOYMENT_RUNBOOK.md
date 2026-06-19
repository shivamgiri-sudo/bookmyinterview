# Deployment Runbook

## Local production-style run

```bash
cd deploy
cp env.production.example .env
# edit values
cd ..
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up --build
```

## Required before live production
- Replace all demo values.
- Use managed PostgreSQL or hardened self-hosted Postgres.
- Add TLS and reverse proxy.
- Configure SSO provider.
- Configure protected configuration provider: HashiCorp Vault or cloud KMS.
- Enable budget limits before paid providers.
- Run backend tests and UI smoke tests.
- Configure backup and restore.
- Configure logs, alerts, and uptime monitoring.

## Suggested free-first stack
- Frontend: self-host or Vercel free/low tier during MVP.
- Backend: Docker on low-cost VPS.
- DB: Postgres container for dev; managed Postgres for production.
- Vector: pgvector or Qdrant local.
- Object storage: MinIO/local for MVP; S3/GCS after revenue.
- Auth: custom JWT for MVP; Keycloak self-host or Clerk/Auth0 for production.

## Paid providers must be disabled by default
Enable only after Superadmin approval:
- OpenAI/Claude/Gemini
- Apify
- WhatsApp
- Resume parser
- Cloud video/audio storage
- Payment gateway live mode
