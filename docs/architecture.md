# Architecture

High-level components:
- **Citizen App**: collects complaints (text, optional voice recording, location, images)
- **Admin Dashboard**: review/triage, manage status, export reports
- **Backend API**: authentication, complaint workflow, persistence
- **AI Service**: classify complaints, extract entities, prioritize, detect duplicates

Typical flow:
1. Citizen submits complaint
2. Backend stores complaint draft and uploads media metadata
3. Backend calls AI service to enrich complaint
4. Backend persists enriched data + priority
5. Citizen/agent track status

