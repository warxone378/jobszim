from flask import Blueprint, request, jsonify
from app.models import contact
from flask_login import login_required, current_user

contact_bp = Blueprint('contact', __name__, url_prefix='/contact')

@contact_bp.route('/submit', methods=['POST'])
def submit_contact():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data'}), 400
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    if not name or not email or not message:
        return jsonify({'error': 'All fields required'}), 400
    contact.save_message(name, email, message)
    return jsonify({'message': 'Thank you for contacting us!'}), 201

# Admin only: get all messages
@contact_bp.route('/messages', methods=['GET'])
@login_required
def get_messages():
    if not current_user.is_admin:
        return jsonify({'error': 'Admin only'}), 403
    msgs = contact.get_all_messages()
    return jsonify(msgs)

@contact_bp.route('/messages/<int:msg_id>/read', methods=['PUT'])
@login_required
def mark_read(msg_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Admin only'}), 403
    contact.mark_as_read(msg_id)
    return jsonify({'message': 'Marked as read'})

@contact_bp.route('/messages/<int:msg_id>', methods=['DELETE'])
@login_required
def delete_message(msg_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Admin only'}), 403
    if contact.delete_message(msg_id):
        return jsonify({'message': 'Deleted'})
    return jsonify({'error': 'Message not found'}), 404
