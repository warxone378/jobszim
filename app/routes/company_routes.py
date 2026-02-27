from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from app.models.user import User
from app.models import job_model
from app import db
import os
from werkzeug.utils import secure_filename
import cloudinary
import cloudinary.uploader

company_bp = Blueprint('company', __name__, url_prefix='/company')

# Use /tmp for temporary storage on Vercel (writable)
UPLOAD_FOLDER = '/tmp/logos'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@company_bp.route('/<int:user_id>', methods=['GET'])
def get_company_profile(user_id):
    user = User.query.get_or_404(user_id)
    jobs = job_model.get_all_jobs()
    user_jobs = [j for j in jobs if j.get('posted_by') == user_id and j.get('status') == 'approved']
    return jsonify({
        'id': user.id,
        'company_name': user.company_name or user.username,
        'company_logo': user.company_logo,
        'company_description': user.company_description,
        'website': user.website,
        'jobs': user_jobs
    })

@company_bp.route('/me', methods=['GET', 'PUT'])
@login_required
def edit_company_profile():
    if request.method == 'GET':
        return jsonify({
            'company_name': current_user.company_name,
            'company_description': current_user.company_description,
            'website': current_user.website,
            'company_logo': current_user.company_logo
        })
    # PUT: update profile
    data = request.form
    current_user.company_name = data.get('company_name', current_user.company_name)
    current_user.company_description = data.get('company_description', current_user.company_description)
    current_user.website = data.get('website', current_user.website)

    # Handle logo upload
    if 'logo' in request.files:
        file = request.files['logo']
        if file and allowed_file(file.filename):
            # Ensure upload folder exists (create at runtime, not at import)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            filename = secure_filename(f"user_{current_user.id}_{file.filename}")
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            # Optionally upload to Cloudinary for permanent storage
            # result = cloudinary.uploader.upload(file)
            # current_user.company_logo = result['secure_url']
            current_user.company_logo = filename  # temporary, just for demo

    db.session.commit()
    return jsonify({'message': 'Company profile updated'})

@company_bp.route('/<int:user_id>/follow-status', methods=['GET'])
@login_required
def follow_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    following = current_user.is_following(user)
    return jsonify({'following': following})

@company_bp.route('/<int:user_id>/follow', methods=['POST'])
@login_required
def follow(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user == current_user:
        return jsonify({'error': 'Cannot follow yourself'}), 400
    if current_user.is_following(user):
        return jsonify({'error': 'Already following'}), 400
    current_user.follow(user)
    db.session.commit()
    return jsonify({'message': 'Now following'})

@company_bp.route('/<int:user_id>/follow', methods=['DELETE'])
@login_required
def unfollow(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if not current_user.is_following(user):
        return jsonify({'error': 'Not following'}), 400
    current_user.unfollow(user)
    db.session.commit()
    return jsonify({'message': 'Unfollowed'})

@company_bp.route('/analytics/<int:job_id>', methods=['GET'])
@login_required
def job_analytics(job_id):
    job = job_model.get_job_by_id(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    if job['posted_by'] != current_user.id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    from app.models.job_view import JobView
    views = JobView.query.filter_by(job_id=job_id).all()
    total_views = len(views)
    unique_views = len(set(v.user_id for v in views if v.user_id))
    return jsonify({
        'total_views': total_views,
        'unique_views': unique_views,
        'views_by_date': [{'date': v.timestamp.date().isoformat()} for v in views]
    })
