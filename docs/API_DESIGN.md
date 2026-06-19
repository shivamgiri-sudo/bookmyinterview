# API Design

> RESTful, versioned, resource-oriented API. Base path: `/api/v1`.

## Design Principles

1. **Versioning**: URL path versioning (`/api/v1/...`).
2. **Resource orientation**: Nouns, plural collections (`/jobs`, `/candidates`).
3. **Consistent envelope**:
   ```json
   {
     "data": {},
     "meta": {"page": 1, "page_size": 20, "total": 100},
     "error": null
   }
   ```
4. **Pagination**: Cursor-based for high-cardinality lists, offset-based for admin.
5. **Idempotency**: `Idempotency-Key` header for POST/PUT/PATCH.
6. **Rate limiting**: 429 responses with `Retry-After`.
7. **Content negotiation**: JSON default; `Accept: application/json`.
8. **Error format**: RFC 7807 `application/problem+json`.

## Authentication

- `Authorization: Bearer <access_token>`
- Tenant resolved from JWT claim `tenant_id`.
- Roles: `superadmin`, `tenant_admin`, `hiring_manager`, `evaluator`, `candidate`.

## Endpoints

### Health & Ops

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health + dependency checks (DB, cache) |
| GET | `/ready` | Readiness probe |

### Intake

| Method | Path | Description |
|--------|------|-------------|
| POST | `/intake/analyze` | Analyze job requirements, generate JD, assessment path, trait questions, and **interview slots** |
| GET | `/intake/{job_id}` | Retrieve intake details |
| PATCH | `/intake/{job_id}` | Update job requirements |

### Jobs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/jobs` | List jobs (tenant-scoped) |
| GET | `/jobs/{job_id}` | Get job details |
| PATCH | `/jobs/{job_id}` | Update job status |
| GET | `/jobs/{job_id}/assessment-path` | Get generated assessment path |
| POST | `/jobs/{job_id}/assessment-path` | Regenerate assessment path |
| GET | `/jobs/{job_id}/slots` | List available interview slots |
| POST | `/jobs/{job_id}/slots` | Add interview slots to a job |

### Candidates

| Method | Path | Description |
|--------|------|-------------|
| POST | `/candidates` | Create candidate |
| GET | `/candidates` | List candidates |
| GET | `/candidates/{candidate_id}` | Get candidate profile |
| POST | `/candidates/{candidate_id}/resume` | Upload resume (queues parse task) |

### Assessments

| Method | Path | Description |
|--------|------|-------------|
| POST | `/assessments` | Start assessment |
| GET | `/assessments/{assessment_id}` | Get assessment status |
| POST | `/assessments/{id}/responses/audio` | Submit audio response |
| POST | `/assessments/{id}/responses/video` | Submit video response |
| POST | `/assessments/{id}/score` | Trigger scoring; marks assessment `completed` |
| POST | `/assessments/{id}/shortlist` | Shortlist candidate for final client interview |
| POST | `/assessments/{id}/book-interview` | Book final interview from pre-defined job slots |
| POST | `/assessments/{id}/client-feedback` | Submit client final interview ratings/notes |
| POST | `/assessments/{id}/decision` | Client hire / reject / keep_in_pool decision |

### Admin / Superadmin

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/audit-logs` | Paginated audit logs |
| GET | `/admin/metrics` | Tenant-level metrics |
| GET | `/superadmin/integrations` | Integration vault list |
| POST | `/superadmin/integrations` | Save integration credential |
| POST | `/superadmin/integrations/{key}/test` | Test integration |

## Status Codes

- `200 OK` — success
- `201 Created` — resource created
- `202 Accepted` — async job accepted
- `204 No Content` — deletion success
- `400 Bad Request` — validation error
- `401 Unauthorized` — missing/invalid token
- `403 Forbidden` — insufficient permissions
- `404 Not Found` — resource not found
- `409 Conflict` — business rule conflict (e.g., not shortlisted, slot unavailable)
- `429 Too Many Requests` — rate limit
- `500 Internal Server Error` — server error

## Rate Limits

| Role | Requests/min |
|------|--------------|
| candidate | 30 |
| hiring_manager | 120 |
| tenant_admin | 300 |
| superadmin | 1000 |

## Pagination Example

```http
GET /api/v1/candidates?page=2&page_size=20
```

```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "page_size": 20,
    "total": 157,
    "pages": 8
  }
}
```
