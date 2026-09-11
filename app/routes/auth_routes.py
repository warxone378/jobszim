from flask import Blueprint, request, jsonify, session
from flask_login import login_user, logout_user, login_required, current_user
from app.models.user import User
from app.models.key import RegistrationKey
from app import db
import secrets

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

def generate_referral_code():
    return secrets.token_urlsafe(8)[:8]

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required = ['username', 'email', 'password', 'key']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    # Validate registration key
    key_entry = RegistrationKey.query.filter_by(key=data['key']).first()
    if not key_entry or not key_entry.is_valid():
        return jsonify({'error': 'Invalid or expired registration key'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400

    # Check for referral code
    referral_code = request.args.get('ref')
    referred_by = None
    if referral_code:
        referrer = User.query.filter_by(referral_code=referral_code).first()
        if referrer:
            referred_by = referrer.id
            referrer.referral_count += 1
            db.session.add(referrer)

    user = User(
        username=data['username'],
        email=data['email'],
        referral_code=generate_referral_code(),
        referred_by=referred_by
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.flush()

    key_entry.used = True
    key_entry.used_by = user.id
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    if user.is_blocked:
        return jsonify({'error': 'Your account has been blocked. Contact admin.'}), 403

    # If 2FA is enabled, store user ID in session and ask for token
    if user.otp_enabled:
        session['2fa_user_id'] = user.id
        return jsonify({'2fa_required': True, 'message': '2FA token required'}), 200

    # Otherwise, log in directly
    login_user(user)
    return jsonify({'message': 'Logged in successfully', 'user': user.username}), 200

@auth_bp.route('/verify-2fa', methods=['POST'])
def verify_2fa():
    """Verify 2FA token after initial login"""
    data = request.get_json()
    token = data.get('token')
    if not token:
        return jsonify({'error': 'Token required'}), 400

    user_id = session.get('2fa_user_id')
    if not user_id:
        return jsonify({'error': 'No pending 2FA login'}), 400

    user = User.query.get(user_id)
    if not user or not user.otp_enabled:
        return jsonify({'error': 'Invalid state'}), 400

    import pyotp
    totp = pyotp.TOTP(user.otp_secret)
    if totp.verify(token):
        login_user(user)
        session.pop('2fa_user_id', None)
        return jsonify({'message': 'Logged in successfully', 'user': user.username}), 200
    else:
        return jsonify({'error': 'Invalid token'}), 400

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@auth_bp.route('/status', methods=['GET'])
def status():
    if current_user.is_authenticated:
        return jsonify({
            'logged_in': True,
            'user': current_user.username,
            'user_id': current_user.id,
            'is_admin': current_user.is_admin
        })
    return jsonify({'logged_in': False})
