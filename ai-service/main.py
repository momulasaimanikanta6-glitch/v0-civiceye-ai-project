from collections import Counter
import re

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title='civiceye-ai-service')


class ComplaintIn(BaseModel):
    text: str = Field(..., min_length=1)
    language: str = 'auto'


CATEGORY_RULES = {
    'roads': {
        'department': 'Roads and Transport Department',
        'keywords': ['road', 'pothole', 'street', 'traffic', 'signal', 'parking', 'రహదారి', 'రోడ్', 'గుంత', 'ట్రాఫిక్'],
    },
    'sanitation': {
        'department': 'Sanitation and Waste Management',
        'keywords': ['garbage', 'trash', 'waste', 'drain', 'sewage', 'clean', 'smell', 'చెత్త', 'డ్రైనేజ్', 'మురుగు', 'శుభ్రం', 'దుర్వాసన'],
    },
    'water': {
        'department': 'Water Supply Board',
        'keywords': ['water', 'leak', 'pipe', 'tap', 'flood', 'నీరు', 'లీక్', 'పైప్', 'వరద'],
    },
    'electricity': {
        'department': 'Electricity and Street Lighting',
        'keywords': ['light', 'power', 'electric', 'wire', 'streetlight', 'కరెంట్', 'లైట్', 'విద్యుత్', 'వైర్'],
    },
    'public safety': {
        'department': 'Public Safety Cell',
        'keywords': ['crime', 'unsafe', 'accident', 'fire', 'danger', 'injury', 'ప్రమాదం', 'మంట', 'అసురక్షితం', 'గాయం'],
    },
}

HIGH_PRIORITY_TERMS = ['urgent', 'immediate', 'danger', 'fire', 'accident', 'injury', 'unsafe', 'flood', 'అత్యవసరం', 'ప్రమాదం', 'మంట', 'గాయం', 'వరద', 'వెంటనే']
MEDIUM_PRIORITY_TERMS = ['blocked', 'leak', 'overflow', 'broken', 'delay', 'దుర్వాసన', 'లీక్', 'బ్లాక్']


def detect_language(text: str) -> str:
    if re.search(r'[\u0C00-\u0C7F]', text):
        return 'te'
    return 'en'


def classify_category(text: str) -> tuple[str, list[str]]:
    lowered = text.lower()
    scores = {}
    matched = []
    for category, rule in CATEGORY_RULES.items():
        hits = [keyword for keyword in rule['keywords'] if keyword in lowered]
        scores[category] = len(hits)
        matched.extend(hits)

    best_category, best_score = Counter(scores).most_common(1)[0]
    return (best_category if best_score else 'general', matched[:8])


def classify_priority(text: str) -> str:
    lowered = text.lower()
    if any(term in lowered for term in HIGH_PRIORITY_TERMS):
        return 'high'
    if any(term in lowered for term in MEDIUM_PRIORITY_TERMS) or len(text) > 220:
        return 'medium'
    return 'low'


def summarize(text: str) -> str:
    compact = re.sub(r'\s+', ' ', text).strip()
    if len(compact) <= 130:
        return compact
    return f'{compact[:127].rstrip()}...'


def confidence(category: str, matched_keywords: list[str]) -> float:
    if category == 'general':
        return 0.52
    return min(0.96, 0.68 + (len(matched_keywords) * 0.07))


@app.get('/health')
def health():
    return {'ok': True, 'status': 'up'}


@app.post('/ai/classify')
def classify(payload: ComplaintIn):
    text = payload.text.strip()
    detected_language = payload.language if payload.language != 'auto' else detect_language(text)
    category, matched_keywords = classify_category(text)
    priority = classify_priority(text)
    department = CATEGORY_RULES.get(category, {}).get('department', 'Municipal Grievance Desk')

    return {
        'ok': True,
        'data': {
            'category': category,
            'priority': priority,
            'department': department,
            'summary': summarize(text),
            'language': detected_language,
            'confidence': confidence(category, matched_keywords),
            'entities': [{'type': 'keyword', 'value': keyword} for keyword in matched_keywords],
            'duplicate_candidates': [],
        },
    }
