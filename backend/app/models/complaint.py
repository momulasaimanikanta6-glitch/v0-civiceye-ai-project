from ..extensions import db


class Complaint(db.Model):
    __tablename__ = 'complaints'

    id = db.Column(db.Integer, primary_key=True)
    citizen_name = db.Column(db.String(120), nullable=True)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80), nullable=True)
    priority = db.Column(db.String(20), nullable=True)
    status = db.Column(db.String(30), nullable=False, default='submitted')

    # optional: store raw voice transcription, etc.
    transcript = db.Column(db.Text, nullable=True)

