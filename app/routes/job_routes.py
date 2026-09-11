from flask_login import login_required, current_user
from flask import Blueprint
from app.controllers import job_controller

job_bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')

job_bp.route('/', methods=['GET'])(job_controller.get_all_jobs)
job_bp.route('/<int:job_id>', methods=['GET'])(job_controller.get_job)
job_bp.route('/', methods=['POST'])(job_controller.create_job)
from flask import Blueprint
from app.controllers import job_controller

job_bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')

job_bp.route('/', methods=['GET'])(job_controller.get_all_jobs)
job_bp.route('/<int:job_id>', methods=['GET'])(job_controller.get_job)
job_bp.route('/', methods=['POST'])(job_controller.create_job)
job_bp.route('/<int:job_id>', methods=['PUT'])(job_controller.update_job)
job_bp.route('/<int:job_id>', methods=['DELETE'])(job_controller.delete_job)
@job_bp.route('/my', methods=['GET'])
@login_required
def get_my_jobs():
    jobs = job_model.get_all_jobs()
    my_jobs = [j for j in jobs if j.get('posted_by') == current_user.id]
    return jsonify(my_jobs)

@job_bp.route('/recommendations', methods=['GET'])
@login_required
def recommendations():
    jobs = job_model.get_all_jobs()
    # Get user's saved and applied jobs
    saved_ids = saved_job.get_user_saved_jobs(current_user.id)
    from app.models import application
    apps = application.get_applications_by_user(current_user.id)
    applied_ids = [a['job_id'] for a in apps]

    interested_ids = set(saved_ids + applied_ids)
    if not interested_ids:
        return jsonify([])

    # Get keywords from interested jobs
    interested_jobs = [j for j in jobs if j['id'] in interested_ids]
    keywords = []
    for j in interested_jobs:
        keywords.extend(j['title'].lower().split())
        keywords.extend(j['description'].lower().split())
    keywords = set(keywords)

    # Score other jobs
    scored = []
    for j in jobs:
        if j['id'] in interested_ids or j.get('status') != 'approved':
            continue
        text = (j['title'] + ' ' + j['description']).lower()
        score = sum(k in text for k in keywords)
        if score > 0:
            scored.append((score, j))
    scored.sort(reverse=True)
    return jsonify([j for score, j in scored[:10]])
