from flask import Blueprint, request, jsonify, current_app
from flask_login import current_user
from app.models.user import User
from app.models.reset_token import PasswordResetToken
from app import db
from app.utils.email import send_async_email
from threading import Thread

password_bp = Blueprint('password', __name__, url_prefix='/password')

@password_bp.route('/forgot', methods=['POST'])
def forgot():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'If that email exists, a reset link has been sent.'}), 200

    token = PasswordResetToken.generate_token(user.id)
    reset_link = f"http://localhost:3000/reset-password.html?token={token}"

    subject = "Password Reset Request"
    body = f"Hi {user.username},\n\nClick the link to reset your password: {reset_link}\n\nThis link expires in 1 hour."
    Thread(target=send_async_email, args=(current_app._get_current_object(), user.email, subject, body)).start()
    return jsonify({'message': 'Reset link sent if email exists.'}), 200

@password_bp.route('/reset', methods=['POST'])
def reset():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')
    if not token or not new_password:
        return jsonify({'error': 'Token and password required'}), 400
    user_id = PasswordResetToken.verify_token(token)
    if not user_id:
        return jsonify({'error': 'Invalid or expired token'}), 400
    user = User.query.get(user_id)
    user.set_password(new_password)
    # Mark token as used
    pt = PasswordResetToken.query.filter_by(token=token).first()
    pt.used = True
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'}), 200
