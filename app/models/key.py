from app import db
from datetime import datetime
import secrets

class RegistrationKey(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(64), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    used = db.Column(db.Boolean, default=False)
    used_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    expires_at = db.Column(db.DateTime, nullable=True)

    @staticmethod
    def generate_key():
        return secrets.token_urlsafe(32)

    def is_valid(self):
        if self.used:
            return False
        if self.expires_at and self.expires_at < datetime.utcnow():
            return False
        return True