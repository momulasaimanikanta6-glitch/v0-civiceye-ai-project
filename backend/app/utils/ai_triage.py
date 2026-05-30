import json
from urllib.error import URLError
from urllib.request import Request, urlopen

from flask import current_app


CATEGORY_META = {
    'roads': {'department': 'Roads and Transport Department', 'sla': '48 hours'},
    'sanitation': {'department': 'Sanitation and Waste Management', 'sla': '24 hours'},
    'water': {'department': 'Water Supply Board', 'sla': '24 hours'},
    'electricity': {'department': 'Electricity and Street Lighting', 'sla': '12 hours'},
    'public safety': {'department': 'Public Safety Cell', 'sla': '4 hours'},
    'general': {'department': 'Municipal Grievance Desk', 'sla': '72 hours'},
}


def summarize(text: str) -> str:
    compact = ' '.join((text or '').split())
    if len(compact) <= 130:
        return compact
    return f'{compact[:127].rstrip()}...'


def fallback_insight(description: str, category: str | None, priority: str | None):
    category_key = category or 'general'
    meta = CATEGORY_META.get(category_key, CATEGORY_META['general'])
    return {
        'summary': summarize(description),
        'department': meta['department'],
        'sla': meta['sla'],
        'confidence': 0.62 if category_key != 'general' else 0.52,
        'language': 'te' if any('\u0C00' <= char <= '\u0C7F' for char in description or '') else 'en',
        'source': 'local rules',
    }


def call_ai_service(description: str):
    service_url = current_app.config.get('AI_SERVICE_URL', 'http://localhost:8000').rstrip('/')
    payload = json.dumps({'text': description, 'language': 'auto'}).encode('utf-8')
    request = Request(
        f'{service_url}/ai/classify',
        data=payload,
        headers={'Content-Type': 'application/json'},
        method='POST',
    )

    try:
        with urlopen(request, timeout=1.2) as response:
            body = json.loads(response.read().decode('utf-8'))
    except (OSError, URLError, TimeoutError, json.JSONDecodeError):
        return None

    if not body.get('ok'):
        return None
    return body.get('data') or None


def build_ai_insight(description: str, category: str | None, priority: str | None, ai_data=None):
    if not ai_data:
        return fallback_insight(description, category, priority)

    category_key = ai_data.get('category') or category or 'general'
    meta = CATEGORY_META.get(category_key, CATEGORY_META['general'])
    return {
        'summary': ai_data.get('summary') or summarize(description),
        'department': ai_data.get('department') or meta['department'],
        'sla': meta['sla'],
        'confidence': ai_data.get('confidence', 0.68),
        'language': ai_data.get('language', 'auto'),
        'source': 'AI service',
    }
