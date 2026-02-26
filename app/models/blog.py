import json
import os
from datetime import datetime

BLOG_PATH = os.path.join(os.path.dirname(__file__), '../data/blog.json')

def get_all_posts():
    if not os.path.exists(BLOG_PATH):
        return []
    with open(BLOG_PATH, 'r') as f:
        return json.load(f)

def get_post(post_id):
    posts = get_all_posts()
    return next((p for p in posts if p['id'] == post_id), None)

def create_post(title, content, author_id):
    posts = get_all_posts()
    new_id = max([p['id'] for p in posts], default=0) + 1
    post = {
        'id': new_id,
        'title': title,
        'content': content,
        'author_id': author_id,
        'created': datetime.utcnow().isoformat(),
        'updated': datetime.utcnow().isoformat()
    }
    posts.append(post)
    with open(BLOG_PATH, 'w') as f:
        json.dump(posts, f, indent=2)
    return post

def update_post(post_id, title, content):
    posts = get_all_posts()
    for p in posts:
        if p['id'] == post_id:
            p['title'] = title
            p['content'] = content
            p['updated'] = datetime.utcnow().isoformat()
            break
    with open(BLOG_PATH, 'w') as f:
        json.dump(posts, f, indent=2)
    return True

def delete_post(post_id):
    posts = get_all_posts()
    new_posts = [p for p in posts if p['id'] != post_id]
    with open(BLOG_PATH, 'w') as f:
        json.dump(new_posts, f, indent=2)
    return len(new_posts) < len(posts)
