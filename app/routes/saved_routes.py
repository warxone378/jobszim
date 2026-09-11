from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import saved_job, job_model

saved_bp = Blueprint('saved', __name__, url_prefix='/saved')

@saved_bp.route('/', methods=['GET'])
@login_required
def get_saved():
    job_ids = saved_job.get_user_saved_jobs(current_user.id)
    all_jobs = job_model.get_all_jobs()
    saved_jobs = [j for j in all_jobs if j['id'] in job_ids]
    return jsonify(saved_jobs)

@saved_bp.route('/<int:job_id>', methods=['POST'])
@login_required
def save(job_id):
    if saved_job.save_job(current_user.id, job_id):
        return jsonify({'message': 'Job saved'})
    return jsonify({'error': 'Already saved'}), 400

@saved_bp.route('/<int:job_id>', methods=['DELETE'])
@login_required
def unsave(job_id):
    if saved_job.unsave_job(current_user.id, job_id):
        return jsonify({'message': 'Job removed'})
    return jsonify({'error': 'Not found'}), 404
