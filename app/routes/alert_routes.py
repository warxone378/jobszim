from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import alert

alert_bp = Blueprint('alert', __name__, url_prefix='/alerts')

@alert_bp.route('/', methods=['GET'])
@login_required
def get_alerts():
    return jsonify(alert.get_user_alerts(current_user.id))

@alert_bp.route('/', methods=['POST'])
@login_required
def create_alert():
    data = request.get_json()
    keyword = data.get('keyword', '')
    location = data.get('location', '')
    frequency = data.get('frequency', 'daily')
    if not keyword and not location:
        return jsonify({'error': 'At least keyword or location required'}), 400
    new_alert = alert.save_alert(current_user.id, keyword, location, frequency)
    return jsonify(new_alert), 201

@alert_bp.route('/<int:alert_id>', methods=['DELETE'])
@login_required
def delete_alert(alert_id):
    if alert.delete_alert(alert_id, current_user.id):
        return jsonify({'message': 'Alert deleted'})
    return jsonify({'error': 'Not found'}), 404

@alert_bp.route('/<int:alert_id>/toggle', methods=['PUT'])
@login_required
def toggle(alert_id):
    data = request.get_json()
    active = data.get('active', True)
    if alert.toggle_alert(alert_id, current_user.id, active):
        return jsonify({'message': 'Alert updated'})
    return jsonify({'error': 'Not found'}), 404
