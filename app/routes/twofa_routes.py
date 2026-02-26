import pyotp
import qrcode
import io
import base64
from flask import Blueprint, request, jsonify, send_file, session
from flask_login import login_required, current_user
from app import db

twofa_bp = Blueprint('twofa', __name__, url_prefix='/2fa')

@twofa_bp.route('/setup', methods=['GET'])
@login_required
def setup():
    """Generate a new secret and return QR code"""
    if current_user.otp_enabled:
        return jsonify({'error': '2FA already enabled'}), 400

    # Generate a secret if not exists
    if not current_user.otp_secret:
        current_user.otp_secret = pyotp.random_base32()
        db.session.commit()

    # Create provisioning URI for QR code
    totp = pyotp.TOTP(current_user.otp_secret)
    provisioning_uri = totp.provisioning_uri(
        name=current_user.email,
        issuer_name="Jobszim"
    )

    # Generate QR code
    img = qrcode.make(provisioning_uri)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)

    return send_file(buf, mimetype='image/png')

@twofa_bp.route('/verify', methods=['POST'])
@login_required
def verify():
    """Verify the token and enable 2FA"""
    data = request.get_json()
    token = data.get('token')
    if not token:
        return jsonify({'error': 'Token required'}), 400

    if not current_user.otp_secret:
        return jsonify({'error': '2FA not set up'}), 400

    totp = pyotp.TOTP(current_user.otp_secret)
    if totp.verify(token):
        current_user.otp_enabled = True
        db.session.commit()
        return jsonify({'message': '2FA enabled successfully'})
    else:
        return jsonify({'error': 'Invalid token'}), 400

@twofa_bp.route('/disable', methods=['POST'])
@login_required
def disable():
    """Disable 2FA after verifying token"""
    data = request.get_json()
    token = data.get('token')
    if not token:
        return jsonify({'error': 'Token required'}), 400

    if not current_user.otp_enabled:
        return jsonify({'error': '2FA not enabled'}), 400

    totp = pyotp.TOTP(current_user.otp_secret)
    if totp.verify(token):
        current_user.otp_enabled = False
        current_user.otp_secret = None
        db.session.commit()
        return jsonify({'message': '2FA disabled'})
    else:
        return jsonify({'error': 'Invalid token'}), 400

@twofa_bp.route('/status', methods=['GET'])
@login_required
def status():
    """Return whether 2FA is enabled"""
    return jsonify({'enabled': current_user.otp_enabled})
