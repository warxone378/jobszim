from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from app.models import application, job_model
import os
from werkzeug.utils import secure_filename

application_bp = Blueprint('application', __name__, url_prefix='/applications')

# Use /tmp for temporary storage on Vercel (writable)
UPLOAD_FOLDER = '/tmp/uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@application_bp.route('/apply/<int:job_id>', methods=['POST'])
@login_required
def apply(job_id):
    job = job_model.get_job_by_id(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    message = request.form.get('message', '')
    cv_file = request.files.get('cv')

    cv_filename = None
    if cv_file and allowed_file(cv_file.filename):
        # Ensure upload folder exists (create at runtime, not at import)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        filename = secure_filename(f"user_{current_user.id}_{cv_file.filename}")
        cv_file.save(os.path.join(UPLOAD_FOLDER, filename))
        cv_filename = filename

    app = application.save_application(job_id, current_user.id, message, cv_filename)
    return jsonify({'message': 'Application submitted', 'application': app}), 201

@application_bp.route('/job/<int:job_id>', methods=['GET'])
@login_required
def get_applications_for_job(job_id):
    job = job_model.get_job_by_id(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    # Only job owner or admin can view applications
    if job.get('posted_by') != current_user.id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    apps = application.get_applications_for_job(job_id)
    return jsonify(apps)

@application_bp.route('/my', methods=['GET'])
@login_required
def my_applications():
    apps = application.get_applications_by_user(current_user.id)
    return jsonify(apps)

@application_bp.route('/<int:app_id>/status', methods=['PUT'])
@login_required
def update_status(app_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Admin only'}), 403
    data = request.get_json()
    status = data.get('status')
    if status not in ['pending', 'reviewed', 'rejected']:
        return jsonify({'error': 'Invalid status'}), 400
    application.update_application_status(app_id, status)
    return jsonify({'message': 'Status updated'})

@application_bp.route('/admin/all', methods=['GET'])
@login_required
def admin_all():
    if not current_user.is_admin:
        return jsonify({'error': 'Admin only'}), 403
    from app.models import application
    return jsonify(application.get_all_applications())
