# API Flow

1. `POST /api/complaints` (Citizen)
2. Backend validates input and stores complaint
3. Backend calls AI: `POST /ai/classify` (and related steps)
4. AI returns:
   - category
   - entities
   - priority score/label
   - duplicate candidates (optional)
5. Backend updates complaint record
6. `GET /api/complaints/:id` for tracking

Admin endpoints:
- `GET /api/admin/complaints`
- `PATCH /api/admin/complaints/:id/status`

