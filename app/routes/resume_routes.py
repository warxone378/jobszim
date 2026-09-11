from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import resume

resume_bp = Blueprint('resume', __name__, url_prefix='/resume')

@resume_bp.route('/', methods=['GET'])
@login_required
def get_resume():
    r = resume.get_user_resume(current_user.id)
    if r:
        return jsonify(r)
    return jsonify({'error': 'No resume found'}), 404

@resume_bp.route('/', methods=['POST', 'PUT'])
@login_required
def save_resume():
    data = request.get_json()
    r = resume.save_resume(current_user.id, data)
    return jsonify(r)
