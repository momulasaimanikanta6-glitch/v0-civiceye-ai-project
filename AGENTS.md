# AGENTS.md

This Document defines the responsibilities of each team member and AI-assisted development workflow for CivicEye AI India.

---

# Project

CivicEye AI India

AI-Powered Multilingual Civic Grievance Intelligence Platform

---

# Team Structure

## Agent 1 — Product Lead & Project Manager

### Responsibilities

* Problem definition
* Requirement gathering
* Feature prioritization
* Documentation
* Presentation
* Demo preparation

### Deliverables

* README.md
* USER_MANUAL.md
* CONTRIBUTING.md
* Pitch Deck
* Project Reports

---

## Agent 2 — Frontend Developer (Citizen Portal)

### Responsibilities

Build citizen-facing features:

* Authentication UI
* Complaint Submission Form
* Voice Recording Interface
* Image Upload
* Location Capture
* Complaint Tracking

### Technologies

* React
* Vite
* Tailwind CSS

---

## Agent 3 — Frontend Developer (Admin Dashboard)

### Responsibilities

Build administrative tools:

* Dashboard UI
* Analytics
* Complaint Management
* Filters and Search
* Reports

### Technologies

* React
* Tailwind CSS
* Chart.js / Plotly

---

## Agent 4 — Backend Developer

### Responsibilities

Develop:

* REST APIs
* Authentication
* Database Models
* Ticket Management
* File Upload Handling

### Technologies

* Flask or Django REST Framework
* PostgreSQL / MongoDB

---

## Agent 5 — AI/ML Engineer

### Responsibilities

Develop AI services:

* Speech-to-Text
* Language Detection
* Complaint Classification
* Department Routing
* Priority Prediction
* Duplicate Complaint Detection
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
