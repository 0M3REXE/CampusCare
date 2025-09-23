# CampusCare – API Design Specifications

All APIs are versioned under `/api/v1`. Auth via JWT from Supabase Auth. Private chat mode requires `X-Privacy-Mode: private` header.
Streaming uses SSE or WS via Supabase Realtime depending on endpoint.

## Conventions
- JSON responses with `data`, `error`, `meta` envelopes.
- Idempotency-Key for POST creating resources.
- Rate limits: 60 rpm per user for standard, lower for heavy endpoints.
- Webhooks: signed with HMAC-SHA256, header `X-CC-Signature`.

## Auth
- Supabase session JWT in `Authorization: Bearer <token>`.
- Roles: student, counselor, admin, institution_admin.

## Chat
- POST /chat/sessions -> create session
- GET /chat/sessions/{id}
- SSE /chat/stream?sessionId=... (messages and events)
- POST /chat/sessions/{id}/message { content, modality: text|voice, language?, privacyMode? }
- POST /chat/sessions/{id}/end

Events (WS):
- message.created, llm.token, risk.score, escalation.suggested, typing.start/stop, error

## Voice
- Default: Browser Web Speech API (no server endpoint required). Optional Vapi integration:
	- POST /voice/webhook (Vapi -> CampusCare) signed webhook: call events/transcriptions
	- GET /voice/token -> ephemeral token for clients

## Peer Matching
- POST /profiles -> upsert profile { interests[], bio, mood, preferences }
- POST /match/compute -> returns topK matches {topK, constraints}
- POST /match/accept { matchId }
- WS /presence (Supabase Realtime) -> user online status, invitations

## Media Hub
- GET /content?tag=&lang=&limit=
- POST /content/ingest/youtube { channelIds[] }
- GET /content/recommendations?userId=
- GET /content/{id}/subtitles

## Risk Detection
- POST /risk/score { text, language? } -> { score, labels } (Gemini-backed)
- Webhook: POST /risk/alert (internal Edge Function) -> create alert and optionally propose booking

## Scheduling
- GET /scheduling/availability?counselorId=&from=&to=
- POST /scheduling/book { counselorId, slotId }
- Webhook: POST /scheduling/callback (Calendar provider)

## Analytics
- GET /analytics/overview?institutionId=&from=&to=
- GET /analytics/metrics?metric=stress_index|engagement ...
- GET /analytics/trends?dimension=cohort|language

## Errors
- 400 validation_error { fieldErrors }
- 401 unauthorized
- 403 forbidden
- 404 not_found
- 409 conflict
- 429 rate_limited
- 500 internal_error

## Webhooks
- Supabase Edge Functions: /webhooks/edge/* (scoped keys) to trigger alerts, exports, escalations.

## Idempotency & Retries
- Use `Idempotency-Key` header; server stores digests for 24h in Postgres `idempotency_keys` (unique constraint) to avoid external cache cost.

## Example: POST /chat/sessions/{id}/message
Request
{
	"content": "I feel overwhelmed about exams",
	"modality": "text",
	"language": "en",
	"privacyMode": "private"
}
Response
{
	"data": {
		"messageId": "msg_123",
		"risk": { "score": 0.72, "labels": ["anxiety"] }
	}
}
