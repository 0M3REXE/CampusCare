# CampusCare – Security, Privacy, and Compliance

## Principles
- Data minimization by default. Private chat mode stores minimal metadata.
- Defense-in-depth: AuthZ, RLS, encryption, secrets hygiene, least privilege.
- Transparency and consent: explain what is stored and why; granular opt-outs.

## Authentication & Authorization
- Supabase Auth with JWT; optional SSO (SAML/OIDC) per institution.
- Roles: student, counselor, admin, institution_admin.
- Postgres RLS: tenant isolation and per-user row ownership. Use views for admin analytics.

## Encryption
- TLS 1.2+ everywhere. At-rest: AES-256 (Supabase PG), Supabase Storage SSE.
- Secrets in Vercel env vars / Supabase secrets; rotate quarterly.

## Privacy Controls
- Private mode: do not persist message content, only risk scores and session metadata (for safety). Offer per-session wipe.
- Redaction: runtime PII scrubbing in logs and prompts. Hash email/phone in analytics. Store minimal identifiers for scheduling.
- Consent & Notices: GDPR-compliant consent banners; explicit consent for voice.

## Data Retention & Deletion
- Configurable per institution. Defaults: chat messages 90d (7d private), risk assessments 180d, analytics aggregates 2y.
- Right-to-erasure workflow via n8n job; cascades through storage and 3rd parties.

## Vendor & Compliance
- FERPA-aligned data handling; GDPR processor commitments.
- Free tiers typically do not include BAAs; do not store PHI. For HIPAA, migrate to BAA-capable vendors (e.g., GCP/AWS + Gemini Enterprise with BAA) before onboarding PHI.
- DPA and SCCs with EU schools when moving beyond prototypes; pin data residency in EU Supabase project if needed.

## Threat Modeling & Hardening
- STRIDE review each quarter. CSP and strict headers. WAF (CloudFront/AWS WAF). Rate limiting and bot protection on auth and chat.
- SSH disabled; use SSM Session Manager. IAM least privilege with access boundaries.

## Incident Response
- Detect via alerts (Grafana). P1 on data breach or safety escalation failure. 24h initial notification to institutions as per contracts.
- Runbooks for risk alert failures, LLM abuse, voice webhook outages.

## Auditing & Logging
- Structured logs (Vercel/Supabase). Keep 30-90d. Redact PII by default. Separate admin access logs. Prefer event-level metrics over raw content.
