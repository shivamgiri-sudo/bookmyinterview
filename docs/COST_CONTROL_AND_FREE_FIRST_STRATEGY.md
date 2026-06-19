# Cost Control and Free-first Strategy

## Important Truth
MCP itself can be open-source and many MCP servers can be self-hosted, but the external services connected through MCP are often not free. BOOK MY INTERVIEW should default to free/self-hosted components first and enable paid providers only after Superadmin approval.

## Free-first Default Stack
- Self-hosted MCP servers
- PostgreSQL
- pgvector
- Qdrant local
- Local/mock LLM provider for development
- Local file storage or MinIO
- SMTP/dev email in non-production
- Manual resume parsing fallback

## Paid or Plan-dependent Providers
- OpenAI / Claude / Gemini APIs
- Apify
- Figma Dev Mode / Figma MCP depending on plan
- WhatsApp Business Platform
- Resume parser vendors
- Cloud object storage
- SendGrid / SES at production scale
- Stripe / Razorpay transaction fees
- ATS/job-board partner APIs

## Product Rule
No paid provider should run by default. Every paid provider must have:
- Superadmin approval
- Monthly budget cap
- Usage dashboard
- Tenant attribution
- Kill switch
- Free or manual fallback
- Audit log

## API Added
- GET `/api/cost/providers`
- POST `/api/cost/providers/evaluate`

## UI Added
- `/cost` Cost Control Center

## Why This Matters
A global AI SaaS can burn money very fast through LLM calls, web scraping, video storage, WhatsApp messages, and resume parsing. Cost control is a product feature, not only a finance concern.
