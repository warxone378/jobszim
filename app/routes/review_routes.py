from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import review

review_bp = Blueprint('review', __name__, url_prefix='/reviews')

@review_bp.route('/job/<int:job_id>', methods=['GET'])
def get_job_reviews(job_id):
    return jsonify(review.get_reviews_for_job(job_id))

@review_bp.route('/job/<int:job_id>', methods=['POST'])
@login_required
def add_review(job_id):
    data = request.get_json()
    rating = data.get('rating')
    comment = data.get('comment')
    if not rating or not 1 <= rating <= 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400
    new_review = review.add_review(job_id, current_user.id, rating, comment)
    return jsonify(new_review), 201
