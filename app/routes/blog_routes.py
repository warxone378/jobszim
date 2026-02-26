from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import blog

blog_bp = Blueprint('blog', __name__, url_prefix='/blog')

@blog_bp.route('/posts', methods=['GET'])
def get_posts():
    return jsonify(blog.get_all_posts())

@blog_bp.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = blog.get_post(post_id)
    if post:
        return jsonify(post)
    return jsonify({'error': 'Not found'}), 404

@blog_bp.route('/posts', methods=['POST'])
@login_required
def create_post():
    if not current_user.is_admin:
        return jsonify({'error': 'Admin only'}), 403
    data = request.get_json()
    post = blog.create_post(data['title'], data['content'], current_user.id)
    return jsonify(post), 201

@blog_bp.route('/posts/<int:post_id>', methods=['PUT'])
@login_required
def update_post(post_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Admin only'}), 403
    data = request.get_json()
    blog.update_post(post_id, data['title'], data['content'])
    return jsonify({'message': 'Updated'})

@blog_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@login_required
def delete_post(post_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Admin only'}), 403
    blog.delete_post(post_id)
    return jsonify({'message': 'Deleted'})
