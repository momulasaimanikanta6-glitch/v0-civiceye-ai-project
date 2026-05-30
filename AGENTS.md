# AGENTS.md

This Document defines the responsibilities of each team member and AI-assisted development workflow for CivicEye AI India.

---

# Project

CivicEye AI India

AI-Powered Multilingual Civic Grievance Intelligence Platform

---


### Technologies

* Flask or Django REST Framework
* PostgreSQL / MongoDB

---

* Summarization

### Technologies

* OpenRouter
* Hugging Face
* Bhashini
* Python

---

# Collaboration Workflow

## Git Branch Strategy

```text
main
│
├── frontend-citizen
├── frontend-admin
├── backend-api
├── ai-engine
└── docs
```

---

## Pull Request Rules

Every PR must:

* Pass testing
* Be reviewed by at least one teammate
* Include description of changes
* Resolve merge conflicts

---

# Development Cycle

1. Build Feature
2. Test Feature
3. Open Pull Request
4. Review
5. Merge to Main
6. Deploy

---

# AI Output Standard

All AI outputs should return structured JSON:

```json
{
  "summary": "",
  "category": "",
  "department": "",
  "priority": "",
  "confidence": 0.0
}
```

---

# Definition of Done

A feature is considered complete when:

* Functionality works
* Code is reviewed
* Tests pass
* Documentation updated
* Integrated successfully

---

# Project Goal

Make civic grievance reporting more accessible, multilingual, and intelligent while supporting existing government grievance ecosystems instead of replacing them.
