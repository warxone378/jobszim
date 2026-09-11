from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app import db
from app.models.user import User
from app.models.key import RegistrationKey
from app.models import job_model
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

def admin_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# --- User management ---
@admin_bp.route('/users', methods=['GET'])
@login_required
@admin_required
def get_users():
    users = User.query.all()
    users_list = [{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'is_admin': u.is_admin,
        'is_blocked': u.is_blocked
    } for u in users]
    return jsonify(users_list)

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.is_admin:
        return jsonify({'error': 'Cannot delete another admin'}), 403
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'})

@admin_bp.route('/users/<int:user_id>/block', methods=['PUT'])
@login_required
@admin_required
def block_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.is_admin:
        return jsonify({'error': 'Cannot block another admin'}), 403
    user.is_blocked = True
    db.session.commit()
    return jsonify({'message': 'User blocked successfully'})

@admin_bp.route('/users/<int:user_id>/unblock', methods=['PUT'])
@login_required
@admin_required
def unblock_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.is_blocked = False
    db.session.commit()
    return jsonify({'message': 'User unblocked successfully'})

# --- Key management ---
@admin_bp.route('/keys', methods=['GET'])
@login_required
@admin_required
def get_keys():
    keys = RegistrationKey.query.order_by(RegistrationKey.created_at.desc()).all()
    keys_list = [{
        'id': k.id,
        'key': k.key,
        'created_at': k.created_at.isoformat(),
        'used': k.used,
        'used_by': k.used_by,
        'expires_at': k.expires_at.isoformat() if k.expires_at else None
    } for k in keys]
    return jsonify(keys_list)

@admin_bp.route('/keys', methods=['POST'])
@login_required
@admin_required
def generate_key():
    data = request.get_json() or {}
    expires_in_days = data.get('expires_in_days', 7)
    expires_at = datetime.utcnow() + timedelta(days=expires_in_days)

    new_key = RegistrationKey(
        key=RegistrationKey.generate_key(),
        expires_at=expires_at
    )
    db.session.add(new_key)
    db.session.commit()
    return jsonify({
        'id': new_key.id,
        'key': new_key.key,
        'created_at': new_key.created_at.isoformat(),
        'expires_at': new_key.expires_at.isoformat()
    }), 201

@admin_bp.route('/keys/<int:key_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_key(key_id):
    key = RegistrationKey.query.get(key_id)
    if not key:
        return jsonify({'error': 'Key not found'}), 404
    db.session.delete(key)
    db.session.commit()
    return jsonify({'message': 'Key deleted successfully'})

# --- Job approval (existing) ---
@admin_bp.route('/jobs/pending', methods=['GET'])
@login_required
@admin_required
def get_pending_jobs():
    jobs = job_model.get_all_jobs()
    pending = [j for j in jobs if j.get('status') == 'pending']
    return jsonify(pending)

@admin_bp.route('/jobs/<int:job_id>/approve', methods=['PUT'])
@login_required
@admin_required
def approve_job(job_id):
    job = job_model.get_job_by_id(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    job['status'] = 'approved'
    job_model.update_job(job_id, job)
    return jsonify({'message': 'Job approved'})

@admin_bp.route('/jobs/<int:job_id>/reject', methods=['PUT'])
@login_required
@admin_required
def reject_job(job_id):
    job = job_model.get_job_by_id(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    job['status'] = 'rejected'
    job_model.update_job(job_id, job)
    return jsonify({'message': 'Job rejected'})

# --- NEW: Get all jobs (admin only) ---
@admin_bp.route('/jobs/all', methods=['GET'])
@login_required
@admin_required
def get_all_jobs_admin():
    jobs = job_model.get_all_jobs()
    return jsonify(jobs)

@admin_bp.route('/stats', methods=['GET'])
@login_required
@admin_required
def get_stats():
    # User count
    total_users = User.query.count()

    # Job stats from JSON file (could be heavy – we'll keep as is for now)
    jobs = job_model.get_all_jobs()
    total_jobs = len(jobs)
    approved = sum(1 for j in jobs if j.get('status') == 'approved')
    pending = sum(1 for j in jobs if j.get('status') == 'pending')
    rejected = sum(1 for j in jobs if j.get('status') == 'rejected')

    return jsonify({
        'total_users': total_users,
        'total_jobs': total_jobs,
        'approved': approved,
        'pending': pending,
        'rejected': rejected
    })
