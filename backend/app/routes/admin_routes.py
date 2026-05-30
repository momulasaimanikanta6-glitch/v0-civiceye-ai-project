from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.complaint import Complaint
from ..utils.ai_triage import build_ai_insight

admin_bp = Blueprint('admin', __name__)


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


@admin_bp.get('/complaints')
def list_complaints():
    status = request.args.get('status')
    category = request.args.get('category')
    priority = request.args.get('priority')

    query = Complaint.query
    if status and status != 'all':
        query = query.filter_by(status=status)
    if category and category != 'all':
        query = query.filter_by(category=category)
    if priority and priority != 'all':
        query = query.filter_by(priority=priority)

    qs = query.order_by(Complaint.id.desc()).limit(100).all()
    return jsonify([complaint_payload(c) for c in qs])


@admin_bp.patch('/complaints/<int:complaint_id>/status')
def update_status(complaint_id: int):
    data = request.get_json(force=True) or {}
    status = data.get('status')
    allowed_statuses = {'submitted', 'in_review', 'assigned', 'resolved', 'rejected'}
    if not status or status not in allowed_statuses:
        return jsonify({'error': 'status is required'}), 400

    complaint = Complaint.query.get_or_404(complaint_id)
    complaint.status = status
    db.session.commit()

    return jsonify({'id': complaint.id, 'status': complaint.status})
