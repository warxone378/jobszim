from flask import jsonify, request
from flask_login import login_required, current_user
from app.models import job_model

def get_all_jobs():
    try:
        jobs = job_model.get_all_jobs()
        # Filter to only approved jobs for public view
        jobs = [j for j in jobs if j.get('status') == 'approved']

        # Enhanced search
        title = request.args.get('title', '').lower()
        location = request.args.get('location', '').lower()

        if title:
            keywords = title.split()
            jobs = [j for j in jobs if all(
                any(keyword in field for field in [j['title'].lower(), j['description'].lower(), j['company'].lower()])
                for keyword in keywords
            )]
        if location:
            jobs = [j for j in jobs if location in j['location'].lower()]

        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_jobs = jobs[start:end]

        return jsonify({
            'jobs': paginated_jobs,
            'total': len(jobs),
            'page': page,
            'per_page': per_page,
            'total_pages': (len(jobs) + per_page - 1) // per_page
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_job(job_id):
    try:
        job = job_model.get_job_by_id(job_id)
        if job:
            # Only show if approved, or if the user owns it, or if admin
            if job.get('status') == 'approved' or (current_user.is_authenticated and (job.get('posted_by') == current_user.id or current_user.is_admin)):
                return jsonify(job)
            else:
                return jsonify({'error': 'Job not available'}), 404
        return jsonify({'error': 'Job not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@login_required
def create_job():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        data['posted_by'] = current_user.id
        new_job = job_model.create_job(data)
        return jsonify({'message': 'Job submitted for approval', 'job': new_job}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@login_required
def update_job(job_id):
    try:
        job = job_model.get_job_by_id(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        if job.get('posted_by') != current_user.id and not current_user.is_admin:
            return jsonify({'error': 'Permission denied'}), 403

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # If user is not admin, they cannot change status
        if not current_user.is_admin:
            data['status'] = job.get('status', 'pending')

        updated = job_model.update_job(job_id, data)
        return jsonify(updated)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@login_required
def delete_job(job_id):
    try:
        job = job_model.get_job_by_id(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        if job.get('posted_by') != current_user.id and not current_user.is_admin:
            return jsonify({'error': 'Permission denied'}), 403

        success = job_model.delete_job(job_id)
        if success:
            return jsonify({'message': 'Job deleted successfully'})
        else:
            return jsonify({'error': 'Job not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
