from ..extensions import db


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(80), nullable=False)
    actor = db.Column(db.String(80), nullable=True)
    metadata = db.Column(db.Text, nullable=True)

