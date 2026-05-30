from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.complaint import Complaint
from ..utils.ai_triage import build_ai_insight, call_ai_service

complaint_bp = Blueprint('complaints', __name__)


def infer_category(description: str) -> str:
    text = description.lower()
    rules = {
        'roads': ['road', 'pothole', 'street', 'traffic', 'signal', 'parking', 'రహదారి', 'రోడ్', 'గుంత', 'ట్రాఫిక్'],
        'sanitation': ['garbage', 'trash', 'waste', 'drain', 'sewage', 'clean', 'చెత్త', 'డ్రైనేజ్', 'మురుగు', 'శుభ్రం'],
        'water': ['water', 'leak', 'pipe', 'tap', 'flood', 'నీరు', 'లీక్', 'పైప్', 'వరద'],
        'electricity': ['light', 'power', 'electric', 'wire', 'streetlight', 'కరెంట్', 'లైట్', 'విద్యుత్', 'వైర్'],
        'public safety': ['crime', 'unsafe', 'accident', 'fire', 'danger', 'ప్రమాదం', 'మంట', 'అసురక్షితం'],
    }
    for category, keywords in rules.items():
        if any(keyword in text for keyword in keywords):
            return category
    return 'general'


def infer_priority(description: str) -> str:
    text = description.lower()
    high_terms = ['urgent', 'immediate', 'danger', 'fire', 'accident', 'injury', 'unsafe', 'flood', 'అత్యవసరం', 'వెంటనే', 'ప్రమాదం', 'మంట', 'గాయం', 'వరద']
    if any(term in text for term in high_terms):
        return 'high'
    if len(description) > 220:
        return 'medium'
    return 'low'


def complaint_payload(complaint: Complaint):
    return {
        'id': complaint.id,
        'citizen_name': complaint.citizen_name,
        'description': complaint.description,
        'category': complaint.category,
        'priority': complaint.priority,
        'status': complaint.status,
        'transcript': complaint.transcript,
        'ai': build_ai_insight(complaint.description, complaint.category, complaint.priority),
    }


@complaint_bp.post('/complaints')
def create_complaint():
    data = request.get_json(silent=True) or {}

    description = (data.get('description') or '').strip()
    if not description:
        return jsonify({'error': 'description is required'}), 400

    ai_data = call_ai_service(description) or {}

    complaint = Complaint(
        citizen_name=(data.get('citizen_name') or '').strip() or None,
        description=description,
        category=data.get('category') or ai_data.get('category') or infer_category(description),
        priority=data.get('priority') or ai_data.get('priority') or infer_priority(description),
        status=data.get('status', 'submitted'),
        transcript=data.get('transcript'),
    )
    db.session.add(complaint)
    db.session.commit()

    payload = complaint_payload(complaint)
    payload['ai'] = build_ai_insight(description, complaint.category, complaint.priority, ai_data)
    return jsonify(payload), 201


@complaint_bp.get('/complaints/<int:complaint_id>')
def get_complaint(complaint_id: int):
    complaint = Complaint.query.get_or_404(complaint_id)

    return jsonify(complaint_payload(complaint))
