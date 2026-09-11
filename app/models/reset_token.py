import secrets
from datetime import datetime, timedelta
from app import db

class PasswordResetToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(100), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)

    @staticmethod
    def generate_token(user_id):
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        pt = PasswordResetToken(user_id=user_id, token=token, expires_at=expires_at)
        db.session.add(pt)
        db.session.commit()
        return token

    @staticmethod
    def verify_token(token):
        pt = PasswordResetToken.query.filter_by(token=token, used=False).first()
        if pt and pt.expires_at > datetime.utcnow():
            return pt.user_id
        return None
